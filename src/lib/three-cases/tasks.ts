// Task readiness for the Safety Execution options (A, E, F and the earlier versions of A).
//
// The rule: the kind of task decides which documents must exist before the work (prerequisites),
// and what is created for each execution (permit, work order). A task is
// - ready (green) when every prerequisite is on file, approved, lists this asset and is not
//   overdue for review,
// - update (amber) when one is on file but in review, overdue (LOTO: no periodic inspection in
//   12 months) or found by title but not listing this asset yet (approving links it),
// - missing (red) when one does not exist yet (the AI drafts it in the plan),
// - scheduled (blue) when a PM already runs it on its own.
// Permits, LOTO records, filled checklists and work orders are execution records: they never
// change the colour. Research: ~/Documents/safety-execution-exploracao/pesquisa-osha-documentos-por-tarefa.md

import type { Execution } from "@/contexts/ThreeCasesContext";
import { ASSETS, DOC_COLUMNS, SUGGESTED_ASSET_IDS, asset as getAsset, isLinked, job as getJob, locationName } from "./data";
import type { Asset, DocType, ExecutionJob, SafetyDoc } from "./types";

/**
 * Base category of a task (C1 to C5 in the research). Chemicals (C6) and permits (C7) are added on
 * top through `chemical` and `permit`.
 */
export type TaskType = "inspect" | "routine" | "isolate";

export const TASK_TYPES: Record<TaskType, { label: string; hint: string; needs: DocType[] }> = {
  inspect: { label: "Operate, check or inspect", hint: "Pre-use check or periodic test", needs: ["audit"] },
  routine: { label: "Clean, lubricate or adjust", hint: "No exposure to energy, guards on", needs: ["jha", "sop"] },
  isolate: { label: "Service or repair with energy isolated", hint: "Guard off or body in the danger zone", needs: ["jha", "sop", "loto"] },
};

/** Why each document type is asked for, and how strongly (law, standard or good practice). Shown on hover. */
const WHY: Record<DocType, string> = {
  jha: "Good practice. The law is the written PPE hazard assessment it carries (OSHA 1910.132(d)(2))",
  sop: "Good practice, treated as required: its steps become the work order checklist",
  loto: "Law: a written energy control procedure (OSHA 1910.147(c)(4)), inspected at least once a year (c)(6)",
  ptw: "Authorizes this execution",
  audit: "The checklist for the inspection. The check itself can be law (forklift: 1910.178(q)(7)); the template is good practice",
  sds: "Law: an SDS for each hazardous chemical, at hand every shift (OSHA 1910.1200(g)(8))",
};

export interface TaskMeta {
  type: TaskType;
  /** A chemical is used, so its SDS is a prerequisite. */
  chemical?: boolean;
  /** Each execution needs a permit: why, in one line, and whether it is law, a standard or a site rule. */
  permit?: string;
  /** Extra prerequisites for this job, on top of its type. */
  extra?: DocType[];
  /** Prerequisites the type asks for that this job does not need, with the reason. */
  skip?: { type: DocType; why: string }[];
  /** A PM already runs this job. */
  pm?: { ref: string; rule: string; next: string };
}

export const TASK_META: Record<string, TaskMeta> = {
  "fl03-inspect": { type: "inspect" },
  "fl03-clean": {
    type: "routine",
    chemical: true,
    permit: "Site rule: SOP-0031 step 4 asks for a permit when degreaser is used near the battery",
  },
  "fl03-battery": { type: "routine", chemical: true },
  "fl03-hydraulic": { type: "isolate" },
  "fl04-inspect": { type: "inspect" },
  "hp04-inspect": { type: "inspect", pm: { ref: "PM-0150", rule: "Every day, 06:00", next: "Tomorrow 06:00" } },
  "hp04-clean": { type: "isolate", permit: "Site rule: work inside the press guard needs a permit (PTW-0006)" },
  "hp04-die": { type: "isolate", permit: "Site rule: work inside the press guard needs a permit (PTW-0006)" },
  "hp07-monthly": { type: "isolate", permit: "Site rule: work inside the press guard needs a permit" },
  "hp07-hose": { type: "isolate", permit: "Site rule: work inside the press guard needs a permit" },
  "cv12-tracking": { type: "isolate" },
  "ac2-inspect": { type: "inspect", extra: ["loto"] },
  "ac2-oil": { type: "isolate", chemical: true },
  "bs1-blade": {
    type: "isolate",
    skip: [{ type: "loto", why: "Cord-and-plug saw: unplugging it and keeping the plug is the isolation (OSHA 1910.147(a)(2)(iii)(A))" }],
  },
};

