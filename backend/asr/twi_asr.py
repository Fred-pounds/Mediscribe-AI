import urllib.request
import urllib.error
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from backend.config import GHANA_NLP_API_KEY, GHANA_NLP_ASR_KEY, GHANA_NLP_ASR_URL

GHANA_NLP_TRANSLATE_URL = "https://translation-api.ghananlp.org/v1/translate"


def transcribe(audio_mp3_bytes: bytes, language: str = "tw") -> str:
    """
    Transcribe Twi audio via GhanaNLP ASR API.
    Sends raw MP3 bytes exactly as the API expects.
    Raises on HTTP errors so the caller can handle / fall back.
    """
    url = f"{GHANA_NLP_ASR_URL}?language={language}"
    hdr = {
        "Content-Type":  "audio/mpeg",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": GHANA_NLP_ASR_KEY,
    }

    req = urllib.request.Request(url, headers=hdr, data=audio_mp3_bytes)
    req.get_method = lambda: "POST"

    with urllib.request.urlopen(req, timeout=30) as response:
        raw = response.read().decode("utf-8")

    try:
        data = json.loads(raw)
        if isinstance(data, str):
            return data
        return data.get("transcription", data.get("text", raw))
    except json.JSONDecodeError:
        return raw.strip()


def translate_to_english(twi_text: str) -> str:
    """
    Translate Twi text to English via GhanaNLP Translation API.
    Falls back to returning the original text on failure.
    """
    if not twi_text.strip():
        return twi_text

    payload = json.dumps({"in": twi_text, "lang": "tw-en"}).encode("utf-8")
    hdr = {
        "Content-Type":  "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": GHANA_NLP_API_KEY,
    }

    try:
        req = urllib.request.Request(GHANA_NLP_TRANSLATE_URL, headers=hdr, data=payload)
        req.get_method = lambda: "POST"
        with urllib.request.urlopen(req, timeout=30) as response:
            raw = response.read().decode("utf-8")

        data = json.loads(raw)
        if isinstance(data, str):
            return data
        return (
            data.get("translatedText")
            or data.get("translation")
            or data.get("text")
            or twi_text
        )
    except Exception:
        return twi_text
