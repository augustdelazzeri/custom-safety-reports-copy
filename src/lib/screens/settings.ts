// Scripted data for Settings (/settings). Same people, plant and locations as the rest of the
// prototype (src/lib/three-cases/data.ts); the roles are Safety's four system roles
// (server/db/seed/roles.ts) plus one custom role. Copy from the redesign's lab.json → settings.
import { LOCATIONS, person } from "@/lib/three-cases/data";

export const COMPANY_DOMAIN = "northwind.example";

// ───────────────────────────── tabs

export type SettingsTabKey = "people" | "company" | "templates" | "locations" | "hazards" | "privacy";

/** Thiago's six tabs (lab.settings.tab / about). The two drawn for real come first. */
export const SETTINGS_TABS: { key: SettingsTabKey; label: string; about: string }[] = [
  { key: "people", label: "People & permissions", about: "Who uses Safety, the roles that decide what they can do, and their teams." },
  { key: "company", label: "Company", about: "Your organization, the regulations you follow, and how the AI should write for you." },
  { key: "templates", label: "Forms", about: "Custom event forms: which fields a report asks for, and when." },
  { key: "locations", label: "OSHA locations", about: "The establishments every OSHA case, 300A summary and agency report belongs to." },
  { key: "hazards", label: "Hazards & controls", about: "Define and categorize workplace hazards and the controls that reduce them — the lists JHAs, SOPs and permits pick from." },
  { key: "privacy", label: "Privacy", about: "How your usage data is shared. This choice is yours alone." },
];

export const NOT_IN_PROTOTYPE = "Not in this prototype yet.";

/** Low-relevance tabs: one card, one sentence, one disabled control (Kaue: a placeholder is enough). */
export interface PlaceholderSpec {
  /** The tab's main action, disabled, on the right of the tab heading. */
  action?: string;
  card: string;
  body: string;
  control: { kind: "button"; label: string } | { kind: "switch"; label: string };
  badge?: string;
}

export const PLACEHOLDERS: Record<"templates" | "locations" | "hazards" | "privacy", PlaceholderSpec> = {
  templates: {
    action: "Create form",
    card: "Standard event form",
    badge: "Built-in",
    body: "Events use the standard form until a custom one is created.",
    control: { kind: "button", label: "Preview" },
  },
  locations: {
    action: "Create OSHA location",
    card: "Springfield Plant",
    badge: "Active",
    body: "Every OSHA case, 300A summary and agency report for the plant is logged under this establishment.",
    control: { kind: "button", label: "Edit" },
  },
  hazards: {
    action: "Create hazard",
    card: "Hazards and control measures",
    body: "Seed the common hazards and the controls that reduce them, or create your own.",
    control: { kind: "button", label: "Seed defaults" },
  },
  privacy: {
    card: "Analytics and performance",
    body: "Share how you use Safety and how it performs, to help us improve it.",
    control: { kind: "switch", label: "Share usage data" },
  },
};

// ───────────────────────────── people & permissions

export type RoleId = "global_admin" | "location_admin" | "technician" | "view_only" | "safety_committee";

export interface SettingsRole {
  id: RoleId;
  name: string;
  description: string;
  system: boolean;
  permissions: number;
}

export const ROLES: SettingsRole[] = [
  {
    id: "global_admin",
    name: "Global admin",
    description: "Everything in Safety, at every location, including OSHA records and company settings.",
    system: true,
    permissions: 72,
  },
  {
    id: "location_admin",
    name: "Location admin",
    description: "Runs Safety at the locations they are given: events, CAPAs, documents and the people there. No OSHA records.",
    system: true,
    permissions: 61,
  },
  {
    id: "technician",
    name: "Technician",
    description: "Reports events, works the safety work orders assigned to them and approves the documents they are asked to.",
    system: true,
    permissions: 24,
  },
  {
    id: "view_only",
    name: "View-only",
    description: "Sees documents, CAPAs and work orders at their locations. Cannot change anything.",
    system: true,
    permissions: 18,
  },
  {
    id: "safety_committee",
    name: "Safety committee",
    description: "Reviews events and CAPAs across the plant and reads the OSHA logs, without editing them.",
    system: false,
    permissions: 21,
  },
];

export const roleName = (id: string) => ROLES.find((r) => r.id === id)?.name ?? "";

export type UserStatus = "active" | "pending" | "inactive" | "not_onboarded";

export const USER_STATUS: Record<UserStatus, { label: string; tone: "accent" | "warning" | "neutral" }> = {
  active: { label: "Active", tone: "accent" },
  pending: { label: "Invited", tone: "warning" },
  inactive: { label: "Inactive", tone: "neutral" },
  not_onboarded: { label: "Not onboarded", tone: "neutral" },
};

export interface SettingsUser {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  roleId: RoleId;
  status: UserStatus;
  /** Every location, or the ones listed (ids of LOCATIONS). */
  allLocations: boolean;
  locations: string[];
}

/** The areas of the plant a user can be given (the plant itself means "All locations"). */
export const AREAS = LOCATIONS.filter((l) => l.parentId);

const fromPerson = (id: string, rest: Omit<SettingsUser, "id" | "name" | "email" | "jobTitle">): SettingsUser => {
  const p = person(id);
  const [first, ...last] = p.name.toLowerCase().split(" ");
  return { id, name: p.name, email: `${first}.${last.join("")}@${COMPANY_DOMAIN}`, jobTitle: p.role, ...rest };
};

export const USERS: SettingsUser[] = [
  fromPerson("maria", { roleId: "global_admin", status: "active", allLocations: true, locations: [] }),
  fromPerson("aisha", { roleId: "global_admin", status: "active", allLocations: true, locations: [] }),
  fromPerson("dan", { roleId: "location_admin", status: "active", allLocations: false, locations: ["press", "shop", "dock"] }),
  fromPerson("carlos", { roleId: "technician", status: "active", allLocations: false, locations: ["press", "shop"] }),
  fromPerson("tom", { roleId: "technician", status: "active", allLocations: false, locations: ["shop"] }),
  fromPerson("jo", { roleId: "technician", status: "active", allLocations: false, locations: ["warehouse", "dock"] }),
  { id: "priya", name: "Priya Nair", email: `priya.nair@${COMPANY_DOMAIN}`, jobTitle: "Safety Coordinator", roleId: "location_admin", status: "pending", allLocations: false, locations: ["pack2", "warehouse"] },
  { id: "grace", name: "Grace Kim", email: `grace.kim@${COMPANY_DOMAIN}`, jobTitle: "Quality Lead", roleId: "safety_committee", status: "active", allLocations: true, locations: [] },
  { id: "luis", name: "Luis Ortega", email: `luis.ortega@${COMPANY_DOMAIN}`, jobTitle: "Line Operator", roleId: "view_only", status: "pending", allLocations: false, locations: ["pack2"] },
  { id: "ben", name: "Ben Carter", email: `ben.carter@${COMPANY_DOMAIN}`, jobTitle: "Shipping Clerk", roleId: "view_only", status: "not_onboarded", allLocations: false, locations: [] },
  { id: "mike", name: "Mike Sullivan", email: `mike.sullivan@${COMPANY_DOMAIN}`, jobTitle: "Maintenance Technician", roleId: "technician", status: "inactive", allLocations: false, locations: ["press"] },
];

/** A brand-new account: only the person who opened it. */
export const NEW_ACCOUNT_USERS: SettingsUser[] = USERS.filter((u) => u.id === "maria");

// ───────────────────────────── company

/** Comes from UpKeep and can only be changed there. */
export const SYNCED = [
  { label: "Organization name", value: "Northwind Manufacturing" },
  { label: "Time zone", value: "America/Chicago (CT)" },
  { label: "Locale", value: "English (United States)" },
  { label: "Logo", value: null },
];

export const COUNTRIES = ["US", "CA", "MX", "BR", "GB", "IE", "ES", "FR", "DE", "AU"];

