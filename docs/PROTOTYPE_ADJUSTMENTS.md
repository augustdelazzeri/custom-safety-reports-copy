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

