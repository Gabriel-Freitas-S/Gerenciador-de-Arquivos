function registerGavetaHandlers(ipcMain, db) {
  ipcMain.handle('db:getGaveteiros', async () => {
    try {
      const data = db.prepare('SELECT * FROM gaveteiros ORDER BY nome').all();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar gaveteiros:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('db:getGavetas', async (event, gaveteiroId = null) => {
    try {
      const hasFilter = typeof gaveteiroId === 'number' && !Number.isNaN(gaveteiroId);
      const sql = hasFilter
        ? 'SELECT * FROM gavetas WHERE gaveteiro_id = ? ORDER BY numero COLLATE NOCASE'
        : 'SELECT * FROM gavetas ORDER BY gaveteiro_id, numero COLLATE NOCASE';
      const data = hasFilter ? db.prepare(sql).all(gaveteiroId) : db.prepare(sql).all();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar gavetas:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerGavetaHandlers };
