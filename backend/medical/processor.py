import re
import ollama
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from backend.config import OLLAMA_MODEL
from backend.medical.prompts import (
    CHIEF_COMPLAINT_PROMPT,
    SUBJECTIVE_PROMPT,
    OBJECTIVE_PROMPT,
    ASSESSMENT_PROMPT,
    PLAN_PROMPT,
    SUMMARY_PROMPT,
)

DISCLAIMER = (
    "AI-generated assistance only. Not a clinical diagnosis. "
    "Always apply professional medical judgment."
)

# ── Keyword banks ────────────────────────────────────────────────────────────

_SYMPTOM_KEYWORDS = [
    "pain", "ache", "fever", "cough", "headache", "nausea", "vomiting",
    "dizziness", "fatigue", "weakness", "shortness of breath", "chest pain",
    "abdominal pain", "diarrhea", "constipation", "rash", "swelling",
    "bleeding", "loss of appetite", "weight loss", "itching", "burning",
    "chills", "malaise", "difficulty breathing", "palpitations", "insomnia",
    "sore throat", "runny nose", "back pain", "joint pain", "confusion",
]

_MED_KEYWORDS = [
    "paracetamol", "acetaminophen", "ibuprofen", "amoxicillin", "metformin",
    "aspirin", "omeprazole", "artemether", "coartem", "quinine", "penicillin",
    "ciprofloxacin", "flagyl", "metronidazole", "doxycycline", "amoxil",
    "chloroquine", "cotrimoxazole", "diclofenac", "prednisolone", "insulin",
    "lisinopril", "amlodipine", "atenolol", "metoprolol", "furosemide",
    "sumatriptan", "ketorolac", "metoclopramide", "ondansetron",
]

_RED_FLAG_PATTERNS = [
    r"(very high|extremely high)\s+fever",
    r"temp(erature)?\s*(of\s*)?[3-4]\d\.\d",  # fever ≥38
    r"(can't|cannot|difficulty)\s+breath",
    r"chest\s+pain",
    r"(loss of|lost)\s+consciousness",
    r"seiz(ure|ing)",
    r"blood\s+in\s+(stool|urine|vomit)",
    r"(altered|change[sd])\s+(mental|consciousness)",
    r"severe\s+(headache|abdominal\s+pain|chest\s+pain)",
    r"BP\s*\d{3}",  # systolic ≥100 in three digits could flag
]

# ── Vital signs extraction ────────────────────────────────────────────────────

_VITALS_PATTERNS = [
    (r"B\.?P\.?\s*(?:is\s*|of\s*|:?\s*)(\d{2,3}/\d{2,3})",     "BP",    "{} mmHg"),
    (r"(?:pulse|heart\s+rate|HR)\s*(?:is\s*|of\s*|:?\s*)(\d{2,3})",  "HR",    "{} bpm"),
    (r"(?:temp(?:erature)?)\s*(?:is\s*|of\s*|:?\s*)(\d{2,3}(?:\.\d)?)", "Temp",  "{}°C"),
    (r"(?:SpO2|oxygen\s+sat(?:uration)?)\s*(?:is\s*|of\s*|:?\s*)(\d{2,3}%?)", "SpO2", "{}"),
    (r"(?:RR|respiratory\s+rate)\s*(?:is\s*|of\s*|:?\s*)(\d{1,2})",  "RR",    "{} breaths/min"),
    (r"(?:weight)\s*(?:is\s*|of\s*|:?\s*)(\d{2,3}(?:\.\d)?\s*kg)",   "Wt",    "{}"),
    (r"(?:height)\s*(?:is\s*|of\s*|:?\s*)(\d{1,3}(?:\.\d)?\s*(?:cm|m))", "Ht", "{}"),
]

def _extract_vitals(text: str) -> str:
    found = []
    for pattern, label, fmt in _VITALS_PATTERNS:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            found.append(f"{label}: {fmt.format(m.group(1))}")
    return ", ".join(found) if found else ""


def _keyword_extract(text: str) -> tuple[list, list, list]:
    lower = text.lower()
    symptoms = [kw for kw in _SYMPTOM_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', lower)]
    meds = [kw.title() for kw in _MED_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', lower)]
    flags = []
    for pat in _RED_FLAG_PATTERNS:
        if re.search(pat, lower):
            m = re.search(pat, lower)
            flags.append(m.group(0).strip())
    return symptoms, meds, list(set(flags))


# ── LLM helpers ──────────────────────────────────────────────────────────────

def _ollama_available() -> bool:
    try:
        return len(ollama.list().get("models", [])) > 0
    except Exception:
        return False


def _best_model() -> str:
    """Prefer qwen2.5 > anything else > tinyllama fallback."""
    try:
        models = [m["name"] for m in ollama.list().get("models", [])]
        for preferred in ("qwen2.5:0.5b", "qwen2.5", "llama3.2", "mistral", "phi"):
            for m in models:
                if m.startswith(preferred):
                    return m
        return models[0] if models else OLLAMA_MODEL
    except Exception:
        return OLLAMA_MODEL


def _ask(prompt: str, max_tokens: int = 200) -> str:
    model = _best_model()
    response = ollama.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.1, "num_predict": max_tokens},
    )
    raw = response["message"]["content"].strip()
    return _clean(raw)


def _clean(text: str, is_list: bool = False) -> str:
    """Strip LLM preamble, markdown bold, and section-heading echoes."""
    # Strip markdown bold/italic
    text = re.sub(r"\*{1,2}(.+?)\*{1,2}", r"\1", text)
    text = re.sub(r"_{1,2}(.+?)_{1,2}", r"\1", text)

    lines = text.splitlines()
    cleaned = []
    skip_prefixes = (
        "subjective:", "objective:", "assessment:", "plan:", "chief complaint:",
        "summary:", "note:", "here is", "here's", "based on", "from the transcript",
        "transcript:", "medical scribe", "busy clinician",
    )
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if cleaned:
                break
            continue
        if any(stripped.lower().startswith(p) for p in skip_prefixes):
            continue
        cleaned.append(stripped)

    if is_list:
        # Keep each dash-item on its own line
        result = "\n".join(cleaned)
    else:
        result = " ".join(cleaned).strip()

    for stopper in ["Note:", "Disclaimer:", "This is a", "Please note"]:
        if stopper in result:
            result = result[: result.index(stopper)].strip()

    return result or text.strip()


# ── Public API ────────────────────────────────────────────────────────────────

def generate_soap_note(transcript: str) -> dict:
    if not transcript.strip():
        return _empty_note()

    symptoms, meds, red_flags = _keyword_extract(transcript)
    vitals_str = _extract_vitals(transcript)

    if not _ollama_available():
        return _rule_based_note(transcript, symptoms, meds, red_flags, vitals_str)

    chief   = _ask(CHIEF_COMPLAINT_PROMPT.format(transcript=transcript), 60)
    subj    = _ask(SUBJECTIVE_PROMPT.format(transcript=transcript),      250)
    obj_llm = _ask(OBJECTIVE_PROMPT.format(transcript=transcript),       150)
    assess  = _clean(_ask(ASSESSMENT_PROMPT.format(transcript=transcript), 120))
    plan    = _clean(_ask(PLAN_PROMPT.format(transcript=transcript),       200), is_list=True)

    # Objective: merge regex-extracted vitals with LLM findings
    if vitals_str and obj_llm and obj_llm.lower() != "documented by clinician.":
        objective = f"{vitals_str}. {obj_llm}"
    elif vitals_str:
        objective = vitals_str
    elif obj_llm:
        objective = obj_llm
    else:
        objective = "Documented by clinician."

    follow_ups = []
    if meds:
        follow_ups.append(f"Dispense: {', '.join(meds)}")
    follow_ups.append("Review results and adjust management as indicated.")

    return {
        "chief_complaint": chief,
        "soap": {
            "subjective":  subj    or "See full transcript.",
            "objective":   objective,
            "assessment":  assess  or "See full transcript.",
            "plan":        plan    or "As per doctor's instructions.",
        },
        "symptoms":              symptoms,
        "medications_mentioned": meds,
        "red_flags":             red_flags,
        "follow_up_actions":     follow_ups,
        "confidence_note":       f"Generated by {_best_model()} | Vitals via regex | Symptoms/Meds via keyword extraction.",
        "disclaimer":            DISCLAIMER,
    }


def generate_summary(transcript: str) -> str:
    if not transcript.strip():
        return "No transcript available."
    if not _ollama_available():
        words = transcript.split()
        return " ".join(words[:40]) + ("…" if len(words) > 40 else "")
    return _ask(SUMMARY_PROMPT.format(transcript=transcript), 120)


def _rule_based_note(transcript, symptoms, meds, red_flags, vitals_str):
    first_sentence = re.split(r"[.!?]", transcript.strip())[0][:200]
    return {
        "chief_complaint": first_sentence or "See full transcript.",
        "soap": {
            "subjective":  transcript[:600],
            "objective":   vitals_str or "Documented by clinician.",
            "assessment":  "Pending LLM — model not yet loaded.",
            "plan":        "Pending LLM — model not yet loaded.",
        },
        "medications_mentioned": meds,
        "symptoms":              symptoms,
        "red_flags":             red_flags,
        "follow_up_actions":     ["Review full transcript", "Apply clinical judgment"],
        "confidence_note":       "LLM unavailable. Keyword/regex extraction only.",
        "disclaimer":            DISCLAIMER,
    }


def _empty_note() -> dict:
    return {
        "chief_complaint": "No transcript provided.",
        "soap": {"subjective": "", "objective": "", "assessment": "", "plan": ""},
        "medications_mentioned": [],
        "symptoms":              [],
        "red_flags":             [],
        "follow_up_actions":     [],
        "confidence_note":       "Transcript was empty.",
        "disclaimer":            DISCLAIMER,
    }
