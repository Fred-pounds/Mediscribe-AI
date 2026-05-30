const CONSENT_ITEMS = [
  {
    label: "English audio processed entirely on-device",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
      </svg>
    ),
  },
  {
    label: "Twi audio processed via GhanaNLP API only",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    label: "No data stored without explicit export",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
  },
  {
    label: "AI assistance only — not a clinical diagnosis",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
];

export default function ConsentGate({ onConsent }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(5,62,61,0.55)", backdropFilter: "blur(12px)" }}>
      <div className="glass-strong rounded-3xl p-10 max-w-lg w-full animate-[slideUp_0.4s_ease-out]"
           style={{ boxShadow: "0 32px 80px rgba(5,62,61,0.25), 0 0 0 1px rgba(13,110,107,0.15)" }}>

        {/* Shield icon */}
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
          {CONSENT_ITEMS.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                 style={{ background: "var(--teal-wash)", border: "1px solid rgba(13,110,107,0.12)" }}>
              <span style={{ color: "var(--teal)" }}>{icon}</span>
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
