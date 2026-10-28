"use client";

// Data and rules for F2, the MVP of GUARD-1845 (see MVP-scope.md in the EHS worktree). Per job and per
// asset, the OSHA says which documents are needed (sections 4.1 and 4.2 of that file). Fictitious plant.
// Everything here is front-end only: the real feature gets this from the EHS server and the CMMS.

import { useCallback, useEffect, useState } from "react";
import { person } from "./data";
import { skipsSuggestion, ASSETS as BASE_ASSETS, GROUPS, dateIn, libraryChecklists, tasksFor, type ChecklistOpt, type DocState, type GroupId, type Priority } from "./real-jobs";

/** The five document types of the MVP (the SDS is out), in the order of the EHS sidebar. */
export type MvpKind = "jha" | "sop" | "loto" | "ptw" | "audit";
export const MVP_KINDS: MvpKind[] = ["jha", "sop", "loto", "ptw", "audit"];
export const MVP_SHORT: Record<MvpKind, string> = { jha: "JHA", sop: "SOP", loto: "LOTO", ptw: "Permit", audit: "Audit" };
export const MVP_LABEL: Record<MvpKind, string> = { jha: "JHA", sop: "SOP", loto: "LOTO", ptw: "Permit to Work", audit: "Audit / Inspection" };
export { GROUPS };
export type Level = "required" | "optional";
export type Phase = 1 | 2 | 3;

// ───────────────────────────── jobs

export interface MvpJob {
  id: string;
  label: string;
  group: GroupId;
  hint: string;
  /** Words (English, Spanish, Portuguese) that mark a document title as being about this job. */
  words: string[];
  custom?: boolean;
}

export const JOBS: MvpJob[] = [
  { id: "inspect", label: "Inspect", group: "routine", hint: "Walk-arounds, pre-use and periodic inspections", words: ["inspect", "check", "walk", "round", "pre-use", "revis", "inspec"] },
  { id: "clean", label: "Clean", group: "routine", hint: "Cleaning and sanitizing", words: ["clean", "sanit", "wash", "limpi", "limpe", "lav"] },
  { id: "lube", label: "Lubricate / service", group: "routine", hint: "Oil, filters, grease, scheduled service", words: ["lubric", "lube", "grease", "oil", "service", "servic", "engraxe"] },
  { id: "replace", label: "Replace / install", group: "change", hint: "Swap a part, belt, battery or tool", words: ["replac", "install", "change", "swap", "cambio", "troca", "substitu", "instal"] },
  { id: "repair", label: "Repair / troubleshoot", group: "change", hint: "Find a fault and fix it", words: ["repair", "troubleshoot", "fix", "repar", "conserto", "arregl"] },
  { id: "adjust", label: "Adjust / calibrate / test", group: "change", hint: "Valve lash, alignment, calibration, tests", words: ["adjust", "calibr", "test", "align", "ajust", "prueba", "teste", "die"] },
  { id: "weld", label: "Weld / cut / grind", group: "permit", hint: "Hot work", words: ["weld", "cut", "grind", "hot work", "solda", "soldad"] },
  { id: "confined", label: "Confined space", group: "permit", hint: "Entering tanks, boilers and vessels", words: ["confined", "entry", "confinad"] },
  { id: "height", label: "Work at height", group: "permit", hint: "Roofs, ladders, lifts", words: ["height", "ladder", "fall", "roof", "altura"] },
  { id: "electrical", label: "Electrical", group: "permit", hint: "Energized or electrical work", words: ["electric", "energized", "eletric", "eléctric", "elétric"] },
];

/** A job the company made: just a name. Its words are the words of the name. */
export const wordsOf = (name: string) =>
  name
    .toLowerCase()
    .split(/[^a-z0-9áéíóúãõç]+/)
    .filter((w) => w.length > 3)
    .map((w) => w.slice(0, 6));

export function jobMatches(job: MvpJob, title: string) {
  const t = title.toLowerCase();
  return job.words.some((w) => t.includes(w));
}

// ───────────────────────────── assets and what the OSHA asks for them

export type AssetClass = "M" | "V" | "R" | "P" | "E" | "B" | "C" | "L" | "H" | "O";
export const CLASS_LABEL: Record<AssetClass, string> = {
  M: "Fixed machine",
  V: "Forklift / industrial vehicle",
  R: "Road vehicle",
  P: "Plug-in equipment",
  E: "Electrical installation",
  B: "Building / generic",
  C: "Confined space",
  L: "Lifting equipment",
  H: "Ladder / height",
  O: "Unknown",
};
const CLASS_SHORT: Record<AssetClass, string> = { M: "Machine", V: "Forklift", R: "Road vehicle", P: "Plug-in", E: "Electrical", B: "Building", C: "Confined space", L: "Lifting", H: "Height", O: "Class unknown" };

export interface MvpAsset {
  id: string;
  code: string;
  name: string;
  location: string;
  /** Only the AI (phase 2) recognizes it: a name that is just a code. */
  ai?: { cls: AssetClass; why: string };
  /** The OSHA rules that depend on the kind of machine, not on the class alone. */
  special?: "extinguisher" | "mechpress";
}

const EXTRA_ASSETS: MvpAsset[] = [
  { id: "f012", code: "F012", name: "F012 - 8FDE204", location: "Warehouse", ai: { cls: "V", why: "Model 8FDE is a Toyota electric forklift; category PIT (powered industrial truck)" } },
  { id: "trk7", code: "T-07", name: "Truck T-07 (F-150)", location: "Yard" },
  { id: "oc1", code: "OC-1", name: "Overhead crane OC-1", location: "Machine shop" },
  { id: "ld4", code: "LD-4", name: "Ladder LD-4", location: "Maintenance shop" },
  { id: "fe12", code: "FE-12", name: "Fire extinguisher FE-12", location: "Packaging", special: "extinguisher" },
  { id: "mp1", code: "MP-1", name: "Mechanical press MP-1", location: "Press line", special: "mechpress" },
  { id: "drl9", code: "D-9", name: "Cordless drill D-9", location: "Maintenance shop" },
  { id: "site", code: "N/A", name: "Building / Site N/A", location: "Springfield Plant", ai: { cls: "O", why: "Generic name; nothing says what equipment it is" } },
];
export const MVP_ASSETS: MvpAsset[] = [...BASE_ASSETS.map((a): MvpAsset => ({ id: a.id, code: a.code, name: a.name, location: a.location })), ...EXTRA_ASSETS];
export const getMvpAsset = (id: string) => MVP_ASSETS.find((a) => a.id === id);

/** Phase 1: a list of words on the name. The first group that matches wins, so the order matters. */
const KEYWORDS: [AssetClass, string[]][] = [
  ["E", ["switchgear", "panel", "mcc", "motor control", "transformer", "breaker", "dock door"]],
  ["V", ["forklift", "pallet jack", "reach truck", "tugger", "stacker", "lift truck"]],
  ["R", ["truck", "pickup", "f-150", "van ", "trailer", "vehicle"]],
  ["L", ["crane", "hoist", "sling", "elevator"]],
  ["H", ["ladder", "scaffold", "fall protection"]],
  ["C", ["tank", "boiler", "silo", "vessel", "hopper", "tower"]],
  ["P", ["drill", "cordless", "portable", "handheld"]],
  ["B", ["extinguisher", "eyewash", "sprinkler", "welding bay", "alarm"]],
  ["M", ["press", "compressor", "conveyor", "pump", "cnc", "haas", "saw", "mill", "lathe", "chiller", "dryer", "engine", "genset", "mixer", "grinder", "fan", "blower", "rooftop", "unit"]],
];
function classByWords(name: string): AssetClass {
  const n = ` ${name.toLowerCase()} `;
  return KEYWORDS.find(([, ws]) => ws.some((w) => n.includes(w)))?.[0] ?? "O";
}
export interface ClassInfo {
  cls: AssetClass;
  by: "name" | "ai" | "unknown";
  label: string;
  why?: string;
}
export function classOf(a: MvpAsset, ai: boolean): ClassInfo {
  const kw = classByWords(a.name);
  if (kw !== "O") return { cls: kw, by: "name", label: CLASS_SHORT[kw] };
  if (ai && a.ai) return { cls: a.ai.cls, by: "ai", label: CLASS_SHORT[a.ai.cls], why: a.ai.why };
  return { cls: "O", by: "unknown", label: CLASS_SHORT.O };
}

// The OSHA tables of MVP-scope.md, section 4.1. S = required, ? = ask, N = does not apply.
const CLASS_ORDER: AssetClass[] = ["M", "V", "R", "P", "E", "B", "C", "L", "H", "O"];
const LOTO: Record<string, string> = {
  inspect: "NNNNNNNNNN",
  clean: "??NN?N??N?",
  lube: "SSSNSNSSN?",
  replace: "SSS?SNSSN?",
  repair: "SSS?SNSSN?",
  adjust: "???N?N??N?",
  weld: "???N?NS?N?",
  confined: "SSNNSNSSN?",
  height: "??NN?N??NN",
  electrical: "SSS?S?NSN?",
};

export interface Default {
  level: Level | "none";
  /** Optional but worth having ("recommended" in the OSHA guidance). */
  recommended?: boolean;
  /** The answer depends on the job: the chip carries a "?" and the question. */
  ask?: string;
  why: string;
}
const none: Default = { level: "none", why: "Not usually needed for this job" };

export function defaultsFor(job: MvpJob, a: MvpAsset, info: ClassInfo): Record<MvpKind, Default> {
  const cls = info.cls;
  const j = job.id;
  const jobName = job.label.split(" / ")[0].toLowerCase();

  // LOTO
  let loto: Default = none;
  const cell = job.custom ? ("MVECLO".includes(cls) ? "?" : "N") : (LOTO[j]?.[CLASS_ORDER.indexOf(cls)] ?? "N");
  if (cell === "S") {
    loto = { level: "required", why: cls === "R" ? `Road vehicle + ${jobName}: LOTO, or take the key out and keep it (OSHA 1910.147)` : `${CLASS_LABEL[cls]} + ${jobName}: LOTO required (OSHA 1910.147)` };
  } else if (cell === "?") {
    const q = cls === "P" ? "Is the plug under your control while you work? Then LOTO is not needed" : cls === "O" ? "We could not tell what this is. Does the work remove guards or reach the danger zone? Then LOTO is required" : "Does the work remove guards or reach the danger zone? Then LOTO is required";
    loto = { level: "optional", ask: q, why: `${CLASS_LABEL[cls]} + ${jobName}: depends on the work (OSHA 1910.147)` };
  }

  // Permit to work
  let ptw: Default = none;
  if (j === "weld") ptw = { level: "required", why: "Hot work: OSHA 1910.252 requires authorization, and the permit is how Safety records it" };
  else if (j === "confined") ptw = { level: "optional", ask: "Is it a permit-required space? Then the permit is required", why: "Confined space entry: OSHA 1910.146" };

  // JHA: no general rule requires it
  const highRisk = ["weld", "confined", "height", "electrical"].includes(j);
  const jha: Default = j === "inspect" ? none : { level: "optional", recommended: highRisk, why: highRisk ? "No OSHA rule requires it, but it is recommended for high-risk work (OSHA 3071)" : "No OSHA rule requires it" };

  // SOP
  let sop: Default = { level: "optional", why: j === "lube" || j === "electrical" ? "The lockout procedure already covers the steps" : "OSHA rarely requires a written SOP" };
  if (j === "confined") sop = { level: "required", why: "Written confined space program (OSHA 1910.146)" };
  else if (j === "adjust" && a.special === "mechpress") sop = { level: "required", why: "Die setting and adjustment procedure for mechanical presses (OSHA 1910.217)" };

  // Audit / inspection
  let audit: Default = { level: "optional", why: "Not required by the OSHA" };
  if (j === "inspect") {
    if (cls === "L") audit = { level: "required", why: "Lifting equipment: the inspection record is required (OSHA 1910.179, 1910.184)" };
    else if (a.special === "extinguisher") audit = { level: "required", why: "Fire extinguisher: monthly inspection record (OSHA 1910.157)" };
    else if (a.special === "mechpress") audit = { level: "required", why: "Mechanical press: inspection record (OSHA 1910.217)" };
    else if (cls === "V") audit = { level: "optional", recommended: true, why: "Daily forklift inspection is required (OSHA 1910.178), but not the record" };
    else if (cls === "H") audit = { level: "optional", recommended: true, why: "Inspect before use is required (OSHA 1910.23), but not the record" };
  } else if (j === "adjust" && a.special === "mechpress") audit = { level: "required", why: "Mechanical press: inspection record (OSHA 1910.217)" };
  else if (j === "height") audit = { level: "optional", recommended: true, why: "Inspect the equipment before use" };

  return { jha, sop, loto, ptw, audit };
}

