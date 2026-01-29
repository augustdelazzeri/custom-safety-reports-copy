# Adições ao RBAC-2.md
## Baseado em Implementação e Validação do Protótipo

Data: 2026-01-26

---

## **ADIÇÃO 1: Campo Description para Custom Roles**

### **Localização:** Seção 3, Step 1: Role Identity (após linha 104)

### **Texto a adicionar após "Clone From (Optional):"**

```markdown
  * **Description (Optional):** A text area for defining the intended scope and use case of the role.
    * *Example:* "Restricted role for external electrical contractors" or "Full access for safety managers without OSHA compliance permissions".
    * *UI Implementation:* 
      * Component: `textarea` with 3 rows
      * Character Limit: 500 characters with live counter display ("X/500")
      * Placeholder: "e.g., Restricted role for external electrical contractors"
    * *Positioning:* Placed immediately after "Clone From" selector and before "Permission Matrix Configuration" (Step 2).
    * *Persistence:* Description is stored in the CustomRole object and displayed in:
      * Custom Roles table (truncated with tooltip for overflow)
      * Role creation/edit modals (both modal and fullscreen modes)
      * Role detail view
    * *Validation:* None required (field is optional). Empty or whitespace-only values are stored as `undefined`.
```

---

## **ADIÇÃO 2: Visual Distinction - Badge Colors (CORREÇÃO)**

### **Localização:** Seção 2.2.2 Custom Roles (Mutable) (substituir linha 86)

### **Texto a substituir (linha 86 atual):**
```markdown
* **Visual Indicator:** Represented in the UI by a **Purple badge**.2
```

### **Novo texto:**

```markdown
* **Visual Indicator:** Badge colors vary by context for optimal UX:
  * **Custom Roles Table (Settings > Custom Roles):** 
    * System Roles: **Blue badge** (`bg-blue-100 text-blue-700 border-blue-200`) with lock icon
    * Custom Roles: No special badge (standard table row)
  * **User Management List (Settings > People):** 
    * System Roles: **Blue badge** (`bg-blue-100 text-blue-700 border-blue-200`)
    * Custom Roles: **Gray badge** (`bg-gray-100 text-gray-700 border-gray-300`) for discreet visual distinction
  * *Design Rationale:* Gray badges on the User List prevent visual clutter and excessive highlighting while maintaining clear differentiation from immutable System Roles. This ensures System Roles remain visually prominent without overwhelming the interface with multiple colored badges.
```

---

## **ADIÇÃO 3: Global Admin Default Permissions**

### **Localização:** Seção 2.1.1 Super Admin (Global Administrator) → Capabilities (após linha 35, antes de "Constraint:")

### **Texto a adicionar após "Cross-Module Authority:"**

```markdown
  * **Default Permission Set:** The Global Admin role is pre-configured with **100% of all available permissions** to ensure immediate system usability without requiring manual configuration. This includes:
    * **Standard Modules:** Full CRUD access (Create, Read, Update, Delete, Archive, Export, Comment) across all 10 EHS modules:
      * Safety Events, CAPA, OSHA Compliance, Work Orders, Access Points, LOTO, PTW, JHA, SOP, Audit
    * **OSHA Location Permissions:** By default, Global Admin has **unrestricted access to all OSHA establishments** for all OSHA entities:
      * OSHA Logs (300, 301, 300A)
      * OSHA Cases
      * OSHA Establishments
      * *Behavior:* When new OSHA establishments are added to the system, Global Admin automatically gains full permissions without manual update.
    * **Permission Count:** Typically 140+ individual permissions enabled (exact count depends on visible modules in Simple/Advanced mode).
    * *Implementation Note:* This "all-permissions-granted" approach eliminates configuration overhead for the initial Super Admin and ensures no administrative lockout scenarios during system setup.
```

---

## **Seção Modificada: Custom Roles Table - Description Column**

### **Localização:** Seção 5.1 Role Detail View (adicionar após linha 192, antes de "5.2 User Management List")

### **Texto a adicionar:**

```markdown
### **5.1.1 Custom Roles Table**

The Custom Roles management table displays all System and Custom Roles with the following structure:

* **Table Columns:**
  1. **Role Name:** (Sortable alphanumeric) with System Role badge (blue with lock icon) where applicable.
  2. **Description:** Displays the optional role description. 
     * *Empty State:* Shows "(No description)" in gray italic if no description is set.
     * *Long Descriptions:* Text is truncated with CSS (`max-w-xs truncate`) and full text is available via `title` tooltip on hover.
  3. **Permissions:** Badge showing count of enabled permissions (e.g., "145 permissions").
  4. **Type:** "System" or "Custom".
  5. **Created:** Date in format "MMM DD, YYYY".
  6. **Actions:** Kebab menu (⋮) with Edit, Duplicate, Delete options.

* **Description Column Behavior:**
  * Width: Flexible, with `max-w-xs` constraint to prevent excessive table width.
  * Overflow: `truncate` class with `title` attribute for full text on hover.
  * Styling: `text-sm text-gray-600` for standard descriptions, `text-gray-400 italic` for empty state.
```

---

## **ADIÇÃO 4: Audits & Inspections em Simple Mode**

### **Localização:** Seção 3, Step 2.1 Simple Mode (Category-Level Grouping) (linha 112)

### **Texto a modificar:**