/** What the AI suggests for each asset, in this order. */
export const TASKS_BY_ASSET: Record<string, string[]> = {
  fl03: ["fl03-clean", "fl03-inspect", "fl03-battery", "fl03-hydraulic"],
  fl04: ["fl04-inspect"],
  hp04: ["hp04-clean", "hp04-die", "hp04-inspect"],
  hp07: ["hp07-monthly", "hp07-hose"],
  cv12: ["cv12-tracking"],
  ac2: ["ac2-inspect", "ac2-oil"],
  bs1: ["bs1-blade"],
};

/** Prerequisites written for one job; the others (JHA, LOTO, SDS) are per asset. */
const PER_JOB: DocType[] = ["sop", "audit"];

export const docLabel = (t: DocType) => DOC_COLUMNS.find((c) => c.type === t)?.short ?? t.toUpperCase();

export type NeedState = "ok" | "update" | "missing" | "skip";

export interface Need {
  type: DocType;
  label: string;
  state: NeedState;
  /** Existing ref, or the ref the plan will create. */
  ref?: string;
  title?: string;
  /** Found by the AI by title; approving the plan links it to the asset. */
  found?: boolean;
  /** In review or overdue: someone has to act on it, linking is not enough. */
  stale?: boolean;
  /** Created by a plan approved in this browser. */
  created?: boolean;
  /** Why it needs review, or why it is not needed. */
  note?: string;
  why: string;
}

export type TaskLevel = "ready" | "update" | "missing" | "scheduled";

export interface RunItem {
  kind: "ptw" | "wo" | "pm";
  label: string;
  ref?: string;
  why?: string;
}

export interface TaskStatus {
  job: ExecutionJob;
  meta: TaskMeta;
  level: TaskLevel;
  /** The documents' own level, ignoring the PM. */
  docsLevel: Exclude<TaskLevel, "scheduled">;
  needs: Need[];
  runs: RunItem[];
  /** Latest execution created in this browser. */
  last?: Execution;
  /** One line: what happens if you approve. */
  headline: string;
}

export interface ReadinessState {
  executions: Execution[];
  linkedDocIds: string[];
}

/** Prerequisite documents the plans approved in this browser created for the asset. */
function createdDocs(a: Asset, executions: Execution[]) {
  return executions.flatMap((e) => {
    const j = getJob(e.jobId);
    if (!j || j.assetId !== a.id) return [];
    return j.plan
      .filter((p) => p.isNew && p.ref && (p.kind === "jha" || p.kind === "sop" || p.kind === "loto" || p.kind === "audit"))
      .map((p) => ({ type: p.kind as DocType, ref: p.ref as string, title: p.title.replace(/^New [A-Za-z]+:\s*/, ""), jobId: j.id }));
  });
}

function pickDoc(a: Asset, j: ExecutionJob, type: DocType): SafetyDoc | undefined {
  const ofType = a.docs.filter((d) => d.type === type);
  const forJob = ofType.find((d) => d.enables === j.id) ?? ofType.find((d) => j.basedOn.includes(d.id));
  if (forJob) return forJob;
  return PER_JOB.includes(type) ? undefined : ofType[0];
}

export function taskStatus(jobId: string, s: ReadinessState): TaskStatus | undefined {
  const j = getJob(jobId);
  const meta = TASK_META[jobId];
  return j && meta ? statusFor(j, meta, s) : undefined;
}

