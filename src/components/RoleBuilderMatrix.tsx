/**
 * Role Builder Matrix Component
 * 
 * Permissions matrix for creating/editing custom roles.
 * Supports Simple and Advanced modes with 3-level hierarchy (Module → Entity → Actions)
 * 
 * Simple Mode: Groups actions by category (View, Editor, Collaboration, etc.)
 * Advanced Mode: Shows all individual actions
 */

import React from "react";
import type { RolePermissions } from "../schemas/roles";
import {
  getPermissionValue,
  setPermissionValue,
  isModuleFullySelected,
  isModulePartiallySelected,
  isEntityFullySelected,
  isEntityPartiallySelected,
  isGloballyFullySelected,
  isGloballyPartiallySelected,
  toggleModulePermissions,
  toggleEntityPermissions,
  toggleGlobalPermissions
} from "../schemas/roles";
import { 
  EHS_PERMISSIONS, 
  getVisibleModules, 
  getActionKey,
  getActionsByCategory,
  getModuleCategories,
  getCategoryLabel,
  PERMISSION_CATEGORIES,
  type PermissionCategory
} from "../data/permissionsMock";

interface RoleBuilderMatrixProps {
  permissions: RolePermissions;
  onChange: (permissions: RolePermissions) => void;
  disabled?: boolean;
  advancedMode?: boolean;
}

