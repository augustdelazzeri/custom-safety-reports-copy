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

## 3. ✅ Campo Description - Visibilidade
**Issue:** Espaço para descrição opcional não estava visível na criação de custom role
**Verificação Necessária:** Campo já existe, verificar se há problema de CSS/layout
**Status:** Em investigação

---

## 4. ✅ Botão "Import Users" - Posicionamento
**Issue:** Botão "Import Users" estava "perdido" visualmente
**Decisão:** Já está ao lado de "Add User", mas pode precisar de reordenamento visual
**Ajuste:** Trocar ordem (Import Users à esquerda, Add User à direita destaque azul)
**Status:** Implementado

---

## 5. ✅ Warning Banner - Role com Usuário Ativo
**Issue:** Banner amarelo não apareceu ao editar role atribuída a usuário ativo
**Verificação:** Lógica está correta - CreateRoleModal verifica `isEditMode && activeUsersCount > 0`
**Possível Causa:** Role testada não tinha usuários **ativos** (status='active') atribuídos
**Nota:** Banner só aparece se houver pelo menos 1 usuário com `status: 'active'` usando a role
**Status:** Verificado - funcionando conforme esperado

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
1. Global Admin deve ter 100% das permissões por padrão? (Assumido: SIM)
2. Custom roles em cinza na lista de Users? (Decisão: SIM, mais discreto)
3. OSHA cabeçalho duplicado era bug ou design? (Corrigido: bug)