function statusFor(j: ExecutionJob, meta: TaskMeta, s: ReadinessState): TaskStatus | undefined {
  const a = getAsset(j.assetId);
  if (!a) return undefined;

  const types = Array.from(new Set([...TASK_TYPES[meta.type].needs, ...(meta.extra ?? []), ...(meta.chemical ? (["sds"] as DocType[]) : [])]));
  const fresh = createdDocs(a, s.executions);

  const needs: Need[] = types.map((type) => {
    const label = docLabel(type);
    const why = WHY[type];
    const skip = meta.skip?.find((x) => x.type === type);
    if (skip) return { type, label, state: "skip", note: skip.why, why };
    const doc = pickDoc(a, j, type);
    if (doc) {
      const overdue = doc.reviewOverdue;
      const inReview = doc.status !== "approved";
      const found = !isLinked(doc, s.linkedDocIds);
      return {
        type,
        label,
        ref: doc.ref,
        title: doc.title,
        found,
        stale: Boolean(overdue || inReview),
        state: overdue || inReview || found ? "update" : "ok",
        note: overdue ?? (inReview ? "In review, not approved yet" : found ? `Found by title, does not list ${a.name} yet` : undefined),
        why,
      };
    }
    const made = fresh.find((c) => c.type === type && (!PER_JOB.includes(type) || c.jobId === j.id));
    if (made) return { type, label, ref: made.ref, title: made.title, created: true, state: "ok", note: "Drafted by an approved plan", why };
    const planned = j.plan.find((p) => p.kind === type && p.isNew);
    return { type, label, state: "missing", ref: planned?.ref, title: planned?.title.replace(/^New [A-Za-z]+:\s*/, ""), why };
  });

  const ptw = j.plan.find((p) => p.kind === "ptw");
  const runs: RunItem[] = [];
  if (meta.permit || ptw) runs.push({ kind: "ptw", label: j.recurring ? "Permit template" : "Permit", ref: ptw?.ref, why: meta.permit });
  if (j.recurring) runs.push({ kind: "pm", label: "PM", ref: j.woRef, why: j.recurring.rule });
  else runs.push({ kind: "wo", label: "Work order", ref: j.woRef });

  const docsLevel: TaskStatus["docsLevel"] = needs.some((n) => n.state === "missing")
    ? "missing"
    : needs.some((n) => n.state === "update")
      ? "update"
      : "ready";
  const last = s.executions.find((e) => e.jobId === j.id);
  const scheduled = Boolean(meta.pm) || Boolean(j.recurring && last);
  const level: TaskLevel = scheduled && docsLevel === "ready" ? "scheduled" : docsLevel;

  const runText = runs.map((r) => r.label.toLowerCase()).join(" + ");
  const refs = (pick: (n: Need) => boolean) =>
    needs
      .filter(pick)
      .map((n) => n.ref ?? n.label)
      .join(", ");
  const toLink = refs((n) => n.state === "update" && Boolean(n.found) && !n.stale);
  const toReview = refs((n) => n.state === "update" && Boolean(n.stale));
  const toDraft = needs
    .filter((n) => n.state === "missing")
    .map((n) => n.label)
    .join(", ");
  const steps = [toDraft && `AI drafts ${toDraft}`, toReview && `review ${toReview}`, toLink && `links ${toLink}`].filter(Boolean).join(", ");
  const headline =
    level === "scheduled"
      ? meta.pm
        ? `Runs on its own: ${meta.pm.ref}, ${meta.pm.rule.toLowerCase()}`
        : `Runs on its own: ${j.woRef}, ${j.recurring?.rule.toLowerCase()}`
      : level === "ready"
        ? `Ready · creates ${runText}`
        : `${steps.charAt(0).toUpperCase()}${steps.slice(1)} · then ${runText}`;

  return { job: j, meta, level, docsLevel, needs, runs, last, headline };
}

export function tasksFor(assetId: string, s: ReadinessState): TaskStatus[] {
  return (TASKS_BY_ASSET[assetId] ?? []).map((id) => taskStatus(id, s)).filter((t): t is TaskStatus => Boolean(t));
}

export interface AssetSummary {
  asset: Asset;
  location: string;
  tasks: TaskStatus[];
  /** Worst level among the tasks; undefined when the AI has nothing to suggest. */
  level?: Exclude<TaskLevel, "scheduled">;
  ready: number;
}

export function assetSummary(a: Asset, s: ReadinessState): AssetSummary {
  const tasks = tasksFor(a.id, s);
  const levels = tasks.map((t) => t.docsLevel);
  const level = tasks.length === 0 ? undefined : levels.includes("missing") ? "missing" : levels.includes("update") ? "update" : "ready";
  return { asset: a, location: locationName(a.locationId), tasks, level, ready: levels.filter((l) => l === "ready").length };
}

/**
 * Real asset names carry plant prefixes and codes written many ways (FL-03, FL03, fl 3), so both
 * sides drop punctuation and leading zeros before comparing. Category is left out: 60 to 99.9%
 * of real assets have none (dados-prototipo-2026-10-16.md).
 */
