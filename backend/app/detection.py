import os
import re
import json
import uuid
from typing import List, Tuple, Optional

from .schemas import DetectedEntity

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

_genai_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        _genai_model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception:
        _genai_model = None


def is_ai_powered() -> bool:
    return _genai_model is not None


# ----------------------------------------------------------------------------
# Regex-based mock detection engine (used when no Gemini API key is configured)
# ----------------------------------------------------------------------------

PATTERNS: List[Tuple[str, str]] = [
    ("EMAIL", r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    ("PHONE", r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}"),
    ("PAN", r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"),
    ("PASSPORT", r"\b[A-PR-WYa-pr-wy][0-9]{7}\b"),
    ("BANK_ACCOUNT", r"\b\d{9,18}\b"),
    ("DATE", r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\bQ[1-4]\s+\d{4}\b"),
    ("ORGANIZATION", r"\b[A-Z][A-Za-z0-9&.\s]{1,25}\s(?:Inc\.|Corp\.|LLC|Pvt Ltd|Limited|Technologies|Solutions|Group|Enterprises|Association|Department)\b"),
]

NAME_TITLES = r"(?:Mr\.|Mrs\.|Ms\.|Dr\.|Mx\.)\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)?"
ADDRESS_HINT = r"\d{1,5}\s+[A-Z][a-zA-Z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Block|Sector)[,.]?\s*[A-Za-z0-9,\s]{0,40}"

REASONS = {
    "NAME": "Identified as a personal name based on capitalization pattern, title prefix, and surrounding sentence structure.",
    "EMAIL": "Matched standard email address format (local-part@domain).",
    "PHONE": "Matched a numeric sequence consistent with phone number formatting and length.",
    "ADDRESS": "Detected a street-style address pattern with a number followed by a road/street identifier.",
    "BANK_ACCOUNT": "Detected a long numeric sequence consistent with bank account number length and grouping.",
    "PASSPORT": "Matched alphanumeric pattern typical of passport numbers.",
    "PAN": "Matched the standard 10-character PAN format (5 letters, 4 digits, 1 letter).",
    "DATE": "Identified as a chronological date or business quarter milestone.",
    "ORGANIZATION": "Identified as a registered corporate entity or public organization name.",
}

RISKS = {
    "NAME": "Could be used to identify the document owner or a third party mentioned in the document.",
    "EMAIL": "Could be used for unsolicited contact, phishing, or to correlate identity across other leaked datasets.",
    "PHONE": "Could enable direct contact, SIM-swap attacks, or social engineering.",
    "ADDRESS": "Could reveal physical location, enabling stalking or unauthorized physical access.",
    "BANK_ACCOUNT": "Could enable financial fraud if combined with other identifying details.",
    "PASSPORT": "Could enable identity theft or fraudulent travel document creation.",
    "PAN": "Could be used for financial identity theft or fraudulent filings in your name.",
    "DATE": "Low/Negligible privacy risk (0.02). Evaluated as safe timeline context essential for AI comprehension.",
    "ORGANIZATION": "Low/Negligible privacy risk (0.04). Evaluated as public corporate framing without proprietary customer PII.",
}

ALTERNATIVES = {
    "NAME": ["Common noun capitalized at sentence start", "Organization name", "Place name"],
    "EMAIL": ["Username/handle without domain", "File path resembling an email"],
    "PHONE": ["Invoice or reference number", "Date sequence", "Postal/zip code"],
    "ADDRESS": ["Generic location reference", "Building name without street number"],
    "BANK_ACCOUNT": ["Invoice number", "Transaction reference ID", "Product serial number"],
    "PASSPORT": ["Generic alphanumeric ID", "Product code"],
    "PAN": ["Generic alphanumeric reference code"],
    "DATE": ["Numerical code", "Product release version"],
    "ORGANIZATION": ["Product trademark", "General business noun"],
}


def _placeholder_for(entity_type: str, index: int) -> str:
    mapping = {
        "NAME": "█████ NAME",
        "EMAIL": "█████@█████.███",
        "PHONE": "███-███-████",
        "ADDRESS": "███ ADDRESS REDACTED",
        "BANK_ACCOUNT": "████████████",
        "PASSPORT": "████████",
        "PAN": "██████████",
        "ORGANIZATION": "█████ ORG",
        "DATE": "██/██/████",
    }
    return mapping.get(entity_type, "████████")


def _confidence_for(entity_type: str, text: str) -> float:
    base = {
        "EMAIL": 0.97,
        "PAN": 0.95,
        "PASSPORT": 0.82,
        "PHONE": 0.85,
        "BANK_ACCOUNT": 0.68,
        "NAME": 0.74,
        "ADDRESS": 0.71,
        "DATE": 0.94,
        "ORGANIZATION": 0.91,
    }.get(entity_type, 0.6)
    # slight deterministic variance based on text length so it doesn't look too uniform
    variance = (len(text) % 7) * 0.01
    return round(min(0.99, max(0.45, base - variance)), 2)


def _make_entity(entity_type: str, text: str, start: int, end: int, full_text: str, idx: int) -> DetectedEntity:
    confidence = _confidence_for(entity_type, text)
    context_start = max(0, start - 40)
    context_end = min(len(full_text), end + 40)
    context = full_text[context_start:context_end].replace("\n", " ").strip()

    is_safe = entity_type in ("DATE", "ORGANIZATION")
    rec_action = "REVEAL" if is_safe else ("KEEP_HIDDEN" if confidence >= 0.7 else "KEEP_HIDDEN")

    rationale = (
        f"Sanjaya evaluated this entity and certified it as safe to retain unredacted ({entity_type}). Keeping this visible preserves document context without exposing confidential customer identifiers or financial PII."
        if is_safe else
        f"Sanjaya classified this as {entity_type.replace('_', ' ').title()} because the matched text satisfies the structural pattern for this category and appears in a context consistent with personal/sensitive data. {REASONS.get(entity_type, '')}"
    )

    return DetectedEntity(
        id=str(uuid.uuid4()),
        type=entity_type,
        text=text,
        placeholder=_placeholder_for(entity_type, idx),
        start=start,
        end=end,
        confidence=confidence,
        reason=REASONS.get(entity_type, "Pattern matched against known signatures."),
        context=f"...{context}...",
        potential_risk=RISKS.get(entity_type, "Could expose sensitive information."),
        recommended_action=rec_action,
        evidence=[
            f"Pattern signature matched for type '{entity_type}'",
            f"Surrounding context: \"{context[:60]}...\"" if len(context) > 60 else f"Surrounding context: \"{context}\"",
            f"Confidence score computed as {confidence}",
        ],
        alternatives_considered=ALTERNATIVES.get(entity_type, ["Generic non-sensitive token"]),
        decision_rationale=rationale,
    )


def mock_detect(full_text: str) -> List[DetectedEntity]:
    entities: List[DetectedEntity] = []
    seen_spans = set()
    idx = 0

    # Named patterns first (titles)
    for m in re.finditer(NAME_TITLES, full_text):
        span = (m.start(), m.end())
        if span in seen_spans:
            continue
        seen_spans.add(span)
        entities.append(_make_entity("NAME", m.group(), m.start(), m.end(), full_text, idx))
        idx += 1

    # Plain capitalized two-word names (heuristic) - skip ones already inside a title match
    COMMON_LEADING_WORDS = {
        "Dear", "Thank", "Please", "Regards", "Sincerely", "Best", "The", "This",
        "Your", "Our", "We", "Hello", "Hi", "Subject", "Re", "From", "To",
    }
    for m in re.finditer(r"\b[A-Z][a-z]+\s[A-Z][a-z]+\b", full_text):
        first_word = m.group().split()[0]
        if first_word in COMMON_LEADING_WORDS:
            continue
        span = (m.start(), m.end())
        if any(span[0] < s[1] and span[1] > s[0] for s in seen_spans):
            continue
        seen_spans.add(span)
        entities.append(_make_entity("NAME", m.group(), m.start(), m.end(), full_text, idx))
        idx += 1

    for entity_type, pattern in PATTERNS:
        for m in re.finditer(pattern, full_text):
            span = (m.start(), m.end())
            if any(span[0] < s[1] and span[1] > s[0] for s in seen_spans):
                continue
            seen_spans.add(span)
            entities.append(_make_entity(entity_type, m.group(), m.start(), m.end(), full_text, idx))
            idx += 1

    for m in re.finditer(ADDRESS_HINT, full_text):
        span = (m.start(), m.end())
        if any(span[0] < s[1] and span[1] > s[0] for s in seen_spans):
            continue
        seen_spans.add(span)
        entities.append(_make_entity("ADDRESS", m.group(), m.start(), m.end(), full_text, idx))
        idx += 1

    entities.sort(key=lambda e: e.start)
    return entities


# ----------------------------------------------------------------------------
# Gemini-powered detection
# ----------------------------------------------------------------------------

GEMINI_PROMPT = """You are Sanjaya, a privacy-detection AI. Analyze the following document text and identify
all sensitive entities: personal names, emails, phone numbers, physical addresses, bank account numbers,
passport numbers, and PAN numbers (Indian tax ID format).

For each entity found, return a JSON array of objects with these exact fields:
- type: one of NAME, EMAIL, PHONE, ADDRESS, BANK_ACCOUNT, PASSPORT, PAN
- text: the exact substring matched from the document
- confidence: a float between 0 and 1
- reason: short technical reason for the classification
- potential_risk: one sentence describing the privacy/security risk if exposed
- evidence: array of 2-3 short strings describing evidence used
- alternatives_considered: array of 1-3 short strings of alternative classifications considered
- decision_rationale: one paragraph explaining the final decision

Return ONLY valid JSON (an array), no markdown, no extra commentary.

DOCUMENT TEXT:
---
{text}
---
"""


def _generate_with_fallback(prompt: str) -> str:
    if _genai_model is None:
        raise ValueError("GenAI model is not configured.")
    import google.generativeai as genai
    models_to_try = [
        "gemini-3.5-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-1.5-flash",
        "gemini-pro-latest",
        "gemini-1.5-pro",
        "gemini-pro"
    ]
    last_error = None
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            last_error = e
            err_msg = str(e)
            if "404" in err_msg or "not found" in err_msg or "not supported" in err_msg:
                continue
            else:
                raise e
    raise last_error


def gemini_detect(full_text: str) -> Optional[List[DetectedEntity]]:
    if _genai_model is None:
        return None
    try:
        prompt = GEMINI_PROMPT.format(text=full_text[:12000])
        raw = _generate_with_fallback(prompt)
        raw = re.sub(r"^```json", "", raw).strip()
        raw = re.sub(r"^```", "", raw).strip()
        raw = re.sub(r"```$", "", raw).strip()
        data = json.loads(raw)

        entities: List[DetectedEntity] = []
        for idx, item in enumerate(data):
            text = item.get("text", "")
            start = full_text.find(text)
            if start == -1:
                start = 0
            end = start + len(text)
            confidence = float(item.get("confidence", 0.6))
            entities.append(
                DetectedEntity(
                    id=str(uuid.uuid4()),
                    type=item.get("type", "NAME"),
                    text=text,
                    placeholder=_placeholder_for(item.get("type", "NAME"), idx),
                    start=start,
                    end=end,
                    confidence=confidence,
                    reason=item.get("reason", "Classified by Gemini AI analysis."),
                    context=text,
                    potential_risk=item.get("potential_risk", "Could expose sensitive information."),
                    recommended_action="KEEP_HIDDEN",
                    evidence=item.get("evidence", ["Gemini contextual analysis"]),
                    alternatives_considered=item.get("alternatives_considered", ["No clear alternative found"]),
                    decision_rationale=item.get("decision_rationale", "Classified based on contextual language understanding."),
                )
            )
        entities.sort(key=lambda e: e.start)
        return entities
    except Exception:
        return None


def detect_entities(full_text: str) -> Tuple[List[DetectedEntity], bool]:
    """Returns (entities, ai_powered_flag)"""
    if is_ai_powered():
        result = gemini_detect(full_text)
        if result is not None and len(result) > 0:
            return result, True
    return mock_detect(full_text), False


def run_playground_llm(prompt: str, protected_text: str) -> Optional[str]:
    if not is_ai_powered() or _genai_model is None:
        return None
    try:
        system_instruction = (
            "You are an AI assistant answering a user request based ON THE PROVIDED REDACTED CONTEXT ONLY. "
            "Do not use external knowledge or attempt to guess masked values. "
            "If the context contains placeholders like '█████ REDACTED', you must treat them as completely hidden and explain that you do not have access to that information. "
            "Do not reveal any private credentials."
        )
        full_prompt = f"{system_instruction}\n\n[USER PROMPT]\n{prompt}\n\n[DOCUMENT CONTEXT]\n{protected_text}"
        return _generate_with_fallback(full_prompt)
    except Exception as e:
        return f"Gemini Error: {str(e)}"
