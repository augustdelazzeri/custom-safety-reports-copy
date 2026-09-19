"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Star, CalendarClock, Plus, Bot, UserCog, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionDocType } from "@/contexts/ExecutionContext";
import { useDocumentExecution } from "@/hooks/useDocumentExecution";
import { CreateExecutionModal } from "@/components/execution/CreateExecutionModal";

interface Props {
  docType: ExecutionDocType;
  docId: string;
  docTitle: string;
}

// D2 — the document/checklist half on the left, the execution status half on the right.
export function SplitScreenVariant({ docType, docId, docTitle }: Props) {
  const {
    checklists,
    workItems,
    primaryChecklist,
    setPrimaryChecklist,
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

  return (
    <Card className="border-gray-200 rounded-2xl shadow-2xs overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Left half: the document's checklist */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-blue-600" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">This document's checklist</h4>
          </div>

          {checklists.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">Generating automatically…</p>
          ) : (
            <div className="space-y-2">
              {checklists.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    c.isPrimary ? "border-blue-200 bg-blue-50/50" : "border-gray-100 bg-gray-50/50"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {c.isPrimary && <Star className="size-3 text-blue-600 fill-blue-600 shrink-0" />}
                    <p className="text-xs font-bold text-gray-900">{c.name}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">{c.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0 h-4 rounded-md gap-1",
                        c.origin === "auto"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      )}
                    >
                      {c.origin === "auto" ? <Bot className="size-2.5" /> : <UserCog className="size-2.5" />}
                      {c.origin === "auto" ? "Auto-generated" : "Manual"}
                    </Badge>
                    {!c.isPrimary && (
                      <button
                        onClick={() => setPrimaryChecklist(c.id)}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        Make primary
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right half: execution */}
        <div className="p-6 space-y-4 bg-blue-50/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-blue-600" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Execution</h4>
            </div>
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
            <div className="py-6 text-center space-y-1">
              <ArrowRight className="size-4 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-900">Not scheduled yet</p>
              <p className="text-[11px] text-gray-400">Uses {primaryChecklist?.name ?? "the checklist"} on the left.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workItems.map((w) => (
                <div key={w.id} className="p-3 rounded-lg border border-gray-100 bg-white">
                  <p className="text-xs font-bold text-gray-900">
                    {w.workOrderNumber}: <span className="font-medium text-gray-600">{w.description}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold tracking-wider">
                    {w.kind === "pm" ? "Recurring (PM)" : "One-time (Work Order)"} · Due {w.dueDate}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
