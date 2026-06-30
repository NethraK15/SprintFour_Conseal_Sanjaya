from typing import Dict, List, Optional
from .schemas import DetectedEntity


class DocumentRecord:
    def __init__(self, document_id: str, filename: str, raw_text: str, ai_powered: bool):
        self.document_id = document_id
        self.filename = filename
        self.raw_text = raw_text
        self.ai_powered = ai_powered
        self.entities: List[DetectedEntity] = []
        self.verified: bool = False


_STORE: Dict[str, DocumentRecord] = {}


def save_document(record: DocumentRecord) -> None:
    _STORE[record.document_id] = record


def get_document(document_id: str) -> Optional[DocumentRecord]:
    return _STORE.get(document_id)
