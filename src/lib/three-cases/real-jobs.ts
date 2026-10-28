"use client";

// Data for V1, the version built from the real research (GUARD-1845, files 07 and 08): the 10 job
// families (called "jobs"), the documents each one needs, assets named like the clients' titles, the
// states a document really has, and the preventive maintenance (PM) an asset already has. Fictitious
// plant. Kept apart from ThreeCasesContext so option F stays as it was.

import { useCallback, useEffect, useState } from "react";
import { person } from "./data";

/** The six document types, in the order of the EHS sidebar. */
export type Kind = "jha" | "sop" | "loto" | "ptw" | "audit" | "sds";
export type Flag = "risk" | "chemical" | "moving" | "fluid" | "hot" | "energized" | "height" | "confined";
export type DocState = "valid" | "expiring" | "expired" | "awaiting" | "draft" | "missing";
export type Level = "required" | "recommended";
export type GroupId = "routine" | "change" | "permit";
export type Priority = "none" | "low" | "medium" | "high";
export type Unit = "day" | "week" | "month" | "year";

export const KINDS: Kind[] = ["jha", "sop", "loto", "ptw", "audit", "sds"];
export const KIND_LABEL: Record<Kind, string> = { jha: "JHA", sop: "SOP", loto: "LOTO", ptw: "Permit to Work", audit: "Audit / Inspection", sds: "SDS" };
/** Short names for the chips in the list. */
export const KIND_SHORT: Record<Kind, string> = { jha: "JHA", sop: "SOP", loto: "LOTO", ptw: "Permit", audit: "Audit", sds: "SDS" };
/** An SDS comes from the manufacturer's PDF, so a draft cannot be started from the asset (see the notes). */
export const DRAFTABLE: Kind[] = ["jha", "sop", "loto", "ptw", "audit"];
export const GROUPS: { id: GroupId; label: string }[] = [
  { id: "routine", label: "Routines" },
  { id: "change", label: "Replace and repair" },
  { id: "permit", label: "Permit work" },
];
/** The default work order categories of the CMMS (utils/categoryTranslation.js); a company can add its own. */
export const CATEGORIES = ["Safety", "Inspection", "Preventative", "Electrical", "Damage", "Upgrade", "Project", "Meter", "None"];
export const defaultCategory = (famId: string) => (famId === "inspect" ? "Inspection" : "Safety");

/** The tasks a checklist usually has for each job: the person edits them in the form. */
const TASKS: Record<string, string[]> = {
  inspect: ["Check guards and emergency stops", "Look for leaks, cracks and wear", "Check controls, gauges and lights", "Record each item as pass or fail"],
  clean: ["Stop the machine and lock it out", "Remove debris and residue", "Clean with the approved product", "Dry, restart and log"],
  lube: ["Lock out the machine", "Add or drain lubricant to the level", "Replace the filters", "Wipe, restart and log the date"],
  adjust: ["Lock out the machine", "Measure against the specification", "Adjust and tighten", "Test and log the result"],
};
export const tasksFor = (famId: string) => TASKS[famId] ?? ["Review the JHA and the SOP", "Do the work", "Test and log the result"];

const DOC_ITEMS: Partial<Record<Kind, string[]>> = {
  sop: ["Read the SOP before starting", "Do each step in order", "Record anything that differs from the SOP", "Sign off the last step"],
  loto: ["Notify the people affected", "Shut down and isolate every energy source", "Apply the lock and tag", "Verify zero energy", "Remove the locks when done"],
};
/** The company's own checklist templates, in the CMMS. */
const LIBRARY: ChecklistOpt[] = [
  { id: "lib-walk", name: "Weekly walk-around", items: TASKS.inspect },
  { id: "lib-pre", name: "Pre-use inspection", items: ["Check tires, forks and mast", "Check horn, lights and alarm", "Check brakes and steering", "Check fluid levels", "Report any defect"] },
  { id: "lib-lube", name: "Lubrication round", items: TASKS.lube },
  { id: "lib-clean", name: "Clean and sanitize", items: TASKS.clean },
];
export const libraryChecklists = () => LIBRARY;
/** The checklists the chosen assets already have through their documents, then the job's usual one. */
export function checklistOptions(docs: Doc[], famId: string): ChecklistOpt[] {
  const fromDocs = docs
    .filter((d) => d.type === "audit" || d.type === "sop" || d.type === "loto")
    .map((d): ChecklistOpt => ({ id: `doc-${d.ref}`, name: d.title, items: d.type === "audit" ? tasksFor(famId) : (DOC_ITEMS[d.type] ?? []), from: d.ref }));
  return fromDocs;
}

export const PRIORITY_LABEL: Record<Priority, string> = { none: "None", low: "Low", medium: "Medium", high: "High" };

export interface Every {
  n: number;
  unit: Unit;
}
export const everyText = (e: Every) => `Every ${e.n === 1 ? e.unit : `${e.n} ${e.unit}s`}`;

/** How a PM repeats in the CMMS: a fixed schedule or counting from the last completion, when its work orders are created, and the periods it pauses. Calendar schedules only; meter schedules do not apply here. */
export type Basis = "fixed" | "completion";
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export interface MonthDay {
  m: number;
  d: number;
}
export interface Schedule {
  basis: Basis;
  /** Time of day the work order is due. */
  time: string;
  create: { mode: "before"; n: number; unit: "hours" | "days" | "weeks" } | { mode: "weekday"; day: string; time: string };
  inactive: { from: MonthDay; to: MonthDay }[];
}
export const DEFAULT_SCHEDULE: Schedule = { basis: "fixed", time: "08:00", create: { mode: "before", n: 1, unit: "days" }, inactive: [] };
export const fmtMonthDay = (x: MonthDay) => `${MONTHS[x.m - 1]} ${x.d}`;

/** A checklist is a template of the CMMS: a work order or PM takes one. Documents (SOP, LOTO, Audit) can have one linked. */
export interface ChecklistOpt {
  id: string;
  name: string;
  items: string[];
  /** The document it is linked to, if any. */
  from?: string;
}

export interface Need {
  type: Kind;
  level: Level;
  /** The need only applies to assets with this trait. */
  when?: Flag;
}
export interface Family {
  id: string;
  label: string;
  group: GroupId;
  hint: string;
  /** What the research says about how it is scheduled. */
  rhythm: string;
  needs: Need[];
  /** How often a PM for this job repeats unless the person changes it. */
  every: Every;
  custom?: boolean;
}

// The package per job is a product proposal from file 08, section 4: not legal advice. Which of it
// applies to an asset also depends on the asset (moving parts, chemicals, hot surfaces…).
export const FAMILIES: Family[] = [
  { id: "inspect", label: "Inspect", group: "routine", hint: "Walk-arounds, pre-use and periodic inspections", rhythm: "89% recurring (PM)", every: { n: 1, unit: "week" }, needs: [{ type: "jha", level: "required", when: "risk" }, { type: "sop", level: "required", when: "risk" }, { type: "audit", level: "required" }] },
  { id: "clean", label: "Clean", group: "routine", hint: "Cleaning and sanitizing", rhythm: "79% recurring (PM)", every: { n: 1, unit: "week" }, needs: [{ type: "jha", level: "required" }, { type: "sop", level: "recommended" }, { type: "sds", level: "required", when: "chemical" }, { type: "loto", level: "required", when: "moving" }] },
  { id: "lube", label: "Lubricate / service", group: "routine", hint: "Oil, filters, grease, scheduled service", rhythm: "84% recurring (PM)", every: { n: 1, unit: "month" }, needs: [{ type: "loto", level: "required" }, { type: "jha", level: "recommended" }, { type: "sop", level: "recommended" }, { type: "sds", level: "required", when: "chemical" }] },
  { id: "replace", label: "Replace / install", group: "change", hint: "Swap a part, belt, battery or tool", rhythm: "Mostly one-off (5 to 13% PM)", every: { n: 1, unit: "month" }, needs: [{ type: "loto", level: "required" }, { type: "jha", level: "required" }, { type: "sop", level: "recommended" }, { type: "ptw", level: "required", when: "hot" }, { type: "sds", level: "required", when: "fluid" }] },
  { id: "repair", label: "Repair / troubleshoot", group: "change", hint: "Find a fault and fix it", rhythm: "Mostly one-off (5 to 13% PM)", every: { n: 1, unit: "month" }, needs: [{ type: "loto", level: "required" }, { type: "jha", level: "required" }, { type: "sop", level: "recommended" }, { type: "ptw", level: "required", when: "energized" }] },
  { id: "adjust", label: "Adjust / calibrate / test", group: "change", hint: "Valve lash, alignment, calibration, tests", rhythm: "Mixed", every: { n: 3, unit: "month" }, needs: [{ type: "sop", level: "required" }, { type: "jha", level: "recommended" }, { type: "loto", level: "required", when: "moving" }] },
  { id: "weld", label: "Weld / cut / grind", group: "permit", hint: "Hot work", rhythm: "One-off", every: { n: 1, unit: "month" }, needs: [{ type: "jha", level: "required" }, { type: "sop", level: "recommended" }, { type: "loto", level: "required", when: "moving" }, { type: "ptw", level: "required" }, { type: "sds", level: "required", when: "chemical" }] },
  { id: "confined", label: "Confined space", group: "permit", hint: "Entering tanks, boilers and vessels", rhythm: "One-off", every: { n: 1, unit: "month" }, needs: [{ type: "jha", level: "required" }, { type: "loto", level: "required" }, { type: "ptw", level: "required" }, { type: "sop", level: "recommended" }] },
  { id: "height", label: "Work at height", group: "permit", hint: "Roofs, ladders, lifts", rhythm: "One-off", every: { n: 1, unit: "month" }, needs: [{ type: "jha", level: "required" }, { type: "sop", level: "recommended" }] },
  { id: "electrical", label: "Electrical", group: "permit", hint: "Energized or electrical work", rhythm: "One-off", every: { n: 1, unit: "month" }, needs: [{ type: "loto", level: "required" }, { type: "jha", level: "required" }, { type: "ptw", level: "required", when: "energized" }, { type: "sop", level: "recommended" }] },
];

export interface RAsset {
  id: string;
  code: string;
  name: string;
  make: string;
  location: string;
  flags: Flag[];
  /** How many work orders of each job this asset has had: where it shows first under a job. */
  usedFor: Record<string, number>;
}

export const ASSETS: RAsset[] = [
  { id: "ac1", code: "AC-1", name: "Air Compressor 1", make: "Kaeser CSD 75", location: "Utility room", flags: ["moving", "fluid", "risk"], usedFor: { inspect: 12, clean: 2, lube: 9, replace: 3, repair: 4, adjust: 1 } },
  { id: "dry1", code: "DR-1", name: "Kaeser dryer", make: "Refrigerated air dryer", location: "Utility room", flags: ["fluid"], usedFor: { inspect: 5, clean: 1, lube: 3, repair: 1 } },
  { id: "cnc3", code: "CNC-3", name: "Haas VF3", make: "Vertical machining center", location: "Machine shop", flags: ["moving", "chemical", "risk"], usedFor: { inspect: 6, clean: 15, lube: 8, replace: 4, repair: 3, adjust: 5 } },
  { id: "fl3", code: "FL-03", name: "Forklift FL-03", make: "Toyota 8FGU25", location: "Warehouse", flags: ["moving", "fluid", "risk"], usedFor: { inspect: 28, clean: 3, lube: 6, replace: 5, repair: 4, weld: 1 } },
  { id: "fl4", code: "FL-04", name: "Forklift FL-04", make: "Toyota 8FGU25", location: "Warehouse", flags: ["moving", "fluid", "risk"], usedFor: { inspect: 24, clean: 2, lube: 5, replace: 3 } },
  { id: "eng2", code: "ENG-2", name: "Wartsila 50SG engine", make: "Gas genset", location: "Power house", flags: ["moving", "hot", "fluid", "risk"], usedFor: { inspect: 4, lube: 6, replace: 3, repair: 3, adjust: 9, weld: 1 } },
  { id: "pr2", code: "PR-2", name: "Hydraulic Press 2", make: "Hydraulic press", location: "Machine shop", flags: ["moving", "fluid", "risk"], usedFor: { inspect: 9, clean: 5, lube: 4, repair: 6, adjust: 2 } },
  { id: "cv4", code: "CV-4", name: "Conveyor 4", make: "Belt conveyor", location: "Packaging", flags: ["moving", "risk"], usedFor: { inspect: 8, clean: 6, lube: 3, replace: 2, adjust: 3 } },
  { id: "blr1", code: "BLR-1", name: "Boiler 1", make: "Fire-tube boiler", location: "Boiler room", flags: ["hot", "confined", "risk"], usedFor: { inspect: 7, clean: 1, repair: 2, confined: 2 } },
  { id: "t12", code: "T-12", name: "Mixing tank T-12", make: "Process tank", location: "Process area", flags: ["confined", "chemical", "moving"], usedFor: { inspect: 2, clean: 4, confined: 3 } },
  { id: "rtu3", code: "RTU-3", name: "Rooftop unit RTU-3", make: "HVAC unit", location: "Roof", flags: ["height", "energized", "moving"], usedFor: { inspect: 3, replace: 2, repair: 1, height: 3 } },
  { id: "mcc2", code: "MCC-2", name: "Motor control center MCC-2", make: "480 V switchgear", location: "Electrical room", flags: ["energized", "risk"], usedFor: { inspect: 4, repair: 1, electrical: 3 } },
  { id: "wb1", code: "WB-1", name: "Welding bay 1", make: "Fabrication bay", location: "Maintenance shop", flags: ["hot", "chemical"], usedFor: { inspect: 1, weld: 5 } },
  { id: "ch2", code: "CH-2", name: "Chiller 2", make: "Water chiller", location: "Utility room", flags: ["moving", "fluid", "energized"], usedFor: { inspect: 5, lube: 3, repair: 2, electrical: 1 } },
  { id: "p101", code: "P-101", name: "Transfer pump P-101", make: "Centrifugal pump", location: "Process area", flags: ["moving", "fluid", "chemical"], usedFor: { inspect: 5, lube: 4, replace: 3, repair: 2 } },
  { id: "bs1", code: "BS-1", name: "Belt saw 1", make: "Band saw", location: "Machine shop", flags: ["moving", "risk"], usedFor: { inspect: 2, clean: 3, adjust: 1 } },
];
export const getAsset = (id: string) => ASSETS.find((a) => a.id === id);

interface Seed {
  assetId: string;
  type: Kind;
  state: DocState;
  ref: string;
  title: string;
  ownerId: string;
  approvers: string[];
  /** Days until it expires, days since it expired, or days since it was sent for approval. */
  days?: number;
}
const s = (assetId: string, type: Kind, state: DocState, ref: string, title: string, o: Partial<Seed> = {}): Seed => ({ assetId, type, state, ref, title, ownerId: "dan", approvers: ["maria"], ...o });

const SEEDS: Seed[] = [
  s("ac1", "loto", "valid", "LOTO-0012", "LOTO: Air Compressor 1", { approvers: ["maria", "dan"] }),
  s("ac1", "sop", "awaiting", "SOP-0071", "Air Compressor 1: drain and service", { days: 6 }),
  s("ac1", "jha", "valid", "JHA-0040", "JHA: Compressed air systems"),
  s("ac1", "audit", "valid", "AUD-0018", "Compressor weekly walk-around"),
  s("dry1", "audit", "valid", "AUD-0019", "Dryer weekly check"),
  s("dry1", "jha", "valid", "JHA-0041", "JHA: Dryer cleaning"),
  s("cnc3", "sop", "valid", "SOP-0058", "Haas VF3 Operation"),
  s("cnc3", "jha", "expired", "JHA-0019", "JHA: CNC machining", { days: 20 }),
  s("cnc3", "audit", "valid", "AUD-0024", "CNC daily start-up check"),
  s("fl3", "audit", "valid", "AUD-0030", "Forklift pre-use inspection"),
  s("fl3", "jha", "valid", "JHA-0022", "JHA: Forklift operation"),
  s("fl3", "sop", "valid", "SOP-0044", "Forklift battery change"),
  s("fl3", "loto", "awaiting", "LOTO-0046", "LOTO: Forklift FL-03", { approvers: ["maria", "dan"], days: 4, ownerId: "carlos" }),
  s("fl4", "audit", "valid", "AUD-0030", "Forklift pre-use inspection"),
  s("fl4", "jha", "valid", "JHA-0022", "JHA: Forklift operation"),
  s("eng2", "loto", "valid", "LOTO-0009", "LOTO: Wartsila 50SG", { approvers: ["maria", "dan"] }),
  s("eng2", "jha", "valid", "JHA-0031", "JHA: Valve lash adjustment"),
  s("pr2", "loto", "expired", "LOTO-0014", "LOTO: Hydraulic Press 2", { approvers: ["maria", "dan"], days: 41 }),
  s("pr2", "sop", "valid", "SOP-0027", "Hydraulic Press 2: die change"),
  s("pr2", "jha", "awaiting", "JHA-0051", "JHA: Press maintenance", { days: 3 }),
  s("cv4", "sop", "expiring", "SOP-0036", "Conveyor 4: belt tracking", { days: 5 }),
  s("blr1", "loto", "valid", "LOTO-0020", "LOTO: Boiler 1", { approvers: ["maria", "dan"] }),
  s("blr1", "jha", "valid", "JHA-0016", "JHA: Boiler inspection"),
  s("blr1", "sop", "valid", "SOP-0020", "Boiler 1: annual inspection"),
  s("blr1", "audit", "valid", "AUD-0012", "Boiler daily round"),
  s("mcc2", "loto", "valid", "LOTO-0031", "LOTO: MCC-2", { approvers: ["maria", "dan"] }),
  s("mcc2", "audit", "awaiting", "AUD-0066", "MCC-2 thermography round", { days: 2 }),
  s("wb1", "jha", "valid", "JHA-0008", "JHA: Hot work in the maintenance shop"),
  s("wb1", "sop", "valid", "SOP-0010", "Welding bay procedure"),
  s("wb1", "sds", "valid", "SDS-0100", "Shielding gas SDS"),
  s("p101", "sds", "expired", "SDS-0102", "SDS: Pump seal flush", { days: 60 }),
  s("bs1", "sop", "valid", "SOP-0033", "Belt saw 1 Operation"),
  s("wb1", "ptw", "valid", "PTW-0007", "Hot work permit: Welding bay 1"),
  s("blr1", "ptw", "valid", "PTW-0012", "Confined space entry: Boiler 1"),
  s("eng2", "ptw", "expiring", "PTW-0015", "Hot work permit: Wartsila 50SG", { days: 9 }),
  s("mcc2", "ptw", "valid", "PTW-0019", "Energized work permit: MCC-2"),
];

/** The person using the prototype. */
export const ME = "maria";
export const ASSIGNEES = ["carlos", "tom", "dan"];

/** What a document looks like once the store has had its say about it. */
export interface Doc {
  type: Kind;
  state: DocState;
  ref: string;
  title: string;
  ownerId: string;
  approvers: string[];
  days?: number;
}

export interface Rec {
  id: string;
  ref: string;
  kind: "pm" | "wo";
  title: string;
  assetIds: string[];
  famId: string;
  assigneeId: string;
  priority: Priority;
  category: string;
  hours: number;
  signature: boolean;
  /** First work order of a PM, or the due date of a work order. */
  date: string;
  every?: Every;
  /** Document types the person left attached. Each asset brings the ones it has. */
  attach: Kind[];
  schedule?: Schedule;
  checklist?: string;
}

interface Store {
  /** Drafts the person asked for: they replace the asset's missing document. */
  docs: Record<string, Doc>;
  recs: Rec[];
  custom: Family[];
  nextWo: number;
  nextPm: number;
  /** The empty account: no seeded documents or PMs, only what the person makes. */
  empty?: boolean;
  /** Jobs the person hid (defaults or their own). They stay in the store so they can be shown again. */
  hidden: string[];
  /** Documents moved between Required and Optional, by job, asset and type. */
  levels: Record<string, Level>;
}
const BLANK: Store = { docs: {}, recs: [], custom: [], nextWo: 1201, nextPm: 210, hidden: [], levels: {} };
export const levelKey = (famId: string, assetId: string, type: Kind) => `${famId}|${assetId}|${type}`;
const KEY = "ehs-real-jobs-v4";

const key = (assetId: string, type: Kind) => `${assetId}|${type}`;

export function docOf(store: Pick<Store, "docs" | "empty">, assetId: string, type: Kind): Doc | undefined {
  const own = store.docs[key(assetId, type)];
  if (own) return own;
  if (store.empty) return undefined;
  const seed = SEEDS.find((x) => x.assetId === assetId && x.type === type);
  return seed ? { type: seed.type, state: seed.state, ref: seed.ref, title: seed.title, ownerId: seed.ownerId, approvers: seed.approvers, days: seed.days } : undefined;
}

export interface NeedState {
  type: Kind;
  level: Level;
  state: DocState;
  doc?: Doc;
}
export interface PmInfo {
  ref: string;
  every: Every;
  next: string;
  /** When the last work order of this PM was done, and its number, if there is one. */
  last?: string;
  lastRef?: string;
}
export interface RowStatus {
  asset: RAsset;
  fam: Family;
  needs: NeedState[];
  /** Required documents that are not valid: what the person has to act on. */
  action: NeedState[];
  /** What a draft can still be started for: missing, expired or about to expire (not already in approval or draft). */
  draftable: NeedState[];
  ready: boolean;
  pm?: PmInfo;
  /** The next work order for this job on this asset: from its PM, or a work order made here. */
  next?: { date: string; ref?: string };
}

export const allFamilies = (store: Pick<Store, "custom">) => [...FAMILIES, ...store.custom];

/** The documents a job needs on this asset: the job's package, narrowed by what the asset is. */
export function needsOf(fam: Family, asset: RAsset): Need[] {
  return fam.needs.filter((n) => !n.when || asset.flags.includes(n.when)).map((n) => ({ ...n, when: undefined }));
}

const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
export const dateIn = plusDays;
export const fmtDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** PMs that already run in this plant, by asset and job (days until the next work order). */
const PM_SEEDS: { assetId: string; famId: string; every: Every; last: number; next: number }[] = [
  { assetId: "ac1", famId: "inspect", every: { n: 1, unit: "week" }, last: 4, next: 3 },
  { assetId: "ac1", famId: "lube", every: { n: 1, unit: "month" }, last: 18, next: 12 },
  { assetId: "dry1", famId: "inspect", every: { n: 1, unit: "week" }, last: 2, next: 5 },
  { assetId: "cnc3", famId: "clean", every: { n: 1, unit: "week" }, last: 5, next: 2 },
  { assetId: "cnc3", famId: "lube", every: { n: 1, unit: "month" }, last: 21, next: 9 },
  { assetId: "fl3", famId: "inspect", every: { n: 1, unit: "day" }, last: 0, next: 1 },
  { assetId: "fl4", famId: "inspect", every: { n: 1, unit: "day" }, last: 0, next: 1 },
  { assetId: "eng2", famId: "adjust", every: { n: 3, unit: "month" }, last: 50, next: 40 },
  { assetId: "pr2", famId: "inspect", every: { n: 1, unit: "week" }, last: 3, next: 4 },
  { assetId: "cv4", famId: "clean", every: { n: 1, unit: "week" }, last: 1, next: 6 },
  { assetId: "blr1", famId: "inspect", every: { n: 1, unit: "day" }, last: 0, next: 1 },
  { assetId: "mcc2", famId: "inspect", every: { n: 1, unit: "month" }, last: 16, next: 14 },
  { assetId: "ch2", famId: "inspect", every: { n: 1, unit: "month" }, last: 10, next: 20 },
  { assetId: "p101", famId: "lube", every: { n: 1, unit: "month" }, last: 22, next: 8 },
];

export function pmOf(store: Pick<Store, "recs" | "empty">, assetId: string, famId: string): PmInfo | undefined {
  const made = store.recs.find((r) => r.kind === "pm" && r.famId === famId && r.assetIds.includes(assetId) && r.every);
  if (made?.every) return { ref: made.ref, every: made.every, next: made.date };
  if (store.empty) return undefined;
  const i = PM_SEEDS.findIndex((x) => x.assetId === assetId && x.famId === famId);
  const seed = PM_SEEDS[i];
  return seed ? { ref: `PM-${String(100 + i).padStart(4, "0")}`, every: seed.every, next: plusDays(seed.next), last: plusDays(-seed.last), lastRef: `WO-${1100 + i * 7}` } : undefined;
}

export function rowStatus(store: Store, fam: Family, asset: RAsset): RowStatus {
  // The AI suggests documents for every asset, so Required is never empty. A job the person added has no package of its
  // own: it suggests the three general ones (JHA, SOP, audit) and anything else the asset already has.
  const suggested: Need[] = fam.custom ? KINDS.filter((t) => ["jha", "sop", "audit"].includes(t) || docOf(store, asset.id, t)).map((t) => ({ type: t, level: "required" as Level })) : needsOf(fam, asset);
  // The account without documents has only the suggestions to show, so all of them are listed as required (and missing).
  const base: Need[] = suggested.map((n) => ({ ...n, level: store.empty ? ("required" as Level) : n.level }));
  // Documents the asset has that the AI did not suggest for this job: optional.
  for (const t of KINDS) if (!base.some((n) => n.type === t) && docOf(store, asset.id, t)) base.push({ type: t, level: "recommended" });
  // What the person dragged between Required and Optional counts from then on.
  for (const n of base) n.level = store.levels?.[levelKey(fam.id, asset.id, n.type)] ?? n.level;
  const needs = base.map((n): NeedState => {
    const doc = docOf(store, asset.id, n.type);
    return { type: n.type, level: n.level, state: doc?.state ?? "missing", doc };
  });
  needs.sort((a, b) => (a.level === b.level ? KINDS.indexOf(a.type) - KINDS.indexOf(b.type) : a.level === "required" ? -1 : 1));
  const action = needs.filter((n) => n.level === "required" && n.state !== "valid");
  const draftable = action.filter((n) => DRAFTABLE.includes(n.type) && (n.state === "missing" || n.state === "expired" || n.state === "expiring"));
  const pm = pmOf(store, asset.id, fam.id);
  const woDates = store.recs.filter((r) => r.kind === "wo" && r.famId === fam.id && r.assetIds.includes(asset.id)).map((r) => ({ date: r.date, ref: r.ref }));
  const next = [...(pm ? [{ date: pm.next, ref: undefined as string | undefined }] : []), ...woDates].sort((a, b) => a.date.localeCompare(b.date))[0];
  return { asset, fam, needs, action, draftable, ready: action.length === 0, pm, next };
}

/** Every asset shows under every job; the ones that have had this job before come first. */
export function rowsFor(store: Store, fam: Family): RowStatus[] {
  const used = (a: RAsset) => a.usedFor[fam.id] ?? 0;
  return [...ASSETS].sort((a, b) => used(b) - used(a)).map((a) => rowStatus(store, fam, a));
}

export function stateText(n: NeedState): string {
  const d = n.doc;
  const left = d ? d.approvers.map((p) => person(p).name.split(" ")[0]) : [];
  switch (n.state) {
    case "valid":
      return "Valid";
    case "missing":
      return "Missing";
    case "draft":
      return "Draft: finish it on the document page";
    case "awaiting":
      return `Awaiting ${left.join(" and ") || "approval"}${d?.days ? ` · sent ${d.days}d ago` : ""}`;
    case "expiring":
      return `Expires in ${d?.days ?? 0}d`;
    case "expired":
      return `Expired ${d?.days ?? 0}d ago`;
  }
}
export const STATE_WORD: Record<DocState, string> = { valid: "Valid", missing: "Missing", draft: "Draft", awaiting: "Awaiting approval", expiring: "Expiring", expired: "Expired" };

const nextRef = (store: Store, type: Kind) => {
  const taken = new Set([...SEEDS.map((x) => x.ref), ...Object.values(store.docs).map((d) => d.ref)]);
  const prefix = { jha: "JHA", sop: "SOP", loto: "LOTO", ptw: "PTW", audit: "AUD", sds: "SDS" }[type];
  for (let n = 60; ; n++) {
    const ref = `${prefix}-${String(n).padStart(4, "0")}`;
    if (!taken.has(ref)) return ref;
  }
};

export const woTitleFor = (fam: Family, a: RAsset) => `${fam.label.split(" / ")[0]} ${a.name}`;

export interface RecInput {
  kind: Rec["kind"];
  title: string;
  assetIds: string[];
  famId: string;
  assigneeId: string;
  priority: Priority;
  category: string;
  hours: number;
  signature: boolean;
  date: string;
  every?: Every;
  attach: Kind[];
  schedule?: Schedule;
  checklist?: string;
}

/** PMs, work orders and drafts the person made, kept in this browser. `empty` keeps the empty account's apart. */
export function useRealStore(empty = false) {
  const blank: Store = empty ? { ...BLANK, empty: true } : BLANK;
  const storeKey = empty ? `${KEY}-empty` : KEY;
  const [st, setSt] = useState<Store>(blank);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storeKey);
      if (raw) setSt({ ...blank, ...JSON.parse(raw), empty });
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the page remounts the store when the mode changes
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storeKey, JSON.stringify(st));
    } catch {}
  }, [st, hydrated, storeKey]);

  /** Starts a draft for each missing document, named after the asset. The person finishes it on the document page. */
  const createDrafts = (items: { assetId: string; type: Kind }[]) => {
    const made: { assetId: string; doc: Doc }[] = [];
    let cur = st;
    for (const it of items) {
      const a = getAsset(it.assetId);
      if (!a) continue;
      const doc: Doc = { type: it.type, state: "draft", ref: nextRef(cur, it.type), title: `${KIND_SHORT[it.type]}: ${a.name}`, ownerId: ME, approvers: [] };
      cur = { ...cur, docs: { ...cur.docs, [key(it.assetId, it.type)]: doc } };
      made.push({ assetId: it.assetId, doc });
    }
    setSt((x) => ({ ...x, docs: { ...x.docs, ...Object.fromEntries(made.map((m) => [key(m.assetId, m.doc.type), m.doc])) } }));
    return made;
  };

  /** A PM is one record for all its assets. A work order is one per asset. */
  const createRecs = (input: RecInput) => {
    let wo = st.nextWo;
    let pm = st.nextPm;
    const stamp = Date.now();
    const groups = input.kind === "pm" ? [input.assetIds] : input.assetIds.map((id) => [id]);
    const made: Rec[] = groups.map((ids, i) => ({
      id: `rec-${stamp}-${i}`,
      ref: input.kind === "pm" ? `PM-${String(pm++).padStart(4, "0")}` : `WO-${wo++}`,
      kind: input.kind,
      title: input.kind === "wo" && input.assetIds.length > 1 ? `${input.title.split(" · ")[0]} ${getAsset(ids[0])?.name}` : input.title,
      assetIds: ids,
      famId: input.famId,
      assigneeId: input.assigneeId,
      priority: input.priority,
      category: input.category,
      hours: input.hours,
      signature: input.signature,
      date: input.date,
      every: input.every,
      attach: input.attach,
      schedule: input.schedule,
      checklist: input.checklist,
    }));
    setSt((x) => ({ ...x, recs: [...made, ...x.recs], nextWo: wo, nextPm: pm }));
    return made;
  };

  const addFamily = (label: string) => {
    const id = `c${Date.now()}`;
    setSt((x) => ({ ...x, custom: [...x.custom, { id, label, group: "routine", hint: "Added by you", rhythm: "Your rule", every: { n: 1, unit: "month" }, needs: [], custom: true }] }));
    return id;
  };
  const removeFamily = (famId: string) => setSt((x) => ({ ...x, custom: x.custom.filter((f) => f.id !== famId), hidden: x.hidden.filter((h) => h !== famId) }));
  const hideFamily = (famId: string) => setSt((x) => ({ ...x, hidden: x.hidden.includes(famId) ? x.hidden : [...x.hidden, famId] }));
  const showFamily = (famId: string) => setSt((x) => ({ ...x, hidden: x.hidden.filter((h) => h !== famId) }));
  const setLevel = (famId: string, assetId: string, type: Kind, level: Level) => setSt((x) => ({ ...x, levels: { ...x.levels, [levelKey(famId, assetId, type)]: level } }));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `blank` only changes with `empty`, which remounts the page
  const reset = useCallback(() => setSt(blank), [empty]);

  return { ...st, hydrated, createDrafts, createRecs, addFamily, removeFamily, hideFamily, showFamily, setLevel, reset };
}
export type RealStore = ReturnType<typeof useRealStore>;

export function resetRealStore() {
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(`${KEY}-empty`);
  } catch {}
}
