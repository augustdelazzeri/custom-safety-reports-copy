"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { LocationSelection } from "../schemas/locations";

export interface AccessPoint {
  id: string;
  name: string;
  location: LocationSelection;
  asset?: string;
  templateIds: string[]; // Array of 1-5 template IDs
  createdBy: string;
  createdAt: string;
  status: 'active' | 'archived';
  qrCodeUrl: string;
}

interface AccessPointContextValue {
  accessPoints: AccessPoint[];
  createAccessPoint: (name: string, location: LocationSelection, asset: string | undefined, templateIds: string[]) => string;
  getAccessPoint: (id: string) => AccessPoint | undefined;
  getAllAccessPoints: () => AccessPoint[];
  updateAccessPoint: (id: string, updates: Partial<AccessPoint>) => void;
  archiveAccessPoint: (id: string) => void;
}

const AccessPointContext = createContext<AccessPointContextValue | undefined>(undefined);

const STORAGE_KEY = "accessPoints";

// Create default sample access points
function createDefaultAccessPoints(): AccessPoint[] {
  return [
    {
      id: "access-point-1",
      name: "[Sample] Production Line 3 QR",
      location: {
        selectedLevel: 4,
        locationId: "loc_chicago",
        locationName: "Chicago Plant",
        fullPath: "Global Operations > North America > United States > Chicago Plant",
        parentIds: ["loc_global", "loc_na", "loc_usa"],
      },
      asset: "Conveyor Belt B-12",
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-15T14:53:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-1&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Chicago%20Plant&asset=Conveyor%20Belt%20B-12"
    },
    {
      id: "access-point-2",
      name: "[Sample] Main Warehouse Entrance",
      location: {
        selectedLevel: 5,
        locationId: "loc_chicago_prod",
        locationName: "Production",
        fullPath: "Global Operations > North America > United States > Chicago Plant > Production",
        parentIds: ["loc_global", "loc_na", "loc_usa", "loc_chicago"],
      },
      asset: undefined,
      templateIds: ["near-miss"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-15T14:53:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=near-miss&accessPointId=access-point-2&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Chicago%20Plant%20%3E%20Production"
    },
    {
      id: "access-point-3",
      name: "[Sample] Chemical Storage Area",
      location: {
        selectedLevel: 4,
        locationId: "loc_berlin",
        locationName: "Berlin Factory",
        fullPath: "Global Operations > Europe > Germany > Berlin Factory",
        parentIds: ["loc_global", "loc_eu", "loc_germany"],
      },
      asset: "Hazmat Cabinet 4",
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-17T09:00:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-3&location=Global%20Operations%20%3E%20Europe%20%3E%20Germany%20%3E%20Berlin%20Factory&asset=Hazmat%20Cabinet%204"
    },
  ];
}

interface AccessPointProviderProps {
  children: ReactNode;
}

export function AccessPointProvider({ children }: AccessPointProviderProps) {
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>(() => {
    // Load from localStorage on initial mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AccessPoint[];
          // Migrate old format (templateId) to new format (templateIds)
          const migrated = parsed.map((ap: AccessPoint & { templateId?: string }) => {
            if (ap.templateId && !ap.templateIds) {
              return { ...ap, templateIds: [ap.templateId] };
            }
            return ap;
          });
          return migrated;
        } catch (e) {
          console.error("Failed to parse stored access points:", e);
        }
      }
    }
    return [];
  });

  const createAccessPoint = (
    name: string,
    location: LocationSelection,
    asset: string | undefined,
    templateIds: string[]
  ): string => {
    const newId = `access-point-${Date.now()}`;
    const now = new Date().toISOString();
    
    // Generate QR code URL - if multiple templates, include all templateIds
    const templateIdsParam = templateIds.length === 1 
      ? `templateId=${templateIds[0]}`
      : `templateIds=${templateIds.join(',')}`;
    const qrCodeUrl = `/safety-events/template-form?${templateIdsParam}&accessPointId=${newId}&location=${encodeURIComponent(location.fullPath)}${asset ? `&asset=${encodeURIComponent(asset)}` : ''}`;
    
    const newAccessPoint: AccessPoint = {
      id: newId,
      name: name,
      location: location,
      asset: asset,
      templateIds: templateIds,
      createdBy: "Joty Grewal", // Placeholder
      createdAt: now,
      status: 'active',
      qrCodeUrl: qrCodeUrl
    };

    const updatedAccessPoints = [...accessPoints, newAccessPoint];
    setAccessPoints(updatedAccessPoints);
    
    // Save immediately to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccessPoints));
    }
    
    return newId;
  };

  const getAccessPoint = (id: string): AccessPoint | undefined => {
    return accessPoints.find(ap => ap.id === id);
  };

  const getAllAccessPoints = (): AccessPoint[] => {
    return accessPoints;
  };

  const updateAccessPoint = (id: string, updates: Partial<AccessPoint>): void => {
    const updatedAccessPoints = accessPoints.map(ap =>
      ap.id === id ? { ...ap, ...updates, id: ap.id } : ap
    );
    
    setAccessPoints(updatedAccessPoints);
    
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccessPoints));
    }
  };

  const archiveAccessPoint = (id: string): void => {
    updateAccessPoint(id, { status: 'archived' });
  };

  return (
    <AccessPointContext.Provider
      value={{
        accessPoints,
        createAccessPoint,
        getAccessPoint,
        getAllAccessPoints,
        updateAccessPoint,
        archiveAccessPoint
      }}
    >
      {children}
    </AccessPointContext.Provider>
  );
}

export function useAccessPoint() {
  const context = useContext(AccessPointContext);
  if (context === undefined) {
    throw new Error("useAccessPoint must be used within an AccessPointProvider");
  }
  return context;
}

