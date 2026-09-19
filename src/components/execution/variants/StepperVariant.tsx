"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, FileText, ClipboardCheck, CalendarClock, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionDocType } from "@/contexts/ExecutionContext";
import { useDocumentExecution } from "@/hooks/useDocumentExecution";
import { CreateExecutionModal } from "@/components/execution/CreateExecutionModal";

interface Props {
  docType: ExecutionDocType;
  docId: string;
  docTitle: string;
}

// D3 — horizontal progress stepper: Document -> Checklist -> Execution.
export function StepperVariant({ docType, docId, docTitle }: Props) {
  const {
    checklists,
    workItems,
    isModalOpen,
    setIsModalOpen,
    description,
    setDescription,
    recurring,
    setRecurring,
    dueDate,
    setDueDate,
    openCreateModal,
    handleCreate,
  } = useDocumentExecution(docType, docId, docTitle);

  const [expanded, setExpanded] = useState<"checklist" | "execution" | null>(null);

  const checklistDone = checklists.length > 0;
  const executionDone = workItems.length > 0;

  const steps = [
    { key: "document", label: "Document created", icon: FileText, done: true },
    { key: "checklist", label: "Checklist generated", icon: ClipboardCheck, done: checklistDone },
    { key: "execution", label: "Execution scheduled", icon: CalendarClock, done: executionDone },
  ] as const;

  return (
    <Card className="border-gray-200 rounded-2xl shadow-2xs overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex items-center">
          {steps.map((step, i) => (
            <React.Fragment key={step.key}>
              <button
                onClick={() => step.key !== "document" && setExpanded(expanded === step.key ? null : (step.key as any))}
                disabled={step.key === "document"}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center border-2 transition-colors",
                    step.done
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400 group-hover:border-blue-300"
                  )}
                >
                  {step.done ? <Check className="size-4" /> : <step.icon className="size-4" />}
                </div>
                <span className={cn("text-[11px] font-bold", step.done ? "text-gray-900" : "text-gray-400")}>
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2 mb-6", steps[i + 1].done || step.done ? "bg-blue-300" : "bg-gray-200")} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {expanded === "checklist" && (
        <div className="border-t border-gray-100 p-6 space-y-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Checklist</h4>
            <ChevronDown className="size-4 text-gray-400 rotate-180" />
          </div>
          {checklists.map((c) => (
            <div key={c.id} className="p-3 rounded-lg border border-gray-200 bg-white">
              <p className="text-xs font-bold text-gray-900">{c.name}</p>
              <Badge className="mt-1 text-[9px] font-bold px-1.5 py-0 h-4 rounded-md bg-blue-50 text-blue-600 border-blue-100">
                {c.origin === "auto" ? "Auto-generated" : "Manual"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {expanded === "execution" && (
        <div className="border-t border-gray-100 p-6 space-y-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Work Order / PM</h4>
            <Button
              size="sm"
              onClick={openCreateModal}
              className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold gap-1"
            >
              <Plus className="size-3.5" />
              Create
            </Button>
          </div>
          {workItems.length === 0 ? (
            <p className="text-[11px] text-gray-400">Not scheduled yet.</p>
          ) : (
            workItems.map((w) => (
              <div key={w.id} className="p-3 rounded-lg border border-gray-200 bg-white">
                <p className="text-xs font-bold text-gray-900">
                  {w.workOrderNumber}: <span className="font-medium text-gray-600">{w.description}</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold tracking-wider">
                  {w.kind === "pm" ? "Recurring (PM)" : "One-time (Work Order)"} · Due {w.dueDate}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      <CreateExecutionModal
        docTitle={docTitle}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        description={description}
        onDescriptionChange={setDescription}
        recurring={recurring}
        onRecurringChange={setRecurring}
        dueDate={dueDate}
        onDueDateChange={setDueDate}
        onCreate={handleCreate}
      />
    </Card>
  );
}
