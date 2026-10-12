// Shared types for the AI-first prototypes (/ai-first/*).
// Everything here is simulated on the client: no real AI calls, no backend.

export type ReportType = "near_miss" | "incident" | "hazard" | "maintenance";
export type Severity = "low" | "medium" | "high" | "critical";
export type Channel = "photo" | "whatsapp" | "sms" | "web_chat" | "inspection";
export type ReportStatus = "new" | "approved" | "plan_created" | "closed";

export interface Pin {
  id: number;
  x: number; // percent of image width
  y: number; // percent of image height
  label: string;
  kind: "hazard" | "review" | "positive";
}

export interface AiFieldValue {
  key: string;
  label: string;
  value: string;
  aiValue: string;
  confidence: number; // 0..1
  source: string; // where the AI got it from, shown to the user
  edited?: boolean;
  cleared?: boolean;
  multiline?: boolean;
}

export interface QuickAnswers {
  injury?: "yes" | "no" | "unsure";
  treatment?: "yes" | "no" | "unsure";
  stopped?: "yes" | "no" | "unsure";
}

export interface Report {
  id: string;
  createdAt: string;
  channel: Channel;
  type: ReportType;
  alsoMaintenance?: boolean;
  title: string;
  description: string;
  location: string;
  asset?: string;
  severity: Severity;
  severityConfidence: number;
  hazards: string[];
  answers: QuickAnswers;
  photo: string;
  pins: Pin[];
  reporter: string;
  language: string;
  status: ReportStatus;
  oshaPossible: boolean;
  aiTouched: string[]; // field keys the person changed after the AI draft
}

export type TaskKind = "work_order" | "training" | "document" | "calendar";
export type ControlLevel = "elimination" | "substitution" | "engineering" | "administrative" | "ppe";

export interface PlanTask {
  id: string;
  kind: TaskKind;
  title: string;
  detail: string;
  owner: string;
  due: string;
  selected: boolean;
  source: string;
}

export interface PlanCapa {
  id: string;
  title: string;
  controlLevel: ControlLevel;
  rationale: string;
  tasks: PlanTask[];
  selected: boolean;
}

export interface AgentLogEntry {
  day: number;
  at: string;
  actor: "agent" | "person";
  text: string;
  channel?: string;
}

export interface Capa {
  id: string;
  reportId: string;
  title: string;
  rootCause: string;
  controlLevel: ControlLevel;
  tasks: PlanTask[];
  status: "open" | "close_proposed" | "closed";
  day: number;
  log: AgentLogEntry[];
}

export interface WorkOrder {
  id: string;
  title: string;
  asset: string;
  location: string;
  priority: "low" | "medium" | "high";
  capaId?: string;
  source: string;
  status: "open" | "done";
  createdAt: string;
}

export type InboxKind = "event_review" | "osha_check" | "capa_overdue" | "inspection_fail" | "auto_handled";

export interface InboxItem {
  id: string;
  kind: InboxKind;
  title: string;
  location: string;
  createdAt: string;
  reason: string; // why the AI put it in front of a person
  suggestion: string;
  confidence: number;
  risk: "low" | "medium" | "high";
  needsPerson: boolean; // severity, recordability and CAPA decisions always need a person
  reportId?: string;
  done?: "approved" | "edited" | "skipped" | "undone";
}
