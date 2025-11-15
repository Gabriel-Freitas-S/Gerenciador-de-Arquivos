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
    
    console.log('🏥 Sistema de Gerenciamento de Arquivos Hospital - Inicializando...');
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

    document.getElementById('btnNovoFuncionario')?.addEventListener('click', () => {
      this.abrirModalNovoFuncionario();
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

    document.getElementById('searchFuncionarios')?.addEventListener('input', (e) => {
      this.ui.renderSolicitacoes(e.target.value);
    });

    // ==========================================
    // ATUALIZAÇÃO PERIÓDICA DE ALERTAS
    // ==========================================
    
    setInterval(async () => {
      await this.db.atualizarAlertas();
      if (this.ui.currentView === 'dashboard') {
        await this.ui.renderDashboard();
      }
    }, 60000); // A cada minuto
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
    
    this.ui.openModal(`Solicitar Retirada - ${funcionario.nome}`, `
      <form id="formSolicitacao">
        <div class="form-group">
          <label>Funcionário</label>
          <input type="text" class="form-control" value="${funcionario.nome}" disabled>
        </div>
        <div class="form-group">
          <label>Departamento</label>
          <input type="text" class="form-control" value="${funcionario.departamento}" disabled>
        </div>
        <div class="form-group">
          <label>Motivo da Retirada *</label>
          <textarea class="form-control" id="motivoSolicitacao" rows="3" placeholder="Ex: Auditoria ocupacional, revisão de documentos, etc." required></textarea>
        </div>
        <div class="form-group">
          <label>Data Necessária</label>
          <input type="date" class="form-control" id="dataNecessaria" value="${this.ui.getCurrentDate()}">
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarSolicitacao(${funcionarioId})">Enviar Solicitação</button>
    `);
  }

  /**
   * Salva solicitação de retirada
   */
  async salvarSolicitacao(funcionarioId) {
    const motivo = document.getElementById('motivoSolicitacao').value;

    if (!motivo) {
      this.ui.showToast('Informe o motivo da solicitação', 'error');
      return;
    }

    try {
      const result = await this.db.createSolicitacao({
        usuario_id: this.auth.getUserId(),
        funcionario_id: funcionarioId,
        motivo: motivo
      });

      if (result.success) {
        const funcionario = await this.db.getFuncionarioById(funcionarioId);
        await this.db.addLog(`Solicitação criada para arquivo de ${funcionario.nome}`, this.auth.getUserId());
        this.ui.closeModal();
        await this.ui.renderSolicitacoes();
        this.ui.showToast('Solicitação enviada! Aguarde aprovação do administrador.', 'success');
      } else {
        this.ui.showToast('Erro ao criar solicitação', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar solicitação:', error);
      this.ui.showToast('Erro ao criar solicitação', 'error');
    }
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
        this.ui.showToast('Solicitação aprovada e arquivo registrado como retirado!', 'success');
      } else {
        this.ui.showToast('Erro ao aprovar solicitação', 'error');
      }
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      this.ui.showToast('Erro ao aprovar solicitação', 'error');
    }
  }

  /**
   * Rejeita solicitação (admin)
   */
  async rejeitarSolicitacao(solicitacaoId) {
    const motivo = prompt('Motivo da rejeição (opcional):');
    
    try {
      const result = await this.db.rejeitarSolicitacao(solicitacaoId, motivo);
      
      if (result.success) {
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
          this.ui.showToast('Erro ao devolver arquivo', 'error');
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
          <label>Nome da Pasta (ex: nome do funcionário)</label>
          <input type="text" class="form-control" id="nomePasta" required>
        </div>
        <div class="alert alert-info" style="margin-top: 16px;">
          <strong>Info:</strong> Serão criados automaticamente 4 envelopes: Segurança, Medicina, Pessoal e Treinamento.
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
    const nome = document.getElementById('nomePasta').value;

    if (!gaveta_id || !nome) {
      this.ui.showToast('Preencha todos os campos', 'error');
      return;
    }

    try {
      const result = await this.db.addPasta({
        gaveta_id,
        nome,
        data_criacao: this.ui.getCurrentDate()
      });
      
      if (result.success) {
        await this.db.addLog(`Pasta criada: ${nome}`, this.auth.getUserId());
        this.ui.closeModal();
        await this.ui.renderPastas();
        this.ui.showToast('Pasta criada com sucesso!', 'success');
      } else {
        this.ui.showToast('Erro ao criar pasta', 'error');
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

      html += `
        <div class="envelope-item">
          <div class="envelope-tipo">${env.tipo}</div>
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
  // FUNCIONÁRIOS (ADMIN)
  // ==========================================

  /**
   * Abre modal para criar funcionário
   */
  abrirModalNovoFuncionario() {
    this.ui.openModal('Novo Funcionário', `
      <form id="formNovoFuncionario">
        <div class="form-group">
          <label>Nome Completo *</label>
          <input type="text" class="form-control" id="nomeFuncionario" required>
        </div>
        <div class="form-group">
          <label>Departamento *</label>
          <input type="text" class="form-control" id="departamentoFuncionario" required>
        </div>
        <div class="form-group">
          <label>Data de Admissão *</label>
          <input type="date" class="form-control" id="dataAdmissao" required>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarFuncionario()">Salvar</button>
    `);
  }

  /**
   * Salva novo funcionário
   */
  async salvarFuncionario() {
    const nome = document.getElementById('nomeFuncionario').value;
    const departamento = document.getElementById('departamentoFuncionario').value;
    const dataAdmissao = document.getElementById('dataAdmissao').value;

    if (!nome || !departamento || !dataAdmissao) {
      this.ui.showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      const result = await this.db.addFuncionario({
        nome,
        departamento,
        data_admissao: dataAdmissao,
        status: 'Ativo'
      });
      
      if (result.success) {
        await this.db.addLog(`Funcionário cadastrado: ${nome}`, this.auth.getUserId());
        this.ui.closeModal();
        await this.ui.renderAdmin();
        this.ui.showToast('Funcionário cadastrado com sucesso!', 'success');
      } else {
        this.ui.showToast('Erro ao cadastrar funcionário', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      this.ui.showToast('Erro ao cadastrar funcionário', 'error');
    }
  }

  /**
   * Demite funcionário
   */
  async demitirFuncionario(funcionarioId) {
    const dataDemissao = prompt('Data de demissão (AAAA-MM-DD):');
    
    if (!dataDemissao) return;

    try {
      const funcionario = await this.db.getFuncionarioById(funcionarioId);
      const result = await this.db.demitirFuncionario(funcionarioId, dataDemissao);
      
      if (result.success) {
        await this.db.addLog(`Funcionário demitido: ${funcionario.nome}`, this.auth.getUserId());
        await this.ui.renderAdmin();
        this.ui.showToast('Status atualizado para Demitido', 'success');
      } else {
        this.ui.showToast('Erro ao demitir funcionário', 'error');
      }
    } catch (error) {
      console.error('Erro ao demitir funcionário:', error);
      this.ui.showToast('Erro ao demitir funcionário', 'error');
    }
  }

  /**
   * Edita funcionário
   */
  editarFuncionario(funcionarioId) {
    this.ui.showToast('Funcionalidade de edição em desenvolvimento', 'info');
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

    if (usuarioId) {
      // Edição - carregar dados do usuário
      const usuarios = await this.db.getUsuarios();
      usuario = usuarios.find(u => u.id === usuarioId);
      menusSelecionados = await this.carregarMenusUsuario(usuarioId);
    }

    const checkboxesHtml = this.renderizarCheckboxesMenus(menus, menusSelecionados);
    const titulo = usuarioId ? 'Editar Usuário' : 'Novo Usuário';

    this.ui.openModal(titulo, `
      <form id="formNovoUsuario">
        <div class="form-group">
          <label>Usuário *</label>
          <input type="text" class="form-control" id="novoUsername" value="${usuario?.username || ''}" required ${usuarioId ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label>Senha ${usuarioId ? '(deixe em branco para manter a atual)' : '*'}</label>
          <input type="password" class="form-control" id="novaSenha" ${usuarioId ? '' : 'required'}>
        </div>
        <div class="form-group">
          <label>Perfil *</label>
          <select class="form-control" id="novoPerfil" required>
            <option value="Usuário Operacional" ${usuario?.perfil === 'Usuário Operacional' ? 'selected' : ''}>Usuário Operacional</option>
            <option value="Administrador" ${usuario?.perfil === 'Administrador' ? 'selected' : ''}>Administrador</option>
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
   * Carrega menus disponíveis do sistema
   */
  async carregarMenusDisponiveis() {
    try {
      const menus = await window.electronAPI.menusListar();
      return menus;
    } catch (error) {
      console.error('Erro ao carregar menus:', error);
      return [];
    }
  }

  /**
   * Carrega menus que o usuário tem acesso
   */
  async carregarMenusUsuario(usuarioId) {
    try {
      const menusUsuario = await window.electronAPI.usuariosMenus(usuarioId);
      return menusUsuario.map(m => m.menu_id);
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
    const perfil = document.getElementById('novoPerfil').value;

    // Coletar menus selecionados
    const checkboxes = document.querySelectorAll('input[name="menus"]:checked');
    const menusSelecionados = Array.from(checkboxes).map(cb => parseInt(cb.value));

    // Validações
    if (!username || !perfil) {
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
        const updateData = { perfil };
        if (senha) {
          updateData.senha = senha;
        }
        result = await this.db.updateUsuario(usuarioId, updateData);
      } else {
        // Criar novo usuário
        result = await this.db.addUsuario({ username, senha, perfil });
      }
      
      if (result.success) {
        const userId = usuarioId || result.id;
        
        // Atualizar permissões de menu
        const menusResult = await window.electronAPI.usuariosAtualizarMenus(userId, menusSelecionados);
        
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