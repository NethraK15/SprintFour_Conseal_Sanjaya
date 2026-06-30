import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gavel, Loader2, ScrollText, GitCompareArrows, Scale } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { DetectedEntity, ChallengeResponse } from "@/types";
import { ENTITY_LABELS } from "@/lib/entityMeta";

interface Props {
  documentId: string;
  entity: DetectedEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecision: (decision: "KEEP_HIDDEN" | "REVEAL" | "EDIT") => void;
}

export default function AICourtroom({ documentId, entity, open, onOpenChange, onDecision }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ChallengeResponse | null>(null);

  useEffect(() => {
    if (open && entity) {
      setLoading(true);
      setData(null);
      api
        .challenge(documentId, entity.id)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [open, entity, documentId]);

  if (!entity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gavel className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>AI Courtroom</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Challenging classification of "{entity.text}"
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-7 pb-7">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Sanjaya is presenting its case…</p>
            </div>
          ) : (
            data && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Classification</p>
                    <p className="font-semibold">{ENTITY_LABELS[entity.type] ?? data.classification}</p>
                  </div>
                  <Badge variant={data.confidence >= 0.7 ? "default" : "warning"}>
                    {Math.round(data.confidence * 100)}% confidence
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <ScrollText className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Evidence used</h4>
                  </div>
                  <ul className="space-y-1.5">
                    {data.evidence.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <GitCompareArrows className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Alternatives considered</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.alternatives_considered.map((alt, i) => (
                      <Badge key={i} variant="outline">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Scale className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Final reasoning</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 rounded-xl p-4">
                    {data.decision_rationale}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    variant="success"
                    onClick={() => {
                      onDecision("KEEP_HIDDEN");
                      onOpenChange(false);
                    }}
                  >
                    Accept — Keep Hidden
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      onDecision("REVEAL");
                      onOpenChange(false);
                    }}
                  >
                    Reject — Reveal
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onDecision("EDIT");
                      onOpenChange(false);
                    }}
                  >
                    Modify
                  </Button>
                </div>
              </motion.div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
