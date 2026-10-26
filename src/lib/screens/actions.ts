/**
 * The corrective actions (CAPAs) of the Springfield Plant, for the Corrective actions list and its
 * record page. Two sources, so the list agrees with the rest of the prototype:
 *
 * 1. CAPAs made by an event flow of use case 3 (`useThreeCases().flows`): CAPA-0033 from EVT-0119
 *    is seeded, and running another event's flow adds CAPA-0043, CAPA-0044... with its work orders.
 * 2. `OTHER_ACTIONS` below: the three CAPAs A1 already lists outside use case 3 (CAPA-0039,
 *    CAPA-0036, CAPA-0031, same title, owner, due date and status A1 had; A1 now lists these in
 *    `three-cases/sources.ts`), CAPA-0041 and CAPA-0042 that Nova and the events board mention, and
 *    six more. Refs stay under CAPA-0043, the next number a flow takes; work order refs avoid the
 *    ones already used elsewhere.
 *
 * Dates are "Mon D" labels in 2026; the prototype's today is Oct 16 (`TODAY` in three-cases/data).
 */

import type { EventFlowState, FlowUpdate, FlowWo } from "@/contexts/ThreeCasesContext";
import { EVENTS, asset as getAsset, locationName, person } from "@/lib/three-cases/data";
import { daysFromDemoToday } from "@/lib/three-cases/sources";

export type ActionStatus = "open" | "in_review" | "closed";
export type ActionPriority = "High" | "Medium" | "Low";
export type ActionType = "Corrective" | "Preventive";

/** The event an action came from. `id` is set only for the events of use case 3, which have a page. */
export interface ActionEvent {
  id?: string;
  ref: string;
  title: string;
  type: "Observation" | "Near miss" | "Incident" | "Hazard";
  reportedAt: string;
  reportedBy: string;
}

export interface ActionRecord {
  /** The address of the record: the ref in lower case ("capa-0039"). */
  id: string;
  ref: string;
  title: string;
  type: ActionType;
  status: ActionStatus;
  priority: ActionPriority;
  /** A `PEOPLE` id; undefined when nobody owns it. */
  ownerId?: string;
  due: string;
  createdAt: string;
  closedAt?: string;
  /** A `LOCATIONS` id. */
  locationId: string;
  /** An `ASSETS` id, or a plain label for equipment the prototype has no asset for. */
  assetId?: string;
  assetLabel?: string;
  /** Where it came from when not from an event: an inspection, a survey, the compliance calendar. */
  source?: string;
  event?: ActionEvent;
  rootCause?: string;
  /** What is being done, one line each. */
  plan: string[];
  verification?: string;
  workOrders: FlowWo[];
  /** What happened to it, oldest first. */
  history: FlowUpdate[];
  /** Built from a use case 3 event flow, so its state lives in `useThreeCases()`. */
  fromFlow?: { eventId: string };
}

export const actionId = (ref: string) => ref.toLowerCase();
export const actionHref = (a: Pick<ActionRecord, "ref">) => `/actions/${actionId(a.ref)}`;

const wo = (ref: string, title: string, assigneeId: string, due: string, status: FlowWo["status"], doneAt?: string): FlowWo => ({ ref, title, assigneeId, due, status, doneAt });

/** CAPAs outside the events of use case 3. Export so A1 and other screens can list the same ones. */
export const OTHER_ACTIONS: ActionRecord[] = [
  {
    id: "capa-0042",
    ref: "CAPA-0042",
    title: "Pallet fell from rack, row A",
    type: "Corrective",
    status: "open",
    priority: "High",
    ownerId: "jo",
    due: "Oct 27",
    createdAt: "Oct 13",
    locationId: "warehouse",
    assetId: "rka",
    event: { ref: "EVT-0126", title: "Pallet fell from rack, row A", type: "Incident", reportedAt: "Oct 13, 10:40", reportedBy: "Jo Park" },
    rootCause: "The pallet was set on the beam crooked and hung over the back by 15 cm. Row A has no back stops or column guards, and the load sign on the rack is missing.",
    plan: ["Fit back stops and column guards on row A", "Put the load signs back on every bay of row A", "Retrain the warehouse drivers on placing pallets square on the beam"],
    verification: "The next monthly rack inspection (AUD-0014) shows the guards and signs on every bay.",
    workOrders: [wo("WO-1059", "Fit back stops, column guards and load signs, rack row A", "carlos", "Oct 23", "open")],
    history: [
      { at: "Oct 13", text: "CAPA-0042 created from EVT-0126 with 1 work order", tone: "info" },
      { at: "Oct 14", text: "Guards ordered, delivery Oct 21", tone: "progress" },
    ],
  },
  {
    id: "capa-0041",
    ref: "CAPA-0041",
    title: "Guard missing on Saw 2",
    type: "Corrective",
    status: "open",
    priority: "High",
    due: "Oct 10",
    createdAt: "Oct 9",
    locationId: "shop",
    assetLabel: "Saw 2",
    event: { ref: "EVT-0124", title: "Saw 2 running without its blade guard", type: "Observation", reportedAt: "Oct 9, 15:20", reportedBy: "Maria Lopez" },
    plan: [],
    workOrders: [],
    history: [
      { at: "Oct 9", text: "CAPA-0041 created from EVT-0124 with no owner", tone: "info" },
      { at: "Oct 10", text: "Due date passed, nobody owns it", tone: "late" },
    ],
  },
  {
    id: "capa-0040",
    ref: "CAPA-0040",
    title: "Dock leveler 2 lip dropped under a pallet jack",
    type: "Corrective",
    status: "open",
    priority: "High",
    ownerId: "jo",
    due: "Oct 17",
    createdAt: "Oct 9",
    locationId: "dock",
    assetId: "dl2",
    event: { ref: "EVT-0123", title: "Dock leveler 2 lip dropped while a pallet jack crossed", type: "Near miss", reportedAt: "Oct 9, 06:55", reportedBy: "Jo Park" },
    rootCause: "The hinge pin of the lip is worn. The quarterly inspection (AUD-0033) checks that the lip extends, not that it holds under load.",
    plan: ["Lock out Dock leveler 2 with LOTO-0030 until it is repaired", "Replace the hinge pin and test the lip under load", "Add a lip hold test to the quarterly dock leveler inspection"],
    verification: "Load test photo on the repair work order, and the new item on AUD-0033.",
    workOrders: [
      wo("WO-1049", "Apply LOTO-0030 and tag out Dock leveler 2", "carlos", "Oct 9", "complete", "Oct 9"),
      wo("WO-1050", "Replace hinge pin and test lip hold, Dock leveler 2", "carlos", "Oct 17", "in_progress"),
    ],
    history: [
      { at: "Oct 9", text: "CAPA-0040 created from EVT-0123 with 2 work orders", tone: "info" },
      { at: "Oct 9", text: "WO-1049 completed by Carlos Rivera · lock photo attached", tone: "done" },
      { at: "Oct 14", text: "WO-1050 started by Carlos Rivera · hinge pin ordered", tone: "progress" },
    ],
  },
  {
    id: "capa-0039",
    ref: "CAPA-0039",
    title: "Guard missing on band saw",
    type: "Corrective",
    status: "open",
    priority: "High",
    ownerId: "dan",
    due: "Oct 14",
    createdAt: "Oct 8",
    locationId: "shop",
    assetId: "bs1",
    event: { ref: "EVT-0122", title: "Band saw 1 blade guard left off after a blade change", type: "Observation", reportedAt: "Oct 8, 10:05", reportedBy: "Maria Lopez" },
    rootCause: "The upper blade guard was taken off for a blade change and not put back. The blade change SOP (SOP-0060) is still in review, so nothing tells the technician to refit it.",
    plan: ["Refit the upper blade guard on Band saw 1", "Add the blade guard to the monthly Maintenance Shop inspection", "Approve SOP-0060 with a step to refit the guard"],
    verification: "Dan checks the guard on the saw and compares it with the completion photo.",
    workOrders: [
      wo("WO-1044", "Refit upper blade guard, Band saw 1", "carlos", "Oct 10", "complete", "Oct 10"),
      wo("WO-1045", "Add blade guard check to the shop inspection", "dan", "Oct 13", "complete", "Oct 13"),
    ],
    history: [
      { at: "Oct 8", text: "CAPA-0039 created from EVT-0122 with 2 work orders", tone: "info" },
      { at: "Oct 10", text: "WO-1044 completed by Carlos Rivera · photo of the guard attached", tone: "done" },
      { at: "Oct 13", text: "WO-1045 completed by Dan Brooks", tone: "done" },
      { at: "Oct 15", text: "Verification is 1 day late", tone: "late" },
    ],
  },
  {
    id: "capa-0038",
    ref: "CAPA-0038",
    title: "Pre-use inspections missed on the night shift",
    type: "Preventive",
    status: "open",
    priority: "Medium",
    ownerId: "jo",
    due: "Oct 28",
    createdAt: "Oct 8",
    locationId: "warehouse",
    assetId: "fl03",
    source: "Found in the September pre-use inspection records (AUD-0009)",
    rootCause: "6 of 14 night shift pre-use inspections were not done in September. The paper checklist lives at the day shift office, and the night shift starts at the charging area.",
    plan: ["Put a QR code for AUD-0009 on Forklifts 3 and 4", "Brief the night shift drivers on the pre-use inspection"],
    verification: "No missed pre-use inspection on FL-03 or FL-04 for 2 weeks.",
    workOrders: [wo("WO-1051", "Put AUD-0009 QR labels on FL-03 and FL-04", "tom", "Oct 21", "open")],
    history: [{ at: "Oct 8", text: "CAPA-0038 created with 1 work order", tone: "info" }],
  },
  {
    id: "capa-0037",
    ref: "CAPA-0037",
    title: "Hearing protection not worn at the Press Line",
    type: "Preventive",
    status: "open",
    priority: "Medium",
    ownerId: "maria",
    due: "Nov 6",
    createdAt: "Oct 7",
    locationId: "press",
    source: "Noise survey on Oct 6: 91 dBA next to Press 4",
    rootCause: "The Press Line is above 85 dBA but has no signs at its entrances, and the closest earplug dispenser is in the Maintenance Shop.",
    plan: ["Post hearing protection signs at both entrances", "Mount an earplug dispenser at each entrance", "Toolbox talk on hearing protection with the 3 shifts"],
    verification: "A walk-through on each shift finds everyone at the Press Line wearing protection.",
    workOrders: [wo("WO-1048", "Mount earplug dispensers and signs, Press Line", "tom", "Oct 20", "open")],
    history: [{ at: "Oct 7", text: "CAPA-0037 created with 1 work order", tone: "info" }],
  },
  {
    id: "capa-0036",
    ref: "CAPA-0036",
    title: "Worn sling on overhead crane OC-1",
    type: "Corrective",
    status: "in_review",
    priority: "High",
    ownerId: "aisha",
    due: "Oct 19",
    createdAt: "Oct 6",
    locationId: "shop",
    assetLabel: "OC-1 Overhead crane",
    source: "Found in the monthly crane inspection",
    rootCause: "The sling had cut fibers along 20 cm. Slings were not on any checklist, so nobody had looked at it since March.",
    plan: ["Tag out the worn sling and replace it with a certified 2 t sling", "Add the slings to the monthly crane inspection"],
    verification: "Certificate of the new sling attached, and the sling item ticked on the next crane inspection.",
    workOrders: [
      wo("WO-1041", "Tag out and replace the sling, OC-1", "carlos", "Oct 9", "complete", "Oct 9"),
      wo("WO-1046", "Add slings to the monthly crane inspection", "dan", "Oct 15", "complete", "Oct 15"),
    ],
    history: [
      { at: "Oct 6", text: "CAPA-0036 created with 2 work orders", tone: "info" },
      { at: "Oct 9", text: "WO-1041 completed by Carlos Rivera · sling certificate attached", tone: "done" },
      { at: "Oct 15", text: "WO-1046 completed by Dan Brooks", tone: "done" },
      { at: "Oct 15", text: "All 2 work orders are done. CAPA-0036 is back with Aisha Khan to review.", tone: "review" },
    ],
  },
  {
    id: "capa-0035",
    ref: "CAPA-0035",
    title: "Unlabelled spray bottles in the Maintenance Shop",
    type: "Corrective",
    status: "open",
    priority: "Medium",
    ownerId: "maria",
    due: "Oct 12",
    createdAt: "Oct 5",
    locationId: "shop",
    event: { ref: "EVT-0120", title: "Unlabelled spray bottles on the shop bench", type: "Observation", reportedAt: "Oct 5, 13:30", reportedBy: "Tom Becker" },
    rootCause: "Degreaser and compressor oil are poured into spray bottles to use at the bench. The shop has no labels for secondary containers.",
    plan: ["Label every secondary container with the product name and its hazards", "Print the labels from the SDS library (SDS-0071, SDS-0118)"],
    verification: "Photo of the labelled bottles on the bench.",
    workOrders: [wo("WO-1039", "Label secondary containers, Maintenance Shop", "tom", "Oct 12", "in_progress")],
    history: [
      { at: "Oct 5", text: "CAPA-0035 created from EVT-0120 with 1 work order", tone: "info" },
      { at: "Oct 11", text: "WO-1039 started by Tom Becker · 4 of 6 bottles labelled", tone: "progress" },
      { at: "Oct 13", text: "WO-1039 is 1 day late", tone: "late" },
    ],
  },
  {
    id: "capa-0034",
    ref: "CAPA-0034",
    title: "LOTO-0009 annual review missed, Air compressor 2",
    type: "Preventive",
    status: "open",
    priority: "Medium",
    ownerId: "maria",
    due: "Oct 31",
    createdAt: "Oct 3",
    locationId: "shop",
    assetId: "ac2",
    source: "Compliance calendar: the annual periodic inspection was due Sep 30",
    rootCause: "LOTO reviews were kept in a spreadsheet that nobody owned after August.",
    plan: ["Inspect LOTO-0009 with a technician who uses it", "Track every LOTO review in Safety, with a reminder 30 days before"],
    verification: "LOTO-0009 shows an inspection dated in October.",
    workOrders: [],
    history: [{ at: "Oct 3", text: "CAPA-0034 created with no work orders. Maria Lopez closes it when the actions are done.", tone: "info" }],
  },
  {
    id: "capa-0032",
    ref: "CAPA-0032",
    title: "Air hose across the aisle at the Press Line",
    type: "Corrective",
    status: "closed",
    priority: "Low",
    ownerId: "dan",
    due: "Oct 9",
    createdAt: "Sep 29",
    closedAt: "Oct 8",
    locationId: "press",
    event: { ref: "EVT-0114", title: "Trip hazard: air hose across the aisle at Press 4", type: "Hazard", reportedAt: "Sep 28, 09:15", reportedBy: "Carlos Rivera" },
    rootCause: "Press 4 has no air drop at the press, so the hose runs from the wall across the aisle.",
    plan: ["Install an overhead hose reel above Press 4"],
    verification: "Photo of the reel installed and a clear aisle.",
    workOrders: [wo("WO-1034", "Install overhead hose reel, Press Line", "carlos", "Oct 9", "complete", "Oct 8")],
    history: [
      { at: "Sep 29", text: "CAPA-0032 created from EVT-0114 with 1 work order", tone: "info" },
      { at: "Oct 8", text: "WO-1034 completed by Carlos Rivera · photo attached", tone: "done" },
      { at: "Oct 8", text: "CAPA-0032 closed by its owner", tone: "closed" },
    ],
  },
  {
    id: "capa-0031",
    ref: "CAPA-0031",
    title: "Eyewash station blocked in Packaging",
    type: "Corrective",
    status: "closed",
    priority: "Medium",
    ownerId: "jo",
    due: "Oct 6",
    createdAt: "Sep 24",
    closedAt: "Oct 6",
    locationId: "pack2",
    event: { ref: "EVT-0108", title: "Pallets stacked in front of the eyewash station", type: "Observation", reportedAt: "Sep 23, 11:50", reportedBy: "Priya Shah" },
    rootCause: "Nothing on the floor showed that the space in front of the eyewash must stay clear, and the line used it to stage pallets.",
    plan: ["Clear the pallets and paint a keep-clear box in front of the eyewash", "Add the eyewash to the weekly housekeeping walk"],
    verification: "Photo of the painted box, and two weekly walks with the eyewash clear.",
    workOrders: [wo("WO-1024", "Paint keep-clear box at the eyewash, Packaging Line 2", "carlos", "Sep 30", "complete", "Sep 29")],
    history: [
      { at: "Sep 24", text: "CAPA-0031 created from EVT-0108 with 1 work order", tone: "info" },
      { at: "Sep 29", text: "WO-1024 completed by Carlos Rivera · photo attached", tone: "done" },
      { at: "Oct 6", text: "CAPA-0031 closed by its owner", tone: "closed" },
    ],
  },
];

/** The root cause written on the CAPA of each use case 3 event, from what its triage found. */
const FLOW_ROOT_CAUSES: Record<string, string> = {
  "ev-2041":
    "The operator reached past the light curtain to clear a slug during the die change. The light curtain had failed its self-test twice in 30 days (WO-0988, WO-1003), and nothing in SOP-0044 says to clear slugs under LOTO-0017.",
  "ev-2040": "The e-stop head cracked and nobody noticed it no longer latched: the monthly guarding inspection (AUD-0025) checks that the button is there, not that it works.",
  "ev-2039": "Pedestrians cross behind forklifts reversing out of trailers at Dock door 2. There is no walkway and no warning light; this is the third near miss there in 60 days.",
  "ev-2038": "The return hose of Press 7 leaked again 3 weeks after WO-1036. Hoses are not on any PM, so wear is only found once they leak.",
  "ev-0119": "The die hoist was out of service for 5 days with no work order, and there was no other way to move a 25 kg die.",
};

/** The CAPAs that event flows made (CAPA-0033 is seeded; running a flow adds the next ones). */
export function actionsFromFlows(flows: Record<string, EventFlowState>): ActionRecord[] {
  return EVENTS.flatMap((e): ActionRecord[] => {
    const flow = flows[e.id];
    if (!flow?.capaRef) return [];
    const chosen = e.options.filter((o) => flow.selectedOptionIds.includes(o.id)).map((o) => o.title);
    return [
      {
        id: actionId(flow.capaRef),
        ref: flow.capaRef,
        // The same title A1 shows for it.
        title: e.title,
        type: e.capaDefaults?.type ?? "Corrective",
        status: flow.capaStatus ?? "open",
        priority: e.capaDefaults?.priority ?? "Medium",
        ownerId: e.capaDefaults?.ownerId,
        due: e.capaDefaults?.due ?? "",
        createdAt: flow.decidedAt ?? "Today",
        locationId: e.locationId,
        assetId: e.assetId,
        event: { id: e.id, ref: e.ref, title: e.title, type: e.type, reportedAt: e.reportedAt, reportedBy: e.reportedBy },
        rootCause: FLOW_ROOT_CAUSES[e.id] ?? e.aiSummary,
        plan: [...chosen, ...flow.customActions],
        verification: e.verifyEvidence,
        workOrders: flow.wos,
        history: flow.updates,
        fromFlow: { eventId: e.id },
      },
    ];
  });
}

