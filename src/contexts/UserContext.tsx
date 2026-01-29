/**
 * User Context
 * 
 * Manages EHS users with CRUD operations, localStorage persistence,
 * and integration with RoleContext for role lookups.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { EHSUser, CreateUserFormData } from "../schemas/users";
import { isValidEmail } from "../schemas/users";
import { mockUsers } from "../samples/mockUsers";
import { useRole } from "./RoleContext";

export interface BulkImportUserRow {
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  locationPath: string;
  locationNodeId: string; // Resolved from path
  roleId: string;        // Resolved from name
}

interface UserContextType {
  users: Record<string, EHSUser>;
  createUser: (formData: CreateUserFormData) => string;
  updateUser: (id: string, formData: Partial<CreateUserFormData>) => boolean;
  deleteUser: (id: string) => boolean;
  toggleUserStatus: (id: string) => boolean;
  bulkImportUsers: (rows: BulkImportUserRow[]) => { created: number; updated: number };
  getUserById: (id: string) => EHSUser | undefined;
  getUsersList: () => EHSUser[];
  checkDuplicateEmail: (email: string, excludeId?: string) => boolean;
  saveUsers: () => void;
  loadUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "ehs_users";

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<Record<string, EHSUser>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const { getRoleById } = useRole();

  // Initialize users from localStorage or use mock data
  useEffect(() => {
    if (!isInitialized) {
      loadUsers();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const loadUsers = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUsers(parsed);
        } catch (error) {
          console.error("Failed to parse stored users:", error);
          initializeDefaultUsers();
        }
      } else {
        initializeDefaultUsers();
      }
    }
  };

  const initializeDefaultUsers = () => {
    const usersMap: Record<string, EHSUser> = {};
    mockUsers.forEach(user => {
      usersMap[user.id] = user;
    });
    setUsers(usersMap);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usersMap));
    }
  };

  const saveUsers = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  };

  const createUser = (formData: CreateUserFormData): string => {
    // Validate email
    if (!isValidEmail(formData.email)) {
      throw new Error("Invalid email format");
    }

    // Check for duplicate email
    if (checkDuplicateEmail(formData.email)) {
      throw new Error("A user with this email already exists");
    }

    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Get role name for denormalization
    const role = getRoleById(formData.roleId);
    
    const newUser: EHSUser = {
      id: newId,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      roleId: formData.roleId,
      roleName: role?.name,
      locationNodeId: formData.locationNodeId,
      locationPath: undefined, // Will be set by the component
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const updatedUsers = {
      ...users,
      [newId]: newUser,
    };

    setUsers(updatedUsers);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    }

    return newId;
  };

  const updateUser = (id: string, formData: Partial<CreateUserFormData>): boolean => {
    const user = users[id];
    if (!user) return false;

    // Validate email if being updated
    if (formData.email && !isValidEmail(formData.email)) {
      throw new Error("Invalid email format");
    }

    // Check for duplicate email if being updated
    if (formData.email && checkDuplicateEmail(formData.email, id)) {
      throw new Error("A user with this email already exists");
    }

    // Get role name if role is being updated
    let roleName = user.roleName;
    if (formData.roleId) {
      const role = getRoleById(formData.roleId);
      roleName = role?.name;
    }

    const updatedUser: EHSUser = {
      ...user,
      ...(formData.firstName && { firstName: formData.firstName.trim() }),
      ...(formData.lastName && { lastName: formData.lastName.trim() }),
      ...(formData.email && { email: formData.email.trim().toLowerCase() }),
      ...(formData.roleId && { roleId: formData.roleId, roleName }),
      ...(formData.locationNodeId && { locationNodeId: formData.locationNodeId }),
      updatedAt: new Date().toISOString(),
    };

    const updatedUsers = {
      ...users,
      [id]: updatedUser,
    };

    setUsers(updatedUsers);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    }

    return true;
  };

  const deleteUser = (id: string): boolean => {
    const user = users[id];
    if (!user) return false;

    const updatedUsers = { ...users };
    delete updatedUsers[id];

    setUsers(updatedUsers);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    }

    return true;
  };

  const toggleUserStatus = (id: string): boolean => {
    const user = users[id];
    if (!user) return false;

    // Check if this is the last active Global Admin
    if (user.status === "active") {
      const role = getRoleById(user.roleId);
      
      // Check if role has Global Admin permissions (full access)
      const isGlobalAdmin = role?.name === "Global Admin" || role?.id === "role_global_admin";
      
      if (isGlobalAdmin) {
        // Count active Global Admins
        const activeGlobalAdmins = Object.values(users).filter(u => 
          u.status === "active" && 
          (u.roleId === "role_global_admin" || u.roleName === "Global Admin")
        ).length;
        
        if (activeGlobalAdmins <= 1) {
          alert("Cannot deactivate last Global Admin\n\nThis is the only active user with Global Admin privileges. Assign Global Admin to another user before deactivating.");
          return false;
        }
      }
    }

    const updatedUser: EHSUser = {
      ...user,
      status: user.status === "active" ? "inactive" : "active",
      updatedAt: new Date().toISOString(),
    };

    const updatedUsers = {
      ...users,
      [id]: updatedUser,
    };

    setUsers(updatedUsers);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    }

    return true;
  };

  /**
   * Bulk import users from CSV
   * - If email exists: update role and location (Bulk Update behavior)
   * - If email new: create user with status 'pending'
   */
  const bulkImportUsers = (rows: BulkImportUserRow[]): { created: number; updated: number } => {
    let created = 0;
    let updated = 0;
    let updatedUsers = { ...users };

    rows.forEach(row => {
      // Find existing user by email
      const existingUser = Object.values(users).find(u => u.email === row.email);

      if (existingUser) {
        // Bulk Update: update role and location
        const role = getRoleById(row.roleId);
        const updatedUser: EHSUser = {
          ...existingUser,
          roleId: row.roleId,
          roleName: role?.name,
          locationNodeId: row.locationNodeId,
          locationPath: row.locationPath,
          updatedAt: new Date().toISOString(),
        };
        updatedUsers[existingUser.id] = updatedUser;
        updated++;
      } else {
        // Create new user (status: 'pending')
        const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const role = getRoleById(row.roleId);
        const now = new Date().toISOString();

        const newUser: EHSUser = {
          id: newId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          roleId: row.roleId,
          roleName: role?.name,
          locationNodeId: row.locationNodeId,
          locationPath: row.locationPath,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        };
        updatedUsers[newId] = newUser;
        created++;
      }
    });

    setUsers(updatedUsers);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    }

    return { created, updated };
  };

  const getUserById = (id: string): EHSUser | undefined => {
    return users[id];
  };

  const getUsersList = (): EHSUser[] => {
    return Object.values(users).sort((a, b) => {
      // Active users first
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      // Then alphabetically by last name
      return a.lastName.localeCompare(b.lastName);
    });
  };

  const checkDuplicateEmail = (email: string, excludeId?: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    return Object.values(users).some(
      user => user.email.toLowerCase() === normalizedEmail && user.id !== excludeId
    );
  };

  const value: UserContextType = {
    users,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    bulkImportUsers,
    getUserById,
    getUsersList,
    checkDuplicateEmail,
    saveUsers,
    loadUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
