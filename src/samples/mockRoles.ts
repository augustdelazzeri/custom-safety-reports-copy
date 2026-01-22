/**
 * Mock Custom Roles Data
 * 
 * Predefined system roles to help administrators understand permission patterns.
 * These roles are marked as system roles and cannot be deleted.
 * 
 * Structure: Module → Entity → Actions (3-level nested)
 */

import type { CustomRole } from "../schemas/roles";

export const mockRoles: CustomRole[] = [
  {
    id: "role_safety_admin",
    name: "Safety Administrator",
    isSystemRole: true,
    permissions: {
      // Incident Management
      event: {
        "Safety Event": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          archive: true,
          delete: true,
          export: true,
          comment: true,
          "view-comments": true,
          "delete-comment": true
        }
      },
      // CAPA
      capa: {
        "CAPA": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          archive: true,
          delete: true,
          export: true,
          comment: true,
          "view-comments": true,
          "delete-comment": true
        }
      },
      // OSHA Compliance
      osha: {
        "OSHA Report (300/301)": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          archive: true,
          delete: true,
          export: true
        },
        "OSHA 300A Summary": {
          "view-cases": true,
          "view-establishment": true,
          "upsert-establishment": true,
          certify: true,
          archive: true,
          "view-archived": true
        },
        "OSHA Agency Report": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          archive: true,
          export: true
        },
        "OSHA Location": {
          create: true,
          view: true,
          "view-list": true,
          archive: true,
          export: true
        },
        "OSHA Audit Trail": {
          view: true,
          create: true
        }
      },
      // Access Points
      "access-point": {
        "Access Point": {
          create: true,
          "create-bulk": true,
          view: true,
          "view-list": true,
          edit: true,
          archive: true,
          delete: true,
          export: true
        }
      },
      // LOTO
      loto: {
        "LOTO Procedure": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: true,
          export: true
        }
      },
      // PTW (Advanced)
      ptw: {
        "Work Permit": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: true,
          export: true
        }
      },
      // JHA (Advanced)
      jha: {
        "JHA": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: true,
          export: true
        }
      },
      // SOP (Advanced)
      sop: {
        "SOP": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: true,
          export: true
        }
      },
      // Audit (Advanced)
      audit: {
        "Audit": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: true,
          export: true
        }
      }
    },
    createdAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    createdBy: "system",
  },
  
  {
    id: "role_safety_manager",
    name: "Safety Manager",
    isSystemRole: true,
    permissions: {
      // Incident Management
      event: {
        "Safety Event": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          archive: true,
          delete: false,
          export: true,
          comment: true,
          "view-comments": true,
          "delete-comment": false
        }
      },
      // CAPA
      capa: {
        "CAPA": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          archive: true,
          delete: false,
          export: true,
          comment: true,
          "view-comments": true,
          "delete-comment": false
        }
      },
      // OSHA Compliance
      osha: {
        "OSHA Report (300/301)": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          archive: false,
          delete: false,
          export: true
        },
        "OSHA 300A Summary": {
          "view-cases": true,
          "view-establishment": true,
          "upsert-establishment": true,
          certify: false,
          archive: false,
          "view-archived": true
        },
        "OSHA Agency Report": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          archive: false,
          export: true
        },
        "OSHA Location": {
          create: true,
          view: true,
          "view-list": true,
          archive: false,
          export: true
        },
        "OSHA Audit Trail": {
          view: true,
          create: false
        }
      },
      // Access Points
      "access-point": {
        "Access Point": {
          create: true,
          "create-bulk": true,
          view: true,
          "view-list": true,
          edit: true,
          archive: false,
          delete: false,
          export: true
        }
      },
      // LOTO
      loto: {
        "LOTO Procedure": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: false,
          export: true
        }
      },
      // PTW (Advanced)
      ptw: {
        "Work Permit": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: false,
          export: true
        }
      },
      // JHA (Advanced)
      jha: {
        "JHA": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: false,
          export: true
        }
      },
      // SOP (Advanced)
      sop: {
        "SOP": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: false,
          export: true
        }
      },
      // Audit (Advanced)
      audit: {
        "Audit": {
          create: true,
          view: true,
          "view-list": true,
          edit: true,
          duplicate: true,
          "submit-review": true,
          approve: true,
          reject: true,
          archive: true,
          delete: false,
          export: true
        }
      }
    },
    createdAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    createdBy: "system",
  },
  
  {
    id: "role_field_tech",
    name: "Field Technician",
    isSystemRole: true,
    permissions: {
      // Incident Management
      event: {
        "Safety Event": {
          create: true,
          view: true,
          "view-list": true,
          edit: false,
          archive: false,
          delete: false,
          export: false,
          comment: true,
          "view-comments": true,
          "delete-comment": false
        }
      },
      // CAPA
      capa: {
        "CAPA": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          archive: false,
          delete: false,
          export: false,
          comment: true,
          "view-comments": true,
          "delete-comment": false
        }
      },
      // OSHA Compliance
      osha: {
        "OSHA Report (300/301)": {
          create: false,
          view: false,
          "view-list": false,
          edit: false,
          archive: false,
          delete: false,
          export: false
        },
        "OSHA 300A Summary": {
          "view-cases": false,
          "view-establishment": false,
          "upsert-establishment": false,
          certify: false,
          archive: false,
          "view-archived": false
        },
        "OSHA Agency Report": {
          create: false,
          view: false,
          "view-list": false,
          edit: false,
          archive: false,
          export: false
        },
        "OSHA Location": {
          create: false,
          view: false,
          "view-list": false,
          archive: false,
          export: false
        },
        "OSHA Audit Trail": {
          view: false,
          create: false
        }
      },
      // Access Points
      "access-point": {
        "Access Point": {
          create: false,
          "create-bulk": false,
          view: true,
          "view-list": true,
          edit: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // LOTO
      loto: {
        "LOTO Procedure": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // PTW (Advanced)
      ptw: {
        "Work Permit": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // JHA (Advanced)
      jha: {
        "JHA": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // SOP (Advanced)
      sop: {
        "SOP": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // Audit (Advanced)
      audit: {
        "Audit": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      }
    },
    createdAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    createdBy: "system",
  },
  
  {
    id: "role_view_only",
    name: "View Only",
    isSystemRole: true,
    permissions: {
      // Incident Management
      event: {
        "Safety Event": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          archive: false,
          delete: false,
          export: false,
          comment: false,
          "view-comments": true,
          "delete-comment": false
        }
      },
      // CAPA
      capa: {
        "CAPA": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          archive: false,
          delete: false,
          export: false,
          comment: false,
          "view-comments": true,
          "delete-comment": false
        }
      },
      // OSHA Compliance
      osha: {
        "OSHA Report (300/301)": {
          create: false,
          view: false,
          "view-list": false,
          edit: false,
          archive: false,
          delete: false,
          export: false
        },
        "OSHA 300A Summary": {
          "view-cases": false,
          "view-establishment": false,
          "upsert-establishment": false,
          certify: false,
          archive: false,
          "view-archived": false
        },
        "OSHA Agency Report": {
          create: false,
          view: false,
          "view-list": false,
          edit: false,
          archive: false,
          export: false
        },
        "OSHA Location": {
          create: false,
          view: false,
          "view-list": false,
          archive: false,
          export: false
        },
        "OSHA Audit Trail": {
          view: false,
          create: false
        }
      },
      // Access Points
      "access-point": {
        "Access Point": {
          create: false,
          "create-bulk": false,
          view: true,
          "view-list": true,
          edit: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // LOTO
      loto: {
        "LOTO Procedure": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // PTW (Advanced)
      ptw: {
        "Work Permit": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // JHA (Advanced)
      jha: {
        "JHA": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // SOP (Advanced)
      sop: {
        "SOP": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      },
      // Audit (Advanced)
      audit: {
        "Audit": {
          create: false,
          view: true,
          "view-list": true,
          edit: false,
          duplicate: false,
          "submit-review": false,
          approve: false,
          reject: false,
          archive: false,
          delete: false,
          export: false
        }
      }
    },
    createdAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    createdBy: "system",
  },
];