const squash = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/\d+/g, (d) => String(Number(d)));

/** Name, code or location: every word must match. */
export function assetMatches(a: Asset, query: string) {
  const words = query.split(/\s+/).map(squash).filter(Boolean);
  if (words.length === 0) return true;
  const hay = squash(`${a.code} ${a.name} ${locationName(a.locationId)}`);
  return words.every((w) => hay.includes(w));
}

export function searchAssets(query: string): Asset[] {
  if (!query.split(/\s+/).map(squash).some(Boolean)) return [];
  return ASSETS.filter((a) => assetMatches(a, query));
}

/**
 * Job families for option F, from the research categories but named by what the technician does.
 * "Service", "Repair" and "Change" were too broad: each is split into the concrete job.
 */
export interface JobFamily {
  id: string;
  label: string;
  hint: string;
  jobs: string[];
}

export const JOB_FAMILIES: JobFamily[] = [
  { id: "inspect", label: "Inspect", hint: "Pre-use check or periodic test", jobs: ["fl03-inspect", "fl04-inspect", "hp04-inspect", "ac2-inspect"] },
  { id: "clean", label: "Clean", hint: "Wash, degrease, clear debris", jobs: ["fl03-clean", "hp04-clean", "hp07-monthly"] },
  { id: "oil", label: "Change oil and filters", hint: "Drain, refill, lubricate", jobs: ["ac2-oil"] },
  { id: "battery", label: "Charge battery", hint: "Charge, water or swap", jobs: ["fl03-battery"] },
  { id: "tooling", label: "Change tooling", hint: "Die, blade, belt", jobs: ["hp04-die", "bs1-blade"] },
  { id: "part", label: "Replace a part", hint: "Hose, seal, cylinder, after a leak", jobs: ["fl03-hydraulic", "hp07-hose"] },
  { id: "adjust", label: "Adjust", hint: "Tracking, tension, alignment", jobs: ["cv12-tracking"] },
];

/** A job type someone added in option F. Kept in their browser only. */
export interface CustomJob {
  id: string;
  label: string;
  type: TaskType;
  chemical?: boolean;
  permit?: string;
  /** What the AI read in the name, in one line. */
  why: string;
}

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));

/**
 * Scripted reading of a job typed by the user: the base category and what is added on top, with
 * the research's safe default (energy isolated) when nothing matches.
 */
export function classifyJob(label: string): Omit<CustomJob, "id" | "label"> {
  const t = label.toLowerCase();
  const hot = has(t, ["weld", "solda", "grind", "esmeril", "torch", "maçarico", "hot work"]);
  const confined = has(t, ["confined", "tank", "tanque", "pit", "fosso", "vessel entry", "espaço confinado"]);
  const live = has(t, ["live", "energized", "energizado"]);
  const height = has(t, ["roof", "telhado", "height", "altura", "ladder", "lift platform"]);
  const permit = hot
    ? "Hot work permit (OSHA 1910.252)"
    : confined
      ? "Confined space entry permit (OSHA 1910.146)"
      : live
        ? "Energized electrical work permit (NFPA 70E)"
        : height
          ? "Site rule: work at height needs a permit"
          : undefined;
  const chemical = has(t, ["oil", "óleo", "oleo", "lubric", "grease", "graxa", "battery", "bateria", "propane", "lpg", "fuel", "degrease", "solvent", "chemical", "químic", "coolant"]);
  if (has(t, ["inspect", "check", "test", "verify", "inspe", "verific", "teste", "checar", "audit"]) && !hot) {
    return { type: "inspect", chemical: false, permit, why: "Read as an inspection: needs its checklist" };
  }
  if (has(t, ["battery", "bateria", "propane", "lpg", "fuel", "abastec"])) {
    return { type: "routine", chemical: true, permit, why: "Read as battery or fuel work: JHA, SOP and the SDS" };
  }
  if (has(t, ["clean", "limp", "wash", "lav", "sweep", "varr"]) && !has(t, ["inside", "dentro", "guard off"])) {
    return { type: "routine", chemical, permit, why: `Read as cleaning with guards on: JHA and SOP${chemical ? ", plus the SDS" : ""}` };
  }
  if (has(t, ["electr", "elétric", "eletric", "panel", "painel", "wiring"]) && !live) {
    return { type: "isolate", chemical, permit, why: "Read as electrical work, de-energized: needs LOTO" };
  }
  if (hot) {
    return { type: "isolate", chemical, permit, why: "Read as a repair with hot work: JHA, SOP and LOTO before, a hot work permit for each job" };
  }
  const known = has(t, ["replace", "change", "troca", "swap", "install", "instal", "repair", "fix", "consert", "repar", "jam", "stuck", "destrav", "preso", "adjust", "ajust", "align", "alinh", "tension", "calibr", "oil", "óleo", "filter", "filtro", "lubric"]);
  return {
    type: "isolate",
    chemical,
    permit,
    why: known ? `Read as service with the energy isolated: JHA, SOP and LOTO${chemical ? ", plus the SDS" : ""}` : "Not sure, so treated as service with the energy isolated, the safe default",
  };
}

