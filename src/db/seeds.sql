-- Dados Iniciais (Seeds) do Banco de Dados
-- Sistema de Gerenciamento de Arquivos Hospital

-- ============================================
-- FUNCIONÁRIOS DE EXEMPLO
-- ============================================
INSERT INTO funcionarios (nome, departamento, posto_graduacao, data_admissao, status) VALUES
('João da Silva', 'Enfermagem', 'Enfermeiro', '2020-01-15', 'Ativo'),
('Maria Santos', 'Administrativo', 'Assistente Administrativo', '2019-03-22', 'Ativo'),
('Pedro Oliveira', 'Medicina', 'Médico', '2021-06-10', 'Ativo'),
('Ana Costa', 'RH', 'Analista de RH', '2018-11-05', 'Demitido'),
('Carlos Ferreira', 'Laboratório', 'Técnico de Laboratório', '2022-02-14', 'Ativo'),
('Juliana Lima', 'Farmácia', 'Farmacêutica', '2020-08-20', 'Ativo');

-- ============================================
-- USUÁRIOS DO SISTEMA
-- ============================================
-- Senha para ambos: admin123 e senha123 (em produção usar hash bcrypt)
INSERT INTO usuarios (username, senha, perfil, funcionario_id, ativo) VALUES
('admin', 'admin123', 'Administrador', NULL, 1),
('operador', 'senha123', 'Usuário Operacional', 1, 1),
('maria.operador', 'senha123', 'Usuário Operacional', 2, 1);

-- ============================================
-- GAVETEIROS
-- ============================================
INSERT INTO gaveteiros (nome, localizacao, descricao) VALUES
('Gaveteiro Central A', 'Sala de Arquivos - Andar 1 - Setor Norte', 'Gaveteiro principal para arquivos ativos'),
('Gaveteiro Secundário B', 'Sala de Arquivos - Andar 2 - Setor Sul', 'Gaveteiro auxiliar para arquivos secundários'),
('Gaveteiro Arquivo Morto', 'Depósito - Subsolo', 'Armazenamento de longo prazo para arquivos inativos');

-- ============================================
-- GAVETAS DO GAVETEIRO 1 (Central A)
-- ============================================
INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES
(1, 'A-01', 50, 3),
(1, 'A-02', 50, 2),
(1, 'A-03', 50, 1),
(1, 'A-04', 50, 0),
(1, 'A-05', 50, 0);

-- ============================================
-- GAVETAS DO GAVETEIRO 2 (Secundário B)
-- ============================================
INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES
(2, 'B-01', 50, 2),
(2, 'B-02', 50, 1),
(2, 'B-03', 50, 0),
(2, 'B-04', 50, 0);

-- ============================================
-- GAVETAS DO GAVETEIRO 3 (Arquivo Morto)
-- ============================================
INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual) VALUES
(3, 'AM-01', 100, 1),
(3, 'AM-02', 100, 0);

-- ============================================
-- PASTAS DE FUNCIONÁRIOS
-- ============================================
-- Pastas ativas
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto) VALUES
(1, 1, 'Pasta de João da Silva', '2020-01-15', 1, 1, 0),
(1, 2, 'Pasta de Maria Santos', '2019-03-22', 2, 1, 0),
(1, 3, 'Pasta de Pedro Oliveira', '2021-06-10', 3, 1, 0),
(2, 5, 'Pasta de Carlos Ferreira', '2022-02-14', 1, 1, 0),
(2, 6, 'Pasta de Juliana Lima', '2020-08-20', 2, 1, 0),
(3, 2, 'Pasta Adicional - Maria Santos', '2022-01-10', 1, 1, 0),
(6, 3, 'Pasta Secundária - Pedro Oliveira', '2022-03-15', 1, 1, 0);

-- Pasta em arquivo morto
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto) VALUES
(10, 4, 'Pasta de Ana Costa (Arquivo Morto)', '2018-11-05', 1, 0, 1);

-- ============================================
-- ENVELOPES DAS PASTAS
-- Cada pasta tem 4 envelopes: Segurança, Medicina, Pessoal, Treinamento
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

-- Pasta 3 (Pedro) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(3, 'Segurança', 'presente'),
(3, 'Medicina', 'presente'),
(3, 'Pessoal', 'presente'),
(3, 'Treinamento', 'presente');

-- Pasta 4 (Carlos) - Pessoal retirado
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(4, 'Segurança', 'presente'),
(4, 'Medicina', 'presente'),
(4, 'Pessoal', 'retirado'),
(4, 'Treinamento', 'presente');

-- Pasta 5 (Juliana) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(5, 'Segurança', 'presente'),
(5, 'Medicina', 'presente'),
(5, 'Pessoal', 'presente'),
(5, 'Treinamento', 'presente');

-- Pasta 6 (Maria adicional) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(6, 'Segurança', 'presente'),
(6, 'Medicina', 'presente'),
(6, 'Pessoal', 'presente'),
(6, 'Treinamento', 'presente');

-- Pasta 7 (Pedro secundária) - Treinamento retirado
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(7, 'Segurança', 'presente'),
(7, 'Medicina', 'presente'),
(7, 'Pessoal', 'presente'),
(7, 'Treinamento', 'retirado');

-- Pasta 8 (Ana - arquivo morto) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(8, 'Segurança', 'presente'),
(8, 'Medicina', 'presente'),
(8, 'Pessoal', 'presente'),
(8, 'Treinamento', 'presente');

-- ============================================
-- SOLICITAÇÕES DE RETIRADA
-- ============================================

-- Solicitação pendente
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, status) VALUES
(2, 1, 'Revisão de documentos médicos para auditoria interna', 'pendente');

-- Solicitação aprovada
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, data_aprovacao, status) VALUES
(3, 2, 'Atualização de dados cadastrais', datetime('now', '-3 days'), 'aprovada');

-- Solicitação aprovada (já resultou em retirada)
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, data_aprovacao, status) VALUES
(2, 5, 'Verificação de documentos de admissão', datetime('now', '-10 days'), 'aprovada');

-- Solicitação rejeitada
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, data_aprovacao, status, motivo_rejeicao) VALUES
(2, 3, 'Consulta de histórico médico', datetime('now', '-15 days'), 'rejeitada', 'Documentos já em análise por outro departamento');

-- ============================================
-- RETIRADAS ATIVAS COM PESSOAS
-- ============================================

-- Retirada ativa - Maria Santos (5 dias atrás, prazo de 7 dias)
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) VALUES
(2, 3, 2, datetime('now', '-5 days'), datetime('now', '+2 days'), 'ativo', 5);

-- Retirada ativa - Carlos Ferreira (10 dias atrás, prazo já vencido)
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) VALUES
(4, 2, 5, datetime('now', '-10 days'), datetime('now', '-3 days'), 'vencido', 10);

-- Retirada devolvida - Pedro Oliveira
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, data_retorno, status, dias_decorridos) VALUES
(7, 2, 3, datetime('now', '-20 days'), datetime('now', '-13 days'), datetime('now', '-14 days'), 'devolvido', 6);

-- Retirada ativa - João da Silva (2 dias atrás, prazo de 5 dias)
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) VALUES
(1, 2, 1, datetime('now', '-2 days'), datetime('now', '+3 days'), 'ativo', 2);

-- ============================================
-- ALERTAS DE VENCIMENTO
-- ============================================

-- Alerta crítico para retirada vencida (Carlos)
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(2, 'Prazo de devolução vencido há 3 dias', 'crítico', 0);

-- Alerta de aviso para prazo próximo (Maria)
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(1, 'Prazo de devolução se aproximando (2 dias restantes)', 'aviso', 0);

-- Alerta resolvido (Pedro - já devolvido)
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(3, 'Prazo de devolução se aproximando', 'aviso', 1);

-- ============================================
-- MOVIMENTAÇÕES DE ENVELOPES E PASTAS
-- ============================================

-- Movimentação: Saída do envelope de Medicina da Maria
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo) VALUES
(6, 'envelope', 'saida', 3, 'Análise de exames médicos periódicos');

-- Movimentação: Saída do envelope Pessoal do Carlos
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo) VALUES
(15, 'envelope', 'saida', 2, 'Atualização de documentos pessoais');

-- Movimentação: Saída do envelope Treinamento do Pedro
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo) VALUES
(28, 'envelope', 'saida', 2, 'Verificação de certificados de treinamento');

-- Movimentação: Entrada (devolução) de envelope anterior
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo) VALUES
(28, 'envelope', 'entrada', 2, 'Retorno após verificação concluída');

-- Movimentação: Saída de pasta completa
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo) VALUES
(2, 'pasta', 'saida', 3, 'Auditoria completa de documentação');

-- Movimentação: Entrada de pasta
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo) VALUES
(7, 'pasta', 'entrada', 2, 'Retorno após análise');

-- ============================================
-- LOGS DE AUDITORIA
-- ============================================

INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada) VALUES
('Login no sistema', 1, NULL, NULL),
('Visualizou lista de funcionários', 1, NULL, 'funcionarios'),
('Criou novo gaveteiro', 1, 3, 'gaveteiros'),
('Login no sistema', 2, NULL, NULL),
('Criou nova solicitação de retirada', 2, 1, 'solicitacoes'),
('Visualizou dashboard', 2, NULL, NULL),
('Login no sistema', 1, NULL, NULL),
('Aprovou solicitação #2', 1, 2, 'solicitacoes'),
('Visualizou relatório de retiradas', 1, NULL, 'retiradas_com_pessoas'),
('Login no sistema', 3, NULL, NULL),
('Registrou retirada da pasta #2', 3, 2, 'retiradas_com_pessoas'),
('Registrou movimentação de envelope', 3, 6, 'movimentacoes'),
('Visualizou alertas pendentes', 1, NULL, 'alertas'),
('Criou novo funcionário', 1, 6, 'funcionarios'),
('Atualizou dados de gaveta', 1, 1, 'gavetas'),
('Registrou devolução de pasta', 2, 7, 'pastas'),
('Visualizou histórico de movimentações', 2, NULL, 'movimentacoes'),
('Gerou relatório de auditoria', 1, NULL, NULL),
('Login no sistema', 2, NULL, NULL),
('Visualizou gavetas disponíveis', 2, NULL, 'gavetas');

-- ============================================
-- MENUS DO SISTEMA
-- ============================================
INSERT INTO menus (nome, icone, rota, ordem, ativo) VALUES
('Dashboard', 'fas fa-home', '/dashboard', 1, 1),
('Funcionários', 'fas fa-users', '/funcionarios', 2, 1),
('Gaveteiros', 'fas fa-archive', '/gaveteiros', 3, 1),
('Gavetas', 'fas fa-box', '/gavetas', 4, 1),
('Pastas', 'fas fa-folder', '/pastas', 5, 1),
('Solicitações', 'fas fa-file-alt', '/solicitacoes', 6, 1),
('Retiradas', 'fas fa-hand-holding', '/retiradas', 7, 1),
('Alertas', 'fas fa-bell', '/alertas', 8, 1),
('Relatórios', 'fas fa-chart-bar', '/relatorios', 9, 1),
('Configurações', 'fas fa-cog', '/configuracoes', 10, 1);

-- ============================================
-- PERMISSÕES DE MENUS PARA USUÁRIOS
-- ============================================

-- Admin tem acesso a todos os menus
INSERT INTO usuarios_menus (usuario_id, menu_id) VALUES
(1, 1),  -- Dashboard
(1, 2),  -- Funcionários
(1, 3),  -- Gaveteiros
(1, 4),  -- Gavetas
(1, 5),  -- Pastas
(1, 6),  -- Solicitações
(1, 7),  -- Retiradas
(1, 8),  -- Alertas
(1, 9),  -- Relatórios
(1, 10); -- Configurações

-- Operadores têm acesso limitado (sem Configurações e Relatórios)
INSERT INTO usuarios_menus (usuario_id, menu_id) VALUES
(2, 1),  -- Dashboard
(2, 2),  -- Funcionários
(2, 3),  -- Gaveteiros
(2, 4),  -- Gavetas
(2, 5),  -- Pastas
(2, 6),  -- Solicitações
(2, 7),  -- Retiradas
(2, 8);  -- Alertas

INSERT INTO usuarios_menus (usuario_id, menu_id) VALUES
(3, 1),  -- Dashboard
(3, 2),  -- Funcionários
(3, 3),  -- Gaveteiros
(3, 4),  -- Gavetas
(3, 5),  -- Pastas
(3, 6),  -- Solicitações
(3, 7),  -- Retiradas
(3, 8);  -- Alertas

-- ============================================
-- FIM DOS DADOS INICIAIS
-- ============================================