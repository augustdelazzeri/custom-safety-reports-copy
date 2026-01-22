# Custom Roles - Implementation Documentation

## Overview

The Custom Roles feature provides a comprehensive role-based access control (RBAC) system for the EHS (Environment, Health, and Safety) application. This implementation allows administrators to create, manage, and assign granular permissions to different user roles, ensuring that each user has the appropriate level of access to various system features.

## Purpose

Custom Roles enable organizations to:
- **Control Access**: Define who can perform specific actions within the system
- **Maintain Compliance**: Restrict sensitive operations (e.g., OSHA logs, PII data) to authorized personnel
- **Streamline Workflows**: Tailor permissions to match organizational hierarchy and responsibilities
- **Enhance Security**: Apply the principle of least privilege by granting only necessary permissions
- **Scale Management**: Create reusable role templates that can be assigned to multiple users

---

## Basic Flow

### 1. **Access Custom Roles**
- Navigate to **Settings** → **People** → **Roles** tab
- View the list of existing roles (both system and custom roles)

### 2. **Create a New Role**
- Click the **"Create Role"** button
- Modal or fullscreen form opens (user preference toggled via switch)

### 3. **Configure Role**
- **Enter Role Name**: Unique identifier for the role (e.g., "Site Inspector", "Safety Coordinator")
- **Select Base Role (Optional)**: Start with permissions from an existing role template
- **Define Permissions**: Use the permission matrix to grant or revoke specific capabilities
- **Toggle Advanced Mode**: Access additional granular permissions when needed

### 4. **Save Role**
- System validates role name uniqueness
- Role is created and added to the roles list
- Confirmation message displayed

### 5. **Manage Existing Roles**
- **Edit**: Modify role name or permissions
- **Duplicate**: Create a copy of an existing role (useful for creating variations)
- **Delete**: Remove custom roles (system roles are protected)

---

## General Explanation

### Permission Structure

Permissions are organized into **8 main categories**, each representing a core area of the EHS system:

1. **Safety Events**: Manage incident reporting and investigation
2. **CAPAs** (Corrective and Preventive Actions): Control CAPA creation and closure
3. **Compliance**: Access to OSHA logs and PII (Personally Identifiable Information)
4. **Documentation**: Manage SOPs, JHAs, LOTO procedures, and templates
5. **Access Points**: Create and manage QR codes for location-based event reporting
6. **Checklists**: Configure and complete inspection checklists
7. **Audit & Export**: View audit trails and export system data
8. **CMMS Bridge**: Manage safety-tagged work orders in the CMMS integration

### Permission Modes

#### Simple Mode (Default)
- Displays core permissions commonly used by most roles
- Simplified interface for quick role creation
- Ideal for standard organizational roles

#### Advanced Mode
- Reveals additional granular permissions for fine-tuned control
- Enables complex permission configurations
- Useful for specialized roles or compliance requirements

### System Roles vs. Custom Roles

#### System Roles
- Pre-configured template roles (e.g., "EHS Manager", "Site Safety Lead")
- **Cannot be deleted** (protected by system)
- Can be duplicated to create customized versions
- Serve as starting points for custom role creation

#### Custom Roles
- Created by administrators
- Fully customizable permissions
- Can be edited or deleted at any time
- Stored in localStorage (mock implementation)

---

## Features List

### Role Management

#### ✅ Create Roles
- Modal-based or fullscreen form (user-toggleable preference)
- Role name input with real-time validation
- Duplicate name detection
- Base role selection for quick setup
- Permission matrix interface

#### ✅ Edit Roles
- Modify role name
- Adjust permissions
- Cannot edit system roles (duplicate instead)
- Changes reflected immediately in user assignments

#### ✅ Duplicate Roles
- Clone existing roles (both system and custom)
- Automatically appends "(Copy)" to role name
- Preserves all permissions from source role
- Useful for creating role variations

#### ✅ Delete Roles
- Delete custom roles
- System roles are protected (cannot be deleted)
- Confirmation dialog before deletion
- Warning if role is assigned to users (future enhancement)

#### ✅ Search and Filter
- Real-time search by role name
- Filter roles in the table
- Case-insensitive search

#### ✅ Role Information Display
- Role name
- Permission count (e.g., "24/32 permissions")
- Created date
- Last modified date
- System role indicator badge

### Permission Management

#### ✅ Permission Matrix
- Visual matrix showing all categories and permissions
- Checkbox interface for toggling permissions
- Category-level "Select All" for bulk operations
- Global "Select All" / "Deselect All" buttons

#### ✅ Permission Categories (8 Total)

**1. Safety Events**
- Create safety events
- View all events (vs. only assigned events)
- Edit own events
- Edit all events
- Delete events
- **Advanced**: Add witness, Mark OSHA reportable, Export PDF

**2. CAPAs**
- Create CAPAs
- Assign CAPAs to users
- Approve CAPA closure
- View all CAPAs
- **Advanced**: Update status, Create work order, Export PDF

**3. Compliance**
- Access OSHA logs (PII data)
- Export PII data
- Sign official logs
- **Advanced**: Generate OSHA forms, Mark privacy cases

**4. Documentation**
- Create JHA/SOP documents
- Edit templates
- View-only access
- Approve documents
- **Advanced**: Create specific document types (SOP, JHA, LOTO, PTW), Submit for review, Digital sign-off, Mark as public, Version control, Export PDF

**5. Access Points**
- Create QR codes
- Edit QR codes
- Delete QR codes
- Scan QR codes

**6. Checklists**
- Create checklists
- Edit checklists
- Complete checklists
- Configure conditional logic
- Attach to work orders

**7. Audit & Export**
- View audit trail
- Export CSV
- Export PDF

**8. CMMS Bridge**
- Safety override (edit/delete safety-tagged work orders)

#### ✅ Advanced Mode Toggle
- Switch between Simple and Advanced permission views
- Reveals additional granular permissions
- State persisted per session
- Visual indicator when advanced mode is active

#### ✅ Base Role Selection
- Dropdown to select existing role as template
- Instantly applies all permissions from base role
- Can be modified after selection
- Option to start with blank permissions

---

## Actions & Operations

### Primary Actions

| Action | Description | Availability |
|--------|-------------|--------------|
| **Create Role** | Open role creation form | Always available |
| **Edit Role** | Modify existing role | Available for all roles |
| **Duplicate Role** | Clone a role | Available for all roles |
| **Delete Role** | Remove a custom role | Custom roles only (system roles protected) |
| **Search Roles** | Filter roles list | Always available |

### Permission Actions

| Action | Description | Scope |
|--------|-------------|-------|
| **Toggle Permission** | Enable/disable individual permission | Per checkbox |
| **Select All (Category)** | Enable all permissions in a category | Per category |
| **Deselect All (Category)** | Disable all permissions in a category | Per category |
| **Select All (Global)** | Enable all permissions across all categories | Entire matrix |
| **Deselect All (Global)** | Disable all permissions across all categories | Entire matrix |
| **Switch Mode** | Toggle between Simple and Advanced views | Entire matrix |

### Validation Rules

#### Role Name Validation
- **Required**: Role name cannot be empty
- **Minimum Length**: 3 characters
- **Maximum Length**: 50 characters
- **Uniqueness**: No duplicate role names allowed
- **Real-time Feedback**: Error messages display immediately

#### Permission Validation
- At least one permission must be enabled (recommended, not enforced)
- Conflicting permissions handled gracefully (e.g., "View Only" vs "Edit All")

---

## User Interface

### Role Creation Modes

#### Modal Mode
- Compact modal overlay
- Scrollable permission matrix
- Quick access for simple role creation
- Default mode

#### Fullscreen Mode
- Full-page form within the Custom Roles tab
- Expanded view for complex role configuration
- Better visibility for advanced permission setup
- User preference saved in localStorage

### Mode Toggle Switch
Located in the header next to "Create Role" button:
- **Modal** ○ **Fullscreen**
- Instant toggle between modes
- Preference persists across sessions

### Role Table

#### Columns
1. **Role Name**: Name with system role badge if applicable
2. **Permissions**: Count of enabled permissions (e.g., "24/32")
3. **Created Date**: Formatted date (e.g., "Jan 15, 2026")
4. **Last Modified**: Formatted date
5. **Actions**: Dropdown menu with Edit, Duplicate, Delete options

#### Visual Indicators
- **System Role Badge**: Blue badge indicating protected roles
- **Permission Count**: Green if >50% enabled, gray otherwise
- **Hover States**: Row highlighting on hover
- **Action Menu**: Three-dot menu for each role

