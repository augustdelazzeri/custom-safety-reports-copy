/**
 * Role Builder Matrix Component
 * 
 * Permissions matrix for creating/editing custom roles.
 * Features 5 categories with granular permission toggles:
 * - Safety Events
 * - CAPAs
 * - Compliance (with PII warning)
 * - Documentation
 * - CMMS Bridge (with tooltip)
 */

import React from "react";
import type { RolePermissions } from "../schemas/roles";

interface RoleBuilderMatrixProps {
  permissions: RolePermissions;
  onChange: (permissions: RolePermissions) => void;
  disabled?: boolean;
}

export default function RoleBuilderMatrix({ permissions, onChange, disabled = false }: RoleBuilderMatrixProps) {
  
  const handleToggle = (category: keyof RolePermissions, permission: string) => {
    const updated = {
      ...permissions,
      [category]: {
        ...permissions[category],
        [permission]: !permissions[category][permission as keyof typeof permissions[typeof category]],
      },
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Safety Events Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Safety Events</h3>
          <p className="text-xs text-gray-600 mt-0.5">Control access to incident and near-miss reporting</p>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5">
          <PermissionToggle
            label="Create"
            description="Create new safety event reports"
            checked={permissions.safetyEvents.create}
            onChange={() => handleToggle('safetyEvents', 'create')}
            disabled={disabled}
          />
          <PermissionToggle
            label="View All"
            description="View all safety events across assigned locations"
            checked={permissions.safetyEvents.viewAll}
            onChange={() => handleToggle('safetyEvents', 'viewAll')}
            disabled={disabled}
          />
          <PermissionToggle
            label="Edit Own"
            description="Edit safety events created by this user"
            checked={permissions.safetyEvents.editOwn}
            onChange={() => handleToggle('safetyEvents', 'editOwn')}
            disabled={disabled}
          />
          <PermissionToggle
            label="Edit All"
            description="Edit any safety event in assigned locations"
            checked={permissions.safetyEvents.editAll}
            onChange={() => handleToggle('safetyEvents', 'editAll')}
            disabled={disabled}
          />
          <PermissionToggle
            label="Delete"
            description="Permanently delete safety event reports"
            checked={permissions.safetyEvents.delete}
            onChange={() => handleToggle('safetyEvents', 'delete')}
            disabled={disabled}
          />
        </div>
      </div>

      {/* CAPAs Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Corrective & Preventive Actions (CAPAs)</h3>
          <p className="text-xs text-gray-600 mt-0.5">Manage follow-up actions from safety events</p>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5">
          <PermissionToggle
            label="Create"
            description="Create new CAPA items"
            checked={permissions.capas.create}
            onChange={() => handleToggle('capas', 'create')}
            disabled={disabled}
          />
          <PermissionToggle
            label="Assign"
            description="Assign CAPAs to team members"
            checked={permissions.capas.assign}
            onChange={() => handleToggle('capas', 'assign')}
            disabled={disabled}
          />
          <PermissionToggle
            label="Approve/Close"
            description="Approve completion and close CAPA items"
            checked={permissions.capas.approveClose}
            onChange={() => handleToggle('capas', 'approveClose')}
            disabled={disabled}
          />
          <PermissionToggle
            label="View All"
            description="View all CAPAs in assigned locations"
            checked={permissions.capas.viewAll}
            onChange={() => handleToggle('capas', 'viewAll')}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Compliance Section - WITH PII WARNING */}
      <div className="border border-amber-300 rounded-lg overflow-hidden bg-amber-50">
        <div className="bg-amber-100 px-4 py-3 border-b border-amber-300">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900">Compliance & Regulatory</h3>
              <p className="text-xs text-amber-700 mt-0.5 font-medium">⚠️ Contains PII - OSHA logs and medical data</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5 bg-white">
          <PermissionToggle
            label="Access OSHA Logs"
            description="View injury logs and medical records (contains PII)"
            checked={permissions.compliance.accessOSHALogs}
            onChange={() => handleToggle('compliance', 'accessOSHALogs')}
            disabled={disabled}
            warning
          />
          <PermissionToggle
            label="Export PII"
            description="Export personal medical information and injury data"
            checked={permissions.compliance.exportPII}
            onChange={() => handleToggle('compliance', 'exportPII')}
            disabled={disabled}
            warning
          />
          <PermissionToggle
            label="Sign Logs"
            description="Digitally sign official compliance logs"
            checked={permissions.compliance.signLogs}
            onChange={() => handleToggle('compliance', 'signLogs')}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Documentation Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Documentation</h3>
          <p className="text-xs text-gray-600 mt-0.5">Manage safety procedures and templates</p>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5">
          <PermissionToggle
            label="Create JHA/SOP"
            description="Create Job Hazard Analysis and Standard Operating Procedures"
            checked={permissions.documentation.createJHASOP}
            onChange={() => handleToggle('documentation', 'createJHASOP')}
            disabled={disabled}
          />
          <PermissionToggle
            label="Edit Templates"
            description="Modify safety event form templates"
            checked={permissions.documentation.editTemplates}
            onChange={() => handleToggle('documentation', 'editTemplates')}
            disabled={disabled}
          />
          <PermissionToggle
            label="View Only"
            description="Read-only access to documentation"
            checked={permissions.documentation.viewOnly}
            onChange={() => handleToggle('documentation', 'viewOnly')}
            disabled={disabled}
          />
          <PermissionToggle
            label="Approve Documents"
            description="Approve and publish documentation changes"
            checked={permissions.documentation.approveDocuments}
            onChange={() => handleToggle('documentation', 'approveDocuments')}
            disabled={disabled}
          />
        </div>
      </div>

      {/* CMMS Bridge Section - WITH TOOLTIP */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">CMMS Integration</h3>
          <p className="text-xs text-gray-600 mt-0.5">Cross-module permissions for Work Orders</p>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <PermissionToggle
            label="Safety Override"
            description="Grant Edit/Delete rights on CMMS Work Orders tagged as 'Safety' (normally restricted)"
            checked={permissions.cmmsBridge.safetyOverride}
            onChange={() => handleToggle('cmmsBridge', 'safetyOverride')}
            disabled={disabled}
            tooltip="This permission allows users to edit and delete Work Orders in the CMMS module, but ONLY if the Work Order is tagged as 'Safety'. This solves the scenario where technicians need to update safety checklists without full CMMS edit access."
          />
        </div>
      </div>

    </div>
  );
}

interface PermissionToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  warning?: boolean;
  tooltip?: string;
}

function PermissionToggle({ label, description, checked, onChange, disabled = false, warning = false, tooltip }: PermissionToggleProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors mt-0.5 ${
          checked ? "bg-blue-600" : "bg-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${warning ? "text-amber-900" : "text-gray-900"} ${disabled ? "opacity-50" : ""}`}>
            {label}
          </label>
          {tooltip && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
              {showTooltip && (
                <div className="absolute left-6 top-0 z-10 w-72 bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg">
                  {tooltip}
                  <div className="absolute left-0 top-2 -translate-x-1 w-2 h-2 bg-gray-900 transform rotate-45" />
                </div>
              )}
            </div>
          )}
        </div>
        <p className={`text-xs mt-0.5 ${warning ? "text-amber-700" : "text-gray-600"} ${disabled ? "opacity-50" : ""}`}>
          {description}
        </p>
      </div>
    </div>
  );
}
