import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ClipboardCopy, FileJson, CheckCircle2, Home } from "lucide-react";
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
    <div className="container max-w-3xl py-16 md:py-24">
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
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>This is exactly what will be exported.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-[13px] font-mono leading-relaxed bg-muted/40 rounded-xl p-4 max-h-72 overflow-y-auto">
              {protectedText}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          variant="secondary"
          asChild
          onClick={() => reset()}
        >
          <Link to="/">
            <Home className="h-4 w-4" />
            Protect Another Document
          </Link>
        </Button>
      </div>
    </div>
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
