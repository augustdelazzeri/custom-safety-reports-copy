"use client";

/**
 * Compliance screen data: the Springfield Plant OSHA 300 log for 2026, its Form 300A, and the
 * reports sent to agencies. Fictitious, kept coherent with the rest of the prototype: EVT-2041
 * (Press 4 laceration, Oct 16, "today" in the event data) becomes case 2026-014, the newest
 * one; the earlier cases use the same plant areas, assets and a few of the same people.
 */

import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { useSyncExternalStore } from "react";

export type CaseClass = "death" | "daysAway" | "restricted" | "other";
export type InjuryType = "injury" | "skin" | "respiratory" | "poisoning" | "hearing" | "otherIllness";

export interface OshaCase {
  /** Case number (A), also the id in the address. */
  id: string;
  eventRef: string;
  /** The event in this prototype, when there is one to open. */
  eventId?: string;
  /** What happened (F), as one line. */
  title: string;
  employee: string;
  privacy?: boolean;
  jobTitle: string;
  /** Date of injury (D), ISO. */
  date: string;
  where: string;
  caseClass: CaseClass;
  daysAway: number;
  daysRestricted: number;
  /** The person is still away or on restricted duty: the count is still running. */
  ongoing?: boolean;
  injuryType: InjuryType;
  bodyPart: string;
  object: string;
  treatment: string;
  clinic: string;
  emergencyRoom: boolean;
  hospitalized: boolean;
  addedBy: string;
  addedOn: string;
  /** How the case got on the log. */
  how: string;
}

export const CLASS_LABEL: Record<CaseClass, string> = {
  death: "Death",
  daysAway: "Days away from work",
  restricted: "Job transfer or restriction",
  other: "Other recordable case",
};

export const INJURY_LABEL: Record<InjuryType, string> = {
  injury: "Injury",
  skin: "Skin disorder",
  respiratory: "Respiratory condition",
  poisoning: "Poisoning",
  hearing: "Hearing loss",
  otherIllness: "All other illnesses",
};

export const ESTABLISHMENT = {
  name: "Springfield Plant",
  street: "1200 Industrial Parkway, Springfield, IL 62703",
  industry: "Metal stamping and packaging",
  naics: "332119",
  ein: "36-4829157",
};

/** The establishment's size per year: hours turn cases into TRC and DART rates. */
export const YEAR_FACTS: Record<number, { averageEmployees: number; hoursWorked: number; hoursNote: string }> = {
  2026: { averageEmployees: 380, hoursWorked: 612_400, hoursNote: "To Oct 11, from payroll" },
  2025: { averageEmployees: 372, hoursWorked: 761_800, hoursNote: "Full year, from payroll" },
};

const base = { addedBy: "Maria Lopez", clinic: "Springfield Occupational Health", emergencyRoom: false, hospitalized: false };

/** The 13 cases before EVT-2041, newest first. */
const EARLIER_2026: OshaCase[] = [
  {
    ...base,
    id: "2026-013",
    eventRef: "EVT-2017",
    title: "Fingertip fracture clearing a jam on Conveyor 12",
    employee: "Ahmed Hassan",
    jobTitle: "Packer",
    date: "2026-10-07",
    where: "Packaging Line 2",
    caseClass: "restricted",
    daysAway: 0,
    daysRestricted: 6,
    injuryType: "injury",
    bodyPart: "Right middle finger",
    object: "Conveyor 12 guard gap",
    treatment: "X-ray, fracture, aluminium splint",
    addedOn: "2026-10-08",
    how: "Added from EVT-2017, accepting the suggested classification: a rigid splint is medical treatment and he was on light duty for 6 days (29 CFR 1904.7(b)(4)).",
  },
  {
    ...base,
    id: "2026-012",
    eventRef: "EVT-1996",
    title: "Knee sprain stepping off the Press 6 platform",
    employee: "Ray Thompson",
    jobTitle: "Die setter",
    date: "2026-09-23",
    where: "Press Line",
    caseClass: "restricted",
    daysAway: 0,
    daysRestricted: 23,
    ongoing: true,
    injuryType: "injury",
    bodyPart: "Left knee",
    object: "Press 6 platform step",
    treatment: "Physical therapy, no kneeling or ladders",
    addedOn: "2026-09-24",
    how: "Added from EVT-1996 from your answers in the OSHA review: restricted duty since Sep 24, still counting (29 CFR 1904.7(b)(4)).",
  },
  {
    ...base,
    id: "2026-011",
    eventRef: "EVT-1968",
    title: "Carpal tunnel in the right wrist from repetitive case sealing",
    employee: "Nina Patel",
    jobTitle: "Packer",
    date: "2026-08-26",
    where: "Packaging Line 2",
    caseClass: "restricted",
    daysAway: 0,
    daysRestricted: 30,
    injuryType: "otherIllness",
    bodyPart: "Right wrist",
    object: "Manual case sealer",
    treatment: "Diagnosed by a physician, moved to line inspection for 30 days",
    addedOn: "2026-08-28",
    how: "Added from EVT-1968 from your answers in the OSHA review: a job transfer after a physician's diagnosis (29 CFR 1904.7(b)(4)).",
  },
  {
    ...base,
    id: "2026-010",
    eventRef: "EVT-1951",
    title: "Pulled shoulder breaking loose a seized bolt",
    employee: "Carlos Rivera",
    jobTitle: "Maintenance technician",
    date: "2026-08-05",
    where: "Maintenance Shop",
    caseClass: "other",
    daysAway: 0,
    daysRestricted: 0,
    injuryType: "injury",
    bodyPart: "Right shoulder",
    object: "Breaker bar on a seized bolt",
    treatment: "Prescription muscle relaxant",
    addedOn: "2026-08-06",
    how: "Added from EVT-1951, accepting the suggested classification: a prescription medicine is medical treatment (29 CFR 1904.7(b)(5)).",
  },
  {
    ...base,
    id: "2026-009",
    eventRef: "EVT-1922",
    title: "Heat exhaustion unloading a trailer at Dock door 3",
    employee: "Victor Santos",
    jobTitle: "Material handler",
    date: "2026-07-14",
    where: "Loading Dock",
    caseClass: "daysAway",
    daysAway: 1,
    daysRestricted: 0,
    injuryType: "otherIllness",
    bodyPart: "Whole body",
    object: "Trailer interior, 38 °C",
    treatment: "IV fluids at the emergency room, treated and released",
    clinic: "Springfield Memorial Hospital",
    emergencyRoom: true,
    addedOn: "2026-07-15",
    how: "Added from EVT-1922 from your answers in the OSHA review: one day away from work. Treated and released, so no 24-hour report to OSHA.",
  },
  {
    ...base,
    id: "2026-008",
    eventRef: "EVT-1890",
    title: "Hearing loss confirmed on the annual audiogram",
    employee: "Grace Kim",
    jobTitle: "Quality inspector",
    date: "2026-06-03",
    where: "Press Line",
    caseClass: "other",
    daysAway: 0,
    daysRestricted: 0,
    injuryType: "hearing",
    bodyPart: "Both ears",
    object: "Press Line noise",
    treatment: "Standard threshold shift, 25 dB above audiometric zero, confirmed by retest",
    addedOn: "2026-06-12",
    how: "Added after the retest confirmed a standard threshold shift (29 CFR 1904.10).",
  },
  {
    ...base,
    id: "2026-007",
    eventRef: "EVT-1858",
    title: "Foot crushed between Forklift 3 and the racking",
    employee: "Andre Wilson",
    jobTitle: "Forklift operator",
    date: "2026-05-06",
    where: "Warehouse",
    caseClass: "daysAway",
    daysAway: 9,
    daysRestricted: 10,
    injuryType: "injury",
    bodyPart: "Left foot",
    object: "Forklift 3",
    treatment: "Fractured toe, walking boot",
    clinic: "Springfield Memorial Hospital",
    emergencyRoom: true,
    addedOn: "2026-05-07",
    how: "Added from EVT-1858 from your answers in the OSHA review: 9 days away, then 10 days restricted (29 CFR 1904.7(b)(3)).",
  },
  {
    ...base,
    id: "2026-006",
    eventRef: "EVT-1831",
    title: "Metal splinter in the right eye while grinding",
    employee: "Tom Becker",
    jobTitle: "Maintenance technician",
    date: "2026-04-17",
    where: "Maintenance Shop",
    caseClass: "other",
    daysAway: 0,
    daysRestricted: 0,
    injuryType: "injury",
    bodyPart: "Right eye",
    object: "Bench grinder",
    treatment: "Embedded splinter removed by the doctor, prescription drops",
    addedOn: "2026-04-17",
    how: "Added from EVT-1831, accepting the suggested classification: a splinter removed by a doctor, not by rinsing, is medical treatment (29 CFR 1904.7(b)(5)).",
  },
  {
    ...base,
    id: "2026-005",
    eventRef: "EVT-1804",
    title: "Lower back strain lifting cases off Packaging Line 2",
    employee: "Samantha Reed",
    jobTitle: "Packer",
    date: "2026-03-30",
    where: "Packaging Line 2",
    caseClass: "restricted",
    daysAway: 0,
    daysRestricted: 12,
    injuryType: "injury",
    bodyPart: "Lower back",
    object: "Cases of 18 kg at the line end",
    treatment: "Physical therapy, no lifting over 10 kg",
    addedOn: "2026-03-31",
    how: "Added from EVT-1804 from your answers in the OSHA review: 12 days of restricted duty (29 CFR 1904.7(b)(4)).",
  },
  {
    ...base,
    id: "2026-004",
    eventRef: "EVT-1779",
    title: "Fingertip amputation, left index finger, caught in the Press 2 die",
    employee: "Derek Owens",
    jobTitle: "Press operator",
    date: "2026-03-11",
    where: "Press Line",
    caseClass: "daysAway",
    daysAway: 21,
    daysRestricted: 14,
    injuryType: "injury",
    bodyPart: "Left index finger, tip",
    object: "Press 2 die",
    treatment: "Surgery at the emergency room, released the same day",
    clinic: "Springfield Memorial Hospital",
    emergencyRoom: true,
    addedOn: "2026-03-11",
    how: "Added from EVT-1779 the same day. An amputation: reported to OSHA within 24 hours (AR-0002, 29 CFR 1904.39).",
  },
  {
    ...base,
    id: "2026-003",
    eventRef: "EVT-1752",
    title: "Skin rash on both hands from cutting fluid",
    employee: "",
    privacy: true,
    jobTitle: "Machine operator",
    date: "2026-02-10",
    where: "Press Line",
    caseClass: "other",
    daysAway: 0,
    daysRestricted: 0,
    injuryType: "skin",
    bodyPart: "Both hands",
    object: "Water-based cutting fluid",
    treatment: "Prescription cream",
    addedOn: "2026-02-12",
    how: "Added from EVT-1752. The employee asked for the name to stay off the log, so it reads “Privacy case” (29 CFR 1904.29(b)(7)).",
  },
  {
    ...base,
    id: "2026-002",
    eventRef: "EVT-1720",
    title: "Sprained wrist slipping on ice at Dock door 3",
    employee: "Rosa Delgado",
    jobTitle: "Material handler",
    date: "2026-01-22",
    where: "Loading Dock",
    caseClass: "restricted",
    daysAway: 0,
    daysRestricted: 5,
    injuryType: "injury",
    bodyPart: "Right wrist",
    object: "Ice at the dock apron",
    treatment: "Rigid splint",
    addedOn: "2026-01-23",
    how: "Added from EVT-1720 from your answers in the OSHA review: a rigid splint and 5 days restricted (29 CFR 1904.7(b)(4)).",
  },
  {
    ...base,
    id: "2026-001",
    eventRef: "EVT-1701",
    title: "Cut forearm on a sheet edge loading a coil",
    employee: "Kevin Murphy",
    jobTitle: "Press operator",
    date: "2026-01-08",
    where: "Press Line",
    caseClass: "other",
    daysAway: 0,
    daysRestricted: 0,
    injuryType: "injury",
    bodyPart: "Right forearm",
    object: "Steel coil edge",
    treatment: "6 stitches at the clinic",
    addedOn: "2026-01-08",
    how: "Added from EVT-1701, accepting the suggested classification: stitches are medical treatment (29 CFR 1904.7(b)(5)).",
  },
];

/** The injured operator of EVT-2041; the event names only the person who reported it. */
export const EVT_2041_EMPLOYEE = "Marco Diaz";

/** EVT-2041 as the case it becomes, from the event's own `osha` field. */
export const CASE_2041: OshaCase = {
  ...base,
  id: "2026-014",
  eventRef: "EVT-2041",
  eventId: "ev-2041",
  title: "Laceration on the back of the left hand at Press 4",
  employee: EVT_2041_EMPLOYEE,
  jobTitle: "Press operator",
  date: "2026-10-16",
  where: "Press Line",
  caseClass: "other",
  daysAway: 0,
  daysRestricted: 0,
  injuryType: "injury",
  bodyPart: "Left hand, back",
  object: "Press 4 ram, light curtain bypassed during a die change",
  treatment: "4 stitches at the clinic, back on the line the next shift",
  addedOn: "2026-10-16",
  how: "Added from EVT-2041, accepting the suggested classification: a laceration closed with stitches is medical treatment beyond first aid (29 CFR 1904.7(b)(5)(i)).",
};

/** What the review suggests for EVT-2041, before anyone confirms it. */
export const REVIEW_2041 = {
  verdict: "Recordable",
  confidence: 97,
  rule: "1904.7(b)(5)(i)",
  reason: "A laceration closed with stitches is medical treatment beyond first aid, which makes the case recordable. No days away or restriction so far: other recordable case.",
};

// ───────────────────────────── the decision taken on this page (this browser only)

type Review = { verdict?: "recordable" | "notRecordable"; employee?: string };
const KEY = "ehs-compliance-osha-review";
const EVENT = "ehs-compliance-osha-review";

let cache: { raw: string | null; value: Review } = { raw: null, value: {} };
function readReview(): Review {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw !== cache.raw) cache = { raw, value: raw ? (JSON.parse(raw) as Review) : {} };
  } catch {
    // Blocked storage: nothing decided here yet.
  }
  return cache.value;
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
const EMPTY: Review = {};
export function setReview(next: Review | null) {
  try {
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
    else window.localStorage.removeItem(KEY);
  } catch {
    // The decision still shows for this visit.
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * The 2026 log as the person sees it. EVT-2041 is on it once the event's flow ran (the OSHA
 * step, `oshaRef`) or once someone confirmed it in the review here; before that it waits in the
 * review. A brand-new account has no log.
 */
export function useOshaLog() {
  const { flows } = useThreeCases();
  const [mode] = useDataMode();
  const review = useSyncExternalStore(subscribe, readReview, () => EMPTY);
  const fromFlow = Boolean(flows["ev-2041"]?.oshaRef);
  const on2041 = fromFlow || review.verdict === "recordable";
  const keptOff = !fromFlow && review.verdict === "notRecordable";
  const empty = mode === "new";
  const case2041: OshaCase = {
    ...CASE_2041,
    employee: review.employee || CASE_2041.employee,
    how: fromFlow ? CASE_2041.how : "Added here from the recordability review, accepting the suggested classification: a laceration closed with stitches is medical treatment beyond first aid (29 CFR 1904.7(b)(5)(i)).",
  };
  const cases = empty ? [] : on2041 ? [case2041, ...EARLIER_2026] : EARLIER_2026;
  return { cases, empty, needsReview: !empty && !on2041 && !keptOff, keptOff, fromFlow, review };
}

// ───────────────────────────── counting (Form 300A)

export interface SummaryCounts {
  total: number;
  deaths: number;
  daysAwayCases: number;
  restrictedCases: number;
  otherCases: number;
  daysAway: number;
  daysRestricted: number;
  types: Record<InjuryType, number>;
}

export function countCases(cases: OshaCase[]): SummaryCounts {
  const types = { injury: 0, skin: 0, respiratory: 0, poisoning: 0, hearing: 0, otherIllness: 0 } as Record<InjuryType, number>;
  cases.forEach((c) => (types[c.injuryType] += 1));
  return {
    total: cases.length,
    deaths: cases.filter((c) => c.caseClass === "death").length,
    daysAwayCases: cases.filter((c) => c.caseClass === "daysAway").length,
    restrictedCases: cases.filter((c) => c.caseClass === "restricted").length,
    otherCases: cases.filter((c) => c.caseClass === "other").length,
    daysAway: cases.reduce((n, c) => n + c.daysAway, 0),
    daysRestricted: cases.reduce((n, c) => n + c.daysRestricted, 0),
    types,
  };
}

/** The closed year, as certified and posted. */
export const SUMMARY_2025: SummaryCounts = {
  total: 17,
  deaths: 0,
  daysAwayCases: 4,
  restrictedCases: 6,
  otherCases: 7,
  daysAway: 58,
  daysRestricted: 131,
  types: { injury: 14, skin: 1, respiratory: 0, poisoning: 0, hearing: 1, otherIllness: 1 },
};

/** TRC and DART per 200,000 hours (100 full-time workers for a year). */
export const rates = (c: SummaryCounts, hours: number) => ({
  trc: ((c.total * 200_000) / hours).toFixed(2),
  dart: (((c.daysAwayCases + c.restrictedCases) * 200_000) / hours).toFixed(2),
});

export const CERTIFIED_2025 = {
  name: "Aisha Khan",
  title: "Plant Manager",
  date: "Jan 29, 2026",
  posted: "Feb 1 to Apr 30, 2026",
  postedWhere: "Break room notice board, marked by Maria Lopez",
  sent: "Feb 24, 2026",
  confirmation: "ITA-2026-118204",
};

// ───────────────────────────── agency reports

export interface AgencyReport {
  id: string;
  title: string;
  type: string;
  agency: string;
  /** The agency's full name, for the tooltip. */
  agencyFull: string;
  due: string;
  /** The deadline rule, under the date. */
  dueRule: string;
  status: "Not due yet" | "Submitted" | "Closed by OSHA";
  submitted?: string;
  by?: string;
  caseId?: string;
}

export const AGENCY_REPORTS: AgencyReport[] = [
  {
    id: "AR-0004",
    title: "2026 forms 300, 301 and 300A",
    type: "Annual submission",
    agency: "OSHA (ITA)",
    agencyFull: "OSHA Injury Tracking Application: 100+ employees in a designated industry send the 300, 301 and 300A",
    due: "Mar 2, 2027",
    dueRule: "Yearly",
    status: "Not due yet",
  },
  {
    id: "AR-0003",
    title: "Rapid response reply: Press 2 amputation",
    type: "Investigation reply",
    agency: "OSHA area office",
    agencyFull: "OSHA area office, after the severe injury report",
    due: "Mar 19, 2026",
    dueRule: "5 working days",
    status: "Closed by OSHA",
    submitted: "Mar 18, 2026",
    by: "Maria Lopez",
    caseId: "2026-004",
  },
  {
    id: "AR-0002",
    title: "Severe injury: Press 2 fingertip amputation",
    type: "Amputation",
    agency: "OSHA",
    agencyFull: "OSHA, online severe injury report",
    due: "Mar 12, 2026",
    dueRule: "24 hours, by 08:40",
    status: "Submitted",
    submitted: "Mar 11, 2026",
    by: "Maria Lopez, 14:05",
    caseId: "2026-004",
  },
  {
    id: "AR-0001",
    title: "2025 forms 300, 301 and 300A",
    type: "Annual submission",
    agency: "OSHA (ITA)",
    agencyFull: "OSHA Injury Tracking Application: 100+ employees in a designated industry send the 300, 301 and 300A",
    due: "Mar 2, 2026",
    dueRule: "Yearly",
    status: "Submitted",
    submitted: "Feb 24, 2026",
    by: "Maria Lopez",
  },
];

// ───────────────────────────── formatting

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};
export const formatNumber = (n: number) => n.toLocaleString("en-US");
