import sounddevice as sd
import numpy as np
import queue
import threading
import io
from pydub import AudioSegment
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from backend.config import SAMPLE_RATE, CHUNK_DURATION_SECONDS


class AudioCapture:
    """Captures microphone audio in fixed-duration chunks and queues them for processing."""

    def __init__(self):
        self.sample_rate = SAMPLE_RATE
        self.chunk_samples = SAMPLE_RATE * CHUNK_DURATION_SECONDS
        self._queue: queue.Queue = queue.Queue()
        self._buffer = np.array([], dtype=np.float32)
        self._stream = None
        self._running = False

    def _callback(self, indata, frames, time_info, status):
        audio = indata[:, 0].copy()
        self._buffer = np.concatenate([self._buffer, audio])
        while len(self._buffer) >= self.chunk_samples:
            chunk = self._buffer[: self.chunk_samples]
            self._buffer = self._buffer[self.chunk_samples :]
            self._queue.put(chunk)

    def start(self):
        self._running = True
        self._stream = sd.InputStream(
            samplerate=self.sample_rate,
            channels=1,
            dtype="float32",
            callback=self._callback,
        )
        self._stream.start()

    def stop(self):
        self._running = False
        if self._stream:
            self._stream.stop()
            self._stream.close()
            self._stream = None
        # Flush remaining buffer if it has meaningful audio
        if len(self._buffer) > self.sample_rate:
            self._queue.put(self._buffer.copy())
        self._buffer = np.array([], dtype=np.float32)

    def get_chunk(self, timeout: float = 1.0) -> np.ndarray | None:
        try:
            return self._queue.get(timeout=timeout)
        except queue.Empty:
            return None

    @staticmethod
    def numpy_to_mp3_bytes(audio: np.ndarray, sample_rate: int = SAMPLE_RATE) -> bytes:
        """Convert float32 numpy audio to MP3 bytes for API submission."""
        pcm = (audio * 32767).astype(np.int16)
        segment = AudioSegment(
            pcm.tobytes(),
            frame_rate=sample_rate,
            sample_width=2,
            channels=1,
        )
        buf = io.BytesIO()
        segment.export(buf, format="mp3")
        return buf.getvalue()
