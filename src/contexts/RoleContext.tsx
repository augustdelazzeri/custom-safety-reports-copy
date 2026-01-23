/**
 * Role Context
 * 
 * Manages custom roles with CRUD operations and localStorage persistence.
 * Follows the pattern established by TemplateContext.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { CustomRole, RolePermissions, OSHALocationPermissions } from "../schemas/roles";
import { mockRoles } from "../samples/mockRoles";

interface RoleContextType {
  roles: Record<string, CustomRole>;
  createRole: (name: string, permissions: RolePermissions, oshaLocationPermissions?: OSHALocationPermissions) => string;
  updateRole: (id: string, name: string, permissions: RolePermissions, oshaLocationPermissions?: OSHALocationPermissions) => boolean;
  deleteRole: (id: string) => boolean;
  duplicateRole: (id: string) => string;
  getRoleById: (id: string) => CustomRole | undefined;
  getRolesList: () => CustomRole[];
  checkDuplicateName: (name: string, excludeId?: string) => boolean;
  saveRoles: () => void;
  loadRoles: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const STORAGE_KEY = "ehs_custom_roles";
const STORAGE_VERSION_KEY = "ehs_custom_roles_version";
const CURRENT_VERSION = "2.0"; // Updated for 3-level permission structure

export function RoleProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Record<string, CustomRole>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize roles from localStorage or use mock data
  useEffect(() => {
    if (!isInitialized) {
      loadRoles();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const loadRoles = () => {
    if (typeof window !== "undefined") {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      const stored = localStorage.getItem(STORAGE_KEY);
      
      // Force re-initialization if version mismatch or no stored data
      if (storedVersion !== CURRENT_VERSION || !stored) {
        console.log("🔄 Migrating to new permission structure v2.0...");
        initializeDefaultRoles();
        return;
      }
      
      // Load existing data
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRoles(parsed);
        } catch (error) {
          console.error("Failed to parse stored roles:", error);
          initializeDefaultRoles();
        }
      } else {
        initializeDefaultRoles();
      }
    }
  };

  const initializeDefaultRoles = () => {
    const rolesMap: Record<string, CustomRole> = {};
    mockRoles.forEach(role => {
      rolesMap[role.id] = role;
    });
    setRoles(rolesMap);
    
    // Save to localStorage with version
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rolesMap));
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      console.log("✅ Roles initialized with", Object.keys(rolesMap).length, "system roles");
    }
  };

  const saveRoles = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    }
  };

  const createRole = (name: string, permissions: RolePermissions, oshaLocationPermissions?: OSHALocationPermissions): string => {
    const newId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newRole: CustomRole = {
      id: newId,
      name: name.trim(),
      permissions,
      oshaLocationPermissions: oshaLocationPermissions || {},
      isSystemRole: false,
      createdAt: now,
      updatedAt: now,
    };

    const updatedRoles = {
      ...roles,
      [newId]: newRole,
    };

    setRoles(updatedRoles);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoles));
    }

    return newId;
  };

  const updateRole = (id: string, name: string, permissions: RolePermissions, oshaLocationPermissions?: OSHALocationPermissions): boolean => {
    const role = roles[id];
    if (!role) return false;

    // Cannot update system roles
    if (role.isSystemRole) return false;

    const updatedRole: CustomRole = {
      ...role,
      name: name.trim(),
      permissions,
      oshaLocationPermissions: oshaLocationPermissions !== undefined ? oshaLocationPermissions : role.oshaLocationPermissions,
      updatedAt: new Date().toISOString(),
    };

    const updatedRoles = {
      ...roles,
      [id]: updatedRole,
    };

    setRoles(updatedRoles);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoles));
    }

    return true;
  };

  const deleteRole = (id: string): boolean => {
    const role = roles[id];
    if (!role) return false;

    // Cannot delete system roles
    if (role.isSystemRole) return false;

    const updatedRoles = { ...roles };
    delete updatedRoles[id];

    setRoles(updatedRoles);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoles));
    }

    return true;
  };

  const duplicateRole = (id: string): string => {
    const role = roles[id];
    if (!role) throw new Error("Role not found");

    const newId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Find a unique name
    let copyName = `${role.name} (Copy)`;
    let counter = 1;
    while (checkDuplicateName(copyName)) {
      copyName = `${role.name} (Copy ${counter})`;
      counter++;
    }

    const duplicatedRole: CustomRole = {
      ...role,
      id: newId,
      name: copyName,
      isSystemRole: false, // Copies are never system roles
      createdAt: now,
      updatedAt: now,
    };

    const updatedRoles = {
      ...roles,
      [newId]: duplicatedRole,
    };

    setRoles(updatedRoles);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoles));
    }

    return newId;
  };

  const getRoleById = (id: string): CustomRole | undefined => {
    return roles[id];
  };

  const getRolesList = (): CustomRole[] => {
    return Object.values(roles).sort((a, b) => {
      // System roles first
      if (a.isSystemRole && !b.isSystemRole) return -1;
      if (!a.isSystemRole && b.isSystemRole) return 1;
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  };

  const checkDuplicateName = (name: string, excludeId?: string): boolean => {
    const trimmedName = name.trim().toLowerCase();
    return Object.values(roles).some(
      role => role.name.toLowerCase() === trimmedName && role.id !== excludeId
    );
  };

  const value: RoleContextType = {
    roles,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
    getRoleById,
    getRolesList,
    checkDuplicateName,
    saveRoles,
    loadRoles,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
