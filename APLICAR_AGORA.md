# 🛑 GUIA FINAL - Aplicações Restantes

## ✅ JÁ APLICADO NO GITHUB (commits recentes):

1. ✅ **auth.js** - Corrigido para aceitar perfil_nome/perfil
2. ✅ **ui.js** - Restaurado completo + campo perfil_nome corrigido
3. ✅ **app.js** - Métodos API corrigidos (getMenus, getMenusByUsuario)
4. ✅ **seed_admin.sql** - Criado para inserir usuários de teste

---

## ⚠️ FALTA APLICAR MANUALMENTE (5 passos):

### PASSO 1: Git Pull
```bash
cd Gerenciador-de-Arquivos
git pull origin main
```

---

### PASSO 2: Aplicar PATCH_PRELOAD.txt

**Arquivo:** `src/main/preload.js`

**Ação:** Adicionar ANTES do último `});`

```javascript
  // ADICIONAR ESTES 2 MÉTODOS:
  
  atualizarAlertas: () => {
    return ipcRenderer.invoke('alertas:atualizar');
  },
  
  usuariosAtualizarMenus: (usuarioId, menuIds) => {
    return ipcRenderer.invoke('usuarios:atualizar-menus', usuarioId, menuIds);
  }
```

---

### PASSO 3: Aplicar PATCH_MAIN_JS.txt

**Arquivo:** `src/main/main.js`

**Ação:** Adicionar DENTRO de `setupIpcHandlers()`, no final

**Código completo está no arquivo PATCH_MAIN_JS.txt** (~60 linhas)

Resumo:
- Handler `alertas:atualizar`
- Handler `usuarios:atualizar-menus`

---

### PASSO 4: Adicionar tabela ao schema

**Arquivo:** `src/db/schema_perfis.sql`

**Ação:** Adicionar após a tabela `perfis_menus` (linha ~59)

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

**Índices:** Adicionar na seção de índices (linha ~248)

```sql
-- Usuarios menus
CREATE INDEX idx_usuarios_menus_usuario ON usuarios_menus(usuario_id);
CREATE INDEX idx_usuarios_menus_menu ON usuarios_menus(menu_id);
```

---

### PASSO 5: Deletar e recriar banco

```powershell
# Deletar banco antigo
Remove-Item "$env:APPDATA\Sistema de Arquivos Hospital\database.db" -Force

# Iniciar app (vai recriar o banco)
npm start
```

**Feche o app após abrir pela primeira vez.**

---

### PASSO 6: Inserir usuários de teste

1. Abrir o banco com SQLite Browser/DBeaver/DataGrip:
   - Localização: `%APPDATA%\Sistema de Arquivos Hospital\database.db`

2. Executar o SQL do arquivo `src/db/seed_admin.sql`:

```sql
-- Perfis
INSERT OR IGNORE INTO perfis (id, nome, descricao, ativo) 
VALUES (1, 'Administrador', 'Acesso total ao sistema', 1);

INSERT OR IGNORE INTO perfis (id, nome, descricao, ativo) 
VALUES (2, 'Usuário Operacional', 'Acesso apenas operacional', 1);

-- Usuários
INSERT OR IGNORE INTO usuarios (username, senha, perfil_id, ativo)
VALUES ('admin', 'admin123', 1, 1);

INSERT OR IGNORE INTO usuarios (username, senha, perfil_id, ativo)
VALUES ('usuario', 'usuario123', 2, 1);
```

3. **Fechar o navegador SQL**

---

### PASSO 7: Testar Login

```bash
npm start
```

**Credenciais de teste:**
- Admin: `admin` / `admin123`
- Operacional: `usuario` / `usuario123`

---

## ✅ Checklist Final

- [ ] Git pull executado
- [ ] PATCH_PRELOAD.txt aplicado (2 métodos)
- [ ] PATCH_MAIN_JS.txt aplicado (2 handlers)
- [ ] Tabela usuarios_menus adicionada ao schema
- [ ] Índices adicionados ao schema
- [ ] database.db deletado
- [ ] App iniciado pela primeira vez (cria banco)
- [ ] seed_admin.sql executado no banco
- [ ] Login testado com admin/admin123
- [ ] Dashboard carrega sem erros
- [ ] Menu Admin aparece
- [ ] Botão "Novo Usuário" funciona

---

## 🐞 Se ainda houver erros:

1. Abrir DevTools (Ctrl+Shift+I)
2. Aba Console
3. Copiar mensagem de erro COMPLETA
4. Reportar

---

## 📊 Resumo dos Commits Aplicados

| Commit | Arquivo | Mudança |
|--------|---------|----------|
| `a493457` | auth.js | Aceita perfil_nome/perfil |
| `355be8c` | ui.js | Restaurado completo |
| `4f53bbd` | app.js | getMenus() e getMenusByUsuario() |
| `f7998c5` | seed_admin.sql | Usuários de teste |

---

## 🚀 Após aplicar tudo:

**Funcionalidades que devem funcionar:**

✅ Login com admin/usuario  
✅ Dashboard carrega  
✅ Estatísticas aparecem  
✅ Menu Admin visível para admin  
✅ Botão "Novo Usuário" abre modal  
✅ Criar usuário funciona  
✅ Permissões salvam  
✅ Alertas atualizam  

---

**IMPORTANTE:** Não pule nenhum passo!
