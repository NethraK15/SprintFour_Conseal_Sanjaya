import { Fragment, useState, useEffect } from "react";
import { Sparkles, HelpCircle } from "lucide-react";
import type { DetectedEntity } from "@/types";
import { ENTITY_COLORS } from "@/lib/entityMeta";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  text: string;
  entities: DetectedEntity[];
  mode: "original" | "protected";
  selectedId: string | null;
  onSelect: (entity: DetectedEntity) => void;
  onInterrogate?: (text: string) => void;
}

export default function HighlightedDocument({ text, entities, mode, selectedId, onSelect, onInterrogate }: Props) {
  const [popover, setPopover] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClear = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".interrogate-popover")) {
        setPopover(null);
      }
    };
    window.addEventListener("mousedown", handleClear);
    return () => window.removeEventListener("mousedown", handleClear);
  }, []);

  const handleMouseUp = (e: React.MouseEvent) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const selectedText = sel.toString().trim();
    if (selectedText.length > 1 && selectedText.length < 150) {
      setPopover({
        text: selectedText,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const sorted = [...entities].sort((a, b) => a.start - b.start);
  const segments: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((entity, idx) => {
    if (entity.start < cursor) return; // skip overlapping
    if (entity.start > cursor) {
      segments.push(<Fragment key={`gap-${idx}`}>{text.slice(cursor, entity.start)}</Fragment>);
    }

    const isSelected = entity.id === selectedId;
    const decision = entity.user_decision;

    const isRedacted = decision === "KEEP_HIDDEN" || 
      (decision === null && entity.recommended_action === "KEEP_HIDDEN");

    const isSafeHighlight = !isRedacted && (
      decision === "REVEAL" ||
      (decision === null && (entity.recommended_action === "REVEAL" || entity.type === "DATE" || entity.type === "ORGANIZATION"))
    );

    const isEdited = decision === "EDIT";

    const showRevealedInProtected = mode === "protected" && isSafeHighlight;
    const displayText =
      mode === "original"
        ? entity.text
        : showRevealedInProtected
        ? entity.text
        : isEdited && entity.user_edited_text
        ? entity.user_edited_text
        : entity.placeholder;

    let highlightClass = "";
    if (isRedacted) {
      if (mode === "protected") {
        highlightClass = "bg-rose-50 text-rose-700 border-rose-200 line-through decoration-rose-400/70 font-mono px-1 text-[13px] tracking-wide";
      } else {
        highlightClass = "bg-rose-100/90 text-rose-950 border-rose-300 hover:bg-rose-200/80";
      }
    } else if (isSafeHighlight) {
      highlightClass = "bg-emerald-50 text-emerald-950 border-emerald-300 underline decoration-emerald-600 decoration-dotted";
    } else if (isEdited) {
      highlightClass = "bg-purple-100 text-purple-950 border-purple-300 hover:bg-purple-200/80";
    } else {
      highlightClass = ENTITY_COLORS[entity.type];
    }

    segments.push(
      <mark
        key={entity.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(entity);
        }}
        className={cn(
          "cursor-pointer rounded px-0.5 py-px border transition-all duration-200 font-medium",
          highlightClass,
          isSelected && "ring-2 ring-primary ring-offset-1 shadow-sm",
          mode === "protected" && !showRevealedInProtected && "tracking-wider"
        )}
        title={isSafeHighlight ? `${entity.type} [Kept Visible — Safe Audit Highlight] — click why` : `${entity.type} — click for details`}
      >
        {displayText}
      </mark>
    );

    cursor = entity.end;
  });

  if (cursor < text.length) {
    segments.push(<Fragment key="tail">{text.slice(cursor)}</Fragment>);
  }

  return (
    <div onMouseUp={handleMouseUp} className="relative whitespace-pre-wrap leading-relaxed text-[15px] font-mono select-text">
      {segments}

      {popover && onInterrogate && (
        <div
          className="interrogate-popover fixed z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white shadow-2xl px-3.5 py-2 border border-slate-700 animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: Math.max(10, popover.y - 60),
            left: Math.max(10, Math.min(window.innerWidth - 340, popover.x - 140)),
          }}
        >
          <HelpCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-sans max-w-[130px] truncate text-slate-200">"{popover.text}"</span>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium border-0 shadow-sm"
            onClick={() => {
              onInterrogate(popover.text);
              setPopover(null);
            }}
          >
            Ask Sanjaya Why
          </Button>
          <button
            onClick={() => setPopover(null)}
            className="text-slate-400 hover:text-white ml-1 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
