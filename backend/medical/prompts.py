CHIEF_COMPLAINT_PROMPT = """\
Medical scribe. Extract the chief complaint from this consultation transcript.
Write ONLY: "[symptom] x [duration]" — e.g. "Severe headache x 3 days" or "Productive cough x 1 week".
No other text.

Transcript:
{transcript}

Chief complaint:"""

SUBJECTIVE_PROMPT = """\
You are a medical scribe writing a clinical SOAP note.
Write the SUBJECTIVE section from this doctor-patient transcript.
Include: chief complaint, HPI (history of present illness), relevant past history, current medications, and allergies if mentioned.
Use third-person clinical language. Be concise.
Example format:
  HPI: 34-year-old presents with 3-day history of throbbing right-sided headache, rated 8/10, associated with photophobia and nausea...
  PMH: Known migraineur.
  Medications: Sumatriptan PRN.

Transcript:
{transcript}

SUBJECTIVE:"""

OBJECTIVE_PROMPT = """\
Medical scribe. From this consultation transcript, list ONLY the objective findings mentioned.
Include: vital signs, physical examination findings, and any test results discussed.
Use clinical notation (e.g. "BP 138/88 mmHg, HR 90 bpm, Temp 37.9°C").
If no vitals or exam findings are mentioned, write "Documented by clinician."

Transcript:
{transcript}

OBJECTIVE:"""

ASSESSMENT_PROMPT = """\
Medical scribe. Write ONLY the ASSESSMENT (diagnosis/clinical impression) from this consultation.
State the primary diagnosis and differential if mentioned. Use clinical terminology.
1-2 sentences maximum. Example: "Acute migraine with aura. Rule out secondary headache — CT head ordered."

Transcript:
{transcript}

ASSESSMENT:"""

PLAN_PROMPT = """\
Medical scribe. Write ONLY the PLAN from this consultation.
List each item on a new line starting with a dash.
Include: medications prescribed (with dose if stated), investigations ordered, referrals, patient education, and follow-up.
Example:
- Tab. Amoxicillin 500mg TDS x 5 days
- CBC and CRP ordered
- Review in 5 days or sooner if worsening

Transcript:
{transcript}

PLAN:"""

SUMMARY_PROMPT = """\
Write a 2-sentence clinical summary of this doctor-patient consultation for a busy clinician.
Use professional medical language.

Transcript:
{transcript}

Summary:"""
