# Location Hierarchy & Data Sovereignty
## Business Specification v1.0

**Document Owner:** Technical Product Owner  
**Last Updated:** January 23, 2026  
**Status:** Active  
**Target Audience:** Engineering Team, QA, Product Management

---

## Executive Summary

### The Business Problem

Global enterprises with distributed operations across multiple regions, countries, and facilities face a critical challenge: **data sovereignty and access control**. When a single EHS platform serves thousands of users across dozens of countries, we must ensure:

1. **Data Isolation**: Region A employees cannot access Region B's safety incidents, CAPA records, or operational data
2. **Regulatory Compliance**: Local data must remain within jurisdictional boundaries (GDPR, data residency laws)
3. **Operational Security**: Competitive intelligence between business units must be protected
4. **Hierarchical Reporting**: Executives need aggregated views while plant managers need isolation

**Example Scenario:**
- A safety manager in the Toronto Distribution Center should see all safety events from their facility
- They should NOT see safety events from the Atlanta Manufacturing plant
- However, a North America Regional Director should see data from BOTH Toronto AND Atlanta
- But the North America Director should NOT see data from the Europe Region

### The Solution: Recursive Location Tree

We implement a **6-level hierarchical tree** where:
- Each user is assigned a "Home Node" in the tree
- Users automatically inherit access to ALL data from their node + all descendant nodes
- Users are explicitly restricted from accessing sibling or parent nodes
- This creates natural data boundaries that align with organizational structure

---

## The 6-Level Location Model

### Hierarchy Definition

```
Level 1: Global Company
  ├─ Level 2: Region (e.g., "North America", "Europe", "Asia-Pacific")
  │   ├─ Level 3: Country (e.g., "USA", "Canada", "Mexico")
  │   │   ├─ Level 4: Site/Facility (e.g., "Toronto Distribution Center")
  │   │   │   ├─ Level 5: Area/Department (e.g., "Warehouse Floor", "Loading Dock")
  │   │   │   │   └─ Level 6: Asset/Production Line (e.g., "Forklift Station A", "Line 3")
```

### Level Characteristics

| Level | Business Purpose | Typical Scope | Data Volume |
|-------|-----------------|---------------|-------------|
| **1. Global** | Enterprise-wide view | Entire organization | 100% of all data |
| **2. Region** | Geographic/business unit | Multiple countries | 30-40% of data |
| **3. Country** | Legal entity/jurisdiction | National operations | 10-20% of data |
| **4. Site** | Physical facility | Single location | 3-8% of data |
| **5. Area** | Operational zone | Department/floor | 1-2% of data |
| **6. Asset** | Specific equipment | Individual machine | <1% of data |

### Key Design Principles

1. **Generic Labels**: Levels are semantically flexible (e.g., "Region" could be "Business Unit", "Country" could be "State")
2. **Strict Hierarchy**: Every node (except Global) MUST have exactly one parent
3. **No Skipping**: Cannot assign a Level 5 node directly under a Level 3 node
4. **Infinite Width**: A Region can have 2 countries or 20 countries - no limit on siblings
5. **Dynamic Structure**: Organizations can add/remove nodes as they grow or restructure

---

## Core Business Logic: The "Home Node"

### Concept

Every user in the system is assigned to a **Home Node** - a specific location in the organizational tree. This single assignment determines their entire data visibility scope.

### The Three Rules

#### Rule 1: Full Downstream Access (Children Inheritance)
```
✅ User Home Node: "North America" (Level 2)
   → CAN access: "USA", "Canada", "Mexico" (Level 3)
   → CAN access: "Toronto DC", "Atlanta Mfg", "Seattle Warehouse" (Level 4)
   → CAN access: ALL Areas and Assets under these sites
```

**Rationale:** A regional manager needs to see all operations within their region to:
- Generate aggregate safety reports
- Identify cross-facility trends
- Allocate resources effectively
- Comply with regional regulatory requirements

#### Rule 2: Zero Sibling Access (Horizontal Restriction)
```
❌ User Home Node: "North America" (Level 2)
   → CANNOT access: "Europe" (Level 2 - Sibling)
   → CANNOT access: "Asia-Pacific" (Level 2 - Sibling)
   → CANNOT access: Any children of those siblings
```

**Rationale:** Sibling business units are operationally independent:
- Competitive information protection
- Different regulatory jurisdictions
- Separate P&L accountability
- Data sovereignty requirements

#### Rule 3: Zero Upstream Access (Parent Restriction)
```
❌ User Home Node: "Toronto DC" (Level 4)
   → CANNOT access: "Canada" (Level 3 - Parent)
   → CANNOT access: "North America" (Level 2 - Grandparent)
   → CANNOT access: "Global Company" (Level 1 - Root)
```

**Rationale:** Plant-level employees should not see:
- Strategic company-wide data
- Other facilities' operational details
- Executive-level aggregated metrics
- Confidential cross-regional information

### Visual Example

```
Global Company (Level 1)
├─ North America (Level 2)  ← USER HOME NODE
│   ├─ USA (Level 3)  ✅ VISIBLE
│   │   ├─ Atlanta Mfg (Level 4)  ✅ VISIBLE
│   │   │   └─ Production Floor (Level 5)  ✅ VISIBLE
│   │   └─ Seattle Warehouse (Level 4)  ✅ VISIBLE
│   └─ Canada (Level 3)  ✅ VISIBLE
│       └─ Toronto DC (Level 4)  ✅ VISIBLE
│           └─ Loading Dock (Level 5)  ✅ VISIBLE
└─ Europe (Level 2)  ❌ NOT VISIBLE (Sibling)
    └─ Germany (Level 3)  ❌ NOT VISIBLE
        └─ Berlin Plant (Level 4)  ❌ NOT VISIBLE
```

---

## User Stories

### US-001: Regional Manager Needs Aggregate Reports

**As a** North America Regional Safety Director  
**I want to** see all safety incidents from USA, Canada, and Mexico facilities  
**So that** I can:
- Prepare quarterly board reports with regional metrics
- Identify systemic issues across multiple sites
- Benchmark facility performance against regional averages
- Allocate safety resources to high-risk locations

**Acceptance Criteria:**
- When I log in, my dashboard displays incidents from ALL North America facilities
- I can filter reports by Country, Site, Area, or Asset within my region
- I CANNOT see incidents from Europe or Asia-Pacific regions
- Exported reports include data from my entire regional tree

---

### US-002: Plant Manager Needs Facility Isolation

**As a** Toronto Distribution Center Manager  
**I want to** see ONLY safety data from my facility  
**So that** I can:
- Focus on my local team's performance without distraction
- Protect proprietary operational processes from other sites
- Comply with local labor agreements on data access
- Maintain competitive independence from other distribution centers

**Acceptance Criteria:**
- When I log in, my dashboard displays ONLY Toronto DC data
- I can drill down into Areas and Assets within Toronto DC
- I CANNOT see data from Atlanta, Seattle, or any other facilities
- I CANNOT see regional or company-wide aggregate metrics

---

### US-003: Equipment Operator Needs Asset-Level Access

**As a** Forklift Operator at Toronto DC - Loading Dock  
**I want to** see safety checklists and incidents for my specific work area  
**So that** I can:
- Report near-misses for my equipment only
- Complete daily safety inspections for my assigned assets
- View historical incidents relevant to my immediate workspace
- Avoid information overload from other departments

**Acceptance Criteria:**
- When I log in, I see only "Loading Dock" (Level 5) and specific forklifts (Level 6)
- I can create incidents and assign them to my assets
- I CANNOT see data from "Warehouse Floor" or other areas
- I CANNOT see facility-wide metrics or reports

---

### US-004: Executive Needs Global Visibility

**As a** Global VP of Safety  
**I want to** see aggregated data from all regions, countries, and facilities  
**So that** I can:
- Present company-wide safety KPIs to the board
- Identify best practices from top-performing regions
- Allocate corporate safety budgets based on global trends
- Ensure consistency in safety standards worldwide

**Acceptance Criteria:**
- When I log in, my dashboard displays data from ALL locations globally
- I can drill down into any Region > Country > Site > Area > Asset
- I can compare metrics across different regions and countries
- Exported reports include company-wide aggregated data

---

### US-005: IT Admin Needs to Restructure Organization

**As a** System Administrator  
**I want to** add, move, or delete nodes in the location tree  
**So that** I can:
- Reflect organizational changes (acquisitions, divestitures, restructuring)
- Correct data entry errors from initial setup
- Maintain an accurate representation of company structure
- Support business scalability as the company grows

**Acceptance Criteria:**
- I can create new nodes at any level (with proper parent assignment)
- I can rename nodes without losing associated data
- I can move nodes to different parents (with validation)
- I CANNOT delete nodes that have active users or historical data
- System warns me of cascading impacts before structural changes

---

## Acceptance Criteria for Developers

### Location Selector Component Behavior

#### Context 1: Create Mode (Assigning Objects to Locations)

**Use Cases:** Creating CAPA, Access Point, Safety Event, Work Order

**Behavior:**
```
User selects: "Toronto DC - Loading Dock" (Level 5)

Visual Display:
✓ Global Company (Level 1) - Indeterminate (parent)
  ✓ North America (Level 2) - Indeterminate (parent)
    ✓ Canada (Level 3) - Indeterminate (parent)
      ✓ Toronto DC (Level 4) - Indeterminate (parent)
        ☑ Loading Dock (Level 5) - CHECKED (selected)

Data Saved: Only "Loading Dock" node ID
```

**Requirements:**
- User MUST select exactly one node
- UI shows indeterminate checkboxes for all parent nodes (visual context only)
- Only the selected node ID is persisted in the database
- Parent associations are inferred from the tree structure, not duplicated

**Edge Cases:**
- Cannot select multiple nodes
- Cannot leave selection empty (validation error)
- If selected node is deleted later, system must prevent or migrate data

---

#### Context 2: Filter Mode (Searching for Data)

**Use Cases:** User Management table, Safety Event search, CAPA filter, Access Point filter

**Behavior:**
```
User selects: "Canada" (Level 3)

Visual Display:
☑ Canada (Level 3) - CHECKED (selected)
  ✓ Toronto DC (Level 4) - Auto-included (child)
    ✓ Loading Dock (Level 5) - Auto-included (child)
      ✓ Forklift Station A (Level 6) - Auto-included (child)

Data Filter: ["canada-node-id", "toronto-dc-node-id", "loading-dock-node-id", "forklift-a-node-id"]
```

**Requirements:**
- User CAN select one or multiple nodes
- Selected node + ALL children are automatically included in filter
- Children are visually highlighted with distinct background color
- Counter shows: "X locations selected (Y total including children)"
- NO "Include sub-locations" checkbox - children are ALWAYS included
- Parent nodes are NOT included in the filter

**Edge Cases:**
- Selecting a Level 6 node (leaf) returns only that node (no children)
- Selecting multiple siblings returns both trees independently
- Empty selection returns ALL locations user has access to (based on their Home Node)

---

#### Context 3: User Assignment (Assigning Home Node)

**Use Cases:** Creating/editing users, assigning roles with location scope

**Behavior:**
```
Admin selects: "North America" (Level 2) as user's Home Node

Visual Display:
☑ North America (Level 2) - CHECKED (user's home node)
  ✓ USA (Level 3) - Auto-granted (child)
  ✓ Canada (Level 3) - Auto-granted (child)
  ✓ Mexico (Level 3) - Auto-granted (child)
    ... ALL children recursively

Data Saved: Only "North America" node ID
User Access Scope: "north-america-node-id" + all child node IDs (computed at query time)
```

**Requirements:**
- Admin MUST select exactly one node as the user's Home Node
- UI shows all children that will be accessible (non-editable, informational)
- Only the Home Node ID is stored in the user record
- Access scope is calculated dynamically using recursive tree query
- NO option to manually select/deselect children

**Edge Cases:**
- Admin cannot assign a user to a node outside their own access scope
- If Home Node is deleted, user must be reassigned before deletion completes
- Moving a node in the tree automatically updates all users' access scope

---

### Validation Rules

#### VR-001: Node Deletion
```sql
-- Pseudo-logic
IF node.hasActiveUsers() OR node.hasHistoricalData() THEN
  RETURN Error("Cannot delete node with associated users or data")
ELSE IF node.hasChildren() THEN
  RETURN Error("Cannot delete parent node. Delete children first or move them.")
ELSE
  ALLOW deletion
END IF
```

