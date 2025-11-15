-- ============================================
-- SCHEMA CORRIGIDO DO BANCO DE DADOS SQLite
-- Sistema de Gerenciamento de Arquivos Hospital
-- ============================================
-- 
-- CORREÇÕES IMPLEMENTADAS:
-- 1. BOOLEAN substituído por INTEGER com CHECK constraints (0 ou 1)
-- 2. Campo 'descricao' adicionado na tabela movimentacoes
-- 3. Índices compostos adicionados para queries com múltiplos WHERE
-- 4. Comentários explicativos em cada tabela
-- 5. Compatibilidade total com SQLite 3
-- ============================================

-- ============================================
-- TABELA: usuarios
-- ============================================
-- Armazena usuários do sistema com autenticação
-- Perfis: 'Administrador' ou 'Usuário Operacional'
-- Senhas devem ser hasheadas com bcrypt antes de inserir
-- ============================================
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL, -- Hash bcrypt da senha
    perfil TEXT NOT NULL CHECK(perfil IN ('Administrador', 'Usuário Operacional')),
    funcionario_id INTEGER, -- Opcional: vincula usuário a um funcionário
    ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0, 1)), -- 0=inativo, 1=ativo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: funcionarios
-- ============================================
-- Armazena dados dos funcionários do hospital
-- Cada funcionário possui arquivos físicos no sistema
-- Status: 'Ativo' ou 'Demitido'
-- ============================================
CREATE TABLE funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    departamento TEXT NOT NULL,
    posto_graduacao TEXT, -- Cargo/função do funcionário
    data_admissao DATE NOT NULL,
    data_demissao DATE, -- NULL se ainda ativo
    status TEXT NOT NULL CHECK(status IN ('Ativo', 'Demitido')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: gaveteiros
-- ============================================
-- Estrutura física de armazenamento de arquivos
-- Cada gaveteiro contém múltiplas gavetas
-- Localização física importante para recuperação
-- ============================================
CREATE TABLE gaveteiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    localizacao TEXT NOT NULL, -- Endereço físico detalhado
    descricao TEXT, -- Informações adicionais sobre uso
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: gavetas
-- ============================================
-- Gavetas individuais dentro dos gaveteiros
-- Controla capacidade e ocupação para gestão de espaço
-- Número identifica posição dentro do gaveteiro
-- ============================================
CREATE TABLE gavetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gaveteiro_id INTEGER NOT NULL,
    numero TEXT NOT NULL, -- Ex: 'A-01', 'B-05'
    capacidade INTEGER NOT NULL DEFAULT 50, -- Quantidade máxima de pastas
    ocupacao_atual INTEGER NOT NULL DEFAULT 0 CHECK(ocupacao_atual >= 0), -- Quantidade atual
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gaveteiro_id) REFERENCES gaveteiros(id),
    CHECK(ocupacao_atual <= capacidade) -- Garante não ultrapassar capacidade
);

-- ============================================
-- TABELA: pastas
-- ============================================
-- Pastas de documentos dos funcionários
-- Cada funcionário pode ter múltiplas pastas
-- Controle de arquivo ativo vs arquivo morto
-- ============================================
CREATE TABLE pastas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gaveta_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    data_criacao DATE NOT NULL,
    ordem INTEGER DEFAULT 0, -- Ordem dentro da gaveta
    ativa INTEGER NOT NULL DEFAULT 1 CHECK(ativa IN (0, 1)), -- 0=inativa, 1=ativa
    arquivo_morto INTEGER NOT NULL DEFAULT 0 CHECK(arquivo_morto IN (0, 1)), -- 0=não, 1=sim
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gaveta_id) REFERENCES gavetas(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: envelopes
-- ============================================
-- Envelopes dentro das pastas (categorias de documentos)
-- Tipos fixos: Segurança, Medicina, Pessoal, Treinamento
-- Status rastreia se envelope está presente ou retirado
-- ============================================
CREATE TABLE envelopes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pasta_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('Segurança', 'Medicina', 'Pessoal', 'Treinamento')),
    status TEXT NOT NULL CHECK(status IN ('presente', 'retirado')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pasta_id) REFERENCES pastas(id)
);

