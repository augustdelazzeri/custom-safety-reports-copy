export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "dateTime"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "multiselect"
  | "file"
  | "signature"
  | "boolean"
  | "bodyDiagram"
  | "sceneDiagram"
  | "sketch"
  | "gpsLocation";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;       // admin toggle (except title/dateTime)
  static?: boolean;         // locked by QR/static overrides
  placeholder?: string;
  helpText?: string;
  options?: Array<string | { value: string; label: string }>;  // for dropdown/radio/multiselect
  sectionId?: string;
  visible?: boolean;        // initial state before logic
  validation?: {
    regex?: string;
    min?: number;
    max?: number;
    fileTypes?: string[];
    maxBytes?: number;
  };
}

export interface LogicRule {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  when: Array<{ fieldId: string; op: "eq" | "ne" | "in" | "gt" | "lt"; value: any }>;
  whenOp?: "AND" | "OR"; // default AND
  then: Array<{
    action: "show" | "hide" | "require" | "optional" | "setValue";
    targetId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
  }>;
}

export interface TemplateVersion {
  id: string;               // e.g., "tmpl_injury_v1"
  name: string;
  system: {
    title: FieldDef;        // permanently required
    dateTime: FieldDef;     // permanently required
    type?: FieldDef;        // may be optional if QR sets
    location?: FieldDef;    // may be optional if QR sets
    description: FieldDef;  // required by policy
  };
  fields: FieldDef[];       // custom fields
  logic: LogicRule[];       // conditional rules
  createdAt: string;
}

export interface SubmissionPayload {
  templateVersionId: string;
  system: {
    title: string;
    dateTime: string;
    type?: string;
    location?: string;
    description: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>; // fieldId -> value
  attachments?: Array<{ fieldId: string; name: string; url?: string; mime?: string; bytes?: number }>;
  aiConfidence?: Record<string, number>; // fieldId -> [0..1]
  origin?: Record<string, "manual" | "ai" | "static" | "default">;
}

/**
 * Safety Event Data Structure
 * Represents a submitted safety event with location hierarchy support
 */
export interface SafetyEvent {
  id: string;
  templateVersionId: string;
  system: {
    title: string;
    dateTime: string;
    type?: string;
    location?: string; // Deprecated: legacy text field
    description: string;
  };
  locationNodeId?: string; // New: references LocationNode.id for hierarchical filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>;
  attachments?: Array<{ fieldId: string; name: string; url?: string; mime?: string; bytes?: number }>;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'closed';
}

/**
 * Documentation with Multi-Location Support
 * Allows tagging documents to multiple locations in the hierarchy
 */
export interface Document {
  id: string;
  title: string;
  type: 'sop' | 'jha' | 'policy' | 'procedure' | 'other';
  locationNodeIds: string[]; // Array of LocationNode IDs - documents can be tagged to multiple locations
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  status: 'draft' | 'active' | 'archived';
  approvedBy?: string;
  approvedAt?: string;
}

