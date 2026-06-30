import type {
  DocumentUploadResponse,
  DetectionResponse,
  VerificationResponse,
  TrustPassport,
  ChallengeResponse,
  ActionType,
} from "@/types";

const BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Something went wrong.";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  health: () => fetch(`${BASE}/health`).then((r) => handle<{ status: string; ai_powered: boolean }>(r)),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${BASE}/upload`, { method: "POST", body: formData }).then((r) =>
      handle<DocumentUploadResponse>(r)
    );
  },

  detect: (documentId: string) =>
    fetch(`${BASE}/detect/${documentId}`, { method: "POST" }).then((r) => handle<DetectionResponse>(r)),

  getDocument: (documentId: string) =>
    fetch(`${BASE}/document/${documentId}`).then((r) => handle<DetectionResponse>(r)),

  updateDecision: (documentId: string, entityId: string, decision: ActionType, editedText?: string) =>
    fetch(`${BASE}/entity/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, entity_id: entityId, decision, edited_text: editedText }),
    }).then((r) => handle<{ success: boolean }>(r)),

  challenge: (documentId: string, entityId: string) =>
    fetch(`${BASE}/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, entity_id: entityId }),
    }).then((r) => handle<ChallengeResponse>(r)),

  verify: (documentId: string) =>
    fetch(`${BASE}/verify/${documentId}`, { method: "POST" }).then((r) => handle<VerificationResponse>(r)),

  passport: (documentId: string) =>
    fetch(`${BASE}/passport/${documentId}`).then((r) => handle<TrustPassport>(r)),

  exportText: (documentId: string) =>
    fetch(`${BASE}/export/${documentId}/text`).then((r) => handle<{ protected_text: string }>(r)),

  exportJsonUrl: (documentId: string) => `${BASE}/export/${documentId}/json`,
};
