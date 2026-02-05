# Screenshots do Protótipo - Referência para Especificação

Data de captura: 2026-01-29  
Localização: `docs/screenshots/`

---

## 📸 Lista de Screenshots Capturados

### **1. Custom Roles - Badge Colors (System vs Custom)**
**Arquivo:** `01-custom-roles-badges.png` (151 KB)

**Mostra:**
- Tela de Custom Roles (Settings > Custom Roles)
- System Roles com badge **AZUL** (bg-blue-100, text-blue-700)
- Custom Roles sem badge especial (linha padrão da tabela)
- Lock icon nos System Roles indicando imutabilidade

**Uso no spec:** Seção 2.2.2 - Visual Indicator (Badge Colors)

---

### **2. User Management - Badge Colors**
**Arquivo:** `02-user-management-badges.png` (219 KB)

**Mostra:**
- Tela de User Management (Settings > People)
- System Roles com badge **AZUL**
- Custom Roles com badge **CINZA DISCRETO** (bg-gray-100, text-gray-700)
- Comparação direta das cores de badges por contexto

**Uso no spec:** Seção 2.2.2 - Visual Indicator (Badge Colors)  
**Destaque:** Mostra a diferença de badge colors por contexto (Custom Roles table vs User list)

---

### **3. Profile Switcher - Dropdown Aberto**
**Arquivo:** `03-profile-switcher-dropdown.png` (36 KB)

**Mostra:**
- Profile Switcher no header (à esquerda do sino de notificações)
- Dropdown expandido mostrando 2 perfis:
  - **Global Admin** - Full system access (com checkmark, selecionado)
  - **Technician** - Limited permissions
- Ícones e descrições de cada perfil

**Uso no spec:** Appendix A.1 - Profile Switcher (Prototype Only)

---

### **4. Access Points - Botões Desabilitados (Technician)**
**Arquivo:** `04-access-points-technician-disabled.png` (249 KB)

**Mostra:**
- Página Access Points com perfil Technician ativo
- Botão "Create Access Point" **CINZA/DESABILITADO** (bg-gray-300, opacity-50)
- Profile Switcher mostra "Technician" no header
- Tooltip aparece ao hover: "You do not have permission to perform this action"

**Uso no spec:** Seção 2.1.3 - Technician (Field Worker) Permissions  
**Destaque:** Validação visual de restrições de permissão

---

### **5. CAPAs - Todas Ações Desabilitadas (Technician)**
**Arquivo:** `05-capas-technician-disabled.png` (117 KB)

**Mostra:**
- Página CAPA Tracker com perfil Technician ativo
- Botão "Create CAPA" **DESABILITADO**
- Botão "Export" **DESABILITADO**
- Technician pode apenas **visualizar** e comentar

**Uso no spec:** Seção 2.1.3 - Technician Permissions (CAPA module)

---

### **6. Safety Events - Create HABILITADO (Technician)**
**Arquivo:** `06-safety-events-technician-create-enabled.png` (248 KB)

**Mostra:**
- Página Safety Events com perfil Technician ativo
- Botão "Create Safety Event" **AZUL/HABILITADO** (bg-blue-600)
- Technician **PODE** criar Safety Events (mas não editar/deletar)
- Contraste com Access Points/CAPAs onde create é desabilitado

**Uso no spec:** Seção 2.1.3 - Technician Permissions (Event module)  
**Destaque:** Exceção importante - Technician pode criar Safety Events

---

### **7. Sidebar - Settings Oculto (Technician)**
**Arquivo:** `07-sidebar-technician-no-settings.png` (50 KB)

**Mostra:**
- Sidebar navigation com perfil Technician ativo
- Seção "PEOPLE & PERMISSIONS" **COMPLETAMENTE OCULTA**
- Apenas módulos operacionais visíveis:
  - Safety Management
  - OSHA
  - Documentation
  - Safety Actions

**Uso no spec:** Seção 2.1.3 - Technician UI Access  
**Destaque:** Settings não apenas desabilitado, mas removido da navegação

---

### **8. Sidebar - Settings Visível (Global Admin)**
**Arquivo:** `08-sidebar-global-admin-with-settings.png` (55 KB)

**Mostra:**
- Sidebar navigation com perfil Global Admin ativo
- Seção "PEOPLE & PERMISSIONS" **VISÍVEL**
- Item "User Management" disponível
- Comparação direta com screenshot #7

**Uso no spec:** Seção 2.1.1 - Global Admin UI Access  
**Destaque:** Comparação visual dos diferentes níveis de acesso

---

### **9. Role Creation Modal - Campo Description**
**Arquivo:** `09-role-creation-modal-description.png` (101 KB)

**Mostra:**
- Modal de criação de Custom Role
- Campo **"Description (optional)"** visível após "Start from existing role"
- Textarea com 3 linhas
- Placeholder: "e.g., Restricted role for external electrical contractors"
- Contador de caracteres (não visível até digitar)

**Uso no spec:** Seção 3, Step 1 - Role Identity (Campo Description)  
**Adição 1 do RBAC_SPEC_ADDITIONS.md**

---

### **10. Custom Roles Table - Coluna Description**
**Arquivo:** `10-custom-roles-table-description-column.png` (101 KB)

**Mostra:**
- Tabela de Custom Roles com nova coluna "Description"
- Coluna posicionada após "Role Name" e antes de "Permissions"
- Descrições truncadas com ellipsis (...)
- Empty state: "(No description)" em cinza itálico
- Tooltip disponível para descrições longas (hover)

**Uso no spec:** Seção 5.1.1 - Custom Roles Table  
**Adição 4 do RBAC_SPEC_ADDITIONS.md**

---

## 📋 Mapa de Uso nos Documentos

### **RBAC_SPEC_ADDITIONS.md (para copiar ao spec final):**

| Seção | Screenshots Relacionados |
|-------|-------------------------|
| **ADIÇÃO 1:** Campo Description | #9, #10 |
| **ADIÇÃO 2:** Badge Colors | #1, #2 |
| **ADIÇÃO 3:** Global Admin Permissions | #8 (indirect) |
| **ADIÇÃO 4:** Custom Roles Table - Description Column | #10 |
| **APPENDIX A.1:** Profile Switcher | #3, #4, #5, #6, #7, #8 |

---

### **Sugestões de Inserção no Spec Final:**

#### **Seção 2.2.2 - Badge Colors:**
```markdown
**Visual Examples:**
- See `01-custom-roles-badges.png` - System Roles in Custom Roles table (blue badges)
- See `02-user-management-badges.png` - Badge colors by context (blue vs gray)
```

#### **Seção 2.1.3 - Technician Permissions:**
```markdown
**Permission Validation Screenshots:**
- Access Points: Create disabled (`04-access-points-technician-disabled.png`)
- CAPAs: All actions disabled (`05-capas-technician-disabled.png`)
- Safety Events: Create enabled (`06-safety-events-technician-create-enabled.png`)
- Sidebar: Settings hidden (`07-sidebar-technician-no-settings.png`)
```

#### **Seção 3, Step 1 - Role Identity:**
```markdown
**Description Field UI:**
See `09-role-creation-modal-description.png` for field placement and styling.
```

#### **Seção 5.1.1 - Custom Roles Table:**
```markdown
**Description Column Implementation:**
See `10-custom-roles-table-description-column.png` for column structure and empty state.
```

#### **Appendix A.1 - Profile Switcher:**
```markdown
**Visual Reference:**
- Profile Switcher UI: `03-profile-switcher-dropdown.png`
- Permission Behavior Examples: `04-access-points-technician-disabled.png` through `08-sidebar-global-admin-with-settings.png`
```

---

## 🎯 Destaques para Apresentações

### **Para Stakeholders (Demos):**
1. **#3 (Profile Switcher)** - Mostra como alternar perfis rapidamente
2. **#2 (Badge Colors)** - Diferenciação visual clara de System vs Custom roles
3. **#6 (Safety Events enabled)** - Exceção importante: Technician pode criar eventos

### **Para Desenvolvedores (Handoff):**
1. **#1, #2** - Implementação de badge colors por contexto
2. **#4, #5, #6** - Estados enabled/disabled de botões
3. **#7, #8** - Navegação condicional baseada em permissões
4. **#9, #10** - Campo Description e coluna na tabela

### **Para QA (Test Cases):**
- **Permission Testing:** Use #4, #5, #6 como referência visual esperada
- **UI Consistency:** Compare #1 e #2 para validar badge colors
- **Navigation Testing:** Compare #7 e #8 para validar sidebar filtering

---

## 📏 Especificações Técnicas

**Resolução dos screenshots:** 1920x1080 (Full HD)  
**Browser:** Chromium (Playwright v1208)  
**Formato:** PNG  
**Tamanho total:** ~1.3 MB (10 arquivos)  

**Crops especiais:**
- Screenshot #3: Cropped to header area (1200x400)
- Screenshots #7, #8: Cropped to sidebar only (280x1080)

---

## ✅ Checklist de Validação

Use estes screenshots para validar:
- [ ] Badge colors seguem especificação (azul para System, cinza para Custom em User list)
- [ ] Profile Switcher está visível e funcional
- [ ] Botões desabilitados têm aparência cinza com 50% opacity
- [ ] Settings é completamente oculto (não apenas desabilitado) para Technician
- [ ] Campo Description aparece em ambos os modos (modal e fullscreen)
- [ ] Coluna Description aparece na tabela de Custom Roles
- [ ] Technician pode criar Safety Events (exceção importante)

---

**Última atualização:** 2026-01-29  
**Capturado de:** http://localhost:3000 (development environment)
