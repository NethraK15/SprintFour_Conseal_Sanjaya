import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocument } from "@/hooks/useDocumentContext";
import { api } from "@/lib/api";
import type { VerificationCheck } from "@/types";

export default function Verification() {
  const navigate = useNavigate();
  const { documentId } = useDocument();
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [documentSafe, setDocumentSafe] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) {
      navigate("/upload");
      return;
    }
    api
      .verify(documentId)
      .then((res) => {
        setChecks(res.checks);
        setDocumentSafe(res.document_safe);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [documentId, navigate]);

  useEffect(() => {
    if (checks.length === 0) return;
    if (revealedCount >= checks.length) return;
    const t = setTimeout(() => setRevealedCount((c) => c + 1), 600);
    return () => clearTimeout(t);
  }, [checks, revealedCount]);

  const finished = revealedCount >= checks.length && checks.length > 0;

  return (
    <div className="container max-w-xl py-20 md:py-28">
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Final verification</h1>
        <p className="text-muted-foreground text-sm">Sanjaya is double-checking everything before export.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {checks.map((check, idx) => {
            const revealed = idx < revealedCount;
            return (
              <motion.div
                key={check.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: revealed ? 1 : 0.3, x: 0 }}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm"
              >
                <div className="mt-0.5">
                  <AnimatePresence mode="wait">
                    {revealed ? (
                      check.passed ? (
                        <motion.div key="pass" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </motion.div>
                      ) : (
                        <motion.div key="fail" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Circle className="h-5 w-5 text-warning" />
                        </motion.div>
                      )
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <p className="font-medium text-sm">{check.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {finished && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-10 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
              <ShieldCheck className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">
              {documentSafe ? "Document Safe" : "Review needed before export"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {documentSafe
                ? "All checks passed. Your document is ready for its Trust Passport."
                : "Some entities still need your decision. Go back to Review to finish."}
            </p>
            <Button size="lg" onClick={() => navigate(documentSafe ? "/passport" : "/review")} className="group">
              {documentSafe ? "View Trust Passport" : "Back to Review"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
