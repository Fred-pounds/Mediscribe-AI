import { useEffect, useRef } from "react";

function LanguagePill({ isTwi }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
          style={{
            background: isTwi ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
            color: isTwi ? "#86efac" : "#93c5fd",
            border: `1px solid ${isTwi ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.3)"}`,
          }}>
      {isTwi ? "TW" : "EN"}
    </span>
  );
}

export default function TranscriptPanel({ chunks, recording }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chunks.length]);

  return (
    <div className="glass rounded-2xl flex flex-col h-full"
         style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full"
               style={{ background: "linear-gradient(to bottom, #3b82f6, #14b8a6)" }} />
          <span className="text-sm font-semibold text-white">Live Transcript</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> EN — local
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> TW — GhanaNLP
          </span>
        </div>
      </div>

      {/* Transcript body */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3 min-h-0">
        {chunks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {recording ? (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                     style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                </div>
                <p className="text-slate-400 text-sm">Listening…</p>
                <p className="text-slate-600 text-xs mt-1">Audio is being captured and transcribed</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                     style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 0 1-3-3V5a3 3 0 0 1 6 0v6a3 3 0 0 1-3 3Z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No transcript yet</p>
                <p className="text-slate-600 text-xs mt-1">Start recording to begin</p>
              </>
            )}
          </div>
        ) : (
          chunks.map((chunk, i) => (
            <div key={i} className="chunk-in flex items-start gap-3">
              <LanguagePill isTwi={chunk.isTwi} />
              <p className="text-sm text-slate-200 leading-relaxed">{chunk.text}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chunk count footer */}
      {chunks.length > 0 && (
        <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-600">{chunks.length} segment{chunks.length !== 1 ? "s" : ""} captured</span>
          {recording && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Live
            </span>
          )}
        </div>
      )}
    </div>
  );
}
