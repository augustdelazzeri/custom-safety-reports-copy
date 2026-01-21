"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CAPA {
  id: string;
  title: string;
  type: "corrective" | "preventive" | "both";
  status: "open" | "in-review" | "closed";
  priority: "low" | "medium" | "high";
  linkedSafetyEventId?: string;
  locationId?: string;
  locationName?: string;
  assetId?: string;
  rcaMethod: string;
  rcaFindings: string;
  rootCauseCategories: string[];
  proposedActions: string;
  ownerId: string;
  ownerName: string;
  dueDate?: string;
  tags: string[];
  teamMembersToNotify: string[];
  createdDate: string;
  createdBy: string;
  updatedDate: string;
}

interface CAPAContextType {
  capas: CAPA[];
  addCAPA: (capa: Omit<CAPA, "id" | "createdDate" | "updatedDate">) => void;
  updateCAPA: (id: string, updates: Partial<CAPA>) => void;
  deleteCAPA: (id: string) => void;
  getCAPA: (id: string) => CAPA | undefined;
}

const CAPAContext = createContext<CAPAContextType | undefined>(undefined);

// Initial mock CAPA data
const initialCAPAs: CAPA[] = [
  {
    id: "CAPA-0001",
    title: "Slip Incident Due to Water from Air Conditioning",
    type: "both",
    status: "open",
    priority: "high",
    locationId: "loc_chicago",
    locationName: "Chicago Plant",
    rcaMethod: "5 Whys",
    rcaFindings: `1) Why did someone slip? Because there was water on the floor.
2) Why was there water on the floor? Because the air conditioning unit leaked.
3) Why did the air conditioning leak? Lack of maintenance or fault in drainage.
4) Why was maintenance lacking? No schedule or monitoring process in place.
5) Why is there no process? Lack of established procedure for AC inspection.`,
    rootCauseCategories: ["Equipment Failure", "Procedural"],
    proposedActions: `1. Clean and dry the affected area immediately
2. Inspect and repair the air conditioning unit
3. Establish a regular AC inspection and maintenance schedule
4. Train staff to report leaks or hazards
5. Place warning signs in affected areas until resolved`,
    ownerId: "user_003",
    ownerName: "Jennifer Chen",
    dueDate: "2026-01-20",
    tags: ["Hazard", "Equipment", "Procedure", "Safety"],
    teamMembersToNotify: [],
    createdDate: "2026-01-14T15:42:00Z",
    createdBy: "user_003",
    updatedDate: "2026-01-14T15:42:00Z",
  },
];

export function CAPAProvider({ children }: { children: ReactNode }) {
  const [capas, setCapas] = useState<CAPA[]>(initialCAPAs);

  const addCAPA = (capaData: Omit<CAPA, "id" | "createdDate" | "updatedDate">) => {
    const newId = `CAPA-${String(capas.length + 1).padStart(4, "0")}`;
    const now = new Date().toISOString();
    
    const newCAPA: CAPA = {
      ...capaData,
      id: newId,
      createdDate: now,
      updatedDate: now,
    };

    setCapas((prev) => [newCAPA, ...prev]);
  };

  const updateCAPA = (id: string, updates: Partial<CAPA>) => {
    setCapas((prev) =>
      prev.map((capa) =>
        capa.id === id
          ? { ...capa, ...updates, updatedDate: new Date().toISOString() }
          : capa
      )
    );
  };

  const deleteCAPA = (id: string) => {
    setCapas((prev) => prev.filter((capa) => capa.id !== id));
  };

  const getCAPA = (id: string) => {
    return capas.find((capa) => capa.id === id);
  };

  return (
    <CAPAContext.Provider value={{ capas, addCAPA, updateCAPA, deleteCAPA, getCAPA }}>
      {children}
    </CAPAContext.Provider>
  );
}

export function useCAPAs() {
  const context = useContext(CAPAContext);
  if (context === undefined) {
    throw new Error("useCAPAs must be used within a CAPAProvider");
  }
  return context;
}