// ───────────────────────────── documents

export interface MvpDoc {
  ref: string;
  type: MvpKind;
  title: string;
  /** Assets it is linked to. Empty: a document of the company (a program). */
  assetIds: string[];
  state: DocState;
  days?: number;
  approvers: string[];
}
const d = (ref: string, type: MvpKind, title: string, assetIds: string[], state: DocState, days?: number): MvpDoc => ({ ref, type, title, assetIds, state, days, approvers: ["maria"] });

export const DOCS: MvpDoc[] = [
  d("LOTO-0012", "loto", "LOTO: Air Compressor 1", ["ac1"], "valid"),
  d("SOP-0071", "sop", "Air Compressor 1: drain and service", ["ac1"], "awaiting", 6),
  d("JHA-0040", "jha", "JHA: Compressed air systems", ["ac1"], "valid"),
  d("AUD-0018", "audit", "Compressor weekly walk-around", ["ac1"], "valid"),
  d("AUD-0019", "audit", "Dryer weekly check", ["dry1"], "valid"),
  d("JHA-0041", "jha", "JHA: Dryer cleaning", ["dry1"], "valid"),
  d("SOP-0058", "sop", "Haas VF3 Operation", ["cnc3"], "valid"),
  d("JHA-0019", "jha", "JHA: CNC machining", ["cnc3"], "expired", 20),
  d("AUD-0024", "audit", "CNC daily start-up check", ["cnc3"], "valid"),
  d("LOTO-0016", "loto", "LOTO: Haas VF3", ["cnc3"], "draft"),
  d("AUD-0030", "audit", "Forklift pre-use inspection", ["fl3", "fl4"], "valid"),
  d("JHA-0022", "jha", "JHA: Forklift operation", ["fl3", "fl4"], "valid"),
  d("SOP-0044", "sop", "Forklift battery change", ["fl3"], "valid"),
  d("LOTO-0046", "loto", "LOTO: Forklift FL-03", ["fl3"], "awaiting", 4),
  d("LOTO-0009", "loto", "LOTO: Wartsila 50SG", ["eng2"], "valid"),
  d("JHA-0031", "jha", "JHA: Valve lash adjustment", ["eng2"], "valid"),
  d("PTW-0015", "ptw", "Hot work permit: Wartsila 50SG", ["eng2"], "expiring", 9),
  d("LOTO-0014", "loto", "LOTO: Hydraulic Press 2", ["pr2"], "expired", 41),
  d("SOP-0027", "sop", "Hydraulic Press 2: die change", ["pr2"], "valid"),
  d("JHA-0051", "jha", "JHA: Press maintenance", ["pr2"], "awaiting", 3),
  d("SOP-0036", "sop", "Conveyor 4: belt tracking", ["cv4"], "expiring", 5),
  d("LOTO-0020", "loto", "LOTO: Boiler 1", ["blr1"], "valid"),
  d("JHA-0016", "jha", "JHA: Boiler inspection", ["blr1"], "valid"),
  d("SOP-0020", "sop", "Boiler 1: annual inspection", ["blr1"], "valid"),
  d("AUD-0012", "audit", "Boiler daily round", ["blr1"], "valid"),
  d("PTW-0012", "ptw", "Confined space entry: Boiler 1", ["blr1"], "valid"),
  d("LOTO-0031", "loto", "LOTO: MCC-2", ["mcc2"], "valid"),
  d("AUD-0066", "audit", "MCC-2 thermography round", ["mcc2"], "awaiting", 2),
  d("PTW-0019", "ptw", "Energized work permit: MCC-2", ["mcc2"], "valid"),
  d("JHA-0008", "jha", "JHA: Hot work in the maintenance shop", ["wb1"], "valid"),
  d("SOP-0010", "sop", "Welding bay procedure", ["wb1"], "valid"),
  d("PTW-0007", "ptw", "Hot work permit: Welding bay 1", ["wb1"], "valid"),
  d("SOP-0033", "sop", "Belt saw 1 Operation", ["bs1"], "valid"),
  d("LOTO-0055", "loto", "LOTO: Mixing tank T-12", ["t12"], "valid"),
  d("SOP-0090", "sop", "Confined space entry program", [], "valid"),
  d("AUD-0070", "audit", "Overhead crane frequent inspection", ["oc1"], "valid"),
  d("LOTO-0060", "loto", "LOTO: Overhead crane OC-1", ["oc1"], "expiring", 7),
  d("AUD-0071", "audit", "Fire extinguisher monthly inspection", ["fe12"], "valid"),
  d("LOTO-0062", "loto", "LOTO: Mechanical press MP-1", ["mp1"], "valid"),
  d("SOP-0092", "sop", "MP-1 die setting and adjustment", ["mp1"], "awaiting", 2),
  d("LOTO-0064", "loto", "LOTO: Toyota 8FDE204 (F012)", ["f012"], "valid"),
  d("JHA-0070", "jha", "JHA: Working from a ladder", ["ld4"], "valid"),
  d("LOTO-0050", "loto", "LOTO: Hydraulic Press 1", ["pr1"], "valid"),
  d("LOTO-0051", "loto", "LOTO: Conveyor 2", ["cv2"], "valid"),
  d("SOP-0093", "sop", "Pallet wrapper operation", ["pw1"], "valid"),
  d("JHA-0072", "jha", "JHA: Cleaning chemicals", ["x9"], "valid"),
  d("AUD-0073", "audit", "Housekeeping walk-around", ["x9"], "valid"),
];