export default function RoleBuilderMatrix({ 
  permissions, 
  onChange, 
  disabled = false,
  advancedMode = false
}: RoleBuilderMatrixProps) {
  
  // Calculate simpleMode internally based on advancedMode
  const simpleMode = !advancedMode;
  
  // Filter modules based on advanced mode
  const visibleModules = getVisibleModules(advancedMode);
  
  const handleToggleAction = (moduleId: string, entityName: string, actionId: string) => {
    if (disabled) return;
    const actionKey = getActionKey(actionId);
    const currentValue = getPermissionValue(permissions, moduleId, entityName, actionKey);
    const updated = setPermissionValue(permissions, moduleId, entityName, actionKey, !currentValue);
    onChange(updated);
  };
  
  // NEW: Handle category toggle (Simple Mode)
  const handleToggleCategory = (moduleId: string, category: PermissionCategory) => {
    if (disabled) return;
    const module = EHS_PERMISSIONS.find(m => m.moduleId === moduleId);
    if (!module) return;
    
    // Get all action IDs in this category
    const actionIds = getActionsByCategory(module, category);
    
    // Check if all actions in category are enabled
    let allEnabled = true;
    for (const actionId of actionIds) {
      const actionKey = getActionKey(actionId);
      // Find entity for this action
      for (const feature of module.features) {
        const action = feature.actions.find(a => a.id === actionId);
        if (action) {
          if (!getPermissionValue(permissions, moduleId, feature.entity, actionKey)) {
            allEnabled = false;
            break;
          }
        }
      }
      if (!allEnabled) break;
    }
    
    // Toggle all actions in category
    let updated = { ...permissions };
    for (const actionId of actionIds) {
      const actionKey = getActionKey(actionId);
      for (const feature of module.features) {
        const action = feature.actions.find(a => a.id === actionId);
        if (action) {
          updated = setPermissionValue(updated, moduleId, feature.entity, actionKey, !allEnabled);
        }
      }
    }
    
    onChange(updated);
  };
  
  // NEW: Check if category is fully selected
  const isCategoryFullySelected = (moduleId: string, category: PermissionCategory): boolean => {
    const module = EHS_PERMISSIONS.find(m => m.moduleId === moduleId);
    if (!module) return false;
    
    const actionIds = getActionsByCategory(module, category);
    for (const actionId of actionIds) {
      const actionKey = getActionKey(actionId);
      for (const feature of module.features) {
        const action = feature.actions.find(a => a.id === actionId);
        if (action) {
          if (!getPermissionValue(permissions, moduleId, feature.entity, actionKey)) {
            return false;
          }
        }
      }
    }
    return actionIds.length > 0;
  };
  
  // NEW: Check if category is partially selected
  const isCategoryPartiallySelected = (moduleId: string, category: PermissionCategory): boolean => {
    const module = EHS_PERMISSIONS.find(m => m.moduleId === moduleId);
    if (!module) return false;
    
    const actionIds = getActionsByCategory(module, category);
    let someEnabled = false;
    let allEnabled = true;
    
    for (const actionId of actionIds) {
      const actionKey = getActionKey(actionId);
      for (const feature of module.features) {
        const action = feature.actions.find(a => a.id === actionId);
        if (action) {
          const enabled = getPermissionValue(permissions, moduleId, feature.entity, actionKey);
          if (enabled) someEnabled = true;
          if (!enabled) allEnabled = false;
        }
      }
    }
    
    return someEnabled && !allEnabled;
  };
  
  const handleSelectAllModule = (moduleId: string) => {
    if (disabled) return;
    const isFullySelected = isModuleFullySelected(permissions, moduleId);
    const updated = toggleModulePermissions(permissions, moduleId, !isFullySelected);
    onChange(updated);
  };
  
  const handleSelectAllEntity = (moduleId: string, entityName: string) => {
    if (disabled) return;
    const isFullySelected = isEntityFullySelected(permissions, moduleId, entityName);
    const updated = toggleEntityPermissions(permissions, moduleId, entityName, !isFullySelected);
    onChange(updated);
  };
  
  const handleSelectAllGlobal = () => {
    if (disabled) return;
    const isFullySelected = isGloballyFullySelected(permissions);
    const updated = toggleGlobalPermissions(permissions, !isFullySelected);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Global Select All */}
      <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSelectAllGlobal}
            disabled={disabled}
            className={`relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
              disabled 
                ? "bg-gray-200 border-gray-300 cursor-not-allowed" 
                : isGloballyFullySelected(permissions)
                  ? "bg-blue-600 border-blue-600"
                  : isGloballyPartiallySelected(permissions)
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300"
            }`}
          >
            {isGloballyFullySelected(permissions) ? (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : isGloballyPartiallySelected(permissions) ? (
              <div className="w-2 h-0.5 bg-white rounded" />
            ) : null}
          </button>
          <div>
            <label className={`text-sm font-bold ${disabled ? "text-gray-400" : "text-blue-900"}`}>
              Select All Permissions
            </label>
            <p className={`text-xs mt-0.5 ${disabled ? "text-gray-400" : "text-blue-700"}`}>
              Enable or disable all permissions across all categories
            </p>
          </div>
        </div>
      </div>
      
      {/* Modules */}
      {visibleModules.map((module) => {
        const isOSHA = module.moduleId === 'osha';
        const moduleFullySelected = isModuleFullySelected(permissions, module.moduleId);
        const modulePartiallySelected = isModulePartiallySelected(permissions, module.moduleId);
        
        return (
          <div
            key={module.moduleId}
            className={`border rounded-lg overflow-hidden ${
              isOSHA ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
            }`}
          >
            {/* Module Header */}
            <div className={`px-4 py-3 border-b ${
              isOSHA ? 'bg-amber-100 border-amber-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-start gap-2">
                  {isOSHA && (
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${isOSHA ? 'text-amber-900' : 'text-gray-900'}`}>
                      {module.moduleName}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isOSHA ? 'text-amber-700' : 'text-gray-600'}`}>
                      {module.description}
                      {isOSHA && <span className="font-medium"> ⚠️ Contains PII</span>}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectAllModule(module.moduleId)}
                  disabled={disabled}
                  className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    disabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : moduleFullySelected
                        ? isOSHA
                          ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : isOSHA
                          ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className={`relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    disabled 
                      ? "bg-gray-200 border-gray-300" 
                      : moduleFullySelected
                        ? isOSHA ? "bg-amber-600 border-amber-600" : "bg-blue-600 border-blue-600"
                        : modulePartiallySelected
                          ? isOSHA ? "bg-amber-600 border-amber-600" : "bg-blue-600 border-blue-600"
                          : isOSHA ? "bg-white border-amber-500" : "bg-white border-gray-400"
                  }`}>
                    {moduleFullySelected ? (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : modulePartiallySelected ? (
                      <div className="w-1.5 h-0.5 bg-white rounded" />
                    ) : null}
                  </div>
                  Select All
                </button>
              </div>
            </div>
            
            {/* SIMPLE MODE: Show Categories */}
            {simpleMode ? (
              <div className="bg-white px-4 py-3 space-y-3">
                {getModuleCategories(module).map((category) => {
                  const categoryFullySelected = isCategoryFullySelected(module.moduleId, category);
                  const categoryPartiallySelected = isCategoryPartiallySelected(module.moduleId, category);
                  const categoryInfo = PERMISSION_CATEGORIES.find(c => c.id === category);
                  
                  return (
                    <CategoryToggle
                      key={category}
                      label={categoryInfo?.label || category}
                      description={categoryInfo?.description || ''}
                      checked={categoryFullySelected}
                      partial={categoryPartiallySelected}
                      onChange={() => handleToggleCategory(module.moduleId, category)}
                      disabled={disabled}
                    />
                  );
                })}
              </div>
            ) : (
              // ADVANCED MODE: Show Individual Actions
              <>
                {module.features.map((feature, featureIndex) => {
                  const showEntityHeader = module.features.length > 1;
                  const entityFullySelected = isEntityFullySelected(permissions, module.moduleId, feature.entity);
                  const entityPartiallySelected = isEntityPartiallySelected(permissions, module.moduleId, feature.entity);
                  
                  return (
                    <div key={feature.entity} className="bg-white">
                      {/* Entity Sub-header (only if module has multiple entities) */}
                      {showEntityHeader && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-gray-700">{feature.entity}</h4>
                          <button
                            type="button"
                            onClick={() => handleSelectAllEntity(module.moduleId, feature.entity)}
                            disabled={disabled}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                              disabled
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : entityFullySelected
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            <div className={`relative inline-flex h-3 w-3 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                              disabled 
                                ? "bg-gray-200 border-gray-300" 
                                : entityFullySelected
                                  ? "bg-blue-600 border-blue-600"
                                  : entityPartiallySelected
                                    ? "bg-blue-600 border-blue-600"
                                    : "bg-white border-gray-400"
                            }`}>
                              {entityFullySelected ? (
                                <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : entityPartiallySelected ? (
                                <div className="w-1 h-0.5 bg-white rounded" />
                              ) : null}
                            </div>
                            <span>Select All</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Actions Grid */}
                      <div className={`px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5 ${featureIndex < module.features.length - 1 ? 'border-b border-gray-200' : ''}`}>
                        {feature.actions.map((action) => {
                          const actionKey = getActionKey(action.id);
                          const checked = getPermissionValue(permissions, module.moduleId, feature.entity, actionKey);
                          const isWarning = isOSHA && (actionKey.includes('export') || actionKey.includes('pii'));
                          
                          return (
                            <PermissionToggle
                              key={action.id}
                              label={action.label}
                              description={action.description}
                              checked={checked}
                              onChange={() => handleToggleAction(module.moduleId, feature.entity, action.id)}
                              disabled={disabled}
                              warning={isWarning}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Category Toggle Component (Simple Mode)
interface CategoryToggleProps {
  label: string;
  description: string;
  checked: boolean;
  partial?: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function CategoryToggle({ 
  label, 
  description, 
  checked, 
  partial = false,
  onChange, 
  disabled = false
}: CategoryToggleProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`mt-0.5 relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
          disabled 
            ? "bg-gray-200 border-gray-300 cursor-not-allowed" 
            : checked
              ? "bg-blue-600 border-blue-600"
              : partial
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-300 hover:border-blue-400"
        }`}
      >
        {checked ? (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : partial ? (
          <div className="w-2 h-0.5 bg-white rounded" />
        ) : null}
      </button>
      <div className="flex-1 min-w-0">
        <label className={`text-sm font-semibold ${
          disabled ? "text-gray-400" : "text-gray-900"
        }`}>
          {label}
        </label>
        <p className={`text-xs mt-0.5 ${
          disabled ? "text-gray-400" : "text-gray-600"
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
}

// Permission Toggle Component (Advanced Mode)
interface PermissionToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  warning?: boolean;
}

function PermissionToggle({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false,
  warning = false
}: PermissionToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`mt-0.5 relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
          disabled 
            ? "bg-gray-200 cursor-not-allowed" 
            : checked 
              ? "bg-blue-600" 
              : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${
            disabled ? "text-gray-400" : "text-gray-900"
          }`}>
            {label}
          </label>
          {warning && (
            <span className="text-amber-600">⚠️</span>
          )}
        </div>
        <p className={`text-xs mt-0.5 ${
          disabled ? "text-gray-400" : "text-gray-600"
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
}
