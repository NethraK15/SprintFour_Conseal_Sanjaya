export type EntityType =
  | "NAME"
  | "EMAIL"
  | "PHONE"
  | "ADDRESS"
  | "BANK_ACCOUNT"
  | "PASSPORT"
  | "PAN"
  | "DATE"
  | "ORGANIZATION";

export type ActionType = "KEEP_HIDDEN" | "REVEAL" | "EDIT";

export interface DetectedEntity {
  id: string;
  type: EntityType;
  text: string;
  placeholder: string;
  start: number;
  end: number;
  confidence: number;
  reason: string;
  context: string;
  potential_risk: string;
  recommended_action: ActionType;
  evidence: string[];
  alternatives_considered: string[];
  decision_rationale: string;
  user_decision: ActionType | null;
  user_edited_text: string | null;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  raw_text: string;
  char_count: number;
  ai_powered: boolean;
}

export interface DetectionResponse {
  document_id: string;
  entities: DetectedEntity[];
  ai_powered: boolean;
}

export interface VerificationCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface VerificationResponse {
  document_id: string;
  checks: VerificationCheck[];
  document_safe: boolean;
}

export interface TrustPassport {
  document_id: string;
  filename: string;
  protected_items: number;
  human_reviewed: boolean;
  verification_passed: boolean;
  trust_score: number;
  timestamp: string;
  ready_for_ai: boolean;
}

export interface ChallengeResponse {
  entity_id: string;
  classification: string;
  evidence: string[];
  alternatives_considered: string[];
  decision_rationale: string;
  confidence: number;
}
