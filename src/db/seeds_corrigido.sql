-- ============================================
-- DADOS INICIAIS CORRIGIDOS (Seeds)
-- Sistema de Gerenciamento de Arquivos Hospital
-- ============================================
--
-- IMPORTANTE: As senhas estão em texto plano apenas para exemplo
-- Em produção, TODAS as senhas devem ser hasheadas com bcrypt
-- Exemplo com Node.js: const hash = await bcrypt.hash(senha, 10);
-- ============================================

-- ============================================
-- FUNCIONÁRIOS DE EXEMPLO
-- ============================================
INSERT INTO funcionarios (nome, departamento, posto_graduacao, data_admissao, status) VALUES
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
-- admin123 -> $2b$10$exemplo_hash_bcrypt_admin
-- senha123 -> $2b$10$exemplo_hash_bcrypt_usuario
-- ============================================
INSERT INTO usuarios (username, senha, perfil, funcionario_id, ativo) VALUES
('admin', 'admin123', 'Administrador', NULL, 1),
-- Em produção, substituir por hash bcrypt:
-- ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador', NULL, 1),

('operador', 'senha123', 'Usuário Operacional', 1, 1),
-- Em produção:
-- ('operador', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuário Operacional', 1, 1),

('maria.operador', 'senha123', 'Usuário Operacional', 2, 1),
('pedro.admin', 'admin123', 'Administrador', 3, 1),
('carlos.operador', 'senha123', 'Usuário Operacional', 5, 1);

-- ============================================
-- GAVETEIROS
-- ============================================
INSERT INTO gaveteiros (nome, localizacao, descricao) VALUES
('Gaveteiro Central A', 'Sala de Arquivos - Andar 1 - Setor Norte', 'Gaveteiro principal para arquivos ativos de funcionários da área médica'),
('Gaveteiro Secundário B', 'Sala de Arquivos - Andar 2 - Setor Sul', 'Gaveteiro auxiliar para arquivos administrativos e operacionais'),
('Gaveteiro Arquivo Morto', 'Depósito - Subsolo', 'Armazenamento de longo prazo para arquivos inativos e funcionários demitidos'),
('Gaveteiro Especial C', 'Sala de Arquivos - Andar 1 - Setor Leste', 'Documentos confidenciais e de alta segurança');

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
-- Pastas ativas no Gaveteiro Central A
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto) VALUES
(1, 1, 'Pasta de João da Silva', '2020-01-15', 1, 1, 0),
(1, 2, 'Pasta de Maria Santos', '2019-03-22', 2, 1, 0),
(1, 3, 'Pasta de Pedro Oliveira', '2021-06-10', 3, 1, 0),
(2, 5, 'Pasta de Carlos Ferreira', '2022-02-14', 1, 1, 0),
(2, 6, 'Pasta de Juliana Lima', '2020-08-20', 2, 1, 0),
(3, 7, 'Pasta de Roberto Alves', '2019-07-12', 1, 1, 0);

-- Pastas adicionais no Gaveteiro Secundário B
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto) VALUES
(9, 2, 'Pasta Adicional - Maria Santos', '2022-01-10', 1, 1, 0),
(10, 3, 'Pasta Secundária - Pedro Oliveira', '2022-03-15', 1, 1, 0),
(13, 8, 'Pasta de Fernanda Souza', '2021-09-05', 1, 1, 0);

-- Pasta em arquivo morto (funcionário demitido)
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto) VALUES
(14, 4, 'Pasta de Ana Costa (Arquivo Morto)', '2018-11-05', 1, 0, 1);

-- Pasta especial (documentos confidenciais)
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto) VALUES
(17, 9, 'Pasta de Lucas Martins', '2020-04-18', 1, 1, 0),
(6, 10, 'Pasta de Patricia Gomes', '2022-01-10', 1, 1, 0);

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

-- Pasta 6 (Roberto) - Segurança retirado
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(6, 'Segurança', 'retirado'),
(6, 'Medicina', 'presente'),
(6, 'Pessoal', 'presente'),
(6, 'Treinamento', 'presente');

-- Pasta 7 (Maria adicional) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(7, 'Segurança', 'presente'),
(7, 'Medicina', 'presente'),
(7, 'Pessoal', 'presente'),
(7, 'Treinamento', 'presente');

-- Pasta 8 (Pedro secundária) - Treinamento retirado
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(8, 'Segurança', 'presente'),
(8, 'Medicina', 'presente'),
(8, 'Pessoal', 'presente'),
(8, 'Treinamento', 'retirado');

-- Pasta 9 (Fernanda) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(9, 'Segurança', 'presente'),
(9, 'Medicina', 'presente'),
(9, 'Pessoal', 'presente'),
(9, 'Treinamento', 'presente');

-- Pasta 10 (Ana - arquivo morto) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(10, 'Segurança', 'presente'),
(10, 'Medicina', 'presente'),
(10, 'Pessoal', 'presente'),
(10, 'Treinamento', 'presente');

-- Pasta 11 (Lucas) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(11, 'Segurança', 'presente'),
(11, 'Medicina', 'presente'),
(11, 'Pessoal', 'presente'),
(11, 'Treinamento', 'presente');

-- Pasta 12 (Patricia) - Todos presentes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(12, 'Segurança', 'presente'),
(12, 'Medicina', 'presente'),
(12, 'Pessoal', 'presente'),
(12, 'Treinamento', 'presente');

-- ============================================
-- SOLICITAÇÕES DE RETIRADA
-- ============================================

-- Solicitação pendente #1
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, status) VALUES
(2, 1, 'Revisão de documentos médicos para auditoria interna', 'pendente');

-- Solicitação pendente #2
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, status) VALUES
(5, 8, 'Verificação de certificados de treinamento obrigatório', 'pendente');

-- Solicitação aprovada #1
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, data_aprovacao, status) VALUES
(3, 2, 'Atualização de dados cadastrais', datetime('now', '-3 days'), 'aprovada');

-- Solicitação aprovada #2 (já resultou em retirada)
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, data_aprovacao, status) VALUES
(2, 5, 'Verificação de documentos de admissão', datetime('now', '-10 days'), 'aprovada');

-- Solicitação aprovada #3
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, data_aprovacao, status) VALUES
(5, 7, 'Análise de documentos de segurança', datetime('now', '-5 days'), 'aprovada');

-- Solicitação rejeitada #1
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, data_aprovacao, status, motivo_rejeicao) VALUES
(2, 3, 'Consulta de histórico médico', datetime('now', '-15 days'), 'rejeitada', 'Documentos já em análise por outro departamento');

-- Solicitação rejeitada #2
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, data_aprovacao, status, motivo_rejeicao) VALUES
(5, 6, 'Acesso a exames confidenciais', datetime('now', '-7 days'), 'rejeitada', 'Permissão insuficiente para acesso a este tipo de documento');

-- ============================================
-- RETIRADAS ATIVAS COM PESSOAS
-- ============================================

-- Retirada ativa #1 - Maria Santos (5 dias atrás, prazo de 7 dias)
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) VALUES
(2, 3, 2, datetime('now', '-5 days'), datetime('now', '+2 days'), 'ativo', 5);

-- Retirada ativa #2 - Carlos Ferreira (10 dias atrás, prazo já vencido)
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) VALUES
(4, 2, 5, datetime('now', '-10 days'), datetime('now', '-3 days'), 'vencido', 10);

-- Retirada ativa #3 - João da Silva (2 dias atrás, prazo de 5 dias)
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) VALUES
(1, 2, 1, datetime('now', '-2 days'), datetime('now', '+3 days'), 'ativo', 2);

-- Retirada ativa #4 - Roberto Alves (7 dias atrás, prazo de 10 dias)
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, status, dias_decorridos) VALUES
(6, 5, 7, datetime('now', '-7 days'), datetime('now', '+3 days'), 'ativo', 7);

-- Retirada devolvida #1 - Pedro Oliveira
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, data_retorno, status, dias_decorridos) VALUES
(8, 2, 3, datetime('now', '-20 days'), datetime('now', '-13 days'), datetime('now', '-14 days'), 'devolvido', 6);

-- Retirada devolvida #2 - Juliana Lima
INSERT INTO retiradas_com_pessoas (pasta_id, usuario_id, funcionario_id, data_retirada, data_prevista_retorno, data_retorno, status, dias_decorridos) VALUES
(5, 3, 6, datetime('now', '-30 days'), datetime('now', '-23 days'), datetime('now', '-24 days'), 'devolvido', 6);

-- ============================================
-- ALERTAS DE VENCIMENTO
-- ============================================

-- Alerta crítico para retirada vencida (Carlos)
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(2, 'Prazo de devolução vencido há 3 dias', 'crítico', 0);

-- Alerta de aviso para prazo próximo (Maria)
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(1, 'Prazo de devolução se aproximando (2 dias restantes)', 'aviso', 0);

-- Alerta de aviso para prazo próximo (Roberto)
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(4, 'Prazo de devolução se aproximando (3 dias restantes)', 'aviso', 0);

-- Alerta resolvido (Pedro - já devolvido)
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(5, 'Prazo de devolução se aproximando', 'aviso', 1);

-- Alerta resolvido (Juliana - já devolvido)
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido) VALUES
(6, 'Documento devolvido antes do prazo', 'aviso', 1);

-- ============================================
-- MOVIMENTAÇÕES DE ENVELOPES E PASTAS
-- ============================================

-- Movimentação 1: Saída do envelope de Medicina da Maria
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(6, 'envelope', 'saida', 3, 'Análise de exames médicos periódicos', 'Envelope retirado para análise detalhada dos exames dos últimos 2 anos');

-- Movimentação 2: Saída do envelope Pessoal do Carlos
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(15, 'envelope', 'saida', 2, 'Atualização de documentos pessoais', 'Necessário atualizar endereço e contatos de emergência');

-- Movimentação 3: Saída do envelope Treinamento do Pedro
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(32, 'envelope', 'saida', 2, 'Verificação de certificados de treinamento', 'Validação de certificados para renovação de credenciais');

-- Movimentação 4: Entrada (devolução) do envelope Treinamento do Pedro
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(32, 'envelope', 'entrada', 2, 'Retorno após verificação concluída', 'Certificados validados e atualizados no sistema');

-- Movimentação 5: Saída do envelope Segurança do Roberto
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(21, 'envelope', 'saida', 5, 'Auditoria de segurança', 'Revisão de procedimentos de segurança e treinamentos');

-- Movimentação 6: Saída de pasta completa (Maria)
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(2, 'pasta', 'saida', 3, 'Auditoria completa de documentação', 'Pasta retirada para auditoria geral de RH');

-- Movimentação 7: Entrada de pasta (Pedro secundária)
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(8, 'pasta', 'entrada', 2, 'Retorno após análise', 'Pasta devolvida com documentos atualizados');

-- Movimentação 8: Saída de pasta completa (Carlos)
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(4, 'pasta', 'saida', 2, 'Análise de admissão', 'Revisão de documentos de processo admissional');

-- Movimentação 9: Saída de pasta completa (João)
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(1, 'pasta', 'saida', 2, 'Verificação de dados médicos', 'Atualização de ficha médica e vacinas');

-- Movimentação 10: Entrada de pasta (Juliana)
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao) VALUES
(5, 'pasta', 'entrada', 3, 'Retorno após consulta', 'Documentação revisada e aprovada');

-- ============================================
-- LOGS DE AUDITORIA
-- ============================================

INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada) VALUES
('Login no sistema', 1, NULL, NULL),
('Visualizou lista de funcionários', 1, NULL, 'funcionarios'),
('Criou novo gaveteiro', 1, 4, 'gaveteiros'),
('Visualizou dashboard', 1, NULL, NULL),
('Login no sistema', 2, NULL, NULL),
('Criou nova solicitação de retirada', 2, 1, 'solicitacoes'),
('Visualizou gavetas disponíveis', 2, NULL, 'gavetas'),
('Login no sistema', 1, NULL, NULL),
('Aprovou solicitação #3', 1, 3, 'solicitacoes'),
('Aprovou solicitação #4', 1, 4, 'solicitacoes'),
('Visualizou relatório de retiradas', 1, NULL, 'retiradas_com_pessoas'),
('Login no sistema', 3, NULL, NULL),
('Registrou retirada da pasta #2', 3, 1, 'retiradas_com_pessoas'),
('Registrou movimentação de envelope', 3, 6, 'movimentacoes'),
('Visualizou alertas pendentes', 1, NULL, 'alertas'),
('Criou novo funcionário', 1, 10, 'funcionarios'),
('Atualizou dados de gaveta', 1, 1, 'gavetas'),
('Registrou devolução de pasta', 2, 8, 'pastas'),
('Visualizou histórico de movimentações', 2, NULL, 'movimentacoes'),
('Gerou relatório de auditoria', 1, NULL, NULL),
('Login no sistema', 2, NULL, NULL),
('Criou nova solicitação', 2, 2, 'solicitacoes'),
('Registrou retirada da pasta #4', 2, 2, 'retiradas_com_pessoas'),
('Registrou retirada da pasta #1', 2, 3, 'retiradas_com_pessoas'),
('Login no sistema', 5, NULL, NULL),
('Visualizou funcionários', 5, NULL, 'funcionarios'),
('Criou nova solicitação', 5, 2, 'solicitacoes'),
('Aprovou solicitação #5', 1, 5, 'solicitacoes'),
('Registrou retirada da pasta #6', 5, 4, 'retiradas_com_pessoas'),
('Visualizou retiradas ativas', 5, NULL, 'retiradas_com_pessoas');

-- ============================================
-- FIM DOS DADOS INICIAIS CORRIGIDOS
-- ============================================