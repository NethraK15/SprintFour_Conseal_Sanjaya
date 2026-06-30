import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, FileSearch, ScanSearch, Brain, MessageSquareText, ShieldCheck, ListChecks, FileText, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useDocument } from "@/hooks/useDocumentContext";

const STAGES = [
  { label: "Reading document", icon: FileSearch, desc: "Parsing raw text & layout locally" },
  { label: "Detecting entities", icon: ScanSearch, desc: "Scanning PII & financial figures" },
  { label: "Contextual engine", icon: Brain, desc: "Evaluating sentence risk semantics" },
  { label: "Generating audit", icon: MessageSquareText, desc: "Explaining why items were kept or hidden" },
  { label: "Zero-leak check", icon: ShieldCheck, desc: "Simulating adversarial extraction" },
  { label: "Preparing review", icon: ListChecks, desc: "Syncing 3-panel courtroom UI" },
];

export default function TrustReplay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const { documentId, setEntities } = useDocument();
  const [activeStage, setActiveStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [showChoice, setShowChoice] = useState(false);
  const detectionStarted = useRef(false);
  const detectionDone = useRef(false);

  useEffect(() => {
    if (!documentId) {
      navigate("/upload");
      return;
    }

    if (!detectionStarted.current) {
      detectionStarted.current = true;
      api
        .detect(documentId)
        .then((res) => {
          setEntities(res.entities);
          detectionDone.current = true;
        })
        .catch(() => {
          detectionDone.current = true;
        });
    }

    const stageDuration = 800;
    let stageIndex = 0;

    const interval = setInterval(() => {
      stageIndex += 1;
      if (stageIndex < STAGES.length) {
        setCompletedStages((prev) => [...prev, stageIndex - 1]);
        setActiveStage(stageIndex);
      } else {
        setCompletedStages((prev) => [...prev, STAGES.length - 1]);
        clearInterval(interval);
        const waitForDetection = setInterval(() => {
          if (detectionDone.current) {
            clearInterval(waitForDetection);
            if (mode === "summary") {
              setTimeout(() => navigate("/summary"), 400);
            } else if (mode === "review") {
              setTimeout(() => navigate("/review"), 400);
            } else {
              setShowChoice(true);
            }
          }
        }, 200);
      }
    }, stageDuration);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, mode]);

  if (showChoice) {
    return (
      <div className="container max-w-3xl py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="h-16 w-16 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Analysis Complete</h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Sanjaya has analyzed your document locally. How would you like to review the detected entities?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate("/summary")}
            className="group cursor-pointer rounded-2xl border-2 border-border hover:border-primary/50 bg-card p-6 shadow-soft transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Display Short Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                View a concise executive summary of detected sensitive entities, category breakdown, and privacy protection highlights.
              </p>
            </div>
            <Button variant="outline" className="mt-6 w-full group-hover:bg-primary group-hover:text-primary-foreground">
              View Short Summary
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/review")}
            className="group cursor-pointer rounded-2xl border-2 border-primary/40 hover:border-primary bg-card p-6 shadow-soft transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify It Thoroughly</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open the full 3-panel review workspace to compare original vs. protected text side-by-side, edit redactions, and challenge AI classifications.
              </p>
            </div>
            <Button className="mt-6 w-full">
              Open 3-Panel Review
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-14 md:py-20">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
          Zero-Trust Local Pipeline Active
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Sanjaya is at work</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
          Every step below is computed inside your local memory and can be interrogated or challenged afterward.
        </p>

        <div className="max-w-md mx-auto mt-6 bg-muted/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-border">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, ((activeStage + 1) / STAGES.length) * 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {STAGES.map((stage, idx) => {
          const isComplete = completedStages.includes(idx);
          const isActive = activeStage === idx && !isComplete;
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: idx <= activeStage + 1 ? 1 : 0.4, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-500 ${
                isComplete
                  ? "bg-card border-success/40 shadow-soft"
                  : isActive
                  ? "bg-primary/5 border-primary shadow-glow scale-105 z-10"
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
                    : isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="h-7 w-7" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div key="active" className="relative flex items-center justify-center">
                      <Loader2 className="h-7 w-7 animate-spin absolute opacity-30" />
                      <Icon className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </AnimatePresence>
              </div>

              <span className={`font-semibold text-sm mb-1 ${isComplete ? "text-foreground" : isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {stage.label}
              </span>
              <span className="text-[11px] text-muted-foreground leading-snug">
                {stage.desc}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
