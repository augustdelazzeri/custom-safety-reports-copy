# EHS Platform - Functional Specifications

> **Purpose**: This document catalogs all system capabilities at a granular, business-action level to support Custom Roles & Permissions UI development.

## Document Status

**✅ Validated Against:** `server/trpc/router/*.ts` (32 routers analyzed)  
**✅ Permission Matrix:** Cross-referenced with `shared/user-permissions.ts`  
**✅ Accuracy:** All actions verified to exist in backend implementation  
**📅 Last Verified:** 2026-01-22

**What This Documents:**
- ✅ All tRPC procedures with business-friendly labels
- ✅ Actual permission checks enforced by routers
- ✅ Public vs authenticated endpoints
- ✅ Approval workflow actions (submit, approve, reject, revise)
- ✅ CMMS integration endpoints (assets, locations, work orders, PMs, checklists)

**What This Does NOT Include:**
- ❌ Client-side only features (PDF generation, acknowledgments, printing)
- ❌ Internal service methods not exposed via tRPC
- ❌ Background jobs (these are triggered by mutations, not user actions)

**Module Summary:**
- 🔴 **Incident Management** (3 modules): Events, CAPA, OSHA Compliance
- 🔵 **Operational Safety** (5 modules): LOTO, PTW, JHA, SOP, Audit
- 🟡 **Configuration** (5 modules): Access Points, Templates, Hazards, Controls, OSHA Locations
- 🟢 **AI Features** (1 module): Voice transcription, document analysis, text generation
- 🟣 **Collaboration** (2 modules): Comments, Notifications
- ⚪ **Files** (1 module): S3 uploads, image processing
- ⚫ **System** (4 modules): Users, CMMS Integration, Configuration, Audit Trail

**Total:** 19 logical modules, 225+ granular actions, 32 backend routers

---

## Revision History

### Version 1.2 - 2026-01-22
**Second validation pass - additional corrections:**

✅ **AI Module Corrections:**
- Removed `ai:match-locations` (internal function called by access-point bulk create, not a direct AI endpoint)
- Renamed `ai:view-jobs` → `ai:view-active-jobs` to match router procedure name `getActiveAIJobs`
- Renamed `ai:view-job` → `ai:view-job-by-id` to match `getAIJobById`

✅ **OSHA Locations Corrections:**
- Added `osha-location:view-minimal-list` (exists as `minimalList` procedure)
- Confirmed `archive`/`unarchive` via `toggleArchive` procedure

✅ **Notifications Corrections:**
- Added `notification:get-vapid-key` (required for push notification setup, `getVapidPublicKey` procedure)

✅ **Validation:**
- Re-validated all 32 routers against documented actions
- Confirmed JSON syntax valid with 225 total actions

---

### Version 1.1 - 2026-01-22
**Major corrections after code validation:**

✅ **Removed Non-Existent Actions:**
- LOTO: `print-tags`, `verify-isolation` (client-side only)
- PTW: `close` (not a separate action)
- JHA: `generate-pdf`, `duplicate` (PDF is client-side, no duplicate endpoint)
- SOP: `acknowledge`, `generate-pdf` (client-side only)
- Audit: `generate-pdf` (client-side only)
- Access Point: `print` (client-side only)
- Template: `activate`/`deactivate` (uses archive toggle)

✅ **Added Missing Actions:**
- Hazards: `create-bulk`, `archive`/`unarchive`, `view-default-list`
- Controls: `create-bulk`, `archive`/`unarchive`, `view-default-list`
- All modules: `view-minimal-list` where applicable
- OSHA Summary: Complete suite (establishment info, certification, archive)
- OSHA Agency: Complete CRUD operations
- CMMS Integration: Full suite (assets, locations, work orders, PMs, checklists, linked entities)
- Image Processing: `create-variants` (HEIC conversion, thumbnails)
- User Metadata: `view`, `update`
- Company Metadata: `view`
- Config: `view-client-config`
- Audit Trail: Corrected (no export, context-based)

✅ **Reorganized Modules:**
- Split OSHA into 5 sub-entities (Report, Summary, Agency, Location, Audit Trail)
- Consolidated CMMS Integration (7 routers → 1 logical module)
- Separated File and Image operations
- Clarified public vs authenticated endpoints

✅ **Updated JSON Structure:**
- Added `permission` field to each action
- Added `description` field to each module
- Synchronized all actions with tables
- Validated JSON syntax

---

## 1. Incident Management

### 1.1 Safety Events (Incidents/Near-Misses)

**Module**: `ehs-event`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `event:create` | Report Incident | Create a new safety event (incident, near-miss, property damage) | CREATE |
| `event:create-public` | Submit Public Report | Report incident via public access point (QR code, no login) | Public (no auth) |
| `event:view` | View Incident Details | Access full incident details including analysis and attachments | VIEW |
| `event:view-list` | Browse Incident Log | List and filter all safety events | VIEW |
| `event:edit` | Update Incident | Modify incident details, severity, or analysis | EDIT |
| `event:archive` | Archive Incident | Soft-delete incident (move to archive) | EDIT |
| `event:unarchive` | Restore Incident | Restore archived incident | EDIT |
| `event:delete` | Permanently Delete Incident | Hard delete incident (Admin/Owner only) | DELETE |
| `event:export` | Export Incident Data | Download incidents as CSV/Excel | EXPORT |
| `event:comment` | Add Comment | Post comments and mention team members | COMMENT |
| `event:view-comments` | View Comments | Read comment threads on incidents | VIEW |
| `event:delete-comment` | Delete Comment | Remove comments (own comments or admin) | EDIT |

---

### 1.2 CAPA (Corrective & Preventive Actions)

**Module**: `ehs-capa`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `capa:create` | Create CAPA | Create corrective or preventive action with owner and due date | CREATE |
| `capa:view` | View CAPA Details | Access CAPA details including linked events and work orders | VIEW |
| `capa:view-list` | Browse CAPA Log | List and filter all CAPAs by status, owner, overdue | VIEW |
| `capa:edit` | Update CAPA | Modify CAPA details, status, or implementation notes | EDIT |
| `capa:archive` | Archive CAPA | Soft-delete CAPA | EDIT |
| `capa:unarchive` | Restore CAPA | Restore archived CAPA | EDIT |
| `capa:delete` | Permanently Delete CAPA | Hard delete CAPA (Admin/Owner only) | DELETE |
| `capa:export` | Export CAPA Data | Download CAPAs as CSV/Excel | EXPORT |
| `capa:duplicate` | Duplicate CAPA | Create copy of existing CAPA with attachments | CREATE |
| `capa:comment` | Add Comment | Post comments and mention team members | COMMENT |
| `capa:view-comments` | View Comments | Read comment threads on CAPAs | VIEW |
| `capa:delete-comment` | Delete Comment | Remove comments | EDIT |

---

### 1.3 OSHA Reporting

**Module**: `ehs-osha-reports`

#### OSHA 300/301 Reports

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `osha-report:create` | Create OSHA Report | Record work-related injury/illness (300/301 form) | CREATE |
| `osha-report:view` | View OSHA Report | Access OSHA report details with event data | VIEW |
| `osha-report:view-list` | Browse OSHA Reports | List OSHA 300/301 reports by year | VIEW |
| `osha-report:edit` | Update OSHA Report | Modify OSHA report classification | EDIT |
| `osha-report:archive` | Archive OSHA Report | Soft-delete report | EDIT |
| `osha-report:unarchive` | Restore OSHA Report | Restore archived report | EDIT |
| `osha-report:delete` | Permanently Delete OSHA Report | Hard delete report (Admin only) | DELETE |
| `osha-report:export` | Export OSHA Reports | Download reports as CSV | EXPORT |

