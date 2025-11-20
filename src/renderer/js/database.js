// ============================================
// DATABASE LAYER - Camada de Acesso a Dados
// ============================================

/**
 * Abstrai o acesso ao banco de dados através do Electron IPC
 * Fornece métodos CRUD para todas as entidades do sistema
 * Gerencia cache de dados para melhor performance
 */
class DatabaseLayer {
  constructor() {
    // Cache para reduzir chamadas ao backend
    this.cache = {
      funcionarios: null,
      gaveteiros: null,
      gavetas: null,
      pastas: null,
      envelopes: null,
      usuarios: null,
      perfis: null,
      menus: null,
      solicitacoes: null,
      retiradas: null,
      alertas: null,
      movimentacoes: null
    };
  }

  // ==========================================
  // Métodos Genéricos de Banco de Dados
  // ==========================================

  /**
   * Executa uma query SQL e retorna os resultados
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Array>} - Resultados da query
   */
  async query(sql, params = []) {
    try {
      const result = await window.electronAPI.query(sql, params);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Erro ao executar query:', error);
      return [];
    }
  }

  /**
   * Executa um comando SQL (INSERT, UPDATE, DELETE)
   * @param {string} sql - Comando SQL
   * @param {Array} params - Parâmetros do comando
   * @returns {Promise<Object>} - Resultado da execução
   */
  async execute(sql, params = []) {
    try {
      return await window.electronAPI.execute(sql, params);
    } catch (error) {
      console.error('Erro ao executar comando:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Limpa todo o cache
   */
  clearCache() {
    Object.keys(this.cache).forEach(key => {
      this.cache[key] = null;
    });
  }

  /**
   * Limpa cache específico
   * @param {string} cacheKey - Chave do cache a limpar
   */
  clearSpecificCache(cacheKey) {
    if (this.cache.hasOwnProperty(cacheKey)) {
      this.cache[cacheKey] = null;
    }
  }

  // ==========================================
  // FUNCIONÁRIOS - CRUD Completo
  // ==========================================

  /**
   * Obtém todos os funcionários
   * @param {boolean} forceRefresh - Força atualização do cache
   * @returns {Promise<Array>}
   */
  async getFuncionarios(forceRefresh = false) {
    if (!forceRefresh && this.cache.funcionarios) {
      return this.cache.funcionarios;
    }

    const result = await window.electronAPI.getFuncionarios();
    if (result.success) {
      this.cache.funcionarios = result.data;
      return result.data;
    }
    return [];
  }

  /**
   * Obtém funcionário por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async getFuncionarioById(id) {
    const funcionarios = await this.getFuncionarios();
    return funcionarios.find(f => f.id === id) || null;
  }

  /**
   * Adiciona novo funcionário
   * @param {Object} data - Dados do funcionário
   * @returns {Promise<Object>}
   */
  async addFuncionario(data) {
    const result = await window.electronAPI.addFuncionario(data);
    this.clearSpecificCache('funcionarios');
    return result;
  }

  /**
   * Atualiza funcionário existente
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateFuncionario(id, data) {
    const result = await window.electronAPI.updateFuncionario(id, data);
    this.clearSpecificCache('funcionarios');
    return result;
  }

  /**
   * Demite funcionário (soft delete)
   * @param {number} id
   * @param {string} dataDemissao
   * @returns {Promise<Object>}
   */
  async demitirFuncionario(id, dataDemissao) {
    const result = await window.electronAPI.demitirFuncionario(id, dataDemissao);
    this.clearSpecificCache('funcionarios');
    this.clearSpecificCache('pastas');
    this.clearSpecificCache('gavetas');
    return result;
  }

  // ==========================================
  // GAVETEIROS - CRUD Completo
  // ==========================================

  /**
   * Obtém todos os gaveteiros
   * @returns {Promise<Array>}
   */
  async getGaveteiros(forceRefresh = false) {
    if (!forceRefresh && this.cache.gaveteiros) {
      return this.cache.gaveteiros;
    }

    const result = await window.electronAPI.getGaveteiros();
    if (result.success) {
      this.cache.gaveteiros = result.data;
      return result.data;
    }
    return [];
  }

  /**
   * Adiciona novo gaveteiro
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async addGaveteiro(data) {
    const result = await window.electronAPI.addGaveteiro(data);
    this.clearSpecificCache('gaveteiros');
    return result;
  }

  /**
   * Atualiza gaveteiro
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateGaveteiro(id, data) {
    const result = await window.electronAPI.updateGaveteiro(id, data);
    this.clearSpecificCache('gaveteiros');
    return result;
  }

  // ==========================================
  // GAVETAS - CRUD Completo
  // ==========================================

  /**
   * Obtém todas as gavetas
   * @returns {Promise<Array>}
   */
  async getGavetas(forceRefresh = false) {
    if (!forceRefresh && this.cache.gavetas) {
      return this.cache.gavetas;
    }

    const result = await window.electronAPI.getGavetas();
    if (result.success) {
      this.cache.gavetas = result.data;
      return result.data;
    }
    return [];
  }

  /**
   * Adiciona nova gaveta
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async addGaveta(data) {
    const result = await window.electronAPI.addGaveta(data);
    this.clearSpecificCache('gavetas');
    return result;
  }

  /**
   * Atualiza gaveta
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateGaveta(id, data) {
    const result = await window.electronAPI.updateGaveta(id, data);
    this.clearSpecificCache('gavetas');
    return result;
  }

  // ==========================================
  // PASTAS - CRUD Completo
  // ==========================================

  /**
   * Obtém todas as pastas ativas
   * @returns {Promise<Array>}
   */
  async getPastas(forceRefresh = false) {
    if (!forceRefresh && this.cache.pastas) {
      return this.cache.pastas;
    }

    const result = await window.electronAPI.getPastas();
    if (result.success) {
      this.cache.pastas = result.data;
      return result.data;
    }
    return [];
  }

  /**
   * Obtém pasta por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async getPastaById(id) {
    const pastas = await this.getPastas();
    return pastas.find(p => p.id === id) || null;
  }

  /**
   * Adiciona nova pasta
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async addPasta(data) {
    const payload = { ...data };
    if (!payload.data_criacao) {
      payload.data_criacao = new Date().toISOString().split('T')[0];
    }
    const result = await window.electronAPI.addPasta(payload);
    this.clearSpecificCache('pastas');
    this.clearSpecificCache('gavetas'); // Atualiza ocupação
    this.clearSpecificCache('funcionarios');
    return result;
  }

  /**
   * Arquiva pasta (soft delete)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async arquivarPasta(id) {
    const result = await window.electronAPI.arquivarPasta(id);
    this.clearSpecificCache('pastas');
    this.clearSpecificCache('gavetas');
    return result;
  }

  /**
   * Obtém pastas do arquivo morto
   * @returns {Promise<Array>}
   */
  async getPastasArquivoMorto() {
    const result = await window.electronAPI.getPastasArquivoMorto();
    return result.success ? result.data : [];
  }

  // ==========================================
  // ENVELOPES - CRUD Completo
  // ==========================================

  /**
   * Obtém envelopes de uma pasta
   * @param {number} pastaId
   * @returns {Promise<Array>}
   */
  async getEnvelopesByPasta(pastaId) {
    const result = await window.electronAPI.getEnvelopesByPasta(pastaId);
    return result.success ? result.data : [];
  }

  /**
   * Atualiza status de envelope
   * @param {number} id
   * @param {string} status - 'presente' ou 'retirado'
   * @returns {Promise<Object>}
   */
  async updateEnvelopeStatus(id, status) {
    const result = await window.electronAPI.updateEnvelopeStatus(id, status);
    this.clearSpecificCache('envelopes');
    return result;
  }

  // ==========================================
  // SOLICITAÇÕES - Gerenciamento
  // ==========================================

  /**
   * Obtém todas as solicitações
   * @returns {Promise<Array>}
   */
  async getSolicitacoes(forceRefresh = false) {
    if (!forceRefresh && this.cache.solicitacoes) {
      return this.cache.solicitacoes;
    }

    const result = await window.electronAPI.getSolicitacoes();
    if (result.success) {
      this.cache.solicitacoes = result.data;
      return result.data;
    }
    return [];
  }

  /**
   * Obtém solicitações pendentes
   * @returns {Promise<Array>}
   */
  async getSolicitacoesPendentes() {
    const result = await window.electronAPI.getSolicitacoesPendentes();
    return result.success ? result.data : [];
  }

  /**
   * Cria nova solicitação
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createSolicitacao(data) {
    const payload = {
      ...data,
      envelopes: Array.isArray(data.envelopes) ? data.envelopes : []
    };
    const result = await window.electronAPI.createSolicitacao(payload);
    this.clearSpecificCache('solicitacoes');
    return result;
  }

  /**
   * Aprova solicitação
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async aprovarSolicitacao(id) {
    const result = await window.electronAPI.aprovarSolicitacao(id);
    this.clearSpecificCache('solicitacoes');
    this.clearSpecificCache('retiradas');
    this.clearSpecificCache('pastas');
    this.clearSpecificCache('gavetas');
    this.clearSpecificCache('funcionarios');
    return result;
  }

  /**
   * Rejeita solicitação
   * @param {number} id
   * @param {string} motivo
   * @returns {Promise<Object>}
   */
  async rejeitarSolicitacao(id, motivo) {
    const result = await window.electronAPI.rejeitarSolicitacao(id, motivo);
    this.clearSpecificCache('solicitacoes');
    return result;
  }

  // ==========================================
  // RETIRADAS - Gerenciamento
  // ==========================================

  /**
   * Obtém retiradas ativas
   * @returns {Promise<Array>}
   */
  async getRetiradasAtivas() {
    const result = await window.electronAPI.getRetiradasAtivas();
    return result.success ? result.data : [];
  }

  /**
   * Obtém retiradas de um usuário
   * @param {number} usuarioId
   * @returns {Promise<Array>}
   */
  async getRetiradasByUsuario(usuarioId) {
    const result = await window.electronAPI.getRetiradasByUsuario(usuarioId);
    return result.success ? result.data : [];
  }

  /**
   * Cria nova retirada
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createRetirada(data) {
    const payload = {
      ...data,
      envelopes: Array.isArray(data.envelopes) ? data.envelopes : []
    };
    const result = await window.electronAPI.createRetirada(payload);
    this.clearSpecificCache('retiradas');
    return result;
  }

  /**
   * Finaliza retirada (devolução)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async finalizarRetirada(id) {
    const result = await window.electronAPI.finalizarRetirada(id);
    this.clearSpecificCache('retiradas');
    this.clearSpecificCache('alertas');
    this.clearSpecificCache('envelopes');
    return result;
  }

  // ==========================================
  // ALERTAS - Gerenciamento
  // ==========================================

  /**
   * Obtém alertas ativos
   * @returns {Promise<Array>}
   */
  async getAlertasAtivos() {
    const result = await window.electronAPI.getAlertasAtivos();
    return result.success ? result.data : [];
  }

  /**
   * Atualiza alertas do sistema
   * @returns {Promise<Object>}
   */
  async atualizarAlertas() {
    const result = await window.electronAPI.atualizarAlertas();
    this.clearSpecificCache('alertas');
    this.clearSpecificCache('retiradas');
    return result;
  }

  /**
   * Resolve alerta
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async resolverAlerta(id) {
    const result = await window.electronAPI.resolverAlerta(id);
    this.clearSpecificCache('alertas');
    return result;
  }

  // ==========================================
  // MOVIMENTAÇÕES - Registro
  // ==========================================

  /**
   * Obtém histórico de movimentações
   * @param {number} limit - Limite de registros
   * @returns {Promise<Array>}
   */
  async getMovimentacoes(limit = 100) {
    const result = await window.electronAPI.getMovimentacoes(limit);
    return result.success ? result.data : [];
  }

  /**
   * Registra nova movimentação
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async registrarMovimentacao(data) {
    const result = await window.electronAPI.registrarMovimentacao(data);
    this.clearSpecificCache('movimentacoes');
    return result;
  }

  // ==========================================
  // USUÁRIOS - Gerenciamento (Admin)
  // ==========================================

  /**
   * Obtém todos os usuários
   * @returns {Promise<Array>}
   */
  async getUsuarios(forceRefresh = false) {
    if (!forceRefresh && this.cache.usuarios) {
      return this.cache.usuarios;
    }

    const result = await window.electronAPI.getUsuarios();
    if (result.success) {
      this.cache.usuarios = result.data;
      return result.data;
    }
    return [];
  }

  /**
   * Adiciona novo usuário
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async addUsuario(data) {
    const result = await window.electronAPI.addUsuario(data);
    this.clearSpecificCache('usuarios');
    return result;
  }

  /**
   * Atualiza usuário
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateUsuario(id, data) {
    const result = await window.electronAPI.updateUsuario(id, data);
    this.clearSpecificCache('usuarios');
    return result;
  }

  /**
   * Ativa/desativa usuário
   * @param {number} id
   * @param {boolean} ativo
   * @returns {Promise<Object>}
   */
  async toggleUsuarioStatus(id, ativo) {
    const result = await window.electronAPI.toggleUsuarioStatus(id, ativo);
    this.clearSpecificCache('usuarios');
    return result;
  }

  // ==========================================
  // PERFIS E MENUS - Gerenciamento
  // ==========================================

  async getPerfis(forceRefresh = false) {
    if (!forceRefresh && this.cache.perfis) {
      return this.cache.perfis;
    }

    const result = await window.electronAPI.getPerfis();
    if (result.success) {
      this.cache.perfis = result.data;
      return result.data;
    }
    return [];
  }

  async getMenus(forceRefresh = false) {
    if (!forceRefresh && this.cache.menus) {
      return this.cache.menus;
    }

    const result = await window.electronAPI.getMenus();
    if (result.success) {
      this.cache.menus = result.data;
      return result.data;
    }
    return [];
  }

  async getMenusByUsuario(usuarioId) {
    const result = await window.electronAPI.getMenusByUsuario(usuarioId);
    return result.success ? result.data : [];
  }

  async atualizarMenusUsuario(usuarioId, menuIds) {
    const result = await window.electronAPI.usuariosAtualizarMenus(usuarioId, menuIds);
    return result;
  }

  // ==========================================
  // ESTATÍSTICAS - Dashboard
  // ==========================================

  /**
   * Obtém estatísticas do dashboard
   * @returns {Promise<Object>}
   */
  async getEstatisticas() {
    const result = await window.electronAPI.getEstatisticas();
    return result.success ? result.data : {
      totalGavetas: 0,
      totalPastas: 0,
      itensRetirados: 0,
      alertasCriticos: 0,
      gavetasCheias: 0,
      gavetasAtencao: 0,
      gavetasVazias: 0,
      gavetasDisponiveis: 0
    };
  }

  // ==========================================
  // LOGS - Auditoria
  // ==========================================

  /**
   * Adiciona log de auditoria
   * @param {string} acao
   * @param {number} usuarioId
   * @param {string} tabelaAfetada - Opcional
   * @param {number} registroId - Opcional
   * @param {string} detalhes - Opcional
   * @returns {Promise<Object>}
   */
  async addLog(acao, usuarioId, tabelaAfetada = null, registroId = null, detalhes = null) {
    return await window.electronAPI.addLog({
      acao,
      usuario_id: usuarioId,
      tabela_afetada: tabelaAfetada,
      registro_id: registroId,
      detalhes
    });
  }

  /**
   * Obtém logs de auditoria
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getLogs(limit = 100) {
    const result = await window.electronAPI.getLogs(limit);
    return result.success ? result.data : [];
  }
}