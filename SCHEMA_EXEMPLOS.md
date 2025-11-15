# Exemplos Práticos de Queries SQL - Sistema de Arquivo Hospital

Este documento contém exemplos práticos e testáveis de todas as queries SQL necessárias para o sistema de gerenciamento de arquivos do hospital.

---

## 📋 Índice

1. [Funcionários](#funcionários)
2. [Gaveteiros e Gavetas](#gaveteiros-e-gavetas)
3. [Pastas](#pastas)
4. [Envelopes](#envelopes)
5. [Solicitações](#solicitações)
6. [Retiradas](#retiradas)
7. [Alertas](#alertas)
8. [Movimentações](#movimentações)
9. [Usuários](#usuários)
10. [Logs](#logs)
11. [Queries Complexas com JOINs](#queries-complexas-com-joins)
12. [Queries de Estatísticas](#queries-de-estatísticas)
13. [Padrões de Uso Recomendados](#padrões-de-uso-recomendados)

---

## Funcionários

### INSERT - Criar novo funcionário
```sql
INSERT INTO funcionarios (nome, departamento, posto_graduacao, data_admissao, status)
VALUES ('José Silva', 'Enfermagem', 'Enfermeiro', '2024-01-15', 'Ativo');

-- Com verificação de retorno
INSERT INTO funcionarios (nome, departamento, posto_graduacao, data_admissao, status)
VALUES ('Maria Oliveira', 'Administrativo', 'Assistente', '2024-02-20', 'Ativo')
RETURNING id, nome, created_at;
```

### SELECT - Buscar funcionários
```sql
-- Todos os funcionários ativos
SELECT * FROM funcionarios 
WHERE status = 'Ativo' 
ORDER BY nome;

-- Funcionário específico por ID
SELECT * FROM funcionarios WHERE id = 1;

-- Buscar por nome (LIKE)
SELECT * FROM funcionarios 
WHERE nome LIKE '%Silva%' AND status = 'Ativo';

-- Funcionários por departamento
SELECT * FROM funcionarios 
WHERE departamento = 'Enfermagem' AND status = 'Ativo'
ORDER BY data_admissao DESC;

-- Usar índice composto (status + departamento)
SELECT id, nome, posto_graduacao, data_admissao 
FROM funcionarios 
WHERE status = 'Ativo' AND departamento = 'Medicina'
ORDER BY nome;
```

### UPDATE - Atualizar funcionário
```sql
-- Atualizar dados básicos
UPDATE funcionarios 
SET departamento = 'RH', posto_graduacao = 'Coordenador de RH'
WHERE id = 1;

-- Atualizar múltiplos campos
UPDATE funcionarios 
SET nome = 'José Carlos Silva',
    departamento = 'Administração',
    posto_graduacao = 'Gerente'
WHERE id = 1;
```

### UPDATE - Demitir funcionário (soft delete)
```sql
UPDATE funcionarios 
SET status = 'Demitido', 
    data_demissao = date('now')
WHERE id = 1;
```

### DELETE - Remover funcionário (usar com cuidado!)
```sql
-- Apenas se realmente necessário (preferir soft delete)
DELETE FROM funcionarios WHERE id = 1;
```

---

## Gaveteiros e Gavetas

### Gaveteiros

#### INSERT - Criar gaveteiro
```sql
INSERT INTO gaveteiros (nome, localizacao, descricao)
VALUES (
    'Gaveteiro Norte D',
    'Sala de Arquivos - Andar 3 - Setor Norte',
    'Gaveteiro para arquivos de longo prazo'
);
```

#### SELECT - Buscar gaveteiros
```sql
-- Todos os gaveteiros
SELECT * FROM gaveteiros ORDER BY nome;

-- Gaveteiro específico
SELECT * FROM gaveteiros WHERE id = 1;

-- Com contagem de gavetas
SELECT g.*, COUNT(gv.id) as total_gavetas
FROM gaveteiros g
LEFT JOIN gavetas gv ON g.id = gv.gaveteiro_id
GROUP BY g.id
ORDER BY g.nome;
```

#### UPDATE - Atualizar gaveteiro
```sql
UPDATE gaveteiros 
SET localizacao = 'Sala de Arquivos - Andar 1 - Setor Sul',
    descricao = 'Gaveteiro reorganizado para melhor acesso'
WHERE id = 1;
```

### Gavetas

#### INSERT - Criar gaveta
```sql
INSERT INTO gavetas (gaveteiro_id, numero, capacidade, ocupacao_atual)
VALUES (1, 'A-09', 50, 0);
```

#### SELECT - Buscar gavetas
```sql
-- Todas as gavetas de um gaveteiro
SELECT * FROM gavetas 
WHERE gaveteiro_id = 1 
ORDER BY numero;

-- Gavetas disponíveis (com espaço)
SELECT * FROM gavetas 
WHERE ocupacao_atual < capacidade 
ORDER BY (capacidade - ocupacao_atual) DESC;

-- Gavetas com ocupação acima de 80%
SELECT g.*, gt.nome as gaveteiro_nome,
       ROUND((CAST(g.ocupacao_atual AS FLOAT) / g.capacidade) * 100, 2) as percentual_ocupacao
FROM gavetas g
JOIN gaveteiros gt ON g.gaveteiro_id = gt.id
WHERE CAST(g.ocupacao_atual AS FLOAT) / g.capacidade > 0.8
ORDER BY percentual_ocupacao DESC;

-- Usar índice composto (gaveteiro_id + ocupacao_atual)
SELECT * FROM gavetas 
WHERE gaveteiro_id = 1 AND ocupacao_atual < capacidade
ORDER BY numero;
```

#### UPDATE - Atualizar ocupação da gaveta
```sql
-- Incrementar ocupação (ao adicionar pasta)
UPDATE gavetas 
SET ocupacao_atual = ocupacao_atual + 1 
WHERE id = 1 AND ocupacao_atual < capacidade;

-- Decrementar ocupação (ao remover pasta)
UPDATE gavetas 
SET ocupacao_atual = ocupacao_atual - 1 
WHERE id = 1 AND ocupacao_atual > 0;

-- Atualizar capacidade
UPDATE gavetas 
SET capacidade = 75 
WHERE id = 1;
```

---

## Pastas

### INSERT - Criar pasta
```sql
-- Pasta básica
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto)
VALUES (1, 1, 'Pasta de João Silva - 2024', date('now'), 1, 1, 0);

-- Com trigger para atualizar ocupação da gaveta
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto)
VALUES (2, 5, 'Pasta Adicional - Carlos Ferreira', date('now'), 2, 1, 0);
-- Após INSERT, executar: UPDATE gavetas SET ocupacao_atual = ocupacao_atual + 1 WHERE id = 2;
```

### SELECT - Buscar pastas
```sql
-- Todas as pastas ativas
SELECT * FROM pastas 
WHERE ativa = 1 AND arquivo_morto = 0 
ORDER BY nome;

-- Pastas de um funcionário
SELECT * FROM pastas 
WHERE funcionario_id = 1 AND ativa = 1
ORDER BY data_criacao DESC;

-- Pastas em uma gaveta específica
SELECT p.*, f.nome as funcionario_nome
FROM pastas p
JOIN funcionarios f ON p.funcionario_id = f.id
WHERE p.gaveta_id = 1 AND p.ativa = 1
ORDER BY p.ordem;

-- Usar índice composto (gaveta_id + ativa)
SELECT p.id, p.nome, p.ordem, f.nome as funcionario_nome
FROM pastas p
JOIN funcionarios f ON p.funcionario_id = f.id
WHERE p.gaveta_id = 1 AND p.ativa = 1
ORDER BY p.ordem;

-- Pastas no arquivo morto
SELECT p.*, f.nome as funcionario_nome
FROM pastas p
JOIN funcionarios f ON p.funcionario_id = f.id
WHERE p.arquivo_morto = 1
ORDER BY p.data_criacao DESC;

-- Usar índice composto (funcionario_id + arquivo_morto)
SELECT * FROM pastas 
WHERE funcionario_id = 5 AND arquivo_morto = 0
ORDER BY data_criacao DESC;
```

### UPDATE - Atualizar pasta
```sql
-- Mover pasta para outra gaveta
UPDATE pastas 
SET gaveta_id = 2, ordem = 3 
WHERE id = 1;
-- Lembre-se de atualizar ocupacao_atual de ambas as gavetas!

-- Arquivar pasta (soft delete)
UPDATE pastas 
SET ativa = 0, arquivo_morto = 1 
WHERE id = 1;

-- Reativar pasta do arquivo morto
UPDATE pastas 
SET ativa = 1, arquivo_morto = 0, gaveta_id = 5 
WHERE id = 1;
```

---

## Envelopes

### INSERT - Criar envelopes (ao criar pasta)
```sql
-- Criar os 4 envelopes padrão para uma pasta
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(1, 'Segurança', 'presente'),
(1, 'Medicina', 'presente'),
(1, 'Pessoal', 'presente'),
(1, 'Treinamento', 'presente');
```

### SELECT - Buscar envelopes
```sql
-- Todos os envelopes de uma pasta
SELECT * FROM envelopes 
WHERE pasta_id = 1 
ORDER BY tipo;

-- Envelopes retirados
SELECT e.*, p.nome as pasta_nome, f.nome as funcionario_nome
FROM envelopes e
JOIN pastas p ON e.pasta_id = p.id
JOIN funcionarios f ON p.funcionario_id = f.id
WHERE e.status = 'retirado'
ORDER BY e.created_at DESC;

-- Usar índice composto (pasta_id + status)
SELECT * FROM envelopes 
WHERE pasta_id = 1 AND status = 'presente';

-- Contagem de envelopes por status
SELECT status, COUNT(*) as total
FROM envelopes
GROUP BY status;

-- Envelopes de um tipo específico retirados
SELECT e.*, p.nome as pasta_nome, f.nome as funcionario_nome
FROM envelopes e
JOIN pastas p ON e.pasta_id = p.id
JOIN funcionarios f ON p.funcionario_id = f.id
WHERE e.tipo = 'Medicina' AND e.status = 'retirado';
```

### UPDATE - Atualizar status do envelope
```sql
-- Marcar envelope como retirado
UPDATE envelopes 
SET status = 'retirado' 
WHERE id = 1;

-- Marcar envelope como devolvido
UPDATE envelopes 
SET status = 'presente' 
WHERE id = 1;
```

---

## Solicitações

### INSERT - Criar solicitação
```sql
INSERT INTO solicitacoes (usuario_id, funcionario_id, motivo, status)
VALUES (2, 5, 'Revisão de documentos para auditoria', 'pendente');
```

### SELECT - Buscar solicitações
```sql
-- Solicitações pendentes
SELECT s.*, 
       f.nome as funcionario_nome,
       u.username as solicitante
FROM solicitacoes s
JOIN funcionarios f ON s.funcionario_id = f.id
JOIN usuarios u ON s.usuario_id = u.id
WHERE s.status = 'pendente'
ORDER BY s.data_solicitacao DESC;

-- Usar índice composto (status + data_solicitacao)
SELECT s.id, s.motivo, s.data_solicitacao, f.nome as funcionario_nome
FROM solicitacoes s
JOIN funcionarios f ON s.funcionario_id = f.id
WHERE s.status = 'pendente'
ORDER BY s.data_solicitacao DESC;

-- Histórico de solicitações de um usuário
SELECT s.*, f.nome as funcionario_nome
FROM solicitacoes s
JOIN funcionarios f ON s.funcionario_id = f.id
WHERE s.usuario_id = 2
ORDER BY s.data_solicitacao DESC;

-- Solicitações aprovadas nos últimos 7 dias
SELECT s.*, f.nome as funcionario_nome, u.username
FROM solicitacoes s
JOIN funcionarios f ON s.funcionario_id = f.id
JOIN usuarios u ON s.usuario_id = u.id
WHERE s.status = 'aprovada' 
  AND s.data_aprovacao >= datetime('now', '-7 days')
ORDER BY s.data_aprovacao DESC;
```

### UPDATE - Aprovar/Rejeitar solicitação
```sql
-- Aprovar solicitação
UPDATE solicitacoes 
SET status = 'aprovada', 
    data_aprovacao = datetime('now')
WHERE id = 1;

-- Rejeitar solicitação
UPDATE solicitacoes 
SET status = 'rejeitada', 
    data_aprovacao = datetime('now'),
    motivo_rejeicao = 'Documentos já em análise por outro setor'
WHERE id = 2;
```

---

## Retiradas

### INSERT - Criar retirada
```sql
-- Retirada com prazo de 7 dias
INSERT INTO retiradas_com_pessoas (
    pasta_id, usuario_id, funcionario_id, 
    data_retirada, data_prevista_retorno, 
    status, dias_decorridos
)
VALUES (
    1, 2, 1, 
    datetime('now'), 
    datetime('now', '+7 days'), 
    'ativo', 
    0
);
```

### SELECT - Buscar retiradas
```sql
-- Retiradas ativas
SELECT r.*, 
       p.nome as pasta_nome,
       f.nome as funcionario_nome,
       u.username as usuario
FROM retiradas_com_pessoas r
JOIN pastas p ON r.pasta_id = p.id
JOIN funcionarios f ON r.funcionario_id = f.id
JOIN usuarios u ON r.usuario_id = u.id
WHERE r.status = 'ativo'
ORDER BY r.data_retirada DESC;

-- Usar índice composto (status + data_retirada)
SELECT r.*, f.nome as funcionario_nome
FROM retiradas_com_pessoas r
JOIN funcionarios f ON r.funcionario_id = f.id
WHERE r.status = 'ativo'
ORDER BY r.data_retirada DESC;

-- Retiradas vencidas
SELECT r.*, 
       p.nome as pasta_nome,
       f.nome as funcionario_nome,
       u.username as usuario,
       julianday('now') - julianday(r.data_prevista_retorno) as dias_atraso
FROM retiradas_com_pessoas r
JOIN pastas p ON r.pasta_id = p.id
JOIN funcionarios f ON r.funcionario_id = f.id
JOIN usuarios u ON r.usuario_id = u.id
WHERE r.status = 'vencido'
ORDER BY dias_atraso DESC;

-- Usar índice composto (status + data_prevista_retorno)
SELECT r.id, r.pasta_id, r.data_prevista_retorno, f.nome
FROM retiradas_com_pessoas r
JOIN funcionarios f ON r.funcionario_id = f.id
WHERE r.status = 'ativo' AND r.data_prevista_retorno < datetime('now');

-- Retiradas próximas do vencimento (2 dias)
SELECT r.*, 
       f.nome as funcionario_nome,
       julianday(r.data_prevista_retorno) - julianday('now') as dias_restantes
FROM retiradas_com_pessoas r
JOIN funcionarios f ON r.funcionario_id = f.id
WHERE r.status = 'ativo' 
  AND r.data_prevista_retorno BETWEEN datetime('now') AND datetime('now', '+2 days')
ORDER BY r.data_prevista_retorno;

-- Histórico de retiradas de um funcionário
SELECT r.*, 
       p.nome as pasta_nome,
       u.username as usuario,
       CASE 
         WHEN r.data_retorno IS NOT NULL THEN 
           julianday(r.data_retorno) - julianday(r.data_retirada)
         ELSE 
           julianday('now') - julianday(r.data_retirada)
       END as dias_total
FROM retiradas_com_pessoas r
JOIN pastas p ON r.pasta_id = p.id
JOIN usuarios u ON r.usuario_id = u.id
WHERE r.funcionario_id = 1
ORDER BY r.data_retirada DESC;
```

### UPDATE - Atualizar retirada
```sql
-- Finalizar retirada (devolução)
UPDATE retiradas_com_pessoas 
SET status = 'devolvido', 
    data_retorno = datetime('now')
WHERE id = 1;

-- Marcar retirada como vencida (pode ser feito por job agendado)
UPDATE retiradas_com_pessoas 
SET status = 'vencido'
WHERE status = 'ativo' 
  AND data_prevista_retorno < datetime('now');

-- Atualizar dias decorridos
UPDATE retiradas_com_pessoas 
SET dias_decorridos = CAST(julianday('now') - julianday(data_retirada) AS INTEGER)
WHERE status = 'ativo';
```

---

## Alertas

### INSERT - Criar alerta
```sql
-- Alerta de aviso
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido)
VALUES (1, 'Prazo de devolução se aproximando (2 dias restantes)', 'aviso', 0);

-- Alerta crítico
INSERT INTO alertas (retirada_id, tipo_alerta, severidade, resolvido)
VALUES (2, 'Prazo de devolução vencido há 3 dias', 'crítico', 0);
```

### SELECT - Buscar alertas
```sql
-- Alertas ativos (não resolvidos)
SELECT a.*, 
       r.pasta_id,
       f.nome as funcionario_nome,
       p.nome as pasta_nome
FROM alertas a
JOIN retiradas_com_pessoas r ON a.retirada_id = r.id
JOIN funcionarios f ON r.funcionario_id = f.id
JOIN pastas p ON r.pasta_id = p.id
WHERE a.resolvido = 0
ORDER BY a.severidade DESC, a.data_criacao DESC;

-- Usar índice composto (resolvido + severidade)
SELECT a.*, f.nome as funcionario_nome
FROM alertas a
JOIN retiradas_com_pessoas r ON a.retirada_id = r.id
JOIN funcionarios f ON r.funcionario_id = f.id
WHERE a.resolvido = 0
ORDER BY a.severidade DESC, a.data_criacao DESC;

-- Alertas críticos
SELECT a.*, 
       f.nome as funcionario_nome,
       r.data_prevista_retorno,
       julianday('now') - julianday(r.data_prevista_retorno) as dias_atraso
FROM alertas a
JOIN retiradas_com_pessoas r ON a.retirada_id = r.id
JOIN funcionarios f ON r.funcionario_id = f.id
WHERE a.severidade = 'crítico' AND a.resolvido = 0
ORDER BY dias_atraso DESC;

-- Contagem de alertas por severidade
SELECT severidade, COUNT(*) as total
FROM alertas
WHERE resolvido = 0
GROUP BY severidade;
```

### UPDATE - Resolver alerta
```sql
-- Marcar alerta como resolvido
UPDATE alertas 
SET resolvido = 1 
WHERE id = 1;

-- Resolver todos os alertas de uma retirada
UPDATE alertas 
SET resolvido = 1 
WHERE retirada_id = 1 AND resolvido = 0;
```

---

## Movimentações

### INSERT - Registrar movimentação
```sql
-- Saída de envelope
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao)
VALUES (
    5, 
    'envelope', 
    'saida', 
    2, 
    'Análise de documentos médicos',
    'Envelope de Medicina retirado para análise de exames do último trimestre'
);

-- Entrada de envelope (devolução)
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao)
VALUES (
    5, 
    'envelope', 
    'entrada', 
    2, 
    'Retorno após análise',
    'Documentos analisados e aprovados'
);

-- Saída de pasta completa
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao)
VALUES (
    1, 
    'pasta', 
    'saida', 
    2, 
    'Auditoria completa',
    'Pasta retirada para auditoria anual de RH'
);
```

### SELECT - Buscar movimentações
```sql
-- Últimas movimentações
SELECT m.*, u.username
FROM movimentacoes m
JOIN usuarios u ON m.usuario_id = u.id
ORDER BY m.data DESC
LIMIT 50;

-- Movimentações de um item específico
SELECT m.*, u.username
FROM movimentacoes m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.item_id = 1 AND m.tipo_item = 'pasta'
ORDER BY m.data DESC;

-- Usar índice composto (tipo_item + data)
SELECT m.*, u.username
FROM movimentacoes m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.tipo_item = 'envelope'
ORDER BY m.data DESC
LIMIT 100;

-- Movimentações por período
SELECT m.*, u.username
FROM movimentacoes m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.data BETWEEN datetime('now', '-30 days') AND datetime('now')
ORDER BY m.data DESC;

-- Usar índice composto (usuario_id + acao)
SELECT m.*, u.username
FROM movimentacoes m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.usuario_id = 2 AND m.acao = 'saida'
ORDER BY m.data DESC;

-- Estatísticas de movimentações por tipo
SELECT tipo_item, acao, COUNT(*) as total
FROM movimentacoes
WHERE data >= datetime('now', '-30 days')
GROUP BY tipo_item, acao
ORDER BY tipo_item, acao;
```

---

## Usuários

### INSERT - Criar usuário
```sql
-- IMPORTANTE: Senha deve ser hasheada com bcrypt!
-- Exemplo em Node.js: const hash = await bcrypt.hash('senha123', 10);

INSERT INTO usuarios (username, senha, perfil, funcionario_id, ativo)
VALUES (
    'joao.operador',
    '$2b$10$exemplo_hash_bcrypt_aqui', -- Hash bcrypt da senha
    'Usuário Operacional',
    1,
    1
);

-- Administrador sem vínculo com funcionário
INSERT INTO usuarios (username, senha, perfil, funcionario_id, ativo)
VALUES (
    'admin.sistema',
    '$2b$10$exemplo_hash_bcrypt_aqui',
    'Administrador',
    NULL,
    1
);
```

### SELECT - Buscar usuários
```sql
-- Todos os usuários ativos
SELECT u.id, u.username, u.perfil, u.ativo, u.created_at,
       f.nome as funcionario_nome
FROM usuarios u
LEFT JOIN funcionarios f ON u.funcionario_id = f.id
WHERE u.ativo = 1
ORDER BY u.username;

-- Usuário para autenticação (incluir senha)
SELECT * FROM usuarios 
WHERE username = 'admin' AND ativo = 1;

-- Usuários por perfil
SELECT u.*, f.nome as funcionario_nome
FROM usuarios u
LEFT JOIN funcionarios f ON u.funcionario_id = f.id
WHERE u.perfil = 'Administrador' AND u.ativo = 1
ORDER BY u.username;
```

### UPDATE - Atualizar usuário
```sql
-- Atualizar dados básicos
UPDATE usuarios 
SET perfil = 'Administrador',
    funcionario_id = 5
WHERE id = 2;

-- Alterar senha (lembre-se de hashear!)
UPDATE usuarios 
SET senha = '$2b$10$novo_hash_bcrypt_aqui'
WHERE id = 1;

-- Desativar usuário
UPDATE usuarios 
SET ativo = 0 
WHERE id = 3;

-- Reativar usuário
UPDATE usuarios 
SET ativo = 1 
WHERE id = 3;
```

---

## Logs

### INSERT - Registrar log
```sql
-- Log de ação do usuário
INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada)
VALUES ('Criou novo funcionário', 1, 10, 'funcionarios');

-- Log de ação do sistema
INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada)
VALUES ('Atualização automática de retiradas vencidas', NULL, NULL, 'retiradas_com_pessoas');

-- Log de visualização
INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada)
VALUES ('Visualizou dashboard', 2, NULL, NULL);
```

### SELECT - Buscar logs
```sql
-- Últimos logs
SELECT l.*, u.username
FROM logs l
LEFT JOIN usuarios u ON l.usuario_id = u.id
ORDER BY l.timestamp DESC
LIMIT 100;

-- Logs de um usuário
SELECT l.*
FROM logs l
WHERE l.usuario_id = 1
ORDER BY l.timestamp DESC;

-- Logs de uma tabela específica
SELECT l.*, u.username
FROM logs l
LEFT JOIN usuarios u ON l.usuario_id = u.id
WHERE l.tabela_afetada = 'funcionarios'
ORDER BY l.timestamp DESC;

-- Logs por período
SELECT l.*, u.username
FROM logs l
LEFT JOIN usuarios u ON l.usuario_id = u.id
WHERE l.timestamp BETWEEN datetime('now', '-7 days') AND datetime('now')
ORDER BY l.timestamp DESC;
```

---

## Queries Complexas com JOINs

### Dashboard completo com todas as estatísticas
```sql
SELECT 
    (SELECT COUNT(*) FROM funcionarios WHERE status = 'Ativo') as total_funcionarios,
    (SELECT COUNT(*) FROM gaveteiros) as total_gaveteiros,
    (SELECT COUNT(*) FROM gavetas) as total_gavetas,
    (SELECT COUNT(*) FROM pastas WHERE ativa = 1) as total_pastas_ativas,
    (SELECT COUNT(*) FROM retiradas_com_pessoas WHERE status = 'ativo') as retiradas_ativas,
    (SELECT COUNT(*) FROM retiradas_com_pessoas WHERE status = 'vencido') as retiradas_vencidas,
    (SELECT COUNT(*) FROM alertas WHERE resolvido = 0) as alertas_pendentes,
    (SELECT COUNT(*) FROM alertas WHERE resolvido = 0 AND severidade = 'crítico') as alertas_criticos,
    (SELECT COUNT(*) FROM solicitacoes WHERE status = 'pendente') as solicitacoes_pendentes;
```

### Visão completa de uma pasta
```sql
SELECT 
    p.id as pasta_id,
    p.nome as pasta_nome,
    p.data_criacao,
    p.ativa,
    p.arquivo_morto,
    f.id as funcionario_id,
    f.nome as funcionario_nome,
    f.departamento,
    f.status as funcionario_status,
    g.id as gaveta_id,
    g.numero as gaveta_numero,
    gt.id as gaveteiro_id,
    gt.nome as gaveteiro_nome,
    gt.localizacao,
    (SELECT COUNT(*) FROM envelopes WHERE pasta_id = p.id AND status = 'presente') as envelopes_presentes,
    (SELECT COUNT(*) FROM envelopes WHERE pasta_id = p.id AND status = 'retirado') as envelopes_retirados,
    (SELECT COUNT(*) FROM retiradas_com_pessoas WHERE pasta_id = p.id AND status = 'ativo') as retiradas_ativas
FROM pastas p
JOIN funcionarios f ON p.funcionario_id = f.id
JOIN gavetas g ON p.gaveta_id = g.id
JOIN gaveteiros gt ON g.gaveteiro_id = gt.id
WHERE p.id = 1;
```

### Relatório de ocupação de gaveteiros
```sql
SELECT 
    gt.id,
    gt.nome as gaveteiro_nome,
    gt.localizacao,
    COUNT(DISTINCT g.id) as total_gavetas,
    SUM(g.capacidade) as capacidade_total,
    SUM(g.ocupacao_atual) as ocupacao_total,
    ROUND(CAST(SUM(g.ocupacao_atual) AS FLOAT) / SUM(g.capacidade) * 100, 2) as percentual_ocupacao,
    COUNT(DISTINCT p.id) as total_pastas
FROM gaveteiros gt
LEFT JOIN gavetas g ON gt.id = g.gaveteiro_id
LEFT JOIN pastas p ON g.id = p.gaveta_id AND p.ativa = 1
GROUP BY gt.id, gt.nome, gt.localizacao
ORDER BY percentual_ocupacao DESC;
```

### Funcionários com retiradas ativas e alertas
```sql
SELECT 
    f.id,
    f.nome,
    f.departamento,
    COUNT(DISTINCT r.id) as retiradas_ativas,
    COUNT(DISTINCT a.id) as alertas_pendentes,
    MAX(CASE WHEN a.severidade = 'crítico' THEN 1 ELSE 0 END) as tem_alerta_critico,
    MIN(r.data_prevista_retorno) as proxima_devolucao
FROM funcionarios f
JOIN retiradas_com_pessoas r ON f.id = r.funcionario_id
LEFT JOIN alertas a ON r.id = a.retirada_id AND a.resolvido = 0
WHERE r.status = 'ativo'
GROUP BY f.id, f.nome, f.departamento
ORDER BY tem_alerta_critico DESC, proxima_devolucao;
```

### Histórico completo de movimentações de um funcionário
```sql
SELECT 
    m.id as movimentacao_id,
    m.data,
    m.tipo_item,
    m.acao,
    m.motivo,
    m.descricao,
    u.username as usuario,
    CASE 
        WHEN m.tipo_item = 'envelope' THEN e.tipo
        ELSE 'Pasta completa'
    END as item_descricao,
    p.nome as pasta_nome
FROM movimentacoes m
JOIN usuarios u ON m.usuario_id = u.id
LEFT JOIN envelopes e ON m.tipo_item = 'envelope' AND m.item_id = e.id
LEFT JOIN pastas p ON (m.tipo_item = 'pasta' AND m.item_id = p.id) OR (e.pasta_id = p.id)
JOIN funcionarios f ON p.funcionario_id = f.id
WHERE f.id = 1
ORDER BY m.data DESC;
```

---

## Queries de Estatísticas

### Estatísticas de retiradas por período
```sql
SELECT 
    date(r.data_retirada) as data,
    COUNT(*) as total_retiradas,
    COUNT(CASE WHEN r.status = 'devolvido' THEN 1 END) as devolvidas,
    COUNT(CASE WHEN r.status = 'vencido' THEN 1 END) as vencidas,
    COUNT(CASE WHEN r.status = 'ativo' THEN 1 END) as ativas,
    AVG(r.dias_decorridos) as media_dias
FROM retiradas_com_pessoas r
WHERE r.data_retirada >= date('now', '-30 days')
GROUP BY date(r.data_retirada)
ORDER BY data DESC;
```

### Ranking de usuários mais ativos
```sql
SELECT 
    u.id,
    u.username,
    u.perfil,
    COUNT(DISTINCT l.id) as total_acoes,
    COUNT(DISTINCT r.id) as total_retiradas,
    COUNT(DISTINCT s.id) as total_solicitacoes,
    COUNT(DISTINCT m.id) as total_movimentacoes
FROM usuarios u
LEFT JOIN logs l ON u.id = l.usuario_id
LEFT JOIN retiradas_com_pessoas r ON u.id = r.usuario_id
LEFT JOIN solicitacoes s ON u.id = s.usuario_id
LEFT JOIN movimentacoes m ON u.id = m.usuario_id
WHERE u.ativo = 1
GROUP BY u.id, u.username, u.perfil
ORDER BY total_acoes DESC;
```

### Departamentos com mais movimentação
```sql
SELECT 
    f.departamento,
    COUNT(DISTINCT f.id) as total_funcionarios,
    COUNT(DISTINCT p.id) as total_pastas,
    COUNT(DISTINCT r.id) as total_retiradas,
    COUNT(DISTINCT CASE WHEN r.status = 'vencido' THEN r.id END) as retiradas_vencidas
FROM funcionarios f
LEFT JOIN pastas p ON f.id = p.funcionario_id AND p.ativa = 1
LEFT JOIN retiradas_com_pessoas r ON f.id = r.funcionario_id
WHERE f.status = 'Ativo'
GROUP BY f.departamento
ORDER BY total_retiradas DESC;
```

### Taxa de aprovação de solicitações
```sql
SELECT 
    u.username,
    u.perfil,
    COUNT(*) as total_solicitacoes,
    COUNT(CASE WHEN s.status = 'aprovada' THEN 1 END) as aprovadas,
    COUNT(CASE WHEN s.status = 'rejeitada' THEN 1 END) as rejeitadas,
    COUNT(CASE WHEN s.status = 'pendente' THEN 1 END) as pendentes,
    ROUND(CAST(COUNT(CASE WHEN s.status = 'aprovada' THEN 1 END) AS FLOAT) / COUNT(*) * 100, 2) as taxa_aprovacao
FROM solicitacoes s
JOIN usuarios u ON s.usuario_id = u.id
GROUP BY u.id, u.username, u.perfil
ORDER BY total_solicitacoes DESC;
```

---

## Padrões de Uso Recomendados

### Transações para operações múltiplas
```sql
-- Criar pasta com envelopes e atualizar ocupação da gaveta
BEGIN TRANSACTION;

-- 1. Inserir pasta
INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto)
VALUES (1, 5, 'Nova Pasta', date('now'), 1, 1, 0);

-- 2. Obter ID da pasta criada
-- (Em código: const pastaId = result.lastInsertRowid)

-- 3. Criar envelopes
INSERT INTO envelopes (pasta_id, tipo, status) VALUES
(last_insert_rowid(), 'Segurança', 'presente'),
(last_insert_rowid(), 'Medicina', 'presente'),
(last_insert_rowid(), 'Pessoal', 'presente'),
(last_insert_rowid(), 'Treinamento', 'presente');

-- 4. Atualizar ocupação da gaveta
UPDATE gavetas 
SET ocupacao_atual = ocupacao_atual + 1 
WHERE id = 1 AND ocupacao_atual < capacidade;

-- 5. Registrar log
INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada)
VALUES ('Criou nova pasta', 2, last_insert_rowid(), 'pastas');

COMMIT;
```

### Aprovar solicitação e criar retirada
```sql
BEGIN TRANSACTION;

-- 1. Aprovar solicitação
UPDATE solicitacoes 
SET status = 'aprovada', 
    data_aprovacao = datetime('now')
WHERE id = 1;

-- 2. Obter dados da solicitação
SELECT usuario_id, funcionario_id FROM solicitacoes WHERE id = 1;

-- 3. Obter pasta do funcionário
SELECT id FROM pastas WHERE funcionario_id = ? AND ativa = 1 LIMIT 1;

-- 4. Criar retirada
INSERT INTO retiradas_com_pessoas (
    pasta_id, usuario_id, funcionario_id, 
    data_retirada, data_prevista_retorno, 
    status, dias_decorridos
) VALUES (?, ?, ?, datetime('now'), datetime('now', '+7 days'), 'ativo', 0);

-- 5. Registrar logs
INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada)
VALUES ('Aprovou solicitação', 1, 1, 'solicitacoes');

INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada)
VALUES ('Criou retirada', 1, last_insert_rowid(), 'retiradas_com_pessoas');

COMMIT;
```

### Finalizar retirada e resolver alertas
```sql
BEGIN TRANSACTION;

-- 1. Finalizar retirada
UPDATE retiradas_com_pessoas 
SET status = 'devolvido', 
    data_retorno = datetime('now')
WHERE id = 1;

-- 2. Resolver alertas relacionados
UPDATE alertas 
SET resolvido = 1 
WHERE retirada_id = 1 AND resolvido = 0;

-- 3. Registrar movimentação de entrada
INSERT INTO movimentacoes (item_id, tipo_item, acao, usuario_id, motivo, descricao)
SELECT 
    pasta_id, 
    'pasta', 
    'entrada', 
    usuario_id, 
    'Devolução de pasta',
    'Pasta devolvida após período de retirada'
FROM retiradas_com_pessoas 
WHERE id = 1;

-- 4. Registrar log
INSERT INTO logs (acao, usuario_id, registro_id, tabela_afetada)
VALUES ('Finalizou retirada', 2, 1, 'retiradas_com_pessoas');

COMMIT;
```

### Otimização com índices - Exemplos práticos
```sql
-- Query otimizada usando índice composto idx_pastas_gaveta_ativa
EXPLAIN QUERY PLAN
SELECT * FROM pastas 
WHERE gaveta_id = 1 AND ativa = 1;
-- Deve usar: SEARCH TABLE pastas USING INDEX idx_pastas_gaveta_ativa

-- Query otimizada usando índice composto idx_retiradas_status_data
EXPLAIN QUERY PLAN
SELECT * FROM retiradas_com_pessoas 
WHERE status = 'ativo'
ORDER BY data_retirada DESC;
-- Deve usar: SEARCH TABLE retiradas_com_pessoas USING INDEX idx_retiradas_status_data

-- Query otimizada usando índice composto idx_alertas_resolvido_severidade
EXPLAIN QUERY PLAN
SELECT * FROM alertas 
WHERE resolvido = 0 
ORDER BY severidade DESC;
-- Deve usar: SEARCH TABLE alertas USING INDEX idx_alertas_resolvido_severidade
```

---

## 🔍 Dicas de Performance

1. **Use EXPLAIN QUERY PLAN** para verificar se os índices estão sendo utilizados
2. **Limite resultados** com LIMIT quando apropriado
3. **Use índices compostos** para queries com múltiplos filtros
4. **Evite SELECT *** quando possível, selecione apenas campos necessários
5. **Use transações** para operações múltiplas
6. **Mantenha estatísticas atualizadas**: `ANALYZE;`
7. **Use prepared statements** para prevenir SQL injection e melhorar performance

---

## ✅ Validações Importantes

```sql
-- Verificar integridade de capacidade das gavetas
SELECT * FROM gavetas 
WHERE ocupacao_atual > capacidade;

-- Verificar pastas órfãs (sem funcionário)
SELECT p.* FROM pastas p
LEFT JOIN funcionarios f ON p.funcionario_id = f.id
WHERE f.id IS NULL;

-- Verificar retiradas sem alerta quando vencidas
SELECT r.* FROM retiradas_com_pessoas r
LEFT JOIN alertas a ON r.id = a.retirada_id
WHERE r.status = 'vencido' AND a.id IS NULL;

-- Verificar consistência de envelopes (cada pasta deve ter 4)
SELECT p.id, p.nome, COUNT(e.id) as total_envelopes
FROM pastas p
LEFT JOIN envelopes e ON p.pasta_id = e.id
GROUP BY p.id, p.nome
HAVING COUNT(e.id) != 4;
```

---

**Nota:** Todos os exemplos são compatíveis com SQLite 3 e podem ser testados diretamente no banco de dados do sistema.