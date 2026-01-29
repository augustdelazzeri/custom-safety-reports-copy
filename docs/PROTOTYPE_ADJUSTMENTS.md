# Prototype Adjustments Log
## Alterações Baseadas em Feedback Visual do Protótipo

Data: 2026-01-26

---

## 1. ✅ OSHA Module - Remover Cabeçalho Redundante
**Issue:** Cabeçalho de "OSHA Compliance" aparecendo duas vezes (fora e dentro)
**Decisão:** Manter apenas o cabeçalho interno (correto)
**Status:** Implementado

---

## 2. ✅ Global Admin - Selecionar Todas Permissões por Padrão
**Issue:** Global Admin deveria ter TODAS permissões ativas por padrão, incluindo todas de OSHA em todas locations
**Decisão:** Atualizar mockRoles.ts para que role_global_admin tenha 100% das permissões
**Status:** Implementado

---

## 3. ✅ Campo Description - Implementação Completa
**Issue:** Espaço para descrição opcional não estava visível na criação de custom role
**Resolução Final:** Campo implementado em AMBOS os modos (modal E fullscreen)

**Implementação:**
- **Schema:** `src/schemas/roles.ts` - Adicionado `description?: string` ao `CustomRole`
- **RoleContext:** `src/contexts/RoleContext.tsx` - `createRole()` e `updateRole()` aceitam description opcional
- **CreateRoleModal:** `src/components/CreateRoleModal.tsx` - Campo description após "Start from existing role"
- **Fullscreen Mode:** `app/settings/people/page.tsx` - Campo description no fullscreen role builder

**Características do Campo:**
- Localização: Após "Start from existing role" (ou "Role Name" se não houver base role)
- Tipo: `textarea` com 3 linhas
- Limite: 500 caracteres com contador visual "X/500"
- Placeholder: "e.g., Restricted role for external electrical contractors"
- Label: "Description (optional)" em cinza

**Status:** ✅ Implementado e testado em ambos os modos

---

## 4. ✅ Botão "Import Users" - Posicionamento Final
**Issue:** Botões estavam misturados com filtros, sem agrupamento claro
**Solução Implementada:** 
- Filtros agrupados à ESQUERDA (search, role, status, location)
- Botões de ação agrupados à DIREITA em container separado
- "Import Users" (cinza, secundário) à esquerda
- "Add User" (azul, primário) à direita
- Gap de 2 entre os botões (gap-2)
**Resultado:** Funcionalidades relacionadas ficam juntas, separadas dos filtros
**Status:** Implementado

---

## 5. 🔍 Warning Banner - Role com Usuário Ativo (DEBUG ATIVO)
**Issue:** Banner amarelo não aparece ao editar role atribuída a usuário ativo
**Implementação:** Lógica correta - `isEditMode && activeUsersCount > 0`
**Debug Adicionado:** Console.log mostra:
- roleId e roleName
- Total de usuários no sistema
- Usuários com essa role
- Usuários ATIVOS com essa role
- Se banner deveria aparecer (willShowBanner)

**Como testar:**
1. Criar uma custom role
2. Atribuir a um usuário com status='active'
3. Editar a role
4. Abrir console do navegador
5. Ver output do debug "🔍 Warning Banner Debug"

**Próximos Passos:** Analisar output do console para identificar problema
**Status:** Debug ativo, aguardando análise

---

## 6. ✅ Badges - Cores Inconsistentes
**Issue:** Badges na tela de Custom Roles não seguem as cores especificadas
- System Roles: AZUL (bg-blue-100, text-blue-700) ✅
- Custom Roles: Precisa verificar

**Tela Users:**
- System Roles: AZUL ✅
- Custom Roles: ROXO está muito destacado → Mudar para CINZA discreto
  - Decisão: `bg-gray-100 text-gray-700 border-gray-300`

**Status:** Em implementação

---

## 7. ✅ Global Admin Protection - OK
**Status:** Funcionando corretamente, aviso mostrado

---

## 8. ✅ Role Deletion Block - OK
**Status:** Funcionando corretamente, mostra count de usuários

---

## Notas Técnicas:
- Cache do navegador precisa ser limpo para ver as mudanças (localStorage)
- Versão do RoleContext atualizada para 3.0 para forçar reload

---

## Questões para Especificação:
1. Global Admin deve ter 100% das permissões por padrão? (Assumido: SIM) → **Documentado em RBAC_SPEC_ADDITIONS.md**
2. Custom roles em cinza na lista de Users? (Decisão: SIM, mais discreto) → **Documentado em RBAC_SPEC_ADDITIONS.md**
3. OSHA cabeçalho duplicado era bug ou design? (Corrigido: bug) → **Não adicionar à spec (bug de implementação)**

---

## 📄 Adições Recomendadas para a Especificação

As seguintes mudanças foram consideradas **significativas o suficiente** para justificar adição ao documento oficial `RBAC-2.md`:

### ✅ Recomendado Adicionar:
1. **Campo Description** (Seção 3, Step 1) - Feature nova não prevista na spec
2. **Badge Colors** (Seção 2.2.2) - Clarificação de comportamento por contexto
3. **Global Admin Permissions** (Seção 2.1.1) - Esclarecimento de padrão 100%

### ❌ NÃO Recomendado Adicionar:
- OSHA Header Fix (bug de implementação)
- Warning Banner Debug (ainda em troubleshooting)
- Button Positioning (detalhe de layout CSS)

**Ver documento completo:** `docs/RBAC_SPEC_ADDITIONS.md` (texto formatado pronto para copy/paste)

---

## Arquivos Modificados - Checklist Completo

### 📋 Schema & Types
- ✅ `src/schemas/roles.ts` - Adicionado campo `description?: string` ao `CustomRole`

### 🗄️ Mock Data
- ✅ `src/samples/mockRoles.ts` 
  - Renomeado `role_safety_admin` → `role_global_admin`
  - Renomeado `role_safety_manager` → `role_location_admin`
  - Renomeado `role_field_tech` → `role_technician`
  - Renomeado `View Only` → `View-Only`
  - Adicionado `oshaLocationPermissions` completo para Global Admin (Toronto + Atlanta, todas entidades)

- ✅ `src/samples/mockUsers.ts`
  - Atualizado `roleId` e `roleName` para todos os usuários refletindo novos nomes de System Roles

### 🎯 Context Providers
- ✅ `src/contexts/RoleContext.tsx`
  - `createRole()` e `updateRole()` aceitam parâmetro `description?: string`
  - Versão incrementada para 3.1 (força re-inicialização do localStorage)

- ✅ `src/contexts/UserContext.tsx`
  - Implementado `bulkImportUsers()` com validação e resolução de roles/locations
  - Implementado "Last Global Admin Protection" em `toggleUserStatus()`
  - Validação contra desativação do último Global Admin ativo

### 🧩 Components
- ✅ `src/components/CreateRoleModal.tsx`
  - Campo description após "Start from existing role"
  - Warning banner amarelo para edição de roles com usuários ativos
  - Debug logs para troubleshooting do banner
  - Conta usuários ativos por role

- ✅ `src/components/BulkUserImportModal.tsx` (NOVO)
  - Modal completo para import CSV
  - Download de template CSV
  - Upload drag-and-drop ou file picker
  - Validação linha por linha (email, role, location)
  - Preview table com indicação visual de valid/invalid
  - Download de error report
  - Import de rows válidas

- ✅ `src/components/RoleBuilderMatrix.tsx`
  - Esconde header externo para módulo "OSHA" (evita duplicação com OSHALocationSelector)

### 📄 Pages
- ✅ `app/settings/people/page.tsx`
  - Integrado `BulkUserImportModal`
  - Botões "Import Users" (gray) e "Add User" (blue) agrupados à direita
  - Campo `fullscreenDescription` para modo fullscreen
  - Badges: System Roles (blue), Custom Roles (gray discreto)
  - Proteção contra deleção de role atribuída a usuários

