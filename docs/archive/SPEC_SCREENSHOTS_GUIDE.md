# Functional Specification Screenshots Guide

**Purpose:** Professional screenshots for the User Management & RBAC Functional Specification Document  
**Captured:** 2026-01-29  
**Viewport:** 1440x900 (Desktop Standard)  
**Quality:** 2x Device Scale Factor (Retina)  
**Location:** `docs/screenshots/spec/`

---

## 📸 Screenshot Inventory (9 Total)

### **1. User Management List Overview**
**File:** `user_management_list_overview.png` (402 KB)  
**Section:** 5.2 - User Management List

**Shows:**
- Full User Management table view
- Mixed user statuses: Active (green), Invited/Pending (yellow), Deactivated (red)
- Role badges: System Roles (blue) and Custom Roles (gray)
- Email, Location, Status, and Role columns clearly visible
- Action buttons (Edit, Deactivate)

**Usage in Spec:**
```markdown
**Figure 5.2.1:** User Management List showing status badges and role assignments
![User Management Overview](docs/screenshots/spec/user_management_list_overview.png)
```

---

### **2. Invite User Modal**
**File:** `invite_user_modal.png` (144 KB)  
**Section:** 4.1 - User Invitation Flow

**Shows:**
- "Add User" modal dialog centered on screen
- Email field partially filled: `newuser@example.com`
- Role selector dropdown
- Location hierarchy selector
- Invite/Cancel buttons

**Usage in Spec:**
```markdown
**Figure 4.1.1:** Invite User modal with required fields
![Invite User Modal](docs/screenshots/spec/invite_user_modal.png)
```

**Note:** This captures Section 4.1, Step 1-3 of the invitation flow.

---

### **3. Roles List Overview**
**File:** `roles_list_overview.png` (337 KB)  
**Section:** 2.2 - Role Types & Visual Distinction

**Shows:**
- Complete Roles & Permissions settings page
- System Roles with **BLUE badges** and **lock icons**
  - Global Admin
  - Location Admin
  - Technician
  - View-Only
- Custom Roles with standard styling (no special badge in this view)
- Description column visible
- Permission count badges (e.g., "145 permissions")
- Created date and Actions menu

**Usage in Spec:**
```markdown
**Figure 2.2.1:** Roles list showing System (blue, locked) vs Custom roles
![Roles List Overview](docs/screenshots/spec/roles_list_overview.png)
```

---

### **4. Role Badge Comparison Zoom**
**File:** `role_badge_comparison_zoom.png` (63 KB)  
**Section:** 2.2.2 - Badge Color Specification

**Shows:**
- Close-up crop of the Role Name column
- Direct visual comparison:
  - **System Role:** Blue badge with lock icon
  - **Custom Role:** Standard text (no badge in Custom Roles table)
- Clear differentiation for documentation

**Usage in Spec:**
```markdown
**Figure 2.2.2:** Badge distinction detail - System Role (blue + lock) vs Custom Role
![Badge Comparison](docs/screenshots/spec/role_badge_comparison_zoom.png)
```

---

### **5. Create Role - Step 1: Identity**
**File:** `create_role_step1_identity.png` (199 KB)  
**Section:** 3 - Custom Role Creation, Step 1

**Shows:**
- Role creation form (modal or fullscreen)
- **Role Name field:** "Contractor Safety Lead"
- **Description field (NEW FEATURE):** "Limited access for external safety auditors."
- Character counter visible on description field
- "Start from existing role" option (if visible)

**Usage in Spec:**
```markdown
**Figure 3.1.1:** Role Identity step with new Description field
![Create Role Identity](docs/screenshots/spec/create_role_step1_identity.png)

Note: The Description field is optional and limited to 500 characters.
```

**Key Feature:** This screenshot demonstrates the **NEW Description field** added to role creation (Adição 1 from RBAC_SPEC_ADDITIONS.md).

---

### **6. Create Role - Step 2: Permission Matrix**
**File:** `create_role_step2_matrix.png` (199 KB)  
**Section:** 3 - Custom Role Creation, Step 2

**Shows:**
- Permission matrix in Simple or Advanced mode
- Modules grouped by category (Access Points, Safety Events, CAPA, etc.)
- Checkboxes/toggles for permissions (some ON, some OFF)
- Visual hierarchy: Module → Entity → Action
- Scroll area showing multiple modules

**Usage in Spec:**
```markdown
**Figure 3.2.1:** Permission matrix with module-level and action-level controls
![Permission Matrix](docs/screenshots/spec/create_role_step2_matrix.png)
```

---

### **7. CMMS Integration Indicator**
**File:** `cmms_indicator_tooltip.png` (92 KB)  
**Section:** 2.3 - CMMS Integration Badge (NEW)

**Shows:**
- CMMS badge next to module names (e.g., "CAPA", "Audits & Inspections")
- Amber/yellow badge with link icon and "CMMS" text
- *(Ideally shows tooltip on hover, but may require manual capture)*

**Usage in Spec:**
```markdown
**Figure 2.3.1:** CMMS Integration badge indicating cross-system dependency
![CMMS Indicator](docs/screenshots/spec/cmms_indicator_tooltip.png)

**Tooltip text example:** "Users can link existing Work Orders from the CMMS during CAPA creation. Ensure CMMS permissions are granted if this feature will be used."
```

**Key Feature:** This demonstrates the **CMMS Integration Badge** (Adição 5 from RBAC_SPEC_ADDITIONS.md).

**Manual Enhancement Needed:** To capture the tooltip hover state, manually:
1. Open role creation/edit
2. Scroll to CAPA, PTW, or Audit module
3. Hover over the "CMMS" badge
4. Screenshot when tooltip appears

---

### **8. Role Detail View**
**File:** `role_detail_view.png` (199 KB)  
**Section:** 5.1 - Role Detail View

**Shows:**
- Role creation/edit modal with data filled
- Role Name: "Safety Manager"
- Description: "Manages safety operations across multiple locations."
- Permission summary or matrix
- Save/Cancel buttons

**Usage in Spec:**
```markdown
**Figure 5.1.1:** Role detail view showing configuration summary
![Role Detail View](docs/screenshots/spec/role_detail_view.png)
```

**Note:** This can also represent the "Edit Role" view for existing custom roles.

---

### **9. Role Edit Warning Banner**
**File:** `role_edit_warning_banner.png` (199 KB)  
**Section:** 5.1 - Edit Role Safety Mechanism

**Shows:**
- Role edit screen
- *(Ideally)* Amber/yellow warning banner at top:
  > "Warning: This role is assigned to X active users. Changes will apply immediately."

**Usage in Spec:**
```markdown
**Figure 5.1.2:** Warning banner when editing role assigned to active users
![Warning Banner](docs/screenshots/spec/role_edit_warning_banner.png)
```

**Status:** ⚠️ Warning banner **may not be visible** in this screenshot if the role being edited is not assigned to any active users in mock data.

**Manual Capture Needed:** To show the warning banner:
1. Create a custom role (e.g., "Test Manager")
2. Assign it to at least one active user (Status: Active, not Invited)
3. Go back to Custom Roles table
4. Click "Edit" on that role
5. Screenshot should show amber warning banner at top

---

## 📋 Section Mapping to Spec Document

| Spec Section | Screenshot(s) | Status |
|--------------|---------------|--------|
| **2.2 Role Types** | #3, #4 | ✅ Complete |
| **2.3 CMMS Integration** | #7 | ⚠️ Tooltip needs manual hover |
| **3 Role Creation Step 1** | #5 | ✅ Complete |
| **3 Role Creation Step 2** | #6 | ✅ Complete |
| **4.1 User Invitation** | #2 | ✅ Complete |
| **5.1 Role Detail View** | #8, #9 | ⚠️ #9 needs active user assignment |
| **5.2 User Management** | #1 | ✅ Complete |

---

## 🎯 Insertion Examples for Spec Document

### Example 1: Inline with caption
```markdown
### 2.2.2 Visual Distinction

System Roles and Custom Roles are visually distinguished in the UI:

![Role Types Comparison](docs/screenshots/spec/roles_list_overview.png)
*Figure 2.2.1: System Roles (blue badges with lock icon) vs Custom Roles*

- **System Roles:** Blue badge (`bg-blue-100 text-blue-700`) with lock icon
- **Custom Roles:** Standard styling in Custom Roles table, gray badge in User Management list
```

### Example 2: Reference by figure number
```markdown
### 4.1 User Invitation Flow

The invitation process begins with the "Invite User" modal (see Figure 4.1.1):

![Invite User Modal](docs/screenshots/spec/invite_user_modal.png)
*Figure 4.1.1: Invite User modal with required fields*

**Step 1:** Enter user email...
```

### Example 3: Side-by-side comparison
```markdown
### Badge Color Context

Badge colors vary by context for optimal UX:

| Context | Screenshot | Badge Style |
|---------|------------|-------------|
| Custom Roles Table | Figure 2.2.1 | Blue for System, standard for Custom |
| User Management | Figure 5.2.1 | Blue for System, gray for Custom |

*(See screenshots `roles_list_overview.png` and `user_management_list_overview.png`)*
```

---

## ✅ Quality Checklist

Before inserting screenshots into the final spec, verify:

- [ ] **Resolution:** All screenshots are 1440x900 (Desktop Standard)
- [ ] **Clarity:** Text is readable at 100% zoom
- [ ] **Consistency:** UI elements match across screenshots
- [ ] **Relevance:** Screenshot clearly demonstrates the described feature
- [ ] **Professional:** No debug consoles, personal data, or artifacts visible
- [ ] **File Size:** Optimized (all under 500 KB)

---

## 🔧 Manual Enhancements Needed

Two screenshots may benefit from manual recapture:

### **Screenshot #7 (CMMS Indicator):**
**Current:** Shows CMMS badge but no tooltip  
**Ideal:** Shows tooltip on hover

**How to capture manually:**
1. Open Custom Roles > Create Role
2. Scroll to CAPA, PTW, or Audit module
3. Hover mouse over the amber "CMMS" badge
4. Wait for dark tooltip to appear
5. Screenshot: Crop to module header + badge + tooltip area

---

### **Screenshot #9 (Warning Banner):**
**Current:** May not show warning banner  
**Ideal:** Shows amber warning at top

**How to capture manually:**
1. Create custom role "Test Manager"
2. Assign it to an active user (John Doe, Status: Active)
3. Return to Custom Roles table
4. Click "Edit" on "Test Manager" role
5. Screenshot: Should show amber banner at top stating "Warning: This role is assigned to 1 active user..."

---

## 📦 File Formats & Compression

**Format:** PNG (lossless)  
**Color Depth:** 24-bit RGB  
**Compression:** Optimized (using Playwright's default compression)  
**DPI:** 144 (2x scale factor for Retina)

**Total Size:** ~1.4 MB for all 9 screenshots

---

## 🚀 Next Steps

1. ✅ Review all 9 screenshots for quality
2. ⚠️ Manually recapture #7 and #9 if needed (with hover/warning states)
3. ✅ Insert screenshots into Functional Spec document
4. ✅ Add figure captions and references
5. ✅ Verify screenshots render correctly in final PDF export

---

## 📄 Scripts Used

**Primary:** `capture-spec-screenshots-simplified.js`  
**Final 2:** `capture-final-screenshots.js`  
**Reusable:** Scripts saved in repo root for future updates

---

**Last Updated:** 2026-01-29  
**Captured From:** http://localhost:3000 (development environment)  
**Browser:** Chromium (Playwright v1208)
