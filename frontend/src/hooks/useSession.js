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
  const [generating,  setGenerating]  = useState(false);
  const [wsStatus,    setWsStatus]    = useState("disconnected");

  const wsRef = useRef(null);

  const connectWs = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState < 2) return;
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
            { text: data.text, language: data.language, isTwi: data.is_twi },
          ]);
          setLanguage(data.language);
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
      setTimeout(connectWs, 3000);
    };
  }, []);

  useEffect(() => {
    connectWs();
    return () => wsRef.current?.close();
  }, [connectWs]);

  const startSession = useCallback(async () => {
    const res = await fetch(`${API}/session/start`, { method: "POST" });
    const data = await res.json();
    if (!data.error) {
      setRecording(true);
      setChunks([]);
      setNote(null);
      setSummary("");
      setLanguage("—");
    }
    return data;
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
    generating, wsStatus, fullTranscript,
    startSession, stopSession, generateNote, resetSession,
  };
}
