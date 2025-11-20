function registerSolicitacaoHandlers(ipcMain, db) {
  ipcMain.handle('db:getSolicitacoes', async () => {
    try {
      const data = db.prepare(`
        SELECT s.*, f.nome as funcionario_nome, u.username 
        FROM solicitacoes s 
        JOIN funcionarios f ON s.funcionario_id = f.id 
        JOIN usuarios u ON s.usuario_id = u.id 
        WHERE s.status = ? 
        ORDER BY s.data_solicitacao DESC
      `).all('pendente');
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('db:getRetiradasAtivas', async () => {
    try {
      const data = db.prepare(`
        SELECT r.*, f.nome as funcionario_nome, u.username,
          p.nome as pasta_nome
        FROM retiradas_com_pessoas r
        JOIN funcionarios f ON r.funcionario_id = f.id
        JOIN usuarios u ON r.usuario_id = u.id
        JOIN pastas p ON r.pasta_id = p.id
        WHERE r.status = 'ativo'
        ORDER BY r.data_retirada DESC
      `).all();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar retiradas ativas:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('solicitacoes:criar', async (event, solicitacao) => {
    try {
      if (!solicitacao?.pasta_id) {
        throw new Error('Pasta não informada.');
      }
      if (!solicitacao?.envelopes || solicitacao.envelopes.length === 0) {
        throw new Error('Selecione ao menos um envelope.');
      }

      const selectPendentes = db.prepare(`
        SELECT envelopes_solicitados
        FROM solicitacoes
        WHERE pasta_id = ? AND status = 'pendente'
      `);
      const selectEnvelope = db.prepare(`
        SELECT status
        FROM envelopes
        WHERE pasta_id = ? AND tipo = ?
        LIMIT 1
      `);
      const insertSolicitacao = db.prepare(`
        INSERT INTO solicitacoes 
          (funcionario_id, usuario_id, pasta_id, motivo, status, data_solicitacao, envelopes_solicitados, is_demissao)
        VALUES (?, ?, ?, ?, 'pendente', datetime('now'), ?, ?)
      `);

      const transaction = db.transaction(payload => {
        const envelopesSelecionados = Array.from(new Set(payload.envelopes));
        payload.envelopes = envelopesSelecionados;
        const reservados = new Set();
        selectPendentes.all(payload.pasta_id).forEach(row => {
          try {
            const list = JSON.parse(row.envelopes_solicitados || '[]');
            if (Array.isArray(list)) {
              list.forEach(tipo => reservados.add(tipo));
            }
          } catch (err) {
            console.warn('Erro ao interpretar envelopes pendentes:', err);
          }
        });

        envelopesSelecionados.forEach(tipo => {
          if (reservados.has(tipo)) {
            throw new Error(`Envelope ${tipo} já reservado em outra solicitação pendente.`);
          }
          const envelope = selectEnvelope.get(payload.pasta_id, tipo);
          if (!envelope) {
            throw new Error(`Envelope ${tipo} não encontrado para esta pasta.`);
          }
          if (envelope.status !== 'presente') {
            throw new Error(`Envelope ${tipo} não está disponível para retirada.`);
          }
        });

        const result = insertSolicitacao.run(
          payload.funcionario_id,
          payload.usuario_id,
          payload.pasta_id,
          payload.motivo,
          JSON.stringify(envelopesSelecionados),
          payload.is_demissao ? 1 : 0
        );
        return result.lastInsertRowid;
      });

      const solicitacaoId = transaction(solicitacao);
      return { success: true, lastInsertRowid: solicitacaoId };
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('solicitacoes:aprovar', async (event, solicitacaoId) => {
    try {
      const selecionarSolicitacao = db.prepare(`
        SELECT s.*, p.gaveta_id
        FROM solicitacoes s
        JOIN pastas p ON s.pasta_id = p.id
        WHERE s.id = ?
      `);
      const atualizarSolicitacao = db.prepare(`
        UPDATE solicitacoes
        SET status = 'aprovada', data_aprovacao = datetime('now')
        WHERE id = ?
      `);
      const selecionarEnvelope = db.prepare(`
        SELECT status, tipo
        FROM envelopes
        WHERE pasta_id = ? AND tipo = ?
        LIMIT 1
      `);
      const contarEnvelopesRetirados = db.prepare(`
        SELECT COUNT(*) as total
        FROM envelopes
        WHERE pasta_id = ? AND status <> 'presente'
      `);
      const inserirRetirada = db.prepare(`
        INSERT INTO retiradas_com_pessoas 
          (pasta_id, usuario_id, funcionario_id, envelopes, data_retirada, data_prevista_retorno, status, dias_decorridos)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+7 days'), 'ativo', 0)
      `);
      const atualizarEnvelopeStatus = db.prepare(`
        UPDATE envelopes 
        SET status = 'retirado'
        WHERE pasta_id = ? AND tipo = ?
      `);
      const atualizarFuncionarioDemissao = db.prepare(`
        UPDATE funcionarios
        SET status = 'Demitido', data_demissao = ?
        WHERE id = ?
      `);
      const arquivarPasta = db.prepare('UPDATE pastas SET ativa = 0, arquivo_morto = 1 WHERE id = ?');
      const liberarEspaco = db.prepare(`
        UPDATE gavetas
        SET ocupacao_atual = CASE WHEN ocupacao_atual > 0 THEN ocupacao_atual - 1 ELSE 0 END
        WHERE id = ?
      `);

      const transaction = db.transaction(id => {
        const solicitacao = selecionarSolicitacao.get(id);
        if (!solicitacao) {
          throw new Error('Solicitação não encontrada.');
        }
        if (solicitacao.status !== 'pendente') {
          throw new Error('Solicitação já foi processada.');
        }
        if (!solicitacao.pasta_id) {
          throw new Error('Solicitação sem pasta vinculada.');
        }

        let envelopesSelecionados = [];
        try {
          envelopesSelecionados = JSON.parse(solicitacao.envelopes_solicitados || '[]');
        } catch (err) {
          console.warn('Erro ao interpretar envelopes da solicitação:', err);
        }

        if (!solicitacao.is_demissao && envelopesSelecionados.length === 0) {
          throw new Error('Nenhum envelope selecionado para retirada.');
        }

        atualizarSolicitacao.run(id);

        if (solicitacao.is_demissao) {
          const pendentes = contarEnvelopesRetirados.get(solicitacao.pasta_id);
          if (pendentes.total > 0) {
            throw new Error('Existem envelopes ainda retirados. Aguarde a devolução antes de concluir a demissão.');
          }
          const hoje = new Date().toISOString().split('T')[0];
          atualizarFuncionarioDemissao.run(hoje, solicitacao.funcionario_id);
          arquivarPasta.run(solicitacao.pasta_id);
          liberarEspaco.run(solicitacao.gaveta_id);
          return { mode: 'demissao' };
        }

        envelopesSelecionados.forEach(tipo => {
          const envelope = selecionarEnvelope.get(solicitacao.pasta_id, tipo);
          if (!envelope) {
            throw new Error(`Envelope ${tipo} não encontrado para esta pasta.`);
          }
          if (envelope.status !== 'presente') {
            throw new Error(`Envelope ${tipo} já está retirado.`);
          }
          atualizarEnvelopeStatus.run(solicitacao.pasta_id, tipo);
        });

        const retiradaResult = inserirRetirada.run(
          solicitacao.pasta_id,
          solicitacao.usuario_id,
          solicitacao.funcionario_id,
          JSON.stringify(envelopesSelecionados)
        );

        return { mode: 'retirada', retiradaId: retiradaResult.lastInsertRowid };
      });

      const resultado = transaction(solicitacaoId);
      return { success: true, ...resultado };
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerSolicitacaoHandlers };
