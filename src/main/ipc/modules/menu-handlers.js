const { getMenusForUsuario } = require('../helpers/menu-helper');

function registerMenuHandlers(ipcMain, db) {
  ipcMain.handle('menus:listar', async () => {
    try {
      const data = db.prepare(`
        SELECT * FROM menus
        WHERE ativo = 1
        ORDER BY ordem
      `).all();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao listar menus:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('usuarios:menus', async (event, usuarioId) => {
    try {
      const data = getMenusForUsuario(db, usuarioId);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar menus do usuário:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('usuarios:perfil-completo', async (event, usuarioId) => {
    try {
      const usuario = db.prepare(`
        SELECT u.*, p.nome as perfil_nome, p.descricao as perfil_descricao
        FROM usuarios u
        INNER JOIN perfis p ON u.perfil_id = p.id
        WHERE u.id = ?
      `).get(usuarioId);

      if (!usuario) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      const menus = getMenusForUsuario(db, usuarioId);
      return { success: true, data: { ...usuario, menus } };
    } catch (error) {
      console.error('Erro ao buscar perfil completo do usuário:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerMenuHandlers };
