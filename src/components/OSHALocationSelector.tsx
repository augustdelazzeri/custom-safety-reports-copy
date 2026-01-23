/**
 * OSHA Location Selector Component
 * 
 * Tab-based interface for configuring OSHA permissions per establishment.
 * Each tab represents an OSHA-registered establishment where users can
 * enable/disable specific OSHA permissions for that location.
 */

import React, { useState } from "react";
import { mockOSHAEstablishments } from "../samples/oshaEstablishments";
import type { OSHALocationPermissions, ModulePermissions } from "../schemas/roles";
import { EHS_PERMISSIONS, PERMISSION_CATEGORIES, getModuleCategories, getCategoryLabel, getActionsByCategory, type PermissionCategory } from "../data/permissionsMock";
import { getPermissionValue, setPermissionValue } from "../schemas/roles";

interface OSHALocationSelectorProps {
  permissions: OSHALocationPermissions;
  onChange: (permissions: OSHALocationPermissions) => void;
  disabled?: boolean;
  simpleMode?: boolean;
}

export default function OSHALocationSelector({
  permissions,
  onChange,
  disabled = false,
  simpleMode = false
}: OSHALocationSelectorProps) {
  
  const [activeTab, setActiveTab] = useState(mockOSHAEstablishments[0]?.id || "");
  
  // Get OSHA module structure
  const oshaModule = EHS_PERMISSIONS.find(m => m.moduleId === "osha");
  if (!oshaModule) return null;

  const handleTogglePermission = (establishmentId: string, entityName: string, actionId: string) => {
    if (disabled) return;
    
    const actionKey = actionId.split(":")[1]; // Extract action key from "osha:create" -> "create"
    
    // Get current establishment permissions or initialize empty
    const establishmentPerms = permissions[establishmentId] || {};
    
    // Get current value
    const currentValue = getPermissionValue({ osha: establishmentPerms }, "osha", entityName, actionKey);
    
    // Update value
    const updatedEstablishmentPerms = setPermissionValue(
      { osha: establishmentPerms },
      "osha",
      entityName,
      actionKey,
      !currentValue
    ).osha;
    
    // Update overall permissions
    onChange({
      ...permissions,
      [establishmentId]: updatedEstablishmentPerms
    });
  };

  const handleToggleCategory = (establishmentId: string, category: PermissionCategory) => {
    if (disabled) return;
    
    const establishmentPerms = permissions[establishmentId] || {};
    const actionIds = getActionsByCategory(oshaModule, category);
    
    // Check if all actions in category are enabled
    let allEnabled = true;
    for (const actionId of actionIds) {
      const actionKey = actionId.split(":")[1];
      for (const feature of oshaModule.features) {
        const action = feature.actions.find(a => a.id === actionId);
        if (action) {
          if (!getPermissionValue({ osha: establishmentPerms }, "osha", feature.entity, actionKey)) {
            allEnabled = false;
            break;
          }
        }
      }
      if (!allEnabled) break;
    }
    
    // Toggle all actions in category
    let updatedEstablishmentPerms = establishmentPerms;
    for (const actionId of actionIds) {
      const actionKey = actionId.split(":")[1];
      for (const feature of oshaModule.features) {
        const action = feature.actions.find(a => a.id === actionId);
        if (action) {
          updatedEstablishmentPerms = setPermissionValue(
            { osha: updatedEstablishmentPerms },
            "osha",
            feature.entity,
            actionKey,
            !allEnabled
          ).osha;
        }
      }
    }
    
    onChange({
      ...permissions,
      [establishmentId]: updatedEstablishmentPerms
    });
  };

  const isCategoryFullySelected = (establishmentId: string, category: PermissionCategory): boolean => {
    const establishmentPerms = permissions[establishmentId] || {};
    const actionIds = getActionsByCategory(oshaModule, category);
    
    for (const actionId of actionIds) {
      const actionKey = actionId.split(":")[1];
      for (const feature of oshaModule.features) {
        const action = feature.actions.find(a => a.id === actionId);
        if (action) {
          if (!getPermissionValue({ osha: establishmentPerms }, "osha", feature.entity, actionKey)) {
            return false;
          }
        }
      }
    }
    return actionIds.length > 0;
  };

  const isCategoryPartiallySelected = (establishmentId: string, category: PermissionCategory): boolean => {
    const establishmentPerms = permissions[establishmentId] || {};
    const actionIds = getActionsByCategory(oshaModule, category);
    let someEnabled = false;
    let allEnabled = true;
    
    for (const actionId of actionIds) {
      const actionKey = actionId.split(":")[1];
      for (const feature of oshaModule.features) {
        const action = feature.actions.find(a => a.id === actionId);
        if (action) {
          const enabled = getPermissionValue({ osha: establishmentPerms }, "osha", feature.entity, actionKey);
          if (enabled) someEnabled = true;
          if (!enabled) allEnabled = false;
        }
      }
    }
    
    return someEnabled && !allEnabled;
  };

  const getActiveEstablishmentPermissions = (): ModulePermissions => {
    return permissions[activeTab] || {};
  };

  return (
    <div className="space-y-3">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>🔒</span>
          <span>OSHA Establishment Access</span>
        </h4>
        <p className="text-xs text-gray-600 mt-1">
          Configure which OSHA actions this role can perform at each establishment
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {mockOSHAEstablishments.map((establishment) => {
          const isActive = activeTab === establishment.id;
          const estPerms = permissions[establishment.id] || {};
          const hasPermissions = Object.keys(estPerms).length > 0 && Object.values(estPerms).some(entity =>
            Object.values(entity).some(val => val === true)
          );
          
          return (
            <button
              key={establishment.id}
              type="button"
              onClick={() => setActiveTab(establishment.id)}
              disabled={disabled}
              className={`
                relative px-3 py-2 text-xs font-medium border-b-2 transition-colors
                ${isActive
                  ? "border-blue-500 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex items-center gap-1.5">
                <span>{establishment.name}</span>
                {hasPermissions && (
                  <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-blue-600 rounded-full">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {establishment.city}, {establishment.state}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">

        {/* OSHA Permissions - Simple or Advanced Mode */}
        {simpleMode ? (
          /* SIMPLE MODE: Show Categories */
          <div className="grid grid-cols-2 gap-2">
            {getModuleCategories(oshaModule).map((category) => {
              const categoryFullySelected = isCategoryFullySelected(activeTab, category);
              const categoryPartiallySelected = isCategoryPartiallySelected(activeTab, category);
              const categoryInfo = PERMISSION_CATEGORIES.find(c => c.id === category);
              
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleToggleCategory(activeTab, category)}
                  disabled={disabled}
                  className={`flex items-start gap-2 p-2.5 rounded border transition-colors text-left ${
                    disabled
                      ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-50"
                      : categoryFullySelected
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                  }`}
                >
                  <div className={`mt-0.5 relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    disabled 
                      ? "bg-gray-200 border-gray-300" 
                      : categoryFullySelected
                        ? "bg-blue-600 border-blue-600"
                        : categoryPartiallySelected
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-300"
                  }`}>
                    {categoryFullySelected ? (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : categoryPartiallySelected ? (
                      <div className="w-2 h-0.5 bg-white rounded" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{categoryInfo?.label || category}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{categoryInfo?.description || ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* ADVANCED MODE: Show Individual Actions */
          <div className="space-y-3">
            {oshaModule.features.map((feature) => {
              const establishmentPerms = getActiveEstablishmentPermissions();
              
              return (
                <div key={feature.entity} className="border border-gray-200 rounded-md overflow-hidden">
                  {/* Entity Header */}
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700">{feature.entity}</h5>
                  </div>
                  
                  {/* Actions Grid */}
                  <div className="p-2 grid grid-cols-2 gap-2">
                    {feature.actions.map((action) => {
                      const actionKey = action.id.split(":")[1];
                      const checked = getPermissionValue(
                        { osha: establishmentPerms },
                        "osha",
                        feature.entity,
                        actionKey
                      );
                      
                      return (
                        <label
                          key={action.id}
                          className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${
                            disabled
                              ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-50"
                              : checked
                                ? "bg-blue-50 border-blue-300"
                                : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePermission(activeTab, feature.entity, action.id)}
                            disabled={disabled}
                            className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900">{action.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{action.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
