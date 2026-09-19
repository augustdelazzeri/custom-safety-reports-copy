"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Star, Wrench, CalendarClock, Plus, Bot, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionDocType } from "@/contexts/ExecutionContext";
import { useDocumentExecution } from "@/hooks/useDocumentExecution";
import { CreateExecutionModal } from "@/components/execution/CreateExecutionModal";

interface DocumentExecutionBlockProps {
  docType: ExecutionDocType;
  docId: string;
  docTitle: string;
}

export function DocumentExecutionBlock({ docType, docId, docTitle }: DocumentExecutionBlockProps) {
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
    <Card className="border-blue-100 bg-gradient-to-b from-blue-50/40 to-white rounded-2xl shadow-2xs overflow-hidden">
      <div className="px-6 pt-5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Wrench className="size-3.5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Execution</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-400">
          What needs to happen to actually run this {docType.toUpperCase()}
        </span>
      </div>

      <div className="p-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Checklist quadrant */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 text-blue-600" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Checklist</h4>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              {checklists.length} {checklists.length === 1 ? "item" : "items"}
            </Badge>
          </div>

          {checklists.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">Generating automatically…</p>
          ) : (
            <div className="space-y-2">
              {checklists.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "p-3 rounded-lg border flex items-start justify-between gap-2",
                    c.isPrimary ? "border-blue-200 bg-blue-50/50" : "border-gray-100 bg-gray-50/50"
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {c.isPrimary && <Star className="size-3 text-blue-600 fill-blue-600 shrink-0" />}
                      <p className="text-xs font-bold text-gray-900 truncate">{c.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
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
                      {c.isPrimary && (
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Primary</span>
                      )}
                    </div>
                  </div>
                  {!c.isPrimary && (
                    <button
                      onClick={() => setPrimaryChecklist(c.id)}
                      className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
                    >
                      Make primary
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work order / PM quadrant */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-blue-600" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Work Order / PM</h4>
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
            <div className="py-4 text-center space-y-1">
              <p className="text-xs font-bold text-gray-900">Not scheduled yet</p>
              <p className="text-[11px] text-gray-400">
                Click "Create" — done in this screen, no need to open the CMMS.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {workItems.map((w) => (
                <div key={w.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {w.workOrderNumber}: <span className="font-medium text-gray-600">{w.description}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold tracking-wider">
                      {w.kind === "pm" ? "Recurring (PM)" : "One-time (Work Order)"} · Due {w.dueDate}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{w.status}</Badge>
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

      {primaryChecklist && (
        <div className="px-6 pb-5 pt-1">
          <p className="text-[10px] text-gray-400">
            Linked to <span className="font-semibold text-gray-500">{primaryChecklist.name}</span> and this{" "}
            {docType.toUpperCase()} automatically — no manual linking step required.
          </p>
        </div>
      )}
    </Card>
  );
}
