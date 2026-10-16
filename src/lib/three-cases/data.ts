// Scripted demo data for the "3 use cases" prototype. Fictitious plant and people.
import type {
  Asset,
  DocColumn,
  ExecutionJob,
  Person,
  SafetyDoc,
  SafetyEventDemo,
  SafetyLocation,
} from "./types";

/** Same order as the Documentation section of the Safety sidebar. */
export const DOC_COLUMNS: DocColumn[] = [
  { type: "jha", label: "Job Hazard Analyses", short: "JHA", role: "prerequisite", roleLabel: "Read before work" },
  { type: "sop", label: "Standard Operating Procedures", short: "SOP", role: "executed", roleLabel: "Executed" },
  { type: "loto", label: "Lockout/Tagout", short: "LOTO", role: "executed", roleLabel: "Executed" },
  { type: "ptw", label: "Permit to Work", short: "Permit", role: "authorizes", roleLabel: "Authorizes" },
  { type: "audit", label: "Audits & Inspections", short: "Inspection", role: "executed", roleLabel: "Executed" },
  { type: "sds", label: "SDS Library", short: "SDS", role: "reference", roleLabel: "Reference" },
];

export const PEOPLE: Person[] = [
  { id: "maria", name: "Maria Lopez", role: "EHS Manager", initials: "ML" },
  { id: "dan", name: "Dan Brooks", role: "Maintenance Supervisor", initials: "DB" },
  { id: "carlos", name: "Carlos Rivera", role: "Maintenance Technician", initials: "CR", phone: "(555) 014-2290" },
  { id: "tom", name: "Tom Becker", role: "Maintenance Technician", initials: "TB", phone: "(555) 014-7781" },
  { id: "aisha", name: "Aisha Khan", role: "Plant Manager", initials: "AK" },
  { id: "jo", name: "Jo Park", role: "Warehouse Lead", initials: "JP" },
];

export const person = (id: string): Person => PEOPLE.find((p) => p.id === id) ?? PEOPLE[0];

export const LOCATIONS: SafetyLocation[] = [
  { id: "plant", name: "Springfield Plant" },
  { id: "press", name: "Press Line", parentId: "plant" },
  { id: "warehouse", name: "Warehouse", parentId: "plant" },
  { id: "pack2", name: "Packaging Line 2", parentId: "plant" },
  { id: "shop", name: "Maintenance Shop", parentId: "plant" },
  { id: "dock", name: "Loading Dock", parentId: "plant" },
];

export const locationName = (id: string) => LOCATIONS.find((l) => l.id === id)?.name ?? "";

export const ASSETS: Asset[] = [
  {
    id: "fl03",
    code: "FL-03",
    name: "Forklift 3",
    locationId: "warehouse",
    category: "Powered industrial truck",
    ownerId: "jo",
    aiHint: "Pre-use inspection due today",
    aiHintTone: "due",
    lastWorkOrders: [
      { ref: "WO-1032", title: "Replace mast chain", date: "Sep 28" },
      { ref: "WO-0997", title: "Hydraulic leak at tilt cylinder", date: "Aug 14" },
    ],
    docs: [
      { id: "d-fl-jha", type: "jha", ref: "JHA-0012", title: "Forklift operation", status: "approved", covers: 2 },
      { id: "d-fl-sop-clean", type: "sop", ref: "SOP-0031", title: "Forklift cleaning and degreasing", status: "approved", enables: "fl03-clean" },
      {
        id: "d-fl-sop-batt",
        type: "sop",
        ref: "SOP-0032",
        title: "SOP: Battery charging and watering, electric forklifts",
        status: "approved",
        enables: "fl03-battery",
        match: { reason: "Title says electric forklifts, and FL-03 is the only electric one in the Warehouse", confidence: "medium" },
      },
      { id: "d-fl-insp", type: "audit", ref: "AUD-0009", title: "Forklift pre-use inspection (OSHA 1910.178)", status: "approved", enables: "fl03-inspect", covers: 2 },
      { id: "d-fl-sds-acid", type: "sds", ref: "SDS-0104", title: "Battery electrolyte (sulfuric acid)", status: "approved" },
      { id: "d-fl-sds-degr", type: "sds", ref: "SDS-0118", title: "Citrus degreaser", status: "approved" },
    ],
  },
  {
    id: "fl04",
    code: "FL-04",
    name: "Forklift 4",
    locationId: "dock",
    category: "Powered industrial truck",
    ownerId: "jo",
    aiHint: "Open near miss at Dock door 2",
    aiHintTone: "event",
    lastWorkOrders: [{ ref: "WO-1040", title: "Horn not working", date: "Oct 2" }],
    docs: [
      { id: "d-fl4-jha", type: "jha", ref: "JHA-0012", title: "Forklift operation", status: "approved", covers: 2 },
      { id: "d-fl4-insp", type: "audit", ref: "AUD-0009", title: "Forklift pre-use inspection (OSHA 1910.178)", status: "approved", enables: "fl04-inspect", covers: 2 },
    ],
  },
  {
    id: "rka",
    code: "RK-A",
    name: "Racking, row A",
    locationId: "warehouse",
    category: "Storage rack",
    ownerId: "jo",
    lastWorkOrders: [],
    docs: [{ id: "d-rk-insp", type: "audit", ref: "AUD-0014", title: "Monthly rack inspection", status: "approved", enables: "rka-inspect", covers: 4 }],
  },
  {
    id: "hp04",
    code: "HP-04",
    name: "Hydraulic Press 4",
    locationId: "press",
    category: "Hydraulic press, 150 t",
    ownerId: "dan",
    aiHint: "Open incident: hand laceration",
    aiHintTone: "event",
    lastWorkOrders: [
      { ref: "WO-1003", title: "Light curtain failed self-test", date: "Oct 6" },
      { ref: "WO-0988", title: "Light curtain fault, reset", date: "Sep 21" },
    ],
    docs: [
      { id: "d-hp4-jha", type: "jha", ref: "JHA-0020", title: "Hydraulic press operation", status: "approved" },
      { id: "d-hp4-sop-die", type: "sop", ref: "SOP-0044", title: "Press 4 die change", status: "approved", enables: "hp04-die" },
      { id: "d-hp4-sop-clean", type: "sop", ref: "SOP-0045", title: "Press 4 cleaning", status: "approved", enables: "hp04-clean" },
      {
        id: "d-hp4-loto",
        type: "loto",
        ref: "LOTO-0017",
        title: "LOTO: 150 t Hydraulic Press #4",
        status: "approved",
        match: { reason: "Title names Press #4 and its 150 t rating", confidence: "high" },
      },
      { id: "d-hp4-ptw", type: "ptw", ref: "PTW-0006", title: "Work inside the press guard area", status: "approved" },
      { id: "d-hp4-insp", type: "audit", ref: "AUD-0021", title: "Press 4 daily guard and e-stop check", status: "approved", enables: "hp04-inspect" },
      { id: "d-hp4-sds", type: "sds", ref: "SDS-0090", title: "Hydraulic oil ISO 46", status: "approved" },
    ],
  },
  {
    id: "hp07",
    code: "HP-07",
    name: "Hydraulic Press 7",
    locationId: "press",
    category: "Hydraulic press, 200 t",
    ownerId: "dan",
    aiHint: "Only a JHA: no SOP, LOTO or permit yet",
    aiHintTone: "gap",
    lastWorkOrders: [
      { ref: "WO-1036", title: "Oil leak at return hose", date: "Oct 1" },
      { ref: "WO-0975", title: "Annual hydraulic service", date: "Jul 30" },
    ],
    docs: [{ id: "d-hp7-jha", type: "jha", ref: "JHA-0021", title: "Hydraulic Press 7 operation", status: "approved" }],
  },
  {
    id: "cv12",
    code: "CV-12",
    name: "Conveyor 12",
    locationId: "pack2",
    category: "Belt conveyor",
    ownerId: "dan",
    aiHint: "Open incident: e-stop button broken",
    aiHintTone: "event",
    lastWorkOrders: [{ ref: "WO-1029", title: "Belt tracking adjustment", date: "Sep 24" }],
    docs: [
      { id: "d-cv-jha", type: "jha", ref: "JHA-0030", title: "Conveyor operation and clearing jams", status: "approved" },
      { id: "d-cv-sop", type: "sop", ref: "SOP-0051", title: "Belt tracking adjustment", status: "approved", enables: "cv12-tracking" },
      {
        id: "d-cv-loto",
        type: "loto",
        ref: "LOTO-0022",
        title: "LOTO: Conveyor 12, Pack Line 2",
        status: "approved",
        match: { reason: "Title names Conveyor 12 and its line", confidence: "high" },
      },
      { id: "d-cv-insp", type: "audit", ref: "AUD-0025", title: "Monthly guarding and e-stop inspection", status: "approved", enables: "cv12-inspect" },
    ],
  },
  {
    id: "wr2",
    code: "WR-2",
    name: "Stretch wrapper 2",
    locationId: "pack2",
    category: "Packaging machine",
    ownerId: "dan",
    lastWorkOrders: [],
    docs: [{ id: "d-wr-jha", type: "jha", ref: "JHA-0031", title: "Stretch wrapper operation", status: "approved" }],
  },
  {
    id: "ac2",
    code: "AC-2",
    name: "Air compressor 2",
    locationId: "shop",
    category: "Rotary screw compressor",
    ownerId: "dan",
    aiHint: "Pressure vessel inspection due in 5 days",
    aiHintTone: "due",
    lastWorkOrders: [{ ref: "WO-1011", title: "Replace air filter", date: "Sep 9" }],
    docs: [
      {
        id: "d-ac-loto",
        type: "loto",
        ref: "LOTO-0009",
        title: "LOTO: Ingersoll Rand R55 compressor",
        status: "approved",
        match: { reason: "Model R55 matches the asset record, and there is one R55 in the plant", confidence: "medium" },
      },
      { id: "d-ac-insp", type: "audit", ref: "AUD-0030", title: "Pressure vessel inspection", status: "approved", enables: "ac2-inspect" },
      { id: "d-ac-sds", type: "sds", ref: "SDS-0071", title: "Compressor oil", status: "approved" },
    ],
  },
  {
    id: "bs1",
    code: "BS-1",
    name: "Band saw 1",
    locationId: "shop",
    category: "Band saw",
    ownerId: "dan",
    lastWorkOrders: [],
    docs: [
      { id: "d-bs-jha", type: "jha", ref: "JHA-0040", title: "Band saw operation", status: "approved" },
      { id: "d-bs-sop", type: "sop", ref: "SOP-0060", title: "Blade change", status: "in_review", enables: "bs1-blade" },
    ],
  },
  {
    id: "dl2",
    code: "DL-2",
    name: "Dock leveler 2",
    locationId: "dock",
    category: "Hydraulic dock leveler",
    ownerId: "jo",
    lastWorkOrders: [],
    docs: [
      { id: "d-dl-jha", type: "jha", ref: "JHA-0050", title: "Dock leveler operation", status: "approved" },
      {
        id: "d-dl-loto",
        type: "loto",
        ref: "LOTO-0030",
        title: "LOTO: Dock leveler #2",
        status: "approved",
        match: { reason: "Title names Dock leveler #2", confidence: "high" },
      },
      { id: "d-dl-insp", type: "audit", ref: "AUD-0033", title: "Quarterly dock leveler inspection", status: "approved", enables: "dl2-inspect" },
    ],
  },
];

export const asset = (id: string) => ASSETS.find((a) => a.id === id);

/** Documents the AI found for an asset by reading titles, not yet linked in Safety. */
export const DOC_MATCHES = ASSETS.flatMap((a) => a.docs.filter((d) => d.match).map((d) => ({ asset: a, doc: d })));

/** A document counts as on file for the asset only once it is linked. */
export const isLinked = (doc: SafetyDoc, linkedDocIds: string[]) => !doc.match || linkedDocIds.includes(doc.id);

/** Assets the AI puts on top, in this order. */
export const SUGGESTED_ASSET_IDS = ["fl03", "hp07", "cv12", "ac2"];

const cleanChecklist = [
  "Park on level ground, lower forks, set the brake and remove the key",
  "Disconnect the battery and cap the connector",
  "Put on goggles and nitrile gloves (SDS-0118)",
  "Apply degreaser to mast and carriage, keep away from the battery compartment",
  "Rinse with low pressure water, never on the controls",
  "Dry, reconnect the battery and run the pre-use inspection",
  "Photo of the clean mast and of the reconnected battery",
];

export const JOBS: ExecutionJob[] = [
  {
    id: "fl03-clean",
    assetId: "fl03",
    verb: "Clean",
    title: "Clean Forklift 3",
    basedOn: ["d-fl-sop-clean", "d-fl-jha", "d-fl-sds-degr"],
    reason: "SOP-0031 describes how to clean and degrease this forklift.",
    when: "Tomorrow, 07:00",
    woRef: "WO-1052",
    assigneeId: "carlos",
    checklist: cleanChecklist,
    plan: [
      {
        id: "p1",
        kind: "ptw",
        title: "Permit to Work: chemical cleaning, Forklift 3",
        detail: "Needs 2 approvals before the work starts",
        meta: ["Approvers: Maria Lopez, Dan Brooks", "Valid tomorrow 07:00 to 11:00"],
        why: "SOP-0031 step 4 requires a permit when degreaser is used near the battery compartment.",
        isNew: true,
      },
      {
        id: "p2",
        kind: "wo",
        title: "Work order WO-1052: Clean Forklift 3",
        detail: "Tomorrow 07:00 · Carlos Rivera · Medium priority",
        meta: ["Checklist with 7 steps built from SOP-0031", "Estimated 45 min"],
        isNew: true,
      },
      {
        id: "p3",
        kind: "attach",
        title: "Documents attached to the work order",
        detail: "SOP-0031, the new permit, JHA-0012 and SDS-0118 (degreaser)",
        meta: ["The technician opens them from the work order"],
        isNew: false,
      },
      {
        id: "p4",
        kind: "note",
        title: "No LOTO on file for this forklift",
        detail: "SOP-0031 steps 1 and 2 cover key removal and battery disconnect, so the job can go ahead",
        meta: [],
        why: "Forklifts are usually de-energized by key and battery, not a lockout procedure.",
        isNew: false,
      },
      {
        id: "p5",
        kind: "notify",
        title: "Send the work order to Carlos's phone",
        detail: "Text message with the link, once the permit is approved",
        meta: ["(555) 014-2290"],
        isNew: true,
      },
    ],
  },
  {
    id: "fl03-inspect",
    assetId: "fl03",
    verb: "Inspect",
    title: "Run the pre-use inspection on Forklift 3",
    basedOn: ["d-fl-insp", "d-fl-jha"],
    reason: "AUD-0009 is due today for this forklift.",
    when: "Today, now",
    woRef: "WO-1053",
    assigneeId: "carlos",
    checklist: [
      "Forks, mast and chains: no cracks or bends",
      "Hydraulic hoses: no leaks",
      "Tires and wheels: no damage",
      "Horn, lights and backup alarm work",
      "Seat belt latches",
      "Brakes and parking brake hold",
      "Battery: no corrosion, cables secure",
      "Data plate readable",
    ],
    plan: [
      {
        id: "p1",
        kind: "wo",
        title: "Work order WO-1053: Pre-use inspection, Forklift 3",
        detail: "Today · Carlos Rivera · 8 items from AUD-0009",
        meta: ["Photo required on hoses and forks", "A failed item opens a repair work order"],
        isNew: true,
      },
      {
        id: "p2",
        kind: "attach",
        title: "Documents attached to the work order",
        detail: "AUD-0009 and JHA-0012",
        meta: [],
        isNew: false,
      },
      {
        id: "p3",
        kind: "notify",
        title: "Send the work order to Carlos's phone",
        detail: "Text message with the link",
        meta: ["(555) 014-2290"],
        isNew: true,
      },
    ],
  },
  {
    id: "fl03-battery",
    assetId: "fl03",
    verb: "Service",
    title: "Charge and water the battery of Forklift 3",
    basedOn: ["d-fl-sop-batt", "d-fl-sds-acid"],
    reason: "SOP-0032 covers battery charging and watering.",
    when: "Tomorrow, 14:00",
    woRef: "WO-1054",
    assigneeId: "tom",
    checklist: [
      "Wear face shield, apron and acid gloves (SDS-0104)",
      "Charge in the ventilated charging area only",
      "Check electrolyte level after charging",
      "Top up with distilled water to the indicator",
      "Photo of the electrolyte indicator",
    ],
    plan: [
      {
        id: "p1",
        kind: "wo",
        title: "Work order WO-1054: Battery service, Forklift 3",
        detail: "Tomorrow 14:00 · Tom Becker",
        meta: ["5 steps from SOP-0032"],
        isNew: true,
      },
      {
        id: "p2",
        kind: "attach",
        title: "Documents attached to the work order",
        detail: "SOP-0032 and SDS-0104 (sulfuric acid)",
        meta: [],
        isNew: false,
      },
    ],
  },
  {
    id: "hp04-clean",
    assetId: "hp04",
    verb: "Clean",
    title: "Clean Hydraulic Press 4",
    basedOn: ["d-hp4-sop-clean", "d-hp4-loto", "d-hp4-ptw", "d-hp4-jha"],
    reason: "SOP-0045 requires LOTO-0017 and a permit for work inside the guard.",
    when: "Tomorrow, 07:00",
    woRef: "WO-1055",
    assigneeId: "carlos",
    checklist: [
      "Apply LOTO-0017: electrical, hydraulic accumulator and ram block",
      "Verify zero energy: try to start, check gauge at 0 psi",
      "Remove scrap and wipe the bed",
      "Clean the light curtain lenses",
      "Remove locks, restore guards, test light curtain",
      "Photo of the locks applied and of the clean bed",
    ],
    plan: [
      {
        id: "p1",
        kind: "ptw",
        title: "Permit to Work: work inside the press guard area",
        detail: "Issued from PTW-0006, needs 2 approvals",
        meta: ["Approvers: Maria Lopez, Dan Brooks", "Valid tomorrow 07:00 to 10:00"],
        isNew: true,
      },
      {
        id: "p2",
        kind: "wo",
        title: "Work order WO-1055: Clean Hydraulic Press 4",
        detail: "Tomorrow 07:00 · Carlos Rivera",
        meta: ["6 steps from SOP-0045 and LOTO-0017", "Photo required at lockout"],
        isNew: true,
      },
      {
        id: "p3",
        kind: "attach",
        title: "Documents attached to the work order",
        detail: "SOP-0045, LOTO-0017, the new permit and JHA-0020",
        meta: [],
        isNew: false,
      },
    ],
  },
  {
    id: "cv12-tracking",
    assetId: "cv12",
    verb: "Adjust",
    title: "Adjust the belt tracking on Conveyor 12",
    basedOn: ["d-cv-sop", "d-cv-loto", "d-cv-jha"],
    reason: "SOP-0051 with LOTO-0022.",
    when: "Today, 13:00",
    woRef: "WO-1056",
    assigneeId: "tom",
    checklist: [
      "Apply LOTO-0022 at the main disconnect",
      "Adjust the take-up screws a quarter turn at a time",
      "Remove locks and run empty for 2 minutes",
      "Photo of the belt centered on the tail pulley",
    ],
    plan: [
      {
        id: "p1",
        kind: "wo",
        title: "Work order WO-1056: Belt tracking, Conveyor 12",
        detail: "Today 13:00 · Tom Becker",
        meta: ["4 steps from SOP-0051 and LOTO-0022"],
        isNew: true,
      },
      {
        id: "p2",
        kind: "attach",
        title: "Documents attached to the work order",
        detail: "SOP-0051, LOTO-0022 and JHA-0030",
        meta: [],
        isNew: false,
      },
    ],
  },
  {
    id: "ac2-inspect",
    assetId: "ac2",
    verb: "Inspect",
    title: "Pressure vessel inspection on Air compressor 2",
    basedOn: ["d-ac-insp", "d-ac-loto"],
    reason: "AUD-0030 is due on Oct 21 (yearly).",
    when: "Wed Oct 21, 09:00",
    woRef: "WO-1057",
    assigneeId: "tom",
    checklist: [
      "Apply LOTO-0009 and bleed the receiver to 0 psi",
      "Check the vessel shell for corrosion and dents",
      "Test the safety relief valve",
      "Check the data plate and the last hydro test date",
      "Photo of the gauge at 0 psi and of the relief valve tag",
    ],
    plan: [
      {
        id: "p1",
        kind: "wo",
        title: "Work order WO-1057: Pressure vessel inspection, Air compressor 2",
        detail: "Wed Oct 21 09:00 · Tom Becker · 5 items from AUD-0030",
        meta: ["LOTO-0009 attached", "Photo required at 0 psi"],
        isNew: true,
      },
      {
        id: "p2",
        kind: "attach",
        title: "Documents attached to the work order",
        detail: "AUD-0030, LOTO-0009 and SDS-0071",
        meta: [],
        isNew: false,
      },
    ],
  },
  {
    id: "hp07-monthly",
    assetId: "hp07",
    verb: "Plan",
    title: "Clean Hydraulic Press 7 every last Friday of the month",
    basedOn: ["d-hp7-jha"],
    reason: "Press 7 only has a JHA, so the AI drafts the missing documents first.",
    when: "Every last Friday, 07:00",
    woRef: "PM-0210",
    assigneeId: "carlos",
    checklist: [
      "Apply the new LOTO: electrical 480 V, hydraulic accumulator, ram block",
      "Verify zero energy",
      "Clean the bed, die area and light curtain lenses",
      "Inspect hoses for leaks (open WO-1036 was a return hose leak)",
      "Remove locks, restore guards, test light curtain",
      "Photo of locks applied and of the clean press",
    ],
    recurring: {
      rule: "Monthly, last Friday, 07:00 to 10:00",
      next: [
        { date: "Fri, Oct 30" },
        { date: "Fri, Nov 27" },
        { date: "Thu, Dec 24", note: "Dec 25 is a holiday, moved one day earlier" },
      ],
    },
    plan: [
      {
        id: "p1",
        kind: "sop",
        title: "New SOP: Hydraulic Press 7 cleaning",
        detail: "Draft written from JHA-0021 and the asset manual, sent to Maria Lopez for approval",
        meta: ["6 steps", "Draft until approved"],
        isNew: true,
      },
      {
        id: "p2",
        kind: "loto",
        title: "New LOTO: Hydraulic Press 7 energy isolation",
        detail: "Electrical 480 V, hydraulic accumulator, gravity (ram block)",
        meta: ["Approvers: Maria Lopez, Dan Brooks", "Draft until approved"],
        why: "OSHA 1910.147 requires a written energy control procedure for servicing this machine.",
        isNew: true,
      },
      {
        id: "p3",
        kind: "ptw",
        title: "Permit template: Press 7 cleaning",
        detail: "A new permit is issued from this template for every occurrence",
        meta: ["Approvers: Maria Lopez, Dan Brooks"],
        isNew: true,
      },
      {
        id: "p4",
        kind: "pm",
        title: "Preventive maintenance PM-0210 in the CMMS",
        detail: "Every last Friday at 07:00 · Carlos Rivera · creates a work order each time",
        meta: ["Each work order carries the SOP, the LOTO and that day's permit", "Next: Oct 30, Nov 27, Dec 24"],
        why: "Dec 25 is a company holiday, so December moves to Thu Dec 24.",
        isNew: true,
      },
    ],
  },
];

export const job = (id: string) => JOBS.find((j) => j.id === id);
export const jobsForAsset = (assetId: string) => JOBS.filter((j) => j.assetId === assetId && !j.recurring);

/** Very small scripted "understanding" of what the person typed. */
export function interpretPrompt(text: string): { jobId?: string; assetId?: string; reply: string } {
  const t = text.toLowerCase();
  const mentions = (...words: string[]) => words.some((w) => t.includes(w));
  if (mentions("every", "last friday", "monthly", "each month", "all year", "year")) {
    return {
      jobId: "hp07-monthly",
      assetId: "hp07",
      reply: "Found Hydraulic Press 7 on the Press Line. It only has a JHA, so I drafted the SOP, LOTO and permit first, then a monthly PM that carries all three.",
    };
  }
  if (mentions("press 4", "hp-04", "hp04")) {
    return { jobId: "hp04-clean", assetId: "hp04", reply: "Hydraulic Press 4 has an SOP, a LOTO and a permit for this. Here is the plan." };
  }
  if (mentions("press 7", "hp-07", "hp07", "press")) {
    return { jobId: "hp07-monthly", assetId: "hp07", reply: "Hydraulic Press 7 only has a JHA. I drafted what is missing and a monthly plan." };
  }
  if (mentions("conveyor", "belt", "cv-12", "cv12")) {
    return { jobId: "cv12-tracking", assetId: "cv12", reply: "Conveyor 12 has SOP-0051 and LOTO-0022 for belt tracking. Here is the plan." };
  }
  if (mentions("inspect", "inspection", "pre-use", "check")) {
    return { jobId: "fl03-inspect", assetId: "fl03", reply: "Forklift 3 has its pre-use inspection due today. Here is the plan." };
  }
  if (mentions("battery", "charge")) {
    return { jobId: "fl03-battery", assetId: "fl03", reply: "SOP-0032 covers battery charging for Forklift 3. Here is the plan." };
  }
  if (mentions("clean", "wash", "degrease", "forklift")) {
    return { jobId: "fl03-clean", assetId: "fl03", reply: "Forklift 3 has SOP-0031 for cleaning. It asks for a permit when degreaser is used, so I added one." };
  }
  return { reply: "Tell me the asset or the job, for example \"clean Forklift 3 tomorrow\"." };
}

export const PROMPT_EXAMPLES = [
  "Clean Forklift 3 tomorrow morning",
  "Every last Friday of the month, clean Hydraulic Press 7",
  "Inspect Forklift 3",
];

// ---------------------------------------------------------------------------
// Case C: events and what should happen next
// ---------------------------------------------------------------------------

export const EVENTS: SafetyEventDemo[] = [
  {
    id: "ev-2041",
    ref: "EVT-2041",
    title: "Operator's hand caught at Press 4, laceration with stitches",
    description:
      "During the die change the operator reached past the light curtain to clear a slug. The ram cycled and cut the back of his left hand. Taken to the clinic, 4 stitches.",
    type: "Incident",
    severity: "High",
    locationId: "press",
    assetId: "hp04",
    reportedBy: "Luis Ortega (QR code, no login)",
    reportedVia: "QR code",
    reportedAt: "Today, 09:12",
    oshaRecordable: true,
    aiSummary: "Laceration closed with stitches is medical treatment beyond first aid, so this is OSHA recordable. The light curtain on Press 4 failed its self-test twice in the last 30 days (WO-0988, WO-1003).",
    aiRecommendation: "A CAPA, a work order and an OSHA 300 entry are required.",
    steps: [
      { key: "reported", label: "Reported", requirement: "done" },
      { key: "capa", label: "CAPA", requirement: "required" },
      { key: "wo", label: "Work order", requirement: "required" },
      { key: "osha", label: "OSHA log", requirement: "required" },
    ],
    options: [
      {
        id: "o1",
        title: "Replace the light curtain on Press 4",
        controlLevel: "engineering",
        why: "It failed its self-test on Sep 21 and Oct 6. A working guard would have stopped the ram.",
        workOrder: { title: "Replace light curtain, Press 4", assigneeId: "dan", due: "In 2 days" },
      },
      {
        id: "o2",
        title: "Add a daily light curtain test to the Press 4 guard check",
        controlLevel: "engineering",
        why: "AUD-0021 checks the e-stop but not the light curtain response.",
        sideEffect: "Adds an item to AUD-0021 (sent for approval)",
      },
      {
        id: "o3",
        title: "Retrain Press Line operators on the die change SOP and LOTO",
        controlLevel: "administrative",
        why: "Clearing a slug inside the guard should be done under LOTO-0017 (SOP-0044 step 3).",
        sideEffect: "Training task for 6 operators, due in 14 days",
      },
    ],
    capaDefaults: { ownerId: "dan", due: "Oct 23", priority: "High", type: "Corrective" },
    osha: { caseNumber: "2026-014", classification: "Other recordable case", injury: "Laceration, left hand", daysAway: 0 },
    verifyEvidence: "Photo on WO-1061 shows the new light curtain; the self-test log reads PASS.",
  },
  {
    id: "ev-2040",
    ref: "EVT-2040",
    title: "Emergency stop button broken on Conveyor 12",
    description: "The red e-stop mushroom head is cracked and does not latch when pressed. Line kept running.",
    type: "Incident",
    severity: "High",
    locationId: "pack2",
    assetId: "cv12",
    reportedBy: "Priya Shah (QR code, no login)",
    reportedVia: "QR code",
    reportedAt: "Today, 07:48",
    oshaRecordable: false,
    aiSummary: "No one was hurt, but the conveyor has no working emergency stop. Nothing is recordable.",
    aiRecommendation: "A CAPA and a work order are required. No OSHA entry.",
    steps: [
      { key: "reported", label: "Reported", requirement: "done" },
      { key: "capa", label: "CAPA", requirement: "required" },
      { key: "wo", label: "Work order", requirement: "required" },
      { key: "osha", label: "OSHA log", requirement: "not_needed" },
    ],
    options: [
      {
        id: "o1",
        title: "Lock out Conveyor 12 until the button is replaced",
        controlLevel: "immediate",
        why: "Running a conveyor without a working e-stop is not allowed. LOTO-0022 is on file.",
        workOrder: { title: "Apply LOTO-0022 and tag out Conveyor 12", assigneeId: "tom", due: "Now" },
      },
      {
        id: "o2",
        title: "Replace the e-stop button",
        controlLevel: "engineering",
        why: "The part is in stock (2 in the storeroom).",
        workOrder: { title: "Replace e-stop button, Conveyor 12", assigneeId: "tom", due: "Today" },
      },
      {
        id: "o3",
        title: "Add an e-stop function test to the monthly guarding inspection",
        controlLevel: "administrative",
        why: "AUD-0025 checks that the button is present, not that it latches.",
        sideEffect: "Adds an item to AUD-0025 (sent for approval)",
      },
    ],
    capaDefaults: { ownerId: "dan", due: "Oct 23", priority: "High", type: "Corrective" },
    verifyEvidence: "Photo on the work order shows the new button latched; test logged.",
  },
  {
    id: "ev-2039",
    ref: "EVT-2039",
    title: "Forklift nearly hit a pedestrian at Dock door 2",
    description: "Forklift 4 came out of the trailer in reverse while a driver walked to the office. Missed by about 1 meter.",
    type: "Near miss",
    severity: "Medium",
    locationId: "dock",
    assetId: "fl04",
    reportedBy: "Jo Park",
    reportedVia: "Mobile",
    reportedAt: "Yesterday, 16:30",
    oshaRecordable: false,
    aiSummary: "Third near miss at the docks in 60 days, all with pedestrians crossing behind a reversing forklift.",
    aiRecommendation: "A CAPA is recommended. A work order is optional.",
    steps: [
      { key: "reported", label: "Reported", requirement: "done" },
      { key: "capa", label: "CAPA", requirement: "recommended" },
      { key: "wo", label: "Work order", requirement: "optional" },
      { key: "osha", label: "OSHA log", requirement: "not_needed" },
    ],
    options: [
      {
        id: "o1",
        title: "Paint a pedestrian walkway and add a convex mirror at Dock door 2",
        controlLevel: "engineering",
        why: "Separates people from forklift traffic where the 3 near misses happened.",
        workOrder: { title: "Walkway paint and mirror, Dock door 2", assigneeId: "carlos", due: "In 7 days" },
      },
      {
        id: "o2",
        title: "Install a blue spot light on Forklifts 3 and 4",
        controlLevel: "engineering",
        why: "Warns pedestrians before the forklift comes out of a trailer.",
        workOrder: { title: "Install blue spot lights, FL-03 and FL-04", assigneeId: "tom", due: "In 7 days" },
      },
      {
        id: "o3",
        title: "Refresh the dock traffic rules with drivers and visitors",
        controlLevel: "administrative",
        why: "Visitors walk from trucks to the office through the dock.",
        sideEffect: "Toolbox talk at the next shift start",
      },
    ],
    capaDefaults: { ownerId: "jo", due: "Oct 30", priority: "Medium", type: "Preventive" },
    verifyEvidence: "Photo shows the painted walkway and mirror.",
  },
  {
    id: "ev-2038",
    ref: "EVT-2038",
    title: "Oil leak under Hydraulic Press 7",
    description: "Puddle of hydraulic oil under the rear of Press 7, about 30 cm wide.",
    type: "Hazard",
    severity: "Medium",
    locationId: "press",
    assetId: "hp07",
    reportedBy: "Carlos Rivera",
    reportedVia: "QR code",
    reportedAt: "Yesterday, 11:05",
    oshaRecordable: false,
    aiSummary: "Same return hose leaked on Oct 1 (WO-1036). Slip hazard and possible repeat failure.",
    aiRecommendation: "A work order is required. A CAPA is optional.",
    steps: [
      { key: "reported", label: "Reported", requirement: "done" },
      { key: "capa", label: "CAPA", requirement: "optional" },
      { key: "wo", label: "Work order", requirement: "required" },
      { key: "osha", label: "OSHA log", requirement: "not_needed" },
    ],
    options: [
      {
        id: "o1",
        title: "Replace the return hose and clean the spill",
        controlLevel: "engineering",
        why: "Second leak on the same hose in 3 weeks.",
        workOrder: { title: "Replace return hose and clean spill, Press 7", assigneeId: "carlos", due: "Today" },
      },
      {
        id: "o2",
        title: "Add the hoses to the monthly cleaning PM of Press 7",
        controlLevel: "administrative",
        why: "Catches wear before it leaks.",
        sideEffect: "Adds a checklist item to the Press 7 PM",
      },
      {
        id: "o3",
        title: "Place a spill kit at the Press Line",
        controlLevel: "ppe",
        why: "The closest spill kit is in the warehouse.",
        workOrder: { title: "Stock a spill kit at the Press Line", assigneeId: "tom", due: "In 3 days" },
      },
    ],
    capaDefaults: { ownerId: "dan", due: "Oct 30", priority: "Medium", type: "Corrective" },
    verifyEvidence: "Photo shows the new hose and a dry floor.",
  },
  {
    id: "ev-2037",
    ref: "EVT-2037",
    title: "Light out in aisle 7",
    description: "One of the LED fixtures above aisle 7 is off. Aisle still lit by the others.",
    type: "Observation",
    severity: "Low",
    locationId: "warehouse",
    reportedBy: "Anonymous (QR code)",
    reportedVia: "QR code",
    reportedAt: "Yesterday, 08:20",
    oshaRecordable: false,
    aiSummary: "Aisle still meets lighting levels with the other fixtures. No one at risk.",
    aiRecommendation: "No CAPA needed. Close it, or send a routine work order to replace the fixture.",
    steps: [
      { key: "reported", label: "Reported", requirement: "done" },
      { key: "capa", label: "CAPA", requirement: "not_needed" },
      { key: "wo", label: "Work order", requirement: "optional" },
      { key: "osha", label: "OSHA log", requirement: "not_needed" },
    ],
    options: [],
  },
];

export const event = (id: string) => EVENTS.find((e) => e.id === id);

export const CONTROL_LABEL: Record<string, string> = {
  immediate: "Immediate",
  elimination: "Elimination",
  engineering: "Engineering control",
  administrative: "Administrative",
  ppe: "PPE / housekeeping",
};
