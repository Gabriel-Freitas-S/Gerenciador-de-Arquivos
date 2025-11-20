-- ============================================
-- SEEDS COM SISTEMA DE PERFIS DE ACESSO
-- Sistema de Gerenciamento de Arquivos Hospital
-- ============================================

-- ============================================
-- PERFIS DE ACESSO
-- ============================================
INSERT INTO perfis (nome, descricao, ativo) VALUES
('Administrador', 'Acesso completo ao sistema, incluindo configurações e gerenciamento de usuários', 1),
('Operador Completo', 'Acesso a todas as funcionalidades operacionais, exceto configurações de sistema', 1),
('Operador Consulta', 'Acesso apenas para consulta de informações, sem permissão de edição', 1),
('Arquivista', 'Especializado em gerenciamento de arquivo físico (gaveteiros, gavetas, pastas)', 1);

-- ============================================
-- MENUS DO SISTEMA
-- ============================================
INSERT INTO menus (nome, descricao, icone, rota, ordem, ativo) VALUES
('Dashboard', 'Painel principal com estatísticas e resumo', 'dashboard', 'dashboard', 1, 1),
('Funcionários', 'Cadastro e gerenciamento de funcionários', 'people', 'funcionarios', 2, 1),
('Gaveteiros', 'Gerenciamento de gaveteiros e estrutura física', 'archive', 'gaveteiros', 3, 1),
('Gavetas', 'Visualização e organização de gavetas', 'folder', 'gavetas', 4, 1),
('Pastas', 'Gerenciamento de pastas de documentos', 'description', 'pastas', 5, 1),
('Solicitações', 'Solicitações de retirada de documentos', 'assignment', 'solicitacoes', 6, 1),
('Retiradas', 'Controle de documentos retirados', 'exit_to_app', 'retiradas', 7, 1),
('Alertas', 'Avisos de vencimento e pendências', 'warning', 'alertas', 8, 1),
('Movimentações', 'Histórico de movimentações de documentos', 'swap_horiz', 'movimentacoes', 9, 1),
('Relatórios', 'Geração de relatórios e análises', 'assessment', 'relatorios', 10, 1),
('Usuários', 'Gerenciamento de usuários do sistema', 'person_add', 'usuarios', 11, 1),
('Perfis', 'Configuração de perfis de acesso', 'security', 'perfis', 12, 1),
('Logs', 'Auditoria e logs do sistema', 'history', 'logs', 13, 1),
('Configurações', 'Configurações gerais do sistema', 'settings', 'configuracoes', 14, 1),
('Arquivo Morto', 'Consulta de arquivos arquivados', 'inventory_2', 'arquivoMorto', 15, 1),
('Minhas Retiradas', 'Arquivos atualmente em posse do usuário', 'assignment_ind', 'minhasRetiradas', 16, 1),
('Administração', 'Painel administrativo com cadastros e aprovações', 'admin_panel_settings', 'admin', 17, 1);

-- ============================================
-- PERMISSÕES: ADMINISTRADOR (Acesso Total)
-- ============================================
INSERT INTO perfis_menus (perfil_id, menu_id) VALUES
(1, 1),  -- Dashboard
(1, 2),  -- Funcionários
(1, 3),  -- Gaveteiros
(1, 4),  -- Gavetas
(1, 5),  -- Pastas
(1, 6),  -- Solicitações
(1, 7),  -- Retiradas
(1, 8),  -- Alertas
(1, 9),  -- Movimentações
(1, 10), -- Relatórios
(1, 11), -- Usuários
(1, 12), -- Perfis
(1, 13), -- Logs
(1, 14), -- Configurações
(1, 15), -- Arquivo Morto
(1, 16), -- Minhas Retiradas
(1, 17); -- Administração

-- ============================================
-- PERMISSÕES: OPERADOR COMPLETO
-- ============================================
INSERT INTO perfis_menus (perfil_id, menu_id) VALUES
(2, 1),  -- Dashboard
(2, 2),  -- Funcionários
(2, 3),  -- Gaveteiros
(2, 4),  -- Gavetas
(2, 5),  -- Pastas
(2, 6),  -- Solicitações
(2, 7),  -- Retiradas
(2, 8),  -- Alertas
(2, 9),  -- Movimentações
(2, 10), -- Relatórios
(2, 15), -- Arquivo Morto
(2, 16); -- Minhas Retiradas

-- ============================================
-- PERMISSÕES: OPERADOR CONSULTA
-- ============================================
INSERT INTO perfis_menus (perfil_id, menu_id) VALUES
(3, 1),  -- Dashboard
(3, 2),  -- Funcionários (apenas visualização)
(3, 4),  -- Gavetas (apenas visualização)
(3, 5),  -- Pastas (apenas visualização)
(3, 7),  -- Retiradas (apenas visualização)
(3, 10), -- Relatórios
(3, 16); -- Minhas Retiradas

-- ============================================
-- PERMISSÕES: ARQUIVISTA
-- ============================================
INSERT INTO perfis_menus (perfil_id, menu_id) VALUES
(4, 1),  -- Dashboard
(4, 2),  -- Funcionários
(4, 3),  -- Gaveteiros (foco principal)
(4, 4),  -- Gavetas (foco principal)
(4, 5),  -- Pastas (foco principal)
(4, 9),  -- Movimentações
(4, 10), -- Relatórios
(4, 15), -- Arquivo Morto
(4, 16); -- Minhas Retiradas

-- ============================================
-- FUNCIONÁRIOS DE EXEMPLO
-- ============================================
INSERT INTO funcionarios (nome, departamento, especialidade, data_admissao, status) VALUES
('João da Silva', 'Enfermagem', 'Enfermeiro', '2020-01-15', 'Ativo'),
('Maria Santos', 'Administrativo', 'Assistente Administrativo', '2019-03-22', 'Ativo'),
('Pedro Oliveira', 'Medicina', 'Médico', '2021-06-10', 'Ativo'),
('Ana Costa', 'RH', 'Analista de RH', '2018-11-05', 'Demitido'),
('Carlos Ferreira', 'Laboratório', 'Técnico de Laboratório', '2022-02-14', 'Ativo'),
('Juliana Lima', 'Farmácia', 'Farmacêutica', '2020-08-20', 'Ativo'),
('Roberto Alves', 'Segurança', 'Coordenador de Segurança', '2019-07-12', 'Ativo'),
('Fernanda Souza', 'Enfermagem', 'Técnica de Enfermagem', '2021-09-05', 'Ativo'),
('Lucas Martins', 'Radiologia', 'Técnico em Radiologia', '2020-04-18', 'Ativo'),
('Patricia Gomes', 'Nutrição', 'Nutricionista', '2022-01-10', 'Ativo');

-- ============================================
-- USUÁRIOS DO SISTEMA
-- ============================================
-- ATENÇÃO: Senhas em texto plano APENAS para desenvolvimento
-- PRODUÇÃO: Usar bcrypt.hash() antes de inserir
-- ============================================
INSERT INTO usuarios (username, senha, perfil_id, funcionario_id, ativo) VALUES
('admin', 'admin123', 1, NULL, 1),
('operador', 'senha123', 2, 1, 1),
('consulta', 'senha123', 3, 2, 1),
('arquivista', 'senha123', 4, 3, 1),
('maria.operador', 'senha123', 2, 2, 1);

-- ============================================
-- GAVETEIROS
-- ============================================
INSERT INTO gaveteiros (nome, localizacao, descricao) VALUES
('Gaveteiro Central A', 'Sala de Arquivos - Andar 1 - Setor Norte', 'Gaveteiro principal para arquivos ativos'),
('Gaveteiro Secundário B', 'Sala de Arquivos - Andar 2 - Setor Sul', 'Gaveteiro auxiliar para arquivos administrativos'),
('Gaveteiro Arquivo Morto', 'Depósito - Subsolo', 'Armazenamento de longo prazo'),
('Gaveteiro Especial C', 'Sala de Arquivos - Andar 1 - Setor Leste', 'Documentos confidenciais');

-- ============================================
-- GAVETAS DO GAVETEIRO 1 (Central A)
-- ============================================
INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES
(1, 'A-01', 50, 3),
(1, 'A-02', 50, 2),
(1, 'A-03', 50, 1),
(1, 'A-04', 50, 0),
(1, 'A-05', 50, 0),
(1, 'A-06', 50, 1),
(1, 'A-07', 50, 0),
(1, 'A-08', 50, 0);

-- ============================================
-- GAVETAS DO GAVETEIRO 2 (Secundário B)
-- ============================================
INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES
(2, 'B-01', 50, 2),
(2, 'B-02', 50, 1),
(2, 'B-03', 50, 0),
(2, 'B-04', 50, 0),
(2, 'B-05', 50, 1);

-- ============================================
-- GAVETAS DO GAVETEIRO 3 (Arquivo Morto)
-- ============================================
INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES
(3, 'AM-01', 100, 1),
(3, 'AM-02', 100, 0),
(3, 'AM-03', 100, 0);

-- ============================================
-- GAVETAS DO GAVETEIRO 4 (Especial C)
-- ============================================
INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES
(4, 'C-01', 30, 1),
(4, 'C-02', 30, 0);

-- ============================================
-- PASTAS DE FUNCIONÁRIOS
-- ============================================
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto) VALUES
(1, 1, 'Pasta de João da Silva', '2020-01-15', 1, 1, 0),
(1, 2, 'Pasta de Maria Santos', '2019-03-22', 2, 1, 0),
(1, 3, 'Pasta de Pedro Oliveira', '2021-06-10', 3, 1, 0),
(2, 5, 'Pasta de Carlos Ferreira', '2022-02-14', 1, 1, 0),
(2, 6, 'Pasta de Juliana Lima', '2020-08-20', 2, 1, 0),
(3, 7, 'Pasta de Roberto Alves', '2019-07-12', 1, 1, 0),
(9, 2, 'Pasta Adicional - Maria Santos', '2022-01-10', 1, 1, 0),
(10, 3, 'Pasta Secundária - Pedro Oliveira', '2022-03-15', 1, 1, 0),
(13, 8, 'Pasta de Fernanda Souza', '2021-09-05', 1, 1, 0),
(14, 4, 'Pasta de Ana Costa (Arquivo Morto)', '2018-11-05', 1, 0, 1),
(17, 9, 'Pasta de Lucas Martins', '2020-04-18', 1, 1, 0),
(6, 10, 'Pasta de Patricia Gomes', '2022-01-10', 1, 1, 0);

-- ============================================
-- ENVELOPES DAS PASTAS
-- ============================================
-- Pasta 1 (João) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(1, 'Segurança', 'presente'),
(1, 'Medicina', 'presente'),
(1, 'Pessoal', 'presente'),
(1, 'Treinamento', 'presente');

-- Pasta 2 (Maria) - Medicina retirado
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(2, 'Segurança', 'presente'),
(2, 'Medicina', 'retirado'),
(2, 'Pessoal', 'presente'),
(2, 'Treinamento', 'presente');

-- Continuar com os demais envelopes...
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(3, 'Segurança', 'presente'),
(3, 'Medicina', 'presente'),
(3, 'Pessoal', 'presente'),
(3, 'Treinamento', 'presente');

-- ============================================
-- SOLICITAÇÕES DE RETIRADA
-- ============================================
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, status) VALUES
(2, 1, 'Revisão de documentos médicos para auditoria interna', 'pendente'),
(5, 8, 'Verificação de certificados de treinamento obrigatório', 'pendente');

-- ============================================
-- RETIRADAS ATIVAS
-- ============================================
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) VALUES
(2, 1, 2, datetime('now', '-5 days'), datetime('now', '+2 days'), 'ativo', 5),
(4, 2, 5, datetime('now', '-10 days'), datetime('now', '-3 days'), 'vencido', 10);

-- ============================================
-- ALERTAS
-- ============================================
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(2, 'Prazo de devolução vencido há 3 dias', 'crítico', 0),
(1, 'Prazo de devolução se aproximando (2 dias restantes)', 'aviso', 0);

-- ============================================
-- MOVIMENTAÇÕES
-- ============================================
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(6, 'envelope', 'saida', 1, 'Análise de exames médicos periódicos', 'Envelope retirado para análise'),
(2, 'pasta', 'saida', 1, 'Auditoria completa de documentação', 'Pasta retirada para auditoria geral');

-- ============================================
-- LOGS DE AUDITORIA
-- ============================================
INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada, detalhes) VALUES
('Login no sistema', 1, NULL, NULL, 'Usuário admin acessou o sistema'),
('Visualizou lista de funcionários', 1, NULL, 'funcionarios', NULL),
('Criou novo gaveteiro', 1, 4, 'gaveteiros', 'Gaveteiro Especial C'),
('Login no sistema', 2, NULL, NULL, 'Usuário operador acessou o sistema'),
('Criou nova solicitação', 2, 1, 'solicitacoes', 'Solicitação para funcionário João da Silva');

-- ============================================
-- FIM DOS SEEDS COM PERFIS
-- ============================================