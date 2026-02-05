/**
 * Profile Context
 * 
 * Manages the current user profile for permission simulation in the prototype.
 * Allows switching between Global Admin and Technician to visualize different permission levels.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { RolePermissions } from "../schemas/roles";
import { mockRoles } from "../samples/mockRoles";
import { getPermissionValue } from "../schemas/roles";

type ProfileType = 'global_admin' | 'technician';

interface ProfileContextType {
  currentProfile: ProfileType;
  switchProfile: (profile: ProfileType) => void;
  hasPermission: (module: string, entity: string, action: string) => boolean;
  permissions: RolePermissions;
  profileName: string;
  roleId: string;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = "ehs_current_profile";
const DEFAULT_PROFILE: ProfileType = 'global_admin';

// Map profile types to role IDs
const PROFILE_TO_ROLE_MAP: Record<ProfileType, string> = {
  global_admin: 'role_global_admin',
  technician: 'role_technician'
};

// Map profile types to display names
const PROFILE_NAMES: Record<ProfileType, string> = {
  global_admin: 'Global Admin',
  technician: 'Technician'
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<ProfileType>(DEFAULT_PROFILE);
  const [permissions, setPermissions] = useState<RolePermissions>({});

  // Load profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'global_admin' || saved === 'technician')) {
        setCurrentProfile(saved as ProfileType);
      }
    }
  }, []);

  // Update permissions when profile changes
  useEffect(() => {
    const roleId = PROFILE_TO_ROLE_MAP[currentProfile];
    const role = mockRoles.find(r => r.id === roleId);
    
    if (role) {
      setPermissions(role.permissions);
    }
  }, [currentProfile]);

  const switchProfile = (profile: ProfileType) => {
    setCurrentProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, profile);
    }
  };

  const hasPermission = (module: string, entity: string, action: string): boolean => {
    return getPermissionValue(permissions, module, entity, action);
  };

  const value: ProfileContextType = {
    currentProfile,
    switchProfile,
    hasPermission,
    permissions,
    profileName: PROFILE_NAMES[currentProfile],
    roleId: PROFILE_TO_ROLE_MAP[currentProfile]
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
