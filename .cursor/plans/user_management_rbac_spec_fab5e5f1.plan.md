---
name: User Management RBAC Spec
overview: Create a comprehensive Functional Specification Document (PRD) for the User Management & Custom Roles (RBAC) module following the company's "Gold Standard" structure, covering user invitation, system/custom roles, permission matrix, role assignment, audit trails, and edge cases.
todos: []
---

# Functional Specification: User Management & Custom Roles (RBAC)

## Document Structure

The PRD will be organized according to your company's "Gold Standard" structure with 8 main sections:

### 1. Overview

- Define the core objective (granular access control via RBAC)
- Cite compliance/security standards (SOC2, Least Privilege Principle)
- Establish the scope: User Invitation, System Roles, Custom Roles, Role Assignment

### 2. Roles & Definitions

- **Actors:**
- Super Admin (configures roles and OSHA establishments)
- User Administrator (invites users, manages assignments)
- End User (assigned role with location-based data access)
- **Role Types:**
- **System Roles (Immutable):** Pre-configured template roles (e.g., "EHS Manager", "Site Safety Lead") marked with blue "System" badge, cannot be deleted or have names changed
- **Custom Roles (Mutable):** User-created roles with fully customizable permissions, can be edited/deleted

### 3. Workflow: Custom Role Creation (The Wizard)

Based on the analyzed codebase, document the step-by-step role creation flow:

#### Step 1: Role Identity

- **Role Name Input:** Required field, 3-50 characters, unique validation
- **Clone from Existing Role (Optional):** Dropdown to select a System or Custom role as starting point
- **Mode Selection:** Modal vs. Fullscreen (user preference saved in localStorage)

#### Step 2: Permission Matrix Configuration

- **Simple Mode (5 core modules):**
- Events, CAPA, OSHA, Access Points, LOTO
- Actions grouped by category: View, Create & Edit, Approvals, Collaboration, Archive & Delete, Reporting
- Category-level "Select All" toggles

- **Advanced Mode (9 modules):**
- All modules: Events, CAPA, OSHA, Work Orders, Access Points, LOTO, PTW, JHA, SOP, Audit
- Individual action-level controls
- 3-level hierarchy: Module → Entity → Actions

- **Mode Switching Rules:**
- **Advanced → Simple:** System Must display confirmation modal if switching would hide enabled permissions from advanced-only modules (PTW, JHA, SOP, Audit)
- Confirmation message: "Switching to Simple Mode will hide permissions for 4 modules (PTW, JHA, SOP, Audit). These permissions will remain active but won't be visible in Simple Mode. Continue?"
- User can Cancel to stay in Advanced Mode or Confirm to proceed
- **Simple → Advanced:** No confirmation required (reveals more options, no data loss)

- **OSHA-Specific Location Permissions:**
- Required when OSHA module permissions are enabled
- Per-establishment permission configuration
- Validates at least one establishment has OSHA permissions configured

#### Step 3: Summary & Confirmation

- Real-time permission count display
- Validation rules enforced before save
- System role cloning creates "(Copy)" suffix

### 4. Workflow: User Invitation & Assignment

Document the user provisioning flow:

#### Invite User Modal/Page

- **Input Fields:**
- First Name (required)
- Last Name (required)
- Email Address (required, validated format, duplicate check)

- **Role Selector:**
- Dropdown with System Roles and Custom Roles
- Shows role type indicator (Template vs. Custom)

- **Location Assignment:**
- Mandatory location node selection (hierarchical tree selector)
- User inherits visibility for selected node + all child nodes
- **Dynamic Inheritance:** When new child locations are created under a user's assigned node, the user automatically gains access without requiring reassignment
- Warning banner if location not selected

- **Copy from Existing User (Create mode only):**
- Optional dropdown to pre-fill role and location from active user
- Reduces data entry for similar roles

#### Validation Logic

- Duplicate email detection (with user-friendly error)
- **Re-invitation handling for pending users:**
- If email exists with status "Pending", system Must offer "Resend Invitation" button instead of blocking
- Original invitation token expires after 7 days
- "Resend Invitation" generates new token with fresh 7-day expiration
- UI displays last invitation sent date: "Invitation sent on Jan 15, 2026"
- Location scope validation (cannot leave empty)

### 5. View Pages (The Interface)

#### Custom Roles List View

- **Table Columns:** Role Name, Permissions Count, Type, Created Date, Actions
- **System Role Indicators:** Blue "System" badge with lock icon
- **Actions Menu:** Edit (View for System roles), Duplicate, Delete (disabled for System roles)
- **Search & Filter:** Real-time role name search
- **Mode Toggle:** Simple/Advanced mode switch (affects permission counts displayed)

#### Role Detail View (Edit Mode)

- Read-only for System roles (with "Clone to customize" hint)
- Full edit capability for Custom roles
- Permission matrix with:
- Global "Select All" / "Deselect All" buttons
- Module-level "Select All" checkboxes
- Entity-level "Select All" checkboxes (Advanced mode)
- Action-level checkboxes

#### User Management List View

- **Table Columns:** Name, Email, Role Badge, Location Breadcrumb, Status, Actions
- **Filters:** 
- Search (name/email)
- Role dropdown
- Status (Active/Inactive)
- Location tree selector (shows node + children)
- **Role Badge Colors:**
- System roles: Blue
- Custom roles: Purple
- **Location Display:** Breadcrumb path (e.g., "North America > USA > Plant A")

### 6. Lifecycle & Logic

#### Role Lifecycle

- **Creation:** Roles are Active immediately upon save (no draft state)
- **Active:** Assignable to users, editable (Custom roles only)
- **Duplication:** Creates new Custom role with "(Copy)" suffix
- **Deletion:** 
- System roles: Cannot be deleted (Delete action hidden from UI)
- Custom roles: Soft-delete with cascade protection
- **Cascade Protection Rules:**
- System Must check if role is assigned to any active users before deletion
- If assigned users exist, block deletion and display error modal:
- Title: "Cannot Delete Role"
- Message: "This role is currently assigned to N active user(s). Please reassign these users to a different role before deleting."
- Action: "View Assigned Users" button (navigates to filtered user list)
- If no active users assigned, proceed with standard confirmation dialog

#### User Lifecycle

- **Invited (Pending):** User created via modal, email sent with invitation token
- Token valid for 7 days
- Status displayed as "Pending" in user list with amber badge
- Action menu shows "Resend Invitation" option
- If token expires before acceptance, user can click "Resend Invitation" to generate new token
- **Active:** User accepts invitation or token is accepted; full system access granted
- **Inactive:** Toggled via "Deactivate" action (preserves data, revokes access immediately)
- **Reactivate:** Toggle back to Active status (user regains access with unchanged role/location)

#### Dependency Logic

- **Role Deletion with Active Assignments:** Must be blocked (see Role Lifecycle above)
- **Role Edit Propagation:** 
- Changes to Custom role immediately affect all assigned users (no versioning)
- System Must display warning banner before saving edits: "This role is assigned to N active user(s). Changes will take effect immediately for all assigned users."
- No email notification sent to affected users (permission changes are transparent)
- **Location Inheritance:** 
- User sees data for assigned location + all descendant nodes (enforced at query level)
- **Dynamic:** When new child locations are created, user automatically gains access without manual reassignment
- **Revocation:** If assigned location is deleted/archived, user loses access to that subtree until reassigned

### 7. Audit Trail & Notifications

#### Events That Must Be Logged

- **Role Actions:**
- **Role Created:** Log role name, permission count, created by user ID, timestamp
- **Role Updated:** Log role ID, role name, **permission diff (before/after)**, updated by user ID, timestamp, affected user count
- **Permission Diff Format:** JSON structure showing added/removed/unchanged permissions
- Example: `{ "added": ["event:delete", "capa:approve"], "removed": ["osha:export"], "unchanged": 45 }`
- **Role Duplicated:** Log source role ID, new role ID, new role name, duplicated by user ID, timestamp
- **Role Deleted:** Log role ID, role name, deletion timestamp, deleted by user ID, assigned user IDs at time of deletion (for audit trail)

- **User Actions:**
- **User Invited:** Log user ID, email, assigned role ID, assigned location ID, invited by user ID, invitation token expiration, timestamp
- **Invitation Resent:** Log user ID, email, new token expiration, resent by user ID, timestamp
- **Invitation Accepted:** Log user ID, email, acceptance timestamp, IP address (for security audit)
- **User Role Changed:** Log user ID, **old role ID → new role ID**, changed by user ID, timestamp, **permission diff summary** (count of added/removed permissions)
- **User Location Changed:** Log user ID, **old location ID → new location ID**, old location path → new location path, changed by user ID, timestamp
- **User Status Changed:** Log user ID, old status → new status (Active ↔ Inactive), changed by user ID, timestamp, reason (optional field)
- **User Deleted:** Log user ID, email, role ID, location ID, deletion timestamp, deleted by user ID (soft delete preserves audit trail)

#### Notification Triggers

- **User Invitation:** Email sent to new user with invitation link, expires in 7 days
- **Invitation Resent:** Email sent with new invitation link and fresh 7-day expiration
- **Invitation Expiration:** Optional reminder email 1 day before expiration (configurable by admin)
- **Role Deletion Attempt:** In-app error modal (see Lifecycle section) blocking deletion if users are assigned
- **Permission Changes:** No automatic email notification to affected users (changes are transparent and immediate)

### 8. Edge Cases

#### Multiple Roles per User

- **Current Implementation:** 1 user = 1 role (strictly enforced)
- **Future Consideration:** Role stacking not planned

#### Editing Active Roles

- **Scenario:** Admin edits Custom role currently assigned to 50 active users
- **Required Behavior:** 
- System Must display warning banner above Save button: "⚠️ This role is assigned to 50 active user(s). Changes will take effect immediately for all assigned users."
- Banner color: Amber background (#FEF3C7) with amber text (#92400E)
- Changes propagate immediately to all users upon save (no approval workflow)
- No email notification sent to affected users
- Audit log captures permission diff (before/after) for compliance

#### Deleting Last Super Admin

- **Required Behavior:** 
- System Must check if role has "Super Admin" or equivalent full-access permissions
- Count active users assigned to this role
- If count = 1 (last Super Admin), block deletion and display error modal:
- Title: "Cannot Delete Last Super Admin Role"
- Message: "This is the only role with Super Admin permissions assigned to an active user. At least one Super Admin must exist at all times. Please assign another user to this role before deleting."
- Actions: "Cancel" (closes modal)
- If count > 1, proceed with standard deletion flow

#### Duplicate Role Names

- **Validation:** Real-time check on blur and submit
- **Error Message:** "A role named '[name]' already exists"
- **Case Sensitivity:** Case-insensitive comparison

#### OSHA Module Without Location Permissions

- **Validation:** If any OSHA module permission is enabled, at least one establishment must have OSHA permissions
- **Error Message:** "At least one OSHA permission must be configured for at least one establishment when OSHA module is enabled"

#### System Role Modification Attempts

- **Name Field:** Disabled with hint "System role names cannot be changed"
- **Permissions:** Checkboxes disabled with hint "Clone this role to create a customizable version"
- **Delete Action:** Hidden from actions menu

#### Location-less Users

- **Validation:** Mandatory location assignment enforced
- **Warning Banner:** Amber background with "Location assignment is mandatory" message
- **Prevention:** Submit button triggers validation; user cannot be created without location

#### Email Format Validation

- **Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Error Message:** "Please enter a valid email address"

#### Inactive Role Assignment

- **Required Behavior:** 
- Deleted (soft-deleted) roles Must be filtered from role selector dropdown in "Invite User" and "Edit User" modals
- Users with deleted roles Must display role name with "(Deleted)" suffix in user list: "Safety Manager (Deleted)"
- Badge color for deleted roles: Gray (#6B7280) with gray background (#F3F4F6)
- Edit user action Must require reassignment to an active role before saving
- Validation error if attempting to save user without reassigning from deleted role: "This role has been deleted. Please assign a valid role."

---

## Key Files Referenced

The specification is derived from analysis of:

- [`app/settings/people/page.tsx`](app/settings/people/page.tsx) - User management UI with tabs
- [`app/settings/custom-roles/page.tsx`](app/settings/custom-roles/page.tsx) - Standalone roles page
- [`src/components/CreateUserModal.tsx`](src/components/CreateUserModal.tsx) - User invitation modal
- [`src/components/CreateRoleModal.tsx`](src/components/CreateRoleModal.tsx) - Role creation modal
- [`src/components/RoleBuilderMatrix.tsx`](src/components/RoleBuilderMatrix.tsx) - Permission matrix UI
- [`src/schemas/roles.ts`](src/schemas/roles.ts) - Role data model and helpers
- [`src/schemas/users.ts`](src/schemas/users.ts) - User data model
- [`docs/EHS_USER_MANAGEMENT_SPEC.md`](docs/EHS_USER_MANAGEMENT_SPEC.md) - Original architecture
- [`docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md`](docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md)(docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md) - Implementation docs
- [`docs/Features review/FUNCTIONAL_SPECS.md`](docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md)(docs/Features review/FUNCTIONAL_SPECS.md) - Functional catalog (225+ actions across 19 modules)

---

## Tone and Prescriptive Language

The document will use:

- **UI Terminology:** Toggle switch, Multi-select dropdown, Modal, Checkbox matrix, Breadcrumb navigation
- **Prescriptive Verbs:** Must, Required, Read-only, Disabled, Mandatory
- **Clear States:** Active, Inactive, Pending, Deleted (soft), System, Custom
- **Validation Language:** "Must be at least 3 characters", "Cannot be empty", "Must be unique"