export const docByRef = (ref: string) => DOCS.find((x) => x.ref === ref);
const STATE_RANK: Record<string, number> = { valid: 0, awaiting: 1, expiring: 2, draft: 3, expired: 4 };
const best = (list: MvpDoc[]) => [...list].sort((a, b) => (STATE_RANK[a.state] ?? 9) - (STATE_RANK[b.state] ?? 9) || b.ref.localeCompare(a.ref))[0];

// ───────────────────────────── the row of an asset under a job

export type SlotState = DocState | "missing" | "choose";
export interface Slot {
  type: MvpKind;
  level: Level;
  /** Where the OSHA table put it, before the person moved it. */
  suggestedLevel: Level | "none";
  recommended?: boolean;
  ask?: string;
  why: string;
  doc?: MvpDoc;
  /** The document came from the title match, not from a link nor from the person. */
  suggested: boolean;
  /** The person picked it (phase 2). */
  picked: boolean;
  /** Documents of this type linked to the asset. */
  candidates: MvpDoc[];
  state: SlotState;
  moved: boolean;
}
export interface Row {
  asset: MvpAsset;
  info: ClassInfo;
  slots: Slot[];
  action: Slot[];
  ready: boolean;
  last?: { ref: string; on: string };
  next?: { ref: string; on: string };
  /** How many of its documents were found: orders the list. */
  found: number;
}

/** Optional only lists documents that exist and are linked to the asset: nothing is shown for a type the asset has no document of. */
export const isShown = (s: Slot, all: boolean) => s.level === "required" || all || Boolean(s.doc) || s.candidates.length > 0;

export const slotKey = (assetId: string, jobId: string, type: MvpKind) => `${assetId}|${jobId}|${type}`;

interface Settings {
  phase: Phase;
  /** Show every type, not only the ones the OSHA table suggests for the job. */
  all: boolean;
  /** The account has no Safety documents yet (the empty state). */
  empty?: boolean;
}

/** The documents the account has: all of them, or none in the empty state. */
export const docPool = (empty?: boolean): MvpDoc[] => (empty ? [] : DOCS);

