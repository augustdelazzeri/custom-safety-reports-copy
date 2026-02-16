/**
 * EHS Custom Role & Permissions Type Definitions
 * 
 * New structure: Module → Entity → Actions (3-level nested)
 * Aligned with FUNCTIONAL_SPECS.md and permissionsMock.ts
 */

import { EHS_PERMISSIONS, getActionKey, getActionIdFromKeys, isActionPaid, LICENSE_PRICE_YEARLY, LICENSE_PRICE_MONTHLY } from '../data/permissionsMock';

/**
 * Entity-level permissions: object with action keys as properties
 * Example: { create: true, view: true, edit: false, delete: false }
 */
export interface EntityPermissions {
  [actionKey: string]: boolean;
}

/**
 * Module-level permissions: object with entity names as properties
 * Example: { "Safety Event": { create: true, view: true }, "OSHA Report": { ... } }
 */
export interface ModulePermissions {
  [entityName: string]: EntityPermissions;
}

/**
 * Role permissions: object with module IDs as properties
 * Example: { event: { "Safety Event": { create: true } }, capa: { "CAPA": { ... } } }
 */
export interface RolePermissions {
  [moduleId: string]: ModulePermissions;
}

/**
 * OSHA Location-specific permissions
 * Maps establishment ID to OSHA entity permissions for that location
 */
export interface OSHALocationPermissions {
  [establishmentId: string]: ModulePermissions; // OSHA permissions for this establishment
}

/**
 * Custom Role interface
 */