---

## Technical Implementation

### Data Storage
- **Mock Implementation**: localStorage-based persistence
- **Context API**: `RoleContext` manages global role state
- **Future**: Ready for backend API integration

### State Management
- React Context API for global role state
- Local component state for UI interactions
- Optimistic updates for instant feedback

### Validation
- Real-time duplicate name checking
- Input validation on blur and submit
- Error messages with specific guidance

### Permissions Schema
- Strongly typed TypeScript interfaces
- Hierarchical structure (categories → permissions)
- Extensible design for future permission additions

---

## Future Enhancements

### Planned Features
- [ ] Role assignment impact analysis (show which users have a role before deletion)
- [ ] Permission presets for common industry roles
- [ ] Bulk role assignment
- [ ] Role inheritance and nested permissions
- [ ] Permission usage analytics
- [ ] Export/import role configurations
- [ ] Role templates marketplace

### Backend Integration
- [ ] API endpoints for CRUD operations
- [ ] Database persistence
- [ ] Multi-tenant support
- [ ] Audit logging for permission changes
- [ ] Role-based data filtering

---

## Usage Examples

### Example 1: Creating a "Site Inspector" Role
1. Click "Create Role"
2. Enter name: "Site Inspector"
3. Select "Safety Lead" as base role
4. Adjust permissions:
   - ✅ Safety Events: Create, View All, Edit Own
   - ✅ CAPAs: View All
   - ✅ Documentation: View Only
   - ✅ Access Points: Scan QR Codes
   - ✅ Checklists: Complete
5. Click "Create Role"

### Example 2: Duplicating and Customizing a System Role
1. Find "EHS Manager" system role
2. Click Actions → Duplicate
3. New role created: "EHS Manager (Copy)"
4. Click Actions → Edit
5. Rename to "Regional EHS Coordinator"
6. Remove "Delete events" permission
7. Add "Export CSV" permission
8. Click "Save Changes"

### Example 3: Using Advanced Mode for Compliance Role
1. Click "Create Role"
2. Enter name: "Compliance Officer"
3. Toggle "Advanced Mode" ON
4. Enable compliance-specific permissions:
   - ✅ Compliance: All permissions
   - ✅ Safety Events: Mark OSHA Reportable, Export PDF
   - ✅ Documentation: Generate OSHA Forms, Digital Sign-off
   - ✅ Audit & Export: All permissions
5. Click "Create Role"

---

## Best Practices

### Role Design
- **Principle of Least Privilege**: Grant only necessary permissions
- **Role Naming**: Use clear, descriptive names that reflect job functions
- **Base Roles**: Start with system roles when possible to ensure baseline permissions
- **Regular Reviews**: Periodically audit roles to ensure they match current needs

### Permission Configuration
- **Test in Staging**: Verify permission combinations before deploying to production
- **Document Decisions**: Keep notes on why specific permissions were granted/denied
- **Consistency**: Maintain consistent permission patterns across similar roles
- **User Feedback**: Gather input from role assignees to refine permissions

### System Maintenance
- **Avoid Over-Creation**: Reuse existing roles when possible
- **Clean Up Unused Roles**: Regularly delete roles no longer in use
- **Version Control**: When making significant changes, duplicate first as backup
- **Training**: Ensure administrators understand permission implications

---

## Glossary

- **RBAC**: Role-Based Access Control
- **PII**: Personally Identifiable Information
- **OSHA**: Occupational Safety and Health Administration
- **JHA**: Job Hazard Analysis
- **SOP**: Standard Operating Procedure
- **LOTO**: Lockout/Tagout
- **PTW**: Permit to Work
- **CAPA**: Corrective and Preventive Action
- **CMMS**: Computerized Maintenance Management System
- **System Role**: Pre-configured, non-deletable template role
- **Custom Role**: User-created, fully customizable role

---

## Related Documentation

- [EHS User Management Implementation](../EHS_USER_MANAGEMENT_IMPLEMENTATION.md)
- [Functional Specifications](./FUNCTIONAL_SPECS.md)
- [Implementation Plan](../IMPLEMENTATION_PLAN.md)

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: ✅ Implemented (Mock/Prototype)
