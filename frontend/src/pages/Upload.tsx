import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useDocument } from "@/hooks/useDocumentContext";

const ACCEPTED = [".pdf", ".docx", ".txt"];

export default function Upload() {
  const navigate = useNavigate();
  const { setDocument } = useDocument();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedReady, setUploadedReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        setError("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
        return;
      }
      setError(null);
      setFileName(file.name);
      setUploading(true);
      try {
        const res = await api.upload(file);
        setDocument({
          documentId: res.document_id,
          filename: res.filename,
          rawText: res.raw_text,
          aiPowered: res.ai_powered,
        });
        setUploading(false);
        setUploadedReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
        setUploading(false);
      }
    },
    [setDocument]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (uploadedReady) {
    return (
      <div className="container max-w-3xl py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10"
        >
          <div className="h-16 w-16 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Document Uploaded</h1>
          <p className="text-muted-foreground">
            {fileName} is staged securely in your session. Choose how you want to review it:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate("/replay?mode=summary")}
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
              Display Short Summary
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/replay?mode=review")}
            className="group cursor-pointer rounded-2xl border-2 border-primary/40 hover:border-primary bg-card p-6 shadow-soft transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify It Thoroughly</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open the full 3-panel review workspace to inspect original vs. protected text side-by-side, edit redactions, and challenge AI decisions.
              </p>
            </div>
            <Button className="mt-6 w-full">
              Verify It Thoroughly
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">Upload your document</h1>
        <p className="text-muted-foreground">Nothing leaves your control until you approve every decision.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 ${
          dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-card"
        } shadow-soft`}
      >
        <label className="flex flex-col items-center justify-center gap-5 py-20 px-8 cursor-pointer">
          <input
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {uploading ? (
            <>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium">Securely reading {fileName}…</p>
                <p className="text-sm text-muted-foreground mt-1">This stays in your session only.</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UploadCloud className="h-7 w-7 text-primary" strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="font-medium text-lg">Drag & drop your document here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse — PDF, DOCX, or TXT</p>
              </div>
              <Button type="button" variant="secondary" className="mt-2">
                <FileText className="h-4 w-4" />
                Choose File
              </Button>
            </>
          )}
        </label>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-xl bg-danger/10 text-danger px-4 py-3 text-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <Lock className="h-3.5 w-3.5" />
        Your document is analyzed locally in this session and is never sent anywhere without your approval.
      </motion.div>
    </div>
  );
}
