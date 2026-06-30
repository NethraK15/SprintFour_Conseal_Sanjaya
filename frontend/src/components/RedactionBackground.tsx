import { motion } from "framer-motion";

const ROWS = [
  { original: "John Doe", redacted: "██████", type: "Name" },
  { original: "alice.k@company.com", redacted: "█████████████", type: "Email" },
  { original: "+1 (555) 219-4471", redacted: "███████████", type: "Phone" },
  { original: "221B Baker Street", redacted: "███████████", type: "Address" },
];

export default function RedactionBackground() {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl glass shadow-soft overflow-hidden">
      <div className="flex items-center gap-1.5 px-5 py-3 border-b border-border/60">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
        <span className="ml-3 text-xs text-muted-foreground font-medium">document_preview.txt</span>
      </div>
      <div className="p-6 space-y-5 font-mono text-sm">
        {ROWS.map((row, i) => (
          <div key={row.type} className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground w-16 shrink-0">{row.type}</span>
            <div className="flex-1 flex items-center justify-end relative h-5">
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 1, 0, 0, 1] }}
                transition={{ duration: 5, delay: i * 0.4, repeat: Infinity, times: [0, 0.4, 0.45, 0.95, 1] }}
                className="text-foreground/80 absolute right-0"
              >
                {row.original}
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 1, 0] }}
                transition={{ duration: 5, delay: i * 0.4, repeat: Infinity, times: [0, 0.4, 0.45, 0.95, 1] }}
                className="text-primary tracking-widest absolute right-0"
              >
                {row.redacted}
              </motion.span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
