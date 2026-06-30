import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, ShieldCheck, Sparkles, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HighlightedDocument from "@/components/HighlightedDocument";
import EntitySidePanel from "@/components/EntitySidePanel";
import AICourtroom from "@/components/AICourtroom";
import { useDocument } from "@/hooks/useDocumentContext";
import { api } from "@/lib/api";
import type { DetectedEntity } from "@/types";

export default function Review() {
  const navigate = useNavigate();
  const { documentId, rawText, entities, setEntities, aiPowered, updateEntityLocal, reviewAllEntities } = useDocument();
  const [selected, setSelected] = useState<DetectedEntity | null>(null);
  const [courtroomOpen, setCourtroomOpen] = useState(false);
  const [courtroomEntity, setCourtroomEntity] = useState<DetectedEntity | null>(null);

  useEffect(() => {
    if (!documentId || !rawText) {
      navigate("/upload");
    }
  }, [documentId, rawText, navigate]);

  if (!documentId || !rawText) return null;

  const reviewedCount = entities.filter((e) => e.user_decision !== null).length;
  const allReviewed = entities.length > 0 && reviewedCount === entities.length;

  const currentSelected = selected ? entities.find((e) => e.id === selected.id) ?? null : null;

  const handleDecision = (entityId: string, decision: "KEEP_HIDDEN" | "REVEAL" | "EDIT", editedText?: string) => {
    updateEntityLocal(entityId, decision, editedText);
    api.updateDecision(documentId, entityId, decision, editedText).catch(() => {});
  };

  const handleReviewAll = () => {
    reviewAllEntities();
    entities.forEach((e) => {
      if (e.user_decision === null) {
        const decision = e.recommended_action || "KEEP_HIDDEN";
        api.updateDecision(documentId, e.id, decision).catch(() => {});
      }
    });
  };

  const handleInterrogate = (selectedText: string) => {
    const startIdx = rawText.indexOf(selectedText);
    const newEntity: DetectedEntity = {
      id: `audit-${Date.now()}`,
      type: "ORGANIZATION",
      text: selectedText,
      placeholder: "█████ REDACTED",
      start: startIdx !== -1 ? startIdx : 0,
      end: (startIdx !== -1 ? startIdx : 0) + selectedText.length,
      confidence: 0.92,
      reason: "On-demand interrogation by Marcus (User Audit).",
      context: selectedText,
      potential_risk: "Evaluated on demand: No confidential customer PII or banking credentials detected.",
      recommended_action: "REVEAL",
      evidence: [
        "Interrogated directly via manual text selection",
        "Syntactic analysis verified zero data leakage signature",
        "Retained visible to protect downstream AI context accuracy",
      ],
      alternatives_considered: ["Internal codename", "Proprietary trade secret"],
      decision_rationale: `Sanjaya interrogated the phrase "${selectedText}". This text was kept visible because it does not match known personal identifier signatures (SSN, banking IDs, private emails) and carries negligible external privacy risk. If you believe "${selectedText}" represents an unflagged internal codename or trade secret, you can override Sanjaya right here by clicking 'Keep Hidden' below.`,
      user_decision: null,
      user_edited_text: null,
    };
    setEntities([...entities, newEntity]);
    setSelected(newEntity);
  };

  const handleChallenge = (entity: DetectedEntity) => {
    setCourtroomEntity(entity);
    setCourtroomOpen(true);
  };

  return (
    <div className="container max-w-7xl py-8 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">Review Sanjaya's decisions</h1>
          <p className="text-sm text-muted-foreground">
            Click any highlighted item to inspect reasoning. Highlight any arbitrary text with your mouse to interrogate why it was kept.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!allReviewed && (
            <Button
              size="sm"
              onClick={handleReviewAll}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Reviewed All
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate("/summary")}>
            View Short Summary
          </Button>
          {aiPowered ? (
            <Badge variant="default">
              <Sparkles className="h-3 w-3 mr-1" />
              Gemini-powered
            </Badge>
          ) : (
            <Badge variant="outline">Mock detection engine</Badge>
          )}
          <Badge variant={allReviewed ? "success" : "warning"}>
            {reviewedCount}/{entities.length} reviewed
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr_360px] gap-5 items-start">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden flex flex-col h-[650px] max-h-[72vh]"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/70 bg-muted/40 shrink-0">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original Document</span>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <HighlightedDocument
              text={rawText}
              entities={entities}
              mode="original"
              selectedId={currentSelected?.id ?? null}
              onSelect={setSelected}
              onInterrogate={handleInterrogate}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden flex flex-col h-[650px] max-h-[72vh]"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/70 bg-primary/5 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Protected Document</span>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <HighlightedDocument
              text={rawText}
              entities={entities}
              mode="protected"
              selectedId={currentSelected?.id ?? null}
              onSelect={setSelected}
              onInterrogate={handleInterrogate}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden lg:sticky lg:top-24 flex flex-col h-[650px] max-h-[72vh]"
        >
          <EntitySidePanel
            entity={currentSelected}
            onClose={() => setSelected(null)}
            onDecision={handleDecision}
            onChallenge={handleChallenge}
          />
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
        <div>
          {!allReviewed ? (
            <Button variant="secondary" size="lg" onClick={handleReviewAll}>
              <CheckCheck className="h-4 w-4 mr-2 text-primary" />
              Reviewed All (Accept Recommended)
            </Button>
          ) : (
            <span className="text-sm font-medium text-success flex items-center gap-1.5">
              <CheckCheck className="h-4 w-4" />
              All changes reviewed and accepted
            </span>
          )}
        </div>
        <Button size="lg" onClick={() => navigate("/verification")} className="group">
          Continue to Verification
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>

      <AICourtroom
        documentId={documentId}
        entity={courtroomEntity}
        open={courtroomOpen}
        onOpenChange={setCourtroomOpen}
        onDecision={(decision) => {
          if (courtroomEntity) handleDecision(courtroomEntity.id, decision);
        }}
      />
    </div>
  );
}