**User Message:**
> "This location cannot be deleted because it has:
> - 3 active users assigned
> - 47 safety events
> - 12 active CAPAs
> 
> Please reassign users and archive/migrate data before deletion."

---

#### VR-002: Node Creation
```typescript
interface CreateNodeValidation {
  name: string; // Required, 1-100 chars
  parentId: string; // Required (except for Global root)
  level: 1 | 2 | 3 | 4 | 5 | 6; // Auto-calculated from parent.level + 1
}

Rules:
- Parent node MUST exist
- New node level MUST be exactly parent.level + 1 (no skipping)
- Name MUST be unique among siblings (same parent)
- Cannot create nodes at Level 7 or beyond
```

**Error Messages:**
- "Parent location not found"
- "This would create a Level 7 node, which exceeds the maximum depth of 6"
- "A location named 'Toronto DC' already exists under 'Canada'"

---

#### VR-003: Node Movement (Re-parenting)
```typescript
interface MoveNodeValidation {
  nodeId: string;
  newParentId: string;
}

Rules:
- New parent MUST exist
- New parent CANNOT be the node itself (circular reference)
- New parent CANNOT be a descendant of the node (circular reference)
- Node's new level MUST be newParent.level + 1
- Moving a node moves ALL its children recursively

Side Effects:
- All users with Home Node = this node maintain their access scope
- All children update their absolute paths
- Historical data retains original location (audit trail)
```

**Warning Message:**
> "Moving 'Canada' from 'North America' to 'Europe' will affect:
> - 87 users who will now have access to European data
> - 3 child locations (Toronto DC, Montreal Plant, Vancouver Office)
> - 1,247 historical records (will maintain original location in audit log)
> 
> Are you sure you want to proceed?"

---

#### VR-004: User Home Node Assignment
```typescript
Rules:
- Admin MUST have access to the node they're assigning (cannot assign users to locations outside their own scope)
- User MUST have exactly one Home Node (cannot be null)
- Home Node MUST be an existing, active node
- When Home Node is changed, user loses access to old scope and gains new scope immediately
```

**Access Control Logic:**
```typescript
function canAdminAssignUserToNode(admin: User, targetNode: LocationNode): boolean {
  const adminAccessibleNodes = getNodeAndAllChildren(admin.homeNodeId);
  return adminAccessibleNodes.includes(targetNode.id);
}
```

---

#### VR-005: Location-Specific Permissions (OSHA Module)
```typescript
interface OSHALocationPermissions {
  [establishmentId: string]: RolePermissions;
}

Rules:
- If user has OSHA permissions, they MUST specify at least one establishment
- OSHA establishments are independent of the organizational tree
- A user can have different OSHA permissions for Toronto vs Atlanta
- Checking "View OSHA Forms" for Toronto does NOT grant access to Atlanta

Validation:
- IF role.permissions.osha exists
  THEN role.oshaLocationPermissions MUST NOT be empty
- Each establishment ID MUST correspond to a valid OSHA-registered location
```

**Example:**
```typescript
{
  oshaLocationPermissions: {
    "toronto-dc": {
      osha: {
        "OSHA Forms": {
          "view_300_log": true,
          "view_301_form": true,
          "edit_300_log": false
        }
      }
    },
    "atlanta-mfg": {
      osha: {
        "OSHA Forms": {
          "view_300_log": true,
          "edit_300_log": true, // Different permission level
          "submit_reports": true
        }
      }
    }
  }
}
```

---

## Data Model

### Location Node Schema
```typescript
interface LocationNode {
  id: string; // UUID
  name: string; // "Toronto Distribution Center"
  level: 1 | 2 | 3 | 4 | 5 | 6;
  parentId: string | null; // null only for Level 1 (Global)
  path: string[]; // ["global-id", "north-america-id", "canada-id", "toronto-dc-id"]
  isActive: boolean; // Soft delete flag
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string; // User ID
  };
}
```

### User Home Node Schema
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  homeNodeId: string; // Single location ID
  roleId: string;
  // ... other user properties
}

