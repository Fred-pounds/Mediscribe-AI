import { useState, useRef, useCallback, useEffect } from "react";

const API = "http://localhost:8001";
const WS  = "ws://localhost:8001/ws";

export function useSession() {
  const [consented,   setConsented]   = useState(false);
  const [recording,   setRecording]   = useState(false);
  const [chunks,      setChunks]      = useState([]);
  const [note,        setNote]        = useState(null);
  const [summary,     setSummary]     = useState("");
  const [language,    setLanguage]    = useState("—");
  const [langMode,    setLangMode]    = useState("auto");  // "en" | "tw" | "auto"
  const [generating,  setGenerating]  = useState(false);
  const [wsStatus,    setWsStatus]    = useState("disconnected");
  const [asrError,    setAsrError]    = useState(null);

  const wsRef = useRef(null);

  const reconnectTimer = useRef(null);

  const connectWs = useCallback(() => {
    // Don't open a second socket if one is already connecting or open
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;

    const ws = new WebSocket(WS);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("connected");
      const ping = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        else clearInterval(ping);
      }, 15000);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "transcript") {
          setChunks((prev) => [
            ...prev,
            {
              text:         data.text,
              originalText: data.original_text || data.text,
              language:     data.language,
              isTwi:        data.is_twi,
              translated:   data.is_twi && data.original_text !== data.text,
            },
          ]);
          setLanguage(data.language);
        }
        if (data.type === "error") {
          setAsrError(data.message);
        }
        if (data.type === "note_ready") {
          setNote(data.note);
          setSummary(data.summary || "");
          setGenerating(false);
        }
      } catch {}
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      // Only schedule reconnect if this socket is still the current one
      if (wsRef.current === ws) {
        reconnectTimer.current = setTimeout(connectWs, 3000);
      }
    };

    ws.onerror = () => {
      // Let onclose handle the reconnect
    };
  }, []);

  useEffect(() => {
    connectWs();
    return () => {
      // Cancel pending reconnect timer
      clearTimeout(reconnectTimer.current);
      // Only close if the socket is open — avoids the "closed before established" error
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      } else if (ws) {
        // Detach handlers so stale sockets don't trigger reconnects after unmount
        ws.onclose = null;
        ws.onerror = null;
      }
    };
  }, [connectWs]);

  const startSession = useCallback(async (mode) => {
    try {
      const res = await fetch(`${API}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang_mode: mode }),
      });
      const data = await res.json();
      if (!data.error) {
        setRecording(true);
        setChunks([]);
        setNote(null);
        setSummary("");
        setLanguage("—");
        setAsrError(null);
      }
      return data;
    } catch (err) {
      setAsrError("Cannot reach backend. Is the server running on port 8001?");
    }
  }, []);

  const stopSession = useCallback(async () => {
    await fetch(`${API}/session/stop`, { method: "POST" });
    setRecording(false);
  }, []);

  const generateNote = useCallback(async () => {
    setGenerating(true);
    const res = await fetch(`${API}/session/generate-note`, { method: "POST" });
    const data = await res.json();
    setNote(data.note);
    setSummary(data.summary || "");
    setGenerating(false);
    return data;
  }, []);

  const resetSession = useCallback(() => {
    setConsented(false);
    setRecording(false);
    setChunks([]);
    setNote(null);
    setSummary("");
    setLanguage("—");
    setGenerating(false);
  }, []);

  const fullTranscript = chunks.map((c) => c.text).join(" ");

  return {
    consented, setConsented,
    recording, chunks, note, summary, language,
    langMode, setLangMode,
    generating, wsStatus, asrError,
    fullTranscript,
    startSession, stopSession, generateNote, resetSession,
  };
}
