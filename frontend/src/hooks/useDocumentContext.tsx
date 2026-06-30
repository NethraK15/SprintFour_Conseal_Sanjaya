import React, { createContext, useContext, useState, useCallback } from "react";
import type { DetectedEntity } from "@/types";

interface DocumentContextValue {
  documentId: string | null;
  filename: string | null;
  rawText: string | null;
  aiPowered: boolean;
  entities: DetectedEntity[];
  setDocument: (data: { documentId: string; filename: string; rawText: string; aiPowered: boolean }) => void;
  setEntities: (entities: DetectedEntity[]) => void;
  updateEntityLocal: (entityId: string, decision: DetectedEntity["user_decision"], editedText?: string) => void;
  reviewAllEntities: () => void;
  reset: () => void;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [aiPowered, setAiPowered] = useState(false);
  const [entities, setEntitiesState] = useState<DetectedEntity[]>([]);

  const setDocument = useCallback(
    (data: { documentId: string; filename: string; rawText: string; aiPowered: boolean }) => {
      setDocumentId(data.documentId);
      setFilename(data.filename);
      setRawText(data.rawText);
      setAiPowered(data.aiPowered);
    },
    []
  );

  const setEntities = useCallback((next: DetectedEntity[]) => setEntitiesState(next), []);

  const updateEntityLocal = useCallback(
    (entityId: string, decision: DetectedEntity["user_decision"], editedText?: string) => {
      setEntitiesState((prev) =>
        prev.map((e) =>
          e.id === entityId
            ? { ...e, user_decision: decision, user_edited_text: editedText ?? e.user_edited_text }
            : e
        )
      );
    },
    []
  );

  const reviewAllEntities = useCallback(() => {
    setEntitiesState((prev) =>
      prev.map((e) => ({
        ...e,
        user_decision: e.user_decision || e.recommended_action || "KEEP_HIDDEN",
      }))
    );
  }, []);

  const reset = useCallback(() => {
    setDocumentId(null);
    setFilename(null);
    setRawText(null);
    setAiPowered(false);
    setEntitiesState([]);
  }, []);

  return (
    <DocumentContext.Provider
      value={{ documentId, filename, rawText, aiPowered, entities, setDocument, setEntities, updateEntityLocal, reviewAllEntities, reset }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocument must be used within DocumentProvider");
  return ctx;
}
