import urllib.request
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from backend.config import GHANA_NLP_API_KEY, GHANA_NLP_ASR_URL


def transcribe(audio_mp3_bytes: bytes, language: str = "tw") -> str:
    """
    Transcribe Twi (or other GhanaNLP-supported language) audio via the GhanaNLP ASR API.
    audio_mp3_bytes must be MP3-encoded audio bytes.
    Returns plain text transcript or raises on API error.
    """
    url = f"{GHANA_NLP_ASR_URL}?language={language}"
    headers = {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": GHANA_NLP_API_KEY,
    }

    req = urllib.request.Request(url, headers=headers, data=audio_mp3_bytes)
    req.get_method = lambda: "POST"

    with urllib.request.urlopen(req, timeout=30) as response:
        raw = response.read().decode("utf-8")

    # API returns either a plain string or JSON — handle both
    try:
        data = json.loads(raw)
        if isinstance(data, str):
            return data
        # Some versions wrap in {"transcription": "..."}
        return data.get("transcription", data.get("text", raw))
    except json.JSONDecodeError:
        return raw.strip()
