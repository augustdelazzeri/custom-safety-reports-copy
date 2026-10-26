/**
 * The QR codes on the walls of the Springfield Plant. Each one opens the no-login report form,
 * filed at its location (and asset, when it is stuck on a machine). The codes sit where the
 * prototype's events happened: EVT-2041 (Press 4), EVT-2040 (Conveyor 12), EVT-2038 (Press 7)
 * and EVT-2037 (aisle 7) were all reported from one of them.
 */

import { TODAY } from "@/lib/three-cases/data";

export type AccessPointStatus = "active" | "paused";

export interface AccessPoint {
  id: string;
  name: string;
  /** A `LOCATIONS` id; "plant" is company-wide: the form asks where the person is. */
  locationId: string;
  /** An `ASSETS` id, when the code is stuck on a machine. */
  assetId?: string;
  status: AccessPointStatus;
  /** Reports filed from this code in the last 30 days. */
  reports30d: number;
  /** When the last report came in (local time, ISO), if it ever did. */
  lastReportAt?: string;
  /** `EVENTS` ids reported from this code, newest first (only the ones the prototype has). */
  eventIds: string[];
  createdAt: string;
  createdBy: string;
  /** Why a paused code is paused. */
  note?: string;
}

export const ACCESS_POINTS: AccessPoint[] = [
  {
    id: "ap-press-4",
    name: "Press 4, operator station",
    locationId: "press",
    assetId: "hp04",
    status: "active",
    reports30d: 6,
    lastReportAt: "2026-10-16T09:12",
    eventIds: ["ev-2041"],
    createdAt: "2026-03-02",
    createdBy: "maria",
  },
  {
    id: "ap-conveyor-12",
    name: "Conveyor 12, infeed",
    locationId: "pack2",
    assetId: "cv12",
    status: "active",
    reports30d: 4,
    lastReportAt: "2026-10-16T07:48",
    eventIds: ["ev-2040"],
    createdAt: "2026-03-02",
    createdBy: "maria",
  },
  {
    id: "ap-press-7",
    name: "Press 7, hydraulic unit",
    locationId: "press",
    assetId: "hp07",
    status: "active",
    reports30d: 2,
    lastReportAt: "2026-10-15T11:05",
    eventIds: ["ev-2038"],
    createdAt: "2026-04-14",
    createdBy: "dan",
  },
  {
    id: "ap-aisle-7",
    name: "Warehouse, aisle 7",
    locationId: "warehouse",
    status: "active",
    reports30d: 3,
    lastReportAt: "2026-10-15T08:20",
    eventIds: ["ev-2037"],
    createdAt: "2026-03-09",
    createdBy: "jo",
  },
  {
    id: "ap-break-room",
    name: "Break room, main entrance",
    locationId: "plant",
    status: "active",
    reports30d: 5,
    lastReportAt: "2026-10-14T12:40",
    eventIds: [],
    createdAt: "2026-02-20",
    createdBy: "maria",
  },
  {
    id: "ap-dock-door-2",
    name: "Dock door 2",
    locationId: "dock",
    assetId: "dl2",
    status: "active",
    reports30d: 1,
    lastReportAt: "2026-10-08T15:22",
    eventIds: [],
    createdAt: "2026-05-06",
    createdBy: "jo",
  },
  {
    id: "ap-charging",
    name: "Forklift charging area",
    locationId: "warehouse",
    assetId: "fl03",
    status: "active",
    reports30d: 1,
    lastReportAt: "2026-10-03T06:55",
    eventIds: [],
    createdAt: "2026-05-06",
    createdBy: "jo",
  },
  {
    id: "ap-pack-2",
    name: "Packaging Line 2, stretch wrapper",
    locationId: "pack2",
    assetId: "wr2",
    status: "active",
    reports30d: 0,
    lastReportAt: "2026-09-11T10:30",
    eventIds: [],
    createdAt: "2026-06-18",
    createdBy: "dan",
  },
  {
    id: "ap-compressor",
    name: "Maintenance Shop, compressor room",
    locationId: "shop",
    assetId: "ac2",
    status: "active",
    reports30d: 0,
    eventIds: [],
    createdAt: "2026-09-29",
    createdBy: "dan",
  },
  {
    id: "ap-boiler",
    name: "Boiler room door",
    locationId: "shop",
    status: "paused",
    reports30d: 0,
    lastReportAt: "2026-08-21T13:15",
    eventIds: [],
    createdAt: "2026-02-20",
    createdBy: "maria",
    note: "Paused while the boiler room is closed for the retrofit. The form says the code is not in use.",
  },
  {
    id: "ap-visitor",
    name: "Visitor entrance, lobby",
    locationId: "plant",
    status: "paused",
    reports30d: 0,
    lastReportAt: "2026-07-30T09:05",
    eventIds: [],
    createdAt: "2026-02-20",
    createdBy: "aisha",
    note: "Paused until the visitor sign-in kiosk is back. Visitors report at the front desk meanwhile.",
  },
];

/** The address the code encodes: Safety's public QR route (`/ehs/public/qr/:accessPointId`). */
export const publicLink = (id: string) => `https://app.onupkeep.com/ehs/public/qr/${id}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Today, 09:12", "Yesterday, 11:05" or "Oct 8", against the prototype's today. */
export function formatWhen(iso?: string) {
  if (!iso) return "";
  const at = new Date(iso);
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((day(TODAY) - day(at)) / 86_400_000);
  const time = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Yesterday, ${time}`;
  return `${MONTHS[at.getMonth()]} ${at.getDate()}`;
}

/** "Mar 2, 2026". */
export function formatDay(iso: string) {
  const at = new Date(`${iso.slice(0, 10)}T12:00`);
  return `${MONTHS[at.getMonth()]} ${at.getDate()}, ${at.getFullYear()}`;
}

/** A local id for a code created in this session, from its name. */
export function newAccessPointId(name: string, taken: string[]) {
  const base =
    "ap-" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32);
  let id = base;
  for (let n = 2; taken.includes(id); n += 1) id = `${base}-${n}`;
  return id;
}

/** The prototype's today as an ISO day, for codes created here. */
export const todayIso = () => {
  const d = TODAY;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
