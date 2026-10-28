"use client";

// Drag and drop for F1 and F2 (@dnd-kit/core): a document chip moves between the Required and Optional cells of
// its own row. Dropping an optional document on Required says "in my company this document is needed for this
// routine on this asset"; the screen saves it.

import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { CHIP } from "./bench-parts";

export type DropLevel = "required" | "optional";
const SEP = "|";

export function BenchDnd({ onMove, children }: { onMove: (assetId: string, type: string, level: DropLevel) => void; children: ReactNode }) {
  // A few pixels of movement before a drag starts, so the links and menus inside a chip still click.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [label, setLabel] = useState<string | null>(null);
  const end = (e: DragEndEvent) => {
    setLabel(null);
    if (!e.over) return;
    const [aid, type] = String(e.active.id).split(SEP);
    const [oid, level] = String(e.over.id).split(SEP);
    if (aid !== oid || (level !== "required" && level !== "optional")) return;
    onMove(aid, type, level);
  };
  return (
    <DndContext sensors={sensors} onDragStart={(e) => setLabel(String(e.active.data.current?.label ?? ""))} onDragEnd={end} onDragCancel={() => setLabel(null)}>
      {children}
      <DragOverlay dropAnimation={null}>{label ? <span className={cn(CHIP, "cursor-grabbing border-transparent bg-foreground text-background shadow-md")}>{label}</span> : null}</DragOverlay>
    </DndContext>
  );
}

/** A cell of the row that accepts a chip of that row. */
export function DropCell({ assetId, level, className, children }: { assetId: string; level: DropLevel; className?: string; children: ReactNode }) {
  const { setNodeRef, isOver, active } = useDroppable({ id: `${assetId}${SEP}${level}` });
  const mine = active ? String(active.id).split(SEP)[0] === assetId : false;
  return (
    <div ref={setNodeRef} className={cn("flex min-h-7 flex-wrap items-center gap-1.5 rounded-lg transition-colors", mine && "ring-1 ring-primary/30", isOver && mine && "bg-badge-accent ring-primary/60", className)}>
      {children}
    </div>
  );
}

/** Wraps a chip so it can be dragged. `label` is what the floating copy shows. */
export function DragChip({ assetId, type, label, disabled, children }: { assetId: string; type: string; label: string; disabled?: boolean; children: ReactNode }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: `${assetId}${SEP}${type}`, data: { label }, disabled });
  return (
    <span ref={setNodeRef} {...attributes} {...listeners} tabIndex={-1} role="presentation" className={cn("max-w-full touch-none", !disabled && "cursor-grab", isDragging && "opacity-40")}>
      {children}
    </span>
  );
}
