import { person } from "@/lib/three-cases/data";
import { DOCS, getMvpAsset, type MvpDoc, type MvpKind } from "@/lib/three-cases/mvp-rules";
import { dateIn } from "@/lib/three-cases/real-jobs";

export type SdsStatus = "current" | "due" | "overdue";
export interface SdsRow {
  ref: string;
  product: string;
  maker: string;
  hazards: string[];
  where: string;
  /** Days since the last revision; a sheet is reviewed every 3 years. */
  revisedDaysAgo: number;
  status: SdsStatus;
}
export const SDS_ROWS: SdsRow[] = [
  { ref: "SDS-0100", product: "Argon / CO2 shielding gas", maker: "Airgas", hazards: ["Gas under pressure"], where: "Welding bay 1", revisedDaysAgo: 220, status: "current" },
  { ref: "SDS-0102", product: "Pump seal flush", maker: "Chemours", hazards: ["Irritant"], where: "Utility room", revisedDaysAgo: 1155, status: "overdue" },
  { ref: "SDS-0104", product: "Hydraulic oil AW 46", maker: "Mobil DTE 25", hazards: ["Aspiration"], where: "Press line", revisedDaysAgo: 410, status: "current" },
  { ref: "SDS-0106", product: "Heavy-duty degreaser", maker: "Simple Green", hazards: ["Irritant"], where: "Maintenance shop", revisedDaysAgo: 95, status: "current" },
  { ref: "SDS-0108", product: "Isopropyl alcohol 99%", maker: "Fisher Scientific", hazards: ["Flammable", "Irritant"], where: "Machine shop", revisedDaysAgo: 600, status: "current" },
  { ref: "SDS-0110", product: "Machine coolant S-500", maker: "Hangsterfer's", hazards: ["Irritant"], where: "Machine shop", revisedDaysAgo: 1060, status: "due" },
  { ref: "SDS-0112", product: "Battery electrolyte (sulfuric acid)", maker: "EnerSys", hazards: ["Corrosive"], where: "Warehouse charging station", revisedDaysAgo: 300, status: "current" },
  { ref: "SDS-0114", product: "Propane, forklift fuel", maker: "AmeriGas", hazards: ["Flammable", "Gas under pressure"], where: "Warehouse", revisedDaysAgo: 150, status: "current" },
  { ref: "SDS-0116", product: "Boiler water treatment", maker: "Nalco", hazards: ["Corrosive", "Toxic"], where: "Boiler room", revisedDaysAgo: 1120, status: "due" },
  { ref: "SDS-0118", product: "Multi-surface cleaner", maker: "Ecolab", hazards: ["Irritant"], where: "Packaging", revisedDaysAgo: 40, status: "current" },
];


/** A number from the reference, so each document keeps the same owner and review date on every visit. */
export const seed = (ref: string) => ref.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
export const OWNERS = ["dan", "maria", "aisha", "dan", "carlos"];

export type DocStatusKey = "approved" | "approval" | "draft" | "due" | "overdue";
export type RecKind = Exclude<MvpKind, "audit">;

/** A document of Documentation as the record pages show it. `id` is the reference. */
export interface DocRec {
  id: string;
  kind: RecKind;
  title: string;
  slug: string;
  status: DocStatusKey;
  ownerName: string;
  locationName: string;
  assetName: string;
  review?: string;
  /** Jha only. */
  risk: number;
  stepCount: number;
}

const toStatus = (doc: MvpDoc): DocStatusKey => (doc.state === "valid" ? "approved" : doc.state === "awaiting" ? "approval" : doc.state === "draft" ? "draft" : doc.state === "expired" ? "overdue" : "due");

export function toRec(doc: MvpDoc): DocRec {
  const n = seed(doc.ref);
  const assets = doc.assetIds.map((id) => getMvpAsset(id)).filter((a): a is NonNullable<typeof a> => Boolean(a));
  const review = doc.state === "expired" ? dateIn(-(doc.days ?? 10)) : doc.state === "expiring" ? dateIn(doc.days ?? 7) : doc.state === "valid" ? dateIn(40 + (n % 280)) : undefined;
  return {
    id: doc.ref,
    kind: doc.type as RecKind,
    title: doc.title,
    slug: doc.ref,
    status: toStatus(doc),
    ownerName: person(OWNERS[n % OWNERS.length]).name,
    locationName: assets[0]?.location ?? "All locations",
    assetName: assets.length ? `${assets[0].name}${assets.length > 1 ? ` +${assets.length - 1}` : ""}` : "Company program",
    review,
    risk: [4, 6, 9, 12][n % 4],
    stepCount: 2 + (n % 5),
  };
}

export const docRecs = (kind: RecKind): DocRec[] => DOCS.filter((d) => d.type === kind).map(toRec);

/** A record by reference; the old mock ids (j1, s2, l1...) map to the first, second... record of the kind. */
export function findRec(kind: RecKind, id: string): DocRec {
  const list = docRecs(kind);
  const byRef = list.find((r) => r.id.toLowerCase() === id.toLowerCase());
  if (byRef) return byRef;
  const m = /^[a-z]+(\d+)$/i.exec(id);
  return list[m ? Math.min(Number(m[1]), list.length) - 1 : 0] ?? list[0];
}

/** The mock record's body with the header facts of the Documentation row on top. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withRec(kind: RecKind, id: string, base: any): any {
  if (!base) return base;
  const r = findRec(kind, id);
  const n = seed(r.id);
  return {
    ...base,
    title: r.title,
    slug: r.slug,
    referenceId: r.slug,
    status: r.status,
    owner: { ...base.owner, fullName: r.ownerName },
    ownerId: r.ownerName,
    issuer: base.issuer ? { ...base.issuer, fullName: person("dan").name } : base.issuer,
    location: { ...base.location, name: r.locationName },
    asset: base.asset ? { ...base.asset, name: r.assetName } : base.asset,
    approvers: [{ approverId: "maria", approverName: person("maria").name, role: person("maria").role, approvedAt: r.status === "approved" ? dateIn(-(10 + (n % 30))) : undefined }],
    reviewDate: r.review,
    nextReviewDate: r.review,
    createdAt: dateIn(-(200 + (n % 100))),
    updatedAt: dateIn(-(5 + (n % 60))),
    highestResidualRiskScore: r.risk,
    highestInitialRiskScore: Math.max(r.risk, 12),
  };
}

export const findSds = (id: string): SdsRow => {
  const byRef = SDS_ROWS.find((r) => r.ref.toLowerCase() === id.toLowerCase());
  if (byRef) return byRef;
  const m = /^[a-z]+(\d+)$/i.exec(id);
  return SDS_ROWS[m ? Math.min(Number(m[1]), SDS_ROWS.length) - 1 : 0];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSds(id: string, base: any): any {
  if (!base) return base;
  const r = findSds(id);
  const danger = r.hazards.some((h) => ["Flammable", "Corrosive", "Toxic"].includes(h));
  return {
    ...base,
    product: r.product,
    slug: r.ref,
    manufacturer: r.maker,
    status: r.status,
    pictograms: r.hazards.map((h) => h.toLowerCase()),
    signalWord: danger ? "danger" : "warning",
    revisionDate: dateIn(-r.revisedDaysAgo),
    nextReviewDate: dateIn(1095 - r.revisedDaysAgo),
  };
}
