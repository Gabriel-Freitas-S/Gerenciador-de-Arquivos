function registerAlertaHandlers(ipcMain, db) {
  ipcMain.handle('db:getAlertas', async () => {
    try {
      const data = db.prepare(`
        SELECT a.*, r.funcionario_id, f.nome as funcionario_nome 
        FROM alertas a 
        JOIN retiradas_com_pessoas r ON a.retirada_id = r.id 
        JOIN funcionarios f ON r.funcionario_id = f.id 
        WHERE a.resolvido = 0 
        ORDER BY a.severidade DESC, a.data_criacao DESC
      `).all();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('alertas:atualizar', async () => {
    try {
      db.prepare(`
        UPDATE retiradas_com_pessoas 
        SET dias_decorridos = CAST((julianday('now') - julianday(data_retirada)) AS INTEGER)
        WHERE status = 'ativo'
      `).run();

      const retiradas = db.prepare(`
        SELECT r.*, f.status as funcionario_status
        FROM retiradas_com_pessoas r
        JOIN funcionarios f ON r.funcionario_id = f.id
        WHERE r.status = 'ativo'
      `).all();

      const insertAlerta = db.prepare(`
        INSERT OR IGNORE INTO alertas (retirada_id, tipo_alerta, severidade, resolvido)
        VALUES (?, ?, ?, 0)
      `);

      for (const ret of retiradas) {
        const prazo = ret.funcionario_status === 'Demitido' ? 3 : 7;

        if (ret.dias_decorridos >= prazo) {
          insertAlerta.run(
            ret.id,
            `Prazo de devolucao vencido ha ${ret.dias_decorridos - prazo} dias`,
            'crítico'
          );
        } else if (ret.dias_decorridos >= prazo - 2) {
          insertAlerta.run(
            ret.id,
            `Prazo de devolucao se aproximando (${prazo - ret.dias_decorridos} dias restantes)`,
            'aviso'
          );
        }
      }

      console.log(`Alertas atualizados: ${retiradas.length} retiradas verificadas`);
      return { success: true, message: 'Alertas atualizados' };
    } catch (error) {
      console.error('Erro ao atualizar alertas:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerAlertaHandlers };
