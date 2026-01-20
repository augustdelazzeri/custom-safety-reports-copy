/**
 * Role Builder Matrix Component
 * 
 * Permissions matrix for creating/editing custom roles.
 * Supports Simple and Advanced modes for granular permission control.
 * 
 * Simple Mode: Shows 5 core categories with basic permissions (17 total)
 * Advanced Mode: Shows 8 categories with all granular permissions (48 total)
 */

import React from "react";
import type { RolePermissions } from "../schemas/roles";

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

  // Select All functionality for a specific category
  const handleSelectAllCategory = (category: keyof RolePermissions, enable: boolean) => {
    const categoryPermissions = permissions[category];
    const updated = {
      ...permissions,
      [category]: Object.keys(categoryPermissions).reduce((acc, key) => ({
        ...acc,
        [key]: enable
      }), {} as typeof categoryPermissions)
    };
    onChange(updated);
  };

  // Select All functionality for all permissions
  const handleSelectAllGlobal = (enable: boolean) => {
    const updated = Object.keys(permissions).reduce((acc, category) => {
      const categoryKey = category as keyof RolePermissions;
      const categoryPermissions = permissions[categoryKey];
      return {
        ...acc,
        [category]: Object.keys(categoryPermissions).reduce((catAcc, permission) => ({
          ...catAcc,
          [permission]: enable
        }), {} as typeof categoryPermissions)
      };
    }, {} as RolePermissions);
    onChange(updated);
  };

  // Check if all permissions in a category are enabled
  const isCategoryFullySelected = (category: keyof RolePermissions): boolean => {
    const categoryPermissions = permissions[category];
    return Object.values(categoryPermissions).every(value => value === true);
  };

  // Check if some (but not all) permissions in a category are enabled
  const isCategoryPartiallySelected = (category: keyof RolePermissions): boolean => {
    const categoryPermissions = permissions[category];
    const values = Object.values(categoryPermissions);
    const someEnabled = values.some(value => value === true);
    const allEnabled = values.every(value => value === true);
    return someEnabled && !allEnabled;
  };

  // Check if all permissions globally are enabled
  const isGloballyFullySelected = (): boolean => {
    return Object.keys(permissions).every(category => 
      isCategoryFullySelected(category as keyof RolePermissions)
    );
  };

  // Check if some (but not all) permissions globally are enabled
  const isGloballyPartiallySelected = (): boolean => {
    const hasAnyEnabled = Object.keys(permissions).some(category => {
      const categoryPermissions = permissions[category as keyof RolePermissions];
      return Object.values(categoryPermissions).some(value => value === true);
    });
    const allEnabled = isGloballyFullySelected();
    return hasAnyEnabled && !allEnabled;
  };

  return (
    <div className="space-y-6">
      
      {/* Global Select All */}
      <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSelectAllGlobal(!isGloballyFullySelected())}
            disabled={disabled}
            className={`relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
              disabled 
                ? "bg-gray-200 border-gray-300 cursor-not-allowed" 
                : isGloballyFullySelected()
                  ? "bg-blue-600 border-blue-600"
                  : isGloballyPartiallySelected()
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300"
            }`}
          >
            {isGloballyFullySelected() ? (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : isGloballyPartiallySelected() ? (
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
      
      {/* Safety Events Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Safety Events</h3>
              <p className="text-xs text-gray-600 mt-0.5">Control access to incident and near-miss reporting</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectAllCategory('safetyEvents', !isCategoryFullySelected('safetyEvents'))}
              disabled={disabled}
              className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                disabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isCategoryFullySelected('safetyEvents')
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className={`relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                disabled 
                  ? "bg-gray-200 border-gray-300" 
                  : isCategoryFullySelected('safetyEvents')
                    ? "bg-blue-600 border-blue-600"
                    : isCategoryPartiallySelected('safetyEvents')
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-400"
              }`}>
                {isCategoryFullySelected('safetyEvents') ? (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCategoryPartiallySelected('safetyEvents') ? (
                  <div className="w-1.5 h-0.5 bg-white rounded" />
                ) : null}
              </div>
              Select All
            </button>
          </div>
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
          
          {/* Advanced Mode: Additional permissions */}
          {advancedMode && (
            <>
              <PermissionToggle
                label="Add Witness"
                description="Add witness information to safety events"
                checked={permissions.safetyEvents.addWitness || false}
                onChange={() => handleToggle('safetyEvents', 'addWitness')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Mark OSHA Reportable"
                description="Flag events as OSHA reportable for compliance"
                checked={permissions.safetyEvents.markOSHAReportable || false}
                onChange={() => handleToggle('safetyEvents', 'markOSHAReportable')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Export PDF"
                description="Export safety event reports as PDF"
                checked={permissions.safetyEvents.exportPDF || false}
                onChange={() => handleToggle('safetyEvents', 'exportPDF')}
                disabled={disabled}
                advanced
              />
            </>
          )}
        </div>
      </div>

      {/* CAPAs Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Corrective & Preventive Actions (CAPAs)</h3>
              <p className="text-xs text-gray-600 mt-0.5">Manage follow-up actions from safety events</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectAllCategory('capas', !isCategoryFullySelected('capas'))}
              disabled={disabled}
              className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                disabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isCategoryFullySelected('capas')
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className={`relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                disabled 
                  ? "bg-gray-200 border-gray-300" 
                  : isCategoryFullySelected('capas')
                    ? "bg-blue-600 border-blue-600"
                    : isCategoryPartiallySelected('capas')
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-400"
              }`}>
                {isCategoryFullySelected('capas') ? (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCategoryPartiallySelected('capas') ? (
                  <div className="w-1.5 h-0.5 bg-white rounded" />
                ) : null}
              </div>
              Select All
            </button>
          </div>
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
          
          {/* Advanced Mode: Additional permissions */}
          {advancedMode && (
            <>
              <PermissionToggle
                label="Update Status"
                description="Change CAPA status (In Review, Completed, etc.)"
                checked={permissions.capas.updateStatus || false}
                onChange={() => handleToggle('capas', 'updateStatus')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Create Work Order"
                description="Create work orders directly from CAPAs"
                checked={permissions.capas.createWorkOrder || false}
                onChange={() => handleToggle('capas', 'createWorkOrder')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Export PDF"
                description="Export CAPA records as PDF"
                checked={permissions.capas.exportPDF || false}
                onChange={() => handleToggle('capas', 'exportPDF')}
                disabled={disabled}
                advanced
              />
            </>
          )}
        </div>
      </div>

      {/* Compliance Section - WITH PII WARNING */}
      <div className="border border-amber-300 rounded-lg overflow-hidden bg-amber-50">
        <div className="bg-amber-100 px-4 py-3 border-b border-amber-300">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900">Compliance & Regulatory</h3>
                <p className="text-xs text-amber-700 mt-0.5 font-medium">⚠️ Contains PII - OSHA logs and medical data</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSelectAllCategory('compliance', !isCategoryFullySelected('compliance'))}
              disabled={disabled}
              className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                disabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isCategoryFullySelected('compliance')
                    ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300"
              }`}
            >
              <div className={`relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                disabled 
                  ? "bg-gray-200 border-gray-300" 
                  : isCategoryFullySelected('compliance')
                    ? "bg-amber-600 border-amber-600"
                    : isCategoryPartiallySelected('compliance')
                      ? "bg-amber-600 border-amber-600"
                      : "bg-white border-amber-500"
              }`}>
                {isCategoryFullySelected('compliance') ? (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCategoryPartiallySelected('compliance') ? (
                  <div className="w-1.5 h-0.5 bg-white rounded" />
                ) : null}
              </div>
              Select All
            </button>
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
            description="Export personally identifiable medical information"
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
          
          {/* Advanced Mode: Additional permissions */}
          {advancedMode && (
            <>
              <PermissionToggle
                label="Generate OSHA Forms"
                description="Generate Form 300, 300A, and 301 for submission"
                checked={permissions.compliance.generateOSHAForms || false}
                onChange={() => handleToggle('compliance', 'generateOSHAForms')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Mark Privacy Cases"
                description="Flag and manage privacy case designations"
                checked={permissions.compliance.markPrivacyCases || false}
                onChange={() => handleToggle('compliance', 'markPrivacyCases')}
                disabled={disabled}
                advanced
              />
            </>
          )}
        </div>
      </div>

      {/* Documentation Section */}
      <div className="border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Documentation</h3>
              <p className="text-xs text-gray-600 mt-0.5">Manage safety procedures, JHAs, SOPs, LOTO, and permits</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectAllCategory('documentation', !isCategoryFullySelected('documentation'))}
              disabled={disabled}
              className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                disabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isCategoryFullySelected('documentation')
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className={`relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                disabled 
                  ? "bg-gray-200 border-gray-300" 
                  : isCategoryFullySelected('documentation')
                    ? "bg-blue-600 border-blue-600"
                    : isCategoryPartiallySelected('documentation')
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-400"
              }`}>
                {isCategoryFullySelected('documentation') ? (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCategoryPartiallySelected('documentation') ? (
                  <div className="w-1.5 h-0.5 bg-white rounded" />
                ) : null}
              </div>
              Select All
            </button>
          </div>
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
            description="Modify safety document templates"
            checked={permissions.documentation.editTemplates}
            onChange={() => handleToggle('documentation', 'editTemplates')}
            disabled={disabled}
          />
          <PermissionToggle
            label="View Only"
            description="Read-only access to all documentation"
            checked={permissions.documentation.viewOnly}
            onChange={() => handleToggle('documentation', 'viewOnly')}
            disabled={disabled}
          />
          <PermissionToggle
            label="Approve Documents"
            description="Approve and publish safety documentation"
            checked={permissions.documentation.approveDocuments}
            onChange={() => handleToggle('documentation', 'approveDocuments')}
            disabled={disabled}
          />
          
          {/* Advanced Mode: Additional permissions */}
          {advancedMode && (
            <>
              <PermissionToggle
                label="Create SOP"
                description="Create Standard Operating Procedures"
                checked={permissions.documentation.createSOP || false}
                onChange={() => handleToggle('documentation', 'createSOP')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Create JHA"
                description="Create Job Hazard Analyses"
                checked={permissions.documentation.createJHA || false}
                onChange={() => handleToggle('documentation', 'createJHA')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Create LOTO"
                description="Create Lockout/Tagout procedures"
                checked={permissions.documentation.createLOTO || false}
                onChange={() => handleToggle('documentation', 'createLOTO')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Create PTW"
                description="Create Permit to Work documents"
                checked={permissions.documentation.createPTW || false}
                onChange={() => handleToggle('documentation', 'createPTW')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Submit for Review"
                description="Submit documents for approval workflow"
                checked={permissions.documentation.submitForReview || false}
                onChange={() => handleToggle('documentation', 'submitForReview')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Digital Sign-off"
                description="Digitally sign approved documents"
                checked={permissions.documentation.digitalSignOff || false}
                onChange={() => handleToggle('documentation', 'digitalSignOff')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Mark as Public"
                description="Publish documents for organization-wide access"
                checked={permissions.documentation.markAsPublic || false}
                onChange={() => handleToggle('documentation', 'markAsPublic')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Version Control"
                description="Manage document revisions and version history"
                checked={permissions.documentation.versionControl || false}
                onChange={() => handleToggle('documentation', 'versionControl')}
                disabled={disabled}
                advanced
              />
              <PermissionToggle
                label="Export PDF"
                description="Export documentation as PDF files"
                checked={permissions.documentation.exportPDF || false}
                onChange={() => handleToggle('documentation', 'exportPDF')}
                disabled={disabled}
                advanced
              />
            </>
          )}
        </div>
        
        {/* CMMS Integration Permission - Always visible, outside grid */}
        <div className="px-4 pb-3 bg-white rounded-b-lg">
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => handleToggle('cmmsBridge', 'safetyOverride')}
                disabled={disabled}
                className={`mt-0.5 relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                  disabled 
                    ? "bg-gray-200 cursor-not-allowed" 
                    : permissions.cmmsBridge.safetyOverride 
                      ? "bg-blue-600" 
                      : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    permissions.cmmsBridge.safetyOverride ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className={`text-sm font-medium ${
                    disabled ? "text-gray-400" : "text-gray-900"
                  }`}>
                    Safety Override (CMMS)
                  </label>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    CMMS Module
                  </span>
                  <div className="relative group inline-block">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="hidden group-hover:block absolute left-0 top-full mt-2 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50">
                      <p className="font-medium mb-1">💡 What is Safety Override?</p>
                      <p>
                        Allows editing/deleting Work Orders in the CMMS module, but <span className="font-semibold">ONLY</span> if tagged as "Safety". 
                        Useful for technicians updating safety checklists without full CMMS access.
                      </p>
                    </div>
                  </div>
                </div>
                <p className={`text-xs mt-0.5 ${
                  disabled ? "text-gray-400" : "text-gray-600"
                }`}>
                  Edit/Delete Work Orders tagged as 'Safety' in CMMS module (cross-module permission)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Mode Only: Access Points Section */}
      {advancedMode && (
        <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
          <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900">Access Points (QR Codes)</h3>
                  <p className="text-xs text-blue-700 mt-0.5">Manage QR code-based reporting entry points</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectAllCategory('accessPoints', !isCategoryFullySelected('accessPoints'))}
                disabled={disabled}
                className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  disabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isCategoryFullySelected('accessPoints')
                      ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                      : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300"
                }`}
              >
                <div className={`relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  disabled 
                    ? "bg-gray-200 border-gray-300" 
                    : isCategoryFullySelected('accessPoints')
                      ? "bg-blue-600 border-blue-600"
                      : isCategoryPartiallySelected('accessPoints')
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-blue-500"
                }`}>
                  {isCategoryFullySelected('accessPoints') ? (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCategoryPartiallySelected('accessPoints') ? (
                    <div className="w-1.5 h-0.5 bg-white rounded" />
                  ) : null}
                </div>
                Select All
              </button>
            </div>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5 bg-white">
            <PermissionToggle
              label="Create QR Codes"
              description="Generate new QR codes for locations"
              checked={permissions.accessPoints.createQRCodes}
              onChange={() => handleToggle('accessPoints', 'createQRCodes')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Edit QR Codes"
              description="Modify existing QR code assignments"
              checked={permissions.accessPoints.editQRCodes}
              onChange={() => handleToggle('accessPoints', 'editQRCodes')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Delete QR Codes"
              description="Remove QR codes from system"
              checked={permissions.accessPoints.deleteQRCodes}
              onChange={() => handleToggle('accessPoints', 'deleteQRCodes')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Scan QR Codes"
              description="Use QR codes to submit reports"
              checked={permissions.accessPoints.scanQRCodes}
              onChange={() => handleToggle('accessPoints', 'scanQRCodes')}
              disabled={disabled}
              advanced
            />
          </div>
        </div>
      )}

      {/* Advanced Mode Only: Checklists Section */}
      {advancedMode && (
        <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
          <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900">Checklists & Inspections</h3>
                  <p className="text-xs text-blue-700 mt-0.5">Control checklist creation and execution</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectAllCategory('checklists', !isCategoryFullySelected('checklists'))}
                disabled={disabled}
                className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  disabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isCategoryFullySelected('checklists')
                      ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                      : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300"
                }`}
              >
                <div className={`relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  disabled 
                    ? "bg-gray-200 border-gray-300" 
                    : isCategoryFullySelected('checklists')
                      ? "bg-blue-600 border-blue-600"
                      : isCategoryPartiallySelected('checklists')
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-blue-500"
                }`}>
                  {isCategoryFullySelected('checklists') ? (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCategoryPartiallySelected('checklists') ? (
                    <div className="w-1.5 h-0.5 bg-white rounded" />
                  ) : null}
                </div>
                Select All
              </button>
            </div>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5 bg-white">
            <PermissionToggle
              label="Create"
              description="Create new checklist templates"
              checked={permissions.checklists.create}
              onChange={() => handleToggle('checklists', 'create')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Edit"
              description="Modify checklist templates"
              checked={permissions.checklists.edit}
              onChange={() => handleToggle('checklists', 'edit')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Complete"
              description="Execute and complete assigned checklists"
              checked={permissions.checklists.complete}
              onChange={() => handleToggle('checklists', 'complete')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Configure Conditional Logic"
              description="Set up conditional task flows"
              checked={permissions.checklists.configureConditionalLogic}
              onChange={() => handleToggle('checklists', 'configureConditionalLogic')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Attach to Work Orders"
              description="Link checklists to work orders and PM schedules"
              checked={permissions.checklists.attachToWorkOrders}
              onChange={() => handleToggle('checklists', 'attachToWorkOrders')}
              disabled={disabled}
              advanced
            />
          </div>
        </div>
      )}

      {/* Advanced Mode Only: Audit & Export Section */}
      {advancedMode && (
        <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
          <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900">Audit Trail & Export</h3>
                  <p className="text-xs text-blue-700 mt-0.5">Access audit logs and export data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectAllCategory('auditExport', !isCategoryFullySelected('auditExport'))}
                disabled={disabled}
                className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  disabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isCategoryFullySelected('auditExport')
                      ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                      : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300"
                }`}
              >
                <div className={`relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  disabled 
                    ? "bg-gray-200 border-gray-300" 
                    : isCategoryFullySelected('auditExport')
                      ? "bg-blue-600 border-blue-600"
                      : isCategoryPartiallySelected('auditExport')
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-blue-500"
                }`}>
                  {isCategoryFullySelected('auditExport') ? (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCategoryPartiallySelected('auditExport') ? (
                    <div className="w-1.5 h-0.5 bg-white rounded" />
                  ) : null}
                </div>
                Select All
              </button>
            </div>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5 bg-white">
            <PermissionToggle
              label="View Audit Trail"
              description="Access full audit log of all changes"
              checked={permissions.auditExport.viewAuditTrail}
              onChange={() => handleToggle('auditExport', 'viewAuditTrail')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Export CSV"
              description="Export data in CSV format"
              checked={permissions.auditExport.exportCSV}
              onChange={() => handleToggle('auditExport', 'exportCSV')}
              disabled={disabled}
              advanced
            />
            <PermissionToggle
              label="Export PDF"
              description="Export reports in PDF format"
              checked={permissions.auditExport.exportPDF}
              onChange={() => handleToggle('auditExport', 'exportPDF')}
              disabled={disabled}
              advanced
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Permission Toggle Component
interface PermissionToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  warning?: boolean;
  advanced?: boolean;
}

function PermissionToggle({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false,
  warning = false,
  advanced = false
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
          {advanced && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              Advanced
            </span>
          )}
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
