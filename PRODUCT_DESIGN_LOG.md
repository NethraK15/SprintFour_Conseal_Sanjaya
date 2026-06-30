# Product Design & Engineering Prioritization Log

This writeup details the core features built to address Marcus's trust anxiety, and outlines the intentional engineering decisions regarding what was excluded from the MVP.

---

## 🚀 What We Built: The Sanjaya Trust Engine

To take a skeptical user like Marcus from anxious to confident, I designed a transparent privacy workflow that replaces faith with verification.

1. **"Safe / Kept Visible" Audit Highlights (Green Dotted Underlines)**
   We realized Marcus is just as nervous about what the tool *didn't* hide. We added Emerald Green dotted highlights to chronological dates (`DATE`) and corporate names (`ORGANIZATION`). These remain visible in both Original and Protected views, allowing Marcus to click and read exactly why they carry negligible leakage risk.
2. **Interactive Selection Interrogation ("Ask Sanjaya Why")**
   We gave Marcus the power to challenge any word or phrase in the document. Highlighting any text triggers a floating popover. Clicking **Ask Sanjaya Why** dynamically audits the text in real-time (detecting financial figures like `$45,000,000` or contact details) and loads the rationale into the inspector panel with a 1-click **Keep Hidden** override.
3. **The Adversarial Test Playground & Prompt Simulator**
   Built directly into the export workspace, this panel gives Marcus visual proof of safety. He can select or type custom prompts to see:
   * The exact outgoing system instructions and sanitized document payload sent to the API.
   * A simulated live response from external LLMs (e.g. Gemini 3.5 Flash) verifying that the model cannot access redacted wire account numbers or emails.

4. **Dynamic Model Fallback Queue**
   To guarantee high uptime, we integrated a fallback model chain (`gemini-3.5-flash` ➔ `gemini-2.5-flash` ➔ `gemini-2.0-flash` ➔ local rule heuristics) so API operations succeed even if specific endpoints are deprecated or unavailable.

---

## 🚫 What We Chose NOT to Build (and Why)

In engineering a zero-trust application, what you exclude is as critical as what you include. We made the following deliberate exclusions:

1. **Persistent Cloud Databases (e.g. PostgreSQL, MongoDB)**
   * *Why:* Marcus's biggest fear is that "redacted" documents leave data trails on server disks. We chose to store all documents strictly in-memory (`backend/app/store.py`). When Marcus logs out or the server restarts, all data is permanently purged. There is no physical disk database for hackers to breach.
2. **Persistent S3 Cloud File Buckets**
   * *Why:* We chose *not* to write uploaded files to cloud storage. Files are parsed on-the-fly in local memory and immediately discarded. Keeping document processing in RAM matches the zero-retention guarantee.
3. **Multi-Agent Conversational Legal Loops in Courtroom**
   * *Why:* We avoided complex agentic chat logic for the "Cross-Examine AI Witness" modal. Instead, we structured the AI Courtroom as a deterministic, inspectable fact sheet (Evidence, Alternatives, Decision Rationale). This keeps response latencies near-instant, prevents prompt injection vulnerabilities, and ensures Marcus gets clear, predictable answers rather than conversational AI hallucinations.
