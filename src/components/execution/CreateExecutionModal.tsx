"use client";

import React from "react";
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

interface CreateExecutionModalProps {
  docTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  recurring: boolean;
  onRecurringChange: (value: boolean) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  onCreate: () => void;
}

export function CreateExecutionModal({
  docTitle,
  isOpen,
  onOpenChange,
  description,
  onDescriptionChange,
  recurring,
  onRecurringChange,
  dueDate,
  onDueDateChange,
  onCreate,
}: CreateExecutionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Textarea id="exec-desc" value={description} onChange={(e) => onDescriptionChange(e.target.value)} rows={2} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="exec-recurring">This repeats on a schedule</Label>
              <p className="text-[11px] text-gray-400">
                {recurring ? "Creates a Preventive Maintenance" : "Creates a one-time Work Order"}
                {" · suggested based on this document type"}
              </p>
            </div>
            <Switch id="exec-recurring" checked={recurring} onCheckedChange={onRecurringChange} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exec-due">{recurring ? "First due date" : "Due date"}</Label>
            <Input id="exec-due" type="date" value={dueDate} onChange={(e) => onDueDateChange(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
            {recurring ? "Create PM" : "Create Work Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