export const INDUSTRIES: { value: string; label: string }[] = [
  { value: "manufacturing", label: "Manufacturing" },
  { value: "healthcare", label: "Healthcare" },
  { value: "food_beverage", label: "Food & beverage" },
  { value: "construction", label: "Construction" },
  { value: "chemical", label: "Chemical" },
  { value: "energy", label: "Energy" },
  { value: "oil_gas", label: "Oil & gas" },
  { value: "mining", label: "Mining" },
  { value: "transportation", label: "Transportation" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
];

export interface CompanyProfile {
  country: string;
  state: string;
  city: string;
  naicsCode: string;
  industryType: string;
  primaryLanguage: string;
  address: string;
}

export const PROFILE: CompanyProfile = {
  country: "US",
  state: "Illinois",
  city: "Springfield",
  naicsCode: "336370",
  industryType: "manufacturing",
  primaryLanguage: "en",
  address: "2400 Stevenson Dr\nSpringfield, IL 62703",
};

export const NEW_ACCOUNT_PROFILE: CompanyProfile = { country: "US", state: "", city: "", naicsCode: "", industryType: "", primaryLanguage: "en", address: "" };

export const FRAMEWORK_CATEGORY: Record<string, string> = {
  occupational_safety: "Occupational safety",
  environmental: "Environmental",
  quality_management: "Quality management",
  food_safety: "Food safety",
  fire_safety: "Fire safety",
  electrical_safety: "Electrical safety",
  process_safety: "Process safety",
  construction_safety: "Construction safety",
  general: "General",
};

export interface Framework {
  id: string;
  /** Catalog code; none for a custom framework. */
  code: string | null;
  name: string;
  description: string | null;
  category: string | null;
  region: string | null;
  url: string | null;
}

export const CATALOG: Framework[] = [
  { id: "c-1910", code: "osha_1910", name: "OSHA 29 CFR 1910", description: "Occupational safety and health standards for general industry.", category: "occupational_safety", region: "United States", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910" },
  { id: "c-1904", code: "osha_1904", name: "OSHA 29 CFR 1904", description: "Recording and reporting occupational injuries and illnesses.", category: "occupational_safety", region: "United States", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1904" },
  { id: "c-70e", code: "nfpa_70e", name: "NFPA 70E", description: "Electrical safety in the workplace: arc flash and shock protection.", category: "electrical_safety", region: "United States", url: "https://www.nfpa.org/codes-and-standards/nfpa-70e-standard-development/70e" },
  { id: "c-45001", code: "iso_45001", name: "ISO 45001", description: "Occupational health and safety management systems.", category: "occupational_safety", region: "Global", url: "https://www.iso.org/standard/63787.html" },
  { id: "c-14001", code: "iso_14001", name: "ISO 14001", description: "Environmental management systems.", category: "environmental", region: "Global", url: "https://www.iso.org/standard/60857.html" },
  { id: "c-9001", code: "iso_9001", name: "ISO 9001", description: "Quality management systems.", category: "quality_management", region: "Global", url: "https://www.iso.org/standard/62085.html" },
  { id: "c-1926", code: "osha_1926", name: "OSHA 29 CFR 1926", description: "Safety and health regulations for construction.", category: "construction_safety", region: "United States", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926" },
  { id: "c-psm", code: "osha_1910_119", name: "OSHA PSM (1910.119)", description: "Process safety management of highly hazardous chemicals.", category: "process_safety", region: "United States", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.119" },
  { id: "c-101", code: "nfpa_101", name: "NFPA 101", description: "Life safety code: egress, fire protection and alarms.", category: "fire_safety", region: "United States", url: "https://www.nfpa.org/codes-and-standards/nfpa-101-standard-development/101" },
  { id: "c-rcra", code: "epa_rcra", name: "EPA RCRA", description: "Hazardous waste generation, storage and disposal.", category: "environmental", region: "United States", url: "https://www.epa.gov/rcra" },
  { id: "c-fsma", code: "fda_fsma", name: "FDA FSMA", description: "Preventive controls for human food.", category: "food_safety", region: "United States", url: "https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/food-safety-modernization-act-fsma" },
  { id: "c-89391", code: "eu_89_391", name: "EU OSH Framework Directive", description: "Directive 89/391/EEC on safety and health of workers at work.", category: "general", region: "European Union", url: "https://osha.europa.eu/en/legislation/directives/the-osh-framework-directive/1" },
];

/** What Northwind follows today: general industry, recordkeeping, electrical safety, ISO 45001. */
export const ACTIVE_FRAMEWORKS: Framework[] = CATALOG.filter((f) => ["osha_1910", "osha_1904", "nfpa_70e", "iso_45001"].includes(f.code ?? "")).map((f) => ({ ...f, id: `a-${f.id}` }));

export const AI_MAX = 5000;

export const AI_NOTE =
  "These instructions are added to every AI answer: event analysis, JHA, SOP, LOTO, permits, corrective actions and OSHA narratives. The regulatory frameworks you selected are included too, and answers are written in the primary language.";

export const AI_INSTRUCTIONS =
  "We stamp and assemble metal parts at the Springfield Plant: a press line, a warehouse with forklifts, a packaging line and a maintenance shop.\n\nCite the OSHA 1910 section when a rule applies (1910.147 for lockout, 1910.178 for forklifts, 1910.212 for machine guarding). Give every corrective action one owner and one due date. Write for technicians: short sentences, no jargon.";

export const REPORT_TYPES_NOTE = "Incident, near miss, observation and customer incident are built in. Add your own, up to 20 active report types.";
