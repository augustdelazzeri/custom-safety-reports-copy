"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SafetyEvent {
  id: string;
  title: string;
  type: string;
  status: string;
  severity: string;
  location: string;
  dateTime: string;
  osha: string;
  isAllFields?: boolean;
}

interface SafetyEventContextType {
  safetyEvents: SafetyEvent[];
  addSafetyEvent: (event: Omit<SafetyEvent, "id">) => void;
  clearSafetyEvents: () => void;
  loadSamples: () => void;
}

const SafetyEventContext = createContext<SafetyEventContextType | undefined>(undefined);

const STORAGE_KEY = "safetyEvents";

const sampleEvents: SafetyEvent[] = [
  { 
    id: "SE-0001", 
    title: "[Sample] Slip and Fall in Production Line 3", 
    type: "Incident", 
    status: "Open", 
    severity: "Medium", 
    location: "Chicago Plant > Production > Line 3", 
    dateTime: "Jun 10, 2026 10:30 AM", 
    osha: "No" 
  },
  { 
    id: "SE-0002", 
    title: "[Sample] Unsecured Chemical Container", 
    type: "Observation", 
    status: "In Review", 
    severity: "Low", 
    location: "Berlin Factory > Storage", 
    dateTime: "Jun 11, 2026 2:15 PM", 
    osha: "No" 
  },
  { 
    id: "SE-0003", 
    title: "[Sample] Forklift Near Miss in Warehouse", 
    type: "Near Miss", 
    status: "Closed", 
    severity: "High", 
    location: "Austin Facility > Warehouse", 
    dateTime: "Jun 12, 2026 9:00 AM", 
    osha: "Yes" 
  },
];

export function SafetyEventProvider({ children }: { children: ReactNode }) {
  const [safetyEvents, setSafetyEvents] = useState<SafetyEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSafetyEvents(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse safety events", e);
        setSafetyEvents([]);
      }
    } else {
      setSafetyEvents([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safetyEvents));
    }
  }, [safetyEvents, isLoaded]);

  const addSafetyEvent = (eventData: Omit<SafetyEvent, "id">) => {
    const newId = `SE-${String(safetyEvents.length + 1).padStart(4, "0")}`;
    const newEvent = { ...eventData, id: newId };
    setSafetyEvents((prev) => [newEvent, ...prev]);
  };

  const clearSafetyEvents = () => {
    setSafetyEvents([]);
  };

  const loadSamples = () => {
    setSafetyEvents(sampleEvents);
  };

  return (
    <SafetyEventContext.Provider value={{ safetyEvents, addSafetyEvent, clearSafetyEvents, loadSamples }}>
      {children}
    </SafetyEventContext.Provider>
  );
}

export function useSafetyEvents() {
  const context = useContext(SafetyEventContext);
  if (context === undefined) {
    throw new Error("useSafetyEvents must be used within a SafetyEventProvider");
  }
  return context;
}
