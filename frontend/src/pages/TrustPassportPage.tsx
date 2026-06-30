import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, Lock, Clock, Sparkles, ArrowRight } from "lucide-react";
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

  return (
    <div className="container max-w-2xl py-16 md:py-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="rounded-3xl overflow-hidden shadow-glow border border-primary/10">
          <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/70 mb-1">Document Trust Passport</p>
                <h1 className="text-2xl font-semibold tracking-tight">{passport.filename}</h1>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-8 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-tight">{passport.trust_score}</span>
              <span className="text-lg text-white/70 mb-1">/100 Trust Score</span>
            </div>
          </div>

          <div className="bg-card p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <PassportStat icon={Lock} label="Protected Items" value={String(passport.protected_items)} />
              <PassportStat
                icon={BadgeCheck}
                label="Human Reviewed"
                value={passport.human_reviewed ? "Yes" : "Pending"}
                tone={passport.human_reviewed ? "success" : "warning"}
              />
              <PassportStat
                icon={ShieldCheck}
                label="Verification"
                value={passport.verification_passed ? "Passed" : "Pending"}
                tone={passport.verification_passed ? "success" : "warning"}
              />
              <PassportStat icon={Clock} label="Timestamp" value={formattedDate} small />
            </div>

            <div
              className={`rounded-2xl px-5 py-4 flex items-center gap-3 ${
                passport.ready_for_ai ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              }`}
            >
              <Sparkles className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  {passport.ready_for_ai ? "Ready for AI" : "Not yet ready"}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {passport.ready_for_ai
                    ? "Share with Confidence — this document has been explained and verified."
                    : "Complete verification before sharing this document with AI tools."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button size="lg" onClick={() => navigate("/export")} className="group">
            Continue to Export
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
  small,
}: {
  icon: any;
  label: string;
  value: string;
  tone?: "success" | "warning";
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`h-3.5 w-3.5 ${tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`font-semibold ${small ? "text-sm" : "text-base"}`}>{value}</p>
    </div>
  );
}
