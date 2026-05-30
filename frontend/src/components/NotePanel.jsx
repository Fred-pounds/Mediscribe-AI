function Tag({ children, color = "blue" }) {
  const colors = {
    blue:   { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  text: "#93c5fd" },
    teal:   { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.3)",  text: "#5eead4" },
    red:    { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   text: "#fca5a5" },
    amber:  { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  text: "#fcd34d" },
    green:  { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)",   text: "#86efac" },
  };
  const c = colors[color];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {children}
    </span>
  );
}

function Section({ label, value, color = "white" }) {
  if (!value || value === "Not stated") return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-sm text-slate-200 leading-relaxed">{value}</p>
    </div>
  );
}

function SoapCard({ soap }) {
  const items = [
    { key: "S", label: "Subjective", value: soap.subjective },
    { key: "O", label: "Objective",  value: soap.objective  },
    { key: "A", label: "Assessment", value: soap.assessment },
    { key: "P", label: "Plan",       value: soap.plan       },
  ];
  const accents = { S: "#3b82f6", O: "#14b8a6", A: "#a855f7", P: "#f59e0b" };

  return (
    <div className="space-y-3">
      {items.map(({ key, label, value }) => (
        <div key={key} className="flex gap-3 p-4 rounded-xl"
             style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
               style={{ background: `${accents[key]}22`, color: accents[key], border: `1px solid ${accents[key]}44` }}>
            {key}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm text-slate-200 leading-relaxed break-words">
              {value || <span className="text-slate-600 italic">Not stated</span>}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotePanel({ note, summary, fullTranscript, generating }) {
  if (generating) {
    return (
      <div className="glass rounded-2xl h-full flex flex-col"
           style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-1.5 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #a855f7, #3b82f6)" }} />
          <span className="text-sm font-semibold text-white">Clinical Note</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <div className="w-14 h-14 rounded-full shimmer" />
          <div className="space-y-2 w-full max-w-xs">
            <div className="h-3 rounded shimmer" />
            <div className="h-3 rounded shimmer w-4/5" />
            <div className="h-3 rounded shimmer w-3/5" />
          </div>
          <p className="text-slate-500 text-sm">Generating clinical note…</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="glass rounded-2xl h-full flex flex-col"
           style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-1.5 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #a855f7, #3b82f6)" }} />
          <span className="text-sm font-semibold text-white">Clinical Note</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
               style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">No note generated yet</p>
          <p className="text-slate-600 text-xs mt-1">Stop the recording then click Generate Note</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const text = [
      "MEDISCRIBE AI — CLINICAL NOTE",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `DISCLAIMER: ${note.disclaimer}`,
      "",
      `CHIEF COMPLAINT: ${note.chief_complaint}`,
      "",
      "SOAP NOTE",
      `S: ${note.soap?.subjective}`,
      `O: ${note.soap?.objective}`,
      `A: ${note.soap?.assessment}`,
      `P: ${note.soap?.plan}`,
      "",
      `SYMPTOMS: ${(note.symptoms || []).join(", ") || "None"}`,
      `MEDICATIONS: ${(note.medications_mentioned || []).join(", ") || "None"}`,
      `RED FLAGS: ${(note.red_flags || []).join(", ") || "None"}`,
      `FOLLOW-UP: ${(note.follow_up_actions || []).join("; ") || "None"}`,
      "",
      "FULL TRANSCRIPT:",
      fullTranscript,
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mediscribe_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-full"
         style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #a855f7, #3b82f6)" }} />
          <span className="text-sm font-semibold text-white">Clinical Note</span>
        </div>
        <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#94a3b8" }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5 min-h-0">

        {/* Summary */}
        {summary && (
          <div className="p-4 rounded-xl"
               style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(20,184,166,0.08))", border: "1px solid rgba(59,130,246,0.2)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400 mb-1.5">Summary</p>
            <p className="text-sm text-slate-200 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Chief Complaint */}
        {note.chief_complaint && (
          <Section label="Chief Complaint" value={note.chief_complaint} />
        )}

        {/* SOAP */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">SOAP Note</p>
          <SoapCard soap={note.soap || {}} />
        </div>

        {/* Symptoms + Medications */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl space-y-2"
               style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Symptoms</p>
            <div className="flex flex-wrap gap-1.5">
              {(note.symptoms || []).length > 0
                ? note.symptoms.map((s) => <Tag key={s} color="blue">{s}</Tag>)
                : <span className="text-xs text-slate-600 italic">None documented</span>}
            </div>
          </div>

          <div className="p-4 rounded-xl space-y-2"
               style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Medications</p>
            <div className="flex flex-wrap gap-1.5">
              {(note.medications_mentioned || []).length > 0
                ? note.medications_mentioned.map((m) => <Tag key={m} color="teal">{m}</Tag>)
                : <span className="text-xs text-slate-600 italic">None documented</span>}
            </div>
          </div>
        </div>

        {/* Red Flags */}
        {(note.red_flags || []).length > 0 && (
          <div className="p-4 rounded-xl space-y-2"
               style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400">⚠ Red Flags</p>
            <div className="flex flex-wrap gap-1.5">
              {note.red_flags.map((f) => <Tag key={f} color="red">{f}</Tag>)}
            </div>
          </div>
        )}

        {/* Follow-up */}
        {(note.follow_up_actions || []).length > 0 && (
          <div className="p-4 rounded-xl space-y-2"
               style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Follow-up Actions</p>
            <ul className="space-y-1.5">
              {note.follow_up_actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI confidence note */}
        {note.confidence_note && (
          <p className="text-xs text-slate-600 italic">{note.confidence_note}</p>
        )}

        {/* Disclaimer */}
        <div className="p-3.5 rounded-xl"
             style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-xs text-red-300/70 leading-relaxed">
            ⚠ {note.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
