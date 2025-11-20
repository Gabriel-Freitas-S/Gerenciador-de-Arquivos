// ============================================
// APP - Aplicação Principal
// ============================================

/**
 * Classe principal da aplicação
 * Coordena os módulos auth, database e ui
 * Gerencia inicialização e event listeners
 */
class HospitalFileManagementApp {
  constructor() {
    // Inicializar módulos
    this.auth = new AuthManager();
    this.db = new DatabaseLayer();
    this.ui = new UIManager(this.auth, this.db);
    this.currentSolicitacaoContext = null;
    
    console.log('🏭 Sistema de Gerenciamento de Arquivos Hospital - Inicializando...');
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    console.log('🚀 Configurando sistema...');
    
    // Setup de event listeners globais
    this.setupEventListeners();
    
    // Mostrar tela de login
    this.ui.showLoginScreen();
    
    console.log('✅ Sistema pronto!');
  }

  /**
   * Configura todos os event listeners da aplicação
   */
  setupEventListeners() {
    // ==========================================
    // LOGIN / LOGOUT
    // ==========================================
    
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.handleLogout();
    });

    // ==========================================
    // NAVEGAÇÃO
    // ==========================================
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        await this.ui.navigateToView(view);
      });
    });

    // ==========================================
    // BOTÕES DE AÇÃO PRINCIPAIS
    // ==========================================
    
    document.getElementById('btnNovoGaveteiro')?.addEventListener('click', () => {
      this.abrirModalNovoGaveteiro();
    });

    document.getElementById('btnNovaGaveta')?.addEventListener('click', () => {
      this.abrirModalNovaGaveta();
    });

    document.getElementById('btnNovaPasta')?.addEventListener('click', () => {
      this.abrirModalNovaPasta();
    });

    document.getElementById('btnNovoUsuario')?.addEventListener('click', () => {
      this.abrirModalNovoUsuario();
    });

    // ==========================================
    // BUSCA
    // ==========================================
    
    document.getElementById('searchPastas')?.addEventListener('input', (e) => {
      this.ui.renderPastas(e.target.value);
    });

    document.getElementById('searchMovimentacoes')?.addEventListener('input', (e) => {
      this.ui.renderMovimentacoes(e.target.value);
    });

    ['searchFuncionarioNome', 'searchFuncionarioMatricula'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        this.ui.renderSolicitacoes();
      });
    });

    // ==========================================
    // ATUALIZAÇÃO PERIÓDICA DE ALERTAS
    // ==========================================
    
    setInterval(async () => {
      try {
        await this.db.atualizarAlertas();
        if (this.ui.currentView === 'dashboard') {
          await this.ui.renderDashboard();
        }
      } catch (error) {
        console.warn('Erro na atualização periódica de alertas:', error);
      }
    }, 60000); // A cada minuto
  }

  closeModal() {
    this.ui.closeModal();
  }

  // ==========================================
  // AUTENTICAÇÃO
  // ==========================================

  /**
   * Processa login do usuário
   */
  async handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    try {
      const success = await this.auth.handleLogin(username, password);
      
      if (success) {
        await this.db.addLog(`Login bem-sucedido - ${username}`, this.auth.getUserId());
        this.ui.showMainScreen();
        this.ui.showToast('Login realizado com sucesso!', 'success');
      } else {
        errorMsg.textContent = 'Usuário ou senha inválidos';
        errorMsg.classList.add('show');
        setTimeout(() => errorMsg.classList.remove('show'), 3000);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      this.ui.showToast('Erro ao fazer login', 'error');
    }
  }

  /**
   * Processa logout do usuário
   */
  handleLogout() {
    const username = this.auth.getUsername();
    this.db.addLog(`Logout - ${username}`, this.auth.getUserId());
    this.auth.logout();
    this.ui.showLoginScreen();
    this.ui.showToast('Logout realizado com sucesso', 'success');
  }

  // ==========================================
  // SOLICITAÇÕES
  // ==========================================

  /**
   * Abre modal para criar solicitação
   */
  async abrirModalSolicitacao(funcionarioId) {
    const funcionario = await this.db.getFuncionarioById(funcionarioId);
    const pastas = await this.db.getPastas();
    const pasta = pastas.find(p => p.funcionario_id === funcionarioId && p.ativa && !p.arquivo_morto);

    if (!pasta) {
      this.ui.showToast('Este funcionário não possui pasta ativa para retirada.', 'warning');
      return;
    }

    const envelopes = await this.db.getEnvelopesByPasta(pasta.id);
    if (!envelopes.length) {
      this.ui.showToast('Nenhum envelope disponível para esta pasta.', 'warning');
      return;
    }

    const solicitacoesPendentes = await this.db.getSolicitacoesPendentes();
    const pendentesSet = new Set();
    solicitacoesPendentes
      .filter(sol => sol.pasta_id === pasta.id)
      .forEach(sol => {
        const itens = this.ui.parseEnvelopeList(sol.envelopes_solicitados);
        itens.forEach(tipo => pendentesSet.add(tipo));
      });

    const disponiveisSet = new Set(
      envelopes
        .filter(env => env.status === 'presente' && !pendentesSet.has(env.tipo))
        .map(env => env.tipo)
    );

    if (disponiveisSet.size === 0) {
      this.ui.showToast('Todos os envelopes desta pasta estão indisponíveis no momento.', 'warning');
      return;
    }

    const demissaoDisponivel = disponiveisSet.size === envelopes.length;

    this.currentSolicitacaoContext = {
      pastaId: pasta.id,
      envelopes,
      disponiveis: disponiveisSet
    };

    const envelopeOptionsHtml = envelopes.map(env => {
      const reservado = pendentesSet.has(env.tipo);
      const disponivel = env.status === 'presente' && !reservado;
      const disabledAttr = disponivel ? '' : 'disabled';
      let statusTag = '';
      if (!disponivel) {
        statusTag = env.status !== 'presente'
          ? '<span class="status status--warning">Retirado</span>'
          : '<span class="status status--pending">Reservado</span>';
      }
      return `
        <label>
          <input type="checkbox" name="envelopeSelecionado" value="${env.tipo}" data-disponivel="${disponivel}" ${disabledAttr}>
          ${this.ui.formatEnvelopeTipo(env.tipo)} ${statusTag}
        </label>
      `;
    }).join('');
    
    this.ui.openModal(`Solicitar Retirada - ${funcionario.nome}`, `
      <form id="formSolicitacao">
        <div class="form-group">
          <label>Funcionário</label>
          <input type="text" class="form-control" value="${funcionario.nome}" disabled>
        </div>
        <div class="form-group">
          <label>Setor</label>
          <input type="text" class="form-control" value="${funcionario.departamento}" disabled>
        </div>
        <div class="form-group">
          <label>Matrícula</label>
          <input type="text" class="form-control" value="${funcionario.matricula || 'Sem registro'}" disabled>
        </div>
        <div class="form-group">
          <label>Motivo da Retirada *</label>
          <textarea class="form-control" id="motivoSolicitacao" rows="3" placeholder="Ex: Auditoria ocupacional, revisão de documentos, etc." required></textarea>
        </div>
        <div class="form-group">
          <label>Tipo de Retirada *</label>
          <select class="form-control" id="tipoSolicitacao" onchange="app.onTipoSolicitacaoChange()" required>
            <option value="regular" selected>Consulta / Rotina</option>
            <option value="demissao" ${demissaoDisponivel ? '' : 'disabled'}>Demissão</option>
          </select>
          <div class="form-hint">
            ${demissaoDisponivel
              ? 'Quando "Demissão" for selecionado, a pasta completa irá direto para o arquivo morto.'
              : 'Demissão disponível apenas quando todos os envelopes estiverem presentes na pasta.'}
          </div>
        </div>
        <div class="form-group">
          <label>Quais envelopes deseja retirar?</label>
          <div class="checkbox-list">
            ${envelopeOptionsHtml}
          </div>
          <div class="form-hint">Selecione pelo menos um envelope para retirar.</div>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarSolicitacao(${funcionarioId}, ${pasta.id})">Enviar Solicitação</button>
    `);
  }

  /**
   * Salva solicitação de retirada
   */
  async salvarSolicitacao(funcionarioId, pastaId) {
    const motivo = document.getElementById('motivoSolicitacao').value;
    const tipoSolicitacao = document.getElementById('tipoSolicitacao').value;
    const checkboxes = Array.from(document.querySelectorAll('input[name="envelopeSelecionado"]:checked'));

    if (!motivo) {
      this.ui.showToast('Informe o motivo da solicitação', 'error');
      return;
    }

    let envelopesSelecionados = checkboxes.map(cb => cb.value);
    const context = this.currentSolicitacaoContext;
    if (tipoSolicitacao === 'demissao' && context?.envelopes) {
      envelopesSelecionados = context.envelopes.map(env => env.tipo);
    }

    envelopesSelecionados = Array.from(new Set(envelopesSelecionados));

    if (!envelopesSelecionados.length) {
      this.ui.showToast('Selecione pelo menos um envelope para retirar.', 'error');
      return;
    }

    const disponiveisSet = context?.disponiveis;
    if (!disponiveisSet) {
      this.ui.showToast('Não foi possível validar os envelopes disponíveis.', 'error');
      return;
    }

    const possuiIndisponivel = envelopesSelecionados.some(tipo => !disponiveisSet.has(tipo));
    if (possuiIndisponivel) {
      this.ui.showToast('Um dos envelopes selecionados já está reservado ou retirado.', 'warning');
      return;
    }

    const pastaAtivaId = pastaId || context?.pastaId;
    if (!pastaAtivaId) {
      this.ui.showToast('Não foi possível localizar a pasta do funcionário.', 'error');
      return;
    }

    try {
      const result = await this.db.createSolicitacao({
        usuario_id: this.auth.getUserId(),
        funcionario_id: funcionarioId,
        motivo: motivo,
        pasta_id: pastaAtivaId,
        envelopes: envelopesSelecionados,
        is_demissao: tipoSolicitacao === 'demissao'
      });

      if (result.success) {
        const funcionario = await this.db.getFuncionarioById(funcionarioId);
        await this.db.addLog(`Solicitação criada para arquivo de ${funcionario.nome}`, this.auth.getUserId());
        this.ui.closeModal();
        this.currentSolicitacaoContext = null;
        await this.ui.renderSolicitacoes();
        this.ui.showToast('Solicitação enviada! Aguarde aprovação do administrador.', 'success');
      } else {
        this.ui.showToast(result.message || 'Erro ao criar solicitação', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar solicitação:', error);
      this.ui.showToast('Erro ao criar solicitação', 'error');
    }
  }

  onTipoSolicitacaoChange() {
    const tipo = document.getElementById('tipoSolicitacao')?.value;
    const checkboxes = document.querySelectorAll('input[name="envelopeSelecionado"]');
    if (!checkboxes?.length) return;

    checkboxes.forEach(cb => {
      const disponivel = cb.getAttribute('data-disponivel') !== 'false';
      if (tipo === 'demissao') {
        cb.checked = true;
        cb.disabled = true;
      } else {
        cb.disabled = !disponivel;
        if (!disponivel) {
          cb.checked = false;
        }
      }
    });
  }

  /**
   * Aprova solicitação (admin)
   */
  async aprovarSolicitacao(solicitacaoId) {
    try {
      const result = await this.db.aprovarSolicitacao(solicitacaoId);
      
      if (result.success) {
        await this.db.addLog(`Solicitação ${solicitacaoId} aprovada`, this.auth.getUserId());
        await this.ui.renderAdmin();
        const mensagem = result.mode === 'demissao'
          ? 'Solicitação aprovada e pasta enviada ao arquivo morto!'
          : 'Solicitação aprovada e retirada registrada!';
        this.ui.showToast(mensagem, 'success');
      } else {
        this.ui.showToast(result.message || 'Erro ao aprovar solicitação', 'error');
      }
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      this.ui.showToast('Erro ao aprovar solicitação', 'error');
    }
  }

  abrirModalRejeitarSolicitacao(solicitacaoId) {
    this.ui.openModal('Rejeitar Solicitação', `
      <form id="formRejeicaoSolicitacao">
        <div class="form-group">
          <label>Motivo da rejeição (opcional)</label>
          <textarea class="form-control" id="motivoRejeicao" rows="3" placeholder="Descreva o motivo, se necessário."></textarea>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--danger" onclick="app.confirmarRejeicaoSolicitacao(${solicitacaoId})">Rejeitar</button>
    `);
  }

  async confirmarRejeicaoSolicitacao(solicitacaoId) {
    const motivo = document.getElementById('motivoRejeicao')?.value?.trim() || '';
    await this.rejeitarSolicitacao(solicitacaoId, motivo);
  }

  /**
   * Rejeita solicitação (admin)
   */
  async rejeitarSolicitacao(solicitacaoId, motivo = '') {
    try {
      const result = await this.db.rejeitarSolicitacao(solicitacaoId, motivo);
      
      if (result.success) {
        this.ui.closeModal();
        await this.db.addLog(`Solicitação ${solicitacaoId} rejeitada`, this.auth.getUserId());
        await this.ui.renderAdmin();
        this.ui.showToast('Solicitação rejeitada', 'success');
      } else {
        this.ui.showToast('Erro ao rejeitar solicitação', 'error');
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      this.ui.showToast('Erro ao rejeitar solicitação', 'error');
    }
  }

  // ==========================================
  // RETIRADAS
  // ==========================================

  /**
   * Devolve arquivo retirado
   */
  async devolverArquivo(retiradaId) {
    try {
      const retiradas = await this.db.getRetiradasByUsuario(this.auth.getUserId());
      const retirada = retiradas.find(r => r.id === retiradaId);
      const pasta = await this.db.getPastaById(retirada.pasta_id);
      
      if (confirm(`Confirmar devolução do arquivo de ${pasta.nome}?`)) {
        const result = await this.db.finalizarRetirada(retiradaId);
        
        if (result.success) {
          await this.db.addLog(`Arquivo devolvido: ${pasta.nome}`, this.auth.getUserId());
          await this.ui.renderMinhasRetiradas();
          this.ui.showToast('Arquivo devolvido com sucesso!', 'success');
        } else {
          this.ui.showToast(result.message || 'Erro ao devolver arquivo', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao devolver arquivo:', error);
      this.ui.showToast('Erro ao devolver arquivo', 'error');
    }
  }

  // ==========================================
  // GAVETEIROS E GAVETAS
  // ==========================================

  /**
   * Abre modal para criar gaveteiro
   */
  abrirModalNovoGaveteiro() {
    this.ui.openModal('Novo Gaveteiro', `
      <form id="formNovoGaveteiro">
        <div class="form-group">
          <label>Nome do Gaveteiro</label>
          <input type="text" class="form-control" id="nomeGaveteiro" required>
        </div>
        <div class="form-group">
          <label>Localização</label>
          <input type="text" class="form-control" id="localizacaoGaveteiro" required>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarGaveteiro()">Salvar</button>
    `);
  }

  /**
   * Salva novo gaveteiro
   */
  async salvarGaveteiro() {
    const nome = document.getElementById('nomeGaveteiro').value;
    const localizacao = document.getElementById('localizacaoGaveteiro').value;

    if (!nome || !localizacao) {
      this.ui.showToast('Preencha todos os campos', 'error');
      return;
    }

    try {
      const result = await this.db.addGaveteiro({ nome, localizacao });
      
      if (result.success) {
        await this.db.addLog(`Gaveteiro criado: ${nome}`, this.auth.getUserId());
        this.ui.closeModal();
        await this.ui.renderGavetas();
        this.ui.showToast('Gaveteiro criado com sucesso!', 'success');
      } else {
        this.ui.showToast('Erro ao criar gaveteiro', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar gaveteiro:', error);
      this.ui.showToast('Erro ao criar gaveteiro', 'error');
    }
  }

  /**
   * Abre modal para criar gaveta
   */
  async abrirModalNovaGaveta() {
    const gaveteiros = await this.db.getGaveteiros();
    let options = gaveteiros.map(g => 
      `<option value="${g.id}">${g.nome} - ${g.localizacao}</option>`
    ).join('');

    this.ui.openModal('Nova Gaveta', `
      <form id="formNovaGaveta">
        <div class="form-group">
          <label>Gaveteiro</label>
          <select class="form-control" id="gaveteiroSelect" required>
            <option value="">Selecione...</option>
            ${options}
          </select>
        </div>
        <div class="form-group">
          <label>Número da Gaveta</label>
          <input type="text" class="form-control" id="numeroGaveta" required>
        </div>
        <div class="form-group">
          <label>Capacidade (número de pastas)</label>
          <input type="number" class="form-control" id="capacidadeGaveta" value="50" required>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarGaveta()">Salvar</button>
    `);
  }

  /**
   * Salva nova gaveta
   */
  async salvarGaveta() {
    const gaveteiro_id = parseInt(document.getElementById('gaveteiroSelect').value);
    const numero = document.getElementById('numeroGaveta').value;
    const capacidade = parseInt(document.getElementById('capacidadeGaveta').value);

    if (!gaveteiro_id || !numero || !capacidade) {
      this.ui.showToast('Preencha todos os campos', 'error');
      return;
    }

    try {
      const result = await this.db.addGaveta({
        gaveteiro_id,
        numero,
        capacidade,
        ocupacao_atual: 0
      });
      
      if (result.success) {
        await this.db.addLog(`Gaveta criada: ${numero}`, this.auth.getUserId());
        this.ui.closeModal();
        await this.ui.renderGavetas();
        this.ui.showToast('Gaveta criada com sucesso!', 'success');
      } else {
        this.ui.showToast('Erro ao criar gaveta', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar gaveta:', error);
      this.ui.showToast('Erro ao criar gaveta', 'error');
    }
  }

  /**
   * Edita gaveteiro
   */
  editarGaveteiro(gaveteiro_id) {
    this.ui.showToast('Funcionalidade de edição em desenvolvimento', 'info');
  }

  /**
   * Ver detalhes da gaveta
   */
  verDetalhesGaveta(gaveta_id) {
    this.ui.showToast('Ver detalhes da gaveta - em desenvolvimento', 'info');
  }

  // ==========================================
  // PASTAS
  // ==========================================

  /**
   * Abre modal para criar pasta
   */
  async abrirModalNovaPasta() {
    const gaveteiros = await this.db.getGaveteiros();
    const gavetas = await this.db.getGavetas();
    
    let options = '';
    gaveteiros.forEach(gaveteiro => {
      const gavetasDoGaveteiro = gavetas.filter(g => g.gaveteiro_id === gaveteiro.id);
      gavetasDoGaveteiro.forEach(gaveta => {
        const espacoDisponivel = gaveta.capacidade - gaveta.ocupacao_atual;
        if (espacoDisponivel > 0) {
          options += `<option value="${gaveta.id}">${gaveteiro.nome} - Gaveta ${gaveta.numero} (${espacoDisponivel} vagas)</option>`;
        }
      });
    });

    if (!options) {
      options = '<option value="">Nenhuma gaveta com espaço disponível</option>';
    }

    this.ui.openModal('Nova Pasta', `
      <form id="formNovaPasta">
        <div class="form-group">
          <label>Gaveta</label>
          <select class="form-control" id="gavetaSelect" required>
            <option value="">Selecione...</option>
            ${options}
          </select>
        </div>
        <div class="form-group">
          <label>Nome do Funcionário</label>
          <input type="text" class="form-control" id="nomePasta" placeholder="Ex: Maria Silva" required>
        </div>
        <div class="form-group">
          <label>Matrícula</label>
          <input type="text" class="form-control" id="matriculaPasta" placeholder="Ex: 123456" required>
        </div>
        <div class="form-group">
          <label>Setor</label>
          <input type="text" class="form-control" id="setorPasta" placeholder="Ex: Recursos Humanos" required>
        </div>
        <div class="form-group">
          <label>Data de Admissão</label>
          <input type="date" class="form-control" id="dataAdmissaoPasta" value="${this.ui.getCurrentDate()}" required>
        </div>
        <div class="alert alert-info" style="margin-top: 16px;">
          <strong>Info:</strong> Serão criados automaticamente 4 envelopes: Segurança, Medicina do Trabalho, Pessoal e Treinamento.
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarPasta()">Salvar</button>
    `);
  }

  /**
   * Salva nova pasta
   */
  async salvarPasta() {
    const gaveta_id = parseInt(document.getElementById('gavetaSelect').value);
    const nome = document.getElementById('nomePasta').value?.trim();
    const matricula = document.getElementById('matriculaPasta').value?.trim()?.toUpperCase();
    const setor = document.getElementById('setorPasta').value?.trim();
    const dataAdmissao = document.getElementById('dataAdmissaoPasta').value;

    if (!gaveta_id || !nome || !matricula || !setor || !dataAdmissao) {
      this.ui.showToast('Preencha todos os campos', 'error');
      return;
    }

    try {
      const pastasExistentes = await this.db.getPastas();
      const pastaDoFuncionario = pastasExistentes.find(p => {
        if (p.funcionario_matricula && p.funcionario_matricula.toUpperCase() === matricula) {
          return true;
        }
        return p.nome.toLowerCase() === nome.toLowerCase();
      });
      if (pastaDoFuncionario) {
        this.ui.showToast('Já existe uma pasta ativa para este funcionário.', 'warning');
        return;
      }

      const result = await this.db.addPasta({
        gaveta_id,
        nome,
        funcionario_nome: nome,
        funcionario_matricula: matricula,
        funcionario_setor: setor,
        funcionario_data_admissao: dataAdmissao,
        data_criacao: this.ui.getCurrentDate()
      });
      
      if (result.success) {
        await this.db.addLog(`Pasta criada: ${nome}`, this.auth.getUserId());
        this.ui.closeModal();
        await this.ui.renderPastas();
        this.ui.showToast('Pasta criada com sucesso!', 'success');
      } else {
        this.ui.showToast(result.message || 'Erro ao criar pasta', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar pasta:', error);
      this.ui.showToast('Erro ao criar pasta', 'error');
    }
  }

  /**
   * Ver envelopes de uma pasta
   */
  async verEnvelopesPasta(pastaId) {
    const pasta = await this.db.getPastaById(pastaId);
    const envelopes = await this.db.getEnvelopesByPasta(pastaId);
    const gavetas = await this.db.getGavetas();
    const gaveta = gavetas.find(g => g.id === pasta.gaveta_id);
    const gaveteiros = await this.db.getGaveteiros();
    const gaveteiro = gaveteiros.find(gt => gt.id === gaveta?.gaveteiro_id);

    let html = `
      <div style="margin-bottom: 16px;">
        <strong>Pasta:</strong> ${pasta.nome}<br>
        <strong>Funcionário:</strong> ${pasta.funcionario_nome || pasta.nome}<br>
        <strong>Matrícula:</strong> ${pasta.funcionario_matricula || 'N/A'}<br>
        <strong>Setor:</strong> ${pasta.funcionario_departamento || 'N/A'}<br>
        <strong>Admissão:</strong> ${this.ui.formatarData(pasta.funcionario_data_admissao)}<br>
        <strong>Localização:</strong> ${gaveteiro?.nome} - Gaveta ${gaveta?.numero}<br>
        <strong>Local:</strong> ${gaveteiro?.localizacao}
      </div>
      <div class="envelopes-grid">
    `;

    envelopes.forEach(env => {
      const statusClass = env.status === 'presente' ? 'status--success' : 'status--warning';
      const statusTexto = env.status === 'presente' ? 'Presente' : 'Retirado';
      const btnTexto = env.status === 'presente' ? 'Registrar Saída' : 'Registrar Entrada';
      const btnAction = env.status === 'presente' ? 'saida' : 'entrada';
      const envelopeLabel = this.ui.formatEnvelopeTipo(env.tipo);

      html += `
        <div class="envelope-item">
          <div class="envelope-tipo">${envelopeLabel}</div>
          <span class="status ${statusClass}">${statusTexto}</span>
          <div class="envelope-actions">
            <button class="btn btn--primary" onclick="app.registrarMovimentacao(${env.id}, '${btnAction}')">
              ${btnTexto}
            </button>
          </div>
        </div>
      `;
    });

    html += '</div>';

    this.ui.openModal(`Envelopes - ${pasta.nome}`, html, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Fechar</button>
    `);
  }

  /**
   * Registra movimentação de envelope
   */
  registrarMovimentacao(envelopeId, acao) {
    const envelope = { id: envelopeId };
    
    this.ui.openModal(`Registrar ${acao === 'saida' ? 'Saída' : 'Entrada'}`, `
      <form id="formMovimentacao">
        <div class="form-group">
          <label>Motivo</label>
          <textarea class="form-control" id="motivoMovimentacao" rows="3" required></textarea>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarMovimentacao(${envelopeId}, '${acao}')">
        Confirmar
      </button>
    `);
  }

  /**
   * Salva movimentação de envelope
   */
  async salvarMovimentacao(envelopeId, acao) {
    const motivo = document.getElementById('motivoMovimentacao').value;

    if (!motivo) {
      this.ui.showToast('Informe o motivo da movimentação', 'error');
      return;
    }

    try {
      const novoStatus = acao === 'saida' ? 'retirado' : 'presente';
      await this.db.updateEnvelopeStatus(envelopeId, novoStatus);
      
      await this.db.registrarMovimentacao({
        item_id: envelopeId,
        tipo_item: 'envelope',
        acao,
        usuario_id: this.auth.getUserId(),
        motivo
      });

      await this.db.addLog(`Movimentação registrada - ${acao} - Envelope ID: ${envelopeId}`, this.auth.getUserId());
      this.ui.closeModal();
      this.ui.showToast(`${acao === 'saida' ? 'Saída' : 'Entrada'} registrada com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
      this.ui.showToast('Erro ao registrar movimentação', 'error');
    }
  }

  /**
   * Arquiva pasta
   */
  async arquivarPasta(pastaId) {
    if (confirm('Deseja realmente arquivar esta pasta?')) {
      try {
        const pasta = await this.db.getPastaById(pastaId);
        const result = await this.db.arquivarPasta(pastaId);
        
        if (result.success) {
          await this.db.addLog(`Pasta arquivada: ${pasta.nome}`, this.auth.getUserId());
          await this.ui.renderPastas();
          this.ui.showToast('Pasta arquivada com sucesso!', 'success');
        } else {
          this.ui.showToast('Erro ao arquivar pasta', 'error');
        }
      } catch (error) {
        console.error('Erro ao arquivar pasta:', error);
        this.ui.showToast('Erro ao arquivar pasta', 'error');
      }
    }
  }

  // ==========================================
  // USUÁRIOS (ADMIN)
  // ==========================================

  /**
   * Abre modal para criar usuário
   */
  async abrirModalNovoUsuario() {
    await this.renderizarFormularioUsuario(null);
  }

  /**
   * Renderiza formulário de usuário com permissões de menu
   */
  async renderizarFormularioUsuario(usuarioId) {
    const menus = await this.carregarMenusDisponiveis();
    let menusSelecionados = [];
    let usuario = null;
    const perfis = await this.db.getPerfis();

    if (usuarioId) {
      // Edição - carregar dados do usuário
      const usuarios = await this.db.getUsuarios();
      usuario = usuarios.find(u => u.id === usuarioId);
      menusSelecionados = await this.carregarMenusUsuario(usuarioId);
    }

    const checkboxesHtml = this.renderizarCheckboxesMenus(menus, menusSelecionados);
    const titulo = usuarioId ? 'Editar Usuário' : 'Novo Usuário';
    const perfisOptions = perfis.map(perfil => `
        <option value="${perfil.id}" ${usuario?.perfil_id === perfil.id ? 'selected' : ''}>${perfil.nome}</option>
      `).join('');

    this.ui.openModal(titulo, `
      <form id="formNovoUsuario">
        <div class="form-group">
          <label>Usuário *</label>
          <input type="text" class="form-control" id="novoUsername" value="${usuario?.username || ''}" required ${usuarioId ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label>Senha ${usuarioId ? '(deixe em branco para manter a atual)' : '*'} </label>
          <input type="password" class="form-control" id="novaSenha" ${usuarioId ? '' : 'required'}>
        </div>
        <div class="form-group">
          <label>Perfil *</label>
          <select class="form-control" id="novoPerfil" required>
            <option value="">Selecione...</option>
            ${perfisOptions}
          </select>
        </div>
        
        <div class="form-group" style="margin-top: 24px;">
          <label style="font-weight: 600; font-size: 16px; margin-bottom: 12px; display: block;">Permissões de Acesso a Menus *</label>
          <div class="alert alert-info" style="margin-bottom: 16px;">
            <strong>Info:</strong> Selecione ao menos um menu que o usuário poderá acessar.
          </div>
          <div class="menus-checkbox-grid">
            ${checkboxesHtml}
          </div>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarUsuario(${usuarioId || 'null'})">Salvar</button>
    `);
  }

  /**
   * Carrega menus disponíveis do sistema - CORRIGIDO
            <option value="demissao" ${demissaoDisponivel ? '' : 'disabled'}>Demissão</option>
  async carregarMenusDisponiveis() {
    try {
      return await this.db.getMenus();
    } catch (error) {
      console.error('Erro ao carregar menus:', error);
      return [];
    }
  }

  /**
   * Carrega menus que o usuário tem acesso - CORRIGIDO
   */
  async carregarMenusUsuario(usuarioId) {
    try {
      const menusData = await this.db.getMenusByUsuario(usuarioId);
      return menusData.map(m => m.id || m.menu_id);
    } catch (error) {
      console.error('Erro ao carregar menus do usuário:', error);
      return [];
    }
  }

  /**
   * Renderiza checkboxes de menus
   */
  renderizarCheckboxesMenus(menus, menusSelecionados) {
    if (!menus || menus.length === 0) {
      return '<p style="color: var(--color-text-secondary);">Nenhum menu disponível</p>';
    }

    return menus.map(menu => {
      const checked = menusSelecionados.includes(menu.id) ? 'checked' : '';
      return `
        <label class="menu-checkbox-item">
          <input type="checkbox" name="menus" value="${menu.id}" ${checked}>
          <span class="menu-checkbox-label">
            <strong>${menu.nome}</strong>
            ${menu.descricao ? `<small>${menu.descricao}</small>` : ''}
          </span>
        </label>
      `;
    }).join('');
  }

  /**
   * Salva novo usuário ou atualiza existente
   */
  async salvarUsuario(usuarioId = null) {
    const username = document.getElementById('novoUsername').value;
    const senha = document.getElementById('novaSenha').value;
    const perfilValue = document.getElementById('novoPerfil').value;
    const perfilId = perfilValue ? parseInt(perfilValue, 10) : null;

    // Coletar menus selecionados
    const checkboxes = document.querySelectorAll('input[name="menus"]:checked');
    const menusSelecionados = Array.from(checkboxes).map(cb => parseInt(cb.value, 10));

    // Validações
    if (!username || !perfilId) {
      this.ui.showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    if (!usuarioId && !senha) {
      this.ui.showToast('Informe uma senha para o novo usuário', 'error');
      return;
    }

    if (menusSelecionados.length === 0) {
      this.ui.showToast('Selecione ao menos um menu', 'error');
      return;
    }

    try {
      let result;
      
      if (usuarioId) {
        // Atualizar usuário existente
        const updateData = {
          username,
          perfil_id: perfilId,
          funcionario_id: null
        };
        if (senha) {
          await this.db.updateUsuarioSenha(usuarioId, senha);
        }
        result = await this.db.updateUsuario(usuarioId, updateData);
      } else {
        // Criar novo usuário
        result = await this.db.addUsuario({ username, senha, perfil_id: perfilId });
      }
      
      if (result.success) {
        const userId = usuarioId || result.lastInsertRowid;
        
        // Atualizar permissões de menu
        const menusResult = await this.db.atualizarMenusUsuario(userId, menusSelecionados);
        
        if (menusResult.success) {
          await this.db.addLog(`Usuário ${usuarioId ? 'atualizado' : 'criado'}: ${username}`, this.auth.getUserId());
          this.ui.closeModal();
          await this.ui.renderAdmin();
          this.ui.showToast(`Usuário ${usuarioId ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        } else {
          this.ui.showToast('Erro ao configurar permissões de menu', 'error');
        }
      } else {
        this.ui.showToast(`Erro ao ${usuarioId ? 'atualizar' : 'criar'} usuário`, 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      this.ui.showToast(`Erro ao ${usuarioId ? 'atualizar' : 'criar'} usuário`, 'error');
    }
  }

  /**
   * Ativa/desativa usuário
   */
  async toggleUsuarioStatus(userId) {
    try {
      const usuarios = await this.db.getUsuarios();
      const user = usuarios.find(u => u.id === userId);
      const result = await this.db.toggleUsuarioStatus(userId, !user.ativo);
      
      if (result.success) {
        await this.db.addLog(`Usuário ${!user.ativo ? 'ativado' : 'desativado'}: ${user.username}`, this.auth.getUserId());
        await this.ui.renderAdmin();
        this.ui.showToast(`Usuário ${!user.ativo ? 'ativado' : 'desativado'}!`, 'success');
      } else {
        this.ui.showToast('Erro ao alterar status do usuário', 'error');
      }
    } catch (error) {
      console.error('Erro ao toggle status usuário:', error);
      this.ui.showToast('Erro ao alterar status do usuário', 'error');
    }
  }

  /**
   * Edita usuário
   */
  async editarUsuario(userId) {
    await this.renderizarFormularioUsuario(userId);
  }

  // ==========================================
  // RELATÓRIOS
  // ==========================================

  /**
   * Gera relatório de inventário
   */
  async gerarRelatorioInventario() {
    this.ui.showToast('Relatório de inventário - em desenvolvimento', 'info');
  }

  /**
   * Gera relatório de ocupação
   */
  async gerarRelatorioOcupacao() {
    this.ui.showToast('Relatório de ocupação - em desenvolvimento', 'info');
  }

  /**
   * Gera relatório de movimentações
   */
  async gerarRelatorioMovimentacoes() {
    this.ui.showToast('Relatório de movimentações - em desenvolvimento', 'info');
  }

  /**
   * Gera relatório de logs
   */
  async gerarRelatorioLogs() {
    this.ui.showToast('Relatório de logs - em desenvolvimento', 'info');
  }
}

// ==========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================

// Variável global da aplicação
let app;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  app = new HospitalFileManagementApp();
  app.init();
});
