"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CalendarClock, Plus, Check, ChevronDown, ChevronUp, Star, Bot, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionDocType } from "@/contexts/ExecutionContext";
import { useDocumentExecution } from "@/hooks/useDocumentExecution";
import { CreateExecutionModal } from "@/components/execution/CreateExecutionModal";

interface Props {
  docType: ExecutionDocType;
  docId: string;
  docTitle: string;
}

// D-bonus — a slim single-row status strip that expands on demand, minimal visual weight.
export function CompactBarVariant({ docType, docId, docTitle }: Props) {
  const {
    checklists,
    workItems,
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

  const [isExpanded, setIsExpanded] = useState(false);
  const checklistDone = checklists.length > 0;
  const executionDone = workItems.length > 0;

  return (
    <Card className="border-gray-200 rounded-xl shadow-2xs overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4 text-xs font-bold">
          <span
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
              checklistDone ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
            )}
          >
            {checklistDone ? <Check className="size-3" /> : <ClipboardCheck className="size-3" />}
            Checklist {checklistDone ? `ready (${checklists.length})` : "pending"}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
              executionDone ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
            )}
          >
            {executionDone ? <Check className="size-3" /> : <CalendarClock className="size-3" />}
            {executionDone ? `${workItems.length} scheduled` : "Not scheduled"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!executionDone && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal();
              }}
              className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold gap-1"
            >
              <Plus className="size-3.5" />
              Create WO/PM
            </Button>
          )}
          {isExpanded ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/30">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Checklists</h4>
            {checklists.map((c) => (
              <div key={c.id} className="p-2.5 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  {c.isPrimary && <Star className="size-3 text-blue-600 fill-blue-600 shrink-0" />}
                  <span className="text-xs font-bold text-gray-900 truncate">{c.name}</span>
                  {c.origin === "auto" ? <Bot className="size-3 text-gray-300 shrink-0" /> : <UserCog className="size-3 text-gray-300 shrink-0" />}
                </div>
                {!c.isPrimary && (
                  <button onClick={() => setPrimaryChecklist(c.id)} className="text-[10px] font-bold text-blue-600 hover:underline shrink-0">
                    Set primary
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work Orders / PMs</h4>
            {workItems.length === 0 ? (
              <p className="text-[11px] text-gray-400">None yet.</p>
            ) : (
              workItems.map((w) => (
                <div key={w.id} className="p-2.5 rounded-lg border border-gray-200 bg-white">
                  <p className="text-xs font-bold text-gray-900">{w.workOrderNumber}: {w.description}</p>
                  <Badge variant="outline" className="mt-1 text-[9px]">{w.kind === "pm" ? "Recurring" : "One-time"}</Badge>
                </div>
              ))
            )}
          </div>
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
