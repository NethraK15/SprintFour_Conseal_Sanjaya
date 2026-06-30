from pydantic import BaseModel
from typing import List, Optional, Literal


EntityType = Literal[
    "NAME",
    "EMAIL",
    "PHONE",
    "ADDRESS",
    "BANK_ACCOUNT",
    "PASSPORT",
    "PAN",
    "DATE",
    "ORGANIZATION",
]

ActionType = Literal["KEEP_HIDDEN", "REVEAL", "EDIT"]


class DetectedEntity(BaseModel):
    id: str
    type: EntityType
    text: str
    placeholder: str
    start: int
    end: int
    confidence: float
    reason: str
    context: str
    potential_risk: str
    recommended_action: ActionType
    evidence: List[str]
    alternatives_considered: List[str]
    decision_rationale: str
    user_decision: Optional[ActionType] = None
    user_edited_text: Optional[str] = None


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    raw_text: str
    char_count: int
    ai_powered: bool


class DetectionResponse(BaseModel):
    document_id: str
    entities: List[DetectedEntity]
    ai_powered: bool


class EntityDecisionUpdate(BaseModel):
    document_id: str
    entity_id: str
    decision: ActionType
    edited_text: Optional[str] = None


class VerificationCheck(BaseModel):
    label: str
    passed: bool
    detail: str


class VerificationResponse(BaseModel):
    document_id: str
    checks: List[VerificationCheck]
    document_safe: bool


class TrustPassport(BaseModel):
    document_id: str
    filename: str
    protected_items: int
    human_reviewed: bool
    verification_passed: bool
    trust_score: int
    timestamp: str
    ready_for_ai: bool


class ChallengeRequest(BaseModel):
    document_id: str
    entity_id: str


class ChallengeResponse(BaseModel):
    entity_id: str
    classification: str
    evidence: List[str]
    alternatives_considered: List[str]
    decision_rationale: str
    confidence: float
