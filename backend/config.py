from dotenv import load_dotenv
import os

load_dotenv()

# Wire pydub to the bundled ffmpeg so we don't need a system install
try:
    import imageio_ffmpeg
    _ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    os.environ.setdefault("PATH", "")
    os.environ["PATH"] = os.path.dirname(_ffmpeg_path) + os.pathsep + os.environ["PATH"]
    from pydub import AudioSegment
    AudioSegment.converter = _ffmpeg_path
except Exception:
    pass

GHANA_NLP_API_KEY     = os.getenv("GHANA_NLP_API_KEY", "")          # translation key
GHANA_NLP_ASR_KEY     = os.getenv("GHANA_NLP_ASR_KEY", os.getenv("GHANA_NLP_API_KEY", ""))  # ASR key (falls back to translation key if same)
GHANA_NLP_ASR_URL     = os.getenv("GHANA_NLP_ASR_URL", "https://translation-api.ghananlp.org/asr/v2/transcribe")

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

SAMPLE_RATE = int(os.getenv("SAMPLE_RATE", 16000))
CHUNK_DURATION_SECONDS = int(os.getenv("CHUNK_DURATION_SECONDS", 5))
TWI_CONFIDENCE_THRESHOLD = float(os.getenv("TWI_CONFIDENCE_THRESHOLD", 0.6))
