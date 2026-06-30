import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Eye, EyeOff, Pencil, Gavel, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DetectedEntity } from "@/types";
import { ENTITY_LABELS, confidenceTone } from "@/lib/entityMeta";
import { useState } from "react";

interface Props {
  entity: DetectedEntity | null;
  onClose: () => void;
  onDecision: (entityId: string, decision: "KEEP_HIDDEN" | "REVEAL" | "EDIT", editedText?: string) => void;
  onChallenge: (entity: DetectedEntity) => void;
}

export default function EntitySidePanel({ entity, onClose, onDecision, onChallenge }: Props) {
  const [editValue, setEditValue] = useState("");
  const [editing, setEditing] = useState(false);

  if (!entity) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 text-muted-foreground">
        <Info className="h-8 w-8 mb-3 opacity-50" />
        <p className="text-sm">Click any highlighted item in the document to review Sanjaya's decision.</p>
      </div>
    );
  }

  const lowConfidence = entity.confidence < 0.7;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={entity.id}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="h-full flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/70 shrink-0">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Detected Type</p>
            <h3 className="font-semibold text-lg">{ENTITY_LABELS[entity.type]}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Confidence</span>
            <Badge variant={confidenceTone(entity.confidence) as any}>{Math.round(entity.confidence * 100)}%</Badge>
            {entity.user_decision && (
              <Badge variant="outline">{entity.user_decision.replace("_", " ").toLowerCase()}</Badge>
            )}
          </div>

          {lowConfidence && (
            <div className="flex items-start gap-2.5 rounded-xl bg-warning/10 text-warning-foreground px-4 py-3 text-sm border border-warning/20">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
              <span className="text-foreground/80">I am not fully confident. Please review manually.</span>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Reason</p>
            <p className="text-sm leading-relaxed">{entity.reason}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Context</p>
            <p className="text-sm leading-relaxed bg-muted/50 rounded-lg p-3 font-mono text-[13px]">{entity.context}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Potential Risk</p>
            <p className="text-sm leading-relaxed text-danger/90">{entity.potential_risk}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Recommended Action</p>
            <Badge variant="default">{entity.recommended_action.replace("_", " ")}</Badge>
          </div>

          {editing && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Replacement text</p>
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="e.g. [CLIENT NAME]"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          <Button variant="ghost" size="sm" className="w-full justify-center text-primary" onClick={() => onChallenge(entity)}>
            <Gavel className="h-3.5 w-3.5" />
            Challenge AI
          </Button>
        </div>

        <div className="px-6 py-5 border-t border-border/70 grid grid-cols-1 gap-2 shrink-0 bg-card">
          {editing ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onDecision(entity.id, "EDIT", editValue || entity.placeholder);
                  setEditing(false);
                }}
              >
                Save
              </Button>
            </div>
          ) : (
            <>
              <Button variant="success" onClick={() => onDecision(entity.id, "KEEP_HIDDEN")}>
                <EyeOff className="h-4 w-4" />
                Keep Hidden
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => onDecision(entity.id, "REVEAL")}>
                  <Eye className="h-4 w-4" />
                  Reveal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditValue(entity.user_edited_text || "");
                    setEditing(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
