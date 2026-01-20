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

**Status:** COMPLETED ✅

**What was implemented:**
- Added tab UI to `/app/settings/people/page.tsx`
- Two tabs: "Users" and "Custom Roles"
- Tab state management with `activeTab` state
- Conditional rendering for both views
- Integrated Custom Roles functionality from `/app/settings/custom-roles/page.tsx`
- Separate state management for both tabs (search, filters, modals)
- Updated page title to "User Management"
- Fixed header alignment issue (removed duplicate ml-64 margin)

**Validated:** ✅ Working as expected

---

### ✅ Step 2: Add Feature Flag for Role Creation Mode

**Status:** COMPLETED ✅

**What was implemented:**
- Created dynamic role creation mode with localStorage persistence
- Toggle switch UI (Modal ↔ Fullscreen) next to "Create Role" button
- Modal mode: Opens CreateRoleModal overlay
- Fullscreen mode: Replaces tab content with full form
- State persists across sessions via localStorage (`ehs_role_creation_mode`)
- Smooth transitions between modes

**Files modified:**
- `app/settings/people/page.tsx`: Added roleCreationMode state and toggle functionality
- Initially created `src/utils/featureFlags.ts` (now superseded by dynamic state)

**Validated:** ✅ Both modes working, toggle functional

---

### ✅ Step 3: Implement Select All Functionality in RoleBuilderMatrix

**Status:** COMPLETED ✅

**What was implemented:**
- Global "Select All Permissions" at top of RoleBuilderMatrix
- Per-category "Select All" button in each section header
- Indeterminate state (partial selection) with visual indicator
- Checkboxes with three states: checked, indeterminate, unchecked
- Color-coded by category (blue for standard, amber for compliance, purple for CMMS)
- Works in both Simple and Advanced modes

**Files modified:**
- `src/components/RoleBuilderMatrix.tsx`: Added Select All logic and UI

**Categories with Select All:**
- Safety Events
- CAPAs
- Compliance & Regulatory
- Documentation (includes CMMS integration)
- Access Points (Advanced)
- Checklists (Advanced)
- Audit & Export (Advanced)

**Validated:** ✅ All Select All buttons functional

---

### ✅ Step 4: Add Base Role Selector to Role Creation

**Status:** COMPLETED ✅

**What was implemented:**
- Dropdown "Start from existing role (optional)" at top of role creation form
- Grouped by "System Roles" and "Custom Roles"
- Shows permission count for each role
- Pre-fills all permissions when role selected
- Permissions remain editable after selection
- "Create from scratch" option resets to defaults
- Works in both Modal and Fullscreen modes
- Only appears when creating (not editing)

**Files modified:**
- `app/settings/people/page.tsx`: Added baseRoleId state and handleBaseRoleChange
- `src/components/CreateRoleModal.tsx`: Added base role dropdown with useRole hook

**Validated:** ✅ Dropdown functional, permissions copy correctly

---

### 👥 Step 5: Add Copy from User Option in User Creation

**Status:** COMPLETED ✅ - Ready for Testing

**What was implemented:**
- Added "Copy from existing user" dropdown in CreateUserModal
- Shows all active users with their role and location in dropdown
- Auto-fills Role and Location fields when user selected
- "Create from scratch" option to reset
- Fields remain editable after copy
- Only appears in create mode (not edit mode)
- Includes helper text explaining functionality

**Files modified:**
- `src/components/CreateUserModal.tsx`: Added copyFromUserId state and handleCopyFromUser function

**Testing instructions:**
1. Navigate to People tab and click "Add User"
2. Fill in name and email
3. Select a user from "Copy Role & Location from Existing User" dropdown
4. Verify Role and Location are pre-filled
5. Verify you can still edit Role and Location after copy
6. Test "Create from scratch" option clears the fields
7. Verify dropdown only shows active users
8. Verify it doesn't appear when editing existing users

**Validated:** ⏳ Awaiting user testing

---

### 🗺️ Step 6: Update Sidebar Navigation for Dual Access

**Status:** NOT STARTED ❌

**Planned implementation:**
- Keep existing separate links (Custom Roles, People) functional
- Add new unified "User Management" link as alternative entry
- Test which navigation pattern users prefer
- Decision point for final UX in production

**Files to modify:**
- `src/components/Sidebar.tsx` (or layout component)

**What to validate:**
- [ ] Which navigation pattern do users prefer?
- [ ] Separate links vs unified link with tabs?
- [ ] Both options or just one?

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
**Commit:** b05e84d  
**Files Modified:** `/app/settings/people/page.tsx`  
**Features:** Tab UI with independent state management for Users and Custom Roles tabs

---

### Step 2: Role Creation Mode Toggle ✅
**Commit:** 08709cf  
**Files Modified:** `/app/settings/people/page.tsx`  
**Features:** Dynamic toggle switch (Modal ↔ Fullscreen) with localStorage persistence

---

### Step 3: Select All Functionality ✅
**Commit:** d3eb6e8  
**Files Modified:** `/src/components/RoleBuilderMatrix.tsx`  
**Features:** Global + per-category Select All with indeterminate states

---

### Step 4: Base Role Selector ✅
**Commit:** 593cb5b  
**Files Modified:** 
- `/app/settings/people/page.tsx`
- `/src/components/CreateRoleModal.tsx`
**Features:** Template-based role creation from existing roles

---

### Step 5: Copy from User ✅
**Commit:** PENDING - Ready for commit  
**Files Modified:** `/src/components/CreateUserModal.tsx`  
**Features:** Copy Role & Location from existing users during user creation

---

## Bug Fixes Completed

### Dropdown Menu Z-Index Issue ✅
**Problem:** Edit/Duplicate/Delete dropdown appearing behind table content  
**Solution:** Changed from absolute to fixed positioning with dynamic coordinates using getBoundingClientRect()

### CMMS Integration Display ✅
**Problem:** CMMS permission cut off by overflow-hidden  
**Solution:** Removed overflow-hidden from Documentation section, integrated CMMS with purple badge

### React Key Warning ✅
**Problem:** Missing/invalid keys in location filter options  
**Solution:** Added .filter(Boolean) to remove falsy values before mapping

### JSX Parsing Error ✅
**Problem:** Extra closing </div> tag  
**Solution:** Removed orphaned closing tag

### Import Error (getRolesList) ✅
**Problem:** Trying to import getRolesList directly from RoleContext  
**Solution:** Changed to use useRole() hook pattern

---

## Current Status

**Active Step:** Step 5 (Copy from User) - COMPLETED, awaiting testing  
**Progress:** 5/6 steps completed (83%)  
**Next:** Step 6 (Sidebar Navigation) upon user approval

**Testing URL:** http://localhost:3000/settings/people  
**Development Server:** Running
