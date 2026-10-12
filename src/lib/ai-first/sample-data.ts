// Scripted "AI" outputs and seed data for the AI-first prototypes.
// The prototype never calls a model: every result below is hand-written so the flows are repeatable.

import type { AiFieldValue, Capa, InboxItem, Pin, PlanCapa, Report, WorkOrder } from "./types";

export const SCENES = {
  spill: { src: "/ai-first/scene-spill.svg", label: "Liquid spill in Aisle 4 (sample photo)" },
  forkliftBay: { src: "/ai-first/scene-forklift-bay.svg", label: "Forklift bay (sample photo)" },
};

export const ACCESS_POINT = {
  code: "AP-114",
  name: "Warehouse B · Aisle 4",
  location: "Warehouse B › Aisle 4 › Rack 4B",
};

export const PEOPLE = {
  reporter: "Luis Ramírez (operator)",
  supervisor: "Priya Shah (Warehouse supervisor)",
  maintenance: "Marcus Lee (Maintenance tech)",
  ehs: "Dana Ortiz (EHS manager)",
};

// ---------------------------------------------------------------- P1 / P10: photo report

export const SPILL_PINS: Pin[] = [
  { id: 1, x: 48, y: 75, label: "Dark liquid pooled across the forklift lane (~1.5 m)", kind: "hazard" },
  { id: 2, x: 24, y: 72, label: "No cones, sign or absorbent visible near the spill", kind: "hazard" },
  { id: 3, x: 75, y: 67, label: "Drip trail leads to parked forklift FL-07: possible hydraulic leak", kind: "review" },
  { id: 4, x: 11, y: 62, label: "Fire extinguisher mounted and unobstructed", kind: "positive" },
];

export const VOICE_NOTES = {
  en: {
    language: "English",
    transcript: "Hey, there's oil all over aisle four, I almost slipped when I came around the rack.",
  },
  es: {
    language: "Spanish",
    transcript: "Hay aceite en todo el pasillo cuatro, casi me resbalo al pasar el estante.",
    translation: "There's oil all over aisle four, I almost slipped when I came around the rack.",
  },
};

export function spillDraftFields(withVoice: boolean): AiFieldValue[] {
  const voiceSource = withVoice ? "Voice note: “I almost slipped”" : "Photo only";
  return [
    {
      key: "type",
      label: "Type",
      value: withVoice ? "Near miss" : "Hazard observation",
      aiValue: withVoice ? "Near miss" : "Hazard observation",
      confidence: withVoice ? 0.84 : 0.71,
      source: voiceSource,
    },
    {
      key: "title",
      label: "Title",
      value: "Oil spill across forklift lane, Aisle 4",
      aiValue: "Oil spill across forklift lane, Aisle 4",
      confidence: 0.88,
      source: "Photo · pins 1 and 3",
    },
    {
      key: "description",
      label: "What happened",
      value:
        "Dark liquid pooled about 1.5 m across the forklift travel lane next to rack 4B. No cones, sign or absorbent nearby. A drip trail leads to the parked forklift FL-07." +
        (withVoice ? " Reporter almost slipped when coming around the rack." : ""),
      aiValue:
        "Dark liquid pooled about 1.5 m across the forklift travel lane next to rack 4B. No cones, sign or absorbent nearby. A drip trail leads to the parked forklift FL-07." +
        (withVoice ? " Reporter almost slipped when coming around the rack." : ""),
      confidence: 0.81,
      source: withVoice ? "Photo · pins 1–3 + voice note" : "Photo · pins 1–3",
      multiline: true,
    },
    {
      key: "location",
      label: "Location",
      value: ACCESS_POINT.location,
      aiValue: ACCESS_POINT.location,
      confidence: 0.97,
      source: `Access Point QR ${ACCESS_POINT.code}`,
    },
    {
      key: "asset",
      label: "Asset",
      value: "Forklift FL-07 (Toyota 8FGU25)",
      aiValue: "Forklift FL-07 (Toyota 8FGU25)",
      confidence: 0.62,
      source: "Photo pin 3 + assets registered near AP-114",
    },
    {
      key: "hazards",
      label: "Hazards",
      value: "Slip and fall · Forklift skid · Possible hydraulic fluid",
      aiValue: "Slip and fall · Forklift skid · Possible hydraulic fluid",
      confidence: 0.79,
      source: "Photo · pins 1–3",
    },
  ];
}

export const SEVERITY_SUGGESTION = { value: "Medium", confidence: 0.58 };

