# Functional Specification: User Management & Custom Roles (RBAC)

**Document Version:** 1.0  
**Date:** January 23, 2026  
**Status:** ✅ Approved for Implementation  
**Author:** Product Management  
**Stakeholders:** Engineering, Security, Compliance

---

## 1. Overview

### 1.1 Objective

The primary objective of the User Management and Role-Based Access Control (RBAC) module is to establish a secure, scalable, and granular permission infrastructure for the Environmental, Health, and Safety (EHS) platform. This functional specification outlines the architectural pivot from a legacy, coupled model—where safety permissions were strictly inherited from the Computerized Maintenance Management System (CMMS)—to a **Decoupled Modular Role Architecture**. This transition is critical to resolving the "Contextual Role Conflict," a scenario where the operational responsibilities of safety managers do not align with their maintenance system privileges.

This module serves as the foundational security layer for the entire EHS ecosystem. It empowers organizations to enforce a "Zero-Trust" model where necessary, granting precise authorities such as "Global Admin" capabilities to safety directors without exposing sensitive maintenance asset databases to accidental modification. Furthermore, it facilitates the seamless integration of field technicians into safety workflows—allowing them to augment work orders with safety checklists—without requiring broad edit rights that would violate the Principle of Least Privilege.

**Core Capability:** Administrators can create custom roles with fine-grained permissions, invite users with location-based data scoping, and maintain comprehensive audit trails for all permission changes.

**Key Problem Scenarios Resolved:**

- **The Desmoine Scenario:** Safety directors (e.g., Jane, Head of Safety) who hold "View-Only" CMMS access can now create Work Orders from Safety Incidents via the API Interceptor Pattern, bypassing standard CMMS permission checks while maintaining asset data protection.
- **The Field Execution Paradox:** Maintenance technicians can attach safety artifacts (Job Hazard Analysis, safety checklists) to Work Orders without requiring full "Edit" permissions on the Work Order itself, enabling proper safety documentation without over-permissioning.

### 1.2 Compliance & Security Standards

To ensure strict data integrity, auditability, and regulatory adherence, the system **Must** be engineered to meet the following compliance standards:

- **SOC 2 Type II Compliance:** The architecture **Must** support rigorous change management logging. All modifications to permission configurations—whether system-defined or custom—**Must** be logged with detailed "before" and "after" differentials (diffs) to provide a transparent history of access control changes.
- **Least Privilege Principle:** The system's default permission state **Must** be "Deny All." Users **Must** receive only the minimum permissions explicitly granted by their assigned role. Access to sensitive modules, particularly the OSHA Compliance Engine (Forms 300, 301, 300A), is restricted exclusively to authorized administrators, hidden entirely from view-only or standard users.
- **Data Sovereignty & Location Scoping:** Access **Must** be strictly scoped to the user's assigned node within the 6-level recursive location hierarchy. Each level is semantically flexible and can be named according to organizational structure:
  - **Example 1:** Level 1: Global → Level 2: Region/Business Unit → Level 3: Country/State → Level 4: Site/Facility → Level 5: Area/Department → Level 6: Asset/Equipment
  - **Example 2:** Level 1: Business Unit → Level 2: Division → Level 3: Plant → Level 4: Building → Level 5: Floor → Level 6: Room
  
  The system **Must** enforce strict isolation, preventing users from viewing or querying data associated with sibling nodes or parent nodes outside their explicit assignment.
- **Audit Trail Integrity:** To satisfy ISO 45001 and OSHA record-keeping requirements, all critical actions—including Role Creation, Permission Modification, and User Assignment—**Must** be immutably logged. These logs **Must** include the actor_id, timestamp (UTC), ip_address, and context_metadata to ensure non-repudiation.
- **Zero-Trust Visibility:** For high-risk roles, such as External Auditors, the system **Must** enforce a conditional access model. Visibility is not granted by role alone but requires explicit tagging (e.g., inclusion in notify_team_members or watchers) to view specific records, ensuring sensitive injury data remains private.

### 1.3 Scope

This specification covers four core workflows:

1. **User Invitation:** Inviting new users via email with token-based authentication and location assignment
2. **Default System Roles:** Handling immutable, pre-configured template roles
3. **Custom Role Creation:** A multi-step wizard for creating roles with granular permission control
4. **Role Assignment:** Associating users with System or Custom roles and managing the lifecycle

---

## 2. Roles & Definitions

### 2.1 Actors and Personas

The system interaction is defined by distinct actor types, each with specific responsibilities, constraints, and relationships to the underlying data model.

#### 2.1.1 Super Admin (Global Administrator)

- **Definition:** The highest-level authority within the EHS tenant, typically representing the "Head of Safety" or Corporate Safety Director (e.g., Persona: Jane).
- **Capabilities:**
  - **Full CRUD Access:** Possesses unrestricted Create, Read, Update, and Delete capabilities across all modules, including Safety Events, CAPA, JHA, SOP, LOTO, and PTW.
  - **Exclusive Compliance Access:** Only Super Admins can access the Compliance Engine to manage sensitive OSHA Logs (300, 301, 300A). This module is invisible to all other roles.
  - **Cross-Module Authority:** Via the API Interceptor Pattern, this actor can trigger Work Order creations in the CMMS even if their CMMS-specific role is "View-Only," resolving the "Desmoine Scenario" where safety leaders lack maintenance admin rights.
- **Constraint:** The system **Must** prevent the deletion or deactivation of the last remaining user with the Super Admin role to prevent irreversible system lockout.

#### 2.1.2 User Administrator (Location Administrator)

- **Definition:** A site-level manager responsible for a specific facility or region (e.g., Persona: John, Plant Manager).
- **Capabilities:**
  - **Scoped Management:** Manages users and assigns roles, but strictly within their assigned location scope.
  - **Administrative Powers:** Possesses "Admin-like" powers (e.g., Approve CAPA, Close Incident) confined strictly to data tagged with their assigned Location ID or its descendants.
- **Constraint:** Strictly blocked from viewing or managing records associated with sibling locations (e.g., a Texas admin cannot see New York data) or modifying System Roles.

#### 2.1.3 End User (Technician / Limited Tech)

- **Definition:** The primary executor of safety tasks and data entry, such as a Machine Operator or Maintenance Technician (e.g., Persona: Mike).
- **Capabilities:**
  - **Ownership-Based Editing:** Can only edit records they personally created or are explicitly assigned to.
  - **Work Order Augmentation:** Can attach safety artifacts (checklists, JHAs) to Work Orders without possessing "Edit" rights for the Work Order itself, facilitating the "Field Execution Paradox" resolution.
- **Constraint:** Strictly prohibited from deleting any record. Subject to a strict "One role per user" enforcement (1:1 relationship).

#### 2.1.4 Conditional View-Only (Auditor)

- **Definition:** External legal counsel, auditors, or temporary contractors (e.g., Persona: Sarah).
- **Capabilities:**
  - **Zero-Trust Visibility:** By default, this role sees **0 results** in any list view. Visibility is granted only when the user's ID is explicitly found in a record's notify_team_members, watchers, or assignee fields.
- **Constraint:** The OSHA module is strictly inaccessible (HTTP 403). All UI inputs are disabled, and action buttons (Save, Edit) are removed from the DOM.

### 2.2 Role Types

#### System Roles (Immutable)

**Definition:** Pre-configured template roles provided by UpKeep, designed for common EHS organizational structures.

**Characteristics:**
- **Visual Indicator:** Blue "System" badge with lock icon
- **Name Editing:** Disabled (field grayed out with hint: "System role names cannot be changed")
- **Permission Editing:** Read-only (checkboxes disabled with hint: "Clone this role to create a customizable version")
- **Deletion:** Cannot be deleted (Delete action hidden from UI actions menu)
- **Duplication:** Can be cloned to create a Custom role with "(Copy)" suffix

**Examples:**
- EHS Manager (full access to all modules)
- Site Safety Lead (events, CAPA, audits)
- Safety Inspector (read-only with incident reporting)

#### Custom Roles (Mutable)

**Definition:** User-created roles with fully customizable permissions tailored to organizational needs.

**Characteristics:**
- **Visual Indicator:** Purple custom role badge
- **Name Editing:** Fully editable (3-50 characters, unique validation)
- **Permission Editing:** Full control over all permission checkboxes
- **Deletion:** Soft-delete with cascade protection (blocked if assigned to active users)
- **Propagation:** Changes immediately affect all assigned users (no versioning)

---

## 3. Workflow: Custom Role Creation (The Wizard)

### 3.1 Entry Points

- **Primary:** Settings → People → Custom Roles tab → "Create Role" button
- **Alternative:** Settings → Custom Roles (standalone page) → "Create Role" button

### 3.2 Creation Mode Selection

**User Preference Toggle:** Modal vs. Fullscreen (saved in localStorage)

**Toggle Switch UI:**
```
[Modal] ○───○ [Fullscreen]
```

- **Modal Mode:** Compact overlay (default), suitable for quick role creation
- **Fullscreen Mode:** Expanded view within Custom Roles tab, better for complex permission configuration

**Persistence:** User's mode preference Must persist across sessions via localStorage key: `ehs_role_creation_mode`

---

### 3.3 Step 1: Role Identity

#### 3.3.1 Role Name Input

**Field Specifications:**
- **Label:** "Role Name" with red asterisk (*)
- **Input Type:** Text field
- **Placeholder:** "e.g., Safety Coordinator, Site Inspector"
- **Validation Rules:**
  - Required (cannot be empty)
  - Minimum length: 3 characters
  - Maximum length: 50 characters
  - Uniqueness: Case-insensitive duplicate check
  - Real-time validation on blur and submit

**Error Messages:**
- Empty: "Role name is required"
- Too short: "Role name must be at least 3 characters"
- Duplicate: "A role named '[name]' already exists"

**System Role Editing:**
- Field Disabled: True
- Hint Text: "System role names cannot be changed"

#### 3.3.2 Clone from Existing Role (Optional)

**Field Specifications:**
- **Label:** "Start from existing role" with gray text "(optional)"
- **Input Type:** Select dropdown
- **Default Value:** "Create from scratch"

**Dropdown Structure:**
```
Create from scratch
─────────────────────
System Roles
  ├─ EHS Manager (32 permissions)
  ├─ Site Safety Lead (24 permissions)
  └─ Safety Inspector (18 permissions)
─────────────────────
Custom Roles
  ├─ Regional Coordinator (28 permissions)
  └─ Compliance Officer (22 permissions)
```

**Behavior:**
- Selecting a role pre-fills the permission matrix with that role's configuration
- User can customize permissions after selection
- Hint text updates: "✓ Permissions pre-filled from selected role. You can customize them below."

**Display Only When:** Creating new role (not shown in edit mode)

---

### 3.4 Step 2: Permission Matrix Configuration

#### 3.4.1 Simple Mode vs. Advanced Mode

**Mode Toggle UI:**
```
Simple ○───● Advanced
```

**Simple Mode (5 Core Modules):**
- **Modules:** Events, CAPA, OSHA, Access Points, LOTO
- **Actions Grouped By Category:**
  1. View
  2. Create & Edit
  3. Approvals
  4. Collaboration
  5. Archive & Delete
  6. Reporting
- **Category-Level Controls:** "Select All" toggle for each category across all entities

**Advanced Mode (9 Modules):**
- **Modules:** Events, CAPA, OSHA, Work Orders, Access Points, LOTO, PTW, JHA, SOP, Audit
- **Individual Action Controls:** Checkbox for each action (e.g., "Create Event", "Delete CAPA", "Approve JHA")
- **3-Level Hierarchy:**
  - Module → Entity → Actions
  - Example: OSHA → OSHA Report (300/301) → Create, View, Edit, Archive, Delete, Export

#### 3.4.2 Mode Switching Rules

**Advanced → Simple Mode Switching:**

**Condition Check:** System Must detect if any enabled permissions belong to advanced-only modules (PTW, JHA, SOP, Audit)

**If Advanced-Only Permissions Enabled:**
- Display confirmation modal:
  - **Title:** "Switch to Simple Mode?"
  - **Message:** "Switching to Simple Mode will hide permissions for 4 modules (PTW, JHA, SOP, Audit). These permissions will remain active but won't be visible in Simple Mode. Continue?"
  - **Actions:**
    - "Cancel" (gray button, returns to Advanced Mode)
    - "Switch to Simple Mode" (blue button, confirms switch)

**If No Advanced-Only Permissions:**
- Switch immediately without confirmation

**Simple → Advanced Mode Switching:**
- No confirmation required (reveals more options, no data loss)
- Mode switches immediately

#### 3.4.3 Permission Matrix UI Components

**Global Controls:**
- **"Select All" Button:** Enables all permissions across all modules
- **"Deselect All" Button:** Disables all permissions across all modules
- Position: Top-right of matrix

**Module-Level Controls:**
- **Module Header Row:** Module name with "Select All" checkbox
- **Behavior:** Checking module checkbox enables all entity actions within that module
- **State Indicators:**
  - Fully Selected: Solid blue checkmark
  - Partially Selected: Blue dash (indeterminate state)
  - Not Selected: Empty checkbox

**Entity-Level Controls (Advanced Mode Only):**
- **Entity Header Row:** Entity name with "Select All" checkbox
- **Behavior:** Checking entity checkbox enables all actions for that entity
- **State Indicators:** Same as module-level

**Action-Level Controls:**
- **Checkbox per Action:** Individual permission toggle
- **Label Format:** Action label + description (e.g., "Create Events" - "Report new safety incidents")
- **Disabled State (System Roles):** Grayed out with hint on hover

#### 3.4.4 OSHA-Specific Location Permissions

**Trigger Condition:** If any OSHA module permission is enabled (in `permissions.osha` object)

**UI Component:** OSHALocationSelector accordion below main permission matrix

**Behavior:**
1. System scans `permissions.osha` for any `true` values
2. If found, display OSHA Location Permissions section (collapsed by default)
3. User Must configure at least one establishment with OSHA permissions

**Validation:**
- **Rule:** If OSHA module enabled globally, at least one establishment Must have OSHA permissions
- **Error Message:** "At least one OSHA permission must be configured for at least one establishment when OSHA module is enabled"
- **Display:** Red error banner below permission matrix

**Per-Establishment Configuration:**
```
Establishment: Plant A (Chicago, IL)
  ├─ OSHA Report (300/301): ☑ Create ☑ View ☑ Edit ☐ Delete
  ├─ OSHA 300A Summary: ☑ View ☑ Certify ☐ Archive
  └─ OSHA Agency Report: ☑ Create ☑ View ☐ Submit
```

---

### 3.5 Step 3: Summary & Confirmation

#### 3.5.1 Real-Time Permission Count

**Display Location:** Below role name input, updated on every permission toggle

**Format:** `"X permissions enabled"` or `"X permission enabled"` (singular)

**Count Logic:**
- Simple Mode: Count only permissions visible in Simple Mode modules
- Advanced Mode: Count all enabled permissions across all modules

**Example:** `"24 permissions enabled"` displayed in blue badge

#### 3.5.2 Pre-Save Validation

System Must validate the following before allowing save:

1. **Role Name:** Not empty, ≥3 characters, unique
2. **Permissions:** At least one permission enabled
3. **OSHA Locations:** If OSHA module enabled, at least one establishment configured

**Validation Feedback:**
- Display errors in red banner above footer
- Highlight invalid fields with red border
- Scroll to first error automatically

#### 3.5.3 Save Actions

**Create Role Button:**
- Enabled when all validations pass
- Disabled (grayed out) when validations fail
- Label: "Create Role" (new) or "Save Changes" (edit)

**Cancel Button:**
- Label: "Cancel"
- Behavior: Prompt confirmation if unsaved changes exist
- Confirmation message: "You have unsaved changes. Are you sure you want to cancel?"

**Post-Save Behavior:**
- Close modal/exit fullscreen view
- Return to Custom Roles list view
- Display success toast: "Role '[name]' created successfully" (green, 3 seconds)
- New role appears at top of table

#### 3.5.4 System Role Cloning

**Automatic Naming:** When duplicating a System or Custom role, append " (Copy)" suffix

**Examples:**
- "EHS Manager" → "EHS Manager (Copy)"
- "Regional Coordinator (Copy)" → "Regional Coordinator (Copy) (Copy)"

**Validation:** Duplicate name check applies to generated name (incremental if needed)

---

## 4. Workflow: User Invitation & Assignment

### 4.1 Entry Points

- **Primary:** Settings → People → Users tab → "Add User" button
- **Context Menu:** User row → Actions (⋮) → "Edit"

### 4.2 Invite User Modal

#### 4.2.1 Modal Header

**Title:** "Add New User" (create mode) or "Edit User" (edit mode)

**Subtitle:** "Provision a new EHS user with role and location" (create) or "Update user information and assignments" (edit)

**Icon:** Blue user-plus icon in rounded square background

**Close Button:** X icon (top-right)

#### 4.2.2 Input Fields

**First Name (Required)**
- **Label:** "First Name" with red asterisk (*)
- **Placeholder:** "John"
- **Validation:** Cannot be empty

**Last Name (Required)**
- **Label:** "Last Name" with red asterisk (*)
- **Placeholder:** "Doe"
- **Validation:** Cannot be empty

**Email Address (Required)**
- **Label:** "Email Address" with red asterisk (*)
- **Placeholder:** "john.doe@company.com"
- **Validation:**
  - Cannot be empty
  - Must match regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Duplicate check (case-insensitive)
- **Error Messages:**
  - Empty: "Email is required"
  - Invalid format: "Please enter a valid email address"
  - Duplicate (Active user): "A user with email '[email]' already exists"
  - Duplicate (Pending user): Show "Resend Invitation" option instead of error

#### 4.2.3 Copy from Existing User (Create Mode Only)

**Field Specifications:**
- **Label:** "Copy Role & Location from Existing User (Optional)"
- **Input Type:** Select dropdown
- **Default Value:** "Create from scratch"
- **Display Condition:** Only shown in create mode (hidden in edit mode)

**Dropdown Structure:**
```
Create from scratch
─────────────────────
John Smith (EHS Manager - North America > USA)
Jane Doe (Site Safety Lead - North America > USA > Plant A)
Bob Johnson (Safety Inspector - Europe > UK > London)
```

**Behavior:**
- Selecting a user pre-fills Role and Location fields
- User can modify pre-filled values before saving
- Hint text: "Pre-fill role and location from an existing user (you can still edit them)"

**Filtered List:** Show only Active users (exclude Inactive and Pending)

#### 4.2.4 Role Selector (Required)

**Field Specifications:**
- **Label:** "Role" with red asterisk (*)
- **Input Type:** Select dropdown
- **Default Value:** Empty (placeholder: "Select a role...")

**Dropdown Structure:**
```
Select a role...
─────────────────────
System Roles
  ├─ EHS Manager (Template)
  ├─ Site Safety Lead (Template)
  └─ Safety Inspector (Template)
─────────────────────
Custom Roles
  ├─ Regional Coordinator
  ├─ Compliance Officer
  └─ Field Technician
```

**Type Indicators:**
- System roles: " (Template)" suffix
- Custom roles: No suffix

**Validation:**
- Cannot be empty
- Error message: "Please select a role"

**Filtering Rules:**
- Exclude soft-deleted roles from dropdown
- Show active System and Custom roles only

#### 4.2.5 Location Assignment (Required)

**Field Specifications:**
- **Label:** "Assigned Location" with red asterisk (*)
- **Input Type:** LocationFilterDropdown (hierarchical tree selector)
- **Default Value:** None

**Component Behavior:**

**Initial State:**
- Location tree starts **collapsed** (no folders expanded)
- Clean, minimal view to reduce cognitive load
- User can progressively drill down by clicking expand arrows

**6-Level Recursive Hierarchy Structure:**

The selector **Must** support the 6-level recursive tree structure. Organizations define their own hierarchy semantics based on operational needs:

**Example Configuration 1 (Geographical):**
- Level 1: Global Operations
- Level 2: Region (North America, Europe, APAC)
- Level 3: Country/State (USA, Canada, Mexico)
- Level 4: Site/Facility (Chicago Plant, Seattle DC)
- Level 5: Area/Department (Production Floor, Warehouse)
- Level 6: Asset/Equipment (Line 3, Loading Dock)

**Example Configuration 2 (Organizational):**
- Level 1: Business Unit
- Level 2: Division
- Level 3: Plant
- Level 4: Building
- Level 5: Floor
- Level 6: Room

**Navigation Flow:**
1. User clicks dropdown to open location selector
2. Tree shows top-level nodes only (e.g., "Global Operations", "North America", "Europe")
3. User clicks arrow (▶) next to a node to expand and see children
4. User continues expanding until reaching desired location
5. User clicks checkbox to select final location
6. All child locations automatically included (non-optional)

**Search Functionality:**
- **Purpose:** Quick discovery of specific locations without manual navigation
- **Behavior:**
  - User types location name (e.g., "Toronto")
  - System finds matching locations AND includes their children
  - Tree expands to show matched nodes + their parent path
  - **Critical:** Children of matched nodes remain visible but collapsed
  - User can expand matched location to explore its sub-locations
- **Use Case:** "I know the facility name but want to see what areas/assets are inside"

**Visual Feedback:**
- Selected location: Blue background highlight
- Child locations: Lighter blue background with checkmark (auto-included)
- Counter shows: "X selected (with sub-locations)" to clarify scope

**Breadcrumb Display:**
- Selected location shown as breadcrumb: "North America > USA > Plant A"
- Format: Parent > Parent > Selected Node
- Displays full path for context

**Dynamic Inheritance Rule:**
- User inherits access to selected node + all descendant nodes
- **Critical:** When new child locations are created under assigned node, user automatically gains access without requiring reassignment
- **Revocation:** If assigned location is deleted/archived, user loses access to that subtree until reassigned
- **Non-Optional:** Children are ALWAYS included (no toggle to exclude them)

**Validation:**
- Cannot be empty
- Error message: "Location assignment is mandatory. Please select a location node."

**Warning Banner (If Empty After Submit Attempt):**
- **Background:** Amber (#FEF3C7)
- **Text Color:** Amber dark (#92400E)
- **Icon:** Warning triangle
- **Message:** "**Location assignment is mandatory.** Please select a location node to define this user's data access scope."

**Hint Text:**
- "User will have access to this location and all child locations automatically"

**UX Principles:**
- **Progressive Disclosure:** Start collapsed, expand on demand
- **Search-Then-Explore:** Find parent location via search, then manually explore children
- **No Overwhelming Views:** Avoid showing hundreds of locations at once
- **Clear Selection Scope:** Visual indicators show exactly what's included

#### 4.2.6 Validation Logic

**Duplicate Email Detection:**

**Case 1: Active User with Same Email**
- Block submission
- Display error: "A user with email '[email]' already exists"

**Case 2: Pending User with Same Email (Invitation Not Accepted)**
- Do NOT block submission
- Replace "Add User" button with "Resend Invitation" button
- Button color: Blue (primary action)
- Display info banner (blue background):
  - Icon: Info circle
  - Message: "This email has a pending invitation. Last sent on [date]. Click 'Resend Invitation' to send a new link."

**Resend Invitation Behavior:**
1. Generate new invitation token (7-day expiration)
2. Invalidate previous token
3. Send email with new invitation link
4. Update `lastInvitationSentAt` timestamp in database
5. Display success toast: "Invitation resent to [email]" (green, 3 seconds)
6. Close modal

**Location Scope Validation:**
- Mandatory field
- Cannot submit without location selection
- Amber warning banner appears on submit attempt if empty

#### 4.2.7 Footer Actions

**Cancel Button:**
- Label: "Cancel"
- Style: Gray border, gray text
- Behavior: Close modal without saving

**Submit Button:**
- Label: "Add User" (create) or "Save Changes" (edit) or "Resend Invitation" (pending)
- Style: Blue background, white text
- State: Disabled if validation fails
- Behavior: Validate → Save → Close modal → Show success toast

---

### 4.3 User Lifecycle States

#### 4.3.1 Invited (Pending)

**Initial State:** User record created with status "Pending"

**Invitation Email:**
- Subject: "You've been invited to UpKeep EHS"
- Body: Invitation message with unique token link
- Token: JWT with 7-day expiration
- Link format: `https://app.upkeep.com/ehs/invite/{token}`

**UI Indicators:**
- **Status Badge:** Amber background with "Pending" text
- **Badge Color:** #FBBF24 (amber-400)
- **Last Invitation Sent:** Display date below email: "Invitation sent on Jan 15, 2026"

**Actions Menu:**
- "Resend Invitation" (primary)
- "Edit" (change role/location before acceptance)
- "Deactivate" (cancel invitation)

**Token Expiration:**
- **Duration:** 7 days from generation
- **Behavior:** After expiration, user cannot accept invitation via expired link
- **Resolution:** Admin clicks "Resend Invitation" to generate fresh token
- **Optional:** System sends reminder email 1 day before expiration (configurable)

#### 4.3.2 Active

**Transition Trigger:** User clicks invitation link and completes onboarding (sets password, accepts terms)

**Status Change:**
- Status: "Pending" → "Active"
- `activatedAt` timestamp recorded
- Full system access granted based on assigned role and location

**UI Indicators:**
- **Status Badge:** Green background with "Active" text
- **Badge Color:** #10B981 (green-500)

**Actions Menu:**
- "Edit" (change role, location, or name)
- "Deactivate" (revoke access)

#### 4.3.3 Inactive

**Transition Trigger:** Admin clicks "Deactivate" action

**Behavior:**
- Access revoked immediately (user cannot log in)
- Data preserved (no deletion)
- Role and location assignments unchanged
- Audit trail records deactivation event

**UI Indicators:**
- **Status Badge:** Gray background with "Inactive" text
- **Badge Color:** #6B7280 (gray-500)

**Actions Menu:**
- "Edit" (change assignments while inactive)
- "Activate" (restore access)

#### 4.3.4 Reactivation

**Transition Trigger:** Admin clicks "Activate" action on Inactive user

**Behavior:**
- Status: "Inactive" → "Active"
- Access restored immediately with unchanged role and location
- User can log in with existing credentials
- Audit trail records reactivation event

---

### 4.4 Bulk User Import

The bulk user import feature enables administrators to provision or update multiple users simultaneously via CSV upload, facilitating rapid onboarding and organizational restructuring.

#### 4.4.1 Entry Points

**Trigger:** "Import Users" button (Secondary action on User Management List)

**Button Styling:**
- Position: Top-right of user list, next to "Add User" button
- Style: Secondary button (gray border, gray text)
- Icon: Upload icon
- Label: "Import Users"

#### 4.4.2 Workflow

**Step 1: Download Template**

User downloads a CSV template containing the required headers:

**Template Structure:**
```csv
First Name,Last Name,Email,Role Name,Location Path
```

**Header Definitions:**
- **First Name:** Required. User's given name.
- **Last Name:** Required. User's family name.
- **Email:** Required. Must be valid email format. Used as unique identifier.
- **Role Name:** Required. Must match an existing System Role or Custom Role name (case-insensitive).
- **Location Path:** Required. Full hierarchical path using " > " separator (e.g., "North America > USA > Plant A").

**Example Template Content:**
```csv
First Name,Last Name,Email,Role Name,Location Path
John,Doe,john.doe@company.com,Safety Coordinator,North America > USA > Plant A
Jane,Smith,jane.smith@company.com,EHS Manager,North America > Canada > Toronto DC
Mike,Johnson,mike.j@company.com,Safety Inspector,Europe > UK > London Plant
```

**Step 2: Upload CSV**

User uploads the populated CSV file.

**Upload Component:**
- Drag-and-drop zone or file picker
- Accepted file types: `.csv` only
- Max file size: 5MB (approximately 50,000 rows)
- Progress indicator during upload

**Step 3: Validation & Preview**

The system parses the file and validates each row against the following rules:

**Validation Rules:**

1. **Email Format:** Must match standard email regex
2. **Email Uniqueness (Per File):** No duplicate emails within the uploaded CSV
3. **Role Existence:** Role Name must match an existing System or Custom Role
   - **Critical:** If a Custom Role is specified but does not exist, the row fails
   - **Resolution:** Users **Must** create Custom Roles manually *before* attempting bulk import
4. **Location Path Validity:** Location path must match an existing location hierarchy
   - System performs fuzzy matching to account for minor variations
   - If no match found, row fails with specific error

**Validation Results Display:**

**Success State:**
- Green checkmark icon
- Message: "All X rows validated successfully. Ready to import."
- "Import Users" button enabled

**Partial Success State:**
- Amber warning icon
- Message: "X rows validated successfully. Y rows have errors. Review errors below."
- Failed rows displayed in red with specific error messages
- "Import Valid Rows" button enabled (imports only successful rows)
- "Download Error Report" button available

**Failure State:**
- Red error icon
- Message: "All rows have errors. Please correct the issues and try again."
- "Import Users" button disabled
- "Download Error Report" button available

**Error Report Format (CSV):**
```csv
Row Number,First Name,Last Name,Email,Error Message
2,Jane,Smith,jane.smith@company.com,"Role 'Regional Manager' does not exist. Create this role before importing."
5,Bob,Williams,invalid-email,"Invalid email format"
```

#### 4.4.3 Import Logic

**Case 1: New User (Email Not Found)**
- System creates new user record with status "Pending"
- Sends invitation email with 7-day token
- Assigns specified role and location

**Case 2: Existing User (Email Match Found)**
- System treats the row as an **update request**
- **Bulk Update Behavior:**
  - Updates user's Role to match CSV data
  - Updates user's Location to match CSV data
  - Preserves user's status (Active/Inactive/Pending)
  - Does NOT send new invitation email
  - Logs role and location changes in audit trail
- **Use Case:** Enables rapid mass-migration of users to new role types during organizational restructuring

**Conflict Resolution:**
- If user's current status is "Inactive," bulk update proceeds but user remains Inactive
- If user's current role is deleted, bulk update replaces with new valid role
- Location changes apply inheritance rules (user gains access to new subtree, loses access to old subtree)

#### 4.4.4 Post-Import Behavior

**Success Toast:**
- Message: "X users imported successfully. Y users updated."
- Color: Green
- Duration: 5 seconds
- Action: "View Users" link (navigates to filtered user list)

**Audit Log Entries:**
- Event: `users.bulk_imported`
- Metadata includes:
  - Total rows processed
  - New users created count
  - Existing users updated count
  - Failed rows count
  - Actor ID (admin who performed import)
  - Timestamp
  - Uploaded filename

**Error Handling:**
- Display validation errors per row with specific error messages
- Allow partial import (successful rows imported, failed rows reported)
- Provide downloadable error report for troubleshooting
- Failed rows do NOT block successful row processing

#### 4.4.5 Business Rules

1. **Role Pre-Existence Requirement:**
   - System validates that Custom Role names exist before import
   - If Custom Role missing, row fails with actionable error message
   - System Roles always available (cannot be deleted)

2. **Location Path Matching:**
   - System performs case-insensitive matching on location names
   - Trailing/leading spaces are trimmed automatically
   - Path separators normalized (spaces around " > " ignored)

3. **Duplicate Prevention:**
   - Within CSV: System detects duplicate emails and flags as error
   - Cross-system: System uses email as unique identifier for update/create decision

4. **Permission Requirements:**
   - Only Super Admins and User Administrators can perform bulk import
   - Users with location-scoped admin rights can only import users within their assigned location subtree

---

## 5. View Pages (The Interface)

### 5.1 Custom Roles List View

#### 5.1.1 Page Header

**Title:** "Custom Roles"

**Subtitle:** "Create and manage custom roles with granular permissions for your EHS team"

**Mode Toggle (Top-Right):**
```
Simple Mode ○───○ Advanced Mode
```
- Affects permission counts displayed in table
- Persisted in localStorage
- Blue info banner below toggle explaining current mode

#### 5.1.2 Search & Actions Bar

**Search Field:**
- **Placeholder:** "Search roles..."
- **Icon:** Magnifying glass (left side)
- **Width:** Max 400px
- **Behavior:** Real-time filter on role name (case-insensitive)

**Create Role Button:**
- **Label:** "+ Create Role"
- **Style:** Blue background, white text
- **Position:** Right side
- **Behavior:** Opens role creation modal/fullscreen based on user preference

**Mode Toggle Switch (Next to Button):**
```
[Modal] ○───○ [Fullscreen]
```
- User preference for role creation mode
- Saved in localStorage

#### 5.1.3 Roles Table

**Table Columns:**

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| Role Name | 35% | Left | Name + System badge (if applicable) |
| Permissions | 20% | Left | Count badge (e.g., "24 permissions") |
| Type | 15% | Left | "Template" or "Custom" |
| Created | 20% | Left | Date (e.g., "Jan 15, 2026") |
| Actions | 10% | Right | Three-dot menu |

**Row Styling:**
- Hover: Light gray background (#F9FAFB)
- Height: 64px
- Border: Bottom border (#E5E7EB)

**Role Name Column:**
- **System Role Display:**
  ```
  EHS Manager [System]
  ```
  - Badge: Blue background (#DBEAFE), blue text (#1E40AF), lock icon
- **Custom Role Display:**
  ```
  Regional Coordinator
  ```
  - No badge

**Permissions Column:**
- **Badge Style:** Blue background (#DBEAFE), blue text (#1E40AF), rounded
- **Format:** "[count] permission(s)" (singular if count = 1)
- **Count Logic:** Based on current Simple/Advanced mode selection

**Actions Column:**
- **Icon:** Three vertical dots (⋮)
- **Menu Items:**
  - "Edit" (System roles) or "Edit" (Custom roles)
  - "Duplicate" (both)
  - "Delete" (Custom roles only, hidden for System roles)

**Empty State:**
- **Icon:** Shield with checkmark (gray, centered)
- **Title:** "No custom roles yet" (or "No roles found" if search active)
- **Message:** "Create your first custom role to define specific permissions for your team"
- **Action:** "Create First Role" button (blue)

#### 5.1.4 Actions Menu Behavior

**Edit Action:**
- **System Roles:** Opens in read-only mode with "Clone to customize" hint
- **Custom Roles:** Opens with full edit capability
- **Modal/Fullscreen:** Based on user preference

**Duplicate Action:**
- Creates new role with " (Copy)" suffix
- All permissions copied from source
- Opens in edit mode immediately
- Success toast: "Role duplicated. Edit and save to create '[name] (Copy)'"

**Delete Action:**
- **Pre-Check:** System checks if role is assigned to active users
- **If Assigned Users Exist:**
  - Display error modal:
    - **Title:** "Cannot Delete Role"
    - **Message:** "This role is currently assigned to N active user(s). Please reassign these users to a different role before deleting."
    - **Action:** "View Assigned Users" button (navigates to filtered user list showing assigned users)
- **If No Assigned Users:**
  - Display confirmation dialog:
    - **Title:** "Delete Role?"
    - **Message:** "Are you sure you want to delete the role '[name]'? This action cannot be undone."
    - **Actions:** "Cancel" (gray), "Delete" (red)
- **Post-Delete:**
  - Soft-delete (set `deletedAt` timestamp)
  - Remove from table
  - Success toast: "Role '[name]' deleted" (green, 3 seconds)

---

### 5.2 Role Detail View (Edit Mode)

#### 5.2.1 Modal/Fullscreen Layout

**Modal Mode:**
- **Width:** Max 800px
- **Height:** Max 90vh (scrollable content)
- **Position:** Centered on screen
- **Backdrop:** Dark overlay (50% opacity)

**Fullscreen Mode:**
- **Layout:** Replaces Custom Roles list view
- **Header:** "Back to Roles" button (top-left) with left arrow icon
- **Content:** Full-width form with expanded permission matrix

#### 5.2.2 Header Section

**Back Button (Fullscreen Only):**
- **Label:** "← Back to Roles"
- **Style:** Gray text, hover background
- **Behavior:** Returns to list view (prompts if unsaved changes)

**Title:**
- "Create Custom Role" (new)
- "Edit Role" (existing)

**Subtitle:**
- "Define a new role with specific permissions" (new)
- "Update role name and permissions" (existing)

**Close Button (Modal Only):**
- X icon (top-right corner)

#### 5.2.3 Form Content

**Role Name Input:**
- Full-width (max 500px)
- Red border if validation error
- Disabled for System roles with hint below

**Base Role Selector (Create Mode Only):**
- Dropdown with System and Custom role groups
- Shows permission count per role
- Hint text updates based on selection

**Simple/Advanced Mode Toggle:**
- Position: Top-right of permission matrix section
- Includes mode description banner below toggle

**Permission Matrix:**
- Full-width scrollable container
- Global controls at top
- Module sections with collapsible accordion (optional)
- Action checkboxes with labels and descriptions
- Disabled state for System roles (grayed out)

**OSHA Location Permissions (If Applicable):**
- Accordion below main matrix
- Collapsed by default
- Red error banner if validation fails

#### 5.2.4 Edit Active Role Warning

**Trigger Condition:** Editing a Custom role assigned to ≥1 active users

**Warning Banner:**
- **Position:** Above footer, below permission matrix
- **Background:** Amber (#FEF3C7)
- **Text Color:** Amber dark (#92400E)
- **Icon:** Warning triangle
- **Message:** "⚠️ This role is assigned to N active user(s). Changes will take effect immediately for all assigned users."
- **Height:** Auto (padding: 12px)

#### 5.2.5 Footer Actions

**Cancel Button:**
- **Label:** "Cancel"
- **Style:** Gray border, gray text
- **Behavior:** Prompt if unsaved changes: "You have unsaved changes. Are you sure you want to cancel?"

**Save Button:**
- **Label:** "Create Role" (new) or "Save Changes" (edit)
- **Style:** Blue background, white text
- **State:** Disabled if validation fails
- **Behavior:** Validate → Save → Close → Show toast → Refresh list

---

### 5.3 User Management List View

#### 5.3.1 Page Header

**Title:** "User Management"

**Subtitle:** "Manage EHS users, roles, and permissions"

**Tab Navigation:**
```
[Users] [Custom Roles] [Teams]
```
- Active tab: Blue underline
- Inactive tabs: Gray text, hover: dark gray

#### 5.3.2 Filters Bar

**Layout:** White card with light border, padding 16px

**Search Field:**
- **Placeholder:** "Search users..."
- **Icon:** Magnifying glass
- **Width:** 256px
- **Filter Scope:** First name, last name, email

**Role Filter:**
- **Label:** "Role:"
- **Dropdown:** "All Roles" + list of active roles
- **Width:** 200px

**Status Filter:**
- **Label:** "Status:"
- **Dropdown:** "All", "Active", "Inactive"
- **Width:** 150px

**Location Filter:**
- **Component:** LocationFilterDropdown
- **Label:** "Location:"
- **Behavior:** Shows selected node + children
- **Clear Button:** X icon to reset filter

**Add User Button:**
- **Label:** "+ Add User"
- **Style:** Blue background, white text
- **Position:** Right side
- **Behavior:** Opens Invite User modal

#### 5.3.3 Users Table

**Table Columns:**

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| Name | 20% | Left | First + Last name |
| Email | 25% | Left | Email address |
| Role | 20% | Left | Role badge |
| Location | 20% | Left | Breadcrumb path |
| Status | 10% | Left | Status badge |
| Actions | 5% | Right | Three-dot menu |

**Row Styling:**
- Hover: Light gray background
- Height: 72px
- Border: Bottom border

**Name Column:**
- **Font:** Medium weight
- **Color:** Dark gray (#111827)

**Email Column:**
- **Font:** Regular weight
- **Color:** Medium gray (#374151)

**Role Column Badge:**
- **System Roles:** Blue background (#DBEAFE), blue text (#1E40AF)
- **Custom Roles:** Purple background (#EDE9FE), purple text (#6B21A8)
- **Deleted Roles:** Gray background (#F3F4F6), gray text (#6B7280), "(Deleted)" suffix
- **Format:** Role name only (no descriptor)

**Location Column:**
- **Format:** Breadcrumb with "/" separators
- **Example:** "North America / USA / Plant A"
- **Truncation:** Max 3 levels visible with "..." if longer
- **Tooltip:** Full path on hover

**Status Column Badge:**
- **Active:** Green background (#D1FAE5), green text (#065F46)
- **Inactive:** Gray background (#F3F4F6), gray text (#6B7280)
- **Pending:** Amber background (#FEF3C7), amber text (#92400E)

**Actions Column:**
- **Icon:** Three vertical dots (⋮)
- **Menu Items:**
  - "Edit" (all users)
  - "Resend Invitation" (Pending users only)
  - "Deactivate" (Active users) or "Activate" (Inactive users)

**Empty State:**
- **Icon:** Users group (gray, centered)
- **Title:** "No users found" (filtered) or "No users yet" (empty)
- **Message:** "Try adjusting your filters" or "Add your first EHS user to get started"
- **Action:** "Add First User" button (if empty)

---

## 6. Lifecycle & Logic

### 6.1 Role Lifecycle

#### 6.1.1 Creation

**Initial State:** Active (no draft state)

**Creation Flow:**
1. User clicks "Create Role"
2. Modal/fullscreen opens based on preference
3. User fills role name, selects permissions
4. User clicks "Create Role" button
5. System validates (name, uniqueness, permission count)
6. If validation passes:
   - Role created with status "Active"
   - Role ID generated (UUID)
   - `createdAt` timestamp recorded
   - `createdBy` set to current user ID
   - Role appears in list (top of table)
   - Success toast displayed
7. If validation fails:
   - Error banner displayed
   - Form remains open
   - Invalid fields highlighted

**Database Fields (New Role):**
```json
{
  "id": "uuid-v4",
  "name": "Safety Coordinator",
  "permissions": { /* RolePermissions object */ },
  "oshaLocationPermissions": { /* Optional */ },
  "isSystemRole": false,
  "status": "active",
  "createdAt": "2026-01-23T10:30:00Z",
  "updatedAt": "2026-01-23T10:30:00Z",
  "createdBy": "user-id",
  "updatedBy": null,
  "deletedAt": null
}
```

#### 6.1.2 Active State

**Characteristics:**
- Appears in role selector dropdowns
- Can be assigned to new users
- Can be edited (Custom roles only)
- Cannot be deleted if assigned to active users

**Editing Rules:**
- **System Roles:** Cannot be edited (read-only view)
- **Custom Roles:** Full edit capability
- **Impact Warning:** If assigned to active users, display amber banner showing count

#### 6.1.3 Duplication

**Trigger:** User clicks "Duplicate" in role actions menu

**Behavior:**
1. System creates new role record
2. Name: Original name + " (Copy)"
3. Permissions: Deep copy of source role permissions
4. OSHA location permissions: Deep copy (if applicable)
5. New role ID generated
6. `createdAt` timestamp set to current time
7. `createdBy` set to current user ID
8. Role opens in edit mode immediately
9. User can modify before saving

**Name Collision Handling:**
- If "[Name] (Copy)" exists, append another " (Copy)"
- Example: "EHS Manager (Copy) (Copy)"
- Alternative: Append number: "EHS Manager (Copy 2)"

#### 6.1.4 Deletion (Soft-Delete)

**System Role Deletion Attempt:**
- Delete action hidden from UI
- If somehow triggered, display error: "System roles cannot be deleted"

**Custom Role Deletion Flow:**

**Step 1: Cascade Protection Check**
```sql
SELECT COUNT(*) FROM users 
WHERE roleId = :roleId 
AND status = 'active' 
AND deletedAt IS NULL
```

**If Count > 0:**
1. Block deletion
2. Display error modal:
   - **Title:** "Cannot Delete Role"
   - **Icon:** Warning triangle (red)
   - **Message:** "This role is currently assigned to N active user(s). Please reassign these users to a different role before deleting."
   - **Primary Action:** "View Assigned Users" button (blue)
     - Navigates to Users tab
     - Pre-filters list to show only users with this role
     - Status filter set to "Active"
   - **Secondary Action:** "Cancel" button (gray)

**If Count = 0:**
1. Display confirmation dialog:
   - **Title:** "Delete Role?"
   - **Icon:** Trash can (red)
   - **Message:** "Are you sure you want to delete the role '[name]'? This action cannot be undone."
   - **Primary Action:** "Delete" button (red)
   - **Secondary Action:** "Cancel" button (gray)
2. If user confirms:
   - Set `deletedAt` timestamp (soft delete)
   - Remove from role selector dropdowns
   - Keep in database for audit trail
   - Success toast: "Role '[name]' deleted"

**Special Case: Last Super Admin Check**

**Trigger:** Attempting to delete a role with Super Admin permissions

**Logic:**
```typescript
// Pseudo-code
const isSuperAdminRole = checkIfFullAccessPermissions(role.permissions);
if (isSuperAdminRole) {
  const activeUsersWithThisRole = await countActiveUsersWithRole(roleId);
  const totalActiveSuperAdmins = await countAllActiveSuperAdmins();
  
  if (activeUsersWithThisRole === totalActiveSuperAdmins && totalActiveSuperAdmins === 1) {
    // Block deletion - this is the last Super Admin
    showError("Cannot delete last Super Admin role");
  }
}
```

**Error Modal (Last Super Admin):**
- **Title:** "Cannot Delete Last Super Admin Role"
- **Icon:** Shield with X (red)
- **Message:** "This is the only role with Super Admin permissions assigned to an active user. At least one Super Admin must exist at all times. Please assign another user to this role before deleting."
- **Action:** "Cancel" button (closes modal)

---

### 6.2 User Lifecycle

#### 6.2.1 Invited (Pending) State

**Creation Trigger:** Admin submits "Invite User" form

**System Actions:**
1. Create user record with status "Pending"
2. Generate invitation token (JWT):
   - Payload: `{ userId, email, exp }`
   - Expiration: 7 days from generation
   - Signed with secret key
3. Store token in database with expiration timestamp
4. Send invitation email:
   - To: User's email address
   - Subject: "You've been invited to UpKeep EHS"
   - Body: Personalized invitation with token link
   - Link: `https://app.upkeep.com/ehs/invite/{token}`
5. Record `invitedAt` and `lastInvitationSentAt` timestamps
6. Display in user list with "Pending" badge

**Database Fields (Pending User):**
```json
{
  "id": "uuid-v4",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "roleId": "role-uuid",
  "locationNodeId": "location-uuid",
  "status": "pending",
  "invitationToken": "jwt-token",
  "invitationTokenExpiresAt": "2026-01-30T10:30:00Z",
  "invitedAt": "2026-01-23T10:30:00Z",
  "invitedBy": "admin-user-id",
  "lastInvitationSentAt": "2026-01-23T10:30:00Z",
  "activatedAt": null,
  "createdAt": "2026-01-23T10:30:00Z",
  "updatedAt": "2026-01-23T10:30:00Z"
}
```

**UI Display (User List):**
- **Name:** John Doe
- **Email:** john.doe@company.com
- **Role:** Safety Coordinator (badge)
- **Location:** North America / USA
- **Status:** [Pending] (amber badge)
- **Last Invitation:** "Invitation sent on Jan 23, 2026" (small gray text below email)
- **Actions Menu:**
  - "Resend Invitation"
  - "Edit"
  - "Deactivate" (cancel invitation)

#### 6.2.2 Resend Invitation Flow

**Trigger:** Admin clicks "Resend Invitation" in user actions menu

**System Actions:**
1. Invalidate previous token (set `valid: false`)
2. Generate new invitation token with fresh 7-day expiration
3. Update `invitationTokenExpiresAt` timestamp
4. Update `lastInvitationSentAt` to current time
5. Send new invitation email with new token link
6. Display success toast: "Invitation resent to john.doe@company.com"
7. Update UI: "Last invitation sent" date refreshes

**Optional Reminder Email:**
- **Trigger:** 1 day before token expiration
- **Condition:** Configurable by admin (on/off toggle)
- **Subject:** "Reminder: Your UpKeep EHS invitation expires soon"
- **Body:** "Your invitation to join UpKeep EHS expires in 24 hours. Click the link below to accept."

#### 6.2.3 Invitation Acceptance Flow

**User Actions:**
1. User clicks invitation link in email
2. System validates token:
   - Check token signature
   - Check expiration date
   - Check if token has been used
3. If valid:
   - Redirect to onboarding page
   - User sets password
   - User accepts terms of service
   - System updates user record:
     - Status: "Pending" → "Active"
     - `activatedAt`: Current timestamp
     - `invitationToken`: Cleared (security)
4. If expired:
   - Display error page: "This invitation has expired. Please contact your administrator for a new invitation."
5. If already used:
   - Redirect to login page: "This invitation has already been used. Please log in."

#### 6.2.4 Active State

**Transition:** User accepts invitation and completes onboarding

**Characteristics:**
- Full system access based on role and location
- Can log in with credentials
- Appears in user list with "Active" badge (green)
- Actions menu: "Edit", "Deactivate"

**Access Control:**
- **Role-Based:** User can perform only actions granted by assigned role
- **Location-Based:** User sees only data within assigned location subtree
- **Dynamic:** If new child locations are created under user's assigned location, user automatically gains access

#### 6.2.5 Inactive State

**Trigger:** Admin clicks "Deactivate" in user actions menu

**Confirmation Dialog:**
- **Title:** "Deactivate User?"
- **Message:** "Are you sure you want to deactivate [name]? They will lose access immediately."
- **Actions:** "Cancel", "Deactivate"

**System Actions (If Confirmed):**
1. Update user status: "Active" → "Inactive"
2. Revoke all active sessions (force logout)
3. Record `deactivatedAt` timestamp
4. Record `deactivatedBy` (admin user ID)
5. Update UI: Badge changes to gray "Inactive"
6. Success toast: "[Name] has been deactivated"

**Audit Log Entry:**
```json
{
  "event": "user.deactivated",
  "userId": "user-uuid",
  "actorId": "admin-uuid",
  "timestamp": "2026-01-23T15:45:00Z",
  "metadata": {
    "userEmail": "john.doe@company.com",
    "previousStatus": "active",
    "newStatus": "inactive",
    "reason": null // Optional field for admin to provide reason
  }
}
```

**User Impact:**
- Cannot log in (login blocked at authentication layer)
- All data preserved (role, location, historical actions)
- Can be reactivated at any time

#### 6.2.6 Reactivation

**Trigger:** Admin clicks "Activate" in user actions menu for Inactive user

**System Actions:**
1. Update user status: "Inactive" → "Active"
2. Record `reactivatedAt` timestamp
3. Record `reactivatedBy` (admin user ID)
4. Update UI: Badge changes to green "Active"
5. Success toast: "[Name] has been reactivated"

**User Impact:**
- Can log in immediately
- Access restored with unchanged role and location
- No password reset required (uses existing credentials)

---

### 6.3 Dependency Logic

#### 6.3.1 Role Deletion with Active Assignments

**Rule:** Custom roles Must NOT be deletable if assigned to any active users

**Implementation:**
```typescript
// Pre-deletion check
async function canDeleteRole(roleId: string): Promise<{
  canDelete: boolean;
  reason?: string;
  activeUserCount?: number;
}> {
  const activeUsers = await db.users.count({
    where: {
      roleId,
      status: 'active',
      deletedAt: null
    }
  });
  
  if (activeUsers > 0) {
    return {
      canDelete: false,
      reason: 'role_has_active_users',
      activeUserCount: activeUsers
    };
  }
  
  return { canDelete: true };
}
```

**UI Enforcement:**
- Delete button click triggers pre-check
- If check fails, display error modal with "View Assigned Users" action
- If check passes, display confirmation dialog

#### 6.3.2 Role Edit Propagation

**Rule:** Changes to Custom roles immediately affect all assigned users (no versioning)

**Warning Banner Trigger:**
```typescript
// Calculate impact before showing edit form
async function getRoleEditImpact(roleId: string): Promise<{
  activeUserCount: number;
  userIds: string[];
}> {
  const users = await db.users.findMany({
    where: {
      roleId,
      status: 'active',
      deletedAt: null
    },
    select: { id: true }
  });
  
  return {
    activeUserCount: users.length,
    userIds: users.map(u => u.id)
  };
}
```

**UI Implementation:**
- If `activeUserCount > 0`, display amber warning banner:
  - Position: Above "Save Changes" button
  - Message: "⚠️ This role is assigned to N active user(s). Changes will take effect immediately for all assigned users."
- No blocking behavior (warning only)
- No email notification to affected users
- Audit log records permission diff (before/after)

**Permission Change Propagation:**
- Changes saved to database immediately
- User's next API request fetches updated permissions
- No cache invalidation required (permissions checked per-request)
- Effective latency: < 1 second

#### 6.3.3 Location Inheritance (Dynamic)

**Rule:** Users inherit access to assigned location + all descendant nodes automatically

**Database Query Pattern:**
```sql
-- Get user's accessible location IDs
WITH RECURSIVE location_tree AS (
  -- Base case: user's assigned location
  SELECT id, parentId, name 
  FROM locations 
  WHERE id = :userLocationId
  
  UNION ALL
  
  -- Recursive case: all children
  SELECT l.id, l.parentId, l.name
  FROM locations l
  INNER JOIN location_tree lt ON l.parentId = lt.id
)
SELECT id FROM location_tree;
```

**Dynamic Behavior:**
- **New Child Location Created:** User automatically gains access without reassignment
- **Location Deleted/Archived:** User loses access to that subtree
- **Location Moved:** If location is moved under user's assigned node, user gains access; if moved out, user loses access

**Example Scenario:**

**Initial State:**
- User assigned to: "USA"
- Accessible locations: USA, California, New York, Plant A, Plant B

**New Location Added:**
- Admin creates "Plant C" under "California"
- User's accessible locations automatically include Plant C (no update to user record needed)

**Location Deleted:**
- Admin deletes "California"
- User loses access to California, Plant A (under California)
- User retains access to USA, New York, Plant B

#### 6.3.4 Deleted Role Assignment

**Rule:** Users with deleted roles Must be forced to reassign before editing

**UI Enforcement:**

**User List Display (User with Deleted Role):**
- **Role Badge:** "Safety Manager (Deleted)"
- **Badge Color:** Gray background (#F3F4F6), gray text (#6B7280)

**Edit User Modal (User with Deleted Role):**
- Role dropdown auto-opens
- Deleted role shown with red border and "(Deleted - Must Reassign)" label
- Save button disabled until new role selected
- Validation error: "This role has been deleted. Please assign a valid role."

**Role Selector Filtering:**
- Deleted roles Must NOT appear in dropdown options
- Only active System and Custom roles shown

---

## 7. Audit Trail & Notifications

### 7.1 Events That Must Be Logged

All audit trail entries Must include:
- `eventType`: String identifier (e.g., "role.created")
- `actorId`: User ID who performed the action
- `actorEmail`: Email of actor (denormalized for reporting)
- `timestamp`: ISO 8601 timestamp with timezone
- `ipAddress`: IPv4/IPv6 address of request origin
- `userAgent`: Browser/client identifier
- `metadata`: Event-specific data (JSON object)

#### 7.1.1 Role Actions

**Role Created**
```json
{
  "eventType": "role.created",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T10:30:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "roleId": "new-role-uuid",
    "roleName": "Safety Coordinator",
    "isSystemRole": false,
    "permissionCount": 24,
    "permissions": { /* Full RolePermissions object */ },
    "oshaLocationPermissions": { /* If applicable */ }
  }
}
```

**Role Updated (Most Critical for Compliance)**
```json
{
  "eventType": "role.updated",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T14:20:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "roleId": "role-uuid",
    "roleName": "Safety Coordinator",
    "affectedUserCount": 12,
    "affectedUserIds": ["user-1", "user-2", ...],
    "changes": {
      "name": {
        "old": "Safety Coordinator",
        "new": "Regional Safety Coordinator"
      },
      "permissions": {
        "added": [
          "event:delete",
          "capa:approve",
          "osha:export"
        ],
        "removed": [
          "loto:delete"
        ],
        "unchanged": 45
      }
    },
    "permissionsBeforeFull": { /* Complete before state */ },
    "permissionsAfterFull": { /* Complete after state */ }
  }
}
```

**Permission Diff Format (Detailed):**
```json
"permissions": {
  "added": [
    {
      "actionId": "event:delete",
      "moduleId": "event",
      "entityName": "Safety Event",
      "actionKey": "delete",
      "actionLabel": "Delete Events"
    },
    {
      "actionId": "capa:approve",
      "moduleId": "capa",
      "entityName": "CAPA",
      "actionKey": "approve",
      "actionLabel": "Approve CAPA Closure"
    }
  ],
  "removed": [
    {
      "actionId": "loto:delete",
      "moduleId": "loto",
      "entityName": "LOTO Procedure",
      "actionKey": "delete",
      "actionLabel": "Delete LOTO Procedure"
    }
  ],
  "unchanged": 45
}
```

**Role Duplicated**
```json
{
  "eventType": "role.duplicated",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T11:15:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "sourceRoleId": "original-role-uuid",
    "sourceRoleName": "EHS Manager",
    "newRoleId": "new-role-uuid",
    "newRoleName": "EHS Manager (Copy)",
    "permissionCount": 32
  }
}
```

**Role Deleted**
```json
{
  "eventType": "role.deleted",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T16:00:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "roleId": "deleted-role-uuid",
    "roleName": "Obsolete Role",
    "assignedUserIdsAtDeletion": [], // Must be empty for deletion to succeed
    "permissionCount": 18,
    "permissions": { /* Full permissions snapshot for audit */ }
  }
}
```

#### 7.1.2 User Actions

**User Invited**
```json
{
  "eventType": "user.invited",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T10:30:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "userId": "new-user-uuid",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role-uuid",
    "roleName": "Safety Coordinator",
    "locationNodeId": "location-uuid",
    "locationPath": "North America > USA > Plant A",
    "invitationTokenExpiresAt": "2026-01-30T10:30:00Z"
  }
}
```

**Invitation Resent**
```json
{
  "eventType": "invitation.resent",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-25T14:00:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "userId": "user-uuid",
    "email": "john.doe@company.com",
    "previousTokenExpiration": "2026-01-30T10:30:00Z",
    "newTokenExpiresAt": "2026-02-01T14:00:00Z"
  }
}
```

**Invitation Accepted**
```json
{
  "eventType": "invitation.accepted",
  "actorId": "user-uuid",
  "actorEmail": "john.doe@company.com",
  "timestamp": "2026-01-24T09:15:00Z",
  "ipAddress": "198.51.100.22",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "userId": "user-uuid",
    "email": "john.doe@company.com",
    "invitedAt": "2026-01-23T10:30:00Z",
    "acceptedAt": "2026-01-24T09:15:00Z",
    "timeTakenHours": 22.75
  }
}
```

**User Role Changed**
```json
{
  "eventType": "user.role_changed",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T15:00:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "userId": "user-uuid",
    "userEmail": "john.doe@company.com",
    "oldRoleId": "old-role-uuid",
    "oldRoleName": "Safety Inspector",
    "newRoleId": "new-role-uuid",
    "newRoleName": "Safety Coordinator",
    "permissionDiffSummary": {
      "permissionsAdded": 8,
      "permissionsRemoved": 2,
      "permissionsUnchanged": 16
    }
  }
}
```

**User Location Changed**
```json
{
  "eventType": "user.location_changed",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T15:30:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "userId": "user-uuid",
    "userEmail": "john.doe@company.com",
    "oldLocationNodeId": "old-location-uuid",
    "oldLocationPath": "North America > USA > Plant A",
    "newLocationNodeId": "new-location-uuid",
    "newLocationPath": "North America > USA > Plant B",
    "dataAccessImpact": {
      "locationsAdded": ["Plant B", "Line 1", "Line 2"],
      "locationsRemoved": ["Plant A", "Warehouse"]
    }
  }
}
```

**User Status Changed**
```json
{
  "eventType": "user.status_changed",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T16:00:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "userId": "user-uuid",
    "userEmail": "john.doe@company.com",
    "oldStatus": "active",
    "newStatus": "inactive",
    "reason": null // Optional: Admin can provide reason
  }
}
```

**User Deleted (Soft Delete)**
```json
{
  "eventType": "user.deleted",
  "actorId": "admin-uuid",
  "actorEmail": "admin@company.com",
  "timestamp": "2026-01-23T17:00:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "userId": "user-uuid",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role-uuid",
    "roleName": "Safety Coordinator",
    "locationNodeId": "location-uuid",
    "locationPath": "North America > USA > Plant A",
    "status": "inactive",
    "reason": null // Optional
  }
}
```

---

### 7.2 Notification Triggers

#### 7.2.1 User Invitation Email

**Trigger:** User created with status "Pending"

**Email Template:**
```
From: UpKeep EHS <noreply@upkeep.com>
To: john.doe@company.com
Subject: You've been invited to UpKeep EHS

Hi John,

[Admin Name] has invited you to join UpKeep EHS at [Company Name].

UpKeep EHS is our Environmental Health & Safety management platform where you can:
- Report and track safety incidents
- Manage corrective actions
- Complete audits and inspections
- Ensure OSHA compliance

Click the button below to accept your invitation and set up your account:

[Accept Invitation Button]
(Link: https://app.upkeep.com/ehs/invite/{token})

This invitation expires in 7 days (on January 30, 2026).

Your assigned role: Safety Coordinator
Your location access: North America > USA > Plant A

If you have any questions, please contact [Admin Name] at [admin@company.com].

---
UpKeep EHS
```

**Technical Requirements:**
- Link Must include JWT token with 7-day expiration
- Token payload: `{ userId, email, exp }`
- Link Must be single-use (invalidated on acceptance)

#### 7.2.2 Invitation Resent Email

**Trigger:** Admin clicks "Resend Invitation"

**Email Template:**
```
From: UpKeep EHS <noreply@upkeep.com>
To: john.doe@company.com
Subject: Reminder: Your UpKeep EHS invitation

Hi John,

This is a reminder that you've been invited to join UpKeep EHS.

We've sent you a new invitation link with a fresh expiration date.

Click the button below to accept your invitation:

[Accept Invitation Button]
(Link: https://app.upkeep.com/ehs/invite/{newToken})

This invitation expires in 7 days (on February 1, 2026).

---
UpKeep EHS
```

**Technical Requirements:**
- Previous token Must be invalidated (set `valid: false` in database)
- New token generated with fresh 7-day expiration
- Email sent immediately

#### 7.2.3 Invitation Expiration Reminder (Optional)

**Trigger:** 1 day before token expiration

**Configuration:** Admin can enable/disable in Settings → Notifications

**Email Template:**
```
From: UpKeep EHS <noreply@upkeep.com>
To: john.doe@company.com
Subject: Reminder: Your UpKeep EHS invitation expires soon

Hi John,

Your invitation to join UpKeep EHS expires in 24 hours.

Click the button below to accept before it expires:

[Accept Invitation Button]

After expiration, you'll need to contact your administrator for a new invitation.

---
UpKeep EHS
```

**Technical Requirements:**
- Cron job checks for tokens expiring in 24 hours
- Send email only if status is still "Pending"
- Do not send if user has already accepted

#### 7.2.4 Role Deletion Attempt (In-App)

**Trigger:** Admin attempts to delete role with active user assignments

**UI Component:** Error modal (not email)

**Modal Content:**
- **Title:** "Cannot Delete Role"
- **Icon:** Red warning triangle
- **Message:** "This role is currently assigned to N active user(s). Please reassign these users to a different role before deleting."
- **Primary Action:** "View Assigned Users" (navigates to filtered user list)
- **Secondary Action:** "Cancel" (closes modal)

**No Email Sent:** This is a validation error, not a notification event

#### 7.2.5 Permission Changes (No Notification)

**Policy:** Permission changes to Custom roles do NOT trigger email notifications to affected users

**Rationale:**
- Changes are transparent and immediate
- Users discover new permissions when attempting actions
- Reduces notification fatigue
- Audit trail provides full compliance record

**Admin Warning:** Amber banner shown during edit (see Section 6.3.2)

---

## 8. Edge Cases

### 8.1 Multiple Roles per User

**Current Policy:** 1 user = 1 role (strictly enforced)

**Database Constraint:** `users.roleId` is a single foreign key (not an array)

**UI Enforcement:**
- Role selector is a single-select dropdown (not multi-select)
- No "Add Role" button
- Editing user replaces current role (does not add)

**Future Consideration:** Role stacking not planned (would require significant architecture change)

---

### 8.2 View-Only CMMS User acting as EHS Admin (The Interceptor)

**Scenario:** A user is configured as "View-Only" in the CMMS (to protect asset data) but holds the "Global Admin" role in EHS. They attempt to create a Work Order (WO) from a Safety Incident.

**Business Context:** This resolves the "Desmoine Scenario" where safety directors need to create Work Orders from safety incidents but should not have broad edit access to maintenance asset databases, which could lead to accidental modifications of critical equipment records.

**Logic:** The API Gateway Interceptor detects the request source (EHS_Module) and the user's EHS Role (Global Admin). It authorizes the request, bypassing the standard CMMS permission check.

**Implementation Flow:**

1. **Request Detection:**
   - User clicks "Create Work Order" from Safety Incident detail page
   - API request includes header: `X-Source-Module: EHS`
   - Request payload contains: `sourceIncidentId` and Work Order data

2. **Interceptor Logic:**
```typescript
// API Gateway Middleware
async function crossModulePermissionCheck(req, res, next) {
  const sourceModule = req.headers['x-source-module'];
  const userId = req.user.id;
  
  if (sourceModule === 'EHS' && req.path.startsWith('/api/work-orders')) {
    // Check user's EHS role instead of CMMS role
    const ehsRole = await db.ehsRoles.findUnique({ 
      where: { userId },
      include: { permissions: true }
    });
    
    if (ehsRole?.permissions.workOrders?.create === true) {
      req.bypassCMMSCheck = true;
      return next();
    }
  }
  
  // Standard CMMS permission check
  return standardPermissionCheck(req, res, next);
}
```

3. **Work Order Creation:**
   - Work Order created successfully in CMMS
   - Link established: `work_orders.source_incident_id = incident.id`
   - Audit log records cross-module creation

**UI Feedback (Toast):**

Display informational toast after successful creation:

**Toast Content:**
- **Icon:** Checkmark (green)
- **Title:** "Work Order created successfully"
- **Message:** "Note: You may not be able to view this record in the Maintenance system due to your current access level."
- **Duration:** 5 seconds
- **Action:** "View in EHS" button (links back to incident with WO reference)

**Reasoning:** This message is critical to preventing user confusion and subsequent "Access Denied" errors if the user attempts to click a link to the WO in the CMMS interface, which they technically cannot view due to their "View-Only" CMMS role.

**Security Considerations:**
- Cross-module permission checks logged in audit trail
- Work Orders created via EHS module are tagged: `created_via_module: 'EHS'`
- Users cannot edit or delete Work Orders in CMMS—only view them from EHS incident context
- Location scoping still applies (user can only create WOs for incidents in their location subtree)

**Alternative Approaches Rejected:**
1. ❌ Grant users full CMMS "Edit" access → Violates least privilege, risks asset data corruption
2. ❌ Require manual WO creation by maintenance team → Delays response to safety incidents
3. ✅ API Interceptor Pattern → Maintains security boundaries while enabling workflow

---

### 8.3 Zero-Trust Data Visibility (The Auditor)

**Scenario:** A user with the "Conditional View-Only" role (e.g., External Auditor, Legal Counsel) logs in to review safety data.

**Business Context:** Organizations need to provide limited, compartmentalized access to external parties reviewing specific incidents (e.g., OSHA investigations, legal discovery, insurance claims) without exposing the entire safety database.

**Default State:** The "Safety Events" list displays **0 records** when user first logs in.

**Access Grant Mechanism:**

**Explicit Tagging Required:** Visibility is granted only when the user's ID is explicitly found in any of the following record fields:
- `notify_team_members` (array of user IDs)
- `watchers` (array of user IDs)
- `assignee` (single user ID)
- `created_by` (single user ID)

**API-Level Filtering:**

```typescript
// Query modification for Conditional View-Only role
async function getVisibleRecords(userId: string, role: Role) {
  if (role.name === 'Conditional View-Only') {
    return await db.safetyEvents.findMany({
      where: {
        OR: [
          { notify_team_members: { has: userId } },
          { watchers: { has: userId } },
          { assignee: userId },
          { created_by: userId }
        ],
        deletedAt: null
      }
    });
  }
  
  // Standard location-based filtering for other roles
  return await standardLocationScopedQuery(userId, role);
}
```

**OSHA Module Complete Block:**

**API Enforcement:**
- Any direct API attempt to access `/api/v2/osha-logs` returns **HTTP 403 Forbidden**
- Error response: `{ error: "Access Denied", message: "OSHA module is not accessible for your role" }`

**UI Enforcement:**
- OSHA navigation menu item hidden from sidebar
- Direct URL navigation to `/osha-logs` redirects to dashboard with error toast
- "Export to OSHA" buttons removed from incident detail pages

**Implementation Requirements:**

1. **API-Level Filtering:**
   - Middleware intercepts all data queries
   - Applies user ID filter before executing query
   - No client-side filtering (security through obscurity rejected)

2. **UI Conditional Rendering:**
```typescript
// Component rendering logic
function SafetyEventActions({ event, currentUser, currentRole }) {
  const isConditionalViewOnly = currentRole.name === 'Conditional View-Only';
  
  return (
    <div>
      {/* View button always visible */}
      <ViewButton />
      
      {/* Edit/Delete hidden for Conditional View-Only */}
      {!isConditionalViewOnly && (
        <>
          <EditButton disabled />
          <DeleteButton disabled />
        </>
      )}
      
      {/* Action buttons removed from DOM, not just disabled */}
    </div>
  );
}
```

3. **List View Behavior:**
   - Empty state message: "No records available. Contact your administrator if you believe this is an error."
   - No record count displayed (to prevent information leakage)
   - Filters/search still available but yield no results unless records explicitly tagged

**Use Cases:**

1. **External Legal Counsel:** Tagged on specific incident requiring legal review
2. **Insurance Adjuster:** Tagged on claim-related incidents only
3. **OSHA Inspector:** Tagged on incidents under investigation
4. **Temporary Contractor:** Tagged on project-specific safety documentation

**Security Implications:**
- Users cannot discover incidents they're not explicitly tagged on
- Location hierarchy visibility does not apply (explicit tagging overrides)
- Audit trail records all access attempts (successful and denied)
- Role cannot be used for "fishing expeditions" across safety database

---

### 8.4 Multiple Roles & Concurrent Editing

**Single Role Enforcement:** The system enforces a strict 1:1 relationship between User and Role. The database schema utilizes a single foreign key `role_id` on the user table. If a user requires permissions overlapping two roles, a new Custom Role combining those permissions must be created.

**Database Schema Constraint:**
```sql
ALTER TABLE users ADD CONSTRAINT fk_role_id 
  FOREIGN KEY (role_id) REFERENCES roles(id);
  
-- No junction table for user_roles (enforces 1:1)
```

**UI Enforcement:**
- Role selector strictly single-select (no multi-select option)
- No "Add Role" button in user management
- Editing user replaces current role (does not add)

**Concurrent Editing Scenarios:**

**Scenario 1: Admin A edits role while Admin B deletes it**

**Sequence:**
1. Admin A opens Role Edit modal for "Safety Coordinator"
2. Admin B deletes "Safety Coordinator" role
3. Admin A clicks "Save Changes"

**System Response:**
- API returns `404 Not Found` error
- UI displays error modal:
  - **Title:** "Role No Longer Exists"
  - **Message:** "The role 'Safety Coordinator' has been deleted by another administrator. Your changes could not be saved."
  - **Action:** "Close" button (returns to role list)

**Scenario 2: Admin A edits role while Admin B assigns it to user**

**Sequence:**
1. Admin A opens Role Edit modal for "Field Technician"
2. Admin A modifies permissions (removes "Delete" action)
3. Admin B assigns "Field Technician" role to new user
4. Admin A clicks "Save Changes"

**System Response:**
- Assignment succeeds (Admin B's action completes first)
- Permission update succeeds (Admin A's action completes second)
- **User immediately inherits new permissions** upon their next API request
- Both actions logged separately in audit trail with timestamps

**Race Condition Handling:**
- Database uses optimistic locking (version column on roles table)
- Last-write-wins strategy for permission updates
- No transaction rollback (assignment and update are independent operations)

**Audit Trail Clarity:**
```json
[
  {
    "timestamp": "2026-01-26T10:30:00Z",
    "event": "role.assigned",
    "actor": "admin-b-uuid",
    "metadata": { "userId": "user-uuid", "roleId": "field-tech-uuid" }
  },
  {
    "timestamp": "2026-01-26T10:30:02Z",
    "event": "role.updated",
    "actor": "admin-a-uuid",
    "metadata": { 
      "roleId": "field-tech-uuid",
      "permissions": { "removed": ["event:delete"] }
    }
  }
]
```

**Clear Error Messaging:**
- Conflicts detected and communicated clearly
- No silent failures or data corruption
- Admins informed of concurrent actions via audit log

---

### 8.5 Mandatory Location Context

**Scenario:** An API call attempts to create a Safety Event or CAPA without a valid `location_id`.

**System Response:** The API returns a **400 Bad Request** error.

**Error Response Format:**
```json
{
  "error": "ValidationError",
  "message": "location_id is required for all EHS records",
  "field": "location_id",
  "code": "MISSING_LOCATION"
}
```

**Business Justification:** Location context is fundamental to:
- Data sovereignty enforcement
- Audit trail integrity
- Regulatory compliance (OSHA requires establishment identification)
- Access control scoping

**Orphan Prevention:**

**Scenario:** Admin attempts to delete a Location Node that has active EHS records associated with it.

**Pre-Delete Check:**
```typescript
async function canDeleteLocation(locationId: string): Promise<{
  canDelete: boolean;
  reason?: string;
  affectedRecords?: {
    safetyEvents: number;
    capas: number;
    audits: number;
  };
}> {
  const affectedCounts = await db.$transaction([
    db.safetyEvents.count({ where: { location_id: locationId, deletedAt: null } }),
    db.capas.count({ where: { location_id: locationId, deletedAt: null } }),
    db.audits.count({ where: { location_id: locationId, deletedAt: null } })
  ]);
  
  const totalAffected = affectedCounts.reduce((sum, count) => sum + count, 0);
  
  if (totalAffected > 0) {
    return {
      canDelete: false,
      reason: 'has_active_records',
      affectedRecords: {
        safetyEvents: affectedCounts[0],
        capas: affectedCounts[1],
        audits: affectedCounts[2]
      }
    };
  }
  
  return { canDelete: true };
}
```

**User Receives Prompt:**

**Error Modal:**
- **Title:** "Cannot Delete Location"
- **Icon:** Red warning triangle
- **Message:** "This location has X active records associated with it. Please reassign these records to another location before deletion."
- **Details Section:**
  - Safety Events: Y
  - CAPAs: Z
  - Audits: W
- **Actions:**
  - **Primary:** "Reassign Records" button (opens reassignment workflow)
  - **Secondary:** "Cancel" button (closes modal)

**Reassignment Workflow:**

1. **Location Selector:**
   - User selects target location (sibling or parent node)
   - System validates target location is active (not deleted/archived)

2. **Bulk Reassignment:**
```typescript
async function reassignRecordsToLocation(
  sourceLocationId: string,
  targetLocationId: string,
  actorId: string
) {
  const result = await db.$transaction(async (tx) => {
    // Reassign all record types
    const safetyEvents = await tx.safetyEvents.updateMany({
      where: { location_id: sourceLocationId, deletedAt: null },
      data: { location_id: targetLocationId }
    });
    
    const capas = await tx.capas.updateMany({
      where: { location_id: sourceLocationId, deletedAt: null },
      data: { location_id: targetLocationId }
    });
    
    // Log bulk reassignment in audit trail
    await tx.auditLogs.create({
      data: {
        event_type: 'location.records_reassigned',
        actor_id: actorId,
        metadata: {
          source_location_id: sourceLocationId,
          target_location_id: targetLocationId,
          records_affected: {
            safety_events: safetyEvents.count,
            capas: capas.count
          }
        }
      }
    });
    
    return { safetyEvents: safetyEvents.count, capas: capas.count };
  });
  
  return result;
}
```

3. **Post-Reassignment:**
   - Success toast: "X records reassigned successfully. You can now delete the location."
   - Location deletion button re-enabled
   - Audit trail records bulk reassignment event

**Database Constraints:**
```sql
-- Enforce location_id presence
ALTER TABLE safety_events ADD CONSTRAINT fk_location_id 
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT;

ALTER TABLE capas ADD CONSTRAINT fk_location_id 
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT;
  
-- Index for performance
CREATE INDEX idx_safety_events_location ON safety_events(location_id);
CREATE INDEX idx_capas_location ON capas(location_id);
```

**Audit Trail Integrity:**
- All location reassignments logged with before/after location IDs
- Orphan prevention events logged (deletion attempts blocked)
- Ensures no data becomes "un-auditable" due to missing location context

---

### 8.6 Editing Active Roles

**Scenario:** Admin edits a Custom role currently assigned to 50 active users

**Required Behavior:**

**Step 1: Impact Check on Edit Mode Entry**
```typescript
const impact = await getRoleEditImpact(roleId);
// { activeUserCount: 50, userIds: [...] }
```

**Step 2: Display Warning Banner**
- **Position:** Above "Save Changes" button in edit form
- **Background Color:** Amber (#FEF3C7)
- **Text Color:** Amber dark (#92400E)
- **Icon:** Warning triangle
- **Message:** "⚠️ This role is assigned to 50 active user(s). Changes will take effect immediately for all assigned users."
- **Dismissible:** No (always visible during edit)

**Step 3: Allow Edit (No Blocking)**
- Admin can proceed with editing
- No confirmation dialog required
- Warning is informational only

**Step 4: On Save**
- Changes applied to role immediately
- All 50 users' permissions updated
- No email notification sent to affected users
- Audit log records:
  - Permission diff (before/after)
  - Affected user count and IDs
  - Actor (admin who made change)

**Step 5: Propagation**
- Next API request by any of the 50 users fetches updated permissions
- Effective latency: < 1 second
- No cache invalidation required (permissions checked per-request)

---

### 8.7 Deleting Last Super Admin

**Scenario:** Admin attempts to delete a role that is the only role with Super Admin permissions assigned to an active user

**Required Behavior:**

**Step 1: Pre-Delete Check**
```typescript
async function canDeleteSuperAdminRole(roleId: string): Promise<{
  canDelete: boolean;
  reason?: string;
  isLastSuperAdmin?: boolean;
}> {
  // Check if this role has full access (Super Admin equivalent)
  const role = await db.roles.findUnique({ where: { id: roleId } });
  const isSuperAdminRole = checkIfFullAccessPermissions(role.permissions);
  
  if (!isSuperAdminRole) {
    return { canDelete: true };
  }
  
  // Count active users with this role
  const activeUsersWithThisRole = await db.users.count({
    where: { roleId, status: 'active', deletedAt: null }
  });
  
  // Count all active users with any Super Admin role
  const allActiveSuperAdmins = await db.users.count({
    where: {
      status: 'active',
      deletedAt: null,
      role: { permissions: { /* full access check */ } }
    }
  });
  
  if (activeUsersWithThisRole === allActiveSuperAdmins && allActiveSuperAdmins === 1) {
    return {
      canDelete: false,
      reason: 'last_super_admin',
      isLastSuperAdmin: true
    };
  }
  
  return { canDelete: true };
}
```

**Step 2: Block Deletion**
- If `isLastSuperAdmin === true`, prevent deletion
- Display error modal (not confirmation dialog)

**Error Modal:**
- **Title:** "Cannot Delete Last Super Admin Role"
- **Icon:** Red shield with X
- **Message:** "This is the only role with Super Admin permissions assigned to an active user. At least one Super Admin must exist at all times. Please assign another user to this role before deleting."
- **Action:** "Cancel" button (gray, closes modal)

**No Workaround:** System Must not allow deletion under any circumstance

**Alternative Path for Admin:**
1. Create a new user with Super Admin role
2. Verify new user can log in
3. Then delete the old role

---

### 8.8 Duplicate Role Names

**Validation Trigger:** Real-time on blur and on submit

**Case Sensitivity:** Case-insensitive comparison

**Example:**
- Existing role: "Safety Coordinator"
- User types: "safety coordinator" → Error: "A role named 'safety coordinator' already exists"
- User types: "SAFETY COORDINATOR" → Error (same)

**Implementation:**
```typescript
function checkDuplicateName(name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase();
  const existingRole = roles.find(r => 
    r.name.toLowerCase() === normalized && 
    r.id !== excludeId &&
    r.deletedAt === null
  );
  return !!existingRole;
}
```

**Error Message:**
- Display: Red text below input field
- Format: `"A role named '[exact input]' already exists"`
- Timing: Immediate on blur, persists until corrected

**Submit Block:**
- "Create Role" / "Save Changes" button disabled
- Red border on role name input
- Auto-scroll to error field

---

### 8.9 OSHA Module Without Location Permissions

**Scenario:** Admin enables OSHA module permissions but does not configure any establishment-level permissions

**Validation Trigger:** On form submit

**Validation Logic:**
```typescript
function validateOSHAPermissions(
  permissions: RolePermissions,
  oshaLocationPermissions: OSHALocationPermissions
): { valid: boolean; error?: string } {
  // Check if any OSHA module permission is enabled
  const hasOSHAPermissions = permissions.osha && 
    Object.values(permissions.osha).some(entity =>
      Object.values(entity).some(val => val === true)
    );
  
  if (!hasOSHAPermissions) {
    return { valid: true }; // No OSHA permissions, no validation needed
  }
  
  // Check if at least one establishment has OSHA permissions
  const hasLocationPerms = Object.keys(oshaLocationPermissions).length > 0 &&
    Object.values(oshaLocationPermissions).some(estPerms =>
      Object.values(estPerms).some(entity =>
        Object.values(entity).some(val => val === true)
      )
    );
  
  if (!hasLocationPerms) {
    return {
      valid: false,
      error: "At least one OSHA permission must be configured for at least one establishment when OSHA module is enabled"
    };
  }
  
  return { valid: true };
}
```

**UI Feedback:**
- **Error Banner:** Displayed below permission matrix
- **Background:** Red (#FEE2E2)
- **Text Color:** Red dark (#991B1B)
- **Icon:** Error circle
- **Message:** "At least one OSHA permission must be configured for at least one establishment when OSHA module is enabled"

**Submit Block:**
- "Create Role" / "Save Changes" button remains enabled
- Form submits, validation runs, error banner appears
- Auto-scroll to OSHA Location Permissions section
- Section auto-expands if collapsed

**Resolution:**
- Admin must expand OSHA Location Permissions accordion
- Select at least one establishment
- Enable at least one OSHA permission for that establishment
- Error clears automatically

---

### 8.10 System Role Modification Attempts

**Scenario:** Admin attempts to edit a System role

**UI Prevention:**

**Role Name Field:**
- **State:** Disabled (grayed out)
- **Cursor:** Not-allowed cursor on hover
- **Hint Text:** Below input: "System role names cannot be changed"
- **Icon:** Lock icon (gray) next to label

**Permission Checkboxes:**
- **State:** Disabled (grayed out)
- **Cursor:** Not-allowed cursor on hover
- **Tooltip on Hover:** "Clone this role to create a customizable version"

**Save Button:**
- **State:** Disabled (no changes possible)
- **Label:** "Save Changes" (but grayed out)

**Delete Action:**
- **Visibility:** Hidden from actions menu
- **Menu Items:** Only "View" and "Duplicate" shown

**Alternative Action Promoted:**
- **Banner:** Blue info banner at top of form
- **Message:** "This is a System role and cannot be modified. Click 'Duplicate' to create a customizable version."
- **Action:** "Duplicate This Role" button (blue, navigates to create mode with pre-filled permissions)

---

### 8.11 Location-less Users

**Scenario:** Admin attempts to create or edit a user without selecting a location

**Validation Enforcement:**

**Pre-Submit:**
- Location selector marked with red asterisk (*)
- Hint text: "User will have access to this location and all child locations automatically"

**On Submit (No Location Selected):**
- Form submission proceeds to validation
- Validation fails
- Error message: "Location assignment is mandatory. Please select a location node."

**Warning Banner:**
- **Position:** Below location selector
- **Background:** Amber (#FEF3C7)
- **Text Color:** Amber dark (#92400E)
- **Icon:** Warning triangle
- **Message:** "**Location assignment is mandatory.** Please select a location node to define this user's data access scope."

**Submit Button:**
- **State:** Enabled (allows submit for validation)
- **Behavior:** Click triggers validation, shows error

**Prevention:**
- User cannot save without location
- Modal remains open
- Auto-scroll to location selector
- Location selector highlights with red border

---

### 8.12 Email Format Validation

**Validation Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Invalid Examples:**
- `john.doe` (missing @)
- `john.doe@` (missing domain)
- `john.doe@company` (missing TLD)
- `@company.com` (missing local part)
- `john doe@company.com` (contains space)

**Valid Examples:**
- `john.doe@company.com`
- `j.doe+test@company.co.uk`
- `user123@sub.domain.com`

**Error Message:**
- Display: Red text below email input
- Format: "Please enter a valid email address"
- Timing: On blur and on submit

**Validation Timing:**
1. **On Blur:** Validate format only
2. **On Submit:** Validate format + duplicate check

---

### 8.13 Inactive Role Assignment

**Scenario:** User has been assigned a role that was later soft-deleted

**UI Display (User List):**
- **Role Badge:** "Safety Manager (Deleted)"
- **Badge Style:**
  - Background: Gray (#F3F4F6)
  - Text Color: Gray dark (#6B7280)
  - Border: Gray (#D1D5DB)
- **Status:** User remains Active (role deletion doesn't auto-deactivate)

**Edit User Modal (User with Deleted Role):**

**Role Selector Behavior:**
- **Dropdown Opens:** On modal load
- **Current Role Display:** "Safety Manager (Deleted - Must Reassign)" in red
- **Red Border:** Around role selector
- **Validation Error (Initial):** Red text below: "This role has been deleted. Please assign a valid role."

**Save Button State:**
- **Initial:** Disabled
- **After New Role Selected:** Enabled

**Dropdown Options:**
- **Excluded:** All soft-deleted roles
- **Included:** Only active System and Custom roles

**Validation on Submit:**
```typescript
function validateUserRole(roleId: string): { valid: boolean; error?: string } {
  const role = roles.find(r => r.id === roleId);
  
  if (!role) {
    return { valid: false, error: "Please select a role" };
  }
  
  if (role.deletedAt !== null) {
    return { 
      valid: false, 
      error: "This role has been deleted. Please assign a valid role." 
    };
  }
  
  return { valid: true };
}
```

**User Impact:**
- User can continue accessing system with deleted role until reassigned
- Permissions from deleted role remain active (soft delete preserves data)
- Admin must reassign to new role to remove "(Deleted)" badge

---

## Appendix A: UI Component Specifications

### Toggle Switch

**Variants:**
- Modal/Fullscreen mode toggle
- Simple/Advanced mode toggle

**Dimensions:**
- Width: 44px
- Height: 24px
- Knob: 20px diameter

**Colors:**
- Off state: Gray (#D1D5DB)
- On state: Blue (#3B82F6)
- Knob: White

**Animation:**
- Transition: 200ms ease-in-out
- Transform: translateX(20px)

---

### Status Badges

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Active | Green-100 (#D1FAE5) | Green-800 (#065F46) | Green-200 |
| Inactive | Gray-100 (#F3F4F6) | Gray-800 (#6B7280) | Gray-200 |
| Pending | Amber-100 (#FEF3C7) | Amber-900 (#92400E) | Amber-200 |
| System Role | Blue-100 (#DBEAFE) | Blue-800 (#1E40AF) | Blue-200 |
| Custom Role | Purple-100 (#EDE9FE) | Purple-800 (#6B21A8) | Purple-200 |
| Deleted Role | Gray-100 (#F3F4F6) | Gray-600 (#6B7280) | Gray-200 |

**Typography:**
- Font size: 12px
- Font weight: 500 (medium)
- Padding: 4px 8px
- Border radius: 4px

---

### Confirmation Modals

**Structure:**
```
┌─────────────────────────────────────┐
│  [Icon]  Title                   [X]│
├─────────────────────────────────────┤
│                                     │
│  Message text with explanation     │
│                                     │
├─────────────────────────────────────┤
│              [Cancel] [Primary]     │
└─────────────────────────────────────┘
```

**Dimensions:**
- Width: 400px
- Max width: 90vw
- Padding: 24px

**Button Variants:**
- Cancel: Gray border, gray text
- Primary (Destructive): Red background, white text
- Primary (Safe): Blue background, white text

---

## Appendix B: Technical Implementation Notes

### Database Schema Extensions

**Users Table:**
```sql
ALTER TABLE users ADD COLUMN invitation_token TEXT;
ALTER TABLE users ADD COLUMN invitation_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN invited_at TIMESTAMP;
ALTER TABLE users ADD COLUMN invited_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN last_invitation_sent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN activated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deactivated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deactivated_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN reactivated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN reactivated_by UUID REFERENCES users(id);
```

**Roles Table:**
```sql
ALTER TABLE roles ADD COLUMN osha_location_permissions JSONB;
ALTER TABLE roles ADD COLUMN deleted_at TIMESTAMP;
```

**Audit Logs Table:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES users(id),
  actor_email VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_metadata_gin ON audit_logs USING GIN (metadata);
```

---

### API Endpoints

**Role Management:**
- `POST /api/roles` - Create role
- `GET /api/roles` - List roles
- `GET /api/roles/:id` - Get role by ID
- `PATCH /api/roles/:id` - Update role
- `POST /api/roles/:id/duplicate` - Duplicate role
- `DELETE /api/roles/:id` - Soft-delete role
- `GET /api/roles/:id/assigned-users` - Get users assigned to role

**User Management:**
- `POST /api/users/invite` - Invite user
- `POST /api/users/:id/resend-invitation` - Resend invitation
- `POST /api/users/accept-invitation` - Accept invitation (public)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `POST /api/users/:id/deactivate` - Deactivate user
- `POST /api/users/:id/activate` - Reactivate user

**Audit Logs:**
- `GET /api/audit-logs` - List audit logs (paginated)
- `GET /api/audit-logs/role/:roleId` - Get logs for specific role
- `GET /api/audit-logs/user/:userId` - Get logs for specific user

---

## Document Approval

**Version:** 1.0  
**Date:** January 23, 2026  
**Status:** ✅ Ready for Implementation

**Approved By:**
- Product Management: ________________
- Engineering Lead: ________________
- Security: ________________
- Compliance: ________________

**Next Steps:**
1. Engineering review and estimation
2. Backend API implementation
3. Frontend component development
4. QA test plan creation
5. Security audit
6. Compliance validation

---

**END OF DOCUMENT**
