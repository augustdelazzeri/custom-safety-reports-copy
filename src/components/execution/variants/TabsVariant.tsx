"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Star, CalendarClock, Plus, Bot, UserCog, FileText, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionDocType } from "@/contexts/ExecutionContext";
import { useDocumentExecution } from "@/hooks/useDocumentExecution";
import { CreateExecutionModal } from "@/components/execution/CreateExecutionModal";

interface Props {
  docType: ExecutionDocType;
  docId: string;
  docTitle: string;
  summary?: {
    description?: string;
    ownerName?: string;
    status?: string;
    locationName?: string;
  };
}

// D4 — "Execution" and "Document Overview" as separate tabs, execution is the default.
export function TabsVariant({ docType, docId, docTitle, summary }: Props) {
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

  const [tab, setTab] = useState<"execution" | "document">("execution");

  return (
    <Card className="border-gray-200 rounded-2xl shadow-2xs overflow-hidden">
      <div className="flex border-b border-gray-100 px-4">
        {(["execution", "document"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-3 text-xs font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors",
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {t === "execution" ? "Execution" : "Document Overview"}
          </button>
        ))}
      </div>

      {tab === "execution" ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 text-blue-600" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Checklist</h4>
            </div>
            {checklists.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">Generating automatically…</p>
            ) : (
              checklists.map((c) => (
                <div key={c.id} className={cn("p-3 rounded-lg border", c.isPrimary ? "border-blue-200 bg-blue-50/50" : "border-gray-100")}>
                  <div className="flex items-center gap-1.5">
                    {c.isPrimary && <Star className="size-3 text-blue-600 fill-blue-600" />}
                    <p className="text-xs font-bold text-gray-900">{c.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className="text-[9px] font-bold px-1.5 py-0 h-4 rounded-md bg-blue-50 text-blue-600 border-blue-100 gap-1">
                      {c.origin === "auto" ? <Bot className="size-2.5" /> : <UserCog className="size-2.5" />}
                      {c.origin === "auto" ? "Auto-generated" : "Manual"}
                    </Badge>
                    {!c.isPrimary && (
                      <button onClick={() => setPrimaryChecklist(c.id)} className="text-[10px] font-bold text-blue-600 hover:underline">
                        Make primary
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="size-4 text-blue-600" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Work Order / PM</h4>
              </div>
              <Button size="sm" onClick={openCreateModal} className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold gap-1">
                <Plus className="size-3.5" />
                Create
              </Button>
            </div>
            {workItems.length === 0 ? (
              <p className="text-[11px] text-gray-400">Not scheduled yet.</p>
            ) : (
              workItems.map((w) => (
                <div key={w.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
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
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-2">
            <FileText className="size-4 text-gray-400 mt-0.5" />
            <p className="text-sm text-gray-700">{summary?.description ?? "No description available."}</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 text-gray-400" />
              {summary?.ownerName ?? "—"}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-gray-400" />
              {summary?.locationName ?? "—"}
            </div>
            <Badge variant="outline">{summary?.status ?? "—"}</Badge>
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
