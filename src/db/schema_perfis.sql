-- ============================================
-- SCHEMA COM SISTEMA DE PERFIS DE ACESSO
-- Sistema de Gerenciamento de Arquivos Hospital
-- ============================================
-- 
-- NOVO SISTEMA DE PERMISSÕES:
-- 1. Perfis de acesso com nome e descrição
-- 2. Menus do sistema com controle de acesso
-- 3. Relacionamento perfis_menus (N:N)
-- 4. Usuários vinculados a perfis ao invés de perfil fixo
-- ============================================

-- ============================================
-- TABELA: perfis
-- ============================================
-- Perfis de acesso ao sistema
-- Ex: Administrador, Operador, Consulta, etc.
-- ============================================
CREATE TABLE perfis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    descricao TEXT,
    ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: menus
-- ============================================
-- Menus/funcionalidades disponíveis no sistema
-- Cada menu representa uma tela ou ação
-- ============================================
CREATE TABLE menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    descricao TEXT,
    icone TEXT, -- Nome do ícone para UI
    rota TEXT, -- Identificador da rota/tela
    ordem INTEGER DEFAULT 0, -- Ordem de exibição
    ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: perfis_menus
-- ============================================
-- Relacionamento N:N entre perfis e menus
-- Define quais menus cada perfil tem acesso
-- ============================================
CREATE TABLE perfis_menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    perfil_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    UNIQUE(perfil_id, menu_id) -- Evita duplicatas
);

-- ============================================
-- TABELA: usuarios (ATUALIZADA)
-- ============================================
-- Usuários agora vinculados a perfis
-- perfil_id substitui o campo perfil TEXT
-- ============================================
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL, -- Hash bcrypt da senha
    perfil_id INTEGER NOT NULL, -- Vincula ao perfil de acesso
    funcionario_id INTEGER, -- Opcional: vincula usuário a um funcionário
    ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (perfil_id) REFERENCES perfis(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: funcionarios
-- ============================================
CREATE TABLE funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    departamento TEXT NOT NULL,
    especialidade TEXT, -- CORRIGIDO: era posto_graduacao
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    status TEXT NOT NULL CHECK(status IN ('Ativo', 'Demitido')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: gaveteiros
-- ============================================
CREATE TABLE gaveteiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    localizacao TEXT NOT NULL,
    descricao TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: gavetas
-- ============================================
CREATE TABLE gavetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gaveteiro_id INTEGER NOT NULL,
    numero TEXT NOT NULL,
    capacidade INTEGER NOT NULL DEFAULT 50,
    ocupacao_atual INTEGER NOT NULL DEFAULT 0 CHECK(ocupacao_atual >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gaveteiro_id) REFERENCES gaveteiros(id),
    CHECK(ocupacao_atual <= capacidade)
);

-- ============================================
-- TABELA: pastas
-- ============================================
CREATE TABLE pastas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gaveta_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    data_criacao DATE NOT NULL,
    ordem INTEGER DEFAULT 0,
    ativa INTEGER NOT NULL DEFAULT 1 CHECK(ativa IN (0, 1)),
    arquivo_morto INTEGER NOT NULL DEFAULT 0 CHECK(arquivo_morto IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gaveta_id) REFERENCES gavetas(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: envelopes
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
CREATE TABLE solicitacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK(status IN ('pendente', 'aprovada', 'rejeitada')),
    data_aprovacao DATETIME,
    motivo_rejeicao TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: retiradas_com_pessoas
-- ============================================
CREATE TABLE retiradas_com_pessoas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pasta_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    data_retirada DATETIME NOT NULL,
    data_prevista_retorno DATETIME NOT NULL,
    data_retorno DATETIME,
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
CREATE TABLE alertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    retirada_id INTEGER NOT NULL,
    tipo_alerta TEXT NOT NULL,
    severidade TEXT NOT NULL CHECK(severidade IN ('aviso', 'crítico')),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolvido INTEGER NOT NULL DEFAULT 0 CHECK(resolvido IN (0, 1)),
    FOREIGN KEY (retirada_id) REFERENCES retiradas_com_pessoas(id)
);

-- ============================================
-- TABELA: movimentacoes
-- ============================================
CREATE TABLE movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    tipo_item TEXT NOT NULL CHECK(tipo_item IN ('envelope', 'pasta')),
    acao TEXT NOT NULL CHECK(acao IN ('entrada', 'saida')),
    usuario_id INTEGER NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT NOT NULL,
    descricao TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABELA: logs (CORRIGIDA)
-- ============================================
-- Campo 'detalhes' adicionado para informações extras
-- Campo 'data' renomeado para 'timestamp'
-- ============================================
CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    acao TEXT NOT NULL,
    usuario_id INTEGER,
    registro_id INTEGER,
    tabela_afetada TEXT,
    detalhes TEXT, -- CORRIGIDO: campo adicionado
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, -- CORRIGIDO: era 'data'
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índices para perfis e menus
CREATE INDEX idx_perfis_ativo ON perfis(ativo);
CREATE INDEX idx_menus_ativo ON menus(ativo);
CREATE INDEX idx_menus_ordem ON menus(ordem);
CREATE INDEX idx_perfis_menus_perfil ON perfis_menus(perfil_id);
CREATE INDEX idx_perfis_menus_menu ON perfis_menus(menu_id);

-- Índices para usuários
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil_id);
CREATE INDEX idx_usuarios_funcionario ON usuarios(funcionario_id);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- Índices para funcionários
CREATE INDEX idx_funcionarios_status ON funcionarios(status);
CREATE INDEX idx_funcionarios_departamento ON funcionarios(departamento);

-- Índices para pastas e gavetas
CREATE INDEX idx_pastas_funcionario ON pastas(funcionario_id);
CREATE INDEX idx_pastas_gaveta ON pastas(gaveta_id);
CREATE INDEX idx_pastas_gaveta_ativa ON pastas(gaveta_id, ativa);
CREATE INDEX idx_gavetas_gaveteiro ON gavetas(gaveteiro_id);
CREATE INDEX idx_envelopes_pasta ON envelopes(pasta_id);
CREATE INDEX idx_envelopes_status ON envelopes(status);

-- Índices para retiradas
CREATE INDEX idx_retiradas_usuario ON retiradas_com_pessoas(usuario_id);
CREATE INDEX idx_retiradas_status ON retiradas_com_pessoas(status);
CREATE INDEX idx_retiradas_funcionario ON retiradas_com_pessoas(funcionario_id);
CREATE INDEX idx_retiradas_pasta ON retiradas_com_pessoas(pasta_id);
CREATE INDEX idx_retiradas_status_data ON retiradas_com_pessoas(status, data_retirada);

-- Índices para auditoria
CREATE INDEX idx_movimentacoes_data ON movimentacoes(data);
CREATE INDEX idx_movimentacoes_usuario ON movimentacoes(usuario_id);
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

-- ============================================
-- FIM DO SCHEMA COM PERFIS
-- ============================================