export function resolveRow(st: MvpStore, job: MvpJob, a: MvpAsset, s: Settings): Row {
  const info = classOf(a, s.phase >= 2);
  const def = defaultsFor(job, a, info);
  const pool = docPool(s.empty);
  const slots: Slot[] = [];
  // Each asset keeps at least its first suggestion, so Required is never empty.
  const keep = MVP_KINDS.find((t) => def[t].level !== "none");
  for (const type of MVP_KINDS) {
    const base = def[type];
    const key = slotKey(a.id, job.id, type);
    const moved = s.phase >= 2 ? st.levels[key] : undefined;
    const candidates = pool.filter((x) => x.type === type && x.assetIds.includes(a.id));
    if (base.level === "none" && !moved && !s.all && !candidates.length) continue;
    if (s.empty && !moved && !s.all && type !== keep && skipsSuggestion(a.id, job.id, type)) continue;
    // The AI suggests every document for every asset. With no documents in the account the suggestions are all there is, so all are required.
    const suggestedLevel: Level = base.level === "none" ? "optional" : s.empty ? "required" : base.level;
    const level: Level = moved ?? suggestedLevel;
    let doc: MvpDoc | undefined;
    let suggested = false;
    let picked = false;
    const pick = s.phase >= 2 ? st.picks[key] : undefined;
    if (pick && docByRef(pick)) {
      doc = docByRef(pick);
      picked = true;
    } else if (type === "loto" && candidates.length) {
      doc = best(candidates);
    } else {
      const byTitle = candidates.filter((x) => jobMatches(job, x.title));
      if (byTitle.length) {
        doc = best(byTitle);
        suggested = true;
      } else {
        const program = pool.filter((x) => x.type === type && x.assetIds.length === 0 && jobMatches(job, x.title));
        if (program.length) {
          doc = best(program);
          suggested = true;
        }
      }
    }
    const state: SlotState = doc ? doc.state : candidates.length && s.phase >= 2 ? "choose" : "missing";
    slots.push({
      type,
      level,
      suggestedLevel,
      recommended: base.recommended,
      ask: level === "required" ? undefined : base.ask,
      why: base.level === "none" ? none.why : base.why,
      doc,
      suggested,
      picked,
      candidates,
      state,
      moved: Boolean(moved),
    });
  }
  // Required is never empty: when the OSHA table asks for nothing, what the AI suggests becomes required.
  // What the person moved does not count, or dragging one document would send the suggestions back to Optional.
  if (!slots.some((x) => x.level === "required" && !x.moved)) {
    for (const x of slots) {
      if (!x.moved && x.suggestedLevel !== "none" && x.why !== none.why) {
        x.level = "required";
        x.suggestedLevel = "required";
        x.ask = undefined;
      }
    }
  }
  slots.sort((x, y) => (x.level === y.level ? MVP_KINDS.indexOf(x.type) - MVP_KINDS.indexOf(y.type) : x.level === "required" ? -1 : 1));
  const action = slots.filter((x) => x.level === "required" && x.state !== "valid");
  const { last, next } = lastNext(st, job.id, a.id);
  const found = slots.filter((x) => x.doc).length + slots.filter((x) => x.doc?.state === "valid").length / 2;
  return { asset: a, info, slots, action, ready: action.length === 0, last, next, found };
}

/** The assets of a job: first the ones the grid already made work orders for, then the ones with most documents, then the name. */
export function rowsFor(st: MvpStore, job: MvpJob, s: Settings): Row[] {
  const lastUse = (id: string) => st.wos.filter((w) => w.jobId === job.id && w.assetId === id && w.fromGrid).map((w) => w.createdOn).sort().pop() ?? "";
  return MVP_ASSETS.map((a) => resolveRow(st, job, a, s)).sort((x, y) => {
    const ux = lastUse(x.asset.id);
    const uy = lastUse(y.asset.id);
    if (ux !== uy) return uy.localeCompare(ux);
    if (x.found !== y.found) return y.found - x.found;
    return x.asset.name.localeCompare(y.asset.name);
  });
}

/** Last = the latest one done. Next = the open one due first. Only work orders made from the grid are known (the CMMS keeps no job on a work order). */
export function lastNext(st: Pick<MvpStore, "wos">, jobId: string, assetId: string) {
  const mine = st.wos.filter((w) => w.fromGrid && w.jobId === jobId && w.assetId === assetId);
  const done = mine.filter((w) => w.status === "done").sort((a, b) => (b.doneOn ?? "").localeCompare(a.doneOn ?? ""))[0];
  const open = mine.filter((w) => w.status === "open").sort((a, b) => a.due.localeCompare(b.due))[0];
  return { last: done ? { ref: done.ref, on: done.doneOn ?? done.createdOn } : undefined, next: open ? { ref: open.ref, on: open.due } : undefined };
}

// ───────────────────────────── checklists

const DOC_ITEMS: Record<string, string[]> = {
  sop: ["Read the SOP before starting", "Do each step in order", "Record anything that differs from the SOP", "Sign off the last step"],
  loto: ["Notify the people affected", "Shut down and isolate every energy source", "Apply the lock and tag", "Verify zero energy", "Remove the locks when done"],
};
/** The checklists a work order can take: the ones of the asset's documents (audit, SOP, LOTO), then the company's. */
export function checklistsFor(jobId: string, docs: MvpDoc[]): ChecklistOpt[] {
  const order: MvpKind[] = ["audit", "sop", "loto"];
  return order
    .map((t) => docs.find((x) => x.type === t))
    .filter((x): x is MvpDoc => Boolean(x))
    .map((x): ChecklistOpt => ({ id: `doc-${x.ref}`, name: x.title, items: x.type === "audit" ? tasksFor(jobId) : DOC_ITEMS[x.type], from: x.ref }));
}
export { libraryChecklists };

// ───────────────────────────── work orders and corrections

export interface WoDoc {
  ref: string;
  type: MvpKind;
  title: string;
  state: DocState;
}
export interface MvpWo {
  id: string;
  ref: string;
  title: string;
  assetId: string;
  jobId: string;
  assigneeId: string;
  priority: Priority;
  createdOn: string;
  due: string;
  status: "open" | "done";
  doneOn?: string;
  description: string;
  docs: WoDoc[];
  missing: MvpKind[];
  checklist?: string;
  /** Made from this screen, so the job is known (the CMMS keeps no job on a work order). */
  fromGrid: boolean;
}

export interface MvpStore {
  wos: MvpWo[];
  /** Moves between Required and Optional, by asset and job. */
  levels: Record<string, Level>;
  /** Documents the person chose, by asset, job and type. */
  picks: Record<string, string>;
  custom: MvpJob[];
  /** Jobs the person hid, defaults or their own. */
  hidden: string[];
  nextWo: number;
}

const seedWo = (o: Partial<MvpWo> & Pick<MvpWo, "ref" | "title" | "assetId" | "jobId">): MvpWo => ({
  id: o.ref,
  assigneeId: "carlos",
  priority: "medium",
  createdOn: dateIn(-3),
  due: dateIn(2),
  status: "open",
  description: "",
  docs: [],
  missing: [],
  fromGrid: true,
  ...o,
});
const docsOf = (refs: string[]): WoDoc[] => refs.map((r) => docByRef(r)).filter((x): x is MvpDoc => Boolean(x)).map((x) => ({ ref: x.ref, type: x.type, title: x.title, state: x.state }));

/** Two pairs of work orders so the Work orders column has something to show. In production it starts empty. */
const BLANK: MvpStore = {
  wos: [
    seedWo({ ref: "WO-1198", title: "Inspect Forklift FL-03", assetId: "fl3", jobId: "inspect", createdOn: dateIn(-1), due: dateIn(1), docs: docsOf(["AUD-0030"]) }),
    seedWo({ ref: "WO-1195", title: "Clean Haas VF3", assetId: "cnc3", jobId: "clean", createdOn: dateIn(-2), due: dateIn(2), docs: docsOf(["LOTO-0016"]) }),
    seedWo({ ref: "WO-1190", title: "Clean Haas VF3", assetId: "cnc3", jobId: "clean", createdOn: dateIn(-9), due: dateIn(-6), status: "done", doneOn: dateIn(-5) }),
    seedWo({ ref: "WO-1180", title: "Inspect Forklift FL-03", assetId: "fl3", jobId: "inspect", createdOn: dateIn(-8), due: dateIn(-4), status: "done", doneOn: dateIn(-4) }),
  ],
  levels: {},
  picks: {},
  custom: [],
  hidden: [],
  nextWo: 1205,
};
const KEY = "ehs-mvp-f2-v2";

