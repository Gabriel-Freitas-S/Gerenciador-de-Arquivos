function registerUsuarioPermissaoHandlers(ipcMain, db) {
  ipcMain.handle('usuarios:atualizar-menus', async (event, usuarioId, menuIds = []) => {
    try {
      const deleteMenus = db.prepare('DELETE FROM usuarios_menus WHERE usuario_id = ?');
      const insertMenu = db.prepare('INSERT INTO usuarios_menus (usuario_id, menu_id) VALUES (?, ?)');

      const transaction = db.transaction(() => {
        deleteMenus.run(usuarioId);
        for (const menuId of menuIds) {
          insertMenu.run(usuarioId, menuId);
        }
      });

      transaction();
      console.log(`Permissões atualizadas para usuario ${usuarioId}: ${menuIds.length} menus`);
      return { success: true, message: 'Permissões atualizadas' };
    } catch (error) {
      console.error('Erro ao atualizar menus do usuário:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerUsuarioPermissaoHandlers };
