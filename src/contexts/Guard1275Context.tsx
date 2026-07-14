"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface PortalSettings {
  safetyEnabled: boolean;
  documentsEnabled: boolean;
  documents: Array<{ id: string; name: string; type: string }>;
  requiredFields: {
    attachments: boolean;
    location: boolean;
    asset: boolean;
    category: boolean;
    priority: boolean;
  };
}

interface Guard1275ContextType {
  settings: PortalSettings;
  availableDocuments: Array<{ id: string; name: string; type: string }>;
  toggleSafety: () => void;
  toggleDocuments: () => void;
  toggleRequiredField: (field: keyof PortalSettings["requiredFields"]) => void;
  setDocuments: (documents: Array<{ id: string; name: string; type: string }>) => void;
}

const Guard1275Context = createContext<Guard1275ContextType | undefined>(undefined);

const defaultAvailableDocuments = [
  { id: '1', name: 'Forklift Safety SOP', type: 'PDF' },
  { id: '2', name: 'Chemical Spill JHA', type: 'DOCX' },
  { id: '3', name: 'Fire Evacuation Plan', type: 'PDF' },
  { id: '4', name: 'PPE Requirements', type: 'PDF' },
  { id: '5', name: 'Lockout Tagout Procedure', type: 'DOCX' },
];

const defaultSettings: PortalSettings = {
  safetyEnabled: true,
  documentsEnabled: false,
  documents: [
    { id: '1', name: 'Forklift Safety SOP', type: 'PDF' },
    { id: '2', name: 'Chemical Spill JHA', type: 'DOCX' }
  ],
  requiredFields: {
    attachments: false,
    location: true,
    asset: false,
    category: true,
    priority: false,
  },
};

export function Guard1275Provider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PortalSettings>(defaultSettings);
  const availableDocuments = defaultAvailableDocuments;

  const toggleSafety = () => {
    setSettings((prev) => ({ ...prev, safetyEnabled: !prev.safetyEnabled }));
  };

  const toggleDocuments = () => {
    setSettings((prev) => ({ ...prev, documentsEnabled: !prev.documentsEnabled }));
  };

  const setDocuments = (documents: Array<{ id: string; name: string; type: string }>) => {
    setSettings((prev) => ({ ...prev, documents }));
  };

  const toggleRequiredField = (field: keyof PortalSettings["requiredFields"]) => {
    setSettings((prev) => ({
      ...prev,
      requiredFields: {
        ...prev.requiredFields,
        [field]: !prev.requiredFields[field],
      },
    }));
  };

  return (
    <Guard1275Context.Provider value={{ 
      settings, 
      availableDocuments,
      toggleSafety, 
      toggleDocuments, 
      toggleRequiredField,
      setDocuments 
    }}>
      {children}
    </Guard1275Context.Provider>
  );
}

export function useGuard1275() {
  const context = useContext(Guard1275Context);
  if (context === undefined) {
    throw new Error("useGuard1275 must be used within a Guard1275Provider");
  }
  return context;
}
