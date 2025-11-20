function registerPerfilHandlers(ipcMain, db) {
  ipcMain.handle('perfis:listar', async () => {
    try {
      const data = db.prepare(`
        SELECT * FROM perfis
        WHERE ativo = 1
        ORDER BY nome
      `).all();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao listar perfis:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('perfis:buscar', async (event, perfilId) => {
    try {
      const perfil = db.prepare('SELECT * FROM perfis WHERE id = ?').get(perfilId);

      if (!perfil) {
        return { success: false, message: 'Perfil não encontrado' };
      }

      const menus = db.prepare(`
        SELECT m.*
        FROM menus m
        INNER JOIN perfis_menus pm ON m.id = pm.menu_id
        WHERE pm.perfil_id = ? AND m.ativo = 1
        ORDER BY m.ordem
      `).all(perfilId);

      return { success: true, data: { ...perfil, menus } };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('perfis:criar', async (event, nome, descricao, menuIds) => {
    try {
      const insertPerfil = db.prepare('INSERT INTO perfis (nome, descricao, ativo) VALUES (?, ?, 1)');
      const insertMenu = db.prepare('INSERT INTO perfis_menus (perfil_id, menu_id) VALUES (?, ?)');

      const transaction = db.transaction(() => {
        const result = insertPerfil.run(nome, descricao);
        const perfilId = result.lastInsertRowid;

        for (const menuId of menuIds) {
          insertMenu.run(perfilId, menuId);
        }

        return perfilId;
      });

      const perfilId = transaction();
      return { success: true, data: { id: perfilId }, message: 'Perfil criado com sucesso' };
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('perfis:atualizar', async (event, perfilId, nome, descricao, menuIds) => {
    try {
      const updatePerfil = db.prepare('UPDATE perfis SET nome = ?, descricao = ? WHERE id = ?');
      const deleteMenus = db.prepare('DELETE FROM perfis_menus WHERE perfil_id = ?');
      const insertMenu = db.prepare('INSERT INTO perfis_menus (perfil_id, menu_id) VALUES (?, ?)');

      const transaction = db.transaction(() => {
        updatePerfil.run(nome, descricao, perfilId);
        deleteMenus.run(perfilId);

        for (const menuId of menuIds) {
          insertMenu.run(perfilId, menuId);
        }
      });

      transaction();
      return { success: true, message: 'Perfil atualizado com sucesso' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('perfis:excluir', async (event, perfilId) => {
    try {
      const usuariosComPerfil = db.prepare(
        'SELECT COUNT(*) as total FROM usuarios WHERE perfil_id = ?'
      ).get(perfilId);

      if (usuariosComPerfil.total > 0) {
        return {
          success: false,
          message: `Não é possível excluir. Existem ${usuariosComPerfil.total} usuário(s) usando este perfil.`
        };
      }

      db.prepare('DELETE FROM perfis WHERE id = ?').run(perfilId);
      return { success: true, message: 'Perfil excluído com sucesso' };
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerPerfilHandlers };
