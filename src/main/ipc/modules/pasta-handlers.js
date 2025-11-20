function registerPastaHandlers(ipcMain, db) {
  ipcMain.handle('db:getPastas', async (event, gavetaId) => {
    try {
      const data = db.prepare(`
        SELECT p.*, 
               f.nome as funcionario_nome,
               f.departamento as funcionario_departamento,
               f.matricula as funcionario_matricula,
               f.data_admissao as funcionario_data_admissao 
        FROM pastas p 
        JOIN funcionarios f ON p.funcionario_id = f.id 
        WHERE p.gaveta_id = ? AND p.ativa = 1
        ORDER BY p.ordem
      `).all(gavetaId);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar pastas:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('pastas:criar', async (event, pastaData) => {
    try {
      const insertPasta = db.prepare(`
        INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto)
        VALUES (?, ?, ?, ?, ?, 1, 0)
      `);
      const insertEnvelope = db.prepare(`
        INSERT INTO envelopes (pasta_id, tipo, status)
        VALUES (?, ?, 'presente')
      `);
      const atualizarOcupacao = db.prepare(`
        UPDATE gavetas
        SET ocupacao_atual = ocupacao_atual + 1
        WHERE id = ?
      `);
      const buscarGaveta = db.prepare(`
        SELECT capacidade, ocupacao_atual
        FROM gavetas
        WHERE id = ?
      `);
      const buscarFuncionarioPorMatricula = db.prepare(`
        SELECT id
        FROM funcionarios
        WHERE matricula = ?
        LIMIT 1
      `);
      const buscarFuncionarioPorNome = db.prepare(`
        SELECT id
        FROM funcionarios
        WHERE lower(nome) = lower(?)
        LIMIT 1
      `);
      const inserirFuncionario = db.prepare(`
        INSERT INTO funcionarios (nome, matricula, departamento, especialidade, data_admissao, status)
        VALUES (?, ?, ?, '', ?, 'Ativo')
      `);
      const atualizarFuncionarioInfo = db.prepare(`
        UPDATE funcionarios
        SET nome = COALESCE(?, nome),
            departamento = COALESCE(?, departamento),
            data_admissao = COALESCE(?, data_admissao),
            matricula = COALESCE(?, matricula)
        WHERE id = ?
      `);
      const verificarPastaAtivaPorFuncionario = db.prepare(`
        SELECT id FROM pastas WHERE funcionario_id = ? AND ativa = 1 LIMIT 1
      `);

      const transaction = db.transaction(payload => {
        const gaveta = buscarGaveta.get(payload.gaveta_id);
        if (!gaveta) {
          throw new Error('Gaveta não encontrada.');
        }
        if (gaveta.ocupacao_atual >= gaveta.capacidade) {
          throw new Error('Gaveta selecionada está cheia.');
        }

        const dataCriacao = payload.data_criacao || new Date().toISOString().split('T')[0];
        const nomeFuncionarioBase = (payload.funcionario_nome || payload.nome || '').trim();
        const matriculaValor = (payload.funcionario_matricula || '').trim();
        const matricula = matriculaValor ? matriculaValor.toUpperCase() : null;
        const setorInput = (payload.funcionario_setor || '').trim();
        const setorParaInsercao = setorInput || 'Não informado';
        const setorParaAtualizacao = setorInput || null;
        const dataAdmissaoInput = payload.funcionario_data_admissao || null;
        const dataAdmissaoParaInsercao = dataAdmissaoInput || dataCriacao;
        const dataAdmissaoParaAtualizacao = dataAdmissaoInput || null;

        let funcionarioId = payload.funcionario_id;
        if (!funcionarioId) {
          if (matricula) {
            const existentePorMatricula = buscarFuncionarioPorMatricula.get(matricula);
            if (existentePorMatricula) {
              funcionarioId = existentePorMatricula.id;
            }
          }

          const nomeFuncionario = nomeFuncionarioBase;
          if (!funcionarioId && !nomeFuncionario) {
            throw new Error('Informe o nome do funcionário para criar a pasta.');
          }

          if (!funcionarioId) {
            const existente = buscarFuncionarioPorNome.get(nomeFuncionario);
            if (existente) {
              funcionarioId = existente.id;
            }
          }

          if (!funcionarioId) {
            const novoFuncionario = inserirFuncionario.run(
              nomeFuncionario,
              matricula,
              setorParaInsercao,
              dataAdmissaoParaInsercao
            );
            funcionarioId = novoFuncionario.lastInsertRowid;
          }
        }

        atualizarFuncionarioInfo.run(
          nomeFuncionarioBase || null,
          setorParaAtualizacao,
          dataAdmissaoParaAtualizacao,
          matricula || null,
          funcionarioId
        );

        const pastaAtiva = verificarPastaAtivaPorFuncionario.get(funcionarioId);
        if (pastaAtiva) {
          throw new Error('Este funcionário já possui uma pasta ativa.');
        }

        const pastaNome = payload.nome || nomeFuncionarioBase;
        const result = insertPasta.run(
          payload.gaveta_id,
          funcionarioId,
          pastaNome,
          dataCriacao,
          payload.ordem || 0
        );
        const pastaId = result.lastInsertRowid;

        const envelopeTipos = ['Pessoal', 'Segurança', 'Medicina', 'Treinamento'];
        envelopeTipos.forEach(tipo => insertEnvelope.run(pastaId, tipo));

        atualizarOcupacao.run(payload.gaveta_id);
        return pastaId;
      });

      const pastaId = transaction(pastaData);
      return { success: true, lastInsertRowid: pastaId };
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('pastas:arquivar', async (event, pastaId) => {
    try {
      const selecionarPasta = db.prepare('SELECT gaveta_id FROM pastas WHERE id = ?');
      const arquivar = db.prepare('UPDATE pastas SET arquivo_morto = 1, ativa = 0 WHERE id = ?');
      const liberarEspaco = db.prepare(`
        UPDATE gavetas
        SET ocupacao_atual = CASE WHEN ocupacao_atual > 0 THEN ocupacao_atual - 1 ELSE 0 END
        WHERE id = ?
      `);

      const transaction = db.transaction(id => {
        const pasta = selecionarPasta.get(id);
        if (!pasta) {
          throw new Error('Pasta não encontrada.');
        }
        arquivar.run(id);
        liberarEspaco.run(pasta.gaveta_id);
      });

      transaction(pastaId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao arquivar pasta:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerPastaHandlers };
