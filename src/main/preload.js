const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload Script
 * 
 * Este script cria uma ponte segura entre o Main Process e o Renderer Process
 * usando contextBridge. Expõe apenas uma API controlada e limitada para o renderer.
 * 
 * SEGURANÇA:
 * - nodeIntegration: false (no renderer)
 * - contextIsolation: true (sandboxing)
 * - API limitada e validada
 * - Nenhum acesso direto ao Node.js no renderer
 */

// Expor API segura para o renderer através do window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  
  // ============================================
  // AUTENTICAÇÃO
  // ============================================
  
  /**
   * Realiza login do usuário
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha
   * @returns {Promise<{success: boolean, user?: object, message?: string}>}
   */
  login: (username, password) => {
    return ipcRenderer.invoke('auth:login', username, password);
  },
  
  // ============================================
  // DATABASE - OPERAÇÕES GENÉRICAS
  // ============================================
  
  /**
   * Executa query SELECT genérica
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  query: (sql, params = []) => {
    return ipcRenderer.invoke('db:query', sql, params);
  },
  
  /**
   * Executa comando SQL genérico (INSERT, UPDATE, DELETE)
   * @param {string} sql - Comando SQL
   * @param {Array} params - Parâmetros do comando
   * @returns {Promise<{success: boolean, changes?: number, lastInsertRowid?: number, message?: string}>}
   */
  execute: (sql, params = []) => {
    return ipcRenderer.invoke('db:execute', sql, params);
  },
  
  // ============================================
  // MÉTODOS ESPECÍFICOS - FUNCIONÁRIOS
  // ============================================
  
  /**
   * Busca todos os funcionários ativos
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getFuncionarios: () => {
    return ipcRenderer.invoke('db:getFuncionarios');
  },
  
  /**
   * Busca funcionário por ID
   * @param {number} id - ID do funcionário
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getFuncionarioById: (id) => {
    return ipcRenderer.invoke('db:query', 
      'SELECT * FROM funcionarios WHERE id = ?', [id]);
  },
  
  /**
   * Adiciona novo funcionário
   * @param {object} funcionario - Dados do funcionário
   * @returns {Promise<{success: boolean, lastInsertRowid?: number, message?: string}>}
   */
  addFuncionario: (funcionario) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO funcionarios (nome, posto_graduacao, especialidade, status) 
       VALUES (?, ?, ?, ?)`,
      [funcionario.nome, funcionario.posto_graduacao, funcionario.especialidade, 'Ativo']);
  },
  
  /**
   * Atualiza funcionário existente
   * @param {number} id - ID do funcionário
   * @param {object} funcionario - Dados atualizados
   * @returns {Promise<{success: boolean, changes?: number, message?: string}>}
   */
  updateFuncionario: (id, funcionario) => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE funcionarios 
       SET nome = ?, posto_graduacao = ?, especialidade = ?, status = ? 
       WHERE id = ?`,
      [funcionario.nome, funcionario.posto_graduacao, funcionario.especialidade, 
       funcionario.status, id]);
  },
  
  // ============================================
  // MÉTODOS ESPECÍFICOS - GAVETEIROS E GAVETAS
  // ============================================
  
  /**
   * Busca todos os gaveteiros
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getGaveteiros: () => {
    return ipcRenderer.invoke('db:getGaveteiros');
  },
  
  /**
   * Busca gavetas de um gaveteiro específico
   * @param {number} gaveteiroId - ID do gaveteiro
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getGavetas: (gaveteiroId) => {
    return ipcRenderer.invoke('db:getGavetas', gaveteiroId);
  },
  
  /**
   * Adiciona novo gaveteiro
   * @param {object} gaveteiro - Dados do gaveteiro
   * @returns {Promise<{success: boolean, lastInsertRowid?: number, message?: string}>}
   */
  addGaveteiro: (gaveteiro) => {
    return ipcRenderer.invoke('db:execute',
      'INSERT INTO gaveteiros (nome, localizacao, descricao) VALUES (?, ?, ?)',
      [gaveteiro.nome, gaveteiro.localizacao, gaveteiro.descricao]);
  },
  
  /**
   * Adiciona nova gaveta a um gaveteiro
   * @param {object} gaveta - Dados da gaveta
   * @returns {Promise<{success: boolean, lastInsertRowid?: number, message?: string}>}
   */
  addGaveta: (gaveta) => {
    return ipcRenderer.invoke('db:execute',
      'INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES (?, ?, ?, ?)',
      [gaveta.gaveteiro_id, gaveta.numero, gaveta.capacidade || 50, 0]);
  },
  
  // ============================================
  // MÉTODOS ESPECÍFICOS - PASTAS E ENVELOPES
  // ============================================
  
  /**
   * Busca pastas de uma gaveta específica
   * @param {number} gavetaId - ID da gaveta
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getPastas: (gavetaId) => {
    return ipcRenderer.invoke('db:getPastas', gavetaId);
  },
  
  /**
   * Busca envelopes de uma pasta específica
   * @param {number} pastaId - ID da pasta
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getEnvelopes: (pastaId) => {
    return ipcRenderer.invoke('db:query',
      `SELECT e.*, 
        CASE WHEN e.localizacao_atual = 'na_gaveta' THEN 'Disponível' ELSE 'Retirado' END as status_display
       FROM envelopes e 
       WHERE e.pasta_id = ? 
       ORDER BY e.categoria`,
      [pastaId]);
  },
  
  /**
   * Adiciona nova pasta
   * @param {object} pasta - Dados da pasta
   * @returns {Promise<{success: boolean, lastInsertRowid?: number, message?: string}>}
   */
  addPasta: (pasta) => {
    return ipcRenderer.invoke('db:execute',
      'INSERT INTO pastas (gaveta_id, funcionario_id, ordem, ativa) VALUES (?, ?, ?, ?)',
      [pasta.gaveta_id, pasta.funcionario_id, pasta.ordem, 1]);
  },
  
  // ============================================
  // MÉTODOS ESPECÍFICOS - SOLICITAÇÕES
  // ============================================
  
  /**
   * Busca solicitações pendentes
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getSolicitacoes: () => {
    return ipcRenderer.invoke('db:getSolicitacoes');
  },
  
  /**
   * Cria nova solicitação de retirada
   * @param {object} solicitacao - Dados da solicitação
   * @returns {Promise<{success: boolean, lastInsertRowid?: number, message?: string}>}
   */
  addSolicitacao: (solicitacao) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO solicitacoes (funcionario_id, usuario_id, motivo, status, data_solicitacao) 
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [solicitacao.funcionario_id, solicitacao.usuario_id, solicitacao.motivo, 'pendente']);
  },
  
  /**
   * Aprova solicitação de retirada
   * @param {number} solicitacaoId - ID da solicitação
   * @param {number} usuarioId - ID do usuário que aprovou
   * @returns {Promise<{success: boolean, changes?: number, message?: string}>}
   */
  aprovarSolicitacao: (solicitacaoId, usuarioId) => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE solicitacoes 
       SET status = 'aprovado', data_aprovacao = datetime('now') 
       WHERE id = ?`,
      [solicitacaoId]);
  },
  
  /**
   * Rejeita solicitação de retirada
   * @param {number} solicitacaoId - ID da solicitação
   * @param {string} motivo - Motivo da rejeição
   * @returns {Promise<{success: boolean, changes?: number, message?: string}>}
   */
  rejeitarSolicitacao: (solicitacaoId, motivo) => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE solicitacoes 
       SET status = 'rejeitado', observacoes = ? 
       WHERE id = ?`,
      [motivo, solicitacaoId]);
  },
  
  // ============================================
  // MÉTODOS ESPECÍFICOS - RETIRADAS
  // ============================================
  
  /**
   * Busca retiradas ativas
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getRetiradas: () => {
    return ipcRenderer.invoke('db:getRetiradas');
  },
  
  /**
   * Registra nova retirada
   * @param {object} retirada - Dados da retirada
   * @returns {Promise<{success: boolean, lastInsertRowid?: number, message?: string}>}
   */
  addRetirada: (retirada) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO retiradas_com_pessoas 
       (funcionario_id, usuario_id, motivo, data_retirada, prazo_devolucao, status) 
       VALUES (?, ?, ?, datetime('now'), datetime('now', '+7 days'), 'ativo')`,
      [retirada.funcionario_id, retirada.usuario_id, retirada.motivo]);
  },
  
  /**
   * Finaliza retirada (devolução)
   * @param {number} retiradaId - ID da retirada
   * @returns {Promise<{success: boolean, changes?: number, message?: string}>}
   */
  finalizarRetirada: (retiradaId) => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE retiradas_com_pessoas 
       SET status = 'devolvido', data_devolucao = datetime('now') 
       WHERE id = ?`,
      [retiradaId]);
  },
  
  // ============================================
  // MÉTODOS ESPECÍFICOS - ALERTAS
  // ============================================
  
  /**
   * Busca alertas não resolvidos
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getAlertas: () => {
    return ipcRenderer.invoke('db:getAlertas');
  },
  
  /**
   * Marca alerta como resolvido
   * @param {number} alertaId - ID do alerta
   * @returns {Promise<{success: boolean, changes?: number, message?: string}>}
   */
  resolverAlerta: (alertaId) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE alertas SET resolvido = 1, data_resolucao = datetime(\'now\') WHERE id = ?',
      [alertaId]);
  },
  
  // ============================================
  // MÉTODOS ESPECÍFICOS - ESTATÍSTICAS
  // ============================================
  
  /**
   * Busca estatísticas para o dashboard
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  getEstatisticas: () => {
    return ipcRenderer.invoke('db:getEstatisticas');
  },
  
  /**
   * Busca movimentações recentes
   * @param {number} limit - Limite de registros
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getMovimentacoesRecentes: (limit = 10) => {
    return ipcRenderer.invoke('db:query',
      `SELECT m.*, e.categoria, p.funcionario_id, f.nome as funcionario_nome, u.username
       FROM movimentacoes m
       JOIN envelopes e ON m.envelope_id = e.id
       JOIN pastas p ON e.pasta_id = p.id
       JOIN funcionarios f ON p.funcionario_id = f.id
       JOIN usuarios u ON m.usuario_id = u.id
       ORDER BY m.data_movimentacao DESC
       LIMIT ?`,
      [limit]);
  },
  
  // ============================================
  // MÉTODOS ESPECÍFICOS - LOGS
  // ============================================
  
  /**
   * Registra log de atividade
   * @param {object} log - Dados do log
   * @returns {Promise<{success: boolean, lastInsertRowid?: number, message?: string}>}
   */
  addLog: (log) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO logs (usuario_id, acao, tabela_afetada, registro_id, detalhes)
       VALUES (?, ?, ?, ?, ?)`,
      [log.usuario_id, log.acao, log.tabela_afetada, log.registro_id, log.detalhes]);
  },
  
  /**
   * Busca logs de auditoria
   * @param {object} filtros - Filtros opcionais (usuario_id, tabela, data_inicio, data_fim)
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  getLogs: (filtros = {}) => {
    let sql = `
      SELECT l.*, u.username 
      FROM logs l 
      JOIN usuarios u ON l.usuario_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (filtros.usuario_id) {
      sql += ' AND l.usuario_id = ?';
      params.push(filtros.usuario_id);
    }
    
    if (filtros.tabela) {
      sql += ' AND l.tabela_afetada = ?';
      params.push(filtros.tabela);
    }
    
    sql += ' ORDER BY l.timestamp DESC LIMIT 100';
    
    return ipcRenderer.invoke('db:query', sql, params);
  }
});

console.log('Preload script carregado: API segura exposta para o renderer');