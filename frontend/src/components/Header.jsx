export default function Header({ recording, language, wsStatus }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "rgba(13,110,107,0.12)", background: "rgba(253,250,243,0.9)", backdropFilter: "blur(16px)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: "linear-gradient(135deg, #053E3D, #0D6E6B)", boxShadow: "0 4px 14px rgba(13,110,107,0.35)" }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 0 1-3-3V5a3 3 0 0 1 6 0v6a3 3 0 0 1-3 3Z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--ink)" }}>MediScribe</span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: "var(--teal-mist)", color: "var(--teal)", border: "1px solid rgba(13,110,107,0.2)" }}>
            AI
          </span>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-3">
        {language !== "—" && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
               style={language === "Twi"
                 ? { background: "var(--amber-wash)", color: "var(--amber)", border: "1px solid rgba(194,65,12,0.25)" }
                 : { background: "var(--teal-wash)",  color: "var(--teal)",   border: "1px solid rgba(13,110,107,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: language === "Twi" ? "var(--amber)" : "var(--teal)" }} />
            {language}
          </div>
        )}

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${recording ? "recording-ring" : ""}`}
             style={recording
               ? { background: "var(--amber-wash)", color: "var(--amber)",   border: "1px solid rgba(194,65,12,0.3)" }
               : { background: "var(--paper-warm)", color: "var(--ink-muted)", border: "1px solid rgba(13,110,107,0.12)" }}>
          <span className="w-1.5 h-1.5 rounded-full"
                style={{ background: recording ? "var(--amber)" : "var(--ink-faint)" }} />
          {recording ? "Recording" : "Idle"}
        </div>

        <div className="w-2 h-2 rounded-full"
             title={`WebSocket: ${wsStatus}`}
             style={{ background: wsStatus === "connected" ? "var(--moss)" : "var(--ink-faint)",
                      boxShadow: wsStatus === "connected" ? "0 0 6px #4D7C0F44" : "none" }} />
      </div>
    </header>
  );
}
