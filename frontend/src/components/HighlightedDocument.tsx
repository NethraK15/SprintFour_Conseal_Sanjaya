import { Fragment } from "react";
import type { DetectedEntity } from "@/types";
import { ENTITY_COLORS } from "@/lib/entityMeta";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  entities: DetectedEntity[];
  mode: "original" | "protected";
  selectedId: string | null;
  onSelect: (entity: DetectedEntity) => void;
}

export default function HighlightedDocument({ text, entities, mode, selectedId, onSelect }: Props) {
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
    const showRevealedInProtected = mode === "protected" && decision === "REVEAL";
    const displayText =
      mode === "original"
        ? entity.text
        : showRevealedInProtected
        ? entity.text
        : decision === "EDIT" && entity.user_edited_text
        ? entity.user_edited_text
        : entity.placeholder;

    segments.push(
      <mark
        key={entity.id}
        onClick={() => onSelect(entity)}
        className={cn(
          "cursor-pointer rounded px-0.5 py-px border transition-all duration-200 font-medium",
          ENTITY_COLORS[entity.type],
          isSelected && "ring-2 ring-primary ring-offset-1",
          mode === "protected" && !showRevealedInProtected && "tracking-wider"
        )}
        title={`${entity.type} — click for details`}
      >
        {displayText}
      </mark>
    );

    cursor = entity.end;
  });

  if (cursor < text.length) {
    segments.push(<Fragment key="tail">{text.slice(cursor)}</Fragment>);
  }

  return <div className="whitespace-pre-wrap leading-relaxed text-[15px] font-mono">{segments}</div>;
}
