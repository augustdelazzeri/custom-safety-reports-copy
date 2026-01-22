# EHS Prototype - Development Roadmap

## Current Sprint

### 1. Finalize Location Hierarchy Implementation

**Status**: In Progress 🔄

**Objectives**:
- Verify both selector modes (Cascade and Tree) are fully functional
- Fix any bugs in the Tree selector (search, expansion, selection)
- Confirm Asset field removal from all CAPA and Access Point flows
- Validate that the 6-level location hierarchy matches planned specifications
- Test data persistence across page reloads
- Ensure LocationSelection object structure is correct throughout the application

**Test Coverage**:
- [ ] Cascade mode: Select locations at all 6 levels
- [x] Tree mode: Search, expand, and select (Fixed: auto-expand on selection, removed sub-locations toggle)
- [ ] CAPA creation with hierarchical location selection
- [x] Access Point creation with hierarchical location selection (Fixed: modal overflow issue, increased width)
- [ ] Location display in CAPA Tracker, CAPA Details, and Access Points list
- [ ] Mode preference persistence in localStorage
- [x] Asset field completely removed from UI: CAPA ✅ | Access Point ✅

**Recent Fixes & Improvements** (Jan 22, 2026):

**Critical Fixes**:
- ✅ **CRITICAL**: Fixed infinite re-render loop caused by `useEffect` dependencies in LocationHierarchySelector and LocationTreeSelector
  - Changed dependency from entire `initialSelection` object to specific properties (`locationId`, `selectedLevel`)
  - Added reset logic when `initialSelection` is null
  - Used `eslint-disable-next-line react-hooks/exhaustive-deps` for intentional partial dependencies

**Bug Fixes**:
- ✅ Fixed Tree mode: Nodes now auto-expand when selected (if they have children)
- ✅ Fixed Tree mode: Resolved flickering issue where children appeared and disappeared when clicking parent nodes (removed duplicate onClick handlers)
- ✅ Fixed Access Point modal: Added max-height and overflow handling to prevent modal from growing off-screen
- ✅ Improved modal layout: Header and footer are now fixed, content scrolls independently

**UX Improvements - Tree Mode**:
- ✅ **All nodes expanded by default**: Tree now shows all locations expanded on mount, making it easier to browse the full hierarchy
- ✅ **Clear search button**: Added "X" button inside search input (right side) to quickly clear search terms
- ✅ **Removed "Include sub-locations" toggle**: This toggle only makes sense when filtering data (e.g., CAPAs by location), not when creating items
- ✅ **Better info message**: Updated help text to reflect new behavior ("All locations are shown expanded")
- ✅ Wrapped checkbox and label in proper HTML <label> element for better accessibility
- ✅ **Removed selection confirmation banner**: Removed unnecessary "Location selected" banner at the bottom

**Access Point Modal Improvements**:
- ✅ **Increased modal width**: Changed from `max-w-md` to `max-w-2xl` for better content spacing and readability
- ✅ **Removed Asset field**: Asset association removed from Access Point creation flow (aligning with CAPA flow)

**Files to Review**:
- `src/components/LocationSelector.tsx`
- `src/components/LocationTreeSelector.tsx`
- `src/components/LocationHierarchySelector.tsx`
- `app/capas/new/page.tsx`
- `src/components/CreateAccessPointModal.tsx`
- `src/contexts/CAPAContext.tsx`
- `src/contexts/AccessPointContext.tsx`

---

### 2. Custom Roles - Review and Alignment

**Status**: Not Started 📋

**Objectives**:
- Compare current implementation against `FUNCTIONAL_SPECS.md` (baseline)
- Use `CUSTOM_ROLES_IMPLEMENTATION.md` as the source of truth for complete feature set
- Identify missing functionalities, APIs, and actions
- Implement gaps to match production EHS repository capabilities
- Ensure all permission categories and granular controls are present
- Validate role management workflows (create, edit, duplicate, delete)

**Audit Checklist**:
- [ ] Review existing permission structure vs. documented structure
- [ ] Verify all 8 permission categories are correctly implemented
- [ ] Check Simple vs. Advanced mode toggle functionality
- [ ] Validate role duplication behavior (system roles vs. custom roles)
- [ ] Test duplicate name detection and validation rules
- [ ] Confirm base role selection works as expected
- [ ] Review RoleBuilderMatrix component completeness
- [ ] Test all CRUD operations with proper error handling

**Reference Documents**:
- `docs/Features review/FUNCTIONAL_SPECS.md` - Current state
- `docs/Features review/CUSTOM_ROLES_IMPLEMENTATION.md` - Target implementation
- `src/schemas/roles.ts` - Permission schema
- `src/components/CreateRoleModal.tsx` - Role creation form
- `src/components/RoleBuilderMatrix.tsx` - Permission matrix

---

## Notes

- Roadmap items are prioritized in order
- Each item must be completed and tested before moving to the next
- No commits until local testing is approved
- Focus on matching production-level functionality in mock environment

---

**Last Updated**: January 2026
