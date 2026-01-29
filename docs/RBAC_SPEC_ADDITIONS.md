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
- **Components:** `src/components/CreateRoleModal.tsx`, `src/components/RoleBuilderMatrix.tsx`
- **Pages:** `app/settings/custom-roles/page.tsx`, `app/settings/people/page.tsx`
- **Mock Data:** `src/samples/mockRoles.ts` (Global Admin com oshaLocationPermissions completo)

---

## **Notas Adicionais**

### **Decisões NÃO incluídas na spec (e por quê):**

1. **OSHA Header Redundancy Fix:** Bug de implementação UI, não design funcional
2. **Warning Banner Debug:** Ainda em troubleshooting
3. **Button Positioning (Import Users):** Detalhes de layout CSS, não funcionalidade
4. **localStorage Versioning:** Detalhe de implementação técnica do protótipo

Essas decisões estão documentadas em `PROTOTYPE_ADJUSTMENTS.md` para referência da equipe de desenvolvimento.
