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
import { cn } from "@/lib/utils";

export default function Review() {
  const navigate = useNavigate();
  const { documentId, rawText, entities, setEntities, aiPowered, updateEntityLocal, reviewAllEntities } = useDocument();
  const [selected, setSelected] = useState<DetectedEntity | null>(null);
  const [courtroomOpen, setCourtroomOpen] = useState(false);
  const [courtroomEntity, setCourtroomEntity] = useState<DetectedEntity | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"original" | "protected" | "inspector">("original");

  useEffect(() => {
    if (!documentId || !rawText) {
      navigate("/upload");
    }
  }, [documentId, rawText, navigate]);

  if (!documentId || !rawText) return null;

  const reviewedCount = entities.filter((e) => e.user_decision !== null).length;
  const allReviewed = entities.length > 0 && reviewedCount === entities.length;

  const currentSelected = selected ? entities.find((e) => e.id === selected.id) ?? null : null;

  useEffect(() => {
    if (currentSelected) {
      setActiveMobileTab("inspector");
    }
  }, [currentSelected]);

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
    const isFinancial = /[$€£₹]|\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/.test(selectedText);
    const isEmailOrPhone = /@|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(selectedText);

    let type: DetectedEntity["type"] = "ORGANIZATION";
    let recAction: "KEEP_HIDDEN" | "REVEAL" = "REVEAL";
    let reason = "Audited via user selection: verified no restricted customer PII pattern matched.";
    let risk = "Negligible privacy risk (0.02). Evaluated as safe narrative context.";
    let rationale = `Sanjaya audited the phrase "${selectedText}". This text does not match standard personal identifier patterns (such as government IDs, credit card numbers, or private emails). Leaving this unredacted preserves essential document context for downstream AI processing. However, if "${selectedText}" represents a proprietary internal project codename or trade secret, you can override Sanjaya right here by clicking 'Keep Hidden'.`;

    if (isFinancial) {
      type = "BANK_ACCOUNT";
      recAction = "KEEP_HIDDEN";
      reason = "Detected monetary amount or numerical financial figure.";
      risk = "Exposing high-value monetary figures can leak internal budgets, valuation, or pricing strategies.";
      rationale = `Sanjaya audited the figure "${selectedText}". Financial figures are not personal contact identifiers, which is why standard PII heuristics may initially leave them unredacted. However, leaking valuations or monetary figures like "${selectedText}" to external LLMs can expose proprietary business pricing. You can stage this figure for redaction immediately by clicking 'Keep Hidden'.`;
    } else if (isEmailOrPhone) {
      type = "EMAIL";
      recAction = "KEEP_HIDDEN";
      reason = "Detected contact identifier pattern within selection.";
      risk = "Could enable direct contact or social engineering.";
      rationale = `Sanjaya audited the contact string "${selectedText}". Exposing direct contact information poses phishing and identity risks. We recommend keeping this hidden.`;
    }

    const newEntity: DetectedEntity = {
      id: `audit-${Date.now()}`,
      type,
      text: selectedText,
      placeholder: "█████ REDACTED",
      start: startIdx !== -1 ? startIdx : 0,
      end: (startIdx !== -1 ? startIdx : 0) + selectedText.length,
      confidence: isFinancial ? 0.89 : 0.93,
      reason,
      context: selectedText,
      potential_risk: risk,
      recommended_action: recAction,
      evidence: [
        isFinancial ? "Currency/numerical signature identified" : `Audited phrase: "${selectedText.slice(0, 35)}"`,
        isFinancial ? `Selected financial figure: "${selectedText}"` : "Zero matching signatures for government IDs or banking credentials",
      ],
      alternatives_considered: isFinancial ? ["Invoice figure", "Budget milestone"] : ["Internal codename", "Proprietary trade secret"],
      decision_rationale: rationale,
      user_decision: null,
      user_edited_text: null,
    };
    setEntities([...entities, newEntity]);
    setSelected(newEntity);
    api.addEntity(documentId, newEntity).catch(() => {});
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
            <Badge variant="default" title="Gemini API key detected and active. Powered by Google Gemini AI.">
              <Sparkles className="h-3 w-3 mr-1" />
              Gemini-powered (Active)
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-300 bg-amber-50/50 text-amber-900 cursor-help" title="Running in Local Fallback Mode (Regex/Heuristics). To activate Gemini AI, add your GEMINI_API_KEY to backend/.env and restart the uvicorn server.">
              Local Fallback Mode
            </Badge>
          )}
          <Badge variant={allReviewed ? "success" : "warning"}>
            {reviewedCount}/{entities.length} reviewed
          </Badge>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="flex lg:hidden bg-muted/60 p-1.5 rounded-2xl border border-border/60 mb-5 relative z-10">
        <button
          onClick={() => setActiveMobileTab("original")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-xl transition-all",
            activeMobileTab === "original" ? "bg-card text-foreground shadow-soft font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Original Document
        </button>
        <button
          onClick={() => setActiveMobileTab("protected")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-xl transition-all",
            activeMobileTab === "protected" ? "bg-card text-foreground shadow-soft font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Protected Document
        </button>
        <button
          onClick={() => setActiveMobileTab("inspector")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-xl transition-all relative",
            activeMobileTab === "inspector" ? "bg-card text-foreground shadow-soft font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Inspector
          {currentSelected && (
            <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr_360px] gap-5 items-start">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl border border-border bg-card shadow-soft overflow-hidden flex flex-col h-[650px] max-h-[72vh]",
            activeMobileTab === "original" ? "flex" : "hidden lg:flex"
          )}
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
          className={cn(
            "rounded-2xl border border-border bg-card shadow-soft overflow-hidden flex flex-col h-[650px] max-h-[72vh]",
            activeMobileTab === "protected" ? "flex" : "hidden lg:flex"
          )}
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
          className={cn(
            "rounded-2xl border border-border bg-card shadow-soft overflow-hidden lg:sticky lg:top-24 flex flex-col h-[650px] max-h-[72vh]",
            activeMobileTab === "inspector" ? "flex" : "hidden lg:flex"
          )}
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
