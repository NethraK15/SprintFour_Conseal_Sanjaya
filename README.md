# Sanjaya

**"Don't Trust Us. Verify Us."**

Sanjaya is a trust platform that lets you review, challenge, and approve every AI decision before sharing a document with AI tools like ChatGPT. It combines explainable AI (every detection comes with a reason) and verifiable AI (you can challenge any decision in the AI Courtroom) to remove the anxiety of uploading confidential documents.

## Application Flow

Landing → Upload → Trust Replay → Review (with AI Courtroom) → Verification → Trust Passport → Export

## Tech Stack

**Frontend:** React, TypeScript, Vite, TailwindCSS, Radix UI primitives, Framer Motion, Lucide Icons, TanStack Query
**Backend:** FastAPI, Python, Pydantic
**Document Parsing:** PyMuPDF (PDF), python-docx (DOCX)
**AI:** Google Gemini API (optional — falls back to a realistic mock detection engine when no API key is configured)

## Project Structure

```
sanjaya/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app & routes
│   │   ├── schemas.py       # Pydantic models
│   │   ├── parsing.py       # PDF/DOCX/TXT text extraction
│   │   ├── detection.py     # Mock + Gemini detection engine
│   │   └── store.py         # In-memory document store
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/           # Landing, Upload, TrustReplay, Review, Verification, TrustPassportPage, ExportPage
│   │   ├── components/      # NavBar, HighlightedDocument, EntitySidePanel, AICourtroom, RedactionBackground, ui/
│   │   ├── hooks/           # useDocumentContext (shared app state)
│   │   ├── lib/             # api client, entity metadata, utils
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Installation & Setup

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

To enable real AI-powered detection, add your Gemini API key to `backend/.env`:

```
GEMINI_API_KEY=your_key_here
```

Get a key at aistudio.google.com/app/apikey. If you leave this blank, Sanjaya automatically uses a built-in, realistic mock detection engine — no key required to run the full app.

Run the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://127.0.0.1:5173`. The Vite dev server proxies all `/api` requests to the backend on port 8000, so both servers need to be running.

### 3. Use the app

1. Open `http://127.0.0.1:5173`
2. Click **"Witness the AI"**
3. Upload a PDF, DOCX, or TXT file containing some sample sensitive data (names, emails, phone numbers, addresses, PAN numbers, bank account numbers)
4. Watch the Trust Replay animation while Sanjaya detects sensitive entities
5. Review every highlighted item in the split-screen view — click any highlight to see the reasoning, or open the **AI Courtroom** to challenge a decision
6. Continue through Verification → Trust Passport → Export
7. Download your protected document, copy the text, or export a full JSON audit report

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check + whether Gemini is configured |
| POST | `/api/upload` | Upload and parse a document |
| POST | `/api/detect/{document_id}` | Run entity detection (Gemini or mock) |
| GET | `/api/document/{document_id}` | Get current document + entity state |
| POST | `/api/entity/decision` | Save a Keep Hidden / Reveal / Edit decision |
| POST | `/api/challenge` | Get the AI Courtroom explanation for an entity |
| POST | `/api/verify/{document_id}` | Run the final verification checklist |
| GET | `/api/passport/{document_id}` | Get the Trust Passport summary |
| GET | `/api/export/{document_id}/text` | Get the protected document text |
| GET | `/api/export/{document_id}/json` | Get the full JSON audit report |

## Notes

- This MVP intentionally has **no authentication** and **no enterprise dashboard** — it's scoped to deliver a single outstanding end-to-end document trust workflow.
- Document state is stored in-memory in the backend process for simplicity; restarting the backend clears all sessions.
- The mock detection engine uses regex-based heuristics tuned to feel realistic (confidence scores, contextual reasoning, risk explanations) — swap in your Gemini API key any time to switch to real AI-powered detection with zero code changes on the frontend.


