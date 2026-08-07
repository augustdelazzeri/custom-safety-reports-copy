# EHS Prototype Status Review (Aug 07, 2026)

This document records the current status of the EHS prototype based on manual navigation and review. It serves as a roadmap for what is complete, what needs improvement (especially regarding responsiveness), and what is missing.

## Status Overview

| Feature / Screen | Status | Notes |
| :--- | :--- | :--- |
| **Access Points** | ✅ Done | Working as expected. |
| **Dashboard** | ✅ Done | Very good, highly similar to reality. (Sidebar label fixed from "Safety Events" to "Dashboard"). |
| **Safety Events** | ⚠️ Needs Review | Exists but was hard to find/navigate to. (Sidebar link added for `/events`). |
| **CAPAs** | 🟡 Done, but poor | Exists but the implementation is very bad and needs a complete overhaul. |
| **OSHA Log (Form 300)** | 🟡 Done, no responsiveness | Implemented but lacks horizontal responsiveness. |
| **OSHA Summary (Form 300A)** | 🟡 Done, no responsiveness | Implemented but lacks horizontal responsiveness. |
| **Agency Reports** | 🔴 Error | Not opening, likely a broken link or missing page. |
| **Job Hazard Analysis (JHA)** | 🔴 Done, but very poor | Lacks responsiveness, missing many features, overall very bad. |
| **Standard Operating Procedures (SOP)** | 🔴 Done, but very poor | Lacks responsiveness, overall very bad. |
| **Lockout/Tagout (LOTO)** | 🔴 Done, but very poor | Lacks responsiveness, overall very bad. |
| **Permit to Work (PTW)** | 🔴 Done, but very poor | Lacks responsiveness, overall very bad. |
| **Audits & Inspections** | ✅ Done (99%) | Excellent, very close to reality. Top quality. |
| **SDS Library** | 🔴 Done, but very poor | Lacks responsiveness, overall very bad. |
| **Safety Work Orders** | 🔴 Done, but very poor | Lacks responsiveness, missing filters and other core features. |
| **App Switcher** | ✅ Updated | Updated to match the real popover (Maintenance, Safety, Learn). |
| **Settings / User Management** | ✅ Updated | Removed "User Management" from the main sidebar. The bottom gear icon now correctly points to the settings area (`/settings/people`). |
| **Paid Subscription** | ✅ Done (~60%) | Exists, responsive, and reasonably close to reality. |

## Next Steps / Roadmap

1.  **Responsiveness Pass:** Fix horizontal scrolling and layout issues on OSHA Logs, OSHA Summary, JHA, SOP, LOTO, PTW, SDS Library, and Safety Work Orders.
2.  **Quality Overhaul:** Completely revamp the UI and functionality for CAPAs, JHA, SOP, LOTO, PTW, SDS Library, and Safety Work Orders to match the high quality of the Audits & Inspections module.
3.  **Fix Broken Links:** Investigate and fix the "Agency Reports" page.
4.  **Refine Settings:** Improve the settings area (currently pointing to `/settings/people`) which contains safety templates, locations, etc., to make it closer to reality.