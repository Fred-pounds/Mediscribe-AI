import numpy as np
from faster_whisper import WhisperModel
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from backend.config import WHISPER_MODEL_SIZE, TWI_CONFIDENCE_THRESHOLD

# Whisper language codes that we treat as Twi/Akan
TWI_LANGUAGE_CODES = {"tw", "ak"}


class LanguageDetector:
    """
    Uses faster-whisper to detect whether audio is English or Twi/Akan.
    The same model instance is reused for English transcription to avoid
    loading it twice.
    """

    def __init__(self, model: WhisperModel):
        self.model = model
        self.threshold = TWI_CONFIDENCE_THRESHOLD

    def detect(self, audio: np.ndarray) -> tuple[str, float]:
        """
        Returns (language_code, confidence).
        language_code is 'tw' for Twi or the detected ISO 639-1 code otherwise.
        """
        # Whisper detect_language expects float32 mono at 16kHz
        _, info = self.model.transcribe(audio, task="transcribe", without_timestamps=True)
        lang = info.language
        prob = info.language_probability
        return lang, prob

    def is_twi(self, audio: np.ndarray) -> bool:
        lang, prob = self.detect(audio)
        return lang in TWI_LANGUAGE_CODES and prob >= self.threshold
