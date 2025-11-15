# 🔧 Guia de Aplicação das Correções

## 🚨 Problemas que este guia resolve:

1. ❌ Dashboard não carrega
2. ❌ Admin não consegue criar usuário
3. ❌ Tabela usuarios_menus faltando
4. ❌ Campos SQL incorretos

---

## 📋 Checklist de Aplicação

### PASSO 1: Git Pull
```bash
cd caminho/para/Gerenciador-de-Arquivos
git pull origin main
```

Você deve ter recebido os arquivos PATCH_*.txt

---

### PASSO 2: Aplicar PATCH_PRELOAD.txt

1. Abrir `src/main/preload.js`
2. Ir até o FINAL do arquivo (antes do `});`)
3. Copiar o código do `PATCH_PRELOAD.txt`
4. Colar ANTES da linha `});

**Resultado esperado:**
```javascript
  getLogs: (limit = 100) => {
    ...
  },
  
  // NOVO - adicionado
  atualizarAlertas: () => {
    return ipcRenderer.invoke('alertas:atualizar');
  },
  
  usuariosAtualizarMenus: (usuarioId, menuIds) => {
    return ipcRenderer.invoke('usuarios:atualizar-menus', usuarioId, menuIds);
  }
});
```

- [ ] ✅ preload.js atualizado

---

### PASSO 3: Aplicar PATCH_MAIN_JS.txt

1. Abrir `src/main/main.js`
2. Procurar a função `setupIpcHandlers()`
3. Ir até o FINAL desta função (mas DENTRO dela)
4. Copiar TODO o código do `PATCH_MAIN_JS.txt`
5. Colar ANTES do fechamento da função

**Dica:** Procure por `// ============================================` para manter o padrão

- [ ] ✅ main.js atualizado

---

### PASSO 4: Aplicar PATCH_APP_JS.txt

1. Abrir `src/renderer/js/app.js`

**Correção 1 - Linha ~537:**
```javascript
// ANTES:
const menus = await window.electronAPI.menusListar();

// DEPOIS:
const menusResult = await window.electronAPI.getMenus();
const menus = menusResult.success ? menusResult.data : [];
```

**Correção 2 - Linha ~556:**
```javascript
// ANTES:
const menusUsuario = await window.electronAPI.usuariosMenus(usuarioId);

// DEPOIS:
const menusResult = await window.electronAPI.getMenusByUsuario(usuarioId);
const menusUsuario = menusResult.success ? menusResult.data.map(m => m.id) : [];
```

- [ ] ✅ app.js linha 537 corrigida
- [ ] ✅ app.js linha 556 corrigida

---

### PASSO 5: Aplicar PATCH_UI_JS.txt

1. Abrir `src/renderer/js/ui.js`
2. Procurar por `renderUsuariosAdmin` (linha ~630)
3. Encontrar `<td>${user.perfil}</td>`
4. Trocar por `<td>${user.perfil_nome || 'N/A'}</td>`

- [ ] ✅ ui.js linha ~633 corrigida

---

### PASSO 6: Aplicar PATCH_SCHEMA.txt

1. Abrir `src/db/schema_perfis.sql`

**Parte 1 - Adicionar tabela (linha ~59, após perfis_menus):**
```sql
-- ============================================
-- TABELA: usuarios_menus (NOVA)
-- ============================================
CREATE TABLE usuarios_menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, menu_id)
);
```

**Parte 2 - Adicionar índices (linha ~248, na seção de índices):**
```sql
-- Usuarios menus
CREATE INDEX idx_usuarios_menus_usuario ON usuarios_menus(usuario_id);
CREATE INDEX idx_usuarios_menus_menu ON usuarios_menus(menu_id);
```

- [ ] ✅ schema_perfis.sql: tabela adicionada
- [ ] ✅ schema_perfis.sql: índices adicionados

---

### PASSO 7: Deletar banco de dados antigo

**IMPORTANTE:** O banco atual tem schema antigo. DEVE ser deletado!

```powershell
# Windows PowerShell:
Remove-Item "$env:APPDATA\Sistema de Arquivos Hospital\database.db" -Force

# OU via Explorador:
# Win + R
# Digite: %APPDATA%\Sistema de Arquivos Hospital
# Delete: database.db
```

- [ ] ✅ database.db deletado

---

### PASSO 8: Reiniciar aplicação

```bash
npm start
```

A aplicação vai **recriar o banco automaticamente** com o schema correto!

- [ ] ✅ Aplicação iniciada

---

## ✅ Verificação Final

Após aplicar TODAS as correções acima, verificar:

### Console (DevTools - Ctrl+Shift+I):
- [ ] Sem erros de "is not a function"
- [ ] Sem erros de "table not found"
- [ ] Log: "Alertas atualizados"

### Dashboard:
- [ ] ✅ Dashboard abre
- [ ] ✅ Estatísticas carregam (números aparecem)
- [ ] ✅ Alertas aparecem (se houver)
- [ ] ✅ Itens retirados listam (se houver)

### Admin:
- [ ] ✅ Menu Admin aparece (só para admin)
- [ ] ✅ Botão "Novo Usuário" existe
- [ ] ✅ Clicar "Novo Usuário" abre modal
- [ ] ✅ Modal lista menus disponíveis
- [ ] ✅ Consegue criar usuário
- [ ] ✅ Usuários listam com perfil correto

---

## 🐞 Se ainda houver erros:

1. Abrir DevTools (Ctrl+Shift+I)
2. Ir na aba Console
3. Copiar TODA a mensagem de erro
4. Reportar o erro exato

---

## 📊 Resumo das Mudanças

| Arquivo | Mudanças |
|---------|----------|
| `preload.js` | +2 métodos |
| `main.js` | +2 IPC handlers (~60 linhas) |
| `app.js` | 2 correções de nomes |
| `ui.js` | 1 correção de campo |
| `schema_perfis.sql` | +1 tabela + 2 índices |
| `database.db` | DELETAR e recriar |

**Total:** 6 arquivos modificados

---

## ⚠️ IMPORTANTE

- **NÃO pular nenhum passo**
- **NÃO esquecer de deletar database.db**
- **Aplicar na ordem apresentada**
- **Verificar cada checkbox**

---

Boa sorte! 🚀
