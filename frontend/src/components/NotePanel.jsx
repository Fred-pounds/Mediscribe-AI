import { useState, useEffect } from "react";

function Tag({ children, variant = "teal" }) {
  const styles = {
    teal:  { background: "var(--teal-wash)",  color: "var(--teal)",  border: "1px solid rgba(13,110,107,0.22)" },
    amber: { background: "var(--amber-wash)", color: "var(--amber)", border: "1px solid rgba(194,65,12,0.22)" },
    rust:  { background: "#FEF2F2",           color: "var(--rust)",  border: "1px solid rgba(154,52,18,0.22)" },
    moss:  { background: "#F0FDF4",           color: "var(--moss)",  border: "1px solid rgba(77,124,15,0.22)" },
  };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
          style={styles[variant]}>
      {children}
    </span>
  );
}

const SOAP_META = [
  { key: "subjective",  label: "S — Subjective",  accent: "#0D6E6B" },
  { key: "objective",   label: "O — Objective",   accent: "#053E3D" },
  { key: "assessment",  label: "A — Assessment",  accent: "#C2410C" },
  { key: "plan",        label: "P — Plan",         accent: "#D97706" },
];

function EditableText({ value, onChange, editing, rows = 1, semibold = false }) {
  if (editing) {
    return (
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full text-sm leading-relaxed resize-y rounded-lg px-3 py-2 outline-none"
        style={{
          color: "var(--ink-body)",
          background: "var(--paper-warm)",
          border: "1px solid rgba(13,110,107,0.35)",
          fontFamily: "inherit",
          fontWeight: semibold ? 600 : 400,
        }}
      />
    );
  }
  return (
    <p className={`text-sm leading-relaxed${semibold ? " font-semibold" : ""}`}
       style={{ color: semibold ? "var(--ink)" : "var(--ink-body)" }}>
      {value || <em style={{ color: "var(--ink-faint)" }}>Not stated</em>}
    </p>
  );
}

function SoapSection({ label, value, accent, editing, onChange }) {
  const isMultiLine = value && value.includes("\n");
  return (
    <div className="p-4 rounded-xl"
         style={{ background: "rgba(253,250,243,0.8)", border: `1px solid ${editing ? accent + "55" : "rgba(13,110,107,0.09)"}`, transition: "border-color 0.15s" }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 rounded-full" style={{ background: accent }} />
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>{label}</p>
      </div>
      {editing ? (
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          rows={4}
          className="w-full text-sm leading-relaxed resize-y rounded-lg px-3 py-2 outline-none"
          style={{
            color: "var(--ink-body)",
            background: "var(--paper-warm)",
            border: `1px solid ${accent}44`,
            fontFamily: "inherit",
          }}
        />
      ) : value && value !== "Not stated" ? (
        isMultiLine ? (
          <ul className="space-y-1">
            {value.split("\n").filter(l => l.trim()).map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: "var(--ink-body)" }}>
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: accent }} />
                {line.replace(/^[-•]\s*/, "")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-body)" }}>{value}</p>
        )
      ) : (
        <p className="text-sm italic" style={{ color: "var(--ink-faint)" }}>Not stated</p>
      )}
    </div>
  );
}

