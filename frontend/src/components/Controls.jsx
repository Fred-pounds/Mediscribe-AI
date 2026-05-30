export default function Controls({ recording, hasChunks, generating, onStart, onStop, onGenerate, onReset }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b"
         style={{ borderColor: "rgba(13,110,107,0.10)", background: "rgba(253,250,243,0.7)" }}>

      {!recording ? (
        <button onClick={onStart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #053E3D, #0D6E6B)", boxShadow: "0 4px 16px rgba(13,110,107,0.30)" }}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          Start Recording
        </button>
      ) : (
        <button onClick={onStop}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
                style={{ background: "var(--amber-wash)", color: "var(--amber)", border: "1px solid rgba(194,65,12,0.3)" }}>
          <span className="w-3 h-3 rounded-sm" style={{ background: "var(--amber)" }} />
          Stop Recording
        </button>
      )}

      <button onClick={onGenerate}
              disabled={recording || !hasChunks || generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:opacity-85 active:enabled:scale-[0.97]"
              style={{ background: "var(--teal-wash)", color: "var(--teal)", border: "1px solid rgba(13,110,107,0.2)" }}>
        {generating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
            Generate Note
          </>
        )}
      </button>

      <div className="flex-1" />

      <button onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:opacity-75"
              style={{ color: "var(--ink-muted)", border: "1px solid rgba(13,110,107,0.12)" }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        New Session
      </button>
    </div>
  );
}
