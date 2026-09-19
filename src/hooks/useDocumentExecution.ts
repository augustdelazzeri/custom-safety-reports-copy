"use client";

import { useEffect, useMemo, useState } from "react";
import { ExecutionDocType, useExecution } from "@/contexts/ExecutionContext";

export function useDocumentExecution(docType: ExecutionDocType, docId: string, docTitle: string) {
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
  const primaryChecklist = useMemo(
    () => checklists.find((c) => c.isPrimary) ?? checklists[0],
    [checklists]
  );

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

  return {
    checklists,
    workItems,
    primaryChecklist,
    setPrimaryChecklist: (checklistId: string) => setPrimaryChecklist(docType, docId, checklistId),
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
  };
}