/** Which assets a typed job is about, by the words of their names (real assets have no category). */
const ASSET_WORDS: Record<string, string[]> = {
  forklift: ["forklift", "empilhadeira", "fork"],
  press: ["press", "prensa"],
  compressor: ["compressor"],
  conveyor: ["conveyor", "esteira", "belt"],
  saw: ["saw", "serra"],
  wrapper: ["wrapper", "embaladora"],
  dock: ["dock", "doca", "leveler"],
  racking: ["rack", "porta-palete"],
};

export function assetsForJob(label: string): string[] {
  const t = label.toLowerCase();
  const kinds = Object.entries(ASSET_WORDS)
    .filter(([, ws]) => has(t, ws))
    .map(([k]) => k);
  return ASSETS.filter((a) => kinds.some((k) => a.name.toLowerCase().includes(k))).map((a) => a.id);
}

/** Status of a typed job on one asset: its SOP is new, the per-asset documents are looked up. */
export function customTask(def: CustomJob, assetId: string, s: ReadinessState): TaskStatus | undefined {
  const a = getAsset(assetId);
  if (!a) return undefined;
  const j: ExecutionJob = {
    id: `custom-${def.id}-${assetId}`,
    assetId,
    verb: def.label,
    title: `${def.label} · ${a.name}`,
    basedOn: [],
    reason: "Job type added by you",
    when: "Tomorrow, 08:00",
    plan: [],
    checklist: [],
    woRef: "",
    assigneeId: "carlos",
  };
  const meta: TaskMeta = {
    type: def.type,
    chemical: def.chemical,
    permit: def.permit,
    ...(assetId === "bs1" && def.type === "isolate" ? { skip: TASK_META["bs1-blade"].skip } : {}),
  };
  return statusFor(j, meta, s);
}

export const SUGGESTED_ASSETS = SUGGESTED_ASSET_IDS.map((id) => getAsset(id)).filter((a): a is Asset => Boolean(a));

const VERB_WORDS: Record<string, string[]> = {
  Clean: ["clean", "wash", "degrease", "limp"],
  Inspect: ["inspect", "check", "inspe", "verific"],
  Repair: ["repair", "fix", "leak", "consert", "vazamento"],
  Service: ["service", "charge", "bateria", "óleo", "oleo", "filtro"],
  Change: ["change", "replace", "troca", "matriz", "lâmina"],
  Adjust: ["adjust", "ajust"],
  Plan: ["every", "monthly", "mensal", "todo mês", "toda"],
};

/**
 * Very small scripted "understanding" of a task typed for one asset: the suggested task whose
 * verb or title words appear the most in the text. Words of the asset's name do not count.
 */
export function matchTask(text: string, assetId: string, s: ReadinessState): TaskStatus | undefined {
  const t = text.toLowerCase();
  const nameWords = (getAsset(assetId)?.name ?? "").toLowerCase().split(/\s+/);
  const scored = tasksFor(assetId, s).map((task) => {
    const titleWords = task.job.title
      .toLowerCase()
      .split(/[^a-z0-9-]+/)
      .filter((w) => w.length >= 4 && !nameWords.includes(w));
    const hits = [...(VERB_WORDS[task.job.verb] ?? []), ...titleWords].filter((w) => t.includes(w)).length;
    return { task, hits };
  });
  const best = scored.sort((x, y) => y.hits - x.hits)[0];
  return best && best.hits > 0 ? best.task : undefined;
}
