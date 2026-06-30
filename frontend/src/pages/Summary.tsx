import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, FileText, ArrowRight, ScanSearch, CheckCircle2, EyeOff, Layers, ListFilter, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocument } from "@/hooks/useDocumentContext";
import { ENTITY_LABELS } from "@/lib/entityMeta";
import { api } from "@/lib/api";

export default function Summary() {
  const navigate = useNavigate();
  const { documentId, filename, rawText, entities, aiPowered, reviewAllEntities } = useDocument();

  useEffect(() => {
    if (!documentId || !rawText) {
      navigate("/upload");
    }
  }, [documentId, rawText, navigate]);

  if (!documentId || !rawText) return null;

  const handleReviewAllAndContinue = () => {
    reviewAllEntities();
    entities.forEach((e) => {
      if (e.user_decision === null) {
        const decision = e.recommended_action || "KEEP_HIDDEN";
        api.updateDecision(documentId, e.id, decision).catch(() => {});
      }
    });
    navigate("/verification");
  };

  // Group entities by type
  const typeCounts = entities.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const totalEntities = entities.length;
  const highRiskCount = entities.filter(
    (e) => e.confidence >= 0.8 || e.type === "BANK_ACCOUNT" || e.type === "PAN" || e.type === "PASSPORT" || e.type === "EMAIL"
  ).length;

  return (
    <div className="container max-w-5xl py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              Executive Briefing
            </Badge>
            {aiPowered ? (
              <Badge variant="default" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Gemini-powered
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Local Detection Engine
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Privacy Summary Report</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {filename || "Uploaded Document"} ({rawText.length.toLocaleString()} characters)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/review")}>
            <Layers className="h-4 w-4 mr-2" />
            Open 3-Panel Thorough Review
          </Button>
          <Button onClick={handleReviewAllAndContinue} className="group bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            <CheckCheck className="h-4 w-4 mr-2" />
            Reviewed All & Continue
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Detected</span>
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ScanSearch className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold">{totalEntities}</p>
          <p className="text-xs text-muted-foreground mt-1.5">Sensitive entities flagged for protection</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">High Risk Items</span>
            <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
              <EyeOff className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold">{highRiskCount}</p>
          <p className="text-xs text-muted-foreground mt-1.5">Identifiers requiring immediate masking</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacy Status</span>
            <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-success">Protected Locally</p>
          <p className="text-xs text-muted-foreground mt-1.5">Zero data leaks without your consent</p>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-soft mb-8"
      >
        <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-primary" />
          Entity Category Breakdown
        </h2>

        {totalEntities === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="font-medium">No sensitive entities detected in this document.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className="rounded-xl bg-muted/40 border border-border/60 p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-muted-foreground mb-2">
                  {(ENTITY_LABELS as Record<string, string>)[type] || type}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">{count}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {Math.round((count / totalEntities) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Key Findings List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <h2 className="font-semibold">Detected Highlights</h2>
          <span className="text-xs text-muted-foreground">Showing top detected sensitive sections</span>
        </div>
        <div className="divide-y divide-border/60 max-h-[400px] overflow-y-auto">
          {entities.slice(0, 8).map((entity) => (
            <div key={entity.id} className="p-5 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{(ENTITY_LABELS as Record<string, string>)[entity.type] || entity.type}</Badge>
                  <span className="text-xs text-muted-foreground">Confidence: {Math.round(entity.confidence * 100)}%</span>
                </div>
                <p className="text-sm font-medium text-foreground">{entity.reason}</p>
              </div>
              <Badge variant="success" className="shrink-0">
                <EyeOff className="h-3 w-3 mr-1" />
                Staged Hidden
              </Badge>
            </div>
          ))}
          {entities.length > 8 && (
            <div className="p-4 text-center text-xs text-muted-foreground bg-muted/10">
              +{entities.length - 8} more entities protected. Switch to Thorough Review to inspect all.
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer Banner */}
      <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-primary mb-1">Want side-by-side inspection and challenge capabilities?</h3>
          <p className="text-sm text-muted-foreground">
            Switch to the 3-panel review workspace to compare original text, edit redactions, and challenge AI classifications in court.
          </p>
        </div>
        <Button size="lg" onClick={() => navigate("/review")} className="shrink-0">
          Verify It Thoroughly
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