// The questions the AI asks only when it could not infer the answer (max 3).
export const QUICK_QUESTIONS = [
  {
    key: "injury" as const,
    text: "Was anyone hurt?",
    textAfterVoice: "You said you almost slipped. Just to confirm: was anyone hurt?",
    why: "Decides if this is an injury case (OSHA screening).",
  },
  {
    key: "treatment" as const,
    text: "Did they need treatment beyond first aid?",
    textAfterVoice: "Did they need treatment beyond first aid?",
    why: "Medical treatment beyond first aid can make a case recordable (29 CFR 1904.7).",
    onlyIf: "injury_yes",
  },
  {
    key: "stopped" as const,
    text: "Is the area or the forklift out of use right now?",
    textAfterVoice: "Is the area or the forklift out of use right now?",
    why: "Tells maintenance how urgent the work order is.",
  },
];

// ---------------------------------------------------------------- Seeded event used by P3 and P8

export const SEED_REPORT: Report = {
  id: "R-1042",
  createdAt: "2026-10-09T08:12:00",
  channel: "photo",
  type: "near_miss",
  title: "Oil spill across forklift lane, Aisle 4",
  description:
    "Dark liquid pooled about 1.5 m across the forklift travel lane next to rack 4B. No cones, sign or absorbent nearby. A drip trail leads to the parked forklift FL-07. Reporter almost slipped when coming around the rack.",
  location: ACCESS_POINT.location,
  asset: "Forklift FL-07 (Toyota 8FGU25)",
  severity: "medium",
  severityConfidence: 0.58,
  hazards: ["Slip and fall", "Forklift skid", "Possible hydraulic fluid"],
  answers: { injury: "no", stopped: "yes" },
  photo: SCENES.spill.src,
  pins: SPILL_PINS,
  reporter: PEOPLE.reporter,
  language: "Spanish → English",
  status: "approved",
  oshaPossible: false,
  aiTouched: ["asset"],
};

// ---------------------------------------------------------------- P3: action plan

export const ROOT_CAUSE = {
  text: "The hydraulic lift hose on FL-07 is worn and leaking. It is the third leak on this truck in 90 days, the pre-shift checklist does not ask operators to look for drips, and there is no spill kit within reach of Aisle 4.",
  sources: [
    { label: "WO-5512 · Jun 30 · “hydraulic leak FL-07, tightened fitting”", kind: "Work order history" },
    { label: "WO-5630 · Sep 2 · “oil under FL-07, topped up fluid”", kind: "Work order history" },
    { label: "SOP-FL-02 rev 3 · Forklift pre-shift checklist (no hose/drip item)", kind: "Document" },
    { label: "R-1042 · photo pins 1–3 and reporter voice note", kind: "This event" },
  ],
};

export function proposedPlan(): PlanCapa[] {
  return [
    {
      id: "plan-1",
      title: "Fix the source: replace FL-07 hydraulic hoses",
      controlLevel: "engineering",
      rationale: "Third leak in 90 days. Tightening and topping up did not hold.",
      selected: true,
      tasks: [
        {
          id: "t-1",
          kind: "work_order",
          title: "Replace lift cylinder hoses on FL-07",
          detail: "Asset FL-07 · Priority high · LOTO-FL-07 and JHA-FL-04 attached · Evidence on close: photo of new fittings",
          owner: PEOPLE.maintenance,
          due: "Oct 14",
          selected: true,
          source: "WO-5512, WO-5630",
        },
        {
          id: "t-2",
          kind: "work_order",
          title: "Check hoses on the rest of the fleet (FL-01 to FL-09)",
          detail: "8 assets · Priority medium · Same model and age as FL-07",
          owner: PEOPLE.maintenance,
          due: "Oct 24",
          selected: true,
          source: "Asset registry: same model, purchased 2019",
        },
      ],
    },
    {
      id: "plan-2",
      title: "Contain spills fast in Aisle 4",
      controlLevel: "engineering",
      rationale: "Nothing nearby to stop the spill from spreading into the lane.",
      selected: true,
      tasks: [
        {
          id: "t-3",
          kind: "work_order",
          title: "Install a spill-kit station at the end of Aisle 4",
          detail: "Location Warehouse B › Aisle 4 · Priority medium",
          owner: PEOPLE.maintenance,
          due: "Oct 17",
          selected: true,
          source: "Photo pin 2",
        },
        {
          id: "t-4",
          kind: "calendar",
          title: "Monthly spill-kit check, Warehouse B",
          detail: "Compliance calendar · Recurs on the 1st · Assigned to the area supervisor",
          owner: PEOPLE.supervisor,
          due: "Nov 1",
          selected: true,
          source: "Recommended with every new spill kit",
        },
      ],
    },
    {
      id: "plan-3",
      title: "Catch leaks before the shift starts",
      controlLevel: "administrative",
      rationale: "Operators are not asked to look for drips today.",
      selected: true,
      tasks: [
        {
          id: "t-5",
          kind: "document",
          title: "Add “hoses and drips under the truck” to the pre-shift checklist",
          detail: "SOP-FL-02 rev 3 → rev 4 · Change proposed as a tracked diff for approval",
          owner: PEOPLE.ehs,
          due: "Oct 21",
          selected: true,
          source: "SOP-FL-02 rev 3, section 2",
        },
        {
          id: "t-6",
          kind: "training",
          title: "5-minute refresher: spill response (UpKeep Learn)",
          detail: "Warehouse B operators · 14 people · Quiz generated from SOP-SP-01",
          owner: PEOPLE.supervisor,
          due: "Oct 28",
          selected: false,
          source: "SOP-SP-01 Spill response",
        },
      ],
    },
  ];
}

