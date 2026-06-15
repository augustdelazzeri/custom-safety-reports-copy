/**
 * Team Context
 * 
 * Manages EHS teams with CRUD operations, localStorage persistence,
 * and integration with UserContext for member lookups.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { EHSTeam, CreateTeamFormData } from "../schemas/teams";
import { mockTeams } from "../samples/mockTeams";

interface TeamContextType {
  teams: Record<string, EHSTeam>;
  createTeam: (formData: CreateTeamFormData) => string;
  updateTeam: (id: string, formData: Partial<CreateTeamFormData>) => boolean;
  deleteTeam: (id: string) => boolean;
  duplicateTeam: (id: string) => string;
  getTeamById: (id: string) => EHSTeam | undefined;
  getTeamsList: () => EHSTeam[];
  checkDuplicateName: (name: string, excludeId?: string) => boolean;
  addMemberToTeam: (teamId: string, userId: string) => boolean;
  removeMemberFromTeam: (teamId: string, userId: string) => boolean;
  setTeamLead: (teamId: string, userId: string) => boolean;
  getUserTeams: (userId: string) => EHSTeam[];
  toggleTeamStatus: (id: string) => boolean;
  saveTeams: () => void;
  loadTeams: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const STORAGE_KEY = "ehs_teams";

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Record<string, EHSTeam>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize teams from localStorage or use mock data
  useEffect(() => {
    if (!isInitialized) {
      loadTeams();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const loadTeams = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTeams(parsed);
        } catch (error) {
          console.error("Failed to parse teams from localStorage:", error);
          setTeams({});
        }
      } else {
        setTeams({});
      }
    }
  };

  const initializeMockTeams = () => {
    const teamsRecord: Record<string, EHSTeam> = {};
    mockTeams.forEach(team => {
      teamsRecord[team.id] = team;
    });
    setTeams(teamsRecord);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teamsRecord));
    }
  };

  const saveTeams = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    }
  };

  // Auto-save on teams change
  useEffect(() => {
    if (isInitialized) {
      saveTeams();
    }
  }, [teams, isInitialized]);

  const createTeam = (formData: CreateTeamFormData): string => {
    const id = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newTeam: EHSTeam = {
      id,
      name: formData.name,
      description: formData.description,
      teamType: formData.teamType,
      primaryFunction: formData.primaryFunction,
      memberIds: formData.memberIds,
      leaderId: formData.leaderId,
      locationNodeId: formData.locationNodeId,
      locationPath: undefined, // Will be populated from location context
      canReceiveBulkAssignments: formData.canReceiveBulkAssignments,
      canReceiveGroupNotifications: formData.canReceiveGroupNotifications,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    setTeams(prev => ({
      ...prev,
      [id]: newTeam
    }));

    return id;
  };

  const updateTeam = (id: string, formData: Partial<CreateTeamFormData>): boolean => {
    const existingTeam = teams[id];
    if (!existingTeam) return false;

    const now = new Date().toISOString();
    
    const updatedTeam: EHSTeam = {
      ...existingTeam,
      ...(formData.name !== undefined && { name: formData.name }),
      ...(formData.description !== undefined && { description: formData.description }),
      ...(formData.teamType !== undefined && { teamType: formData.teamType }),
      ...(formData.primaryFunction !== undefined && { primaryFunction: formData.primaryFunction }),
      ...(formData.memberIds !== undefined && { memberIds: formData.memberIds }),
      ...(formData.leaderId !== undefined && { leaderId: formData.leaderId }),
      ...(formData.locationNodeId !== undefined && { locationNodeId: formData.locationNodeId }),
      ...(formData.canReceiveBulkAssignments !== undefined && { canReceiveBulkAssignments: formData.canReceiveBulkAssignments }),
      ...(formData.canReceiveGroupNotifications !== undefined && { canReceiveGroupNotifications: formData.canReceiveGroupNotifications }),
      updatedAt: now,
    };

    setTeams(prev => ({
      ...prev,
      [id]: updatedTeam
    }));

    return true;
  };

  const deleteTeam = (id: string): boolean => {
    if (!teams[id]) return false;

    setTeams(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });

    return true;
  };

  const duplicateTeam = (id: string): string => {
    const existingTeam = teams[id];
    if (!existingTeam) return "";

    const newId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Generate unique name
    let newName = `${existingTeam.name} (Copy)`;
    let counter = 1;
    while (checkDuplicateName(newName)) {
      counter++;
      newName = `${existingTeam.name} (Copy ${counter})`;
    }

    const duplicatedTeam: EHSTeam = {
      ...existingTeam,
      id: newId,
      name: newName,
      memberIds: [], // Start with empty members for duplicated team
      leaderId: undefined, // No leader for duplicated team
      createdAt: now,
      updatedAt: now,
    };

    setTeams(prev => ({
      ...prev,
      [newId]: duplicatedTeam
    }));

    return newId;
  };

  const toggleTeamStatus = (id: string): boolean => {
    const team = teams[id];
    if (!team) return false;

    const newStatus = team.status === "active" ? "inactive" : "active";
    return updateTeam(id, { ...team, memberIds: team.memberIds });
  };

  const getTeamById = (id: string): EHSTeam | undefined => {
    return teams[id];
  };

  const getTeamsList = (): EHSTeam[] => {
    return Object.values(teams).sort((a, b) => {
      // Active teams first
      if (a.status === "active" && b.status === "inactive") return -1;
      if (a.status === "inactive" && b.status === "active") return 1;
      
      // Then sort by name
      return a.name.localeCompare(b.name);
    });
  };

  const checkDuplicateName = (name: string, excludeId?: string): boolean => {
    return Object.values(teams).some(
      team => team.name.toLowerCase() === name.toLowerCase() && team.id !== excludeId
    );
  };

  const addMemberToTeam = (teamId: string, userId: string): boolean => {
    const team = teams[teamId];
    if (!team) return false;
    
    if (team.memberIds.includes(userId)) return false; // Already a member
    
    const updatedMemberIds = [...team.memberIds, userId];
    return updateTeam(teamId, { memberIds: updatedMemberIds });
  };

  const removeMemberFromTeam = (teamId: string, userId: string): boolean => {
    const team = teams[teamId];
    if (!team) return false;
    
    const updatedMemberIds = team.memberIds.filter(id => id !== userId);
    
    // If removing the leader, clear leaderId
    const updates: Partial<CreateTeamFormData> = { memberIds: updatedMemberIds };
    if (team.leaderId === userId) {
      updates.leaderId = undefined;
    }
    
    return updateTeam(teamId, updates);
  };

  const setTeamLead = (teamId: string, userId: string): boolean => {
    const team = teams[teamId];
    if (!team) return false;
    
    // User must be a member to be set as leader
    if (!team.memberIds.includes(userId)) return false;
    
    return updateTeam(teamId, { leaderId: userId });
  };

  const getUserTeams = (userId: string): EHSTeam[] => {
    return Object.values(teams).filter(team => 
      team.memberIds.includes(userId) && team.status === "active"
    );
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        createTeam,
        updateTeam,
        deleteTeam,
        duplicateTeam,
        getTeamById,
        getTeamsList,
        checkDuplicateName,
        addMemberToTeam,
        removeMemberFromTeam,
        setTeamLead,
        getUserTeams,
        toggleTeamStatus,
        saveTeams,
        loadTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam must be used within TeamProvider");
  }
  return context;
}