- ✅ `app/settings/custom-roles/page.tsx`
  - Wrapped com `UserProvider` para validação de deleção
  - Coluna "Description" na tabela (após "Role Name")
  - Badges: System Roles (blue)
  - Proteção contra deleção de role atribuída a usuários
  - Truncate + tooltip para descrições longas

### 🔧 Utilities & Data
- ✅ `src/data/permissionsMock.ts`
  - Redefinido `PermissionCategory` com 6 categorias funcionais
  - Adicionado `CATEGORY_METADATA` para UI
  - Atualizado todas as `category` dos `PermissionAction`
  - Atualizado `PERMISSION_CATEGORIES` e `getModuleCategories()`

### 📚 Documentation
- ✅ `docs/PROTOTYPE_ADJUSTMENTS.md` (NOVO)
  - Rastreamento de todos os ajustes visuais e decisões
  - Comparação com especificação original para validação futura

- ✅ `docs/RBAC_SPEC_ADDITIONS.md` (NOVO)
  - Documento formatado com 3 adições recomendadas para o RBAC-2.md
  - Texto pronto para copy/paste com indicação de localização exata
  - Inclui: Campo Description, Badge Colors clarificados, Global Admin default permissions

### 🔧 UX Enhancements
- ✅ `src/components/RoleBuilderMatrix.tsx`
  - Badge CMMS para módulos que requerem integração CMMS durante criação
  - Tooltip informativo ao passar mouse sobre badge
  - Módulos com badge: CAPA, PTW (Permit to Work), Audit
  - Mensagens específicas por módulo explicando a necessidade de CMMS

- ✅ `src/data/permissionsMock.ts`
  - Módulo "Audits & Inspections" agora disponível em Simple Mode
  - Removido flag `advancedOnly` do módulo audit
  - Reordenado para aparecer antes de "Safety Work Orders"
  - Simple Mode agora tem 7 módulos (era 6)

- ✅ `src/components/Sidebar.tsx`
  - Adicionado "Audits & Inspections" na seção DOCUMENTATION
  - Criado ícone `clipboard-check` para o menu
  - Ordem: JHA → SOP → LOTO → PTW → Audits & Inspections
  - Filtro condicional: PEOPLE & PERMISSIONS só visível para Global Admin

---

## 9. ✅ Profile Switcher - Simulação de Permissões
**Objetivo:** Permitir alternar entre perfis de usuário (Global Admin ↔ Technician) para validar o comportamento das permissões no protótipo

**Implementação Completa:**

### 📦 Novos Arquivos Criados:
1. **`src/contexts/ProfileContext.tsx`**
   - Context para gerenciar perfil atual (global_admin | technician)
   - Carrega permissões de `mockRoles.ts` baseado no perfil selecionado
   - Função `hasPermission(module, entity, action)` para verificar permissões
   - Persistência no localStorage para manter seleção entre reloads
   - Maps: perfil → roleId e perfil → nome de exibição

2. **`src/hooks/usePermissions.ts`**
   - Hook utilitário para verificação de permissões
   - `useActionPermission()`: para botões primários (Create, Submit)
   - `useActionPermissionSecondary()`: para botões secundários/outline
   - `useActionPermissionIcon()`: para botões de ícone e itens de menu
   - Retorna: `{ canPerform, buttonClass, disabled, title }`
   - Classes Tailwind consistentes: azul (habilitado) ou cinza (desabilitado)

### 🎨 Componentes Modificados:

**`src/components/Header.tsx`:**
- Adicionado Profile Switcher dropdown à esquerda do sino de notificações
- Mostra perfil atual com ícone de usuário
- Dropdown com 2 opções:
  - **Global Admin** - Full system access (ícone shield)
  - **Technician** - Limited permissions (ícone briefcase)
- Perfil selecionado destacado com fundo azul e checkmark
- Posicionamento: `[Profile ▼] [🔔 5] [Create]`

**`src/components/Sidebar.tsx`:**
- Integrado `useProfile()` hook
- Seção "PEOPLE & PERMISSIONS" só renderizada se `currentProfile === 'global_admin'`
- Technician não vê menu Settings na sidebar

