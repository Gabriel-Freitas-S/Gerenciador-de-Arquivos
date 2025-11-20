function registerRetiradaHandlers(ipcMain, db) {
  ipcMain.handle('db:getRetiradas', async () => {
    try {
      const data = db.prepare(`
        SELECT r.*, f.nome as funcionario_nome, u.username 
        FROM retiradas_com_pessoas r 
        JOIN funcionarios f ON r.funcionario_id = f.id 
        JOIN usuarios u ON r.usuario_id = u.id 
        WHERE r.status = ? 
        ORDER BY r.data_retirada DESC
      `).all('ativo');
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar retiradas:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('retiradas:finalizar', async (event, retiradaId) => {
    try {
      const selecionarRetirada = db.prepare('SELECT * FROM retiradas_com_pessoas WHERE id = ?');
      const atualizarRetirada = db.prepare(`
        UPDATE retiradas_com_pessoas 
        SET status = 'devolvido', data_retorno = datetime('now') 
        WHERE id = ?
      `);
      const atualizarEnvelopeStatus = db.prepare(`
        UPDATE envelopes 
        SET status = 'presente'
        WHERE pasta_id = ? AND tipo = ?
      `);

      const transaction = db.transaction(id => {
        const retirada = selecionarRetirada.get(id);
        if (!retirada) {
          throw new Error('Retirada não encontrada.');
        }
        if (retirada.status !== 'ativo') {
          throw new Error('Retirada já finalizada.');
        }

        let envelopes = [];
        try {
          envelopes = JSON.parse(retirada.envelopes || '[]');
        } catch (err) {
          console.warn('Erro ao interpretar envelopes da retirada:', err);
        }

        envelopes.forEach(tipo => atualizarEnvelopeStatus.run(retirada.pasta_id, tipo));
        atualizarRetirada.run(id);
      });

      transaction(retiradaId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao finalizar retirada:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerRetiradaHandlers };
