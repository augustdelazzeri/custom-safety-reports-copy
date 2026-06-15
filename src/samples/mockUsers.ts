/**
 * Mock EHS Users Data
 * 
 * Diverse user examples showing:
 * - Safety Managers at high-level nodes
 * - Safety Directors at mid-level nodes
 * - Field Technicians at leaf nodes
 * - Mix of active/inactive statuses
 */

import type { EHSUser } from "../schemas/users";

export const mockUsers: EHSUser[] = [
  {
    id: "user_001",
    firstName: "Sarah",
    lastName: "(Sample) Mitchell",
    email: "sarah.mitchell@company.com",
    roleId: "role_global_admin",
    roleName: "Global Admin",
    locationNodeId: "loc_global",
    locationPath: "Global Operations",
    status: "active",
    createdAt: new Date('2025-01-05T09:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-05T09:00:00Z').toISOString(),
    createdBy: "system",
  },
  {
    id: "user_002",
    firstName: "Marcus",
    lastName: "(Sample) Johnson",
    email: "marcus.johnson@company.com",
    roleId: "role_location_admin",
    roleName: "Location Admin",
    locationNodeId: "loc_na",
    locationPath: "Global Operations > North America",
    status: "active",
    createdAt: new Date('2025-01-06T10:30:00Z').toISOString(),
    updatedAt: new Date('2025-01-06T10:30:00Z').toISOString(),
  },
  {
    id: "user_003",
    firstName: "Jennifer",
    lastName: "(Sample) Chen",
    email: "jennifer.chen@company.com",
    roleId: "role_location_admin",
    roleName: "Location Admin",
    locationNodeId: "loc_chicago",
    locationPath: "Global Operations > North America > United States > Chicago Plant",
    status: "active",
    createdAt: new Date('2025-01-07T11:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-07T11:00:00Z').toISOString(),
  },
];