**`src/components/Providers.tsx`:**
- `ProfileProvider` adicionado no topo da hierarquia
- Ordem: ProfileProvider > CAPAProvider > {children}
- Disponibiliza `useProfile()` para toda aplicação

### 🔒 Permissões por Página:

**Access Points (`app/access-points/page.tsx`):**
- ❌ Create (disabled para Technician)
- ❌ Edit (disabled)
- ❌ Archive (disabled)
- ✅ View (enabled)
- Tooltip: "You do not have permission to perform this action"

**Safety Events (`app/page.tsx`):**
- ✅ Create (enabled para Technician) ← **Pode criar!**
- ✅ View (enabled)
- ✅ Comment (enabled)
- ❌ Edit (disabled)
- ❌ Archive (disabled)
- ❌ Delete (disabled)
- ❌ Export (disabled)

**CAPAs (`app/capas/page.tsx`):**
- ❌ Create (disabled para Technician)
- ✅ View (enabled)
- ✅ View List (enabled)
- ✅ Comment (enabled)
- ❌ Edit (disabled)
- ❌ Duplicate (disabled - requer create)
- ❌ Archive (disabled)
- ❌ Delete (disabled)
- ❌ Export (disabled)

### 📄 Páginas Atualizadas (Headers Substituídos):

Todas as páginas agora usam o componente `Header.tsx` ao invés de headers inline:

1. ✅ `app/access-points/page.tsx` - Access Points list
2. ✅ `app/page.tsx` - Safety Events list  
3. ✅ `app/capas/page.tsx` - CAPA Tracker
4. ✅ `app/settings/people/page.tsx` - User Management
5. ✅ `app/settings/custom-roles/page.tsx` - Custom Roles
6. ✅ `app/settings/safety-templates/page.tsx` - Safety Templates
7. ✅ `app/safetyevents/new/page.tsx` - New Safety Event form
8. ✅ `app/safety-events/template-form/page.tsx` - Template form preview

**Benefício:** Profile Switcher agora visível em TODAS as páginas

### 🎯 Estilo dos Botões:

**Habilitado (Global Admin):**
```css
bg-blue-600 hover:bg-blue-700 text-white cursor-pointer
```

**Desabilitado (Technician):**
```css
bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed
```

**Tooltip ao hover:**
> "You do not have permission to perform this action"

### 📊 Permissões do Technician (mockRoles.ts):

```typescript
role_technician: {
  // Access Points
  'access-point': { view: true, create: false, edit: false, delete: false },
  
  // Safety Events - CAN CREATE!
  'event': { 
    view: true, 
    create: true,  // ← Habilitado
    edit: false, 
    delete: false,
    comment: true 
  },
  
  // CAPA - View only
  'capa': { 
    view: true, 
    create: false, 
    edit: false, 
    delete: false,
    comment: true 
  },
  
  // Sem permissões OSHA
  oshaLocationPermissions: {}
}
```

### 💾 Persistência:
- Profile selecionado salvo em `localStorage` com key `ehs_current_profile`
- Perfil persiste entre reloads da página
- Default: `global_admin`

### ✅ Commits Realizados:
1. `feat: add ProfileContext for permission simulation`
2. `feat: add usePermissions hook for consistent button styling`
3. `feat: add profile switcher to Header and filter Settings from Sidebar`
4. `feat: disable actions without permission in Access Points`
5. `feat: disable actions without permission in Safety Events`
6. `feat: disable all actions without permission in CAPAs`
7. `feat: add ProfileProvider to app hierarchy`
8. `fix: add Profile Switcher to all pages by using Header component`
9. `fix: add Profile Switcher to remaining pages`

**Status:** ✅ Implementado e testado em todas as páginas

**Como Testar:**
1. Recarregar navegador
2. Clicar no Profile Switcher (ao lado do sino de notificações)
3. Alternar para "Technician"
4. Observar:
   - Settings desaparece da sidebar
   - Botões ficam cinzas/desabilitados conforme permissões
   - Safety Events: pode criar, mas não editar
   - CAPAs/Access Points: só visualização
5. Alternar de volta para "Global Admin"
   - Todos os botões voltam azul/habilitados
   - Settings reaparece

---