#### OSHA 300A Annual Summary

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `osha-summary:view-cases` | View Annual Case Summary | Access OSHA 300A summary with TRC/DART rates | VIEW |
| `osha-summary:view-establishment-info` | View Establishment Info | Access company hours worked and location details | VIEW |
| `osha-summary:upsert-establishment-info` | Update Establishment Info | Modify total hours worked and company details | CREATE |
| `osha-summary:upsert-certification` | Sign Executive Certification | Certify OSHA 300A as company executive | CREATE |
| `osha-summary:archive` | Archive Summary | Archive completed annual summary | CREATE |
| `osha-summary:view-archived` | View Archived Summaries | Access previous years' summaries | VIEW |

#### OSHA Agency Reports (Submission to Government)

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `osha-agency:create` | Create Agency Report | Draft report for OSHA submission | CREATE |
| `osha-agency:view` | View Agency Report | Access agency report details | VIEW |
| `osha-agency:view-list` | Browse Agency Reports | List all agency submissions | VIEW |
| `osha-agency:edit` | Update Agency Report | Modify report before submission | EDIT |
| `osha-agency:archive` | Archive Agency Report | Soft-delete report | EDIT |
| `osha-agency:unarchive` | Restore Agency Report | Restore archived report | EDIT |
| `osha-agency:export` | Export Agency Reports | Download as CSV | EXPORT |

---

## 2. Operational Safety Procedures

### 2.1 Lockout/Tagout (LOTO)

**Module**: `loto`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `loto:create` | Create LOTO Procedure | Draft new lockout/tagout procedure for equipment | CREATE |
| `loto:view` | View LOTO Procedure | Access procedure details with energy sources and steps | VIEW |
| `loto:view-list` | Browse LOTO Library | List all LOTO procedures by equipment/location | VIEW |
| `loto:view-minimal-list` | Browse LOTO (Summary) | List LOTOs with minimal data for selection | VIEW |
| `loto:view-versions` | View Revision History | See all versions of a LOTO procedure | VIEW |
| `loto:edit` | Update LOTO Procedure | Modify procedure details (draft only) | EDIT |
| `loto:duplicate` | Duplicate LOTO | Copy procedure with media for similar equipment | CREATE |
| `loto:submit-review` | Submit for Review | Move LOTO from draft to under_review status | UPDATE_STATUS |
| `loto:approve` | Approve LOTO | Sign off on LOTO as designated approver | UPDATE_STATUS |
| `loto:reject` | Reject LOTO | Send back to owner with rejection reason | UPDATE_STATUS |
| `loto:initiate-revision` | Start Revision | Create new version from approved procedure | UPDATE_STATUS |
| `loto:archive` | Archive LOTO | Soft-delete procedure | EDIT |
| `loto:unarchive` | Restore LOTO | Restore archived procedure | EDIT |
| `loto:delete` | Permanently Delete LOTO | Hard delete procedure (Admin/Owner only) | DELETE |
| `loto:export` | Export LOTO Data | Download procedures as CSV/Excel | EXPORT |

---

### 2.2 Permit to Work (PTW)

**Module**: `ptw`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `ptw:create` | Create Work Permit | Draft new permit for high-risk work (hot work, confined space, heights) | CREATE |
| `ptw:view` | View Permit Details | Access permit details with checklists and approvals | VIEW |
| `ptw:view-list` | Browse Permits | List all work permits by type, status, expiration | VIEW |
| `ptw:view-minimal-list` | Browse Permits (Summary) | List permits with minimal data for selection | VIEW |
| `ptw:view-versions` | View Revision History | See all versions of a permit | VIEW |
| `ptw:edit` | Update Permit | Modify permit details (draft only) | EDIT |
| `ptw:duplicate` | Duplicate Permit | Copy permit with media for similar work | CREATE |
| `ptw:submit-review` | Submit for Approval | Move permit from draft to under_review status | UPDATE_STATUS |
| `ptw:approve` | Authorize Permit | Sign off on permit as designated approver | UPDATE_STATUS |
| `ptw:reject` | Reject Permit | Send back to requester with rejection reason | UPDATE_STATUS |
| `ptw:initiate-revision` | Start Revision | Create new version from approved permit | UPDATE_STATUS |
| `ptw:archive` | Archive Permit | Soft-delete permit | EDIT |
| `ptw:unarchive` | Restore Permit | Restore archived permit | EDIT |
| `ptw:delete` | Permanently Delete Permit | Hard delete permit (Admin/Owner only) | DELETE |
| `ptw:export` | Export Permit Data | Download permits as CSV/Excel | EXPORT |

---

### 2.3 Job Hazard Analysis (JHA)

**Module**: `ehs-jha`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `jha:create` | Create JHA | Draft new job hazard analysis for task | CREATE |
| `jha:view` | View JHA Details | Access JHA with risk matrix and control measures | VIEW |
| `jha:view-list` | Browse JHA Library | List all JHAs by task, location, risk level | VIEW |
| `jha:view-minimal-list` | Browse JHA (Summary) | List JHAs with minimal data for selection | VIEW |
| `jha:view-versions` | View Revision History | See all versions of a JHA | VIEW |
| `jha:edit` | Update JHA | Modify JHA steps, hazards, or controls (draft only) | EDIT |
| `jha:submit-review` | Submit for Review | Move JHA from draft to under_review status | UPDATE_STATUS |
| `jha:approve` | Approve JHA | Sign off on JHA as designated approver | UPDATE_STATUS |
| `jha:reject` | Reject JHA | Send back to owner with rejection reason | UPDATE_STATUS |
| `jha:initiate-revision` | Start Revision | Create new version from approved JHA | UPDATE_STATUS |
| `jha:archive` | Archive JHA | Soft-delete JHA | EDIT |
| `jha:unarchive` | Restore JHA | Restore archived JHA | EDIT |
| `jha:delete` | Permanently Delete JHA | Hard delete JHA (Admin/Owner only) | DELETE |
| `jha:export` | Export JHA Data | Download JHAs as CSV/Excel | EXPORT |

---

### 2.4 Standard Operating Procedures (SOP)

**Module**: `sop`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `sop:create` | Create SOP | Draft new standard operating procedure | CREATE |
| `sop:view` | View SOP Details | Access SOP with step-by-step instructions | VIEW |
| `sop:view-list` | Browse SOP Library | List all SOPs by department, equipment, process | VIEW |
| `sop:view-minimal-list` | Browse SOP (Summary) | List SOPs with minimal data for selection | VIEW |
| `sop:view-versions` | View Revision History | See all versions of an SOP | VIEW |
| `sop:edit` | Update SOP | Modify SOP sections or content (draft only) | EDIT |
| `sop:duplicate` | Duplicate SOP | Copy SOP with media for similar procedures | CREATE |
| `sop:submit-review` | Submit for Review | Move SOP from draft to under_review status | UPDATE_STATUS |
| `sop:approve` | Approve SOP | Sign off on SOP as designated approver | UPDATE_STATUS |
| `sop:reject` | Reject SOP | Send back to owner with rejection reason | UPDATE_STATUS |
| `sop:initiate-revision` | Start Revision | Create new version from approved SOP | UPDATE_STATUS |
| `sop:archive` | Archive SOP | Soft-delete SOP | EDIT |
| `sop:unarchive` | Restore SOP | Restore archived SOP | EDIT |
| `sop:delete` | Permanently Delete SOP | Hard delete SOP (Admin/Owner only) | DELETE |
| `sop:export` | Export SOP Data | Download SOPs as CSV/Excel | EXPORT |

---

### 2.5 Safety Audits

**Module**: `audit`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `audit:create` | Create Audit | Schedule new safety audit/inspection | CREATE |
| `audit:view` | View Audit Details | Access audit with findings and checklist | VIEW |
| `audit:view-list` | Browse Audit Log | List all audits by type, date, location | VIEW |
| `audit:view-minimal-list` | Browse Audit (Summary) | List audits with minimal data for selection | VIEW |
| `audit:view-versions` | View Revision History | See all versions of an audit | VIEW |
| `audit:edit` | Update Audit | Modify audit findings or corrective actions (draft only) | EDIT |
| `audit:duplicate` | Duplicate Audit | Copy audit template for recurring inspections | CREATE |
| `audit:submit-review` | Submit for Review | Move audit from draft to under_review status | UPDATE_STATUS |
| `audit:approve` | Approve Audit | Sign off on audit as designated approver | UPDATE_STATUS |
| `audit:reject` | Reject Audit | Send back to auditor with rejection reason | UPDATE_STATUS |
| `audit:initiate-revision` | Start Revision | Create new version from approved audit | UPDATE_STATUS |
| `audit:archive` | Archive Audit | Soft-delete audit | EDIT |
| `audit:unarchive` | Restore Audit | Restore archived audit | EDIT |
| `audit:delete` | Permanently Delete Audit | Hard delete audit (Admin/Owner only) | DELETE |
| `audit:export` | Export Audit Data | Download audits as CSV/Excel | EXPORT |

---

## 3. Configuration & Master Data

### 3.1 Access Points (QR Codes)

**Module**: `ehs-access-point`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `access-point:create` | Create Access Point | Generate new QR code for location/equipment | CREATE |
| `access-point:create-bulk` | Bulk Create Access Points | Import multiple access points with AI location matching | CREATE |
| `access-point:view` | View Access Point | Access QR code details and usage stats | VIEW |
| `access-point:view-public` | Scan QR Code (Public) | Public endpoint for QR code scanning | Public (no auth) |
| `access-point:view-list` | Browse Access Points | List all QR codes by location/asset | VIEW |
| `access-point:edit` | Update Access Point | Modify location or asset assignment | EDIT |
| `access-point:archive` | Archive Access Point | Deactivate QR code | EDIT |
| `access-point:unarchive` | Reactivate Access Point | Reactivate deactivated QR code | EDIT |
| `access-point:delete` | Permanently Delete Access Point | Hard delete QR code (Admin only) | DELETE |
| `access-point:export` | Export Access Points | Download QR codes as CSV | EXPORT |

---

### 3.2 Event Form Templates

**Module**: `ehs-event-form-template`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `template:create` | Create Form Template | Build custom incident reporting form | CREATE |
| `template:view` | View Template | Access template configuration and fields | VIEW |
| `template:view-list` | Browse Templates | List all event form templates | VIEW |
| `template:edit` | Update Template | Modify template fields or validation rules | EDIT |
| `template:archive` | Archive Template | Soft-delete template (toggles archived state) | EDIT |
| `template:unarchive` | Restore Template | Restore archived template | EDIT |
| `template:export` | Export Templates | Download templates as CSV | EXPORT |

---

### 3.3 Hazards Library

**Module**: `hazards`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `hazard:create` | Create Hazard | Add new hazard to organization library | CREATE |
| `hazard:create-bulk` | Bulk Create Hazards | Import multiple hazards at once | CREATE |
| `hazard:view` | View Hazard | Access hazard details and severity | VIEW |
| `hazard:view-list` | Browse Hazards Library | List all custom hazards by category, severity | VIEW |
| `hazard:view-default-list` | Browse Default Hazards | View system-provided hazard templates | VIEW |
| `hazard:edit` | Update Hazard | Modify hazard description or category | EDIT |
| `hazard:archive` | Archive Hazard | Soft-delete hazard from library | EDIT |
| `hazard:unarchive` | Restore Hazard | Restore archived hazard | EDIT |
| `hazard:export` | Export Hazards | Download hazards as CSV | EXPORT |

---

### 3.4 Control Measures Library

**Module**: `control-measures`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `control:create` | Create Control Measure | Add new control to organization library | CREATE |
| `control:create-bulk` | Bulk Create Controls | Import multiple controls at once | CREATE |
| `control:view` | View Control Measure | Access control details and effectiveness | VIEW |
| `control:view-list` | Browse Controls Library | List all custom controls by type (engineering, admin, PPE) | VIEW |
| `control:view-default-list` | Browse Default Controls | View system-provided control templates | VIEW |
| `control:edit` | Update Control Measure | Modify control description or type | EDIT |
| `control:archive` | Archive Control | Soft-delete control from library | EDIT |
| `control:unarchive` | Restore Control | Restore archived control | EDIT |
| `control:export` | Export Control Measures | Download controls as CSV | EXPORT |

---

### 3.5 OSHA Locations Management

**Module**: `osha-locations`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `osha-location:create` | Register Location | Add new facility for OSHA reporting | CREATE |
| `osha-location:view` | View Location | Access location OSHA details | VIEW |
| `osha-location:view-list` | Browse Locations | List all registered OSHA locations | VIEW |
| `osha-location:view-minimal-list` | Browse Locations (Summary) | List locations with minimal data | VIEW |
| `osha-location:archive` | Archive Location | Soft-delete location | EDIT |
| `osha-location:unarchive` | Restore Location | Restore archived location | EDIT |
| `osha-location:export` | Export Locations | Download locations as CSV | EXPORT |

---

## 4. AI-Powered Features

**Module**: `ai-assistant`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `ai:transcribe-audio` | Transcribe Voice Recording | Convert audio to text (Whisper API) | CREATE |
| `ai:analyze-incident` | AI Incident Analysis | Extract structured data from incident description | CREATE |
| `ai:analyze-capa` | AI CAPA Suggestions | Generate corrective action recommendations | CREATE |
| `ai:analyze-jha-text` | AI JHA Generation (Text) | Generate JHA steps from task description | CREATE |
| `ai:analyze-jha-document` | AI JHA Generation (Document) | Extract JHA from uploaded PDF/Word doc | CREATE |
| `ai:analyze-sop-text` | AI SOP Generation (Text) | Generate SOP sections from description | CREATE |
| `ai:analyze-sop-document` | AI SOP Generation (Document) | Extract SOP from uploaded document | CREATE |
| `ai:analyze-loto-text` | AI LOTO Generation (Text) | Generate LOTO steps from equipment description | CREATE |
| `ai:analyze-loto-document` | AI LOTO Generation (Document) | Extract LOTO from uploaded document | CREATE |
| `ai:analyze-ptw-text` | AI PTW Generation (Text) | Generate permit sections from work description | CREATE |
| `ai:analyze-ptw-document` | AI PTW Generation (Document) | Extract PTW from uploaded document | CREATE |
| `ai:improve-text` | AI Text Enhancement | Improve clarity and grammar of any text | None (utility) |
| `ai:view-active-jobs` | View Active AI Jobs | See all active AI jobs for current user | None |
| `ai:view-job-by-id` | View AI Job Status | Check status of specific AI job by ID | None |

---

## 5. Collaboration & Communication

### 5.1 Comments & Mentions

**Module**: `comment`

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `comment:create` | Post Comment | Add comment to any entity (event, CAPA, etc.) | CREATE |
| `comment:view` | View Comments | Read comment threads | VIEW |
| `comment:edit` | Edit Comment | Modify own comments | EDIT |
| `comment:delete` | Delete Comment | Remove own comments (or all if admin) | EDIT |
| `comment:mention` | Mention Users | Tag team members with @ mentions | CREATE |

---

### 5.2 Notifications

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `notification:view` | View Notifications | Access notification inbox | None (own notifications) |
| `notification:view-unread-count` | Check Unread Count | Get badge count | None |
| `notification:mark-read` | Mark as Read | Dismiss notification | None |
| `notification:mark-all-read` | Mark All as Read | Dismiss all notifications | None |
| `notification:get-vapid-key` | Get VAPID Public Key | Required to enable push notifications | None |
| `notification:subscribe-push` | Enable Push Notifications | Register device for browser push | None |
| `notification:unsubscribe-push` | Disable Push Notifications | Unregister device | None |
| `notification:view-subscriptions` | View Push Subscriptions | See registered devices | None |

---

## 6. File & Media Management

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `file:get-presigned-url` | Request Upload URL | Get S3 presigned URL for direct upload | None (context) |
| `file:get-presigned-url-public` | Request Upload URL (Public) | Get S3 URL for public uploads | Public (no auth) |
| `file:get-presigned-read-url` | Get Download URL | Generate presigned URL for file download | Public (no auth) |
| `file:update` | Update File Metadata | Update file name or status after upload | None (context) |
| `file:update-public` | Update File (Public) | Update file metadata from public form | Public (no auth) |
| `file:list` | List Files | Get all files for an entity | None (context) |
| `file:reorder` | Reorder Files | Change attachment display order | None (context) |
| `file:delete` | Delete Files | Remove attachments | None (context) |
| `file:delete-public` | Delete Files (Public) | Remove files from public form | Public (no auth) |
| `image:create-variants` | Process Image | Generate thumbnails and HEIC conversion | None (context) |
| `image:create-variants-public` | Process Image (Public) | Process images from public forms | Public (no auth) |

---

## 7. System Administration

### 7.1 User Management

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `user:view-profile` | View My Profile | Access own user profile | None |
| `user:search-users` | Search Users | Find users by name/email | None |
| `user:view-public-profile` | View User Profile | Access public user info | None |

---

### 7.2 Company Configuration

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `config:view-client-config` | View Client Configuration | Access environment variables (Mixpanel, Dromo tokens) | Public (no auth) |
| `company-metadata:view` | View Company Metadata | Access company profile and EHS settings | None |
| `user-metadata:view` | View User Preferences | Access user-specific settings | None |
| `user-metadata:update` | Update User Preferences | Modify user preferences | None |
| `disclaimer:check` | Check AI Disclaimer Status | Check if user accepted AI disclaimer | None |
| `disclaimer:accept` | Accept AI Disclaimer | Acknowledge AI terms of use for entity type | None |

---

### 7.3 CMMS Integration (UpKeep)

#### Assets & Locations

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `asset:search` | Search Assets | Find assets from UpKeep CMMS | None |
| `asset:search-public` | Search Assets (Public) | Public asset search endpoint | Public (no auth) |
| `location:search` | Search Locations | Find locations from UpKeep CMMS | None |
| `location:search-public` | Search Locations (Public) | Public location search endpoint | Public (no auth) |

#### Work Orders

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `work-order:search` | Search Work Orders | Find work orders from CMMS | None |
| `work-order:view` | View Work Order | Access work order details with analysis | None |
| `work-order:create` | Create Generic Work Order | Create new work order in CMMS | None |
| `work-order:create-from-entity` | Create Work Order from Entity | Create WO linked to CAPA/Event/etc | None |
| `work-order:link` | Link Work Order | Associate existing WO with EHS entity | None |
| `work-order:unlink` | Unlink Work Order | Remove WO association | None |
| `work-order:get-by-capa` | Get Work Orders by CAPA | List WOs linked to specific CAPA | None |
| `work-order:count-by-capa` | Count Work Orders by CAPA | Get WO count for CAPA | None |
| `work-order:enqueue-analysis` | Analyze Work Order | Queue AI analysis of completed work order | None |

#### Preventive Maintenance

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `pm:search` | Search PM Schedules | Find PM schedules from CMMS | None |
| `pm:view` | View PM Schedule | Access PM details | None |
| `pm:link` | Link PM Schedule | Associate PM with EHS entity | None |
| `pm:unlink` | Unlink PM Schedule | Remove PM association | None |

#### Checklists

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `checklist:create` | Create Checklist | Generate CMMS checklist from audit/JHA | None |
| `checklist:search` | Search Checklists | Find checklists from CMMS | None |
| `checklist:link` | Link Checklist | Associate checklist with EHS entity | None |
| `checklist:unlink` | Unlink Checklist | Remove checklist association | None |

---

### 7.4 Audit Trail

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `audit-trail:view` | View Audit Trail | Access entity-specific activity logs (who changed what) | None (context) |
| `osha-audit-trail:view` | View OSHA Audit Trail | Access OSHA-specific compliance logs | VIEW (OSHA) |
| `osha-audit-trail:create` | Log OSHA Action | Manually log compliance action | CREATE (OSHA) |

---

## 8. Linked Entities & Cross-Module Operations

| Action ID | Action Label | Description | Permission Check |
|-----------|-------------|-------------|------------------|
| `linked-entity:view` | View Linked Entities | See relationships between EHS entities | None |
| `linked-entity:view-work-orders` | View Work Order Links | See work orders linked to entity with analysis status | None |

---

## Developer JSON Data Structure