/** Every CAPA of the plant: the event flows' first, then the others, newest ref first. */
export function allActions(flows: Record<string, EventFlowState>): ActionRecord[] {
  const fromFlows = actionsFromFlows(flows);
  const refs = new Set(fromFlows.map((a) => a.ref));
  return [...fromFlows, ...OTHER_ACTIONS.filter((a) => !refs.has(a.ref))].sort((a, b) => b.ref.localeCompare(a.ref));
}

export const findAction = (id: string, flows: Record<string, EventFlowState>) => allActions(flows).find((a) => a.id === id.toLowerCase());

// ───────────────────────────── how a value reads

export const STATUS_LABEL: Record<ActionStatus, string> = { open: "Open", in_review: "In review", closed: "Closed" };
/** Safety's events mapping: open is accent, in review is warning, closed is neutral. */
export const STATUS_TONE = { open: "accent", in_review: "warning", closed: "neutral" } as const satisfies Record<ActionStatus, string>;
/** Colour only where it asks someone to act: high is amber, the rest grey (the redesign's ramp). */
export const PRIORITY_TONE = { High: "warning", Medium: "neutral", Low: "neutral" } as const satisfies Record<ActionPriority, string>;
export const PRIORITY_RANK: Record<ActionPriority, number> = { High: 0, Medium: 1, Low: 2 };
export const WO_STATUS_LABEL: Record<FlowWo["status"], string> = { open: "Open", in_progress: "In progress", complete: "Complete" };
export const WO_STATUS_TONE = { open: "accent", in_progress: "accent", complete: "neutral" } as const satisfies Record<FlowWo["status"], string>;

/** Days from the demo's today to the due date; below zero is late. */
export const dueIn = (a: Pick<ActionRecord, "due">) => daysFromDemoToday(a.due);
/** Overdue: the due date has passed and the action is not closed. Due today is not late yet. */
export const isOverdue = (a: Pick<ActionRecord, "due" | "status">) => a.status !== "closed" && (dueIn(a) ?? 0) < 0;

export const ownerName = (a: Pick<ActionRecord, "ownerId">) => (a.ownerId ? person(a.ownerId).name : undefined);
export const assetName = (a: Pick<ActionRecord, "assetId" | "assetLabel">) => {
  const found = a.assetId ? getAsset(a.assetId) : undefined;
  return found ? `${found.code} ${found.name}` : a.assetLabel;
};
export const placeName = (a: Pick<ActionRecord, "locationId">) => locationName(a.locationId);
