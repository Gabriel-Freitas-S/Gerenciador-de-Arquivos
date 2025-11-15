# Correções Urgentes Dashboard e Admin

## Problemas
1. Dashboard não carrega - falta atualizarAlertas()
2. Admin não cria usuário - métodos API errados
3. Tabela usuarios_menus faltando

## Arquivos para corrigir

### preload.js - Adicionar:
```javascript
atualizarAlertas: () => ipcRenderer.invoke('alertas:atualizar'),
usuariosAtualizarMenus: (userId, menuIds) => ipcRenderer.invoke('usuarios:atualizar-menus', userId, menuIds)
```

### main.js - Adicionar IPC handlers
Ver PDF de correções

### app.js - Linha 537 e 556
Trocar menusListar() por getMenus()
Trocar usuariosMenus() por getMenusByUsuario()

### ui.js - Linha 633
Trocar user.perfil por user.perfil_nome

## IMPORTANTE
Deletar database.db depois de aplicar!
