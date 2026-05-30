import asyncio
import json
import threading
import logging
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from backend.asr.router import ASRRouter
from backend.audio.capture import AudioCapture
from backend.medical.processor import generate_soap_note, generate_summary

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("mediscribe")

# --- Session state ---
_session: dict = {
    "running": False,
    "transcript_chunks": [],
    "soap_note": None,
    "language": "unknown",
}
_capture: AudioCapture | None = None
_router: ASRRouter | None = None
_ws_clients: list[WebSocket] = []

# Thread-safe queue: audio worker posts messages here, async broadcaster reads them
_msg_queue: asyncio.Queue | None = None
_event_loop: asyncio.AbstractEventLoop | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _msg_queue, _event_loop
    _event_loop = asyncio.get_running_loop()
    _msg_queue = asyncio.Queue()

    # Background task that drains the queue and fans out to all WS clients
    broadcaster_task = asyncio.create_task(_broadcaster())

    # Pre-load Whisper so the first session starts instantly
    from backend.asr import english_asr
    english_asr.get_model()

    yield

    broadcaster_task.cancel()


async def _broadcaster():
    """Async task: reads from _msg_queue and sends to all connected WS clients."""
    while True:
        try:
            message = await _msg_queue.get()
            payload = json.dumps(message)
            dead = []
            for ws in list(_ws_clients):
                try:
                    await ws.send_text(payload)
                except Exception as e:
                    log.warning(f"WS send failed: {e}")
                    dead.append(ws)
            for ws in dead:
                if ws in _ws_clients:
                    _ws_clients.remove(ws)
            _msg_queue.task_done()
        except asyncio.CancelledError:
            break
        except Exception as e:
            log.error(f"Broadcaster error: {e}")


def _enqueue(message: dict):
    """Thread-safe: schedule put_nowait on the event loop from a worker thread."""
    if _msg_queue is not None and _event_loop is not None:
        _event_loop.call_soon_threadsafe(_msg_queue.put_nowait, message)


app = FastAPI(title="MediScribe AI", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Audio worker (background thread) ---

def _audio_worker(lang_mode: str = "auto"):
    global _capture, _router, _session

    log.info(f"Audio worker started. lang_mode={lang_mode} WS clients: {len(_ws_clients)}")

    _capture = AudioCapture()
    _router = ASRRouter(lang_mode=lang_mode)
    _router.reset(lang_mode=lang_mode)

    try:
        _capture.start()
    except Exception as e:
        log.error(f"Microphone error: {e}")
        _enqueue({"type": "error", "message": f"Microphone error: {e}"})
        _session["running"] = False
        return

    while _session["running"]:
        chunk = _capture.get_chunk(timeout=1.0)
        if chunk is None:
            continue

        try:
            result = _router.process_chunk(chunk)
        except Exception as e:
            log.error(f"ASR error: {e}")
            if _router.should_broadcast_error():
                _enqueue({"type": "error", "message": f"ASR error: {e}"})
            continue

        text = result["text"].strip()
        log.info(f"Transcript chunk: '{text[:60]}' | lang={result['language']} | ws_clients={len(_ws_clients)}")

        if text:
            entry = {"text": text, "language": result["language"]}
            _session["transcript_chunks"].append(entry)
            _session["language"] = _router.language_label
            _enqueue({
                "type": "transcript",
                "text": text,
                "original_text": result.get("original_text", text),
                "language": _router.language_label,
                "is_twi": result["is_twi"],
            })

    _capture.stop()
    log.info("Audio worker stopped.")


# --- REST endpoints ---

class StartSessionRequest(BaseModel):
    lang_mode: Literal["en", "tw", "auto"] = "auto"


@app.post("/session/start")
async def start_session(body: StartSessionRequest = StartSessionRequest()):
    global _session
    if _session["running"]:
        return {"status": "already_running"}

    _session = {
        "running": True,
        "transcript_chunks": [],
        "soap_note": None,
        "language": "unknown",
        "lang_mode": body.lang_mode,
    }

    thread = threading.Thread(target=_audio_worker, args=(body.lang_mode,), daemon=True)
    thread.start()
    return {"status": "started", "lang_mode": body.lang_mode}


@app.post("/session/stop")
async def stop_session():
    global _session
    _session["running"] = False
    await asyncio.sleep(1.5)
    return {"status": "stopped", "chunks": len(_session["transcript_chunks"])}


@app.get("/session/transcript")
async def get_transcript():
    full_text = " ".join(c["text"] for c in _session["transcript_chunks"])
    return {
        "transcript": full_text,
        "chunks": _session["transcript_chunks"],
        "language": _session["language"],
    }


@app.post("/session/generate-note")
async def generate_note():
    full_text = " ".join(c["text"] for c in _session["transcript_chunks"])
    note = generate_soap_note(full_text)
    summary = generate_summary(full_text)
    _session["soap_note"] = note
    result = {"note": note, "summary": summary}
    if _msg_queue:
        await _msg_queue.put({"type": "note_ready", **result})
    return result


@app.get("/session/note")
async def get_note():
    return {"note": _session.get("soap_note")}


@app.get("/health")
async def health():
    return {"status": "ok", "session_active": _session["running"]}


@app.get("/debug")
async def debug():
    return {
        "ws_clients": len(_ws_clients),
        "session_running": _session["running"],
        "chunks": len(_session["transcript_chunks"]),
        "queue_size": _msg_queue.qsize() if _msg_queue else -1,
        "loop_running": _msg_queue._loop.is_running() if _msg_queue else False,
    }


# --- WebSocket endpoint ---

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    _ws_clients.append(ws)
    log.info(f"WS connected. Total clients: {len(_ws_clients)}")
    try:
        while True:
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        if ws in _ws_clients:
            _ws_clients.remove(ws)
        log.info(f"WS disconnected. Remaining clients: {len(_ws_clients)}")