const asJob = (name: string, id: string): MvpJob => ({ id, label: name, group: "routine", hint: "Added by you", words: wordsOf(name), custom: true });

/** Validation of a new job name. Returns the reason, or nothing when it is fine. */
export function jobNameError(name: string, st: Pick<MvpStore, "custom">) {
  const n = name.trim();
  if (!n) return "Give the job a name";
  if (n.length > 60) return "Use 60 characters or fewer";
  const taken = [...JOBS, ...st.custom].flatMap((j) => [j.label.toLowerCase(), ...j.label.split(" / ").map((p) => p.toLowerCase())]);
  if (taken.includes(n.toLowerCase())) return "A job with this name already exists";
  return undefined;
}

export interface CreateWoInput {
  title: string;
  assetId: string;
  jobId: string;
  assigneeId: string;
  priority: Priority;
  due: string;
  description: string;
  docs: WoDoc[];
  missing: MvpKind[];
  checklist?: string;
}

/** The empty account: no work orders made from this screen yet, kept apart from the sample plant. */
const EMPTY: MvpStore = { wos: [], levels: {}, picks: {}, custom: [], hidden: [], nextWo: 1001 };

/** Work orders and corrections, kept in this browser. `empty` keeps the empty account's apart. */
export function useMvpStore(empty = false) {
  const blank = empty ? EMPTY : BLANK;
  const storeKey = empty ? `${KEY}-empty` : KEY;
  const [st, setSt] = useState<MvpStore>(blank);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storeKey);
      if (raw) setSt({ ...blank, ...JSON.parse(raw) });
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

  const jobs = [...JOBS, ...st.custom];
  const hidden = st.hidden ?? [];

  const createWo = (input: CreateWoInput): MvpWo => {
    const ref = `WO-${st.nextWo}`;
    const wo: MvpWo = { id: ref, ref, ...input, createdOn: dateIn(0), status: "open", fromGrid: true };
    setSt((x) => ({ ...x, wos: [wo, ...x.wos], nextWo: x.nextWo + 1 }));
    return wo;
  };
  const setLevel = (assetId: string, jobId: string, type: MvpKind, level: Level | undefined) => {
    const key = slotKey(assetId, jobId, type);
    setSt((x) => {
      const levels = { ...x.levels };
      if (level) levels[key] = level;
      else delete levels[key];
      return { ...x, levels };
    });
  };
  const setPick = (assetId: string, jobId: string, type: MvpKind, ref: string | undefined) => {
    const key = slotKey(assetId, jobId, type);
    setSt((x) => {
      const picks = { ...x.picks };
      if (ref) picks[key] = ref;
      else delete picks[key];
      return { ...x, picks };
    });
  };
  const addJob = (name: string) => {
    const id = `c${Date.now()}`;
    setSt((x) => ({ ...x, custom: [...x.custom, asJob(name.trim(), id)] }));
    return id;
  };
  const removeJob = (id: string) => setSt((x) => ({ ...x, custom: x.custom.filter((j) => j.id !== id), hidden: x.hidden.filter((h) => h !== id) }));
  const hideJob = (id: string) => setSt((x) => ({ ...x, hidden: x.hidden.includes(id) ? x.hidden : [...x.hidden, id] }));
  const showJob = (id: string) => setSt((x) => ({ ...x, hidden: x.hidden.filter((h) => h !== id) }));
  const reset = useCallback(() => setSt(blank), [blank]);

  return { ...st, hidden, hydrated, empty, jobs, createWo, setLevel, setPick, addJob, removeJob, hideJob, showJob, reset };
}
export type MvpStoreApi = ReturnType<typeof useMvpStore>;

export function resetMvpStore() {
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(`${KEY}-empty`);
  } catch {}
}

export const WO_ASSIGNEES = ["carlos", "tom", "dan"];
export const personName = (id: string) => person(id).name;
