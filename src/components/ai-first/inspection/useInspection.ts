"use client";

// State shared by the P7 variants. The AI pre-answers what it can see; the inspector confirms
// every item (an inspection is an attestation, so there is no "confirm all").

import { useState } from "react";
import { useAiFirst } from "@/contexts/AiFirstContext";
import { INSPECTION_ITEMS, INSPECTION_TEMPLATE, type InspectionAnswer, type InspectionItem } from "@/lib/ai-first/sample-data";
import type { WorkOrder } from "@/lib/ai-first/types";

export interface ItemState {
  item: InspectionItem;
  revealed: boolean; // the AI has looked at this item (B reveals one by one)
  answer?: InspectionAnswer; // confirmed by the person
  changed?: boolean; // the person disagreed with the AI
}

export function useInspection(revealAll = true) {
  const { addWorkOrders } = useAiFirst();
  const [items, setItems] = useState<ItemState[]>(INSPECTION_ITEMS.map((item) => ({ item, revealed: revealAll })));
  const [sheetFor, setSheetFor] = useState<string | null>(null);
  const [actions, setActions] = useState<Record<string, { kind: "wo" | "capa"; id: string }>>({});
  const [submitted, setSubmitted] = useState(false);

  const reveal = (id: string) => setItems((list) => list.map((s) => (s.item.id === id ? { ...s, revealed: true } : s)));
  const revealEverything = () => setItems((list) => list.map((s) => ({ ...s, revealed: true })));

  const confirm = (id: string, answer: InspectionAnswer) => {
    setItems((list) => list.map((s) => (s.item.id === id ? { ...s, answer, changed: s.item.ai !== answer && s.item.ai !== "unseen" } : s)));
    if (answer === "fail" && !actions[id]) setSheetFor(id);
  };

  const createWorkOrder = (id: string) => {
    const it = INSPECTION_ITEMS.find((i) => i.id === id)!;
    const [wo] = addWorkOrders([
      {
        title: `Fix: ${it.text.toLowerCase()}`,
        asset: id === "q6" ? "Rack upright 4B" : id === "q7" ? "Dock edge guard rail" : "Forklift bay",
        location: INSPECTION_TEMPLATE.location,
        priority: id === "q7" ? "high" : "medium",
        source: `Inspection ${INSPECTION_TEMPLATE.name} · item ${id}`,
        status: "open",
      } satisfies Omit<WorkOrder, "id" | "createdAt">,
    ]);
    setActions((a) => ({ ...a, [id]: { kind: "wo", id: wo.id } }));
    setSheetFor(null);
  };

  const createCapa = (id: string) => {
    setActions((a) => ({ ...a, [id]: { kind: "capa", id: "CAPA draft" } }));
    setSheetFor(null);
  };

  const confirmed = items.filter((s) => s.answer).length;
  const fails = items.filter((s) => s.answer === "fail").length;
  const answered = items.filter((s) => s.answer && s.answer !== "na");
  const score = answered.length ? Math.round((answered.filter((s) => s.answer === "pass").length / answered.length) * 100) : 0;

  return {
    items,
    reveal,
    revealEverything,
    confirm,
    sheetFor,
    setSheetFor,
    actions,
    createWorkOrder,
    createCapa,
    confirmed,
    fails,
    score,
    total: items.length,
    submitted,
    submit: () => setSubmitted(true),
  };
}

export type InspectionState = ReturnType<typeof useInspection>;
