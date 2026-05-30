export default function ConsentGate({ onConsent }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(5,62,61,0.55)", backdropFilter: "blur(12px)" }}>
      <div className="glass-strong rounded-3xl p-10 max-w-lg w-full animate-[slideUp_0.4s_ease-out]"
           style={{ boxShadow: "0 32px 80px rgba(5,62,61,0.25), 0 0 0 1px rgba(13,110,107,0.15)" }}>

        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto"
             style={{ background: "linear-gradient(135deg, rgba(13,110,107,0.15), rgba(20,184,166,0.12))", border: "1px solid rgba(13,110,107,0.3)" }}>
          <svg className="w-8 h-8" style={{ color: "var(--teal)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--ink)" }}>
          Patient Consent Required
        </h2>
        <p className="text-sm text-center mb-8 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          Before recording begins, confirm the patient has been informed this consultation
          will be transcribed by an AI system to assist with clinical documentation.
        </p>

        <div className="space-y-2.5 mb-8">
          {[
            { icon: "🔒", label: "English audio processed entirely on-device" },
            { icon: "🌍", label: "Twi audio processed via GhanaNLP API only" },
            { icon: "🗑️", label: "No data stored without explicit export" },
            { icon: "⚕️", label: "AI assistance only — not a clinical diagnosis" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                 style={{ background: "var(--teal-wash)", border: "1px solid rgba(13,110,107,0.12)" }}>
              <span className="text-base">{icon}</span>
              <span className="text-sm" style={{ color: "var(--ink-body)" }}>{label}</span>
            </div>
          ))}
        </div>

        <button onClick={onConsent}
                className="w-full py-4 rounded-2xl text-white font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #053E3D, #0D6E6B)", boxShadow: "0 4px 20px rgba(13,110,107,0.35)" }}>
          Patient Consents — Begin Session
        </button>
      </div>
    </div>
  );
}
