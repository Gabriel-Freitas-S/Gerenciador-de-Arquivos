const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload Script - CORRIGIDO
 * 
 * Este script cria uma ponte segura entre o Main Process e o Renderer Process
 * usando contextBridge. Expõe apenas uma API controlada e limitada para o renderer.
 * 
 * CORREÇÕES APLICADAS:
 * - Campos SQL atualizados para corresponder ao schema_perfis.sql
 * - posto_graduacao → especialidade
 * - categoria → tipo (em envelopes)
 * - observacoes → motivo_rejeicao (em solicitacoes)
 * - prazo_devolucao → data_prevista_retorno
 * - data_devolucao → data_retorno
 * - envelope_id → item_id (em movimentacoes)
 * - data_movimentacao → data
 * - Removidos campos inexistentes: localizacao_atual, data_resolucao
 */

contextBridge.exposeInMainWorld('electronAPI', {
  
  // ============================================
  // AUTENTICAÇÃO
  // ============================================
  
  login: (username, password) => {
    return ipcRenderer.invoke('auth:login', username, password);
  },
  
  // ============================================
  // DATABASE - OPERAÇÕES GENÉRICAS
  // ============================================
  
  query: (sql, params = []) => {
    return ipcRenderer.invoke('db:query', sql, params);
  },
  
  execute: (sql, params = []) => {
    return ipcRenderer.invoke('db:execute', sql, params);
  },
  
  // ============================================
  // FUNCIONÁRIOS - CORRIGIDO
  // ============================================
  
  getFuncionarios: () => {
    return ipcRenderer.invoke('db:getFuncionarios');
  },
  
  getFuncionarioById: (id) => {
    return ipcRenderer.invoke('db:query', 
      'SELECT * FROM funcionarios WHERE id = ?', [id]);
  },
  
  // CORRIGIDO: Adicionados campos departamento e data_admissao
  addFuncionario: (funcionario) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO funcionarios (nome, departamento, especialidade, data_admissao, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [funcionario.nome, 
       funcionario.departamento || 'Não especificado', 
       funcionario.especialidade || '', 
       funcionario.data_admissao || new Date().toISOString().split('T')[0],
       'Ativo']);
  },
  
  // CORRIGIDO: especialidade ao invés de posto_graduacao
  updateFuncionario: (id, funcionario) => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE funcionarios 
       SET nome = ?, departamento = ?, especialidade = ?, status = ? 
       WHERE id = ?`,
      [funcionario.nome, funcionario.departamento, funcionario.especialidade, 
       funcionario.status, id]);
  },
  
  demitirFuncionario: async (id, dataDemissao) => {
    const result = await ipcRenderer.invoke('db:execute',
      `UPDATE funcionarios 
       SET status = 'Demitido', data_demissao = ? 
       WHERE id = ?`,
      [dataDemissao, id]);

    if (result?.success) {
      try {
        await ipcRenderer.invoke('db:execute',
          `UPDATE pastas 
           SET ativa = 0, arquivo_morto = 1 
           WHERE funcionario_id = ?`,
          [id]);
      } catch (error) {
        console.error('Erro ao mover pastas para arquivo morto:', error);
      }
    }

    return result;
  },
  
  // ============================================
  // GAVETEIROS E GAVETAS
  // ============================================
  
  getGaveteiros: () => {
    return ipcRenderer.invoke('db:getGaveteiros');
  },
  
  getGavetas: (gaveteiroId) => {
    return ipcRenderer.invoke('db:getGavetas', gaveteiroId);
  },
  
  addGaveteiro: (gaveteiro) => {
    return ipcRenderer.invoke('db:execute',
      'INSERT INTO gaveteiros (nome, localizacao, descricao) VALUES (?, ?, ?)',
      [gaveteiro.nome, gaveteiro.localizacao, gaveteiro.descricao]);
  },
  
  updateGaveteiro: (id, gaveteiro) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE gaveteiros SET nome = ?, localizacao = ?, descricao = ? WHERE id = ?',
      [gaveteiro.nome, gaveteiro.localizacao, gaveteiro.descricao, id]);
  },
  
  addGaveta: (gaveta) => {
    return ipcRenderer.invoke('db:execute',
      'INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES (?, ?, ?, ?)',
      [gaveta.gaveteiro_id, gaveta.numero, gaveta.capacidade || 50, 0]);
  },
  
  updateGaveta: (id, gaveta) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE gavetas SET numero = ?, capacidade = ? WHERE id = ?',
      [gaveta.numero, gaveta.capacidade, id]);
  },
  
  // ============================================
  // PASTAS E ENVELOPES - CORRIGIDO
  // ============================================
  
  getPastas: (gavetaId) => {
    const baseQuery = `SELECT p.*, f.nome as funcionario_nome 
         FROM pastas p 
         JOIN funcionarios f ON p.funcionario_id = f.id 
         WHERE p.ativa = 1`;

    if (gavetaId) {
      return ipcRenderer.invoke('db:query',
        `${baseQuery} AND p.gaveta_id = ?
         ORDER BY p.nome COLLATE NOCASE`,
        [gavetaId]);
    }

    return ipcRenderer.invoke('db:query',
      `${baseQuery}
       ORDER BY p.nome COLLATE NOCASE`);
  },
  
  getPastaById: (id) => {
    return ipcRenderer.invoke('db:query',
      `SELECT p.*, f.nome as funcionario_nome, f.departamento 
       FROM pastas p 
       JOIN funcionarios f ON p.funcionario_id = f.id 
       WHERE p.id = ?`,
      [id]);
  },
  
  addPasta: (pasta) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto) 
       VALUES (?, ?, ?, ?, ?, 1, 0)`,
      [pasta.gaveta_id, 
       pasta.funcionario_id, 
       pasta.nome, 
       pasta.data_criacao || new Date().toISOString().split('T')[0],
       pasta.ordem || 0]);
  },
  
  updatePasta: (id, pasta) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE pastas SET gaveta_id = ?, nome = ?, ordem = ? WHERE id = ?',
      [pasta.gaveta_id, pasta.nome, pasta.ordem, id]);
  },
  
  arquivarPasta: (id) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE pastas SET arquivo_morto = 1, ativa = 0 WHERE id = ?',
      [id]);
  },
  
  getPastasArquivoMorto: () => {
    return ipcRenderer.invoke('db:query',
      `SELECT p.*, 
              f.nome as funcionario_nome, 
              f.data_demissao, 
              f.status as funcionario_status,
              f.departamento 
       FROM pastas p 
       JOIN funcionarios f ON p.funcionario_id = f.id 
       WHERE p.arquivo_morto = 1
       ORDER BY f.data_demissao DESC, f.nome COLLATE NOCASE`);
  },
  
  // CORRIGIDO: tipo ao invés de categoria, removido localizacao_atual
  getEnvelopes: (pastaId) => {
    return ipcRenderer.invoke('db:query',
      `SELECT e.*, 
        CASE WHEN e.status = 'presente' THEN 'Disponível' ELSE 'Retirado' END as status_display
       FROM envelopes e 
       WHERE e.pasta_id = ? 
       ORDER BY e.tipo`,
      [pastaId]);
  },
  
  getEnvelopesByPasta: (pastaId) => {
    return ipcRenderer.invoke('db:query',
      'SELECT * FROM envelopes WHERE pasta_id = ? ORDER BY tipo',
      [pastaId]);
  },
  
  updateEnvelopeStatus: (id, status) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE envelopes SET status = ? WHERE id = ?',
      [status, id]);
  },
  
  // ============================================
  // SOLICITAÇÕES - CORRIGIDO
  // ============================================
  
  getSolicitacoes: () => {
    return ipcRenderer.invoke('db:getSolicitacoes');
  },
  
  getSolicitacoesPendentes: () => {
    return ipcRenderer.invoke('db:query',
      `SELECT s.*, f.nome as funcionario_nome, u.username 
       FROM solicitacoes s 
       JOIN funcionarios f ON s.funcionario_id = f.id 
       JOIN usuarios u ON s.usuario_id = u.id 
       WHERE s.status = 'pendente' 
       ORDER BY s.data_solicitacao DESC`);
  },
  
  createSolicitacao: (solicitacao) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO solicitacoes (funcionario_id, usuario_id, motivo, status, data_solicitacao) 
       VALUES (?, ?, ?, 'pendente', datetime('now'))`,
      [solicitacao.funcionario_id, solicitacao.usuario_id, solicitacao.motivo]);
  },
  
  aprovarSolicitacao: (solicitacaoId) => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE solicitacoes 
       SET status = 'aprovada', data_aprovacao = datetime('now') 
       WHERE id = ?`,
      [solicitacaoId]);
  },
  
  // CORRIGIDO: motivo_rejeicao ao invés de observacoes
  rejeitarSolicitacao: (solicitacaoId, motivo) => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE solicitacoes 
       SET status = 'rejeitada', motivo_rejeicao = ? 
       WHERE id = ?`,
      [motivo, solicitacaoId]);
  },
  
  // ============================================
  // RETIRADAS - CORRIGIDO
  // ============================================
  
  getRetiradas: () => {
    return ipcRenderer.invoke('db:getRetiradas');
  },
  
  getRetiradasAtivas: () => {
    return ipcRenderer.invoke('db:query',
      `SELECT r.*, f.nome as funcionario_nome, u.username,
        p.nome as pasta_nome
       FROM retiradas_com_pessoas r 
       JOIN funcionarios f ON r.funcionario_id = f.id 
       JOIN usuarios u ON r.usuario_id = u.id 
       JOIN pastas p ON r.pasta_id = p.id
       WHERE r.status = 'ativo' 
       ORDER BY r.data_retirada DESC`);
  },
  
  getRetiradasByUsuario: (usuarioId) => {
    return ipcRenderer.invoke('db:query',
      `SELECT r.*, f.nome as funcionario_nome, p.nome as pasta_nome
       FROM retiradas_com_pessoas r 
       JOIN funcionarios f ON r.funcionario_id = f.id 
       JOIN pastas p ON r.pasta_id = p.id
       WHERE r.usuario_id = ? AND r.status = 'ativo' 
       ORDER BY r.data_retirada DESC`,
      [usuarioId]);
  },
  
  // CORRIGIDO: data_prevista_retorno ao invés de prazo_devolucao
  createRetirada: (retirada) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO retiradas_com_pessoas 
       (pasta_id, funcionario_id, usuario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) 
       VALUES (?, ?, ?, datetime('now'), datetime('now', '+7 days'), 'ativo', 0)`,
      [retirada.pasta_id, retirada.funcionario_id, retirada.usuario_id]);
  },
  
  // CORRIGIDO: data_retorno ao invés de data_devolucao
  finalizarRetirada: (retiradaId) => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE retiradas_com_pessoas 
       SET status = 'devolvido', data_retorno = datetime('now') 
       WHERE id = ?`,
      [retiradaId]);
  },
  
  atualizarDiasRetiradas: () => {
    return ipcRenderer.invoke('db:execute',
      `UPDATE retiradas_com_pessoas 
       SET dias_decorridos = CAST((julianday('now') - julianday(data_retirada)) AS INTEGER)
       WHERE status = 'ativo'`);
  },
  
  // ============================================
  // ALERTAS - CORRIGIDO
  // ============================================
  
  getAlertas: () => {
    return ipcRenderer.invoke('db:getAlertas');
  },
  
  getAlertasAtivos: () => {
    return ipcRenderer.invoke('db:query',
      `SELECT a.*, r.funcionario_id, f.nome as funcionario_nome,
        r.data_prevista_retorno, r.dias_decorridos
       FROM alertas a 
       JOIN retiradas_com_pessoas r ON a.retirada_id = r.id 
       JOIN funcionarios f ON r.funcionario_id = f.id 
       WHERE a.resolvido = 0 
       ORDER BY a.severidade DESC, a.data_criacao DESC`);
  },

  atualizarAlertas: () => {
    return ipcRenderer.invoke('alertas:atualizar');
  },
  
  // CORRIGIDO: Removido data_resolucao que não existe
  resolverAlerta: (alertaId) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE alertas SET resolvido = 1 WHERE id = ?',
      [alertaId]);
  },
  
  criarAlerta: (retiradaId, tipoAlerta, severidade) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) 
       VALUES (?, ?, ?, 0)`,
      [retiradaId, tipoAlerta, severidade]);
  },
  
  // ============================================
  // MOVIMENTAÇÕES - CORRIGIDO
  // ============================================
  
  // CORRIGIDO: item_id e data ao invés de envelope_id e data_movimentacao
  getMovimentacoes: (limit = 100) => {
    return ipcRenderer.invoke('db:query',
      `SELECT m.*, u.username,
        CASE 
          WHEN m.tipo_item = 'pasta' THEN (SELECT nome FROM pastas WHERE id = m.item_id)
          WHEN m.tipo_item = 'envelope' THEN (SELECT tipo FROM envelopes WHERE id = m.item_id)
        END as item_nome
       FROM movimentacoes m
       JOIN usuarios u ON m.usuario_id = u.id
       ORDER BY m.data DESC
       LIMIT ?`,
      [limit]);
  },
  
  registrarMovimentacao: (movimentacao) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [movimentacao.item_id, 
       movimentacao.tipo_item, 
       movimentacao.acao, 
       movimentacao.usuario_id, 
       movimentacao.motivo,
       movimentacao.descricao || '']);
  },
  
  // ============================================
  // USUÁRIOS - Admin
  // ============================================
  
  getUsuarios: () => {
    return ipcRenderer.invoke('db:query',
      `SELECT u.*, p.nome as perfil_nome, f.nome as funcionario_nome 
       FROM usuarios u 
       LEFT JOIN perfis p ON u.perfil_id = p.id
       LEFT JOIN funcionarios f ON u.funcionario_id = f.id
       ORDER BY u.username`);
  },
  
  addUsuario: (usuario) => {
    return ipcRenderer.invoke('db:execute',
      'INSERT INTO usuarios (username, senha, perfil_id, funcionario_id, ativo) VALUES (?, ?, ?, ?, 1)',
      [usuario.username, usuario.senha, usuario.perfil_id, usuario.funcionario_id || null]);
  },
  
  updateUsuario: (id, usuario) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE usuarios SET username = ?, perfil_id = ?, funcionario_id = ? WHERE id = ?',
      [usuario.username, usuario.perfil_id, usuario.funcionario_id || null, id]);
  },
  
  updateUsuarioSenha: (id, novaSenha) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE usuarios SET senha = ? WHERE id = ?',
      [novaSenha, id]);
  },
  
  toggleUsuarioStatus: (id, ativo) => {
    return ipcRenderer.invoke('db:execute',
      'UPDATE usuarios SET ativo = ? WHERE id = ?',
      [ativo ? 1 : 0, id]);
  },
  
  usuariosAtualizarMenus: (usuarioId, menuIds) => {
    return ipcRenderer.invoke('usuarios:atualizar-menus', usuarioId, menuIds);
  },
  
  // ============================================
  // PERFIS DE ACESSO
  // ============================================
  
  getPerfis: () => {
    return ipcRenderer.invoke('perfis:listar');
  },
  
  getPerfilById: (perfilId) => {
    return ipcRenderer.invoke('perfis:buscar', perfilId);
  },
  
  createPerfil: (nome, descricao, menuIds) => {
    return ipcRenderer.invoke('perfis:criar', nome, descricao, menuIds);
  },
  
  updatePerfil: (perfilId, nome, descricao, menuIds) => {
    return ipcRenderer.invoke('perfis:atualizar', perfilId, nome, descricao, menuIds);
  },
  
  deletePerfil: (perfilId) => {
    return ipcRenderer.invoke('perfis:excluir', perfilId);
  },
  
  // ============================================
  // MENUS
  // ============================================
  
  getMenus: () => {
    return ipcRenderer.invoke('menus:listar');
  },
  
  getMenusByUsuario: (usuarioId) => {
    return ipcRenderer.invoke('usuarios:menus', usuarioId);
  },
  
  getUsuarioPerfilCompleto: (usuarioId) => {
    return ipcRenderer.invoke('usuarios:perfil-completo', usuarioId);
  },
  
  // ============================================
  // ESTATÍSTICAS
  // ============================================
  
  getEstatisticas: () => {
    return ipcRenderer.invoke('db:getEstatisticas');
  },
  
  // ============================================
  // LOGS
  // ============================================
  
  addLog: (log) => {
    return ipcRenderer.invoke('db:execute',
      `INSERT INTO logs (usuario_id, acao, tabela_afetada, registro_id, detalhes)
       VALUES (?, ?, ?, ?, ?)`,
      [log.usuario_id, log.acao, log.tabela_afetada || null, log.registro_id || null, log.detalhes || null]);
  },
  
  getLogs: (limit = 100) => {
    return ipcRenderer.invoke('db:query',
      `SELECT l.*, u.username 
       FROM logs l 
       LEFT JOIN usuarios u ON l.usuario_id = u.id 
       ORDER BY l.timestamp DESC 
       LIMIT ?`,
      [limit]);
  }
});

console.log('Preload script corrigido carregado: API atualizada para schema_perfis.sql');