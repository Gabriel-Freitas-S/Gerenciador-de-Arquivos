// ============================================
// UI LAYER - Gerenciamento de Interface
// ============================================

/**
 * Gerencia toda a interface do usuário
 * Responsável por renderização de views, modals, toasts e navegação
 */
class UIManager {
  constructor(authManager, databaseLayer) {
    this.auth = authManager;
    this.db = databaseLayer;
    this.currentView = 'dashboard';
  }

  // ==========================================
  // NAVEGAÇÃO E TELAS
  // ==========================================

  /**
   * Mostra a tela de login
   */
  showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  }

  /**
   * Mostra a tela principal
   */
  showMainScreen() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
    
    // Atualizar info do usuário
    const user = this.auth.getCurrentUser();
    document.getElementById('currentUserName').textContent = user.username;
    document.getElementById('currentUserRole').textContent = user.perfil;
    this.applyNavigationPermissions();
    this.navigateToView(this.auth.getDefaultView());
  }

  /**
   * Navega para uma view específica
   * @param {string} viewName - Nome da view
   */
  async navigateToView(viewName) {
    if (!this.auth.canAccessView(viewName)) {
      this.showToast('Acesso negado para esta funcionalidade.', 'error');
      return;
    }
    // Verificar permissão
    this.currentView = viewName;

    // Atualizar navegação ativa
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      }
    });

    // Mostrar view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewElement = document.getElementById(`${viewName}View`);
    if (viewElement) {
      viewElement.classList.add('active');
      await this.renderView(viewName);
    }
  }

  applyNavigationPermissions() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const view = item.getAttribute('data-view');
      item.style.display = this.auth.canAccessView(view) ? 'flex' : 'none';
    });
  }

  /**
   * Renderiza a view especificada
   * @param {string} view - Nome da view
   */
  async renderView(view) {
    switch(view) {
      case 'dashboard':
        await this.renderDashboard();
        break;
      case 'solicitacoes':
        await this.renderSolicitacoes();
        break;
      case 'minhasRetiradas':
        await this.renderMinhasRetiradas();
        break;
      case 'alertas':
        await this.renderAlertas();
        break;
      case 'gavetas':
        await this.renderGavetas();
        break;
      case 'pastas':
        await this.renderPastas();
        break;
      case 'movimentacoes':
        await this.renderMovimentacoes();
        break;
      case 'arquivoMorto':
        await this.renderArquivoMorto();
        break;
      case 'admin':
        await this.renderAdmin();
        break;
    }
  }

  // ==========================================
  // MODALS
  // ==========================================

  /**
   * Abre modal genérico
   * @param {string} title - Título do modal
   * @param {string} bodyContent - Conteúdo HTML do corpo
   * @param {string} footerContent - Conteúdo HTML do rodapé
   */
  openModal(title, bodyContent, footerContent = '') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyContent;
    document.getElementById('modalFooter').innerHTML = footerContent || `
      <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
    `;
    document.getElementById('modal').classList.add('show');
  }

  /**
   * Fecha modal
   */
  closeModal() {
    document.getElementById('modal').classList.remove('show');
  }

  // ==========================================
  // TOASTS / NOTIFICAÇÕES
  // ==========================================

  /**
   * Mostra notificação toast
   * @param {string} message - Mensagem
   * @param {string} type - Tipo: success, error, warning, info
   */
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ==========================================
  // RENDERIZAÇÃO: DASHBOARD
  // ==========================================

  /**
   * Renderiza o dashboard
   */
  async renderDashboard() {
    try {
      // Buscar estatísticas
      const stats = await this.db.getEstatisticas();
      
      // Atualizar cards
      document.getElementById('totalGavetas').textContent = stats.totalGavetas || 0;
      document.getElementById('totalPastas').textContent = stats.totalPastas || 0;
      document.getElementById('itensRetirados').textContent = stats.itensRetirados || 0;
      document.getElementById('gavetasCheias').textContent = stats.alertasCriticos || 0;

      // Atualizar alertas
      try {
        await this.db.atualizarAlertas();
      } catch (error) {
        console.warn('Erro ao atualizar alertas:', error);
      }

      // Renderizar alertas no dashboard
      await this.renderDashboardAlerts();

      // Renderizar itens retirados
      await this.renderItensRetirados();
    } catch (error) {
      console.error('Erro ao renderizar dashboard:', error);
      this.showToast('Erro ao carregar dashboard', 'error');
    }
  }

  /**
   * Renderiza alertas do dashboard
   */
  async renderDashboardAlerts() {
    const alertsSection = document.getElementById('alertsSection');
    alertsSection.innerHTML = '';

    const user = this.auth.getCurrentUser();

    // Minhas retiradas
    const minhasRetiradas = await this.db.getRetiradasByUsuario(user.id);
    
    for (const retirada of minhasRetiradas) {
      const pasta = await this.db.getPastaById(retirada.pasta_id);
      const funcionario = await this.db.getFuncionarioById(retirada.funcionario_id);
      const diasDecorridos = this.calcularDiasDecorridos(retirada.data_retirada);
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
    }

    // Alertas para admin
    if (this.auth.isAdmin()) {
      const solicitacoesPendentes = (await this.db.getSolicitacoesPendentes()).length;
      if (solicitacoesPendentes > 0) {
        alertsSection.innerHTML += `
          <div class="alert alert-info">
            <strong>ℹ️ Admin:</strong> Você tem ${solicitacoesPendentes} solicitação(ões) pendente(s) de aprovação.
          </div>
        `;
      }

      const alertasCriticos = (await this.db.getAlertasAtivos()).filter(a => a.severidade === 'crítico').length;
      if (alertasCriticos > 0) {
        alertsSection.innerHTML += `
          <div class="alert alert-error">
            <strong>⚠️ Admin:</strong> ${alertasCriticos} arquivo(s) com prazo vencido (7+ dias).
          </div>
        `;
      }
    }
  }

  /**
   * Renderiza lista de itens retirados
   */
  async renderItensRetirados() {
    const container = document.getElementById('itensRetiradosList');
    const retiradas = await this.db.getRetiradasAtivas();

    if (retiradas.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum item retirado no momento</div>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Pasta</th>
            <th>Usuário</th>
            <th>Data Retirada</th>
            <th>Prazo Devolução</th>
            <th>Dias</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const retirada of retiradas) {
      const pasta = await this.db.getPastaById(retirada.pasta_id);
      const funcionario = await this.db.getFuncionarioById(retirada.funcionario_id);
      const usuario = (await this.db.getUsuarios()).find(u => u.id === retirada.usuario_id);
      const diasDecorridos = this.calcularDiasDecorridos(retirada.data_retirada);
      const prazo = funcionario?.status === 'Demitido' ? 3 : 7;
      
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
          <td>${usuario?.username || 'N/A'}</td>
          <td>${this.formatarDataHora(retirada.data_retirada)}</td>
          <td>${this.formatarDataHora(retirada.data_prevista_retorno)}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
          <td><span class="status status--warning">Retirado</span></td>
        </tr>
      `;
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ==========================================
  // RENDERIZAÇÃO: SOLICITAÇÕES
  // ==========================================

  /**
   * Renderiza lista de solicitações
   */
  async renderSolicitacoes(filtro = '') {
    const container = document.getElementById('funcionariosContainer');
    let funcionarios = (await this.db.getFuncionarios()).filter(f => f.status === 'Ativo');

    if (filtro) {
      funcionarios = funcionarios.filter(f => f.nome.toLowerCase().includes(filtro.toLowerCase()));
    }

    if (funcionarios.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum funcionário encontrado</div>';
      return;
    }

    const solicitacoes = await this.db.getSolicitacoes();
    const retiradas = await this.db.getRetiradasAtivas();
    const userId = this.auth.getUserId();

    let html = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Departamento</th>
            <th>Data Admissão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const func of funcionarios) {
      const solicitacaoPendente = solicitacoes.find(s =>
        s.usuario_id === userId &&
        s.funcionario_id === func.id &&
        s.status === 'pendente'
      );

      const pasta = (await this.db.getPastas()).find(p => p.funcionario_id === func.id && p.ativa && !p.arquivo_morto);
      const retiradaAtiva = pasta ? retiradas.find(r => r.pasta_id === pasta.id) : null;

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
          <td>${func.departamento}</td>
          <td>${this.formatarData(func.data_admissao)}</td>
          <td><span class="status status--success">${func.status}</span></td>
          <td>${actionBtn}</td>
        </tr>
      `;
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ==========================================
  // RENDERIZAÇÃO: MINHAS RETIRADAS
  // ==========================================

  /**
   * Renderiza minhas retiradas
   */
  async renderMinhasRetiradas() {
    const container = document.getElementById('minhasRetiradasContainer');
    const minhasRetiradas = await this.db.getRetiradasByUsuario(this.auth.getUserId());

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

    for (const retirada of minhasRetiradas) {
      const pasta = await this.db.getPastaById(retirada.pasta_id);
      const funcionario = await this.db.getFuncionarioById(retirada.funcionario_id);
      const diasDecorridos = this.calcularDiasDecorridos(retirada.data_retirada);
      const prazo = funcionario?.status === 'Demitido' ? 3 : 7;
      
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
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ==========================================
  // RENDERIZAÇÃO: ALERTAS
  // ==========================================

  /**
   * Renderiza alertas
   */
  async renderAlertas() {
    const container = document.getElementById('alertasContainer');
    try {
      await this.db.atualizarAlertas();
    } catch (error) {
      console.warn('Erro ao atualizar alertas:', error);
    }

    const alertasAtivos = await this.db.getAlertasAtivos();

    if (alertasAtivos.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum alerta ativo no momento</div>';
      return;
    }

    let html = '';

    for (const alerta of alertasAtivos) {
      const retiradas = await this.db.getRetiradasAtivas();
      const retirada = retiradas.find(r => r.id === alerta.retirada_id);
      const pasta = await this.db.getPastaById(retirada?.pasta_id);
      const usuarios = await this.db.getUsuarios();
      const usuario = usuarios.find(u => u.id === retirada?.usuario_id);
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
    }

    container.innerHTML = html;
  }

  // ==========================================
  // RENDERIZAÇÃO: GAVETAS
  // ==========================================

  /**
   * Renderiza estrutura de gavetas
   */
  async renderGavetas() {
    const container = document.getElementById('gaveteirosContainer');
    const gaveteiros = await this.db.getGaveteiros();
    const gavetas = await this.db.getGavetas();

    let html = '';

    for (const gaveteiro of gaveteiros) {
      const gavetasDoGaveteiro = gavetas.filter(g => g.gaveteiro_id === gaveteiro.id);
      
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

      for (const gaveta of gavetasDoGaveteiro) {
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
      }

      html += `
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // ==========================================
  // RENDERIZAÇÃO: PASTAS
  // ==========================================

  /**
   * Renderiza pastas
   */
  async renderPastas(filtro = '') {
    const container = document.getElementById('pastasContainer');
    let pastas = (await this.db.getPastas()).filter(p => p.ativa);

    if (filtro) {
      pastas = pastas.filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()));
    }

    pastas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

    if (pastas.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma pasta encontrada</div>';
      return;
    }

    const gaveteiros = await this.db.getGaveteiros();
    const gavetas = await this.db.getGavetas();

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

    for (const pasta of pastas) {
      const gaveta = gavetas.find(g => g.id === pasta.gaveta_id);
      const gaveteiro = gaveteiros.find(gt => gt.id === gaveta?.gaveteiro_id);
      const envelopes = await this.db.getEnvelopesByPasta(pasta.id);
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
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ==========================================
  // RENDERIZAÇÃO: MOVIMENTAÇÕES
  // ==========================================

  /**
   * Renderiza histórico de movimentações
   */
  async renderMovimentacoes(filtro = '') {
    const container = document.getElementById('movimentacoesContainer');
    let movimentacoes = await this.db.getMovimentacoes();
    movimentacoes = [...movimentacoes].reverse();

    if (filtro) {
      // Implementar filtro se necessário
    }

    if (movimentacoes.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma movimentação registrada</div>';
      return;
    }

    const usuarios = await this.db.getUsuarios();
    const pastas = await this.db.getPastas();

    let html = `
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Ação</th>
            <th>Descrição</th>
            <th>Usuário</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const mov of movimentacoes) {
      const usuario = usuarios.find(u => u.id === mov.usuario_id);
      const acaoClass = mov.acao === 'saida' ? 'status--warning' : 'status--success';
      const acaoTexto = mov.acao === 'saida' ? 'Saída' : mov.acao === 'entrada' ? 'Entrada' : mov.acao;

      html += `
        <tr>
          <td>${this.formatarDataHora(mov.data)}</td>
          <td><span class="status ${acaoClass}">${acaoTexto}</span></td>
          <td>${mov.descricao || mov.motivo || '-'}</td>
          <td>${usuario?.username || 'Sistema'}</td>
        </tr>
      `;
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ==========================================
  // RENDERIZAÇÃO: ARQUIVO MORTO
  // ==========================================

  /**
   * Renderiza arquivo morto
   */
  async renderArquivoMorto() {
    const container = document.getElementById('arquivoMortoContainer');
    const pastasArquivoMorto = await this.db.getPastasArquivoMorto();

    if (pastasArquivoMorto.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum arquivo no Arquivo Morto</div>';
      return;
    }

    const gruposPorAno = pastasArquivoMorto.reduce((acc, pasta) => {
      const anoDemissao = pasta.data_demissao
        ? new Date(pasta.data_demissao).getFullYear().toString()
        : 'Sem registro';
      acc[anoDemissao] = acc[anoDemissao] || [];
      acc[anoDemissao].push(pasta);
      return acc;
    }, {});

    const anosOrdenados = Object.keys(gruposPorAno).sort((a, b) => {
      if (a === 'Sem registro') return 1;
      if (b === 'Sem registro') return -1;
      return parseInt(b, 10) - parseInt(a, 10);
    });

    let html = '';

    for (const ano of anosOrdenados) {
      const registros = gruposPorAno[ano]
        .slice()
        .sort((a, b) => (a.funcionario_nome || a.nome)
          .localeCompare(b.funcionario_nome || b.nome, 'pt-BR', { sensitivity: 'base' }));

      const titulo = ano === 'Sem registro' ? 'Sem data de demissão' : `Ano ${ano}`;

      html += `
        <div class="arquivo-morto-group">
          <div class="section-header" style="margin-top: 0;">
            <h3>${titulo}</h3>
          </div>
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

      for (const pasta of registros) {
        html += `
          <tr>
            <td><strong>${pasta.nome}</strong> <span class="arquivo-morto-badge">ARQUIVO MORTO</span></td>
            <td>${pasta.funcionario_nome || 'N/A'}</td>
            <td><span class="status status--error">${pasta.funcionario_status || 'N/A'}</span></td>
            <td>${this.formatarData(pasta.data_criacao)}</td>
            <td>${pasta.data_demissao ? this.formatarData(pasta.data_demissao) : 'N/A'}</td>
            <td>${pasta.departamento || 'N/A'}</td>
          </tr>
        `;
      }

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // ==========================================
  // RENDERIZAÇÃO: ADMIN
  // ==========================================

  /**
   * Renderiza área administrativa
   */
  async renderAdmin() {
    await this.renderSolicitacoesPendentes();
    await this.renderFuncionariosAdmin();
    await this.renderUsuariosAdmin();
  }

  /**
   * Renderiza solicitações pendentes (admin)
   */
  async renderSolicitacoesPendentes() {
    const container = document.getElementById('solicitacoesPendentesContainer');
    const pendentes = await this.db.getSolicitacoesPendentes();

    if (pendentes.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma solicitação pendente</div>';
      return;
    }

    const usuarios = await this.db.getUsuarios();
    const funcionarios = await this.db.getFuncionarios();

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

    for (const sol of pendentes) {
      const usuario = usuarios.find(u => u.id === sol.usuario_id);
      const funcionario = funcionarios.find(f => f.id === sol.funcionario_id);

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
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  /**
   * Renderiza gerenciamento de funcionários (admin)
   */
  async renderFuncionariosAdmin() {
    const container = document.getElementById('funcionariosAdminContainer');
    const funcionarios = await this.db.getFuncionarios(true);
    
    let html = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Departamento</th>
            <th>Admissão</th>
            <th>Demissão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const func of funcionarios) {
      const statusClass = func.status === 'Ativo' ? 'status--success' : 'status--error';
      
      html += `
        <tr>
          <td><strong>${func.nome}</strong></td>
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
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  /**
   * Renderiza gerenciamento de usuários (admin)
   */
  async renderUsuariosAdmin() {
    const container = document.getElementById('usuariosContainer');
    const usuarios = await this.db.getUsuarios(true);
    
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

    for (const user of usuarios) {
      const statusClass = user.ativo ? 'status--success' : 'status--error';
      const statusTexto = user.ativo ? 'Ativo' : 'Inativo';

      html += `
        <tr>
          <td><strong>${user.username}</strong></td>
          <td>${user.perfil_nome || user.perfil || 'N/A'}</td>
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
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================

  /**
   * Calcula dias decorridos desde uma data
   * @param {string} dataInicio
   * @returns {number}
   */
  calcularDiasDecorridos(dataInicio) {
    const inicio = new Date(dataInicio);
    const agora = new Date();
    const diffTime = Math.abs(agora - inicio);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Formata data no padrão brasileiro
   * @param {string} data
   * @returns {string}
   */
  formatarData(data) {
    if (!data) return 'N/A';
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  }

  /**
   * Formata data e hora no padrão brasileiro
   * @param {string} dataStr
   * @returns {string}
   */
  formatarDataHora(dataStr) {
    if (!dataStr) return 'N/A';
    try {
      const d = new Date(dataStr);
      return d.toLocaleString('pt-BR');
    } catch {
      return dataStr;
    }
  }

  /**
   * Obtém data atual no formato YYYY-MM-DD
   * @returns {string}
   */
  getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Obtém timestamp atual formatado
   * @returns {string}
   */
  getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('pt-BR');
  }
}
