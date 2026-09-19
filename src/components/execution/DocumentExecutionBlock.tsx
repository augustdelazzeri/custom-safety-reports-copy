"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ClipboardCheck, Star, Wrench, CalendarClock, Plus, Bot, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionDocType, useExecution } from "@/contexts/ExecutionContext";

interface DocumentExecutionBlockProps {
  docType: ExecutionDocType;
  docId: string;
  docTitle: string;
}

export function DocumentExecutionBlock({ docType, docId, docTitle }: DocumentExecutionBlockProps) {
  const { getChecklists, getWorkItems, ensureAutoChecklist, setPrimaryChecklist, suggestRecurring, createWorkItem } =
    useExecution();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (docId && docTitle) ensureAutoChecklist(docType, docId, docTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docType, docId, docTitle]);

  const checklists = getChecklists(docType, docId);
  const workItems = getWorkItems(docType, docId);
  const primaryChecklist = checklists.find((c) => c.isPrimary) ?? checklists[0];

  const openCreateModal = () => {
    setDescription(`Execute ${docTitle}`);
    setRecurring(suggestRecurring(docType));
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    createWorkItem(docType, docId, docTitle, {
      description,
      recurring,
      priority: "P2",
      dueDate,
    });
    setIsModalOpen(false);
  };

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
                      onClick={() => setPrimaryChecklist(docType, docId, c.id)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create execution for {docTitle}</DialogTitle>
            <DialogDescription>
              This creates the work order (or PM, if recurring) directly in Safety and links it to this document
              automatically — no need to go to the CMMS.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="exec-desc">Description</Label>
              <Textarea id="exec-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="exec-recurring">This repeats on a schedule</Label>
                <p className="text-[11px] text-gray-400">
                  {recurring ? "Creates a Preventive Maintenance" : "Creates a one-time Work Order"}
                  {" · suggested based on this document type"}
                </p>
              </div>
              <Switch id="exec-recurring" checked={recurring} onCheckedChange={setRecurring} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exec-due">{recurring ? "First due date" : "Due date"}</Label>
              <Input id="exec-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
              {recurring ? "Create PM" : "Create Work Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