export interface CustomRole {
  id: string;
  name: string;
  description?: string;        // Optional: 500 chars max, describes role scope
  permissions: RolePermissions;
  oshaLocationPermissions?: OSHALocationPermissions;  // OSHA permissions per establishment
  isSystemRole?: boolean;     // True for non-deletable template roles
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Helper type for permission checking
 */
export type PermissionModuleId = 
  | 'event'
  | 'capa'
  | 'osha'
  | 'work-order'
  | 'access-point'
  | 'loto'
  | 'ptw'
  | 'jha'
  | 'sop'
  | 'audit'
  | 'admin';

/**
 * Create default (empty) permissions structure based on EHS_PERMISSIONS
 */
export function createDefaultPermissions(): RolePermissions {
  const permissions: RolePermissions = {};
  
  EHS_PERMISSIONS.forEach(module => {
    permissions[module.moduleId] = {};
    
    module.features.forEach(feature => {
      permissions[module.moduleId][feature.entity] = {};
      
      feature.actions.forEach(action => {
        const actionKey = getActionKey(action.id);
        permissions[module.moduleId][feature.entity][actionKey] = false;
      });
    });
  });
  
  return permissions;
}

/**
 * Count enabled permissions across all modules, entities, and actions
 */
export function countEnabledPermissions(permissions: RolePermissions): number {
  let count = 0;
  
  // Iterate through all modules
  for (const moduleId in permissions) {
    const modulePerms = permissions[moduleId];
    
    // Iterate through all entities in the module
    for (const entityName in modulePerms) {
      const entityPerms = modulePerms[entityName];
      
      // Count enabled actions
      for (const actionKey in entityPerms) {
        if (entityPerms[actionKey] === true) {
          count++;
        }
      }
    }
  }
  
  return count;
}

/**
 * Get a specific permission value
 */
export function getPermissionValue(
  permissions: RolePermissions,
  moduleId: string,
  entityName: string,
  actionKey: string
): boolean {
  return permissions[moduleId]?.[entityName]?.[actionKey] ?? false;
}

/**
 * Set a specific permission value
 */
export function setPermissionValue(
  permissions: RolePermissions,
  moduleId: string,
  entityName: string,
  actionKey: string,
  value: boolean
): RolePermissions {
  return {
    ...permissions,
    [moduleId]: {
      ...permissions[moduleId],
      [entityName]: {
        ...permissions[moduleId]?.[entityName],
        [actionKey]: value
      }
    }
  };
}

/**
 * Check if all actions in a module are enabled
 */
export function isModuleFullySelected(permissions: RolePermissions, moduleId: string): boolean {
  const modulePerms = permissions[moduleId];
  if (!modulePerms) return false;
  
  for (const entityName in modulePerms) {
    const entityPerms = modulePerms[entityName];
    for (const actionKey in entityPerms) {
      if (entityPerms[actionKey] !== true) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Check if some (but not all) actions in a module are enabled
 */
export function isModulePartiallySelected(permissions: RolePermissions, moduleId: string): boolean {
  const modulePerms = permissions[moduleId];
  if (!modulePerms) return false;
  
  let hasEnabled = false;
  let hasDisabled = false;
  
  for (const entityName in modulePerms) {
    const entityPerms = modulePerms[entityName];
    for (const actionKey in entityPerms) {
      if (entityPerms[actionKey] === true) {
        hasEnabled = true;
      } else {
        hasDisabled = true;
      }
      
      if (hasEnabled && hasDisabled) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if all actions in an entity are enabled
 */
export function isEntityFullySelected(
  permissions: RolePermissions,
  moduleId: string,
  entityName: string
): boolean {
  const entityPerms = permissions[moduleId]?.[entityName];
  if (!entityPerms) return false;
  
  for (const actionKey in entityPerms) {
    if (entityPerms[actionKey] !== true) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if some (but not all) actions in an entity are enabled
 */
export function isEntityPartiallySelected(
  permissions: RolePermissions,
  moduleId: string,
  entityName: string
): boolean {
  const entityPerms = permissions[moduleId]?.[entityName];
  if (!entityPerms) return false;
  
  let hasEnabled = false;
  let hasDisabled = false;
  
  for (const actionKey in entityPerms) {
    if (entityPerms[actionKey] === true) {
      hasEnabled = true;
    } else {
      hasDisabled = true;
    }
    
    if (hasEnabled && hasDisabled) {
      return true;
    }
  }
  
  return false;
}

/**
 * Enable/disable all actions in a module
 */
export function toggleModulePermissions(
  permissions: RolePermissions,
  moduleId: string,
  enable: boolean
): RolePermissions {
  const updatedModule: ModulePermissions = {};
  
  const module = EHS_PERMISSIONS.find(m => m.moduleId === moduleId);
  if (!module) return permissions;
  
  module.features.forEach(feature => {
    updatedModule[feature.entity] = {};
    feature.actions.forEach(action => {
      const actionKey = getActionKey(action.id);
      updatedModule[feature.entity][actionKey] = enable;
    });
  });
  
  return {
    ...permissions,
    [moduleId]: updatedModule
  };
}

/**
 * Enable/disable all actions in an entity
 */
export function toggleEntityPermissions(
  permissions: RolePermissions,
  moduleId: string,
  entityName: string,
  enable: boolean
): RolePermissions {
  const module = EHS_PERMISSIONS.find(m => m.moduleId === moduleId);
  if (!module) return permissions;
  
  const feature = module.features.find(f => f.entity === entityName);
  if (!feature) return permissions;
  
  const updatedEntity: EntityPermissions = {};
  feature.actions.forEach(action => {
    const actionKey = getActionKey(action.id);
    updatedEntity[actionKey] = enable;
  });
  
  return {
    ...permissions,
    [moduleId]: {
      ...permissions[moduleId],
      [entityName]: updatedEntity
    }
  };
}

/**
 * Check if all permissions globally are enabled
 */
export function isGloballyFullySelected(permissions: RolePermissions): boolean {
  for (const moduleId in permissions) {
    if (!isModuleFullySelected(permissions, moduleId)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if some (but not all) permissions globally are enabled
 */
export function isGloballyPartiallySelected(permissions: RolePermissions): boolean {
  let hasEnabled = false;
  let hasDisabled = false;
  
  for (const moduleId in permissions) {
    const modulePerms = permissions[moduleId];
    for (const entityName in modulePerms) {
      const entityPerms = modulePerms[entityName];
      for (const actionKey in entityPerms) {
        if (entityPerms[actionKey] === true) {
          hasEnabled = true;
        } else {
          hasDisabled = true;
        }
        
        if (hasEnabled && hasDisabled) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Enable/disable all permissions globally
 */
export function toggleGlobalPermissions(permissions: RolePermissions, enable: boolean): RolePermissions {
  const updated: RolePermissions = {};
  
  EHS_PERMISSIONS.forEach(module => {
    updated[module.moduleId] = {};
    module.features.forEach(feature => {
      updated[module.moduleId][feature.entity] = {};
      feature.actions.forEach(action => {
        const actionKey = getActionKey(action.id);
        updated[module.moduleId][feature.entity][actionKey] = enable;
      });
    });
  });
  
  return updated;
}

// --- EHS Role-Based Licensing (binary: Paid vs Free) ---
export type LicenseType = 'paid' | 'free';

export { LICENSE_PRICE_YEARLY, LICENSE_PRICE_MONTHLY } from '../data/permissionsMock';

export function countPaidPermissions(permissions: RolePermissions): number {
  let count = 0;
  for (const moduleId in permissions) {
    for (const entityName in permissions[moduleId]) {
      for (const actionKey in permissions[moduleId][entityName]) {
        if (permissions[moduleId][entityName][actionKey] !== true) continue;
        const actionId = getActionIdFromKeys(moduleId, entityName, actionKey);
        if (actionId && isActionPaid(actionId)) count++;
      }
    }
  }
  return count;
}

export function countFreePermissions(permissions: RolePermissions): number {
  let count = 0;
  for (const moduleId in permissions) {
    for (const entityName in permissions[moduleId]) {
      for (const actionKey in permissions[moduleId][entityName]) {
        if (permissions[moduleId][entityName][actionKey] !== true) continue;
        const actionId = getActionIdFromKeys(moduleId, entityName, actionKey);
        if (actionId && !isActionPaid(actionId)) count++;
      }
    }
  }
  return count;
}

export function getRoleLicenseType(permissions: RolePermissions): LicenseType {
  return countPaidPermissions(permissions) > 0 ? 'paid' : 'free';
}

/** System View-Only role is always free (view-only access only). */
export function isViewOnlyRoleName(roleName: string): boolean {
  const n = roleName.trim().toLowerCase().replace(/\s+/g, ' ');
  return n === 'view-only' || n === 'view only';
}

/** System Technician role is always free (View-Only + create/edit own Safety Events). */
export function isTechnicianSystemRoleName(roleName: string): boolean {
  const n = roleName.trim().toLowerCase();
  return n === 'technician';
}

/** Role is free if it's View-Only or Technician (system free roles); otherwise based on permissions. */
export function getRoleLicenseTypeDisplay(role: { name: string; permissions: RolePermissions }): LicenseType {
  if (isViewOnlyRoleName(role.name) || isTechnicianSystemRoleName(role.name)) return 'free';
  return getRoleLicenseType(role.permissions);
}

export interface LicenseStatusSummary {
  type: LicenseType;
  paidPermissions: number;
  freePermissions: number;
  priceYearly: number;
  priceMonthly: number;
}

export function getLicenseStatusSummary(permissions: RolePermissions): LicenseStatusSummary {
  const paid = countPaidPermissions(permissions);
  const free = countFreePermissions(permissions);
  const type: LicenseType = paid > 0 ? 'paid' : 'free';
  return {
    type,
    paidPermissions: paid,
    freePermissions: free,
    priceYearly: type === 'paid' ? LICENSE_PRICE_YEARLY : 0,
    priceMonthly: type === 'paid' ? LICENSE_PRICE_MONTHLY : 0
  };
}

export function hasOSHAAccess(permissions: RolePermissions, oshaLocationPermissions?: OSHALocationPermissions): boolean {
  const oshaModule = permissions['osha'];
  if (oshaModule) {
    for (const entityName in oshaModule) {
      for (const actionKey in oshaModule[entityName]) {
        if (oshaModule[entityName][actionKey] === true) return true;
      }
    }
  }
  if (oshaLocationPermissions && Object.keys(oshaLocationPermissions).length > 0) {
    for (const estId in oshaLocationPermissions) {
      const perms = oshaLocationPermissions[estId];
      for (const entityName in perms) {
        for (const actionKey in perms[entityName]) {
          if (perms[entityName][actionKey] === true) return true;
        }
      }
    }
  }
  return false;
}

export function validateViewOnlyRole(
  permissions: RolePermissions,
  oshaLocationPermissions?: OSHALocationPermissions
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (countPaidPermissions(permissions) > 0) {
    errors.push('View Only roles cannot have Create, Edit, Submit, or Approve permissions.');
  }
  if (hasOSHAAccess(permissions, oshaLocationPermissions)) {
    errors.push('View Only roles must have zero access to OSHA content or data.');
  }
  return { valid: errors.length === 0, errors };
}
