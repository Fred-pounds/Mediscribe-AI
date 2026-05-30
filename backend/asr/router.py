import numpy as np
from faster_whisper import WhisperModel

from backend.asr.detector import LanguageDetector
from backend.asr import english_asr, twi_asr
from backend.audio.capture import AudioCapture


class ASRRouter:
    """
    Routes each audio chunk to the correct ASR backend based on detected language.
    Maintains language state across chunks so detection only runs on the first chunk
    of each session (or when forced to re-detect).
    """

    def __init__(self):
        self._model: WhisperModel = english_asr.get_model()
        self._detector = LanguageDetector(self._model)
        self._detected_language: str | None = None
        self._is_twi: bool = False

    def reset(self):
        """Call at the start of a new session to re-detect language."""
        self._detected_language = None
        self._is_twi = False

    @property
    def current_language(self) -> str:
        if self._detected_language is None:
            return "unknown"
        return "tw" if self._is_twi else self._detected_language

    @property
    def language_label(self) -> str:
        return "Twi" if self._is_twi else "English"

    def process_chunk(self, audio: np.ndarray) -> dict:
        """
        Accepts a float32 mono 16kHz numpy array.
        Returns {"text": str, "language": str, "is_twi": bool}
        """
        # Detect language on first chunk only
        if self._detected_language is None:
            lang, prob = self._detector.detect(audio)
            self._detected_language = lang
            self._is_twi = self._detector.is_twi(audio)

        if self._is_twi:
            mp3_bytes = AudioCapture.numpy_to_mp3_bytes(audio)
            text = twi_asr.transcribe(mp3_bytes)
        else:
            text = english_asr.transcribe(audio)

        return {
            "text": text,
            "language": self.current_language,
            "is_twi": self._is_twi,
        }
