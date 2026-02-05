# Profile Switcher - Proposta de Documentação para Spec Final

Data: 2026-01-26

---

## 🔍 Resumo da Feature

**Profile Switcher** é uma funcionalidade implementada no protótipo para permitir a validação visual do comportamento de permissões RBAC alternando entre diferentes perfis de usuário (Global Admin e Technician).

**Objetivo:** Demonstrar como usuários com diferentes níveis de permissão experimentam a interface EHS.

---

## 📋 Proposta de Adições ao Documento Final

### ❓ Para Aprovação: O QUE DOCUMENTAR?

Você precisa decidir se alguma dessas mudanças deve ir para a especificação final (`Functional Spec_ User Management & RBAC-2.md`):

---

### **OPÇÃO 1: NÃO DOCUMENTAR (Recomendação)**

**Justificativa:**
- Profile Switcher é uma **ferramenta de prototipação**, não uma feature de produção
- No sistema real, o perfil do usuário é determinado pelo backend baseado em autenticação
- A funcionalidade já está clara na spec: diferentes roles têm diferentes permissões
- O comportamento visual (botões desabilitados vs ocultos) já está descrito

**O que já está coberto na spec atual:**
- Seção 2: Role Types (Global Admin vs Technician)
- Seção 3: Permission Matrix com granularidade por módulo
- Seção 4: OSHA Location Permissions
- Seção 5: UI behaviors (como roles são exibidas)

**Conclusão:** Profile Switcher não adiciona requisitos funcionais novos, apenas valida os existentes.

---

### **OPÇÃO 2: DOCUMENTAR COMO "PROTOTYPE FEATURE" (Se quiser formalizar)**

Se você quiser documentar para referência futura ou para outros stakeholders que virem o protótipo:

#### **Localização Sugerida:** Nova seção no final ou apêndice

#### **Texto proposto:**

```markdown
## Appendix A: Prototype-Specific Features

### A.1 Profile Switcher (Prototype Only)

For design validation purposes, the prototype includes a **Profile Switcher** in the application header that allows toggling between user profiles without re-authentication.

**Purpose:** 
- Demonstrate permission-based UI behavior without requiring multiple user accounts
- Validate that role-based restrictions are correctly applied across all modules

**Available Profiles:**
1. **Global Admin** - Full system access with all permissions enabled
2. **Technician** - Limited permissions (view-only on most modules, can create Safety Events)

**UI Behavior:**
- Located in header, left of notifications bell
- Shows current profile with dropdown menu
- Profile selection persists in browser localStorage

**Visual Feedback of Permissions:**
- **Enabled actions:** Blue buttons, clickable
- **Disabled actions:** Gray buttons with 50% opacity and "not-allowed" cursor
- **Tooltip on disabled:** "You do not have permission to perform this action"
- **Settings menu:** Completely hidden for Technician profile

**Implementation Note:** 
In production, user profile and permissions are determined by backend authentication. This switcher is **for prototype demonstration only** and will not be present in the production application.

**Permission Differences (Examples):**

| Module | Global Admin | Technician |
|--------|--------------|------------|
| Access Points | Full CRUD | View only |
| Safety Events | Full CRUD | Create + View (no edit/delete) |
| CAPAs | Full CRUD | View + Comment only |
| OSHA | Full access all locations | No access |
| Settings | Full access | Hidden menu |

```

---

### **OPÇÃO 3: APENAS MENCIONAR NO IMPLEMENTATION NOTES**

Se você quer só uma menção rápida sem entrar em detalhes:

#### **Localização Sugerida:** Seção 6 ou final

#### **Texto proposto:**

```markdown
**Prototype Note:** The functional prototype includes a profile switcher for design validation, allowing stakeholders to experience the interface from different permission levels (Global Admin vs Technician) without creating multiple accounts. This is a prototype-only feature and will not be implemented in production, where user permissions are determined by authentication.
```

---

## 🎯 Minha Recomendação Final

**NÃO documentar no spec final** (OPÇÃO 1), pelos seguintes motivos:

1. **Não é um requisito funcional** - É uma ferramenta de validação de design
2. **Pode causar confusão** - Stakeholders podem pensar que é uma feature de produção
3. **Já está implícito** - O comportamento de permissões já está descrito na spec
4. **Mantém spec focada** - Specs devem focar em requisitos, não em implementação de protótipo

**Onde manter a documentação:**
- ✅ `docs/PROTOTYPE_ADJUSTMENTS.md` (já documentado)
- ✅ README do repositório do protótipo (se necessário)
- ✅ Apresentações de validação com stakeholders

**Quando mencionar:**
- Durante demos: "Esse switcher é só para facilitar a validação, não vai para produção"
- Em handoff para devs: "O protótipo tem um switcher para testes, mas em produção isso vem do backend"

---

## ❓ DECISÃO NECESSÁRIA

Por favor, escolha uma das opções:

- [ ] **OPÇÃO 1:** NÃO documentar (mantém spec limpa, recomendado)
- [ ] **OPÇÃO 2:** Documentar como Appendix (formaliza a ferramenta de validação)
- [ ] **OPÇÃO 3:** Apenas mencionar em Implementation Notes (meio-termo)

**OU**

- [ ] **Outra abordagem:** _(descreva)_

---

## 📊 Comparação: O QUE JÁ ESTÁ vs O QUE É NOVO

### ✅ Já Documentado na Spec Atual:

| Aspecto | Localização na Spec |
|---------|---------------------|
| Global Admin tem todas permissões | Seção 2.1.1 |
| Technician tem permissões limitadas | Seção 2.1.3 |
| Permissões por módulo | Seção 3, Permission Matrix |
| OSHA permissions por location | Seção 4 |
| Visual de roles (badges) | Seção 5.1 |

### 🆕 Novo no Protótipo (Profile Switcher):

| Aspecto | Já coberto na spec? |
|---------|---------------------|
| Alternar entre perfis | ❌ Não (mas não é necessário) |
| Botões desabilitados ficam cinzas | ⚠️ Parcialmente (UX detail) |
| Tooltip em botões desabilitados | ⚠️ Parcialmente (UX detail) |
| Settings oculto para Technician | ✅ Implícito nas permissões |
| Persistência de perfil selecionado | ❌ Não (prototype-only) |

**Conclusão:** Nada de **funcionalmente novo** foi adicionado. O Profile Switcher apenas **demonstra** o que já está especificado.

---

## 🎬 Próximos Passos

1. **Você decide:** Qual opção escolher para o spec final?
2. **Se aprovar alguma adição:** Eu formato o texto no `RBAC_SPEC_ADDITIONS.md`
3. **Se não documentar:** Apenas mantemos no `PROTOTYPE_ADJUSTMENTS.md`
4. **Commit final:** Atualizo os documentos conforme sua decisão

---

**Aguardando sua aprovação! 🙌**
