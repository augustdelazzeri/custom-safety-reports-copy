/**
 * OSHA Location Selector Component
 * 
 * Multi-select checkbox interface for OSHA establishment access scoping.
 * Used in Custom Roles to restrict which OSHA establishments a role can access.
 */

import React from "react";
import { mockOSHAEstablishments, type OSHAEstablishment } from "../samples/oshaEstablishments";

interface OSHALocationSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export default function OSHALocationSelector({
  selectedIds,
  onChange,
  disabled = false
}: OSHALocationSelectorProps) {
  
  const handleToggle = (establishmentId: string) => {
    if (disabled) return;
    
    if (selectedIds.includes(establishmentId)) {
      // Remove from selection
      onChange(selectedIds.filter(id => id !== establishmentId));
    } else {
      // Add to selection
      onChange([...selectedIds, establishmentId]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange(mockOSHAEstablishments.map(est => est.id));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const allSelected = selectedIds.length === mockOSHAEstablishments.length;
  const noneSelected = selectedIds.length === 0;

  return (
    <div className="space-y-3">
      {/* Header with Select All / Clear All */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {selectedIds.length} of {mockOSHAEstablishments.length} establishments selected
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled || allSelected}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled || noneSelected}
            className="text-xs text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Establishment List */}
      <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
        {mockOSHAEstablishments.map((establishment) => {
          const isSelected = selectedIds.includes(establishment.id);
          
          return (
            <label
              key={establishment.id}
              className={`flex items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(establishment.id)}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:cursor-not-allowed"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {establishment.name}
                  </span>
                  {establishment.establishmentNumber && (
                    <span className="text-xs text-gray-500 ml-2">
                      #{establishment.establishmentNumber}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {establishment.city}, {establishment.state}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Helper Text */}
      {selectedIds.length === 0 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          At least one establishment must be selected if OSHA permissions are enabled
        </p>
      )}
    </div>
  );
}