**Linha atual:**
```markdown
Designed for rapid configuration, this mode groups actions into high-level functional categories across the 5 core modules: **Events, CAPA, OSHA, Access Points, and LOTO**.4
```

**Novo texto:**
```markdown
Designed for rapid configuration, this mode groups actions into high-level functional categories across the 6 core modules: **Events, CAPA, OSHA, Access Points, LOTO, and Audits & Inspections**.4
```

### **Contexto:**

Durante a prototipagem e validação com usuários, identificou-se que o módulo "Audits & Inspections" é suficientemente fundamental para estar disponível no Simple Mode, não apenas no Advanced Mode.

**Justificativa:**
* Auditorias de segurança são uma funcionalidade core do EHS, não uma feature "avançada"
* Simplifica onboarding de novos administradores que precisam configurar roles básicas
* Alinha com expectativas de usuários de outros sistemas EHS

**Módulos no Simple Mode (atualizado):**
1. Access Points (QR Codes)
2. Safety Events
3. CAPA (Corrective and Preventive Actions)
4. OSHA Compliance
5. LOTO (Lockout/Tagout)
6. **Audits & Inspections** ← NOVO
7. Safety Work Orders

**Advanced Mode continua com 10 módulos total**, adicionando: JHA, SOP, PTW.

---

## **ADIÇÃO 5: CMMS Integration Badge (UI Enhancement)**

### **Localização:** Seção 3, Step 2: Permission Matrix Configuration (após linha 107, como nota adicional)

### **Texto a adicionar:**

```markdown
#### **2.3 CMMS Integration Indicator**

To improve administrator awareness, the UI displays a discrete **CMMS badge** next to module names that require CMMS permissions during record creation:

* **Visual Indicator:** Amber badge with link icon and text "CMMS"
* **Modules with Badge:**
  1. **CAPA:** Allows linking existing Work Orders from CMMS during CAPA creation
  2. **Permit to Work (PTW):** Checklist items can be created during PTW setup (Step 4), integrating with CMMS
  3. **Audits & Inspections:** "Save and Build Checklist" button auto-generates CMMS checklist

* **User Interaction:** 
  * Badge displays on hover: detailed tooltip explaining the specific CMMS integration requirement
  * Example tooltip: *"Users can link existing Work Orders from the CMMS during CAPA creation. Ensure CMMS permissions are granted if this feature will be used."*

* **Design Rationale:** 
  * Prevents confusion when users without CMMS permissions cannot access certain creation features
  * Makes cross-system permission dependencies explicit during role configuration
  * Follows principle of "progressive disclosure" - information available on-demand without cluttering the interface

**Note:** Other modules (SOP, LOTO, JHA, Work Orders) have CMMS integration but only *after* record creation, not during initial setup. The badge specifically identifies modules requiring CMMS access at creation time.
```

---

## **Contexto de Implementação**

Estas adições refletem decisões de design e implementação tomadas durante a prototipagem que:

1. **Melhoram a usabilidade** (campo description para documentação de roles)
2. **Esclarecem comportamentos esperados** (Global Admin com 100% de permissões)
3. **Corrigem inconsistências visuais** (badge colors por contexto)

Todas as mudanças foram validadas no protótipo frontend e estão documentadas em `docs/PROTOTYPE_ADJUSTMENTS.md`.

---

## **Arquivos Afetados na Implementação**

Para referência cruzada com o código:

- **Schema:** `src/schemas/roles.ts` (campo `description?`)
- **Contexts:** `src/contexts/RoleContext.tsx`, `src/contexts/UserContext.tsx`
- **Components:** 
  - `src/components/CreateRoleModal.tsx` (campo description)
  - `src/components/RoleBuilderMatrix.tsx` (badge CMMS com tooltip)
- **Pages:** `app/settings/custom-roles/page.tsx`, `app/settings/people/page.tsx`
- **Mock Data:** `src/samples/mockRoles.ts` (Global Admin com oshaLocationPermissions completo)
- **Permissions Data:** `src/data/permissionsMock.ts` (Audits & Inspections disponível em Simple Mode)

---

## **Notas Adicionais**

### **Decisões INCLUÍDAS na spec:**

1. **Campo Description:** Feature nova com impacto funcional (Adição 1)
2. **Badge Colors:** Clarificação de comportamento visual por contexto (Adição 2)
3. **Global Admin Permissions:** Esclarecimento de comportamento padrão crítico (Adição 3)
4. **Audits & Inspections em Simple Mode:** Mudança estrutural nos modos de configuração (Adição 4)
5. **CMMS Integration Badge:** Enhancement de UX para evitar confusão de permissões cross-system (Adição 5)

### **Decisões NÃO incluídas na spec (e por quê):**

1. **OSHA Header Redundancy Fix:** Bug de implementação UI, não design funcional
2. **Warning Banner Debug:** Ainda em troubleshooting, não confirmado como funcionando
3. **Button Positioning (Import Users):** Detalhes de layout CSS, não funcionalidade
4. **localStorage Versioning:** Detalhe de implementação técnica do protótipo
5. **Sidebar Navigation (Audits menu item):** Estrutura de navegação não costuma estar em specs funcionais

Essas decisões estão documentadas em `PROTOTYPE_ADJUSTMENTS.md` para referência da equipe de desenvolvimento.
