/**
 * EHS Permissions Data Structure
 * 
 * Extracted from FUNCTIONAL_SPECS.md - Core EHS modules for Custom Roles
 * 
 * Simple Mode (6 modules): Access Point, Event, CAPA, OSHA, LOTO, Work Orders
 * Advanced Mode (10 modules): Adds JHA, SOP, PTW, Audit
 * 
 * Order matches sidebar: Access Point → Event → CAPA → OSHA → Documentation (JHA, SOP, LOTO, PTW) → Work Orders → Audit
 */

/**
 * Permission categories for Simple Mode grouping (per spec)
 * 
 * Spec defines 6 functional categories:
 * 1. View - read-only access
 * 2. Create & Edit - data entry and modification rights
 * 3. Approvals - approve/reject workflows
 * 4. Collaboration - commenting and tagging
 * 5. Archive & Delete - destructive capabilities
 * 6. Reporting - data export and report generation
 */
export type PermissionCategory = 
  | "view"            // View, Browse, List
  | "create-edit"     // Create, Update, Edit, Draft, Duplicate
  | "approvals"       // Approve, Reject, Submit Review
  | "collaboration"   // Comments, Mentions, Tagging
  | "archive-delete"  // Archive, Delete (destructive)
  | "reporting";      // Export, Reports

// Category display metadata for UI
export const CATEGORY_METADATA: Record<PermissionCategory, { label: string; description: string; icon: string }> = {
  "view": {
    label: "View",
    description: "Read-only access to view records",
    icon: "eye"
  },
  "create-edit": {
    label: "Create & Edit",
    description: "Data entry and modification rights",
    icon: "pencil"
  },
  "approvals": {
    label: "Approvals",
    description: "Authority to approve/reject workflows",
    icon: "check-circle"
  },
  "collaboration": {
    label: "Collaboration",
    description: "Commenting and tagging capabilities",
    icon: "chat"
  },
  "archive-delete": {
    label: "Archive & Delete",
    description: "Destructive capabilities",
    icon: "trash"
  },
  "reporting": {
    label: "Reporting",
    description: "Data export and report generation",
    icon: "chart"
  }
};

export interface PermissionAction {
  id: string;           // e.g., "event:create"
  label: string;        // e.g., "Report Incident"
  description: string;  // e.g., "Create a new safety event"
  permission: string;   // e.g., "CREATE", "VIEW", "EDIT", etc.
  category: PermissionCategory;  // For Simple Mode grouping
}

export interface PermissionEntity {
  entity: string;       // e.g., "Safety Event"
  actions: PermissionAction[];
}

export interface PermissionModule {
  moduleId: string;     // e.g., "event"
  moduleName: string;   // e.g., "Incident Management"
  description: string;
  advancedOnly?: boolean;  // Show only in advanced mode
  features: PermissionEntity[];
}

export const EHS_PERMISSIONS: PermissionModule[] = [
  // === Modules ordered following the Sidebar structure ===
  // Simple Mode includes all modules except "audit" (which is Advanced Only)
  
  // SAFETY MANAGEMENT Section
  {
    moduleId: "access-point",
    moduleName: "Access Points (QR Codes)",
    description: "QR code generation for locations",
    features: [
      {
        entity: "Access Point",
        actions: [
          { id: "access-point:create", label: "Create", description: "Generate QR code", permission: "CREATE", category: "create-edit" },
          { id: "access-point:create-bulk", label: "Bulk Create", description: "Import with AI matching", permission: "CREATE", category: "create-edit" },
          { id: "access-point:view", label: "View", description: "Access details", permission: "VIEW", category: "view" },
          { id: "access-point:view-list", label: "Browse", description: "List all QR codes", permission: "VIEW", category: "view" },
          { id: "access-point:edit", label: "Update", description: "Modify assignment", permission: "EDIT", category: "create-edit" },
          { id: "access-point:archive", label: "Archive", description: "Deactivate", permission: "EDIT", category: "archive-delete" },
          { id: "access-point:delete", label: "Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "access-point:export", label: "Export", description: "Download CSV", permission: "EXPORT", category: "reporting" }
        ]
      }
    ]
  },
  
  {
    moduleId: "event",
    moduleName: "Safety Events",
    description: "Safety event reporting and tracking",
    features: [
      {
        entity: "Safety Event",
        actions: [
          { id: "event:create", label: "Report Incident", description: "Create new safety event", permission: "CREATE", category: "create-edit" },
          { id: "event:view", label: "View Incident Details", description: "Access full details", permission: "VIEW", category: "view" },
          { id: "event:view-list", label: "Browse Incident Log", description: "List all events", permission: "VIEW", category: "view" },
          { id: "event:edit", label: "Update Incident", description: "Modify event details", permission: "EDIT", category: "create-edit" },
          { id: "event:archive", label: "Archive Incident", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "event:delete", label: "Permanently Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "event:export", label: "Export Data", description: "Download as CSV", permission: "EXPORT", category: "reporting" },
          { id: "event:comment", label: "Add Comment", description: "Post comment", permission: "COMMENT", category: "collaboration" },
          { id: "event:view-comments", label: "View Comments", description: "Read threads", permission: "VIEW", category: "collaboration" },
          { id: "event:delete-comment", label: "Delete Comment", description: "Remove comment", permission: "EDIT", category: "collaboration" }
        ]
      }
    ]
  },
  
  {
    moduleId: "capa",
    moduleName: "CAPAs",
    description: "CAPA management with ownership tracking",
    features: [
      {
        entity: "CAPA",
        actions: [
          { id: "capa:create", label: "Create CAPA", description: "Create corrective action", permission: "CREATE", category: "create-edit" },
          { id: "capa:view", label: "View Details", description: "Access CAPA details", permission: "VIEW", category: "view" },
          { id: "capa:view-list", label: "Browse CAPAs", description: "List all CAPAs", permission: "VIEW", category: "view" },
          { id: "capa:edit", label: "Update CAPA", description: "Modify details", permission: "EDIT", category: "create-edit" },
          { id: "capa:duplicate", label: "Duplicate CAPA", description: "Copy with attachments", permission: "CREATE", category: "create-edit" },
          { id: "capa:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "capa:delete", label: "Permanently Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "capa:export", label: "Export Data", description: "Download as CSV", permission: "EXPORT", category: "reporting" },
          { id: "capa:comment", label: "Add Comment", description: "Post comment", permission: "COMMENT", category: "collaboration" },
          { id: "capa:view-comments", label: "View Comments", description: "Read threads", permission: "VIEW", category: "collaboration" },
          { id: "capa:delete-comment", label: "Delete Comment", description: "Remove comment", permission: "EDIT", category: "collaboration" }
        ]
      }
    ]
  },
  
  // OSHA Section
  
  {
    moduleId: "osha",
    moduleName: "OSHA Compliance",
    description: "Complete OSHA recordkeeping and reporting (Contains PII)",
    features: [
      {
        entity: "OSHA Report (300/301)",
        actions: [
          { id: "osha-report:create", label: "Create Report", description: "Record injury/illness", permission: "CREATE", category: "create-edit" },
          { id: "osha-report:view", label: "View Report", description: "Access details", permission: "VIEW", category: "view" },
          { id: "osha-report:view-list", label: "Browse Reports", description: "List all reports", permission: "VIEW", category: "view" },
          { id: "osha-report:edit", label: "Update Report", description: "Modify classification", permission: "EDIT", category: "create-edit" },
          { id: "osha-report:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "osha-report:delete", label: "Permanently Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "osha-report:export", label: "Export", description: "Download as CSV", permission: "EXPORT", category: "reporting" }
        ]
      },
      {
        entity: "OSHA 300A Summary",
        actions: [
          { id: "osha-summary:view-cases", label: "View Annual Summary", description: "Access 300A with rates", permission: "VIEW", category: "view" },
          { id: "osha-summary:view-establishment", label: "View Establishment Info", description: "Company hours/details", permission: "VIEW", category: "view" },
          { id: "osha-summary:upsert-establishment", label: "Update Establishment", description: "Modify hours worked", permission: "CREATE", category: "create-edit" },
          { id: "osha-summary:certify", label: "Executive Certification", description: "Sign 300A", permission: "CREATE", category: "approvals" },
          { id: "osha-summary:archive", label: "Archive Summary", description: "Archive year", permission: "CREATE", category: "archive-delete" },
          { id: "osha-summary:view-archived", label: "View Archived", description: "Previous years", permission: "VIEW", category: "view" }
        ]
      },
      {
        entity: "OSHA Agency Report",
        actions: [
          { id: "osha-agency:create", label: "Create Submission", description: "Draft agency report", permission: "CREATE", category: "create-edit" },
          { id: "osha-agency:view", label: "View Submission", description: "Access report", permission: "VIEW", category: "view" },
          { id: "osha-agency:view-list", label: "Browse Submissions", description: "List reports", permission: "VIEW", category: "view" },
          { id: "osha-agency:edit", label: "Update Submission", description: "Modify before submit", permission: "EDIT", category: "create-edit" },
          { id: "osha-agency:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "osha-agency:export", label: "Export", description: "Download as CSV", permission: "EXPORT", category: "reporting" }
        ]
      },
      {
        entity: "OSHA Location",
        actions: [
          { id: "osha-location:create", label: "Register Location", description: "Add establishment", permission: "CREATE", category: "create-edit" },
          { id: "osha-location:view", label: "View Location", description: "Access details", permission: "VIEW", category: "view" },
          { id: "osha-location:view-list", label: "Browse Locations", description: "List locations", permission: "VIEW", category: "view" },
          { id: "osha-location:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "osha-location:export", label: "Export", description: "Download as CSV", permission: "EXPORT", category: "reporting" }
        ]
      },
      {
        entity: "OSHA Audit Trail",
        actions: [
          { id: "osha-audit-trail:view", label: "View Audit Trail", description: "Compliance logs", permission: "VIEW", category: "view" },
          { id: "osha-audit-trail:create", label: "Log Action", description: "Manual log entry", permission: "CREATE", category: "advanced" }
        ]
      }
    ]
  },
  
  // DOCUMENTATION Section
  {
    moduleId: "jha",
    moduleName: "Job Hazard Analysis",
    description: "Task risk assessment",
    features: [
      {
        entity: "JHA",
        actions: [
          { id: "jha:create", label: "Create JHA", description: "Draft analysis", permission: "CREATE", category: "create-edit" },
          { id: "jha:view", label: "View JHA", description: "Access details", permission: "VIEW", category: "view" },
          { id: "jha:view-list", label: "Browse Library", description: "List all JHAs", permission: "VIEW", category: "view" },
          { id: "jha:edit", label: "Update", description: "Modify JHA", permission: "EDIT", category: "create-edit" },
          { id: "jha:submit-review", label: "Submit", description: "Send to approvers", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "jha:approve", label: "Approve", description: "Sign off", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "jha:reject", label: "Reject", description: "Send back", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "jha:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "jha:delete", label: "Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "jha:export", label: "Export", description: "Download CSV", permission: "EXPORT", category: "reporting" }
        ]
      }
    ]
  },
  
  {
    moduleId: "sop",
    moduleName: "Standard Operating Procedures",
    description: "SOP documentation and approval",
    features: [
      {
        entity: "SOP",
        actions: [
          { id: "sop:create", label: "Create SOP", description: "Draft procedure", permission: "CREATE", category: "create-edit" },
          { id: "sop:view", label: "View SOP", description: "Access details", permission: "VIEW", category: "view" },
          { id: "sop:view-list", label: "Browse Library", description: "List all SOPs", permission: "VIEW", category: "view" },
          { id: "sop:edit", label: "Update", description: "Modify SOP", permission: "EDIT", category: "create-edit" },
          { id: "sop:duplicate", label: "Duplicate", description: "Copy SOP", permission: "CREATE", category: "create-edit" },
          { id: "sop:submit-review", label: "Submit", description: "Send to approvers", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "sop:approve", label: "Approve", description: "Sign off", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "sop:reject", label: "Reject", description: "Send back", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "sop:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "sop:delete", label: "Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "sop:export", label: "Export", description: "Download CSV", permission: "EXPORT", category: "reporting" }
        ]
      }
    ]
  },
  
  {
    moduleId: "loto",
    moduleName: "Lockout/Tagout",
    description: "Equipment isolation procedures",
    features: [
      {
        entity: "LOTO Procedure",
        actions: [
          { id: "loto:create", label: "Create Procedure", description: "Draft LOTO", permission: "CREATE", category: "create-edit" },
          { id: "loto:view", label: "View Procedure", description: "Access details", permission: "VIEW", category: "view" },
          { id: "loto:view-list", label: "Browse Library", description: "List all LOTOs", permission: "VIEW", category: "view" },
          { id: "loto:edit", label: "Update", description: "Modify procedure", permission: "EDIT", category: "create-edit" },
          { id: "loto:duplicate", label: "Duplicate", description: "Copy procedure", permission: "CREATE", category: "create-edit" },
          { id: "loto:submit-review", label: "Submit", description: "Send to approvers", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "loto:approve", label: "Approve", description: "Sign off", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "loto:reject", label: "Reject", description: "Send back", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "loto:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "loto:delete", label: "Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "loto:export", label: "Export", description: "Download CSV", permission: "EXPORT", category: "reporting" }
        ]
      }
    ]
  },
  
  {
    moduleId: "ptw",
    moduleName: "Permit to Work",
    description: "High-risk work authorization",
    features: [
      {
        entity: "Work Permit",
        actions: [
          { id: "ptw:create", label: "Create Permit", description: "Draft PTW", permission: "CREATE", category: "create-edit" },
          { id: "ptw:view", label: "View Permit", description: "Access details", permission: "VIEW", category: "view" },
          { id: "ptw:view-list", label: "Browse Permits", description: "List all PTWs", permission: "VIEW", category: "view" },
          { id: "ptw:edit", label: "Update", description: "Modify permit", permission: "EDIT", category: "create-edit" },
          { id: "ptw:duplicate", label: "Duplicate", description: "Copy permit", permission: "CREATE", category: "create-edit" },
          { id: "ptw:submit-review", label: "Submit", description: "Send to approvers", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "ptw:approve", label: "Approve", description: "Authorize work", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "ptw:reject", label: "Reject", description: "Send back", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "ptw:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "ptw:delete", label: "Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "ptw:export", label: "Export", description: "Download CSV", permission: "EXPORT", category: "reporting" }
        ]
      }
    ]
  },
  
  // Safety Work Orders (CMMS Integration)
  {
    moduleId: "work-order",
    moduleName: "Safety Work Orders",
    description: "CMMS integration for corrective maintenance",
    // NO advancedOnly flag - visible in Simple AND Advanced modes
    features: [
      {
        entity: "Work Order",
        actions: [
          { id: "work-order:search", label: "Search Work Orders", description: "Find WOs from CMMS", permission: "VIEW", category: "view" },
          { id: "work-order:view", label: "View Details", description: "Access WO with analysis", permission: "VIEW", category: "view" },
          { id: "work-order:create", label: "Create WO", description: "Generic work order", permission: "CREATE", category: "create-edit" },
          { id: "work-order:create-from-entity", label: "Create from CAPA/Event", description: "Link to entity", permission: "CREATE", category: "create-edit" },
          { id: "work-order:link", label: "Link Existing WO", description: "Associate WO", permission: "EDIT", category: "create-edit" },
          { id: "work-order:unlink", label: "Unlink WO", description: "Remove association", permission: "EDIT", category: "create-edit" },
          { id: "work-order:get-by-capa", label: "List by CAPA", description: "View CAPA WOs", permission: "VIEW", category: "view" },
          { id: "work-order:count-by-capa", label: "Count by CAPA", description: "WO count", permission: "VIEW", category: "view" },
          { id: "work-order:enqueue-analysis", label: "Queue AI Analysis", description: "Analyze completed WO", permission: "CREATE", category: "advanced" }
        ]
      }
    ]
  },
  
  // === ADVANCED MODE ONLY ===
  {
    moduleId: "audit",
    moduleName: "Safety Audits",
    description: "Audit management with checklist generation",
    advancedOnly: true,
    features: [
      {
        entity: "Audit",
        actions: [
          { id: "audit:create", label: "Create Audit", description: "Schedule inspection", permission: "CREATE", category: "create-edit" },
          { id: "audit:view", label: "View Audit", description: "Access details", permission: "VIEW", category: "view" },
          { id: "audit:view-list", label: "Browse Audits", description: "List all audits", permission: "VIEW", category: "view" },
          { id: "audit:edit", label: "Update", description: "Modify audit", permission: "EDIT", category: "create-edit" },
          { id: "audit:duplicate", label: "Duplicate", description: "Copy template", permission: "CREATE", category: "create-edit" },
          { id: "audit:submit-review", label: "Submit", description: "Send to approvers", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "audit:approve", label: "Approve", description: "Sign off", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "audit:reject", label: "Reject", description: "Send back", permission: "UPDATE_STATUS", category: "approvals" },
          { id: "audit:archive", label: "Archive", description: "Soft-delete", permission: "EDIT", category: "archive-delete" },
          { id: "audit:delete", label: "Delete", description: "Hard delete", permission: "DELETE", category: "archive-delete" },
          { id: "audit:export", label: "Export", description: "Download CSV", permission: "EXPORT", category: "reporting" }
        ]
      }
    ]
  }
];

/**
 * Helper function to get all modules visible in a given mode
 */
export function getVisibleModules(advancedMode: boolean): PermissionModule[] {
  return EHS_PERMISSIONS.filter(module => !module.advancedOnly || advancedMode);
}

/**
 * Helper function to count total actions in a module
 */
export function countModuleActions(module: PermissionModule): number {
  return module.features.reduce((total, feature) => total + feature.actions.length, 0);
}

/**
 * Helper function to find a module by ID
 */
export function getModuleById(moduleId: string): PermissionModule | undefined {
  return EHS_PERMISSIONS.find(m => m.moduleId === moduleId);
}

/**
 * Helper function to extract action key from action ID
 * Example: "event:create" → "create"
 */
export function getActionKey(actionId: string): string {
  const parts = actionId.split(':');
  return parts.length > 1 ? parts[1] : actionId;
}

/**
 * Category metadata for Simple Mode UI
 */
export interface CategoryInfo {
  id: PermissionCategory;
  label: string;
  description: string;
  icon?: string;
}

export const PERMISSION_CATEGORIES: CategoryInfo[] = [
  { id: "view", label: "View", description: "Read-only access to view records and lists" },
  { id: "create-edit", label: "Create & Edit", description: "Data entry and modification rights" },
  { id: "approvals", label: "Approvals", description: "Authority to approve/reject workflows" },
  { id: "collaboration", label: "Collaboration", description: "Commenting and tagging capabilities" },
  { id: "archive-delete", label: "Archive & Delete", description: "Destructive capabilities" },
  { id: "reporting", label: "Reporting", description: "Data export and report generation" }
];

/**
 * Get all action IDs within a module that belong to a specific category
 */
export function getActionsByCategory(
  module: PermissionModule,
  category: PermissionCategory
): string[] {
  const actionIds: string[] = [];
  module.features.forEach(feature => {
    feature.actions.forEach(action => {
      if (action.category === category) {
        actionIds.push(action.id);
      }
    });
  });
  return actionIds;
}

/**
 * Get all categories present in a module
 */
export function getModuleCategories(module: PermissionModule): PermissionCategory[] {
  const categories = new Set<PermissionCategory>();
  module.features.forEach(feature => {
    feature.actions.forEach(action => {
      categories.add(action.category);
    });
  });
  // Return in a consistent order (per spec)
  const orderedCategories: PermissionCategory[] = ['view', 'create-edit', 'approvals', 'collaboration', 'archive-delete', 'reporting'];
  return orderedCategories.filter(cat => categories.has(cat));
}

/**
 * Get category label
 */
export function getCategoryLabel(category: PermissionCategory): string {
  const info = PERMISSION_CATEGORIES.find(c => c.id === category);
  return info?.label || category;
}