function TagListField({ items, variant, editing, onChange, hint }) {
  if (editing) {
    return (
      <div>
        <textarea
          value={(items || []).join(", ")}
          onChange={e => onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          rows={2}
          placeholder={hint}
          className="w-full text-sm leading-relaxed resize-none rounded-lg px-3 py-2 outline-none"
          style={{
            color: "var(--ink-body)",
            background: "var(--paper-warm)",
            border: "1px solid rgba(13,110,107,0.35)",
            fontFamily: "inherit",
          }}
        />
        <p className="text-[10px] mt-1" style={{ color: "var(--ink-faint)" }}>Comma-separated</p>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {(items || []).length > 0
        ? items.map(s => <Tag key={s} variant={variant}>{s}</Tag>)
        : <span className="text-xs italic" style={{ color: "var(--ink-faint)" }}>None documented</span>}
    </div>
  );
}

function FollowUpField({ items, editing, onChange }) {
  if (editing) {
    return (
      <div>
        <textarea
          value={(items || []).join("\n")}
          onChange={e => onChange(e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
          rows={3}
          placeholder="One action per line"
          className="w-full text-sm leading-relaxed resize-y rounded-lg px-3 py-2 outline-none"
          style={{
            color: "var(--ink-body)",
            background: "var(--paper-warm)",
            border: "1px solid rgba(13,110,107,0.35)",
            fontFamily: "inherit",
          }}
        />
        <p className="text-[10px] mt-1" style={{ color: "var(--ink-faint)" }}>One action per line</p>
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {(items || []).map((a, i) => (
        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--ink-body)" }}>
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--teal)" }} />
          {a}
        </li>
      ))}
    </ul>
  );
}

function initEdits(note, summary) {
  return {
    summary:               summary || "",
    chief_complaint:       note?.chief_complaint || "",
    soap:                  { ...(note?.soap ?? {}) },
    symptoms:              [...(note?.symptoms ?? [])],
    medications_mentioned: [...(note?.medications_mentioned ?? [])],
    red_flags:             [...(note?.red_flags ?? [])],
    follow_up_actions:     [...(note?.follow_up_actions ?? [])],
  };
}

export default function NotePanel({ note, summary, fullTranscript, generating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [edits, setEdits] = useState({});

  useEffect(() => {
    setEdits(initEdits(note, summary));
    setIsEditing(false);
  }, [note, summary]);

  const set = (field, val) => setEdits(prev => ({ ...prev, [field]: val }));
  const setSoap = (key, val) => setEdits(prev => ({ ...prev, soap: { ...prev.soap, [key]: val } }));

  if (generating) {
    return (
      <div className="glass rounded-2xl h-full flex flex-col"
           style={{ boxShadow: "0 4px 24px rgba(6,37,40,0.08), 0 0 0 1px rgba(13,110,107,0.10)" }}>
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-1 h-5 rounded-full" style={{ background: "var(--amber)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>Clinical Note</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <div className="w-14 h-14 rounded-full shimmer" />
          <div className="space-y-2 w-full max-w-xs">
            {[1, 0.8, 0.6].map((w, i) => (
              <div key={i} className="h-3 rounded shimmer" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Generating clinical note…</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="glass rounded-2xl h-full flex flex-col"
           style={{ boxShadow: "0 4px 24px rgba(6,37,40,0.08), 0 0 0 1px rgba(13,110,107,0.10)" }}>
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-1 h-5 rounded-full" style={{ background: "var(--amber)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>Clinical Note</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
               style={{ background: "var(--teal-wash)", border: "1px solid rgba(13,110,107,0.15)" }}>
            <svg className="w-6 h-6" style={{ color: "var(--teal)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>No note generated yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>Stop recording then click Generate Note</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const text = [
      "MEDISCRIBE AI — CLINICAL NOTE",
      `Generated: ${new Date().toLocaleString()}`,
      `DISCLAIMER: ${note.disclaimer}`,
      "",
      `CHIEF COMPLAINT: ${edits.chief_complaint}`,
      "",
      edits.summary ? `SUMMARY: ${edits.summary}` : "",
      "",
      "SOAP NOTE",
      `S: ${edits.soap?.subjective}`,
      `O: ${edits.soap?.objective}`,
      `A: ${edits.soap?.assessment}`,
      `P: ${edits.soap?.plan}`,
      "",
      `SYMPTOMS: ${(edits.symptoms || []).join(", ") || "None"}`,
      `MEDICATIONS: ${(edits.medications_mentioned || []).join(", ") || "None"}`,
      `RED FLAGS: ${(edits.red_flags || []).join(", ") || "None"}`,
      `FOLLOW-UP: ${(edits.follow_up_actions || []).join("; ") || "None"}`,
      "",
      "FULL TRANSCRIPT:",
      fullTranscript,
    ].filter(Boolean).join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `mediscribe_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-full"
         style={{ boxShadow: "0 4px 24px rgba(6,37,40,0.08), 0 0 0 1px rgba(13,110,107,0.10)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "var(--amber)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>Clinical Note</span>
          {isEditing && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--amber-wash)", color: "var(--amber)", border: "1px solid rgba(194,65,12,0.25)" }}>
              Editing
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(e => !e)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-75"
            style={isEditing
              ? { background: "var(--amber-wash)", color: "var(--amber)", border: "1px solid rgba(194,65,12,0.25)" }
              : { background: "var(--paper-soft)", color: "var(--ink-muted)", border: "1px solid rgba(13,110,107,0.12)" }
            }>
            {isEditing ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Done
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </>
            )}
          </button>
          <button onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-75"
                  style={{ background: "var(--teal-wash)", color: "var(--teal)", border: "1px solid rgba(13,110,107,0.18)" }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4 min-h-0">

        {/* Summary */}
        {(edits.summary || isEditing) && (
          <div className="px-4 py-3 rounded-xl"
               style={{ background: "linear-gradient(135deg, var(--teal-wash), var(--amber-wash))", border: "1px solid rgba(13,110,107,0.15)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--teal)" }}>Summary</p>
            <EditableText
              value={edits.summary}
              onChange={v => set("summary", v)}
              editing={isEditing}
              rows={2}
            />
          </div>
        )}

        {/* Chief Complaint */}
        {(edits.chief_complaint || isEditing) && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--ink-muted)" }}>
              Chief Complaint
            </p>
            <EditableText
              value={edits.chief_complaint}
              onChange={v => set("chief_complaint", v)}
              editing={isEditing}
              semibold
            />
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(13,110,107,0.10)" }} />

        {/* SOAP */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--ink-muted)" }}>SOAP Note</p>
          <div className="space-y-2.5">
            {SOAP_META.map(({ key, label, accent }) => (
              <SoapSection
                key={key}
                label={label}
                value={edits.soap?.[key]}
                accent={accent}
                editing={isEditing}
                onChange={val => setSoap(key, val)}
              />
            ))}
          </div>
        </div>

        {/* Symptoms + Medications */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl" style={{ background: "var(--paper-warm)", border: "1px solid rgba(13,110,107,0.09)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--ink-muted)" }}>Symptoms</p>
            <TagListField
              items={edits.symptoms}
              variant="teal"
              editing={isEditing}
              onChange={v => set("symptoms", v)}
              hint="fever, cough, headache…"
            />
          </div>
          <div className="p-4 rounded-xl" style={{ background: "var(--paper-warm)", border: "1px solid rgba(13,110,107,0.09)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--ink-muted)" }}>Medications</p>
            <TagListField
              items={edits.medications_mentioned}
              variant="amber"
              editing={isEditing}
              onChange={v => set("medications_mentioned", v)}
              hint="Paracetamol, Amoxicillin…"
            />
          </div>
        </div>

        {/* Red Flags */}
        {((edits.red_flags || []).length > 0 || isEditing) && (
          <div className="p-4 rounded-xl" style={{ background: "#FFF5F5", border: "1px solid rgba(154,52,18,0.2)" }}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--rust)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--rust)" }}>Red Flags</p>
            </div>
            <TagListField
              items={edits.red_flags}
              variant="rust"
              editing={isEditing}
              onChange={v => set("red_flags", v)}
              hint="chest pain, difficulty breathing…"
            />
          </div>
        )}

        {/* Follow-up */}
        {((edits.follow_up_actions || []).length > 0 || isEditing) && (
          <div className="p-4 rounded-xl" style={{ background: "var(--paper-warm)", border: "1px solid rgba(13,110,107,0.09)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--ink-muted)" }}>Follow-up Actions</p>
            <FollowUpField
              items={edits.follow_up_actions}
              editing={isEditing}
              onChange={v => set("follow_up_actions", v)}
            />
          </div>
        )}

        {/* AI confidence note */}
        {note.confidence_note && (
          <p className="text-xs italic" style={{ color: "var(--ink-faint)" }}>{note.confidence_note}</p>
        )}

        {/* Disclaimer */}
        <div className="p-3.5 rounded-xl" style={{ background: "#FFF9F0", border: "1px solid rgba(194,65,12,0.18)" }}>
          <div className="flex items-start gap-2">
            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--amber)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-xs leading-relaxed" style={{ color: "var(--amber)" }}>{note.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