-- ============================================
-- TABELA: solicitacoes
-- ============================================
-- Solicitações de retirada de documentos
-- Requer aprovação antes de permitir retirada
-- Mantém histórico de aprovações/rejeições
-- ============================================
CREATE TABLE solicitacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL, -- Quem solicitou
    funcionario_id INTEGER NOT NULL, -- De qual funcionário
    motivo TEXT NOT NULL, -- Justificativa da solicitação
    data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK(status IN ('pendente', 'aprovada', 'rejeitada')),
    data_aprovacao DATETIME, -- Quando foi aprovada/rejeitada
    motivo_rejeicao TEXT, -- Justificativa se rejeitada
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: retiradas_com_pessoas
-- ============================================
-- Registro de retiradas ativas de pastas
-- Controla empréstimos de documentos com prazo
-- Status: ativo, devolvido, vencido
-- dias_decorridos calculado automaticamente
-- ============================================
CREATE TABLE retiradas_com_pessoas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pasta_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL, -- Quem retirou
    funcionario_id INTEGER NOT NULL, -- Pasta de qual funcionário
    data_retirada DATETIME NOT NULL,
    data_prevista_retorno DATETIME NOT NULL,
    data_retorno DATETIME, -- NULL se ainda não devolvido
    status TEXT NOT NULL CHECK(status IN ('ativo', 'devolvido', 'vencido')),
    dias_decorridos INTEGER DEFAULT 0 CHECK(dias_decorridos >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pasta_id) REFERENCES pastas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: alertas
-- ============================================
-- Alertas de vencimento de retiradas
-- Severidade: aviso (próximo ao vencimento) ou crítico (vencido)
-- resolvido indica se alerta foi tratado
-- ============================================
CREATE TABLE alertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    retirada_id INTEGER NOT NULL,
    tipo_alerta TEXT NOT NULL, -- Descrição do alerta
    severidade TEXT NOT NULL CHECK(severidade IN ('aviso', 'crítico')),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolvido INTEGER NOT NULL DEFAULT 0 CHECK(resolvido IN (0, 1)), -- 0=não, 1=sim
    FOREIGN KEY (retirada_id) REFERENCES retiradas_com_pessoas(id)
);

-- ============================================
-- TABELA: movimentacoes
-- ============================================
-- Histórico completo de movimentações
-- Registra entrada/saída de envelopes e pastas
-- Inclui motivo e descrição detalhada
-- ============================================
CREATE TABLE movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL, -- ID do envelope ou pasta
    tipo_item TEXT NOT NULL CHECK(tipo_item IN ('envelope', 'pasta')),
    acao TEXT NOT NULL CHECK(acao IN ('entrada', 'saida')),
    usuario_id INTEGER NOT NULL, -- Quem realizou a movimentação
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT NOT NULL, -- Justificativa da movimentação
    descricao TEXT, -- Detalhes adicionais da movimentação
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABELA: logs
-- ============================================
-- Logs completos de auditoria do sistema
-- Registra todas as ações importantes
-- Permite rastreamento de atividades
-- ============================================
CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    acao TEXT NOT NULL, -- Descrição da ação realizada
    usuario_id INTEGER, -- Quem realizou (NULL para ações do sistema)
    registro_id INTEGER, -- ID do registro afetado
    tabela_afetada TEXT, -- Nome da tabela afetada
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- ÍNDICES SIMPLES - Relacionamentos e Buscas Frequentes
-- ============================================

-- Índices para relacionamentos de pastas
CREATE INDEX idx_pastas_funcionario ON pastas(funcionario_id);
CREATE INDEX idx_pastas_gaveta ON pastas(gaveta_id);
CREATE INDEX idx_gavetas_gaveteiro ON gavetas(gaveteiro_id);
CREATE INDEX idx_envelopes_pasta ON envelopes(pasta_id);

-- Índices para usuários e funcionários
CREATE INDEX idx_usuarios_funcionario ON usuarios(funcionario_id);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_funcionarios_status ON funcionarios(status);
CREATE INDEX idx_funcionarios_departamento ON funcionarios(departamento);

-- Índices para retiradas
CREATE INDEX idx_retiradas_usuario ON retiradas_com_pessoas(usuario_id);
CREATE INDEX idx_retiradas_status ON retiradas_com_pessoas(status);
CREATE INDEX idx_retiradas_funcionario ON retiradas_com_pessoas(funcionario_id);
CREATE INDEX idx_retiradas_pasta ON retiradas_com_pessoas(pasta_id);

-- Índices para auditoria e movimentações
CREATE INDEX idx_movimentacoes_data ON movimentacoes(data);
CREATE INDEX idx_movimentacoes_usuario ON movimentacoes(usuario_id);
CREATE INDEX idx_movimentacoes_tipo_item ON movimentacoes(tipo_item);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_usuario ON logs(usuario_id);
CREATE INDEX idx_logs_tabela ON logs(tabela_afetada);

-- Índices para solicitações
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_usuario ON solicitacoes(usuario_id);
CREATE INDEX idx_solicitacoes_funcionario ON solicitacoes(funcionario_id);

-- Índices para alertas
CREATE INDEX idx_alertas_retirada ON alertas(retirada_id);
CREATE INDEX idx_alertas_resolvido ON alertas(resolvido);
CREATE INDEX idx_alertas_severidade ON alertas(severidade);

-- Índices para envelopes
CREATE INDEX idx_envelopes_status ON envelopes(status);
CREATE INDEX idx_envelopes_tipo ON envelopes(tipo);

-- ============================================
-- ÍNDICES COMPOSTOS - Queries com Múltiplos Filtros
-- ============================================

-- Busca de pastas ativas por gaveta e status
CREATE INDEX idx_pastas_gaveta_ativa ON pastas(gaveta_id, ativa);

-- Busca de pastas por funcionário e status de arquivo
CREATE INDEX idx_pastas_funcionario_arquivo ON pastas(funcionario_id, arquivo_morto);

-- Busca de retiradas por status e data
CREATE INDEX idx_retiradas_status_data ON retiradas_com_pessoas(status, data_retirada);

-- Busca de retiradas vencidas (status e data prevista)
CREATE INDEX idx_retiradas_status_prevista ON retiradas_com_pessoas(status, data_prevista_retorno);

-- Busca de alertas não resolvidos por severidade
CREATE INDEX idx_alertas_resolvido_severidade ON alertas(resolvido, severidade);

-- Busca de solicitações pendentes por data
CREATE INDEX idx_solicitacoes_status_data ON solicitacoes(status, data_solicitacao);

-- Busca de movimentações por tipo e data
CREATE INDEX idx_movimentacoes_tipo_data ON movimentacoes(tipo_item, data);

-- Busca de movimentações por usuário e ação
CREATE INDEX idx_movimentacoes_usuario_acao ON movimentacoes(usuario_id, acao);

-- Busca de envelopes retirados por pasta
CREATE INDEX idx_envelopes_pasta_status ON envelopes(pasta_id, status);

-- Busca de gavetas com ocupação
CREATE INDEX idx_gavetas_gaveteiro_ocupacao ON gavetas(gaveteiro_id, ocupacao_atual);

-- Busca de funcionários ativos por departamento
CREATE INDEX idx_funcionarios_status_dept ON funcionarios(status, departamento);

-- Busca de usuários ativos
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- ============================================
-- FIM DO SCHEMA CORRIGIDO
-- ============================================