export function seedCapaLog(capaId: string): Capa["log"] {
  return [
    { day: 0, at: "Oct 11 · 10:02", actor: "person", text: `${PEOPLE.ehs} created the plan from R-1042.` },
    { day: 0, at: "Oct 11 · 10:02", actor: "agent", text: `Assigned WO-5701 and WO-5702 to ${PEOPLE.maintenance}. Notified by push.`, channel: "Push" },
    { day: 0, at: "Oct 11 · 10:03", actor: "agent", text: `Sent an update to the reporter: “Your report from Aisle 4 created ${capaId}. We will tell you when it is fixed.”`, channel: "WhatsApp" },
  ];
}

// Scripted agent follow-up, unlocked one step at a time with "Simulate next day".
export const AGENT_SCRIPT: { day: number; at: string; actor: "agent" | "person"; text: string; channel?: string; effect?: "close_proposed" }[] = [
  { day: 2, at: "Oct 13 · 08:00", actor: "agent", text: "Reminder to Marcus: “WO-5701 (FL-07 hoses) is due tomorrow. Reply DONE with a photo when finished.”", channel: "Push + SMS" },
  { day: 4, at: "Oct 15 · 08:00", actor: "agent", text: "WO-5701 is 1 day overdue and Marcus has not answered 2 reminders. Escalated to Priya Shah (second approver) with a 24 h timeout.", channel: "Inbox card" },
  { day: 4, at: "Oct 15 · 09:40", actor: "person", text: "Priya: “Marcus was out sick. Moved to tomorrow morning.”" },
  { day: 5, at: "Oct 16 · 11:15", actor: "person", text: "Marcus replied “DONE, hoses replaced” with 2 photos.", channel: "SMS" },
  { day: 5, at: "Oct 16 · 11:16", actor: "agent", text: "Checked the evidence against the plan: photos show new hose fittings on FL-07 (confidence 0.82), WO-5701 closed in the CMMS. Sent the reporter: “The leak on FL-07 that you reported was fixed today.”", channel: "WhatsApp" },
  { day: 7, at: "Oct 18 · 08:00", actor: "agent", text: "All selected tasks are done. Proposing to close the CAPA. Effectiveness check scheduled for Nov 17: no new leak reports on the FL fleet.", effect: "close_proposed" },
];

// ---------------------------------------------------------------- P8: supervisor queue

export const SEED_INBOX: InboxItem[] = [
  {
    id: "i-1",
    kind: "osha_check",
    title: "Laceration on left hand, Packing line 2",
    location: "Plant 1 › Packing line 2",
    createdAt: "Today · 07:48",
    reason: "Voice note mentions “stitches”. Stitches are medical treatment beyond first aid, which makes a case recordable (29 CFR 1904.7(b)(5)).",
    suggestion: "Possibly recordable · Severity: High",
    confidence: 0.77,
    risk: "high",
    needsPerson: true,
  },
  {
    id: "i-2",
    kind: "event_review",
    title: "Oil spill across forklift lane, Aisle 4",
    location: ACCESS_POINT.location,
    createdAt: "Today · 08:12",
    reason: "Severity is always a person's call. The AI is unsure between Medium and High (58%).",
    suggestion: "Near miss · Severity: Medium · Create action plan",
    confidence: 0.58,
    risk: "medium",
    needsPerson: true,
    reportId: "R-1042",
  },
  {
    id: "i-3",
    kind: "inspection_fail",
    title: "Fire extinguisher blocked by pallets, Forklift bay",
    location: "Warehouse B › Forklift bay",
    createdAt: "Today · 09:05",
    reason: "Third failure of this item in 60 days. A work order alone has not fixed it.",
    suggestion: "Create a CAPA instead of another work order",
    confidence: 0.81,
    risk: "medium",
    needsPerson: true,
  },
  {
    id: "i-4",
    kind: "capa_overdue",
    title: "CAPA-311 Mezzanine guard rail repair is 6 days overdue",
    location: "Warehouse A › Mezzanine",
    createdAt: "Yesterday · 16:30",
    reason: "The owner did not answer 2 reminders and the 48 h timeout passed.",
    suggestion: "Reassign to Marcus Lee (has capacity this week)",
    confidence: 0.7,
    risk: "medium",
    needsPerson: true,
  },
  {
    id: "i-5",
    kind: "event_review",
    title: "Positive observation: wet-floor signs used correctly at Dock 1",
    location: "Warehouse B › Dock 1",
    createdAt: "Today · 06:55",
    reason: "Low risk, nothing to decide. Acknowledge to thank the reporter.",
    suggestion: "Acknowledge and send thanks",
    confidence: 0.93,
    risk: "low",
    needsPerson: false,
  },
  {
    id: "i-6",
    kind: "event_review",
    title: "Hazard: loose anti-fatigue mat at Packing line 1 entrance",
    location: "Plant 1 › Packing line 1",
    createdAt: "Today · 07:10",
    reason: "Clear photo, no injury, simple fix. Classification and routing only.",
    suggestion: "Hazard observation · Route to Facilities",
    confidence: 0.9,
    risk: "low",
    needsPerson: false,
  },
  {
    id: "i-7",
    kind: "event_review",
    title: "Positive observation: forks lowered on all parked trucks",
    location: "Warehouse B › Forklift bay",
    createdAt: "Today · 09:05",
    reason: "Low risk, nothing to decide.",
    suggestion: "Acknowledge and count toward the bay's positive score",
    confidence: 0.95,
    risk: "low",
    needsPerson: false,
  },
];

export const AUTO_HANDLED = [
  { id: "a-1", text: "Translated 3 reports from Spanish and 1 from Vietnamese", at: "06:40" },
  { id: "a-2", text: "Merged duplicate report R-1039 into R-1038 (same spill, same location, 12 min apart)", at: "07:15" },
  { id: "a-3", text: "Sent the 2nd reminder for WO-5690 to Marcus Lee", at: "08:00" },
  { id: "a-4", text: "Tagged 4 observations with a hazard category", at: "08:30" },
];

// ---------------------------------------------------------------- P7: photo inspection

export const BAY_PINS: Pin[] = [
  { id: 1, x: 9, y: 45, label: "Fire extinguisher blocked by stacked pallets", kind: "hazard" },
  { id: 2, x: 94, y: 49, label: "Guard rail at dock edge: middle rail missing", kind: "hazard" },
  { id: 3, x: 66, y: 73, label: "Oil stain under FL-07", kind: "review" },
  { id: 4, x: 44, y: 38, label: "Possible dent on rack upright 4B", kind: "review" },
  { id: 5, x: 84, y: 17, label: "Exit sign lit and door clear", kind: "positive" },
  { id: 6, x: 49, y: 70, label: "Forks lowered while parked", kind: "positive" },
  { id: 7, x: 54, y: 40, label: "Loose cable along the FL-07 mast (not in checklist)", kind: "review" },
];

export type InspectionAnswer = "pass" | "fail" | "na" | "unseen";

export interface InspectionItem {
  id: string;
  text: string;
  ai: InspectionAnswer;
  confidence: number;
  evidence: string;
  pinId?: number;
  frame?: string; // video timestamp
  failHistory?: number; // failures in the last 60 days
}

export const INSPECTION_TEMPLATE = {
  name: "Forklift bay · weekly inspection",
  location: "Warehouse B › Forklift bay",
  regulation: "OSHA 29 CFR 1910.157, 1910.178, 1910.28",
};

export const INSPECTION_ITEMS: InspectionItem[] = [
  { id: "q1", text: "Fire extinguisher accessible and charged", ai: "fail", confidence: 0.86, evidence: "Pallets stacked in front of the extinguisher", pinId: 1, frame: "0:04", failHistory: 3 },
  { id: "q2", text: "Emergency exit clear and sign lit", ai: "pass", confidence: 0.91, evidence: "Exit sign lit, door path clear", pinId: 5, frame: "0:24" },
  { id: "q3", text: "Floor free of spills and debris", ai: "fail", confidence: 0.67, evidence: "Dark stain under FL-07: could be an old stain", pinId: 3, frame: "0:16" },
  { id: "q4", text: "Pedestrian lane marked and unobstructed", ai: "pass", confidence: 0.83, evidence: "Yellow lane visible along the bay", frame: "0:12" },
  { id: "q5", text: "Forks lowered on parked trucks", ai: "pass", confidence: 0.9, evidence: "FL-07 forks on the floor", pinId: 6, frame: "0:16" },
  { id: "q6", text: "Rack uprights free of damage", ai: "fail", confidence: 0.55, evidence: "Possible dent on upright 4B, needs a close-up", pinId: 4, frame: "0:08" },
  { id: "q7", text: "Dock edge guard rail complete", ai: "fail", confidence: 0.78, evidence: "Middle rail missing at the dock edge", pinId: 2, frame: "0:28" },
  { id: "q8", text: "Eyewash station within 10 s of battery charging", ai: "unseen", confidence: 0, evidence: "Charging area is not in the photos" },
];

export const OUT_OF_CHECKLIST = [{ pinId: 7, text: "Loose cable along the FL-07 mast", confidence: 0.6 }];

// ---------------------------------------------------------------- P5: document → program

export const SOURCE_DOC = {
  name: "Forklift_PreShift_SOP_v3.pdf",
  pages: 4,
  owner: "Warehouse B",
  passages: [
    { id: "p1", page: 1, text: "Scope: all powered industrial trucks operated in Warehouses A and B." },
    { id: "p2", page: 2, text: "Operators shall inspect the truck before each shift and record the result." },
    { id: "p3", page: 2, text: "Check: forks, mast chains, hydraulic hoses for leaks, tires, horn, lights, seat belt, data plate." },
    { id: "p4", page: 3, text: "Trucks found unsafe shall be tagged out and reported to maintenance." },
    { id: "p5", page: 3, text: "Planned maintenance per manufacturer: every 250 operating hours or monthly, whichever comes first." },
    { id: "p6", page: 4, text: "Operators must be trained and evaluated every three years (29 CFR 1910.178(l))." },
  ],
};

export const TEMPLATE_LIBRARY = [
  { id: "lib-1", name: "Forklift pre-shift inspection", regs: ["OSHA 1910.178", "NR-11 (Brazil)", "WHS Reg 2011 (AU)"], industry: "Warehousing", uses: 1240 },
  { id: "lib-2", name: "LOTO for hydraulic press", regs: ["OSHA 1910.147", "NR-12 (Brazil)"], industry: "Manufacturing", uses: 610 },
  { id: "lib-3", name: "5S area audit", regs: ["ISO 45001 8.1"], industry: "Manufacturing", uses: 980 },
  { id: "lib-4", name: "Daily safety briefing (toolbox talk)", regs: ["OSHA 1926.21"], industry: "Construction", uses: 2210 },
  { id: "lib-5", name: "Fire extinguisher monthly check", regs: ["OSHA 1910.157", "NFPA 10"], industry: "All", uses: 3020 },
  { id: "lib-6", name: "Confined space entry permit", regs: ["OSHA 1910.146", "NR-33 (Brazil)"], industry: "Utilities", uses: 450 },
];

export const REGULATIONS = ["OSHA 29 CFR 1910 (General industry)", "NR-11 / NR-12 (Brazil)", "WHS Regulations 2011 (Australia)", "ISO 45001"];

export const SEED_WORK_ORDERS: WorkOrder[] = [];

export const BASELINE_TAPS: Record<string, { taps: number; note: string }> = {
  // Rough estimates of today's flows, used only as a reference next to the live tap counter.
  report: { taps: 21, note: "Estimate: today's Access Point form with photo upload" },
  whatsapp: { taps: 21, note: "Estimate: today's Access Point form" },
  inbox: { taps: 6, note: "Per item today: open, read, set severity, assign, save, back" },
  "action-plan": { taps: 34, note: "Today: create 3 CAPAs and link 3 work orders by hand" },
  inspection: { taps: 26, note: "Today: answer 8 items, attach photos, create the WO separately" },
  "document-program": { taps: 40, note: "Today: SOP + checklist + schedule + PM set up one by one" },
};
