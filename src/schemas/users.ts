/**
 * EHS User Type Definitions
 * 
 * Defines EHS user entities with assigned roles and location scoping.
 * Users inherit visibility for their assigned location node and all children.
 */

export interface EHSUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;             // References CustomRole.id
  roleName?: string;          // Denormalized for display (populated from RoleContext)
  locationNodeId: string;     // References LocationNode.id
  locationPath?: string;      // Denormalized breadcrumb path (e.g., "North America > USA > Plant A")
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Utility function to get full name
export function getUserFullName(user: EHSUser): string {
  return `${user.firstName} ${user.lastName}`;
}

// Utility function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility type for user creation form
export interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  locationNodeId: string;
}

// Utility type for user filters
export interface UserFilters {
  searchQuery: string;
  roleId: string | 'all';
  status: 'all' | 'active' | 'inactive' | 'pending';
}
