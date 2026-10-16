// Nova, UpKeep's AI, inside the Compliance Calendar (option B of use case 2).
// Scripted: proposals and replies are fixed. Today Nova in Safety only reads; this shows it acting.

export type ProposalKind = "wo" | "pm" | "doc" | "event" | "capa" | "wo_close" | "assign" | "training";

export interface Proposal {
  id: string;
  kind: ProposalKind;
  /** Day it lands on the calendar (ISO). */
  day: string;
  title: string;
  detail: string;
  /** What Nova read to propose it. */
  why: string;
  /** Approving creates this execution job (work order or PM with its permit and documents). */
  jobId?: string;
  /** Extra calendar days for a recurring PM. */
  repeats?: string[];
  needsDocs?: boolean;
  /** Past tense, shown after approval. */
  result: string;
}

export const KIND_META: Record<ProposalKind, { label: string; group: string; tone: string }> = {
  wo: { label: "Work order", group: "Schedule work", tone: "indigo" },
  pm: { label: "Preventive maintenance", group: "Schedule work", tone: "amber" },
  doc: { label: "Document", group: "Keep documents current", tone: "sky" },
  training: { label: "Learn training", group: "Keep documents current", tone: "teal" },
  event: { label: "Close events", group: "Close out", tone: "emerald" },
  capa: { label: "Close CAPA", group: "Close out", tone: "emerald" },
  wo_close: { label: "Close work order", group: "Close out", tone: "emerald" },
  assign: { label: "Assign", group: "People", tone: "violet" },
};

export const GROUP_ORDER = ["Schedule work", "Keep documents current", "Close out", "People"];

export const PROPOSALS: Proposal[] = [
  {
    id: "n-fl03-insp",
    kind: "wo",
    day: "2026-10-16",
    title: "Pre-use inspection · FL-03",
    detail: "WO-1053 today · Jo Park · AUD-0009 attached",
    why: "AUD-0009 is daily and today's is not done",
    jobId: "fl03-inspect",
    result: "WO-1053 scheduled for today",
  },
  {
    id: "n-cv12",
    kind: "wo",
    day: "2026-10-19",
    title: "Belt tracking · CV-12",
    detail: "WO-1056 Mon Oct 19 · SOP-0051 and LOTO-0022 attached",
    why: "The belt drifted twice since WO-1029 on Sep 24",
    jobId: "cv12-tracking",
    result: "WO-1056 scheduled for Mon Oct 19",
  },
  {
    id: "n-fl03-clean",
    kind: "wo",
    day: "2026-10-20",
    title: "Clean Forklift 3",
    detail: "WO-1052 with permit PTW-0044 · Carlos Rivera",
    why: "SOP-0031 says monthly; last cleaned Sep 18",
    jobId: "fl03-clean",
    result: "WO-1052 and permit PTW-0044 created",
  },
  {
    id: "n-hp04",
    kind: "wo",
    day: "2026-10-21",
    title: "Clean Press 4",
    detail: "WO-1055 with LOTO-0017 and permit PTW-0045",
    why: "SOP-0045 says every 2 weeks; last done Oct 7",
    jobId: "hp04-clean",
    result: "WO-1055 and permit PTW-0045 created",
  },
  {
    id: "n-ac2",
    kind: "wo",
    day: "2026-10-21",
    title: "Pressure vessel · AC-2",
    detail: "WO-1057 · Tom Becker · LOTO-0009 attached",
    why: "AUD-0030 is yearly, due Oct 21",
    jobId: "ac2-inspect",
    result: "WO-1057 scheduled for Wed Oct 21",
  },
  {
    id: "n-pm-batt",
    kind: "pm",
    day: "2026-10-22",
    repeats: ["2026-10-29"],
    title: "Battery service PM · FL-03",
    detail: "PM-0211 every Thursday 06:30 · Carlos Rivera · each work order carries SOP-0032",
    why: "SOP-0032 says weekly, but 3 of the last 8 weeks have no record",
    result: "PM-0211 created in the CMMS, first work order Thu Oct 22",
  },
  {
    id: "n-pm-eyewash",
    kind: "pm",
    day: "2026-10-28",
    title: "Eyewash test as a PM",
    detail: "PM-0212 every Wednesday · Tom Becker · replaces the manual task, result comes back here",
    why: "It is a manual compliance task today and was late twice in September",
    result: "PM-0212 created; the manual task stops after Oct 21",
  },
  {
    id: "n-doc-sop45",
    kind: "doc",
    day: "2026-10-19",
    title: "Update SOP-0045 step 5",
    detail: "New revision drafted: the light curtain model changed in WO-1003",
    why: "WO-1003 closed Oct 6 with a new part number that SOP-0045 does not name",
    result: "SOP-0045 rev. 4 sent to Maria Lopez for approval",
  },
  {
    id: "n-doc-loto17",
    kind: "doc",
    day: "2026-10-23",
    title: "Annual review · LOTO-0017",
    detail: "Review drafted with the same light curtain change, sent to Maria Lopez",
    why: "OSHA 1910.147(c)(6) asks for a yearly inspection; the last one was Oct 24, 2025",
    result: "LOTO-0017 review sent to Maria Lopez",
  },
  {
    id: "n-learn-update",
    kind: "training",
    day: "2026-10-23",
    title: "Update Learn course “LOTO basics”",
    detail: "Lesson 3 gets the Press 4 steps from the LOTO-0017 review",
    why: "The course still quotes last year's procedure",
    result: "Lesson 3 updated in UpKeep Learn, 14 learners notified",
  },
  {
    id: "n-learn",
    kind: "training",
    day: "2026-10-27",
    title: "Forklift recertification · 2 operators",
    detail: "Assign the Learn course “Powered industrial trucks” to Luis Ortega and Ana Silva",
    why: "Their certifications expire Oct 31 (OSHA 1910.178(l), every 3 years)",
    result: "Course assigned in UpKeep Learn, due Oct 30",
  },
  {
    id: "n-ev-close",
    kind: "event",
    day: "2026-10-16",
    title: "Close 3 observations",
    detail: "SE-2031, SE-2033, SE-2035: fixed on the spot, photo attached",
    why: "Low severity, the reporter fixed it, no CAPA needed",
    result: "3 events closed with Nova's note",
  },
  {
    id: "n-capa-close",
    kind: "capa",
    day: "2026-10-16",
    title: "Close CAPA-0039",
    detail: "Both actions done; the completion photo matches the action",
    why: "WO-1044 and WO-1045 are complete and verification is due today",
    result: "CAPA-0039 closed as effective",
  },
  {
    id: "n-wo-close",
    kind: "wo_close",
    day: "2026-10-16",
    title: "Close WO-1036 · Press 7 hose",
    detail: "Carlos replaced the return hose; leak test photo attached",
    why: "Marked done by the technician 2 days ago, still open",
    result: "WO-1036 closed",
  },
  {
    id: "n-assign",
    kind: "assign",
    day: "2026-10-20",
    title: "Assign WO-1058 to Tom Becker",
    detail: "Dock leveler #2 inspection has no assignee",
    why: "Tom has 1 job on Tuesday; Carlos has 3",
    result: "WO-1058 assigned to Tom Becker",
  },
  // Added from the chat.
  {
    id: "n-hp07-pm",
    kind: "pm",
    day: "2026-10-30",
    title: "Monthly cleaning PM · Press 7",
    detail: "PM-0210 every last Friday · SOP and LOTO drafts go to approval first",
    why: "Press 7 only has a JHA, so Nova drafted the SOP and the LOTO",
    jobId: "hp07-monthly",
    needsDocs: true,
    result: "PM-0210 created; SOP-0061 and LOTO-0031 sent for approval",
  },
  {
    id: "n-capa41-owner",
    kind: "assign",
    day: "2026-10-16",
    title: "Set Dan Brooks as owner of CAPA-0041",
    detail: "Guard missing on Saw 2 · due Oct 10 · no owner",
    why: "Dan owns the Maintenance Shop, where Saw 2 is",
    result: "CAPA-0041 assigned to Dan Brooks, new due date Oct 23",
  },
  {
    id: "n-fl04-daily",
    kind: "pm",
    day: "2026-10-19",
    repeats: ["2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"],
    title: "Daily pre-use inspection · FL-04",
    detail: "PM-0213 every workday 06:00 · Jo Park · AUD-0009 attached",
    why: "FL-04 missed its pre-use inspection on Oct 14 and Oct 15",
    result: "PM-0213 created, first inspection Mon Oct 19",
  },
  {
    id: "n-learn-carlos",
    kind: "training",
    day: "2026-10-30",
    title: "LOTO refresher · Carlos Rivera",
    detail: "Assign “LOTO basics” after the course update",
    why: "His last LOTO training was Nov 2025 and he runs most lockouts",
    result: "Course assigned to Carlos Rivera, due Nov 12",
  },
];

export const INITIAL_IDS = PROPOSALS.slice(0, 15).map((p) => p.id);
export const proposal = (id: string) => PROPOSALS.find((p) => p.id === id);

export type KV = { label: string; value: string };

export interface NovaReply {
  text: string;
  proposals?: string[];
  cards?: KV[][];
  followups?: string[];
  move?: { from: string; to: string };
}

export const NOVA_CHIPS = [
  "Plan Press 7 every last Friday of the month",
  "What's overdue?",
  "Who is free next week?",
  "Who needs training this month?",
];

/** Keyword routing for the scripted Nova. */
export function interpretNova(text: string): NovaReply {
  const t = text.toLowerCase();

  if ((t.includes("move") || t.includes("reschedul")) && t.includes("21")) {
    return {
      text: "Moved the two jobs on Wed Oct 21 to Thu Oct 22. Carlos had 3 jobs on Wednesday and 1 on Thursday. The permits move with them.",
      move: { from: "2026-10-21", to: "2026-10-22" },
      followups: ["What's overdue?"],
    };
  }
  if (t.includes("press 7") || t.includes("last friday") || t.includes("monthly")) {
    return {
      text: "Press 7 only has a JHA on file. I drafted the SOP and the LOTO from it and the manual, and a monthly PM that creates the work order with both attached. Dec 25 is a holiday, so December moves to Thu Dec 24.",
      proposals: ["n-hp07-pm"],
      followups: ["Who is free next week?"],
    };
  }
  if (t.includes("overdue") || t.includes("late") || t.includes("behind")) {
    return {
      text: "Two things are late. Nothing is overdue on the calendar itself.",
      cards: [
        [
          { label: "CAPA", value: "CAPA-0041 · Guard missing on Saw 2" },
          { label: "Owner", value: "Not set" },
          { label: "Due date", value: "Oct 10, 6 days late" },
        ],
        [
          { label: "Inspection", value: "FL-04 pre-use (AUD-0009)" },
          { label: "Missed", value: "Oct 14 and Oct 15" },
          { label: "Attention", value: "Daily inspection with no schedule" },
        ],
      ],
      proposals: ["n-capa41-owner", "n-fl04-daily"],
      followups: ["Who is free next week?"],
    };
  }
  if (t.includes("free") || (t.includes("who") && t.includes("week")) || t.includes("workload") || t.includes("busy")) {
    return {
      text: "With everything I proposed, Carlos is full on Wednesday.",
      cards: [
        [
          { label: "Carlos Rivera", value: "Mon 1 · Tue 2 · Wed 3 · Thu 1 · Fri 0" },
          { label: "Tom Becker", value: "Mon 0 · Tue 1 · Wed 1 · Thu 0 · Fri 1" },
          { label: "Jo Park", value: "Daily inspections, 15 min each" },
        ],
      ],
      followups: ["Move everything on Oct 21 to Oct 22", "What's overdue?"],
    };
  }
  if (t.includes("train") || t.includes("learn") || t.includes("certif")) {
    return {
      text: "Three people need training this month. Two are already in my list; here is the third.",
      cards: [
        [
          { label: "Luis Ortega", value: "Forklift, expires Oct 31" },
          { label: "Ana Silva", value: "Forklift, expires Oct 31" },
          { label: "Carlos Rivera", value: "LOTO refresher, last Nov 2025" },
        ],
      ],
      proposals: ["n-learn-carlos"],
      followups: ["What's overdue?"],
    };
  }
  return {
    text: "I can schedule work orders and PMs, update documents and Learn courses, close events, CAPAs and work orders, and assign people. Try one of these.",
    followups: NOVA_CHIPS.slice(0, 3),
  };
}
