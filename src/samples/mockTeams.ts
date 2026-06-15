/**
 * Mock Teams Data
 * 
 * Sample teams for testing and development
 */

import type { EHSTeam } from "../schemas/teams";

export const mockTeams: EHSTeam[] = [
  {
    id: "team_001",
    name: "[Sample] Chicago Plant Incident Response Team",
    description: "First responders for safety incidents and emergencies at Chicago facility",
    teamType: "safety",
    primaryFunction: "incident-response",
    memberIds: ["user_003", "user_004", "user_006"],
    leaderId: "user_003",
    locationNodeId: "loc_chicago",
    locationPath: "Global Operations > North America > United States > Chicago Plant",
    canReceiveBulkAssignments: true,
    canReceiveGroupNotifications: true,
    status: "active",
    createdAt: "2025-12-01T10:00:00Z",
    updatedAt: "2025-12-01T10:00:00Z",
    createdBy: "user_001"
  },
  {
    id: "team_002",
    name: "[Sample] Corporate EHS Audit Team",
    description: "Cross-facility audit and compliance verification team",
    teamType: "functional",
    primaryFunction: "audits",
    memberIds: ["user_001", "user_002", "user_008"],
    leaderId: "user_001",
    locationNodeId: undefined, // Cross-location team
    locationPath: undefined,
    canReceiveBulkAssignments: true,
    canReceiveGroupNotifications: true,
    status: "active",
    createdAt: "2025-11-15T08:00:00Z",
    updatedAt: "2025-11-15T08:00:00Z",
    createdBy: "user_001"
  },
  {
    id: "team_003",
    name: "[Sample] Austin Facility Safety Committee",
    description: "Monthly safety committee for Austin location",
    teamType: "location-based",
    primaryFunction: "general",
    memberIds: ["user_005", "user_007"],
    leaderId: "user_005",
    locationNodeId: "loc_austin",
    locationPath: "Global Operations > North America > United States > Austin Facility",
    canReceiveBulkAssignments: false,
    canReceiveGroupNotifications: true,
    status: "active",
    createdAt: "2025-10-20T14:00:00Z",
    updatedAt: "2025-10-20T14:00:00Z",
    createdBy: "user_001"
  },
];
