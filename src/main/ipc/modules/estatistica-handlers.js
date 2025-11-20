function registerEstatisticaHandlers(ipcMain, db) {
  ipcMain.handle('db:getEstatisticas', async () => {
    try {
      const totalGavetas = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ocupacao_atual >= capacidade THEN 1 ELSE 0 END) as cheias,
          SUM(CASE WHEN capacidade > 0 AND ocupacao_atual < capacidade AND (CAST(ocupacao_atual AS REAL) / capacidade) >= 0.8 THEN 1 ELSE 0 END) as atencao,
          SUM(CASE WHEN ocupacao_atual = 0 THEN 1 ELSE 0 END) as vazias
        FROM gavetas
      `).get();

      const totalPastas = db.prepare(
        'SELECT COUNT(*) as total FROM pastas WHERE ativa = 1'
      ).get();

      const totalRetiradas = db.prepare(
        'SELECT COUNT(*) as total FROM retiradas_com_pessoas WHERE status = ?'
      ).get('ativo');

      const alertasCriticos = db.prepare(
        "SELECT COUNT(*) as total FROM alertas WHERE resolvido = 0 AND lower(severidade) = 'crítico'"
      ).get();

      return {
        success: true,
        data: {
          totalGavetas: totalGavetas.total || 0,
          totalPastas: totalPastas.total || 0,
          itensRetirados: totalRetiradas.total || 0,
          alertasCriticos: alertasCriticos.total || 0,
          gavetasCheias: totalGavetas.cheias || 0,
          gavetasAtencao: totalGavetas.atencao || 0,
          gavetasVazias: totalGavetas.vazias || 0,
          gavetasDisponiveis: Math.max(0, (totalGavetas.total || 0) - (totalGavetas.cheias || 0))
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerEstatisticaHandlers };
