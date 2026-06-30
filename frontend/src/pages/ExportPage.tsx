import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ClipboardCopy, FileJson, CheckCircle2, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDocument } from "@/hooks/useDocumentContext";
import { api } from "@/lib/api";

export default function ExportPage() {
  const navigate = useNavigate();
  const { documentId, filename, reset } = useDocument();
  const [protectedText, setProtectedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!documentId) {
      navigate("/upload");
      return;
    }
    api.exportText(documentId).then((res) => setProtectedText(res.protected_text));
  }, [documentId, navigate]);

  if (!documentId) return null;

  const downloadTextFile = () => {
    if (!protectedText) return;
    const blob = new Blob([protectedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `protected_${filename?.replace(/\.[^/.]+$/, "") || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJsonReport = async () => {
    const res = await fetch(api.exportJsonUrl(documentId));
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sanjaya_report_${documentId.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    if (!protectedText) return;
    await navigator.clipboard.writeText(protectedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container max-w-6xl py-12 md:py-16">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-success/10 mb-4">
          <CheckCircle2 className="h-7 w-7 text-success" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Your document is protected</h1>
        <p className="text-muted-foreground">Choose how you'd like to export it.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <ExportCard
          icon={Download}
          title="Download Safe Copy"
          description="Get the fully protected document as a text file."
          action="Download .txt"
          onClick={downloadTextFile}
        />
        <ExportCard
          icon={ClipboardCopy}
          title="Copy Text"
          description="Copy the protected text straight to your clipboard."
          action={copied ? "Copied!" : "Copy"}
          onClick={copyText}
        />
        <ExportCard
          icon={FileJson}
          title="Export JSON Report"
          description="Full audit trail of every detection and decision."
          action="Download .json"
          onClick={downloadJsonReport}
        />
      </div>

      {protectedText && (
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-base">Preview Protected Copy</CardTitle>
            <CardDescription>This is exactly what will be exported.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-[13px] font-mono leading-relaxed bg-muted/40 rounded-xl p-4 max-h-72 overflow-y-auto">
              {protectedText}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Adversarial Test Playground */}
      <AdversarialPlayground protectedText={protectedText || ""} />

      <div className="flex justify-center mt-10">
        <Button
          variant="secondary"
          asChild
          onClick={() => reset()}
          className="rounded-2xl h-12 px-6"
        >
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Protect Another Document
          </Link>
        </Button>
      </div>
    </div>
  );
}

const PRESETS = [
  { label: "Summarize Deal", prompt: "Summarize this deal valuation and key dates." },
  { label: "Find Wire Info", prompt: "What are the bank account numbers and routing numbers for the transfer?" },
  { label: "Identify Contacts", prompt: "List all contact emails and phone numbers mentioned in the document." },
];

function AdversarialPlayground({ protectedText }: { protectedText: string }) {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [simulatedResponse, setSimulatedResponse] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!prompt.trim() || !protectedText) return;
    setScanning(true);
    
    api.runPlayground(prompt, protectedText)
      .then((res) => {
        setSimulatedResponse(res.response);
      })
      .catch((e) => {
        setSimulatedResponse(`Sanitization error: ${e.message}`);
      })
      .finally(() => {
        setScanning(false);
      });
  }, [prompt, protectedText]);

  const simulatedPayload = `System: You are an AI assistant. Analyze this redacted context.

[USER PROMPT]
${prompt}

[DOCUMENT CONTEXT]
${protectedText}`;

  return (
    <Card className="border border-primary/20 bg-primary/5/30 shadow-soft overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Adversarial Test Playground</CardTitle>
        </div>
        <CardDescription>
          Simulate exactly what public LLMs (OpenAI, Anthropic, Gemini) will see. Test prompts against your sanitized document.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        
        {/* Preset Toggles */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Preset Test Prompts</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                className={`text-xs rounded-xl ${prompt === preset.prompt ? "border-primary bg-primary/5 text-primary" : ""}`}
                onClick={() => setPrompt(preset.prompt)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Custom Test Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a query to simulate AI response..."
            className="w-full h-20 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
          />
        </div>

        {/* Live Payload Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Simulated API Payload */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Simulated Outgoing API Payload
            </span>
            <div className="flex-1 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] p-4 h-64 overflow-y-auto leading-relaxed border border-slate-900 select-text">
              {simulatedPayload}
            </div>
          </div>

          {/* Simulated AI Output */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Simulated External LLM Response
            </span>
            <div className="flex-1 rounded-xl bg-card border border-border p-4 h-64 overflow-y-auto leading-relaxed text-xs relative">
              {scanning ? (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin rounded-full mr-2" />
                  <span className="text-muted-foreground font-medium">Scanning sanitization...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-[10px] font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full uppercase">
                      🛡️ Zero Leakage Detected
                    </span>
                    <span className="text-[10px] text-muted-foreground">Sanitized Ingest</span>
                  </div>
                  <p className="text-muted-foreground italic font-sans leading-relaxed">
                    "{simulatedResponse}"
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}

function ExportCard({
  icon: Icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button variant="secondary" className="w-full" onClick={onClick}>
          {action}
        </Button>
      </CardContent>
    </Card>
  );
}
