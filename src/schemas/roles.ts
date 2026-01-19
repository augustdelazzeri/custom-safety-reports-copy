/**
 * EHS Custom Role & Permissions Type Definitions
 * 
 * Defines the structure for custom roles with granular permission controls
 * across Safety Events, CAPAs, Compliance, Documentation, Access Points, 
 * Checklists, Audit & Export, and CMMS Bridge.
 */

// Simple Mode: Basic permissions (original)
export interface SafetyEventsPermissions {
  create: boolean;
  viewAll: boolean;
  editOwn: boolean;
  editAll: boolean;
  delete: boolean;
  // Advanced Mode: Additional granular permissions
  addWitness?: boolean;
  markOSHAReportable?: boolean;
  exportPDF?: boolean;
}

export interface CAPAsPermissions {
  create: boolean;
  assign: boolean;
  approveClose: boolean;
  viewAll: boolean;
  // Advanced Mode: Additional granular permissions
  updateStatus?: boolean;
  createWorkOrder?: boolean;
  exportPDF?: boolean;
}

export interface CompliancePermissions {
  accessOSHALogs: boolean;  // Access to PII - medical/injury logs
  exportPII: boolean;         // Export PII data
  signLogs: boolean;          // Sign official compliance logs
  // Advanced Mode: Additional granular permissions
  generateOSHAForms?: boolean;
  markPrivacyCases?: boolean;
}

export interface DocumentationPermissions {
  createJHASOP: boolean;      // Create Job Hazard Analysis / Standard Operating Procedures
  editTemplates: boolean;
  viewOnly: boolean;
  approveDocuments: boolean;
  // Advanced Mode: Additional granular permissions
  createSOP?: boolean;
  createJHA?: boolean;
  createLOTO?: boolean;
  createPTW?: boolean;
  submitForReview?: boolean;
  digitalSignOff?: boolean;
  markAsPublic?: boolean;
  versionControl?: boolean;
  exportPDF?: boolean;
}

export interface AccessPointsPermissions {
  createQRCodes: boolean;
  editQRCodes: boolean;
  deleteQRCodes: boolean;
  scanQRCodes: boolean;
}

export interface ChecklistsPermissions {
  create: boolean;
  edit: boolean;
  complete: boolean;
  configureConditionalLogic: boolean;
  attachToWorkOrders: boolean;
}

export interface AuditExportPermissions {
  viewAuditTrail: boolean;
  exportCSV: boolean;
  exportPDF: boolean;
}

export interface CMMSBridgePermissions {
  safetyOverride: boolean;    // "Safety Override" - Edit/Delete rights on Safety-tagged Work Orders
}

export interface RolePermissions {
  safetyEvents: SafetyEventsPermissions;
  capas: CAPAsPermissions;
  compliance: CompliancePermissions;
  documentation: DocumentationPermissions;
  accessPoints: AccessPointsPermissions;
  checklists: ChecklistsPermissions;
  auditExport: AuditExportPermissions;
  cmmsBridge: CMMSBridgePermissions;
}

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

// Helper type for permission checking
export type PermissionCategory = 
  | 'safetyEvents' 
  | 'capas' 
  | 'compliance' 
  | 'documentation' 
  | 'accessPoints'
  | 'checklists'
  | 'auditExport'
  | 'cmmsBridge';

// Utility function to create default (empty) permissions
export function createDefaultPermissions(): RolePermissions {
  return {
    safetyEvents: {
      create: false,
      viewAll: false,
      editOwn: false,
      editAll: false,
      delete: false,
      addWitness: false,
      markOSHAReportable: false,
      exportPDF: false,
    },
    capas: {
      create: false,
      assign: false,
      approveClose: false,
      viewAll: false,
      updateStatus: false,
      createWorkOrder: false,
      exportPDF: false,
    },
    compliance: {
      accessOSHALogs: false,
      exportPII: false,
      signLogs: false,
      generateOSHAForms: false,
      markPrivacyCases: false,
    },
    documentation: {
      createJHASOP: false,
      editTemplates: false,
      viewOnly: false,
      approveDocuments: false,
      createSOP: false,
      createJHA: false,
      createLOTO: false,
      createPTW: false,
      submitForReview: false,
      digitalSignOff: false,
      markAsPublic: false,
      versionControl: false,
      exportPDF: false,
    },
    accessPoints: {
      createQRCodes: false,
      editQRCodes: false,
      deleteQRCodes: false,
      scanQRCodes: false,
    },
    checklists: {
      create: false,
      edit: false,
      complete: false,
      configureConditionalLogic: false,
      attachToWorkOrders: false,
    },
    auditExport: {
      viewAuditTrail: false,
      exportCSV: false,
      exportPDF: false,
    },
    cmmsBridge: {
      safetyOverride: false,
    },
  };
}

// Utility function to count enabled permissions
export function countEnabledPermissions(permissions: RolePermissions): number {
  let count = 0;
  
  Object.values(permissions.safetyEvents).forEach(val => { if (val) count++; });
  Object.values(permissions.capas).forEach(val => { if (val) count++; });
  Object.values(permissions.compliance).forEach(val => { if (val) count++; });
  Object.values(permissions.documentation).forEach(val => { if (val) count++; });
  Object.values(permissions.accessPoints).forEach(val => { if (val) count++; });
  Object.values(permissions.checklists).forEach(val => { if (val) count++; });
  Object.values(permissions.auditExport).forEach(val => { if (val) count++; });
  Object.values(permissions.cmmsBridge).forEach(val => { if (val) count++; });
  
  return count;
}
