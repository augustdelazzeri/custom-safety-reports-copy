// Types for the "3 use cases" prototype (Safety execution + event-to-action flow).
// Everything is scripted: no real AI and no backend.

export type DocType = "jha" | "sop" | "loto" | "ptw" | "audit" | "sds";

export interface DocColumn {
  type: DocType;
  label: string;
  short: string;
  /** Executed in the field (SOP, LOTO, PTW, inspections) vs. read/reference (JHA, SDS). */
  role: "prerequisite" | "executed" | "authorizes" | "reference";
  roleLabel: string;
}

export interface SafetyDoc {
  id: string;
  type: DocType;
  ref: string;
  title: string;
  status: "approved" | "in_review" | "draft";
  /** Job this document enables, when it is an executable document. */
  enables?: string;
}

export interface SafetyLocation {
  id: string;
  name: string;
  parentId?: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  initials: string;
  phone?: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  locationId: string;
  category: string;
  ownerId: string;
  docs: SafetyDoc[];
  /** Short line the AI shows when it suggests this asset. */
  aiHint?: string;
  aiHintTone?: "due" | "gap" | "event";
  lastWorkOrders: { ref: string; title: string; date: string }[];
}

export type PlanItemKind = "ptw" | "wo" | "pm" | "sop" | "loto" | "notify" | "attach" | "note";

export interface PlanItem {
  id: string;
  kind: PlanItemKind;
  title: string;
  detail: string;
  meta: string[];
  /** Why the AI added this item, with the source it read. */
  why?: string;
  isNew: boolean;
}

export interface ExecutionJob {
  id: string;
  assetId: string;
  verb: string;
  title: string;
  /** Document ids the AI read to propose this job. */
  basedOn: string[];
  reason: string;
  when: string;
  plan: PlanItem[];
  checklist: string[];
  woRef: string;
  assigneeId: string;
  recurring?: { rule: string; next: { date: string; note?: string }[] };
}

export type ControlLevel = "immediate" | "elimination" | "engineering" | "administrative" | "ppe";

export interface ActionOption {
  id: string;
  title: string;
  controlLevel: ControlLevel;
  why: string;
  /** A maintenance job: one work order per selected option. */
  workOrder?: { title: string; assigneeId: string; due: string };
  /** Something that is not a work order (training, inspection change). */
  sideEffect?: string;
}

export type StepKey = "reported" | "capa" | "wo" | "osha" | "verify";

export interface FlowStep {
  key: StepKey;
  label: string;
  requirement: "done" | "required" | "recommended" | "optional" | "not_needed";
}

export interface SafetyEventDemo {
  id: string;
  ref: string;
  title: string;
  description: string;
  type: "Observation" | "Near miss" | "Incident" | "Hazard";
  severity: "Low" | "Medium" | "High" | "Critical";
  locationId: string;
  assetId?: string;
  reportedBy: string;
  reportedVia: "QR code" | "Web" | "Mobile";
  reportedAt: string;
  oshaRecordable: boolean;
  aiSummary: string;
  aiRecommendation: string;
  steps: FlowStep[];
  options: ActionOption[];
  capaDefaults?: { ownerId: string; due: string; priority: "High" | "Medium" | "Low"; type: "Corrective" | "Preventive" };
  osha?: { caseNumber: string; classification: string; injury: string; daysAway: number };
  verifyEvidence?: string;
}
