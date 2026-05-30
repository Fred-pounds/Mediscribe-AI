import { useEffect, useRef } from "react";

function LangPill({ isTwi, translated }) {
  const label = isTwi ? (translated ? "TW→EN" : "TW") : "EN";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide"
          style={isTwi
            ? { background: "var(--amber-wash)", color: "var(--amber)", border: "1px solid rgba(194,65,12,0.25)" }
            : { background: "var(--teal-wash)",  color: "var(--teal)",  border: "1px solid rgba(13,110,107,0.22)" }}>
      {label}
    </span>
  );
}

export default function TranscriptPanel({ chunks, recording, asrError }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chunks.length]);

  return (
    <div className="glass rounded-2xl flex flex-col h-full"
         style={{ boxShadow: "0 4px 24px rgba(6,37,40,0.08), 0 0 0 1px rgba(13,110,107,0.10)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "var(--teal)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>Live Transcript</span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--ink-muted)" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--teal)" }} /> EN — local
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--amber)" }} /> TW — GhanaNLP
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3 min-h-0">
        {chunks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {recording ? (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                     style={{ background: "var(--amber-wash)", border: "1px solid rgba(194,65,12,0.3)" }}>
                  <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: "var(--amber)" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>Listening…</p>
                <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>Audio is being captured and transcribed</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                     style={{ background: "var(--teal-wash)", border: "1px solid rgba(13,110,107,0.15)" }}>
                  <svg className="w-5 h-5" style={{ color: "var(--teal)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 0 1-3-3V5a3 3 0 0 1 6 0v6a3 3 0 0 1-3 3Z" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No transcript yet</p>
                <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>Press Start Recording to begin</p>
              </>
            )}
          </div>
        ) : (
          chunks.map((chunk, i) => (
            <div key={i} className="chunk-in flex items-start gap-3">
              <LangPill isTwi={chunk.isTwi} translated={chunk.translated} />
              <div className="min-w-0">
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-body)" }}>{chunk.text}</p>
                {chunk.translated && chunk.originalText && chunk.originalText !== chunk.text && (
                  <p className="text-xs mt-0.5 italic" style={{ color: "var(--ink-faint)" }}>
                    {chunk.originalText}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ASR error banner */}
      {asrError && (
        <div className="mx-5 mb-3 px-4 py-3 rounded-xl flex items-start gap-2"
             style={{ background: "#FFF5F5", border: "1px solid rgba(154,52,18,0.25)" }}>
          <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--rust)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--rust)" }}>ASR Error</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{asrError}</p>
            {asrError.includes("401") && (
              <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
                Update <code className="px-1 rounded" style={{ background: "var(--paper-soft)" }}>GHANA_NLP_ASR_KEY</code> in <code className="px-1 rounded" style={{ background: "var(--paper-soft)" }}>.env</code> with a key that has ASR access.
              </p>
            )}
          </div>
        </div>
      )}

      {chunks.length > 0 && (
        <div className="px-5 py-3 flex items-center justify-between"
             style={{ borderTop: "1px solid rgba(13,110,107,0.08)" }}>
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
            {chunks.length} segment{chunks.length !== 1 ? "s" : ""} captured
          </span>
          {recording && (
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--amber)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--amber)" }} />
              Live
            </span>
          )}
        </div>
      )}
    </div>
  );
}
