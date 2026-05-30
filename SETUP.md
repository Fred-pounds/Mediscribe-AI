# MediScribe AI — Setup Guide

## Prerequisites

- Python 3.11+
- [Ollama](https://ollama.ai) installed
- `ffmpeg` installed (needed by pydub for MP3 encoding)

## 1. Install ffmpeg

```bash
sudo apt install ffmpeg       # Ubuntu/Debian
brew install ffmpeg           # macOS
```

## 2. Install Python dependencies

```bash
pip install -r requirements.txt
pip install websocket-client  # needed by Streamlit frontend
```

## 3. Pull the local LLM

```bash
ollama pull llama3.2:3b
```

> Alternatives if slow: `ollama pull mistral` or `ollama pull phi3:mini`

## 4. Configure environment

Copy `.env` and set your GhanaNLP key (already pre-filled):

```bash
cp .env .env.local
```

Edit `OLLAMA_MODEL` if you pulled a different model.

## 5. Run

```bash
./start.sh
```

Then open **http://localhost:8501** in your browser.

Or run separately:

```bash
# Terminal 1 — Backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Frontend
streamlit run frontend/app.py
```

## Architecture

```
Microphone → Audio Capture (sounddevice)
           → Language Detection (faster-whisper)
           → English: faster-whisper (local, on-device)
           → Twi: GhanaNLP API
           → Transcript → Ollama llama3.2:3b
           → SOAP Note, Symptoms, Red Flags, Follow-ups
           → Streamlit Dashboard
```

## Supported Languages

| Language | ASR Backend | Privacy |
|----------|-------------|---------|
| English  | faster-whisper (local) | 100% on-device |
| Twi/Akan | GhanaNLP API | Audio sent to GhanaNLP |

## Whisper Model Sizes

Edit `WHISPER_MODEL_SIZE` in `.env`:

| Size   | RAM    | Speed  | Accuracy |
|--------|--------|--------|----------|
| tiny   | ~400MB | Fast   | Basic    |
| base   | ~700MB | Good   | Good     |
| small  | ~1.5GB | Slower | Better   |
| medium | ~3GB   | Slow   | Best     |
