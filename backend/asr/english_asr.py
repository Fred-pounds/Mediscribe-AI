import numpy as np
from faster_whisper import WhisperModel
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from backend.config import WHISPER_MODEL_SIZE

_model: WhisperModel | None = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        # device="auto" picks CUDA if available, falls back to CPU
        _model = WhisperModel(WHISPER_MODEL_SIZE, device="auto", compute_type="int8")
    return _model


def transcribe(audio: np.ndarray, language: str = "en") -> str:
    """Transcribe audio locally with faster-whisper. language can be any Whisper-supported code."""
    model = get_model()
    segments, _ = model.transcribe(
        audio,
        language=language,
        task="transcribe",
        without_timestamps=True,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
    )
    return " ".join(seg.text.strip() for seg in segments)
