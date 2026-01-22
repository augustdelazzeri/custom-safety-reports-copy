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
      name: "Line 30",
      location: {
        selectedLevel: 4,
        locationId: "loc_chicago",
        locationName: "Chicago Plant",
        fullPath: "Global Operations > North America > United States > Chicago Plant",
        parentIds: ["loc_global", "loc_na", "loc_usa"],
      },
      asset: undefined,
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-15T14:53:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-1&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Chicago%20Plant"
    },
    {
      id: "access-point-2",
      name: "Test Access Point 3",
      location: {
        selectedLevel: 5,
        locationId: "loc_chicago_prod",
        locationName: "Production",
        fullPath: "Global Operations > North America > United States > Chicago Plant > Production",
        parentIds: ["loc_global", "loc_na", "loc_usa", "loc_chicago"],
      },
      asset: undefined,
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-15T14:53:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-2&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Chicago%20Plant%20%3E%20Production"
    },
    {
      id: "access-point-3",
      name: "Floor 3",
      location: {
        selectedLevel: 4,
        locationId: "loc_berlin",
        locationName: "Berlin Factory",
        fullPath: "Global Operations > Europe > Germany > Berlin Factory",
        parentIds: ["loc_global", "loc_eu", "loc_germany"],
      },
      asset: undefined,
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-17T09:00:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-3&location=Global%20Operations%20%3E%20Europe%20%3E%20Germany%20%3E%20Berlin%20Factory"
    },
    {
      id: "access-point-4",
      name: "Manufacturing Plant 3",
      location: {
        selectedLevel: 4,
        locationId: "loc_austin",
        locationName: "Austin Facility",
        fullPath: "Global Operations > North America > United States > Austin Facility",
        parentIds: ["loc_global", "loc_na", "loc_usa"],
      },
      asset: undefined,
      templateIds: ["near-miss"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-18T10:30:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=near-miss&accessPointId=access-point-4&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Austin%20Facility"
    },
    {
      id: "access-point-5",
      name: "Manufacturing Plant 3",
      location: {
        selectedLevel: 5,
        locationId: "loc_berlin_manufacturing",
        locationName: "Manufacturing",
        fullPath: "Global Operations > Europe > Germany > Berlin Factory > Manufacturing",
        parentIds: ["loc_global", "loc_eu", "loc_germany", "loc_berlin"],
      },
      asset: undefined,
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-25T08:45:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-5&location=Global%20Operations%20%3E%20Europe%20%3E%20Germany%20%3E%20Berlin%20Factory%20%3E%20Manufacturing"
    },
    {
      id: "access-point-6",
      name: "John Doe",
      location: {
        selectedLevel: 6,
        locationId: "loc_chicago_prod_line1",
        locationName: "Line 1",
        fullPath: "Global Operations > North America > United States > Chicago Plant > Production > Line 1",
        parentIds: ["loc_global", "loc_na", "loc_usa", "loc_chicago", "loc_chicago_prod"],
      },
      asset: undefined,
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-07-25T11:20:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-6&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Chicago%20Plant%20%3E%20Production%20%3E%20Line%201"
    },
    {
      id: "access-point-7",
      name: "Manufacturing Plant 3",
      location: {
        selectedLevel: 5,
        locationId: "loc_toronto_office",
        locationName: "Office",
        fullPath: "Global Operations > North America > Canada > Toronto Distribution Center > Office",
        parentIds: ["loc_global", "loc_na", "loc_canada", "loc_toronto"],
      },
      asset: undefined,
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-09-05T15:00:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-7&location=Global%20Operations%20%3E%20North%20America%20%3E%20Canada%20%3E%20Toronto%20Distribution%20Center%20%3E%20Office"
    },
    {
      id: "access-point-8",
      name: "Office Area 1",
      location: {
        selectedLevel: 5,
        locationId: "loc_austin_qa",
        locationName: "Quality Assurance",
        fullPath: "Global Operations > North America > United States > Austin Facility > Quality Assurance",
        parentIds: ["loc_global", "loc_na", "loc_usa", "loc_austin"],
      },
      asset: undefined,
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-09-09T13:30:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-8&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Austin%20Facility%20%3E%20Quality%20Assurance"
    },
    {
      id: "access-point-9",
      name: "Shipping Yard",
      location: {
        selectedLevel: 6,
        locationId: "loc_chicago_warehouse_shipping",
        locationName: "Shipping",
        fullPath: "Global Operations > North America > United States > Chicago Plant > Warehouse > Shipping",
        parentIds: ["loc_global", "loc_na", "loc_usa", "loc_chicago", "loc_chicago_warehouse"],
      },
      asset: "Forklift FLT-12",
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-09-16T09:15:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-9&location=Global%20Operations%20%3E%20North%20America%20%3E%20United%20States%20%3E%20Chicago%20Plant%20%3E%20Warehouse%20%3E%20Shipping&asset=Forklift%20FLT-12"
    },
    {
      id: "access-point-10",
      name: "Manufacturing Plant 5",
      location: {
        selectedLevel: 6,
        locationId: "loc_berlin_manufacturing_floor1",
        locationName: "Floor 1",
        fullPath: "Global Operations > Europe > Germany > Berlin Factory > Manufacturing > Floor 1",
        parentIds: ["loc_global", "loc_eu", "loc_germany", "loc_berlin", "loc_berlin_manufacturing"],
      },
      asset: "Chocolate Mixer 2",
      templateIds: ["injury-report"],
      createdBy: "Joty Grewal",
      createdAt: "2025-09-17T14:00:00.000Z",
      status: "active",
      qrCodeUrl: "/safety-events/template-form?templateId=injury-report&accessPointId=access-point-10&location=Global%20Operations%20%3E%20Europe%20%3E%20Germany%20%3E%20Berlin%20Factory%20%3E%20Manufacturing%20%3E%20Floor%201&asset=Chocolate%20Mixer%202"
    }
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
          // If we have old data (not 10 items), reset to defaults
          // Migrate old format (templateId) to new format (templateIds)
          const migrated = parsed.map((ap: AccessPoint & { templateId?: string }) => {
            if (ap.templateId && !ap.templateIds) {
              return { ...ap, templateIds: [ap.templateId] };
            }
            return ap;
          });
          if (migrated.length !== 10 || !migrated[0].id.startsWith('access-point-')) {
            const defaults = createDefaultAccessPoints();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
            return defaults;
          }
            return migrated;
        } catch (e) {
          console.error("Failed to parse stored access points:", e);
        }
      }
    }
    const defaults = createDefaultAccessPoints();
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
    return defaults;
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

