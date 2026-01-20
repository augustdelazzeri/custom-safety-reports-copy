# EHS User Management Enhancement - Implementation Plan

**Date:** January 20, 2026  
**Status:** In Progress

---

## Overview

Implementação de melhorias no sistema de gerenciamento de usuários e permissões EHS, incluindo navegação em abas, seleção em massa de permissões, templates de roles, e criação de usuários baseada em outros usuários.

---

## Objectives

1. **Validar UX de navegação**: Modal vs tela cheia para criação de roles
2. **Validar estrutura de navegação**: Links separados vs abas integradas
3. **Acelerar criação de roles**: Templates e seleção em massa
4. **Acelerar criação de usuários**: Copiar permissões de usuários existentes

---

## Implementation Steps

### ✅ Step 1: Create Tab Navigation System in People Page

**Status:** COMPLETED - Ready for Testing

**What was implemented:**
- Added tab UI to `/app/settings/people/page.tsx`
- Two tabs: "Users" and "Custom Roles"
- Tab state management with `activeTab` state
- Conditional rendering for both views
- Integrated Custom Roles functionality from `/app/settings/custom-roles/page.tsx`
- Separate state management for both tabs (search, filters, modals)
- Updated page title to "User Management"

**Changes made:**
- `app/settings/people/page.tsx`: 
  - Added `CreateRoleModal` import
  - Added `countEnabledPermissions` import
  - Added tab state (`activeTab: 'users' | 'roles'`)
  - Added role-specific state variables
  - Added role handlers (create, edit, duplicate, delete)
  - Added `formatDate` utility function
  - Added tab navigation UI with blue underline for active tab
  - Wrapped Users content in conditional render
  - Added complete Custom Roles tab content (search, table, actions)
  - Added CreateRoleModal to page

**Testing instructions:**
1. Navigate to `http://localhost:3000/settings/people`
2. Verify you see two tabs: "Users" and "Custom Roles"
3. Click on "Custom Roles" tab - should show roles table
4. Click on "Users" tab - should show users table
5. Test creating a role from the Custom Roles tab
6. Test creating a user from the Users tab
7. Verify both tabs maintain their own state (search queries, filters, etc.)

**What to validate:**
- [ ] Tab switching works smoothly
- [ ] Active tab has blue underline indicator
- [ ] Both tables display correctly
- [ ] Search and filters work independently in each tab
- [ ] Modals open correctly from both tabs
- [ ] Is tab navigation intuitive for users?
- [ ] Does it make sense to have Custom Roles as a tab within People?

---

### 🔄 Step 2: Add Feature Flag for Role Creation Mode

**Status:** NOT STARTED

**Planned implementation:**
- Create `src/utils/featureFlags.ts` with `ROLE_CREATION_MODE` constant
- Values: `'modal'` (default) or `'fullscreen'`
- When `'fullscreen'`: Replace modal with full-page form
- Form fills the content area within Custom Roles tab
- Add "Save" and "Cancel" buttons that return to roles list
- Maintain same validation and submission logic

**What to validate:**
- [ ] Is fullscreen mode better for complex permission configuration?
- [ ] Does it reduce cognitive load vs modal?
- [ ] Is it easier to see all permissions at once?

---

### 📋 Step 3: Implement Select All Functionality in RoleBuilderMatrix

**Status:** NOT STARTED

**Planned implementation:**
- Add global "Select All Permissions" checkbox at top of matrix
- Add per-category "Select All" checkbox in each section header
- Global checkbox:
  - Checked: All permissions enabled
  - Indeterminate: Some permissions enabled
  - Unchecked: No permissions enabled
- Category checkbox:
  - Checked: All permissions in that category enabled
  - Indeterminate: Some permissions in category enabled
  - Unchecked: No permissions in category enabled

**What to validate:**
- [ ] Does it speed up role creation?
- [ ] Is the behavior intuitive?
- [ ] Should indeterminate state be used or just checked/unchecked?

---

### 🎯 Step 4: Add Base Role Selector to Role Creation

**Status:** NOT STARTED

**Planned implementation:**
- Add dropdown at top of role creation form: "Start from existing role (optional)"
- Dropdown shows all existing roles (system + custom)
- When selected: Pre-populate all permission toggles with that role's values
- User can still modify any permission after selection
- Clear indication that permissions were copied from base role
- Works in both modal and fullscreen modes

**What to validate:**
- [ ] Does it significantly speed up creating similar roles?
- [ ] Is the "start from" metaphor clear?
- [ ] Should this replace the "Duplicate" action or complement it?

---

### 👥 Step 5: Add Copy from User Option in User Creation

**Status:** NOT STARTED

**Planned implementation:**
- Add radio buttons in CreateUserModal:
  - "Create from scratch" (default)
  - "Copy permissions from existing user"
- When "Copy from" selected:
  - Show dropdown of existing users
  - Auto-fill Role and Location fields based on selected user
  - Fields remain editable (can override)
  - Visual indicator showing values were copied
- Benefits: Quickly onboard users with same role/location

**What to validate:**
- [ ] Is this faster than just selecting role and location manually?
- [ ] Do users understand they can still override the copied values?
- [ ] Should email be pre-filled with a pattern (e.g., firstname.lastname@)?

---

### 🗺️ Step 6: Update Sidebar Navigation for Dual Access

**Status:** NOT STARTED

**Planned implementation:**
- Maintain existing separate links:
  - "Custom Roles" → `/settings/custom-roles`
  - "People" → `/settings/people`
- Add new unified link:
  - "User Management" → `/settings/people` (with tabs)
- OR: Keep sidebar as-is, test which users prefer
- Settings dropdown: Keep both options or remove?

**What to validate:**
- [ ] Which navigation pattern do users prefer?
  - Separate links for quick access?
  - Unified link with tabs for related content?
  - Both options available?
- [ ] Should Settings dropdown still exist or be removed?

---

## Observations & Notes

### General Implementation Rules:
- Each step must be completed and tested before moving to next
- User must give explicit OK before committing
- Steps 5 and 6 (mentioned in original request) refer to manual QA tests, not implementation tasks

### Technical Considerations:
- All changes use existing Context APIs (RoleContext, UserContext)
- No backend changes required (localStorage-based)
- Maintain existing validation rules
- Preserve audit trail fields (createdAt, updatedAt, etc.)

---

## Testing Checklist

### Step 1 - Tab Navigation (Current)
- [ ] Tab switching preserves individual tab state
- [ ] URLs remain clean (consider adding ?tab= query param)
- [ ] Back button behavior is intuitive
- [ ] Both tabs have proper empty states
- [ ] Search works independently in each tab
- [ ] Modals don't conflict between tabs

### Future Steps
(Checklists will be added as each step begins)

---

## Questions to Resolve

1. **Tab State Persistence**: Should active tab be saved to localStorage or URL query params?
2. **Feature Flag Storage**: Environment variable vs constant vs localStorage?
3. **Navigation Pattern**: Which should be primary - separate links or tabbed interface?
4. **Mobile Responsiveness**: How should tabs behave on mobile devices?

---

## Completed Implementations

### Step 1: Tab Navigation System ✅

**Files Modified:**
- `/app/settings/people/page.tsx` (major refactor)

**New Features:**
- Tab UI with "Users" and "Custom Roles"
- Independent state management for each tab
- Integrated full Custom Roles functionality
- Proper separation of concerns

**Testing URL:** 
- http://localhost:3000/settings/people (Users tab)
- http://localhost:3000/settings/people (Custom Roles tab via UI)

**Known Issues:** None

**Next Steps:** Await user testing feedback

---

## Current Status

**Active Step:** 1 (Tab Navigation System)  
**Status:** Ready for Testing  
**Awaiting:** User feedback and approval to proceed to Step 2

**Development Server:** Running on http://localhost:3000  
**Test Page:** http://localhost:3000/settings/people
