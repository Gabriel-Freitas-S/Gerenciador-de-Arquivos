-- Schema do Banco de Dados SQLite
-- Sistema de Gerenciamento de Arquivos Hospital

-- ============================================
-- TABELA: usuarios
-- Usuários do sistema com autenticação e perfis
-- ============================================
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK(perfil IN ('Administrador', 'Usuário Operacional')),
    funcionario_id INTEGER,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: funcionarios
-- Funcionários do hospital (arquivos físicos)
-- ============================================
CREATE TABLE funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    departamento TEXT NOT NULL,
    posto_graduacao TEXT,
    especialidade TEXT,
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    status TEXT NOT NULL CHECK(status IN ('Ativo', 'Demitido')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: gaveteiros
-- Estrutura física de armazenamento
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
-- Gavetas individuais dentro dos gaveteiros
-- ============================================
CREATE TABLE gavetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gaveteiro_id INTEGER NOT NULL,
    numero TEXT NOT NULL,
    capacidade INTEGER NOT NULL DEFAULT 50,
    ocupacao_atual INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gaveteiro_id) REFERENCES gaveteiros(id)
);

-- ============================================
-- TABELA: pastas
-- Pastas de documentos dos funcionários
-- ============================================
CREATE TABLE pastas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gaveta_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    data_criacao DATE NOT NULL,
    ordem INTEGER DEFAULT 0,
    ativa BOOLEAN DEFAULT 1,
    arquivo_morto BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gaveta_id) REFERENCES gavetas(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: envelopes
-- Envelopes dentro das pastas (categorias de documentos)
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
-- Solicitações de retirada de documentos
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
-- Registro de retiradas ativas de pastas
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
    dias_decorridos INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pasta_id) REFERENCES pastas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- ============================================
-- TABELA: alertas
-- Alertas de vencimento de retiradas
-- ============================================
CREATE TABLE alertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    retirada_id INTEGER NOT NULL,
    tipo_alerta TEXT NOT NULL,
    severidade TEXT NOT NULL CHECK(severidade IN ('aviso', 'crítico')),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolvido BOOLEAN DEFAULT 0,
    FOREIGN KEY (retirada_id) REFERENCES retiradas_com_pessoas(id)
);

-- ============================================
-- TABELA: movimentacoes
-- Histórico de movimentações de envelopes e pastas
-- ============================================
CREATE TABLE movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    tipo_item TEXT NOT NULL CHECK(tipo_item IN ('envelope', 'pasta')),
    acao TEXT NOT NULL CHECK(acao IN ('entrada', 'saida')),
    usuario_id INTEGER NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABELA: logs
-- Logs de auditoria do sistema
-- ============================================
CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    acao TEXT NOT NULL,
    usuario_id INTEGER,
    registro_id INTEGER,
    tabela_afetada TEXT,
    detalhes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABELA: menus
-- Menus disponíveis no sistema
-- ============================================
CREATE TABLE menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    rota TEXT NOT NULL UNIQUE,
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: usuarios_menus
-- Relacionamento N:N entre usuários e menus (permissões)
-- ============================================
CREATE TABLE usuarios_menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, menu_id)
);

-- ============================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- ============================================

-- Índices para relacionamentos frequentes
CREATE INDEX idx_pastas_funcionario ON pastas(funcionario_id);
CREATE INDEX idx_pastas_gaveta ON pastas(gaveta_id);
CREATE INDEX idx_gavetas_gaveteiro ON gavetas(gaveteiro_id);
CREATE INDEX idx_envelopes_pasta ON envelopes(pasta_id);

-- Índices para queries de retiradas
CREATE INDEX idx_retiradas_usuario ON retiradas_com_pessoas(usuario_id);
CREATE INDEX idx_retiradas_status ON retiradas_com_pessoas(status);
CREATE INDEX idx_retiradas_funcionario ON retiradas_com_pessoas(funcionario_id);

-- Índices para auditoria e movimentações
CREATE INDEX idx_movimentacoes_data ON movimentacoes(data);
CREATE INDEX idx_movimentacoes_usuario ON movimentacoes(usuario_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_usuario ON logs(usuario_id);

-- Índices para solicitações
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_usuario ON solicitacoes(usuario_id);

-- Índices para alertas
CREATE INDEX idx_alertas_retirada ON alertas(retirada_id);
CREATE INDEX idx_alertas_resolvido ON alertas(resolvido);

-- Índices para menus e permissões
CREATE INDEX idx_menus_rota ON menus(rota);
CREATE INDEX idx_menus_ativo ON menus(ativo);
CREATE INDEX idx_usuarios_menus_usuario ON usuarios_menus(usuario_id);
CREATE INDEX idx_usuarios_menus_menu ON usuarios_menus(menu_id);