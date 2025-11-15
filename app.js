/**
 * Sistema de Gerenciamento de Arquivos Físicos - Hospital
 * Aplicação Electron simulada para ambiente web
 * 
 * NOTA: Esta é uma versão demo que simula Electron em navegador.
 * Para produção real com Electron:
 * 1. npm install electron sqlite3 bcrypt jsonwebtoken
 * 2. Criar main.js, preload.js com IPC channels
 * 3. Integrar SQLite real com @journeyapps/sqlcipher
 * 4. Implementar bcrypt para hash de senhas
 * 5. Empacotar com electron-builder
 */

class HospitalFileManagementApp {
  constructor() {
    // Simulação de banco de dados em memória
    this.db = {
      funcionarios: [
        { id: 1, nome: 'João Silva', cpf: '123.456.789-00', departamento: 'RH', data_admissao: '2020-01-15', data_demissao: null, status: 'Ativo' },
        { id: 2, nome: 'Maria Santos', cpf: '987.654.321-00', departamento: 'Segurança Ocupacional', data_admissao: '2019-06-01', data_demissao: '2024-10-30', status: 'Demitido' },
        { id: 3, nome: 'Pedro Oliveira', cpf: '456.123.789-00', departamento: 'RH', data_admissao: '2021-03-10', data_demissao: null, status: 'Ativo' },
        { id: 4, nome: 'Ana Costa', cpf: '789.456.123-00', departamento: 'Medicina Ocupacional', data_admissao: '2018-11-20', data_demissao: null, status: 'Ativo' }
      ],
      solicitacoes: [
        { id: 1, usuario_id: 2, funcionario_id: 1, motivo: 'Auditoria de segurança ocupacional', data_solicitacao: '2025-11-15 08:30', status: 'aprovada', data_aprovacao: '2025-11-15 09:00' },
        { id: 2, usuario_id: 3, funcionario_id: 4, motivo: 'Revisão para recertificação', data_solicitacao: '2025-11-15 09:00', status: 'pendente', data_aprovacao: null }
      ],
      retiradas_com_pessoas: [
        { id: 1, pasta_id: 1, usuario_id: 2, funcionario_id: 1, data_retirada: '2025-11-15 10:00', data_prevista_retorno: '2025-11-22 10:00', data_retorno: null, status: 'ativo', dias_decorridos: 0 },
        { id: 2, pasta_id: 2, usuario_id: 2, funcionario_id: 2, data_retirada: '2025-11-08 09:00', data_prevista_retorno: '2025-11-15 09:00', data_retorno: null, status: 'vencido', dias_decorridos: 7 }
      ],
      alertas: [
        { id: 1, retirada_id: 2, tipo_alerta: '7_dias_vencido', severidade: 'crítico', data_criacao: '2025-11-15 12:00', resolvido: false }
      ],
      usuarios: [
        { id: 1, username: 'admin', senha: 'admin123', perfil: 'Administrador', funcionario_id: null, ativo: true },
        { id: 2, username: 'usuario1', senha: 'senha123', perfil: 'Usuário Operacional', funcionario_id: 1, ativo: true },
        { id: 3, username: 'usuario2', senha: 'senha123', perfil: 'Usuário Operacional', funcionario_id: 3, ativo: true },
        { id: 4, username: 'usuario3', senha: 'senha123', perfil: 'Usuário Operacional', funcionario_id: 4, ativo: true }
      ],
      gaveteiros: [
        { id: 1, nome: 'Gaveteiro A', localizacao: '2º Andar - Sala RH' },
        { id: 2, nome: 'Gaveteiro B', localizacao: '2º Andar - Corredor' }
      ],
      gavetas: [
        { id: 1, gaveteiro_id: 1, numero: '001', capacidade: 50, ocupacao_atual: 35 },
        { id: 2, gaveteiro_id: 1, numero: '002', capacidade: 50, ocupacao_atual: 48 },
        { id: 3, gaveteiro_id: 2, numero: '001', capacidade: 50, ocupacao_atual: 20 }
      ],
      pastas: [
        { id: 1, gaveta_id: 1, funcionario_id: 1, nome: 'João Silva', data_criacao: '2025-11-01', ativa: true, arquivo_morto: false },
        { id: 2, gaveta_id: 1, funcionario_id: 2, nome: 'Maria Santos', data_criacao: '2025-11-05', ativa: true, arquivo_morto: false },
        { id: 3, gaveta_id: 2, funcionario_id: 3, nome: 'Pedro Oliveira', data_criacao: '2025-10-15', ativa: true, arquivo_morto: false },
        { id: 4, gaveta_id: 2, funcionario_id: 4, nome: 'Ana Costa', data_criacao: '2025-10-10', ativa: true, arquivo_morto: false }
      ],
      envelopes: [
        { id: 1, pasta_id: 1, tipo: 'Segurança', status: 'presente' },
        { id: 2, pasta_id: 1, tipo: 'Medicina', status: 'presente' },
        { id: 3, pasta_id: 1, tipo: 'Pessoal', status: 'retirado' },
        { id: 4, pasta_id: 1, tipo: 'Treinamento', status: 'presente' },
        { id: 5, pasta_id: 2, tipo: 'Segurança', status: 'presente' },
        { id: 6, pasta_id: 2, tipo: 'Medicina', status: 'presente' },
        { id: 7, pasta_id: 2, tipo: 'Pessoal', status: 'presente' },
        { id: 8, pasta_id: 2, tipo: 'Treinamento', status: 'presente' },
        { id: 9, pasta_id: 3, tipo: 'Segurança', status: 'presente' },
        { id: 10, pasta_id: 3, tipo: 'Medicina', status: 'presente' },
        { id: 11, pasta_id: 3, tipo: 'Pessoal', status: 'presente' },
        { id: 12, pasta_id: 3, tipo: 'Treinamento', status: 'presente' }
      ],
      movimentacoes: [
        {
          id: 1,
          item_id: 3,
          tipo_item: 'envelope',
          acao: 'saida',
          usuario_id: 2,
          data: '2025-11-15 09:30',
          motivo: 'Consulta para auditoria de segurança'
        }
      ],
      logs: [
        { id: 1, acao: 'Sistema iniciado', usuario_id: null, timestamp: this.getCurrentTimestamp() }
      ]
    };

    this.currentUser = null;
    this.currentView = 'dashboard';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadFromStorage();
  }

