import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, ShieldCheck, ArrowRight, FileSearch, Layers, MessageSquareText, Eye } from "lucide-react";
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
    <div className="container max-w-6xl py-14 md:py-20">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
          Adversarial Verification Suite
        </span>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Final verification</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Sanjaya is auditing files, hidden tags, and metadata before permitting export.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {checks.map((check, idx) => {
            const revealed = idx < revealedCount;
            const isComplete = revealed && check.passed;
            
            // Map index to clipart icon
            const Icon = 
              idx === 0 ? FileSearch :
              idx === 1 ? Layers :
              idx === 2 ? MessageSquareText :
              idx === 3 ? Eye :
              ShieldCheck;

            return (
              <motion.div
                key={check.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: revealed ? 1 : 0.35, y: 0 }}
                className={`relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                  isComplete
                    ? "bg-card border-success/40 shadow-soft"
                    : revealed && !check.passed
                    ? "bg-warning/5 border-warning/30"
                    : "bg-muted/20 border-border/60"
                }`}
              >
                <div className="absolute top-2.5 right-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  0{idx + 1}
                </div>

                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-3.5 transition-colors duration-500 ${
                    isComplete
                      ? "bg-success/15 text-success"
                      : revealed && !check.passed
                      ? "bg-warning/15 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {revealed ? (
                      check.passed ? (
                        <motion.div key="pass" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="h-6 w-6" />
                        </motion.div>
                      ) : (
                        <motion.div key="fail" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <AlertTriangle className="h-6 w-6" />
                        </motion.div>
                      )
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </AnimatePresence>
                </div>

                <span className={`font-semibold text-sm mb-1 ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                  {check.label}
                </span>
                <span className="text-[11px] text-muted-foreground leading-snug">
                  {check.detail}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center max-w-md mx-auto"
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-success/10 mb-4 shadow-soft">
              <ShieldCheck className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              {documentSafe ? "All Checks Passed Successfully" : "Review Needed"}
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              {documentSafe
                ? "Sanjaya has verified that this document is fully cleaned and safe to ingest into external LLMs. Generate your trust passport below."
                : "Some entities still need your decision. Go back to Review to finish."}
            </p>
            <Button
              size="lg"
              onClick={() => navigate(documentSafe ? "/passport" : "/review")}
              className="rounded-2xl shadow-soft hover:shadow-glow px-8 group transition-all duration-300 font-semibold h-12"
            >
              {documentSafe ? "View Trust Passport" : "Back to Review"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