// Computed at query time
interface UserAccessScope {
  userId: string;
  homeNodeId: string;
  accessibleNodeIds: string[]; // homeNode + all children
}
```

---

## Technical Implementation Notes

### Database Queries

#### Get All Accessible Nodes for User
```sql
WITH RECURSIVE accessible_locations AS (
  -- Base case: user's home node
  SELECT id, parent_id, level, name
  FROM locations
  WHERE id = $homeNodeId
  
  UNION ALL
  
  -- Recursive case: all children
  SELECT l.id, l.parent_id, l.level, l.name
  FROM locations l
  INNER JOIN accessible_locations al ON l.parent_id = al.id
)
SELECT * FROM accessible_locations;
```

#### Filter Safety Events by Location
```sql
SELECT se.*
FROM safety_events se
WHERE se.location_id IN (
  -- Use the recursive CTE from above
  SELECT id FROM accessible_locations
)
AND se.created_at BETWEEN $startDate AND $endDate;
```

---

### Performance Considerations

1. **Cache User Access Scope**: Compute `accessibleNodeIds` once per session, cache in Redis
2. **Materialized Paths**: Store full path array in each node for faster ancestor queries
3. **Index Strategy**: 
   - Index on `parentId` for tree traversal
   - Index on `path` array for descendant queries
   - Composite index on `(location_id, created_at)` for filtered queries
4. **Pagination**: Always paginate location-filtered queries (could return thousands of records)

---

### Security Considerations

1. **Server-Side Enforcement**: NEVER trust client-side location filtering
2. **API Middleware**: Every API route must validate user's access to requested location
3. **Audit Trail**: Log all location access attempts (especially failures)
4. **Data Leakage**: Ensure aggregate metrics don't reveal sibling node data through inference

```typescript
// API Middleware Example
function requireLocationAccess(req: Request, res: Response, next: NextFunction) {
  const requestedLocationId = req.params.locationId;
  const userAccessibleIds = getUserAccessScope(req.user.id);
  
  if (!userAccessibleIds.includes(requestedLocationId)) {
    return res.status(403).json({
      error: "Access Denied",
      message: "You do not have permission to access this location"
    });
  }
  
  next();
}
```

---

## Glossary

| Term | Definition |
|------|------------|
| **Home Node** | The single location in the organizational tree assigned to a user, determining their entire data access scope |
| **Downstream** | Child nodes below the current node in the hierarchy |
| **Upstream** | Parent nodes above the current node in the hierarchy |
| **Sibling Nodes** | Nodes at the same level sharing the same parent |
| **Access Scope** | The complete set of location IDs a user can view data from (home node + all descendants) |
| **Data Sovereignty** | The principle that data is subject to the laws and regulations of the jurisdiction where it is collected/stored |
| **Indeterminate State** | UI checkbox state showing partial selection (used for parent nodes when only some children are selected) |
| **Leaf Node** | A node with no children (typically Level 6, but can be any level) |
| **Path** | The ordered sequence of node IDs from root to current node |

---

## Open Questions / Future Considerations

1. **Multi-Tenancy**: Should we support users with multiple Home Nodes (e.g., consultant working across regions)?
   - Current answer: No, single Home Node only. Use role-based access for special cases.
   
2. **Temporary Access**: Should admins be able to grant temporary "guest access" to locations outside a user's scope?
   - Current answer: Out of scope for MVP. Consider for Phase 2.
   
3. **Cross-Location Collaboration**: How do users from different locations collaborate on a shared CAPA?
   - Current answer: CAPA is assigned to the highest common ancestor location (e.g., if Toronto and Atlanta collaborate, assign to North America).

4. **Historical Data**: When a node is moved, should historical reports use old or new location?
   - Current answer: Historical data retains original location ID for audit accuracy. New data uses new location.

---

## Success Metrics

### KPIs to Track Post-Launch

1. **Access Violation Attempts**: < 1% of all API requests (indicates users understand their scope)
2. **Location Assignment Errors**: < 5% of new user creations require correction
3. **Query Performance**: P95 for location-filtered queries < 500ms
4. **User Satisfaction**: > 4.0/5.0 rating on "I can easily find the data I need for my location"

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-23 | Technical Product Owner | Initial specification based on EHS Data Sovereignty requirements |

---

**Next Steps:**
1. Engineering team to review and provide technical feasibility feedback
2. UI/UX team to create mockups for Location Selector variants
3. QA team to develop test scenarios based on user stories
4. Legal team to validate data sovereignty compliance approach
