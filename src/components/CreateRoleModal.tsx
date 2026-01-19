/**
 * Create Role Modal Component
 * 
 * Modal for creating and editing custom roles.
 * Includes role name input with duplicate validation and RoleBuilderMatrix.
 */

import React, { useState, useEffect } from "react";
import RoleBuilderMatrix from "./RoleBuilderMatrix";
import { createDefaultPermissions, countEnabledPermissions } from "../schemas/roles";
import type { CustomRole, RolePermissions } from "../schemas/roles";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, permissions: RolePermissions) => void;
  existingRole?: CustomRole; // For edit mode
  checkDuplicateName: (name: string, excludeId?: string) => boolean;
}

export default function CreateRoleModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  existingRole,
  checkDuplicateName 
}: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<RolePermissions>(createDefaultPermissions());
  const [error, setError] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);

  const isEditMode = !!existingRole;

  // Reset form when modal opens/closes or when existingRole changes
  useEffect(() => {
    if (isOpen) {
      if (existingRole) {
        setRoleName(existingRole.name);
        setPermissions(existingRole.permissions);
      } else {
        setRoleName("");
        setPermissions(createDefaultPermissions());
      }
      setError("");
    }
  }, [isOpen, existingRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate role name
    const trimmedName = roleName.trim();
    if (!trimmedName) {
      setError("Role name is required");
      return;
    }

    if (trimmedName.length < 3) {
      setError("Role name must be at least 3 characters");
      return;
    }

    // Check for duplicate name
    const isDuplicate = checkDuplicateName(trimmedName, existingRole?.id);
    if (isDuplicate) {
      setError(`A role named "${trimmedName}" already exists`);
      return;
    }

    // Validate at least one permission is enabled
    const enabledCount = countEnabledPermissions(permissions);
    if (enabledCount === 0) {
      setError("At least one permission must be enabled");
      return;
    }

    onSubmit(trimmedName, permissions);
  };

  const handleCancel = () => {
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-50" 
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? "Edit Role" : "Create Custom Role"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEditMode ? "Update role name and permissions" : "Define a new role with specific permissions"}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 space-y-6 overflow-y-auto flex-1">
            
            {/* Role Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => {
                  setRoleName(e.target.value);
                  setError("");
                }}
                placeholder="e.g., Safety Coordinator, Site Inspector"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                  error && error.includes("name")
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                disabled={existingRole?.isSystemRole}
              />
              {existingRole?.isSystemRole && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  System role names cannot be changed
                </p>
              )}
            </div>

            {/* Permissions Matrix */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Permissions <span className="text-red-500">*</span>
                </label>
                
                {/* Advanced Mode Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Simple</span>
                  <button
                    type="button"
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      advancedMode ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    disabled={existingRole?.isSystemRole}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        advancedMode ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-medium ${advancedMode ? "text-blue-600" : "text-gray-600"}`}>
                    Advanced
                  </span>
                </div>
              </div>
              
              <RoleBuilderMatrix 
                permissions={permissions} 
                onChange={setPermissions}
                disabled={existingRole?.isSystemRole}
                advancedMode={advancedMode}
              />
              {existingRole?.isSystemRole && (
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  System role permissions are locked. Clone this role to create a customizable version.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={existingRole?.isSystemRole}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? "Save Changes" : "Create Role"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
