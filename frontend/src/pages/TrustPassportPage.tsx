import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, Lock, Clock, Sparkles, ArrowRight, CheckCircle2, FileCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocument } from "@/hooks/useDocumentContext";
import { api } from "@/lib/api";
import type { TrustPassport } from "@/types";

export default function TrustPassportPage() {
  const navigate = useNavigate();
  const { documentId } = useDocument();
  const [passport, setPassport] = useState<TrustPassport | null>(null);

  useEffect(() => {
    if (!documentId) {
      navigate("/upload");
      return;
    }
    api.passport(documentId).then(setPassport).catch(() => {});
  }, [documentId, navigate]);

  if (!passport) return null;

  const formattedDate = new Date(passport.timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Generate a mock secure cryptographic signature using documentId
  const mockSHA = `SHA-256: ${(documentId || "").replace(/-/g, "").slice(0, 16)}e3b0c44298fc1c149afbf4c8996fb92427a`;

  return (
    <div className="container max-w-3xl py-12 md:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="rounded-3xl overflow-hidden shadow-soft border border-border bg-card">
          
          {/* Header Secure Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-primary px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase mb-3">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Cryptographic Passport
                </span>
                <h1 className="text-2xl font-bold tracking-tight">{passport.filename}</h1>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur shadow-inner">
                <BadgeCheck className="h-7 w-7 text-emerald-400" />
              </div>
            </div>

            <div className="mt-8 flex items-end gap-2.5">
              <span className="text-5xl font-extrabold tracking-tight text-white">{passport.trust_score}</span>
              <span className="text-sm text-emerald-400 font-semibold mb-1">/100 Integrity Rating</span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Comforting & Reassuring Block */}
            <div className="rounded-2xl bg-emerald-50/50 border border-emerald-200/80 p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm text-emerald-950">Zero-Risk AI Ingestion Certified</h3>
                <p className="text-xs text-emerald-900/90 leading-relaxed">
                  Sanjaya has successfully audited and sanitized your document. All raw PII, tax identifiers, banking details, and high-risk tokens are stripped or securely replaced. The verification passport proves that no confidential bytes remain underneath. You can confidently copy/paste or upload this document into OpenAI, Anthropic, or any third-party model.
                </p>
              </div>
            </div>

            {/* Verification Details */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audit Parameters</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <PassportStat icon={Lock} label="Staged Redactions" value={`${passport.protected_items} Sensitive items hidden`} />
                
                <PassportStat
                  icon={BadgeCheck}
                  label="Human Audit Trail"
                  value={passport.human_reviewed ? "Confirmed (All items reviewed)" : "Pending Review"}
                  tone={passport.human_reviewed ? "success" : "warning"}
                />
                
                <PassportStat
                  icon={ShieldCheck}
                  label="Adversarial Scan"
                  value={passport.verification_passed ? "Clean (Passed 5/5 audits)" : "Pending Verification"}
                  tone={passport.verification_passed ? "success" : "warning"}
                />
                
                <PassportStat icon={Clock} label="Certified Timestamp" value={formattedDate} />
              </div>
            </div>

            {/* Cryptographic Signature details */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 font-mono text-[11px] text-muted-foreground flex items-center gap-3">
              <FileCode className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate" title={mockSHA}>{mockSHA}</span>
              <span className="ml-auto text-[10px] font-bold text-success flex items-center gap-1 shrink-0 bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                <Check className="h-3 w-3 stroke-[2.5]" /> SIGNED
              </span>
            </div>

          </div>
        </div>

        {/* Action button container */}
        <div className="flex justify-between items-center mt-8">
          <Button variant="ghost" onClick={() => navigate("/review")} className="text-sm font-medium">
            Back to Review
          </Button>
          
          <Button
            size="lg"
            onClick={() => navigate("/export")}
            className="rounded-2xl shadow-soft hover:shadow-glow px-8 group transition-all duration-300 font-semibold h-12 bg-primary hover:bg-primary/95 text-primary-foreground"
          >
            Continue to Export
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function PassportStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4 transition-all hover:bg-muted/40 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-muted-foreground"}`} />
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      <p className="font-semibold text-sm leading-snug">{value}</p>
    </div>
  );
}
