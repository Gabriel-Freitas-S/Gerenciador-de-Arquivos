function registerDatabaseHandlers(ipcMain, db) {
  ipcMain.handle('db:query', async (event, sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      const data = stmt.all(...params);
      return { success: true, data };
    } catch (error) {
      console.error('Erro na query:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('db:execute', async (event, sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(...params);
      return {
        success: true,
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid
      };
    } catch (error) {
      console.error('Erro na execução:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerDatabaseHandlers };
