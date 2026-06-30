import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, FileSearch, ScanSearch, Brain, MessageSquareText, ShieldCheck, ListChecks, FileText, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useDocument } from "@/hooks/useDocumentContext";

const STAGES = [
  { label: "Reading document", icon: FileSearch },
  { label: "Detecting sensitive entities", icon: ScanSearch },
  { label: "Understanding context", icon: Brain },
  { label: "Generating explanations", icon: MessageSquareText },
  { label: "Running verification", icon: ShieldCheck },
  { label: "Preparing review", icon: ListChecks },
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
    <div className="container max-w-xl py-20 md:py-28">
      <div className="text-center mb-14">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Sanjaya is at work</h1>
        <p className="text-muted-foreground text-sm">Every step below is something you can verify afterward.</p>
      </div>

      <div className="relative pl-2">
        <div className="absolute left-[23px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-2">
          {STAGES.map((stage, idx) => {
            const isComplete = completedStages.includes(idx);
            const isActive = activeStage === idx && !isComplete;
            const Icon = stage.icon;

            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: idx <= activeStage ? 1 : 0.35, x: 0 }}
                transition={{ duration: 0.4 }}
                className="relative flex items-center gap-4 py-3"
              >
                <div
                  className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                    isComplete
                      ? "bg-success border-success text-white"
                      : isActive
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isComplete ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="h-5 w-5" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div key="spin">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    )}
                  </AnimatePresence>
                </div>
                <span className={`font-medium ${isComplete ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {stage.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
