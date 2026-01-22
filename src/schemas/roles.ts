/**
 * EHS Custom Role & Permissions Type Definitions
 * 
 * New structure: Module → Entity → Actions (3-level nested)
 * Aligned with FUNCTIONAL_SPECS.md and permissionsMock.ts
 */

import { EHS_PERMISSIONS, getActionKey } from '../data/permissionsMock';

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
 * Custom Role interface
 */
export interface CustomRole {
  id: string;
  name: string;
  permissions: RolePermissions;
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
  | 'access-point'
  | 'loto'
  | 'ptw'
  | 'jha'
  | 'sop'
  | 'audit';

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
