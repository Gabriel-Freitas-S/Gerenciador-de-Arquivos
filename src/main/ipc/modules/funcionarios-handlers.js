function registerFuncionariosHandlers(ipcMain, db) {
  ipcMain.handle('db:getFuncionarios', async () => {
    try {
      const data = db.prepare('SELECT * FROM funcionarios ORDER BY nome COLLATE NOCASE').all();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('db:getSolicitacoesPendentes', async () => {
    try {
      const data = db.prepare(`
        SELECT s.*, f.nome as funcionario_nome, u.username
        FROM solicitacoes s
        JOIN funcionarios f ON s.funcionario_id = f.id
        JOIN usuarios u ON s.usuario_id = u.id
        WHERE s.status = 'pendente'
        ORDER BY s.data_solicitacao DESC
      `).all();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar solicitações pendentes:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('db:getRetiradasByUsuario', async (event, usuarioId) => {
    try {
      const data = db.prepare(`
        SELECT r.*, f.nome as funcionario_nome, p.nome as pasta_nome
        FROM retiradas_com_pessoas r
        JOIN funcionarios f ON r.funcionario_id = f.id
        JOIN pastas p ON r.pasta_id = p.id
        WHERE r.usuario_id = ? AND r.status = 'ativo'
        ORDER BY r.data_retirada DESC
      `).all(usuarioId);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar retiradas do usuário:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('db:addLog', async (event, log) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO logs (usuario_id, acao, tabela_afetada, registro_id, detalhes)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        log.usuario_id,
        log.acao,
        log.tabela_afetada || null,
        log.registro_id || null,
        log.detalhes || null
      );
      return { success: true, lastInsertRowid: result.lastInsertRowid };
    } catch (error) {
      console.error('Erro ao registrar log:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('db:getLogs', async (event, limit = 100) => {
    try {
      const data = db.prepare(`
        SELECT l.*, u.username
        FROM logs l
        LEFT JOIN usuarios u ON l.usuario_id = u.id
        ORDER BY l.timestamp DESC
        LIMIT ?
      `).all(limit);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('funcionarios:demitir', async (event, { id, dataDemissao }) => {
    try {
      const updateFuncionario = db.prepare(`
        UPDATE funcionarios
        SET status = 'Demitido', data_demissao = ?
        WHERE id = ?
      `);
      const selectPastasAtivas = db.prepare(`
        SELECT id, gaveta_id
        FROM pastas
        WHERE funcionario_id = ? AND ativa = 1
      `);
      const arquivarPasta = db.prepare(`
        UPDATE pastas
        SET ativa = 0, arquivo_morto = 1
        WHERE id = ?
      `);
      const liberarEspacoGaveta = db.prepare(`
        UPDATE gavetas
        SET ocupacao_atual = CASE WHEN ocupacao_atual > 0 THEN ocupacao_atual - 1 ELSE 0 END
        WHERE id = ?
      `);

      const transaction = db.transaction(payload => {
        updateFuncionario.run(payload.dataDemissao, payload.id);
        const pastasAtivas = selectPastasAtivas.all(payload.id);
        pastasAtivas.forEach(pasta => {
          arquivarPasta.run(pasta.id);
          liberarEspacoGaveta.run(pasta.gaveta_id);
        });
        return pastasAtivas.length;
      });

      const pastasArquivadas = transaction({ id, dataDemissao });
      return { success: true, pastasArquivadas };
    } catch (error) {
      console.error('Erro ao demitir funcionário:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerFuncionariosHandlers };
