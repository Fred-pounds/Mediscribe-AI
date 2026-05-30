import time
import numpy as np

from backend.asr.detector import LanguageDetector
from backend.asr import english_asr, twi_asr
from backend.audio.capture import AudioCapture

LANG_AUTO = "auto"
LANG_EN   = "en"
LANG_TW   = "tw"


class ASRRouter:
    """
    Routes each audio chunk to the correct ASR backend.

    lang_mode:
      "en"   — faster-whisper, English
      "tw"   — GhanaNLP ASR + GhanaNLP translate to English
      "auto" — Whisper detect_language on first chunk, then lock
               (if Twi detected, uses GhanaNLP ASR + translate)
    """

    def __init__(self, lang_mode: str = LANG_AUTO):
        self._model = english_asr.get_model()
        self._detector = LanguageDetector(self._model)
        self._lang_mode = lang_mode
        self._detected_language: str | None = None
        self._is_twi: bool = (lang_mode == LANG_TW)
        self._last_error_time: float = 0.0

    def reset(self, lang_mode: str = LANG_AUTO):
        self._lang_mode = lang_mode
        self._detected_language = None
        self._is_twi = (lang_mode == LANG_TW)
        self._last_error_time = 0.0

    @property
    def language_label(self) -> str:
        if self._lang_mode == LANG_TW:
            return "Twi"
        if self._lang_mode == LANG_EN:
            return "English"
        return "Twi" if self._is_twi else "English"

    def _transcribe_twi(self, audio: np.ndarray) -> tuple[str, str]:
        """
        GhanaNLP ASR → Twi text, then GhanaNLP translate → English text.
        Returns (english_text, original_twi_text).
        Raises on API error so the caller can broadcast it.
        """
        mp3_bytes = AudioCapture.numpy_to_mp3_bytes(audio)
        twi_text  = twi_asr.transcribe(mp3_bytes)
        if not twi_text.strip():
            return "", ""
        eng_text = twi_asr.translate_to_english(twi_text)
        return eng_text, twi_text

    def process_chunk(self, audio: np.ndarray) -> dict:
        """
        Returns:
          text          — English text (translated when Twi)
          original_text — original Twi text (same as text for English)
          language      — "tw" | "en"
          is_twi        — bool
        """
        if self._lang_mode == LANG_EN:
            text = english_asr.transcribe(audio)
            return {"text": text, "original_text": text, "language": "en", "is_twi": False}

        if self._lang_mode == LANG_TW:
            eng, twi = self._transcribe_twi(audio)   # raises on 401/network error
            return {"text": eng, "original_text": twi, "language": "tw", "is_twi": True}

        # --- auto detect ---
        if self._detected_language is None:
            lang, _ = self._detector.detect(audio)
            self._detected_language = lang
            self._is_twi = self._detector.is_twi(audio)

        if self._is_twi:
            eng, twi = self._transcribe_twi(audio)
            return {"text": eng, "original_text": twi, "language": "tw", "is_twi": True}

        text = english_asr.transcribe(audio)
        return {"text": text, "original_text": text, "language": "en", "is_twi": False}

    def should_broadcast_error(self) -> bool:
        """Rate-limit error messages to at most one every 5 seconds."""
        now = time.time()
        if now - self._last_error_time > 5.0:
            self._last_error_time = now
            return True
        return False