  setupEventListeners() {
    // Login
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.handleLogout();
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.navigateToView(view);
      });
    });

    // Botões de ação
    document.getElementById('btnNovoGaveteiro')?.addEventListener('click', () => this.abrirModalNovoGaveteiro());
    document.getElementById('btnNovaGaveta')?.addEventListener('click', () => this.abrirModalNovaGaveta());
    document.getElementById('btnNovaPasta')?.addEventListener('click', () => this.abrirModalNovaPasta());
    document.getElementById('btnNovoUsuario')?.addEventListener('click', () => this.abrirModalNovoUsuario());

    // Busca
    document.getElementById('searchPastas')?.addEventListener('input', (e) => {
      this.buscarPastas(e.target.value);
    });

    document.getElementById('searchMovimentacoes')?.addEventListener('input', (e) => {
      this.buscarMovimentacoes(e.target.value);
    });

    document.getElementById('searchFuncionarios')?.addEventListener('input', (e) => {
      this.buscarFuncionarios(e.target.value);
    });

    document.getElementById('btnNovoFuncionario')?.addEventListener('click', () => this.abrirModalNovoFuncionario());

    // Atualizar alertas periodicamente
    setInterval(() => {
      this.atualizarAlertas();
      if (this.currentView === 'dashboard') {
        this.renderDashboard();
      }
    }, 60000); // A cada minuto
  }

  // Autenticação
  handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    const user = this.db.usuarios.find(u => u.username === username && u.senha === password && u.ativo);

    if (user) {
      this.currentUser = { id: user.id, username: user.username, perfil: user.perfil };
      this.addLog(`Login bem-sucedido - ${user.username}`, user.id);
      this.showMainScreen();
      this.showToast('Login realizado com sucesso!', 'success');
    } else {
      errorMsg.textContent = 'Usuário ou senha inválidos';
      errorMsg.classList.add('show');
      setTimeout(() => errorMsg.classList.remove('show'), 3000);
    }
  }

  handleLogout() {
    this.addLog(`Logout - ${this.currentUser.username}`, this.currentUser.id);
    this.currentUser = null;
    this.showLoginScreen();
    this.showToast('Logout realizado com sucesso', 'success');
  }

  showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  }

  showMainScreen() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
    
    // Atualizar info do usuário
    document.getElementById('currentUserName').textContent = this.currentUser.username;
    document.getElementById('currentUserRole').textContent = this.currentUser.perfil;

    // Mostrar/esconder menu admin
    const adminItems = document.querySelectorAll('.admin-only');
    adminItems.forEach(item => {
      item.style.display = this.currentUser.perfil === 'Administrador' ? 'flex' : 'none';
    });

    this.navigateToView('dashboard');
  }

  // Navegação
  navigateToView(view) {
    // Verificar permissão
    if (view === 'admin' && this.currentUser.perfil !== 'Administrador') {
      this.showToast('Acesso negado. Apenas administradores.', 'error');
      return;
    }

    this.currentView = view;

    // Atualizar navegação ativa
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-view') === view) {
        item.classList.add('active');
      }
    });

    // Mostrar view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewElement = document.getElementById(`${view}View`);
    if (viewElement) {
      viewElement.classList.add('active');
      this.renderView(view);
    }
  }

  renderView(view) {
    switch(view) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'solicitacoes':
        this.renderSolicitacoes();
        break;
      case 'minhasRetiradas':
        this.renderMinhasRetiradas();
        break;
      case 'alertas':
        this.renderAlertas();
        break;
      case 'gavetas':
        this.renderGavetas();
        break;
      case 'pastas':
        this.renderPastas();
        break;
      case 'movimentacoes':
        this.renderMovimentacoes();
        break;
      case 'arquivoMorto':
        this.renderArquivoMorto();
        break;
      case 'relatorios':
        // Relatórios já estão renderizados
        break;
      case 'admin':
        this.renderAdmin();
        break;
    }
  }

  // Solicitações
  renderSolicitacoes(filtro = '') {
    const container = document.getElementById('funcionariosContainer');
    let funcionarios = this.db.funcionarios.filter(f => f.status === 'Ativo');

    if (filtro) {
      funcionarios = funcionarios.filter(f => f.nome.toLowerCase().includes(filtro.toLowerCase()));
    }

    if (funcionarios.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum funcionário encontrado</div>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Departamento</th>
            <th>Data Admissão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    funcionarios.forEach(func => {
      // Verificar se já tem solicitação pendente
      const solicitacaoPendente = this.db.solicitacoes.find(s => 
        s.usuario_id === this.currentUser.id && 
        s.funcionario_id === func.id && 
        s.status === 'pendente'
      );

      // Verificar se arquivo já está retirado
      const pasta = this.db.pastas.find(p => p.funcionario_id === func.id && p.ativa && !p.arquivo_morto);
      const retiradaAtiva = pasta ? this.db.retiradas_com_pessoas.find(r => 
        r.pasta_id === pasta.id && 
        r.status === 'ativo'
      ) : null;

      let actionBtn = '';
      if (solicitacaoPendente) {
        actionBtn = '<span class="status status--pending">Solicitação Pendente</span>';
      } else if (retiradaAtiva) {
        actionBtn = '<span class="status status--warning">Já Retirado</span>';
      } else {
        actionBtn = `<button class="btn btn--primary btn-sm" onclick="app.abrirModalSolicitacao(${func.id})">Solicitar Retirada</button>`;
      }

      html += `
        <tr>
          <td><strong>${func.nome}</strong></td>
          <td>${func.cpf}</td>
          <td>${func.departamento}</td>
          <td>${this.formatarData(func.data_admissao)}</td>
          <td><span class="status status--success">${func.status}</span></td>
          <td>${actionBtn}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  buscarFuncionarios(termo) {
    this.renderSolicitacoes(termo);
  }

  abrirModalSolicitacao(funcionarioId) {
    const funcionario = this.db.funcionarios.find(f => f.id === funcionarioId);
    
    this.openModal(`Solicitar Retirada - ${funcionario.nome}`, `
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
          <input type="date" class="form-control" id="dataNecessaria" value="${this.getCurrentDate()}">
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarSolicitacao(${funcionarioId})">Enviar Solicitação</button>
    `);
  }

  salvarSolicitacao(funcionarioId) {
    const motivo = document.getElementById('motivoSolicitacao').value;
    const dataNecessaria = document.getElementById('dataNecessaria').value;

    if (!motivo) {
      this.showToast('Informe o motivo da solicitação', 'error');
      return;
    }

    const novoId = Math.max(...this.db.solicitacoes.map(s => s.id), 0) + 1;
    this.db.solicitacoes.push({
      id: novoId,
      usuario_id: this.currentUser.id,
      funcionario_id: funcionarioId,
      motivo,
      data_solicitacao: this.getCurrentTimestamp(),
      status: 'pendente',
      data_aprovacao: null
    });

    const funcionario = this.db.funcionarios.find(f => f.id === funcionarioId);
    this.addLog(`Solicitação criada para arquivo de ${funcionario.nome}`, this.currentUser.id);
    this.saveToStorage();
    this.closeModal();
    this.renderSolicitacoes();
    this.showToast('Solicitação enviada! Aguarde aprovação do administrador.', 'success');
  }

  // Minhas Retiradas
  renderMinhasRetiradas() {
    const container = document.getElementById('minhasRetiradasContainer');
    const minhasRetiradas = this.db.retiradas_com_pessoas.filter(r => 
      r.usuario_id === this.currentUser.id && r.status === 'ativo'
    );

    if (minhasRetiradas.length === 0) {
      container.innerHTML = '<div class="empty-state">Você não tem arquivos em seu poder no momento</div>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>Data Retirada</th>
            <th>Prazo Devolução</th>
            <th>Dias em Poder</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    minhasRetiradas.forEach(retirada => {
      const pasta = this.db.pastas.find(p => p.id === retirada.pasta_id);
      const funcionario = this.db.funcionarios.find(f => f.id === retirada.funcionario_id);
      const diasDecorridos = this.calcularDiasDecorridos(retirada.data_retirada);
      
      // Determinar prazo baseado no status do funcionário
      const prazo = funcionario.status === 'Demitido' ? 3 : 7;
      
      let statusClass = 'status--success';
      let statusText = `${diasDecorridos} dias`;
      
      if (diasDecorridos >= prazo) {
        statusClass = 'status--error';
        statusText = `VENCIDO (${diasDecorridos} dias)`;
      } else if (diasDecorridos >= prazo - 2) {
        statusClass = 'status--warning';
        statusText = `ATENÇÃO (${diasDecorridos} dias)`;
      }

      html += `
        <tr>
          <td><strong>${pasta?.nome || 'N/A'}</strong></td>
          <td>${this.formatarDataHora(retirada.data_retirada)}</td>
          <td>${this.formatarDataHora(retirada.data_prevista_retorno)}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
          <td><span class="status status--warning">Em seu poder</span></td>
          <td>
            <button class="btn btn--primary btn-sm" onclick="app.devolverArquivo(${retirada.id})">Devolver</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  devolverArquivo(retiradaId) {
    const retirada = this.db.retiradas_com_pessoas.find(r => r.id === retiradaId);
    const pasta = this.db.pastas.find(p => p.id === retirada.pasta_id);
    
    if (confirm(`Confirmar devolução do arquivo de ${pasta.nome}?`)) {
      retirada.status = 'devolvido';
      retirada.data_retorno = this.getCurrentTimestamp();

      // Resolver alertas relacionados
      this.db.alertas.filter(a => a.retirada_id === retiradaId).forEach(a => a.resolvido = true);

      this.addLog(`Arquivo devolvido: ${pasta.nome}`, this.currentUser.id);
      this.saveToStorage();
      this.renderMinhasRetiradas();
      this.showToast('Arquivo devolvido com sucesso!', 'success');
    }
  }

  // Alertas
  renderAlertas() {
    const container = document.getElementById('alertasContainer');
    this.atualizarAlertas();

    const alertasAtivos = this.db.alertas.filter(a => !a.resolvido);

    if (alertasAtivos.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum alerta ativo no momento</div>';
      return;
    }

    let html = '';

    alertasAtivos.forEach(alerta => {
      const retirada = this.db.retiradas_com_pessoas.find(r => r.id === alerta.retirada_id);
      const pasta = this.db.pastas.find(p => p.id === retirada?.pasta_id);
      const usuario = this.db.usuarios.find(u => u.id === retirada?.usuario_id);
      const diasDecorridos = this.calcularDiasDecorridos(retirada?.data_retirada);

      let cardClass = 'amarelo';
      let icon = '⚠️';
      let titulo = 'Atenção';

      if (alerta.severidade === 'crítico') {
        cardClass = diasDecorridos > 10 ? 'critico' : 'vermelho';
        icon = diasDecorridos > 10 ? '⚠️⚠️' : '⚠️';
        titulo = diasDecorridos > 10 ? 'CRÍTICO' : 'URGENTE';
      }

      html += `
        <div class="alert-card ${cardClass}">
          <h3>${icon} ${titulo} - Arquivo há ${diasDecorridos} dias</h3>
          <p><strong>Arquivo:</strong> ${pasta?.nome || 'N/A'}</p>
          <p><strong>Com:</strong> ${usuario?.username || 'N/A'}</p>
          <p><strong>Retirado em:</strong> ${this.formatarDataHora(retirada?.data_retirada)}</p>
          <p><strong>Prazo:</strong> ${this.formatarDataHora(retirada?.data_prevista_retorno)}</p>
          ${diasDecorridos >= 7 ? '<p style="font-weight: bold; margin-top: 12px;">⚠️ RETORNO URGENTE NECESSÁRIO!</p>' : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  }

  atualizarAlertas() {
    const retiradasAtivas = this.db.retiradas_com_pessoas.filter(r => r.status === 'ativo');

    retiradasAtivas.forEach(retirada => {
      const diasDecorridos = this.calcularDiasDecorridos(retirada.data_retirada);
      const pasta = this.db.pastas.find(p => p.id === retirada.pasta_id);
      const funcionario = this.db.funcionarios.find(f => f.id === pasta?.funcionario_id);
      const prazo = funcionario?.status === 'Demitido' ? 3 : 7;

      // Atualizar dias decorridos
      retirada.dias_decorridos = diasDecorridos;

      // Criar alertas conforme necessário
      if (diasDecorridos >= prazo - 2 && diasDecorridos < prazo) {
        // Alerta amarelo (5 dias para ativos, 1 dia para demitidos)
        const alertaExistente = this.db.alertas.find(a => 
          a.retirada_id === retirada.id && 
          a.tipo_alerta === '5_dias_aviso' && 
          !a.resolvido
        );
        if (!alertaExistente) {
          const novoId = Math.max(...this.db.alertas.map(a => a.id), 0) + 1;
          this.db.alertas.push({
            id: novoId,
            retirada_id: retirada.id,
            tipo_alerta: '5_dias_aviso',
            severidade: 'aviso',
            data_criacao: this.getCurrentTimestamp(),
            resolvido: false
          });
        }
      }

      if (diasDecorridos >= prazo) {
        // Alerta vermelho (7+ dias)
        retirada.status = 'vencido';
        const alertaExistente = this.db.alertas.find(a => 
          a.retirada_id === retirada.id && 
          a.tipo_alerta === '7_dias_vencido' && 
          !a.resolvido
        );
        if (!alertaExistente) {
          const novoId = Math.max(...this.db.alertas.map(a => a.id), 0) + 1;
          this.db.alertas.push({
            id: novoId,
            retirada_id: retirada.id,
            tipo_alerta: '7_dias_vencido',
            severidade: 'crítico',
            data_criacao: this.getCurrentTimestamp(),
            resolvido: false
          });
        }

        // Se funcionário demitido não devolveu em 3 dias, mover para arquivo morto
        if (funcionario?.status === 'Demitido' && diasDecorridos > prazo && pasta) {
          pasta.arquivo_morto = true;
          pasta.ativa = false;
          this.addLog(`Arquivo movido para Arquivo Morto: ${pasta.nome} (funcionário demitido)`, null);
        }
      }
    });

    this.saveToStorage();
  }

  // Arquivo Morto
  renderArquivoMorto() {
    const container = document.getElementById('arquivoMortoContainer');
    const pastasArquivoMorto = this.db.pastas.filter(p => p.arquivo_morto);

    if (pastasArquivoMorto.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum arquivo no Arquivo Morto</div>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Funcionário</th>
            <th>Status Funcionário</th>
            <th>Data Criação</th>
            <th>Data Demissão</th>
            <th>Departamento</th>
          </tr>
        </thead>
        <tbody>
    `;

    pastasArquivoMorto.forEach(pasta => {
      const funcionario = this.db.funcionarios.find(f => f.id === pasta.funcionario_id);
      
      html += `
        <tr>
          <td><strong>${pasta.nome}</strong> <span class="arquivo-morto-badge">ARQUIVO MORTO</span></td>
          <td>${funcionario?.nome || 'N/A'}</td>
          <td><span class="status status--error">${funcionario?.status || 'N/A'}</span></td>
          <td>${this.formatarData(pasta.data_criacao)}</td>
          <td>${funcionario?.data_demissao ? this.formatarData(funcionario.data_demissao) : 'N/A'}</td>
          <td>${funcionario?.departamento || 'N/A'}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // Dashboard
  renderDashboard() {
    // Estatísticas
    const totalGavetas = this.db.gavetas.length;
    const totalPastas = this.db.pastas.filter(p => p.ativa).length;
    const itensRetirados = this.db.envelopes.filter(e => e.status === 'retirado').length;
    const gavetasCheias = this.db.gavetas.filter(g => (g.ocupacao_atual / g.capacidade) > 0.9).length;

    // Atualizar alertas
    this.atualizarAlertas();

    // Contar minhas retiradas
    const minhasRetiradas = this.db.retiradas_com_pessoas.filter(r => 
      r.usuario_id === this.currentUser.id && r.status === 'ativo'
    ).length;

    // Contar alertas críticos
    const alertasCriticos = this.db.alertas.filter(a => !a.resolvido && a.severidade === 'crítico').length;

    document.getElementById('totalGavetas').textContent = totalGavetas;
    document.getElementById('totalPastas').textContent = totalPastas;
    document.getElementById('itensRetirados').textContent = minhasRetiradas;
    document.getElementById('gavetasCheias').textContent = alertasCriticos;

    // Alertas principais
    const alertsSection = document.getElementById('alertsSection');
    alertsSection.innerHTML = '';

    // Alerta de arquivos em poder do usuário
    if (minhasRetiradas > 0) {
      const retiradasUsuario = this.db.retiradas_com_pessoas.filter(r => 
        r.usuario_id === this.currentUser.id && r.status === 'ativo'
      );

      retiradasUsuario.forEach(retirada => {
        const diasDecorridos = this.calcularDiasDecorridos(retirada.data_retirada);
        const pasta = this.db.pastas.find(p => p.id === retirada.pasta_id);
        const funcionario = this.db.funcionarios.find(f => f.id === pasta?.funcionario_id);
        const prazo = funcionario?.status === 'Demitido' ? 3 : 7;

        if (diasDecorridos >= prazo) {
          alertsSection.innerHTML += `
            <div class="alert alert-error">
              <strong>⚠️⚠️ CRÍTICO!</strong> Você tem o arquivo de <strong>${pasta?.nome}</strong> há ${diasDecorridos} dias. Prazo vencido! Favor devolver urgentemente.
            </div>
          `;
        } else if (diasDecorridos >= prazo - 2) {
          alertsSection.innerHTML += `
            <div class="alert alert-warning">
              <strong>⚠️ Atenção!</strong> Você tem o arquivo de <strong>${pasta?.nome}</strong> há ${diasDecorridos} dias. Devolva em ${prazo - diasDecorridos} dia(s).
            </div>
          `;
        }
      });
    }

    // Alerta de solicitações pendentes (para admin)
    if (this.currentUser.perfil === 'Administrador') {
      const solicitacoesPendentes = this.db.solicitacoes.filter(s => s.status === 'pendente').length;
      if (solicitacoesPendentes > 0) {
        alertsSection.innerHTML += `
          <div class="alert alert-info">
            <strong>ℹ️ Admin:</strong> Você tem ${solicitacoesPendentes} solicitação(ões) pendente(s) de aprovação.
          </div>
        `;
      }

      if (alertasCriticos > 0) {
        alertsSection.innerHTML += `
          <div class="alert alert-error">
            <strong>⚠️ Admin:</strong> ${alertasCriticos} arquivo(s) com prazo vencido (7+ dias).
          </div>
        `;
      }
    }

    if (gavetasCheias > 0) {
      alertsSection.innerHTML += `
        <div class="alert alert-warning">
          <strong>⚠️ Atenção!</strong> ${gavetasCheias} gaveta(s) com ocupação acima de 90%.
        </div>
      `;
    }

    // Itens retirados
    const itensRetiradosList = document.getElementById('itensRetiradosList');
    const envelopesRetirados = this.db.envelopes.filter(e => e.status === 'retirado');

    if (envelopesRetirados.length === 0) {
      itensRetiradosList.innerHTML = '<div class="empty-state">Nenhum item retirado no momento</div>';
    } else {
      let tableHTML = `
        <table>
          <thead>
            <tr>
              <th>Pasta</th>
              <th>Tipo Envelope</th>
              <th>Gaveta</th>
              <th>Gaveteiro</th>
              <th>Data Retirada</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
      `;

      envelopesRetirados.forEach(env => {
        const pasta = this.db.pastas.find(p => p.id === env.pasta_id);
        const gaveta = this.db.gavetas.find(g => g.id === pasta?.gaveta_id);
        const gaveteiro = this.db.gaveteiros.find(gt => gt.id === gaveta?.gaveteiro_id);
        const mov = this.db.movimentacoes.find(m => m.item_id === env.id && m.acao === 'saida');

        tableHTML += `
          <tr>
            <td>${pasta?.nome || 'N/A'}</td>
            <td>${env.tipo}</td>
            <td>${gaveta?.numero || 'N/A'}</td>
            <td>${gaveteiro?.nome || 'N/A'}</td>
            <td>${mov?.data || 'N/A'}</td>
            <td>${mov?.motivo || 'N/A'}</td>
          </tr>
        `;
      });

      tableHTML += '</tbody></table>';
      itensRetiradosList.innerHTML = tableHTML;
    }
  }

  // Gavetas
  renderGavetas() {
    const container = document.getElementById('gaveteirosContainer');
    let html = '';

    this.db.gaveteiros.forEach(gaveteiro => {
      const gavetas = this.db.gavetas.filter(g => g.gaveteiro_id === gaveteiro.id);
      
      html += `
        <div class="gaveteiro-card">
          <div class="gaveteiro-header">
            <div>
              <h3>${gaveteiro.nome}</h3>
              <div class="gaveteiro-location">${gaveteiro.localizacao}</div>
            </div>
            <div class="table-actions">
              <button class="btn btn--outline" onclick="app.editarGaveteiro(${gaveteiro.id})">Editar</button>
            </div>
          </div>
          <div class="gavetas-grid">
      `;

      gavetas.forEach(gaveta => {
        const percentual = Math.round((gaveta.ocupacao_atual / gaveta.capacidade) * 100);
        let progressClass = '';
        if (percentual > 90) progressClass = 'danger';
        else if (percentual > 70) progressClass = 'warning';

        html += `
          <div class="gaveta-item" onclick="app.verDetalhesGaveta(${gaveta.id})">
            <div class="gaveta-numero">Gaveta ${gaveta.numero}</div>
            <div class="gaveta-ocupacao">${gaveta.ocupacao_atual} / ${gaveta.capacidade} pastas</div>
            <div class="progress-bar">
              <div class="progress-fill ${progressClass}" style="width: ${percentual}%"></div>
            </div>
            <div style="font-size: 12px; margin-top: 4px; text-align: center;">${percentual}%</div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Pastas
  renderPastas(filtro = '') {
    const container = document.getElementById('pastasContainer');
    let pastas = this.db.pastas.filter(p => p.ativa);

    if (filtro) {
      pastas = pastas.filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()));
    }

    if (pastas.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma pasta encontrada</div>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Gaveta</th>
            <th>Gaveteiro</th>
            <th>Localização</th>
            <th>Data Criação</th>
            <th>Envelopes</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    pastas.forEach(pasta => {
      const gaveta = this.db.gavetas.find(g => g.id === pasta.gaveta_id);
      const gaveteiro = this.db.gaveteiros.find(gt => gt.id === gaveta?.gaveteiro_id);
      const envelopes = this.db.envelopes.filter(e => e.pasta_id === pasta.id);
      const presentes = envelopes.filter(e => e.status === 'presente').length;

      html += `
        <tr>
          <td><strong>${pasta.nome}</strong></td>
          <td>${gaveta?.numero || 'N/A'}</td>
          <td>${gaveteiro?.nome || 'N/A'}</td>
          <td>${gaveteiro?.localizacao || 'N/A'}</td>
          <td>${this.formatarData(pasta.data_criacao)}</td>
          <td>${presentes}/${envelopes.length} presentes</td>
          <td>
            <div class="table-actions">
              <button class="btn btn--outline btn-sm" onclick="app.verEnvelopesPasta(${pasta.id})">Ver Envelopes</button>
              <button class="btn btn--outline btn-sm" onclick="app.arquivarPasta(${pasta.id})">Arquivar</button>
            </div>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  buscarPastas(termo) {
    this.renderPastas(termo);
  }

  // Movimentações
  renderMovimentacoes(filtro = '') {
    const container = document.getElementById('movimentacoesContainer');
    let movimentacoes = [...this.db.movimentacoes].reverse();

    if (filtro) {
      movimentacoes = movimentacoes.filter(m => {
        const envelope = this.db.envelopes.find(e => e.id === m.item_id);
        const pasta = this.db.pastas.find(p => p.id === envelope?.pasta_id);
        return pasta?.nome.toLowerCase().includes(filtro.toLowerCase()) || 
               envelope?.tipo.toLowerCase().includes(filtro.toLowerCase());
      });
    }

    if (movimentacoes.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma movimentação registrada</div>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Ação</th>
            <th>Pasta</th>
            <th>Envelope</th>
            <th>Usuário</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
    `;

    movimentacoes.forEach(mov => {
      const envelope = this.db.envelopes.find(e => e.id === mov.item_id);
      const pasta = this.db.pastas.find(p => p.id === envelope?.pasta_id);
      const usuario = this.db.usuarios.find(u => u.id === mov.usuario_id);
      const acaoClass = mov.acao === 'saida' ? 'status--warning' : 'status--success';
      const acaoTexto = mov.acao === 'saida' ? 'Saída' : 'Entrada';

      html += `
        <tr>
          <td>${mov.data}</td>
          <td><span class="status ${acaoClass}">${acaoTexto}</span></td>
          <td>${pasta?.nome || 'N/A'}</td>
          <td>${envelope?.tipo || 'N/A'}</td>
          <td>${usuario?.username || 'N/A'}</td>
          <td>${mov.motivo}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  buscarMovimentacoes(termo) {
    this.renderMovimentacoes(termo);
  }

  // Admin
  renderAdmin() {
    // Solicitações Pendentes
    this.renderSolicitacoesPendentes();
    
    // Funcionários
    this.renderFuncionariosAdmin();
    
    // Usuários
    this.renderUsuariosAdmin();
  }

  renderSolicitacoesPendentes() {
    const container = document.getElementById('solicitacoesPendentesContainer');
    const pendentes = this.db.solicitacoes.filter(s => s.status === 'pendente');

    if (pendentes.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma solicitação pendente</div>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Data Solicitação</th>
            <th>Usuário</th>
            <th>Funcionário/Arquivo</th>
            <th>Motivo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    pendentes.forEach(sol => {
      const usuario = this.db.usuarios.find(u => u.id === sol.usuario_id);
      const funcionario = this.db.funcionarios.find(f => f.id === sol.funcionario_id);

      html += `
        <tr>
          <td>${this.formatarDataHora(sol.data_solicitacao)}</td>
          <td>${usuario?.username || 'N/A'}</td>
          <td><strong>${funcionario?.nome || 'N/A'}</strong></td>
          <td>${sol.motivo}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn--primary btn-sm" onclick="app.aprovarSolicitacao(${sol.id})">Aprovar</button>
              <button class="btn btn--outline btn-sm" onclick="app.rejeitarSolicitacao(${sol.id})">Rejeitar</button>
            </div>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  aprovarSolicitacao(solicitacaoId) {
    const solicitacao = this.db.solicitacoes.find(s => s.id === solicitacaoId);
    solicitacao.status = 'aprovada';
    solicitacao.data_aprovacao = this.getCurrentTimestamp();

    const funcionario = this.db.funcionarios.find(f => f.id === solicitacao.funcionario_id);
    this.addLog(`Solicitação aprovada para arquivo de ${funcionario.nome}`, this.currentUser.id);
    
    // Criar retirada
    this.confirmarRetirada(solicitacao);
    
    this.saveToStorage();
    this.renderAdmin();
    this.showToast('Solicitação aprovada e arquivo registrado como retirado!', 'success');
  }

  rejeitarSolicitacao(solicitacaoId) {
    const motivo = prompt('Motivo da rejeição (opcional):');
    
    const solicitacao = this.db.solicitacoes.find(s => s.id === solicitacaoId);
    solicitacao.status = 'rejeitada';
    solicitacao.motivo_rejeicao = motivo;

    const funcionario = this.db.funcionarios.find(f => f.id === solicitacao.funcionario_id);
    this.addLog(`Solicitação rejeitada para arquivo de ${funcionario.nome}`, this.currentUser.id);
    this.saveToStorage();
    this.renderAdmin();
    this.showToast('Solicitação rejeitada', 'success');
  }

  confirmarRetirada(solicitacao) {
    const pasta = this.db.pastas.find(p => p.funcionario_id === solicitacao.funcionario_id && p.ativa && !p.arquivo_morto);
    const funcionario = this.db.funcionarios.find(f => f.id === solicitacao.funcionario_id);
    
    if (!pasta) {
      this.showToast('Pasta não encontrada para este funcionário', 'error');
      return;
    }

    const prazo = funcionario.status === 'Demitido' ? 3 : 7;
    const dataRetorno = new Date();
    dataRetorno.setDate(dataRetorno.getDate() + prazo);

    const novoId = Math.max(...this.db.retiradas_com_pessoas.map(r => r.id), 0) + 1;
    this.db.retiradas_com_pessoas.push({
      id: novoId,
      pasta_id: pasta.id,
      usuario_id: solicitacao.usuario_id,
      funcionario_id: solicitacao.funcionario_id,
      data_retirada: this.getCurrentTimestamp(),
      data_prevista_retorno: dataRetorno.toISOString(),
      data_retorno: null,
      status: 'ativo',
      dias_decorridos: 0
    });

    this.addLog(`Retirada confirmada: ${pasta.nome} por usuário ID ${solicitacao.usuario_id}`, this.currentUser.id);
    this.saveToStorage();
  }

  renderFuncionariosAdmin() {
    const container = document.getElementById('funcionariosAdminContainer');
    
    let html = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Departamento</th>
            <th>Admissão</th>
            <th>Demissão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.db.funcionarios.forEach(func => {
      const statusClass = func.status === 'Ativo' ? 'status--success' : 'status--error';
      
      html += `
        <tr>
          <td><strong>${func.nome}</strong></td>
          <td>${func.cpf}</td>
          <td>${func.departamento}</td>
          <td>${this.formatarData(func.data_admissao)}</td>
          <td>${func.data_demissao ? this.formatarData(func.data_demissao) : '-'}</td>
          <td><span class="status ${statusClass}">${func.status}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn--outline btn-sm" onclick="app.editarFuncionario(${func.id})">Editar</button>
              ${func.status === 'Ativo' ? 
                `<button class="btn btn--outline btn-sm" onclick="app.demitirFuncionario(${func.id})">Demitir</button>` : 
                ''
              }
            </div>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  abrirModalNovoFuncionario() {
    this.openModal('Novo Funcionário', `
      <form id="formNovoFuncionario">
        <div class="form-group">
          <label>Nome Completo *</label>
          <input type="text" class="form-control" id="nomeFuncionario" required>
        </div>
        <div class="form-group">
          <label>CPF</label>
          <input type="text" class="form-control" id="cpfFuncionario" placeholder="000.000.000-00">
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
      <button class="btn btn--outline" onclick="app.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarFuncionario()">Salvar</button>
    `);
  }

  salvarFuncionario() {
    const nome = document.getElementById('nomeFuncionario').value;
    const cpf = document.getElementById('cpfFuncionario').value;
    const departamento = document.getElementById('departamentoFuncionario').value;
    const dataAdmissao = document.getElementById('dataAdmissao').value;

    if (!nome || !departamento || !dataAdmissao) {
      this.showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const novoId = Math.max(...this.db.funcionarios.map(f => f.id), 0) + 1;
    this.db.funcionarios.push({
      id: novoId,
      nome,
      cpf,
      departamento,
      data_admissao: dataAdmissao,
      data_demissao: null,
      status: 'Ativo'
    });

    this.addLog(`Funcionário cadastrado: ${nome}`, this.currentUser.id);
    this.saveToStorage();
    this.closeModal();
    this.renderAdmin();
    this.showToast('Funcionário cadastrado com sucesso!', 'success');
  }

  demitirFuncionario(funcionarioId) {
    const dataDemissao = prompt('Data de demissão (AAAA-MM-DD):');
    
    if (!dataDemissao) return;

    const funcionario = this.db.funcionarios.find(f => f.id === funcionarioId);
    funcionario.status = 'Demitido';
    funcionario.data_demissao = dataDemissao;

    // Verificar se tem arquivo retirado
    const pasta = this.db.pastas.find(p => p.funcionario_id === funcionarioId && p.ativa);
    if (pasta) {
      const retiradaAtiva = this.db.retiradas_com_pessoas.find(r => 
        r.pasta_id === pasta.id && r.status === 'ativo'
      );

      if (retiradaAtiva) {
        // Reduzir prazo para 3 dias
        const dataRetorno = new Date(retiradaAtiva.data_retirada);
        dataRetorno.setDate(dataRetorno.getDate() + 3);
        retiradaAtiva.data_prevista_retorno = dataRetorno.toISOString();
        
        this.showToast(`Atenção: Arquivo retirado. Prazo reduzido para 3 dias.`, 'warning');
      }
    }

    this.addLog(`Funcionário demitido: ${funcionario.nome}`, this.currentUser.id);
    this.saveToStorage();
    this.renderAdmin();
    this.showToast('Status atualizado para Demitido', 'success');
  }

  editarFuncionario(funcionarioId) {
    this.showToast('Funcionalidade de edição em desenvolvimento', 'info');
  }

  renderUsuariosAdmin() {
    const container = document.getElementById('usuariosContainer');
    
    let html = `
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Perfil</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.db.usuarios.forEach(user => {
      const statusClass = user.ativo ? 'status--success' : 'status--error';
      const statusTexto = user.ativo ? 'Ativo' : 'Inativo';

      html += `
        <tr>
          <td><strong>${user.username}</strong></td>
          <td>${user.perfil}</td>
          <td><span class="status ${statusClass}">${statusTexto}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn--outline btn-sm" onclick="app.editarUsuario(${user.id})">Editar</button>
              <button class="btn btn--outline btn-sm" onclick="app.toggleUsuarioStatus(${user.id})">
                ${user.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // Modais
  abrirModalNovoGaveteiro() {
    this.openModal('Novo Gaveteiro', `
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
      <button class="btn btn--outline" onclick="app.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarGaveteiro()">Salvar</button>
    `);
  }

  salvarGaveteiro() {
    const nome = document.getElementById('nomeGaveteiro').value;
    const localizacao = document.getElementById('localizacaoGaveteiro').value;

    if (!nome || !localizacao) {
      this.showToast('Preencha todos os campos', 'error');
      return;
    }

    const novoId = Math.max(...this.db.gaveteiros.map(g => g.id), 0) + 1;
    this.db.gaveteiros.push({ id: novoId, nome, localizacao });
    
    this.addLog(`Gaveteiro criado: ${nome}`, this.currentUser.id);
    this.saveToStorage();
    this.closeModal();
    this.renderGavetas();
    this.showToast('Gaveteiro criado com sucesso!', 'success');
  }

  abrirModalNovaGaveta() {
    let options = this.db.gaveteiros.map(g => 
      `<option value="${g.id}">${g.nome} - ${g.localizacao}</option>`
    ).join('');

    this.openModal('Nova Gaveta', `
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
      <button class="btn btn--outline" onclick="app.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarGaveta()">Salvar</button>
    `);
  }

  salvarGaveta() {
    const gaveteiro_id = parseInt(document.getElementById('gaveteiroSelect').value);
    const numero = document.getElementById('numeroGaveta').value;
    const capacidade = parseInt(document.getElementById('capacidadeGaveta').value);

    if (!gaveteiro_id || !numero || !capacidade) {
      this.showToast('Preencha todos os campos', 'error');
      return;
    }

    const novoId = Math.max(...this.db.gavetas.map(g => g.id), 0) + 1;
    this.db.gavetas.push({
      id: novoId,
      gaveteiro_id,
      numero,
      capacidade,
      ocupacao_atual: 0
    });

    this.addLog(`Gaveta criada: ${numero}`, this.currentUser.id);
    this.saveToStorage();
    this.closeModal();
    this.renderGavetas();
    this.showToast('Gaveta criada com sucesso!', 'success');
  }

  abrirModalNovaPasta() {
    let options = '';
    this.db.gaveteiros.forEach(gaveteiro => {
      const gavetas = this.db.gavetas.filter(g => g.gaveteiro_id === gaveteiro.id);
      gavetas.forEach(gaveta => {
        const espacoDisponivel = gaveta.capacidade - gaveta.ocupacao_atual;
        if (espacoDisponivel > 0) {
          options += `<option value="${gaveta.id}">${gaveteiro.nome} - Gaveta ${gaveta.numero} (${espacoDisponivel} vagas)</option>`;
        }
      });
    });

    this.openModal('Nova Pasta', `
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
      <button class="btn btn--outline" onclick="app.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarPasta()">Salvar</button>
    `);
  }

  salvarPasta() {
    const gaveta_id = parseInt(document.getElementById('gavetaSelect').value);
    const nome = document.getElementById('nomePasta').value;

    if (!gaveta_id || !nome) {
      this.showToast('Preencha todos os campos', 'error');
      return;
    }

    const gaveta = this.db.gavetas.find(g => g.id === gaveta_id);
    if (!gaveta || gaveta.ocupacao_atual >= gaveta.capacidade) {
      this.showToast('Gaveta sem espaço disponível', 'error');
      return;
    }

    // Criar pasta
    const novaPastaId = Math.max(...this.db.pastas.map(p => p.id), 0) + 1;
    this.db.pastas.push({
      id: novaPastaId,
      gaveta_id,
      nome,
      data_criacao: this.getCurrentDate(),
      ativa: true
    });

    // Criar 4 envelopes
    const tiposEnvelope = ['Segurança', 'Medicina', 'Pessoal', 'Treinamento'];
    tiposEnvelope.forEach(tipo => {
      const novoEnvId = Math.max(...this.db.envelopes.map(e => e.id), 0) + 1;
      this.db.envelopes.push({
        id: novoEnvId,
        pasta_id: novaPastaId,
        tipo,
        status: 'presente'
      });
    });

    // Atualizar ocupação da gaveta
    gaveta.ocupacao_atual++;

    this.addLog(`Pasta criada: ${nome}`, this.currentUser.id);
    this.saveToStorage();
    this.closeModal();
    this.renderPastas();
    this.showToast('Pasta criada com sucesso!', 'success');
  }

  verEnvelopesPasta(pastaId) {
    const pasta = this.db.pastas.find(p => p.id === pastaId);
    const envelopes = this.db.envelopes.filter(e => e.pasta_id === pastaId);
    const gaveta = this.db.gavetas.find(g => g.id === pasta.gaveta_id);
    const gaveteiro = this.db.gaveteiros.find(gt => gt.id === gaveta?.gaveteiro_id);

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

    this.openModal(`Envelopes - ${pasta.nome}`, html, `
      <button class="btn btn--outline" onclick="app.closeModal()">Fechar</button>
    `);
  }

  registrarMovimentacao(envelopeId, acao) {
    const envelope = this.db.envelopes.find(e => e.id === envelopeId);
    const pasta = this.db.pastas.find(p => p.id === envelope.pasta_id);

    this.openModal(`Registrar ${acao === 'saida' ? 'Saída' : 'Entrada'}`, `
      <form id="formMovimentacao">
        <div class="form-group">
          <label>Pasta: <strong>${pasta.nome}</strong></label><br>
          <label>Envelope: <strong>${envelope.tipo}</strong></label>
        </div>
        <div class="form-group">
          <label>Motivo</label>
          <textarea class="form-control" id="motivoMovimentacao" rows="3" required></textarea>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarMovimentacao(${envelopeId}, '${acao}')">
        Confirmar
      </button>
    `);
  }

  salvarMovimentacao(envelopeId, acao) {
    const motivo = document.getElementById('motivoMovimentacao').value;

    if (!motivo) {
      this.showToast('Informe o motivo da movimentação', 'error');
      return;
    }

    const envelope = this.db.envelopes.find(e => e.id === envelopeId);
    envelope.status = acao === 'saida' ? 'retirado' : 'presente';

    const novoMovId = Math.max(...this.db.movimentacoes.map(m => m.id), 0) + 1;
    this.db.movimentacoes.push({
      id: novoMovId,
      item_id: envelopeId,
      tipo_item: 'envelope',
      acao,
      usuario_id: this.currentUser.id,
      data: this.getCurrentTimestamp(),
      motivo
    });

    this.addLog(`Movimentação registrada - ${acao} - Envelope ID: ${envelopeId}`, this.currentUser.id);
    this.saveToStorage();
    this.closeModal();
    this.showToast(`${acao === 'saida' ? 'Saída' : 'Entrada'} registrada com sucesso!`, 'success');
    
    // Re-abrir modal de envelopes
    const pasta = this.db.pastas.find(p => p.id === envelope.pasta_id);
    this.verEnvelopesPasta(pasta.id);
  }

  arquivarPasta(pastaId) {
    if (confirm('Deseja realmente arquivar esta pasta?')) {
      const pasta = this.db.pastas.find(p => p.id === pastaId);
      pasta.ativa = false;

      // Liberar espaço na gaveta
      const gaveta = this.db.gavetas.find(g => g.id === pasta.gaveta_id);
      if (gaveta) gaveta.ocupacao_atual--;

      this.addLog(`Pasta arquivada: ${pasta.nome}`, this.currentUser.id);
      this.saveToStorage();
      this.renderPastas();
      this.showToast('Pasta arquivada com sucesso!', 'success');
    }
  }

  abrirModalNovoUsuario() {
    this.openModal('Novo Usuário', `
      <form id="formNovoUsuario">
        <div class="form-group">
          <label>Usuário</label>
          <input type="text" class="form-control" id="novoUsername" required>
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" class="form-control" id="novaSenha" required>
        </div>
        <div class="form-group">
          <label>Perfil</label>
          <select class="form-control" id="novoPerfil" required>
            <option value="Usuário Operacional">Usuário Operacional</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
      </form>
    `, `
      <button class="btn btn--outline" onclick="app.closeModal()">Cancelar</button>
      <button class="btn btn--primary" onclick="app.salvarUsuario()">Salvar</button>
    `);
  }

  salvarUsuario() {
    const username = document.getElementById('novoUsername').value;
    const senha = document.getElementById('novaSenha').value;
    const perfil = document.getElementById('novoPerfil').value;

    if (!username || !senha) {
      this.showToast('Preencha todos os campos', 'error');
      return;
    }

    if (this.db.usuarios.find(u => u.username === username)) {
      this.showToast('Usuário já existe', 'error');
      return;
    }

    const novoId = Math.max(...this.db.usuarios.map(u => u.id), 0) + 1;
    this.db.usuarios.push({
      id: novoId,
      username,
      senha, // Em produção, usar bcrypt
      perfil,
      ativo: true
    });

    this.addLog(`Usuário criado: ${username}`, this.currentUser.id);
    this.saveToStorage();
    this.closeModal();
    this.renderAdmin();
    this.showToast('Usuário criado com sucesso!', 'success');
  }

  toggleUsuarioStatus(userId) {
    const user = this.db.usuarios.find(u => u.id === userId);
    user.ativo = !user.ativo;
    
    this.addLog(`Usuário ${user.ativo ? 'ativado' : 'desativado'}: ${user.username}`, this.currentUser.id);
    this.saveToStorage();
    this.renderAdmin();
    this.showToast(`Usuário ${user.ativo ? 'ativado' : 'desativado'}!`, 'success');
  }

  // Relatórios
  gerarRelatorioInventario() {
    const container = document.getElementById('relatorioResultado');
    
    let html = `
      <div class="section-header">
        <h2>Relatório de Inventário Completo</h2>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Gaveteiro</th>
              <th>Gaveta</th>
              <th>Pasta</th>
              <th>Envelopes Presentes</th>
              <th>Total Envelopes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.db.pastas.filter(p => p.ativa).forEach(pasta => {
      const gaveta = this.db.gavetas.find(g => g.id === pasta.gaveta_id);
      const gaveteiro = this.db.gaveteiros.find(gt => gt.id === gaveta?.gaveteiro_id);
      const envelopes = this.db.envelopes.filter(e => e.pasta_id === pasta.id);
      const presentes = envelopes.filter(e => e.status === 'presente').length;
      const statusClass = presentes === envelopes.length ? 'status--success' : 'status--warning';

      html += `
        <tr>
          <td>${gaveteiro?.nome || 'N/A'}</td>
          <td>${gaveta?.numero || 'N/A'}</td>
          <td>${pasta.nome}</td>
          <td>${presentes}</td>
          <td>${envelopes.length}</td>
          <td><span class="status ${statusClass}">${presentes === envelopes.length ? 'Completo' : 'Incompleto'}</span></td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  gerarRelatorioOcupacao() {
    const container = document.getElementById('relatorioResultado');
    
    let html = `
      <div class="section-header">
        <h2>Relatório de Ocupação de Gavetas</h2>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Gaveteiro</th>
              <th>Gaveta</th>
              <th>Capacidade</th>
              <th>Ocupação</th>
              <th>Disponível</th>
              <th>% Ocupado</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.db.gavetas.forEach(gaveta => {
      const gaveteiro = this.db.gaveteiros.find(gt => gt.id === gaveta.gaveteiro_id);
      const percentual = Math.round((gaveta.ocupacao_atual / gaveta.capacidade) * 100);
      const disponivel = gaveta.capacidade - gaveta.ocupacao_atual;
      let statusClass = 'status--success';
      let statusTexto = 'Normal';
      
      if (percentual > 90) {
        statusClass = 'status--error';
        statusTexto = 'Crítico';
      } else if (percentual > 70) {
        statusClass = 'status--warning';
        statusTexto = 'Atenção';
      }

      html += `
        <tr>
          <td>${gaveteiro?.nome || 'N/A'}</td>
          <td>${gaveta.numero}</td>
          <td>${gaveta.capacidade}</td>
          <td>${gaveta.ocupacao_atual}</td>
          <td>${disponivel}</td>
          <td>${percentual}%</td>
          <td><span class="status ${statusClass}">${statusTexto}</span></td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  gerarRelatorioMovimentacoes() {
    const container = document.getElementById('relatorioResultado');
    
    let html = `
      <div class="section-header">
        <h2>Relatório de Movimentações</h2>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Ação</th>
              <th>Pasta</th>
              <th>Envelope</th>
              <th>Usuário</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
    `;

    [...this.db.movimentacoes].reverse().forEach(mov => {
      const envelope = this.db.envelopes.find(e => e.id === mov.item_id);
      const pasta = this.db.pastas.find(p => p.id === envelope?.pasta_id);
      const usuario = this.db.usuarios.find(u => u.id === mov.usuario_id);
      const acaoClass = mov.acao === 'saida' ? 'status--warning' : 'status--success';

      html += `
        <tr>
          <td>${mov.data}</td>
          <td><span class="status ${acaoClass}">${mov.acao === 'saida' ? 'Saída' : 'Entrada'}</span></td>
          <td>${pasta?.nome || 'N/A'}</td>
          <td>${envelope?.tipo || 'N/A'}</td>
          <td>${usuario?.username || 'N/A'}</td>
          <td>${mov.motivo}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  gerarRelatorioLogs() {
    const container = document.getElementById('relatorioResultado');
    
    let html = `
      <div class="section-header">
        <h2>Log de Auditoria</h2>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Ação</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
    `;

    [...this.db.logs].reverse().forEach(log => {
      const usuario = this.db.usuarios.find(u => u.id === log.usuario_id);

      html += `
        <tr>
          <td>${log.timestamp}</td>
          <td>${log.acao}</td>
          <td>${usuario?.username || 'Sistema'}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  // Utilidades
  openModal(title, body, footer) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer;
    document.getElementById('modal').classList.add('show');
  }

  closeModal() {
    document.getElementById('modal').classList.remove('show');
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  addLog(acao, usuarioId) {
    const novoId = Math.max(...this.db.logs.map(l => l.id), 0) + 1;
    this.db.logs.push({
      id: novoId,
      acao,
      usuario_id: usuarioId,
      timestamp: this.getCurrentTimestamp()
    });
    this.saveToStorage();
  }

  getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('pt-BR');
  }

  formatarDataHora(dataStr) {
    if (!dataStr) return 'N/A';
    try {
      const d = new Date(dataStr);
      return d.toLocaleString('pt-BR');
    } catch {
      return dataStr;
    }
  }

  calcularDiasDecorridos(dataInicio) {
    const inicio = new Date(dataInicio);
    const agora = new Date();
    const diffTime = Math.abs(agora - inicio);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  formatarData(data) {
    if (!data) return 'N/A';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  // Persistência simulada (em produção seria SQLite)
  saveToStorage() {
    // Em uma aplicação Electron real, isso seria salvo em SQLite
    // Para esta demo, não usamos localStorage devido às restrições do sandbox
    console.log('Dados salvos (simulado):', this.db);
  }

  loadFromStorage() {
    // Em uma aplicação Electron real, isso carregaria do SQLite
    console.log('Dados carregados (simulado)');
  }
}

// Inicializar aplicação
const app = new HospitalFileManagementApp();