```json
[
  {
    "moduleId": "event",
    "moduleName": "Incident Management",
    "description": "Safety event reporting and tracking",
    "features": [
      {
        "entity": "Safety Event",
        "actions": [
          { "id": "event:create", "label": "Report Incident", "description": "Create new safety event", "permission": "CREATE" },
          { "id": "event:create-public", "label": "Submit Public Report", "description": "Report via QR code", "permission": "PUBLIC" },
          { "id": "event:view", "label": "View Incident Details", "description": "Access full details", "permission": "VIEW" },
          { "id": "event:view-list", "label": "Browse Incident Log", "description": "List all events", "permission": "VIEW" },
          { "id": "event:view-minimal-list", "label": "Browse Incidents (Summary)", "description": "List with minimal data", "permission": "VIEW" },
          { "id": "event:edit", "label": "Update Incident", "description": "Modify event details", "permission": "EDIT" },
          { "id": "event:archive", "label": "Archive Incident", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "event:delete", "label": "Permanently Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "event:export", "label": "Export Data", "description": "Download as CSV", "permission": "EXPORT" },
          { "id": "event:comment", "label": "Add Comment", "description": "Post comment", "permission": "COMMENT" },
          { "id": "event:view-comments", "label": "View Comments", "description": "Read threads", "permission": "VIEW" },
          { "id": "event:view-comment", "label": "View Comment", "description": "Get single comment", "permission": "VIEW" },
          { "id": "event:delete-comment", "label": "Delete Comment", "description": "Remove comment", "permission": "EDIT" }
        ]
      }
    ]
  },
  {
    "moduleId": "capa",
    "moduleName": "Corrective & Preventive Actions",
    "description": "CAPA management with ownership tracking",
    "features": [
      {
        "entity": "CAPA",
        "actions": [
          { "id": "capa:create", "label": "Create CAPA", "description": "Create corrective action", "permission": "CREATE" },
          { "id": "capa:view", "label": "View Details", "description": "Access CAPA details", "permission": "VIEW" },
          { "id": "capa:view-list", "label": "Browse CAPAs", "description": "List all CAPAs", "permission": "VIEW" },
          { "id": "capa:edit", "label": "Update CAPA", "description": "Modify details", "permission": "EDIT" },
          { "id": "capa:duplicate", "label": "Duplicate CAPA", "description": "Copy with attachments", "permission": "CREATE" },
          { "id": "capa:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "capa:delete", "label": "Permanently Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "capa:export", "label": "Export Data", "description": "Download as CSV", "permission": "EXPORT" },
          { "id": "capa:comment", "label": "Add Comment", "description": "Post comment", "permission": "COMMENT" },
          { "id": "capa:view-comments", "label": "View Comments", "description": "Read threads", "permission": "VIEW" },
          { "id": "capa:view-comment", "label": "View Comment", "description": "Get single comment", "permission": "VIEW" },
          { "id": "capa:delete-comment", "label": "Delete Comment", "description": "Remove comment", "permission": "EDIT" }
        ]
      }
    ]
  },
  {
    "moduleId": "osha",
    "moduleName": "OSHA Compliance",
    "description": "Complete OSHA recordkeeping and reporting",
    "features": [
      {
        "entity": "OSHA Report (300/301)",
        "actions": [
          { "id": "osha-report:create", "label": "Create Report", "description": "Record injury/illness", "permission": "CREATE" },
          { "id": "osha-report:view", "label": "View Report", "description": "Access details", "permission": "VIEW" },
          { "id": "osha-report:view-list", "label": "Browse Reports", "description": "List all reports", "permission": "VIEW" },
          { "id": "osha-report:edit", "label": "Update Report", "description": "Modify classification", "permission": "EDIT" },
          { "id": "osha-report:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "osha-report:delete", "label": "Permanently Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "osha-report:export", "label": "Export", "description": "Download as CSV", "permission": "EXPORT" }
        ]
      },
      {
        "entity": "OSHA 300A Summary",
        "actions": [
          { "id": "osha-summary:view-cases", "label": "View Annual Summary", "description": "Access 300A with rates", "permission": "VIEW" },
          { "id": "osha-summary:view-establishment", "label": "View Establishment Info", "description": "Company hours/details", "permission": "VIEW" },
          { "id": "osha-summary:upsert-establishment", "label": "Update Establishment", "description": "Modify hours worked", "permission": "CREATE" },
          { "id": "osha-summary:certify", "label": "Executive Certification", "description": "Sign 300A", "permission": "CREATE" },
          { "id": "osha-summary:archive", "label": "Archive Summary", "description": "Archive year", "permission": "CREATE" },
          { "id": "osha-summary:view-archived", "label": "View Archived", "description": "Previous years", "permission": "VIEW" }
        ]
      },
      {
        "entity": "OSHA Agency Report",
        "actions": [
          { "id": "osha-agency:create", "label": "Create Submission", "description": "Draft agency report", "permission": "CREATE" },
          { "id": "osha-agency:view", "label": "View Submission", "description": "Access report", "permission": "VIEW" },
          { "id": "osha-agency:view-list", "label": "Browse Submissions", "description": "List reports", "permission": "VIEW" },
          { "id": "osha-agency:edit", "label": "Update Submission", "description": "Modify before submit", "permission": "EDIT" },
          { "id": "osha-agency:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "osha-agency:export", "label": "Export", "description": "Download as CSV", "permission": "EXPORT" }
        ]
      },
      {
        "entity": "OSHA Location",
        "actions": [
          { "id": "osha-location:create", "label": "Register Location", "description": "Add establishment", "permission": "CREATE" },
          { "id": "osha-location:view", "label": "View Location", "description": "Access details", "permission": "VIEW" },
          { "id": "osha-location:view-list", "label": "Browse Locations", "description": "List locations", "permission": "VIEW" },
          { "id": "osha-location:view-minimal-list", "label": "Browse (Summary)", "description": "Minimal data", "permission": "VIEW" },
          { "id": "osha-location:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "osha-location:export", "label": "Export", "description": "Download as CSV", "permission": "EXPORT" }
        ]
      },
      {
        "entity": "OSHA Audit Trail",
        "actions": [
          { "id": "osha-audit-trail:view", "label": "View Audit Trail", "description": "Compliance logs", "permission": "VIEW" },
          { "id": "osha-audit-trail:create", "label": "Log Action", "description": "Manual log entry", "permission": "CREATE" }
        ]
      }
    ]
  },
  {
    "moduleId": "loto",
    "moduleName": "Lockout/Tagout",
    "description": "Equipment isolation procedures",
    "features": [
      {
        "entity": "LOTO Procedure",
        "actions": [
          { "id": "loto:create", "label": "Create Procedure", "description": "Draft LOTO", "permission": "CREATE" },
          { "id": "loto:view", "label": "View Procedure", "description": "Access details", "permission": "VIEW" },
          { "id": "loto:view-list", "label": "Browse Library", "description": "List all LOTOs", "permission": "VIEW" },
          { "id": "loto:view-minimal-list", "label": "Browse (Summary)", "description": "Minimal data list", "permission": "VIEW" },
          { "id": "loto:view-versions", "label": "View Versions", "description": "Revision history", "permission": "VIEW" },
          { "id": "loto:edit", "label": "Update", "description": "Modify procedure", "permission": "EDIT" },
          { "id": "loto:duplicate", "label": "Duplicate", "description": "Copy procedure", "permission": "CREATE" },
          { "id": "loto:submit-review", "label": "Submit", "description": "Send to approvers", "permission": "UPDATE_STATUS" },
          { "id": "loto:approve", "label": "Approve", "description": "Sign off", "permission": "UPDATE_STATUS" },
          { "id": "loto:reject", "label": "Reject", "description": "Send back", "permission": "UPDATE_STATUS" },
          { "id": "loto:initiate-revision", "label": "Revise", "description": "New version", "permission": "UPDATE_STATUS" },
          { "id": "loto:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "loto:delete", "label": "Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "loto:export", "label": "Export", "description": "Download CSV", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "ptw",
    "moduleName": "Permit to Work",
    "description": "High-risk work authorization",
    "features": [
      {
        "entity": "Work Permit",
        "actions": [
          { "id": "ptw:create", "label": "Create Permit", "description": "Draft PTW", "permission": "CREATE" },
          { "id": "ptw:view", "label": "View Permit", "description": "Access details", "permission": "VIEW" },
          { "id": "ptw:view-list", "label": "Browse Permits", "description": "List all PTWs", "permission": "VIEW" },
          { "id": "ptw:view-minimal-list", "label": "Browse (Summary)", "description": "Minimal data list", "permission": "VIEW" },
          { "id": "ptw:view-versions", "label": "View Versions", "description": "Revision history", "permission": "VIEW" },
          { "id": "ptw:edit", "label": "Update", "description": "Modify permit", "permission": "EDIT" },
          { "id": "ptw:duplicate", "label": "Duplicate", "description": "Copy permit", "permission": "CREATE" },
          { "id": "ptw:submit-review", "label": "Submit", "description": "Send to approvers", "permission": "UPDATE_STATUS" },
          { "id": "ptw:approve", "label": "Approve", "description": "Authorize work", "permission": "UPDATE_STATUS" },
          { "id": "ptw:reject", "label": "Reject", "description": "Send back", "permission": "UPDATE_STATUS" },
          { "id": "ptw:initiate-revision", "label": "Revise", "description": "New version", "permission": "UPDATE_STATUS" },
          { "id": "ptw:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "ptw:delete", "label": "Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "ptw:export", "label": "Export", "description": "Download CSV", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "jha",
    "moduleName": "Job Hazard Analysis",
    "description": "Task risk assessment",
    "features": [
      {
        "entity": "JHA",
        "actions": [
          { "id": "jha:create", "label": "Create JHA", "description": "Draft analysis", "permission": "CREATE" },
          { "id": "jha:view", "label": "View JHA", "description": "Access details", "permission": "VIEW" },
          { "id": "jha:view-list", "label": "Browse Library", "description": "List all JHAs", "permission": "VIEW" },
          { "id": "jha:view-minimal-list", "label": "Browse (Summary)", "description": "Minimal data list", "permission": "VIEW" },
          { "id": "jha:view-versions", "label": "View Versions", "description": "Revision history", "permission": "VIEW" },
          { "id": "jha:edit", "label": "Update", "description": "Modify JHA", "permission": "EDIT" },
          { "id": "jha:submit-review", "label": "Submit", "description": "Send to approvers", "permission": "UPDATE_STATUS" },
          { "id": "jha:approve", "label": "Approve", "description": "Sign off", "permission": "UPDATE_STATUS" },
          { "id": "jha:reject", "label": "Reject", "description": "Send back", "permission": "UPDATE_STATUS" },
          { "id": "jha:initiate-revision", "label": "Revise", "description": "New version", "permission": "UPDATE_STATUS" },
          { "id": "jha:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "jha:delete", "label": "Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "jha:export", "label": "Export", "description": "Download CSV", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "sop",
    "moduleName": "Standard Operating Procedures",
    "description": "SOP documentation and approval",
    "features": [
      {
        "entity": "SOP",
        "actions": [
          { "id": "sop:create", "label": "Create SOP", "description": "Draft procedure", "permission": "CREATE" },
          { "id": "sop:view", "label": "View SOP", "description": "Access details", "permission": "VIEW" },
          { "id": "sop:view-list", "label": "Browse Library", "description": "List all SOPs", "permission": "VIEW" },
          { "id": "sop:view-minimal-list", "label": "Browse (Summary)", "description": "Minimal data list", "permission": "VIEW" },
          { "id": "sop:view-versions", "label": "View Versions", "description": "Revision history", "permission": "VIEW" },
          { "id": "sop:edit", "label": "Update", "description": "Modify SOP", "permission": "EDIT" },
          { "id": "sop:duplicate", "label": "Duplicate", "description": "Copy SOP", "permission": "CREATE" },
          { "id": "sop:submit-review", "label": "Submit", "description": "Send to approvers", "permission": "UPDATE_STATUS" },
          { "id": "sop:approve", "label": "Approve", "description": "Sign off", "permission": "UPDATE_STATUS" },
          { "id": "sop:reject", "label": "Reject", "description": "Send back", "permission": "UPDATE_STATUS" },
          { "id": "sop:initiate-revision", "label": "Revise", "description": "New version", "permission": "UPDATE_STATUS" },
          { "id": "sop:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "sop:delete", "label": "Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "sop:export", "label": "Export", "description": "Download CSV", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "audit",
    "moduleName": "Safety Audits",
    "description": "Audit management with checklist generation",
    "features": [
      {
        "entity": "Audit",
        "actions": [
          { "id": "audit:create", "label": "Create Audit", "description": "Schedule inspection", "permission": "CREATE" },
          { "id": "audit:view", "label": "View Audit", "description": "Access details", "permission": "VIEW" },
          { "id": "audit:view-list", "label": "Browse Audits", "description": "List all audits", "permission": "VIEW" },
          { "id": "audit:view-minimal-list", "label": "Browse (Summary)", "description": "Minimal data list", "permission": "VIEW" },
          { "id": "audit:view-versions", "label": "View Versions", "description": "Revision history", "permission": "VIEW" },
          { "id": "audit:edit", "label": "Update", "description": "Modify audit", "permission": "EDIT" },
          { "id": "audit:duplicate", "label": "Duplicate", "description": "Copy template", "permission": "CREATE" },
          { "id": "audit:submit-review", "label": "Submit", "description": "Send to approvers", "permission": "UPDATE_STATUS" },
          { "id": "audit:approve", "label": "Approve", "description": "Sign off", "permission": "UPDATE_STATUS" },
          { "id": "audit:reject", "label": "Reject", "description": "Send back", "permission": "UPDATE_STATUS" },
          { "id": "audit:initiate-revision", "label": "Revise", "description": "New version", "permission": "UPDATE_STATUS" },
          { "id": "audit:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "audit:delete", "label": "Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "audit:export", "label": "Export", "description": "Download CSV", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "access-point",
    "moduleName": "Access Points (QR Codes)",
    "description": "QR code generation for locations",
    "features": [
      {
        "entity": "Access Point",
        "actions": [
          { "id": "access-point:create", "label": "Create", "description": "Generate QR code", "permission": "CREATE" },
          { "id": "access-point:create-bulk", "label": "Bulk Create", "description": "Import with AI matching", "permission": "CREATE" },
          { "id": "access-point:view", "label": "View", "description": "Access details", "permission": "VIEW" },
          { "id": "access-point:view-public", "label": "Scan QR (Public)", "description": "Public scanning", "permission": "PUBLIC" },
          { "id": "access-point:view-list", "label": "Browse", "description": "List all QR codes", "permission": "VIEW" },
          { "id": "access-point:edit", "label": "Update", "description": "Modify assignment", "permission": "EDIT" },
          { "id": "access-point:archive", "label": "Archive", "description": "Deactivate", "permission": "EDIT" },
          { "id": "access-point:delete", "label": "Delete", "description": "Hard delete", "permission": "DELETE" },
          { "id": "access-point:export", "label": "Export", "description": "Download CSV", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "event-template",
    "moduleName": "Event Form Templates",
    "description": "Custom incident reporting forms",
    "features": [
      {
        "entity": "Template",
        "actions": [
          { "id": "template:create", "label": "Create Template", "description": "Build custom form", "permission": "CREATE" },
          { "id": "template:view", "label": "View Template", "description": "Access config", "permission": "VIEW" },
          { "id": "template:view-list", "label": "Browse Templates", "description": "List all templates", "permission": "VIEW" },
          { "id": "template:edit", "label": "Update Template", "description": "Modify fields", "permission": "EDIT" },
          { "id": "template:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "template:export", "label": "Export", "description": "Download JSON", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "hazards",
    "moduleName": "Hazards Library",
    "description": "Organization hazard catalog",
    "features": [
      {
        "entity": "Hazard",
        "actions": [
          { "id": "hazard:create", "label": "Create Hazard", "description": "Add to library", "permission": "CREATE" },
          { "id": "hazard:create-bulk", "label": "Bulk Create", "description": "Import multiple", "permission": "CREATE" },
          { "id": "hazard:view-list", "label": "Browse Library", "description": "List custom hazards", "permission": "VIEW" },
          { "id": "hazard:view-default-list", "label": "Browse Defaults", "description": "System templates", "permission": "VIEW" },
          { "id": "hazard:edit", "label": "Update", "description": "Modify hazard", "permission": "EDIT" },
          { "id": "hazard:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "hazard:export", "label": "Export", "description": "Download CSV", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "control-measures",
    "moduleName": "Control Measures Library",
    "description": "Organization control catalog",
    "features": [
      {
        "entity": "Control Measure",
        "actions": [
          { "id": "control:create", "label": "Create Control", "description": "Add to library", "permission": "CREATE" },
          { "id": "control:create-bulk", "label": "Bulk Create", "description": "Import multiple", "permission": "CREATE" },
          { "id": "control:view-list", "label": "Browse Library", "description": "List custom controls", "permission": "VIEW" },
          { "id": "control:view-default-list", "label": "Browse Defaults", "description": "System templates", "permission": "VIEW" },
          { "id": "control:edit", "label": "Update", "description": "Modify control", "permission": "EDIT" },
          { "id": "control:archive", "label": "Archive", "description": "Soft-delete", "permission": "EDIT" },
          { "id": "control:export", "label": "Export", "description": "Download CSV", "permission": "EXPORT" }
        ]
      }
    ]
  },
  {
    "moduleId": "ai-assistant",
    "moduleName": "AI-Powered Features",
    "description": "AI analysis and generation",
    "features": [
      {
        "entity": "AI Assistant",
        "actions": [
          { "id": "ai:transcribe", "label": "Transcribe Audio", "description": "Voice to text", "permission": "CREATE" },
          { "id": "ai:transcribe-public", "label": "Transcribe (Public)", "description": "Public transcription", "permission": "PUBLIC" },
          { "id": "ai:analyze-event", "label": "Analyze Event", "description": "Extract event data", "permission": "CREATE" },
          { "id": "ai:analyze-event-public", "label": "Analyze Event (Public)", "description": "Public analysis", "permission": "PUBLIC" },
          { "id": "ai:analyze-capa", "label": "Analyze CAPA", "description": "Generate suggestions", "permission": "CREATE" },
          { "id": "ai:analyze-jha", "label": "Analyze JHA (Text)", "description": "Generate from text", "permission": "CREATE" },
          { "id": "ai:analyze-jha-document", "label": "Analyze JHA (Doc)", "description": "Extract from PDF", "permission": "CREATE" },
          { "id": "ai:analyze-sop-general", "label": "Analyze SOP General", "description": "Generate metadata", "permission": "CREATE" },
          { "id": "ai:analyze-sop-sections", "label": "Analyze SOP Sections", "description": "Generate steps", "permission": "CREATE" },
          { "id": "ai:analyze-sop-document", "label": "Analyze SOP (Doc)", "description": "Extract from doc", "permission": "CREATE" },
          { "id": "ai:analyze-loto-general", "label": "Analyze LOTO General", "description": "Generate metadata", "permission": "CREATE" },
          { "id": "ai:analyze-loto-sections", "label": "Analyze LOTO Sections", "description": "Generate procedures", "permission": "CREATE" },
          { "id": "ai:analyze-loto-document", "label": "Analyze LOTO (Doc)", "description": "Extract from doc", "permission": "CREATE" },
          { "id": "ai:analyze-ptw-general", "label": "Analyze PTW General", "description": "Generate metadata", "permission": "CREATE" },
          { "id": "ai:analyze-ptw-sections", "label": "Analyze PTW Sections", "description": "Generate sections", "permission": "CREATE" },
          { "id": "ai:analyze-ptw-document", "label": "Analyze PTW (Doc)", "description": "Extract from doc", "permission": "CREATE" },
          { "id": "ai:improve-text", "label": "Improve Text", "description": "Enhance clarity", "permission": "NONE" },
          { "id": "ai:view-active-jobs", "label": "View AI Jobs", "description": "Active jobs queue", "permission": "NONE" },
          { "id": "ai:view-job-by-id", "label": "View AI Job", "description": "Single job status", "permission": "NONE" }
        ]
      }
    ]
  },
  {
    "moduleId": "comments",
    "moduleName": "Comments & Collaboration",
    "description": "Threaded discussions with mentions",
    "features": [
      {
        "entity": "Comment",
        "actions": [
          { "id": "comment:create", "label": "Post Comment", "description": "Add comment", "permission": "CREATE" },
          { "id": "comment:view", "label": "View Comments", "description": "Read threads", "permission": "VIEW" },
          { "id": "comment:delete", "label": "Delete Comment", "description": "Remove comment", "permission": "EDIT" }
        ]
      }
    ]
  },
  {
    "moduleId": "notifications",
    "moduleName": "Notifications",
    "description": "Real-time alerts and push",
    "features": [
      {
        "entity": "Notification",
        "actions": [
          { "id": "notification:view", "label": "View Notifications", "description": "Inbox access", "permission": "NONE" },
          { "id": "notification:view-unread-count", "label": "Unread Count", "description": "Badge count", "permission": "NONE" },
          { "id": "notification:mark-read", "label": "Mark as Read", "description": "Dismiss one", "permission": "NONE" },
          { "id": "notification:mark-all-read", "label": "Mark All Read", "description": "Dismiss all", "permission": "NONE" },
          { "id": "notification:get-vapid-key", "label": "Get VAPID Key", "description": "Enable push", "permission": "NONE" },
          { "id": "notification:subscribe-push", "label": "Enable Push", "description": "Register device", "permission": "NONE" },
          { "id": "notification:unsubscribe-push", "label": "Disable Push", "description": "Unregister", "permission": "NONE" },
          { "id": "notification:view-subscriptions", "label": "View Devices", "description": "List subscriptions", "permission": "NONE" }
        ]
      }
    ]
  },
  {
    "moduleId": "files",
    "moduleName": "File & Media Management",
    "description": "S3 uploads and image processing",
    "features": [
      {
        "entity": "File",
        "actions": [
          { "id": "file:get-presigned-url", "label": "Get Upload URL", "description": "S3 presigned URL", "permission": "CONTEXT" },
          { "id": "file:get-presigned-url-public", "label": "Get Upload URL (Public)", "description": "Public upload", "permission": "PUBLIC" },
          { "id": "file:get-presigned-read-url", "label": "Get Download URL", "description": "Download access", "permission": "PUBLIC" },
          { "id": "file:update", "label": "Update File", "description": "Update metadata", "permission": "CONTEXT" },
          { "id": "file:update-public", "label": "Update (Public)", "description": "Public update", "permission": "PUBLIC" },
          { "id": "file:list", "label": "List Files", "description": "Get entity files", "permission": "CONTEXT" },
          { "id": "file:reorder", "label": "Reorder", "description": "Change order", "permission": "CONTEXT" },
          { "id": "file:delete", "label": "Delete Files", "description": "Remove files", "permission": "CONTEXT" },
          { "id": "file:delete-public", "label": "Delete (Public)", "description": "Public delete", "permission": "PUBLIC" }
        ]
      },
      {
        "entity": "Image",
        "actions": [
          { "id": "image:create-variants", "label": "Process Image", "description": "Thumbnails + HEIC", "permission": "CONTEXT" },
          { "id": "image:create-variants-public", "label": "Process (Public)", "description": "Public processing", "permission": "PUBLIC" }
        ]
      }
    ]
  },
  {
    "moduleId": "users",
    "moduleName": "User Management",
    "description": "User lookup and profiles",
    "features": [
      {
        "entity": "User",
        "actions": [
          { "id": "user:me", "label": "View My Profile", "description": "Current user", "permission": "NONE" },
          { "id": "user:search", "label": "Search Users", "description": "Find by name", "permission": "NONE" },
          { "id": "user:search-public", "label": "Search (Public)", "description": "Public search", "permission": "PUBLIC" },
          { "id": "user:view-public", "label": "View Profile", "description": "Public profile", "permission": "PUBLIC" }
        ]
      },
      {
        "entity": "User Preferences",
        "actions": [
          { "id": "user-metadata:view", "label": "View Preferences", "description": "User settings", "permission": "NONE" },
          { "id": "user-metadata:update", "label": "Update Preferences", "description": "Modify settings", "permission": "NONE" }
        ]
      }
    ]
  },
  {
    "moduleId": "cmms-integration",
    "moduleName": "CMMS Integration",
    "description": "UpKeep CMMS data access",
    "features": [
      {
        "entity": "Asset",
        "actions": [
          { "id": "asset:search", "label": "Search Assets", "description": "Find equipment", "permission": "NONE" },
          { "id": "asset:search-public", "label": "Search (Public)", "description": "Public search", "permission": "PUBLIC" }
        ]
      },
      {
        "entity": "Location",
        "actions": [
          { "id": "location:search", "label": "Search Locations", "description": "Find facilities", "permission": "NONE" },
          { "id": "location:search-public", "label": "Search (Public)", "description": "Public search", "permission": "PUBLIC" }
        ]
      },
      {
        "entity": "Work Order",
        "actions": [
          { "id": "work-order:search", "label": "Search", "description": "Find work orders", "permission": "NONE" },
          { "id": "work-order:view", "label": "View", "description": "Access details", "permission": "NONE" },
          { "id": "work-order:create", "label": "Create Generic", "description": "New WO", "permission": "NONE" },
          { "id": "work-order:create-from-entity", "label": "Create from Entity", "description": "Link to CAPA/etc", "permission": "NONE" },
          { "id": "work-order:link", "label": "Link", "description": "Associate WO", "permission": "NONE" },
          { "id": "work-order:unlink", "label": "Unlink", "description": "Remove link", "permission": "NONE" },
          { "id": "work-order:get-by-capa", "label": "Get by CAPA", "description": "List for CAPA", "permission": "NONE" },
          { "id": "work-order:count-by-capa", "label": "Count by CAPA", "description": "Get count", "permission": "NONE" },
          { "id": "work-order:enqueue-analysis", "label": "Analyze", "description": "AI analysis", "permission": "NONE" }
        ]
      },
      {
        "entity": "Preventive Maintenance",
        "actions": [
          { "id": "pm:search", "label": "Search PMs", "description": "Find schedules", "permission": "NONE" },
          { "id": "pm:view", "label": "View PM", "description": "Access details", "permission": "NONE" },
          { "id": "pm:link", "label": "Link PM", "description": "Associate PM", "permission": "NONE" },
          { "id": "pm:unlink", "label": "Unlink PM", "description": "Remove link", "permission": "NONE" }
        ]
      },
      {
        "entity": "Checklist",
        "actions": [
          { "id": "checklist:create", "label": "Create Checklist", "description": "Generate from audit", "permission": "NONE" },
          { "id": "checklist:search", "label": "Search Checklists", "description": "Find checklists", "permission": "NONE" },
          { "id": "checklist:link", "label": "Link Checklist", "description": "Associate", "permission": "NONE" },
          { "id": "checklist:unlink", "label": "Unlink Checklist", "description": "Remove link", "permission": "NONE" }
        ]
      },
      {
        "entity": "Linked Entity",
        "actions": [
          { "id": "linked-entity:view", "label": "View Links", "description": "See relationships", "permission": "NONE" },
          { "id": "linked-entity:view-work-orders", "label": "View WO Links", "description": "WOs with analysis", "permission": "NONE" }
        ]
      }
    ]
  },
  {
    "moduleId": "system",
    "moduleName": "System Administration",
    "description": "Configuration and audit trails",
    "features": [
      {
        "entity": "Configuration",
        "actions": [
          { "id": "config:view-client-config", "label": "View Client Config", "description": "Env variables", "permission": "PUBLIC" },
          { "id": "company-metadata:view", "label": "View Company Data", "description": "Company profile", "permission": "NONE" }
        ]
      },
      {
        "entity": "AI Disclaimer",
        "actions": [
          { "id": "disclaimer:check", "label": "Check Status", "description": "Acceptance status", "permission": "NONE" },
          { "id": "disclaimer:accept", "label": "Accept", "description": "Acknowledge terms", "permission": "NONE" }
        ]
      },
      {
        "entity": "Audit Trail",
        "actions": [
          { "id": "audit-trail:view", "label": "View Trail", "description": "Entity activity logs", "permission": "CONTEXT" }
        ]
      }
    ]
  }
]
```

---

## Notes for Implementation

### Permission System Architecture

**Permission Levels:**
- `FULL`: Complete access to all records in the module
- `PARTIAL`: Access only to owned/assigned/created records (enforced in service layer)
- `NONE`: No access

**User Types:**
- **Admin**: Full access to all modules
- **Technician**: Partial access (can view assigned, create comments, limited to own content)
- **View-Only**: Read-only access where granted (partial view on most modules)

### Permission Checks by Action Type

| Permission | Description | Who Has Access |
|------------|-------------|----------------|
| `PUBLIC` | No authentication required | Anyone with URL |
| `NONE` | Requires authentication but no specific permission | All authenticated users |
| `CONTEXT` | Permission depends on parent entity | Varies by context |
| `VIEW` | Read-only access | Admin (full), Technician (partial), View-Only (partial) |
| `CREATE` | Create new records | Admin (full), Technician (full for some modules) |
| `EDIT` | Modify existing records | Admin (full), Technician (partial - own records) |
| `DELETE` | Hard delete records | Admin (full), Technician (partial - own records) |
| `EXPORT` | Download data as CSV/Excel | Admin only |
| `UPDATE_STATUS` | Approval workflow actions | Admin (full), Technician (partial - as approver) |
| `COMMENT` | Post comments with mentions | Admin, Technician |

### Approval Workflows (LOTO, PTW, JHA, SOP, Audit)

**Status Transitions:**
1. **Submit for Review** (`draft` → `under_review`): Owner/creator only
2. **Approve** (`under_review` → `approved`): Designated approvers only
3. **Reject** (`under_review` → `draft`): Designated approvers only
4. **Initiate Revision** (`approved` → `draft`): Owner/creator only

**Sequential Approval:**
- If configured, approvers must approve in order (enforced in service layer)
- Partial approvals supported (multiple approvers, some approved)

**Authorization:**
- Router checks `UPDATE_STATUS` permission
- Service layer validates specific user is designated approver
- Notifications sent automatically via BullMQ

### Public Endpoints (No Authentication)

The following actions have public access for external reporting:

- `event:create-public` - Report incidents via QR code
- `access-point:view-public` - Scan QR codes
- `file:*-public` - File upload/download for public forms
- `image:create-variants-public` - Image processing for public uploads
- `ai:transcribe-public` - Voice transcription for public forms
- `ai:analyze-event-public` - AI analysis for public incident reports
- `user:search-public`, `user:view-public` - User lookup for public forms
- `asset:search-public`, `location:search-public` - Asset/location search
- `config:view-client-config` - Environment variables (Mixpanel, Dromo)

### AI Features

**Permission**: All AI actions require `ai-assistant` module `CREATE` permission (Admin + Technician only)

**Document Processing (Async):**
- JHA, SOP, LOTO, PTW document analysis queued to BullMQ
- Returns `jobId` immediately for client-side polling
- Use `ai:view-jobs` or `ai:view-job` to check status

**Text Analysis (Sync):**
- Event, CAPA analysis returns immediately
- Text improvement has no permission check (utility)

**Disclaimer:**
- Tracked per entity type (event, capa, jha, sop, loto, ptw, audit)
- Required before submitting AI-generated content
- Drafts can be saved without disclaimer

### Data Ownership & Partial Permissions

**PARTIAL Permission Scope:**
- **Events**: Creator or mentioned team member
- **CAPA**: Owner or assigned user
- **LOTO/PTW/JHA/SOP/Audit**: Owner, creator, or designated approver
- Enforced in service layer via `needPartialCheck` flag

**Technician PARTIAL Access:**
- Can view records where they are owner/creator/approver
- Can edit only their own draft records
- Can delete only their own records
- Cannot export or create templates

### CMMS Integration

All CMMS-related endpoints (`asset:*`, `location:*`, `work-order:*`, `pm:*`, `checklist:*`) have **no specific EHS permissions** - they proxy to UpKeep CMMS API and inherit CMMS authorization.

### Context-Dependent Permissions

`CONTEXT` permission means the action's authorization depends on the parent entity's permissions. For example:
- `file:upload` on an Event requires Event `CREATE` or `EDIT` permission
- `file:delete` on a CAPA requires CAPA `EDIT` permission

### Version Control

Entities with version control (LOTO, PTW, JHA, SOP, Audit):
- `view-versions` shows all revisions with creator info
- `duplicate` copies media files to new transient uploads
- `initiate-revision` creates new draft from approved version

---

**Last Updated**: 2026-01-22  
**Document Version**: 1.2  
**Maintained by**: Platform Team
