function registerAuthHandlers(ipcMain, db) {
  ipcMain.handle('auth:login', async (event, username, password) => {
    try {
      const user = db.prepare(`
        SELECT u.*, p.nome as perfil_nome
        FROM usuarios u
        LEFT JOIN perfis p ON u.perfil_id = p.id
        WHERE u.username = ? AND u.ativo = 1
      `).get(username);

      if (user && user.senha === password) {
        const { senha, ...userWithoutPassword } = user;
        return {
          success: true,
          user: userWithoutPassword
        };
      }

      return {
        success: false,
        message: 'Credenciais inválidas'
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: error.message
      };
    }
  });
}

module.exports = { registerAuthHandlers };
