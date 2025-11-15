-- Executar este script após resetar o banco!

-- Garante que perfil Administrador exista
INSERT OR IGNORE INTO perfis (id, nome, descricao, ativo) VALUES (1, 'Administrador', 'Acesso total ao sistema', 1);

-- Garante que perfil Usuário Operacional exista
INSERT OR IGNORE INTO perfis (id, nome, descricao, ativo) VALUES (2, 'Usuário Operacional', 'Acesso apenas operacional', 1);

-- Usuário admin padrão
INSERT OR IGNORE INTO usuarios (username, senha, perfil_id, ativo)
VALUES ('admin', 'admin123', 1, 1);

-- Opcional: criar um usuário operacional de teste
INSERT OR IGNORE INTO usuarios (username, senha, perfil_id, ativo)
VALUES ('usuario', 'usuario123', 2, 1);
