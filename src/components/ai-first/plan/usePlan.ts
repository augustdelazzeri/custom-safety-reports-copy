"use client";

// State shared by the P3 variants: the AI proposes CAPAs with sub-tasks of different kinds
// (work order, Learn training, document revision, compliance calendar). Nothing is created
// until the person confirms the whole plan in one step.

import { useMemo, useState } from "react";
import { useAiFirst } from "@/contexts/AiFirstContext";
import type { Capa, PlanCapa, PlanTask, Report } from "@/lib/ai-first/types";
import { proposedPlan, ROOT_CAUSE, SEED_REPORT, seedCapaLog } from "@/lib/ai-first/sample-data";

export function usePlan(reportId: string | null) {
  const { reports, addCapa, addWorkOrders, updateReport, updateCapa: updateStoredCapa } = useAiFirst();
  const report: Report = reports.find((r) => r.id === reportId) ?? reports.find((r) => r.id === SEED_REPORT.id) ?? SEED_REPORT;

  const [rootCause, setRootCause] = useState(ROOT_CAUSE.text);
  const [rootCauseEdited, setRootCauseEdited] = useState(false);
  const [plan, setPlan] = useState<PlanCapa[]>(proposedPlan);
  const [created, setCreated] = useState<Capa[] | null>(null);

  const updateCapa = (id: string, patch: Partial<PlanCapa>) => setPlan((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const updateTask = (capaId: string, taskId: string, patch: Partial<PlanTask>) =>
    setPlan((p) => p.map((c) => (c.id === capaId ? { ...c, tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) } : c)));

  const selectedTasks = useMemo(() => plan.filter((c) => c.selected).flatMap((c) => c.tasks.filter((t) => t.selected)), [plan]);

  // Hierarchy of controls: warn when the plan relies only on training and paperwork.
  const onlyWeakControls = useMemo(() => {
    const kinds = selectedTasks.map((t) => t.kind);
    return kinds.length > 0 && kinds.every((k) => k === "training" || k === "document");
  }, [selectedTasks]);

  const create = () => {
    const out: Capa[] = [];
    plan
      .filter((c) => c.selected && c.tasks.some((t) => t.selected))
      .forEach((c, idx) => {
        const capa = addCapa({
          reportId: report.id,
          title: c.title,
          rootCause,
          controlLevel: c.controlLevel,
          tasks: c.tasks.filter((t) => t.selected),
          status: "open",
          day: 0,
          log: [],
        });
        const wos = addWorkOrders(
          c.tasks
            .filter((t) => t.selected && t.kind === "work_order")
            .map((t) => ({
              title: t.title,
              asset: t.title.includes("FL-07") ? "Forklift FL-07" : t.title.includes("fleet") ? "FL-01 to FL-09" : "Warehouse B › Aisle 4",
              location: report.location,
              priority: t.detail.includes("high") ? "high" : "medium",
              capaId: capa.id,
              source: `${report.id} → ${capa.id}`,
              status: "open",
            }))
        );
        const full: Capa = {
          ...capa,
          log: idx === 0 ? seedCapaLog(capa.id) : [],
          tasks: capa.tasks.map((t) => ({ ...t, detail: t.kind === "work_order" ? `${wos.find((w) => w.title === t.title)?.id ?? ""} · ${t.detail}` : t.detail })),
        };
        updateStoredCapa(capa.id, { log: full.log, tasks: full.tasks });
        out.push(full);
      });
    updateReport(report.id, { status: "plan_created" });
    setCreated(out);
    return out;
  };

  const counts = {
    capas: plan.filter((c) => c.selected && c.tasks.some((t) => t.selected)).length,
    tasks: selectedTasks.length,
    workOrders: selectedTasks.filter((t) => t.kind === "work_order").length,
  };

  return {
    report,
    rootCause,
    setRootCause: (v: string) => {
      setRootCause(v);
      setRootCauseEdited(v !== ROOT_CAUSE.text);
    },
    rootCauseEdited,
    plan,
    updateCapa,
    updateTask,
    onlyWeakControls,
    counts,
    create,
    created,
  };
}

export type PlanState = ReturnType<typeof usePlan>;
