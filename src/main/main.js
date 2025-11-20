const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

let mainWindow;
let db;

function applySchemaMigrations(database) {
  const columnExists = (table, column) => {
    const info = database.prepare(`PRAGMA table_info(${table})`).all();
    return info.some(col => col.name === column);
  };

  const ensureColumn = (table, column, definition) => {
    if (!columnExists(table, column)) {
      console.log(`Adicionando coluna ${column} em ${table}`);
      database.prepare(`ALTER TABLE ${table} ADD COLUMN ${definition}`).run();
    }
  };

  ensureColumn('funcionarios', 'matricula', 'TEXT UNIQUE');
  ensureColumn('solicitacoes', 'pasta_id', 'INTEGER');
  ensureColumn('solicitacoes', 'envelopes_solicitados', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn('solicitacoes', 'is_demissao', 'INTEGER NOT NULL DEFAULT 0 CHECK(is_demissao IN (0, 1))');
  ensureColumn('retiradas_com_pessoas', 'envelopes', "TEXT NOT NULL DEFAULT '[]'");
}

/**
 * Inicializa o banco de dados SQLite
 * Cria o schema e seeds se o banco não existir
 */
function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'database.db');
  console.log('Inicializando banco de dados em:', dbPath);
  
  db = new Database(dbPath);
  
  // Verificar se precisa criar schema
  const tableCount = db.prepare(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'"
  ).get();
  
  if (tableCount.count === 0) {
    console.log('Banco de dados vazio. Criando schema...');
    
    // Executar schema_perfis.sql
    const schemaPath = path.join(__dirname, '../db/schema_perfis.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
      console.log('Schema criado com sucesso');
    } else {
      console.warn('Arquivo schema.sql não encontrado:', schemaPath);
    }
    
    // Executar seeds_perfis.sql
    const seedsPath = path.join(__dirname, '../db/seeds_perfis.sql');
    if (fs.existsSync(seedsPath)) {
      const seeds = fs.readFileSync(seedsPath, 'utf-8');
      db.exec(seeds);
      console.log('Seeds executados com sucesso');
    } else {
      console.warn('Arquivo seeds.sql não encontrado:', seedsPath);
    }
  } else {
    console.log('Banco de dados existente encontrado');
  }
  
  applySchemaMigrations(db);
  
  return db;
}

/**
 * Cria a janela principal da aplicação
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Necessário para better-sqlite3
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../build/icon.png'),
    title: 'Sistema de Arquivo - Hospital',
    backgroundColor: '#ffffff'
  });

  // Carregar HTML da aplicação
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // Abrir DevTools em modo desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Importar e criar menu
  const { createMenu } = require('./menu');
  createMenu(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Configura todos os handlers IPC para comunicação com o renderer
 */
function setupIpcHandlers() {
  const getMenusForUsuario = (usuarioId) => {
    const customMenus = db.prepare(`
      SELECT m.*
      FROM usuarios_menus um
      INNER JOIN menus m ON um.menu_id = m.id
      WHERE um.usuario_id = ? AND m.ativo = 1
      ORDER BY m.ordem
    `).all(usuarioId);

    if (customMenus.length > 0) {
      return customMenus;
    }

    return db.prepare(`
      SELECT m.*
      FROM menus m
      INNER JOIN perfis_menus pm ON m.id = pm.menu_id
      INNER JOIN usuarios u ON u.perfil_id = pm.perfil_id
      WHERE u.id = ? AND m.ativo = 1
      ORDER BY m.ordem
    `).all(usuarioId);
  };

  // ============================================
  // AUTENTICAÇÃO
  // ============================================
  
  ipcMain.handle('auth:login', async (event, username, password) => {
    try {
      const user = db.prepare(`
        SELECT u.*, p.nome as perfil_nome
        FROM usuarios u
        LEFT JOIN perfis p ON u.perfil_id = p.id
        WHERE u.username = ? AND u.ativo = 1
      `).get(username);
      
      if (user && user.senha === password) {
        // Não retornar senha
        const { senha, ...userWithoutPassword } = user;
        return { 
          success: true, 
          user: userWithoutPassword
        };
      }
      
      return { 
        success: false, 
        message: 'Credenciais inválidas' 
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  });

  // ============================================
  // DATABASE - OPERAÇÕES GENÉRICAS
  // ============================================
  
  // Query genérica (SELECT)
  ipcMain.handle('db:query', async (event, sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.all(...params);
      return { 
        success: true, 
        data: result 
      };
    } catch (error) {
      console.error('Erro na query:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  });

  // Execute genérico (INSERT, UPDATE, DELETE)
  ipcMain.handle('db:execute', async (event, sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(...params);
      return { 
        success: true, 
        changes: result.changes, 
        lastInsertRowid: result.lastInsertRowid 
      };
    } catch (error) {
      console.error('Erro na execução:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  });

  // ============================================
  // MÉTODOS ESPECÍFICOS PARA FACILITAR USO
  // ============================================
  
  // Funcionários
  ipcMain.handle('db:getFuncionarios', async () => {
    try {
      const result = db.prepare(
        'SELECT * FROM funcionarios ORDER BY nome COLLATE NOCASE'
      ).all();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('funcionarios:demitir', async (event, { id, dataDemissao }) => {
    try {
      const updateFuncionario = db.prepare(`
        UPDATE funcionarios
        SET status = 'Demitido', data_demissao = ?
        WHERE id = ?
      `);
      const selectPastasAtivas = db.prepare(`
        SELECT id, gaveta_id
        FROM pastas
        WHERE funcionario_id = ? AND ativa = 1
      `);
      const arquivarPasta = db.prepare(`
        UPDATE pastas
        SET ativa = 0, arquivo_morto = 1
        WHERE id = ?
      `);
      const liberarEspacoGaveta = db.prepare(`
        UPDATE gavetas
        SET ocupacao_atual = CASE WHEN ocupacao_atual > 0 THEN ocupacao_atual - 1 ELSE 0 END
        WHERE id = ?
      `);

      const transaction = db.transaction((payload) => {
        updateFuncionario.run(payload.dataDemissao, payload.id);
        const pastasAtivas = selectPastasAtivas.all(payload.id);
        pastasAtivas.forEach(pasta => {
          arquivarPasta.run(pasta.id);
          liberarEspacoGaveta.run(pasta.gaveta_id);
        });
        return pastasAtivas.length;
      });

      const pastasArquivadas = transaction({ id, dataDemissao });
      return { success: true, pastasArquivadas };
    } catch (error) {
      console.error('Erro ao demitir funcionário:', error);
      return { success: false, message: error.message };
    }
  });

  // Gaveteiros
  ipcMain.handle('db:getGaveteiros', async () => {
    try {
      const result = db.prepare(
        'SELECT * FROM gaveteiros ORDER BY nome'
      ).all();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao buscar gaveteiros:', error);
      return { success: false, message: error.message };
    }
  });

  // Gavetas
  ipcMain.handle('db:getGavetas', async (event, gaveteiroId = null) => {
    try {
      const hasFilter = typeof gaveteiroId === 'number' && !Number.isNaN(gaveteiroId);
      const sql = hasFilter
        ? 'SELECT * FROM gavetas WHERE gaveteiro_id = ? ORDER BY numero COLLATE NOCASE'
        : 'SELECT * FROM gavetas ORDER BY gaveteiro_id, numero COLLATE NOCASE';
      const result = hasFilter
        ? db.prepare(sql).all(gaveteiroId)
        : db.prepare(sql).all();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao buscar gavetas:', error);
      return { success: false, message: error.message };
    }
  });

  // Pastas
  ipcMain.handle('db:getPastas', async (event, gavetaId) => {
    try {
      const result = db.prepare(`
        SELECT p.*, 
               f.nome as funcionario_nome,
               f.departamento as funcionario_departamento,
               f.matricula as funcionario_matricula,
               f.data_admissao as funcionario_data_admissao 
        FROM pastas p 
        JOIN funcionarios f ON p.funcionario_id = f.id 
        WHERE p.gaveta_id = ? AND p.ativa = 1
        ORDER BY p.ordem
      `).all(gavetaId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao buscar pastas:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('pastas:criar', async (event, pastaData) => {
    try {
      const insertPasta = db.prepare(`
        INSERT INTO pastas (gaveta_id, funcionario_id, nome, data_criacao, ordem, ativa, arquivo_morto)
        VALUES (?, ?, ?, ?, ?, 1, 0)
      `);
      const insertEnvelope = db.prepare(`
        INSERT INTO envelopes (pasta_id, tipo, status)
        VALUES (?, ?, 'presente')
      `);
      const atualizarOcupacao = db.prepare(`
        UPDATE gavetas
        SET ocupacao_atual = ocupacao_atual + 1
        WHERE id = ?
      `);
      const buscarGaveta = db.prepare(`
        SELECT capacidade, ocupacao_atual
        FROM gavetas
        WHERE id = ?
      `);
      const buscarFuncionarioPorMatricula = db.prepare(`
        SELECT id
        FROM funcionarios
        WHERE matricula = ?
        LIMIT 1
      `);
      const buscarFuncionarioPorNome = db.prepare(`
        SELECT id
        FROM funcionarios
        WHERE lower(nome) = lower(?)
        LIMIT 1
      `);
      const inserirFuncionario = db.prepare(`
        INSERT INTO funcionarios (nome, matricula, departamento, especialidade, data_admissao, status)
        VALUES (?, ?, ?, '', ?, 'Ativo')
      `);
      const atualizarFuncionarioInfo = db.prepare(`
        UPDATE funcionarios
        SET nome = COALESCE(?, nome),
            departamento = COALESCE(?, departamento),
            data_admissao = COALESCE(?, data_admissao),
            matricula = COALESCE(?, matricula)
        WHERE id = ?
      `);
      const verificarPastaAtivaPorFuncionario = db.prepare(`
        SELECT id FROM pastas WHERE funcionario_id = ? AND ativa = 1 LIMIT 1
      `);

      const transaction = db.transaction((payload) => {
        const gaveta = buscarGaveta.get(payload.gaveta_id);
        if (!gaveta) {
          throw new Error('Gaveta não encontrada.');
        }
        if (gaveta.ocupacao_atual >= gaveta.capacidade) {
          throw new Error('Gaveta selecionada está cheia.');
        }

        const dataCriacao = payload.data_criacao || new Date().toISOString().split('T')[0];
        const nomeFuncionarioBase = (payload.funcionario_nome || payload.nome || '').trim();
        const matriculaValor = (payload.funcionario_matricula || '').trim();
        const matricula = matriculaValor ? matriculaValor.toUpperCase() : null;
        const setorInput = (payload.funcionario_setor || '').trim();
        const setorParaInsercao = setorInput || 'Não informado';
        const setorParaAtualizacao = setorInput || null;
        const dataAdmissaoInput = payload.funcionario_data_admissao || null;
        const dataAdmissaoParaInsercao = dataAdmissaoInput || dataCriacao;
        const dataAdmissaoParaAtualizacao = dataAdmissaoInput || null;

        let funcionarioId = payload.funcionario_id;
        if (!funcionarioId) {
          if (matricula) {
            const existentePorMatricula = buscarFuncionarioPorMatricula.get(matricula);
            if (existentePorMatricula) {
              funcionarioId = existentePorMatricula.id;
            }
          }

          const nomeFuncionario = nomeFuncionarioBase;
          if (!funcionarioId && !nomeFuncionario) {
            throw new Error('Informe o nome do funcionário para criar a pasta.');
          }

          if (!funcionarioId) {
            const existente = buscarFuncionarioPorNome.get(nomeFuncionario);
            if (existente) {
              funcionarioId = existente.id;
            }
          }

          if (!funcionarioId) {
            const novoFuncionario = inserirFuncionario.run(
              nomeFuncionario,
              matricula,
              setorParaInsercao,
              dataAdmissaoParaInsercao
            );
            funcionarioId = novoFuncionario.lastInsertRowid;
          }
        }

        atualizarFuncionarioInfo.run(
          nomeFuncionarioBase || null,
          setorParaAtualizacao,
          dataAdmissaoParaAtualizacao,
          matricula || null,
          funcionarioId
        );

        const pastaAtiva = verificarPastaAtivaPorFuncionario.get(funcionarioId);
        if (pastaAtiva) {
          throw new Error('Este funcionário já possui uma pasta ativa.');
        }
        const pastaNome = (payload.nome || nomeFuncionarioBase);
        const result = insertPasta.run(
          payload.gaveta_id,
          funcionarioId,
          pastaNome,
          dataCriacao,
          payload.ordem || 0
        );
        const pastaId = result.lastInsertRowid;

        const envelopeTipos = ['Pessoal', 'Segurança', 'Medicina', 'Treinamento'];
        envelopeTipos.forEach(tipo => insertEnvelope.run(pastaId, tipo));

        atualizarOcupacao.run(payload.gaveta_id);
        return pastaId;
      });

      const pastaId = transaction(pastaData);
      return { success: true, lastInsertRowid: pastaId };
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('pastas:arquivar', async (event, pastaId) => {
    try {
      const selecionarPasta = db.prepare('SELECT gaveta_id FROM pastas WHERE id = ?');
      const arquivar = db.prepare('UPDATE pastas SET arquivo_morto = 1, ativa = 0 WHERE id = ?');
      const liberarEspaco = db.prepare(`
        UPDATE gavetas
        SET ocupacao_atual = CASE WHEN ocupacao_atual > 0 THEN ocupacao_atual - 1 ELSE 0 END
        WHERE id = ?
      `);

      const transaction = db.transaction((id) => {
        const pasta = selecionarPasta.get(id);
        if (!pasta) {
          throw new Error('Pasta não encontrada.');
        }
        arquivar.run(id);
        liberarEspaco.run(pasta.gaveta_id);
      });

      transaction(pastaId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao arquivar pasta:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('solicitacoes:aprovar', async (event, solicitacaoId) => {
    try {
      const selecionarSolicitacao = db.prepare(`
        SELECT s.*, p.gaveta_id
        FROM solicitacoes s
        JOIN pastas p ON s.pasta_id = p.id
        WHERE s.id = ?
      `);
      const atualizarSolicitacao = db.prepare(`
        UPDATE solicitacoes
        SET status = 'aprovada', data_aprovacao = datetime('now')
        WHERE id = ?
      `);
      const selecionarEnvelope = db.prepare(`
        SELECT status, tipo
        FROM envelopes
        WHERE pasta_id = ? AND tipo = ?
        LIMIT 1
      `);
      const contarEnvelopesRetirados = db.prepare(`
        SELECT COUNT(*) as total
        FROM envelopes
        WHERE pasta_id = ? AND status <> 'presente'
      `);
      const inserirRetirada = db.prepare(`
        INSERT INTO retiradas_com_pessoas 
          (pasta_id, usuario_id, funcionario_id, envelopes, data_retirada, data_prevista_retorno, status, dias_decorridos)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+7 days'), 'ativo', 0)
      `);
      const atualizarEnvelopeStatus = db.prepare(`
        UPDATE envelopes 
        SET status = 'retirado'
        WHERE pasta_id = ? AND tipo = ?
      `);
      const atualizarFuncionarioDemissao = db.prepare(`
        UPDATE funcionarios
        SET status = 'Demitido', data_demissao = ?
        WHERE id = ?
      `);
      const arquivarPasta = db.prepare('UPDATE pastas SET ativa = 0, arquivo_morto = 1 WHERE id = ?');
      const liberarEspaco = db.prepare(`
        UPDATE gavetas
        SET ocupacao_atual = CASE WHEN ocupacao_atual > 0 THEN ocupacao_atual - 1 ELSE 0 END
        WHERE id = ?
      `);

      const transaction = db.transaction((id) => {
        const solicitacao = selecionarSolicitacao.get(id);
        if (!solicitacao) {
          throw new Error('Solicitação não encontrada.');
        }
        if (solicitacao.status !== 'pendente') {
          throw new Error('Solicitação já foi processada.');
        }
        if (!solicitacao.pasta_id) {
          throw new Error('Solicitação sem pasta vinculada.');
        }

        let envelopesSelecionados = [];
        try {
          envelopesSelecionados = JSON.parse(solicitacao.envelopes_solicitados || '[]');
        } catch (err) {
          console.warn('Erro ao interpretar envelopes da solicitação:', err);
        }

        if (!solicitacao.is_demissao && envelopesSelecionados.length === 0) {
          throw new Error('Nenhum envelope selecionado para retirada.');
        }

        atualizarSolicitacao.run(id);

        if (solicitacao.is_demissao) {
          const pendentes = contarEnvelopesRetirados.get(solicitacao.pasta_id);
          if (pendentes.total > 0) {
            throw new Error('Existem envelopes ainda retirados. Aguarde a devolução antes de concluir a demissão.');
          }
          const hoje = new Date().toISOString().split('T')[0];
          atualizarFuncionarioDemissao.run(hoje, solicitacao.funcionario_id);
          arquivarPasta.run(solicitacao.pasta_id);
          liberarEspaco.run(solicitacao.gaveta_id);
          return { mode: 'demissao' };
        }

        envelopesSelecionados.forEach(tipo => {
          const envelope = selecionarEnvelope.get(solicitacao.pasta_id, tipo);
          if (!envelope) {
            throw new Error(`Envelope ${tipo} não encontrado para esta pasta.`);
          }
          if (envelope.status !== 'presente') {
            throw new Error(`Envelope ${tipo} já está retirado.`);
          }
          atualizarEnvelopeStatus.run(solicitacao.pasta_id, tipo);
        });

        const retiradaResult = inserirRetirada.run(
          solicitacao.pasta_id,
          solicitacao.usuario_id,
          solicitacao.funcionario_id,
          JSON.stringify(envelopesSelecionados)
        );

        return { mode: 'retirada', retiradaId: retiradaResult.lastInsertRowid };
      });

      const resultado = transaction(solicitacaoId);
      return { success: true, ...resultado };
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('solicitacoes:criar', async (event, solicitacao) => {
    try {
      if (!solicitacao?.pasta_id) {
        throw new Error('Pasta não informada.');
      }
      if (!solicitacao?.envelopes || solicitacao.envelopes.length === 0) {
        throw new Error('Selecione ao menos um envelope.');
      }

      const selectPendentes = db.prepare(`
        SELECT envelopes_solicitados
        FROM solicitacoes
        WHERE pasta_id = ? AND status = 'pendente'
      `);
      const selectEnvelope = db.prepare(`
        SELECT status
        FROM envelopes
        WHERE pasta_id = ? AND tipo = ?
        LIMIT 1
      `);
      const insertSolicitacao = db.prepare(`
        INSERT INTO solicitacoes 
          (funcionario_id, usuario_id, pasta_id, motivo, status, data_solicitacao, envelopes_solicitados, is_demissao)
        VALUES (?, ?, ?, ?, 'pendente', datetime('now'), ?, ?)
      `);

      const transaction = db.transaction((payload) => {
        const envelopesSelecionados = Array.from(new Set(payload.envelopes));
        payload.envelopes = envelopesSelecionados;
        const reservados = new Set();
        selectPendentes.all(payload.pasta_id).forEach(row => {
          try {
            const list = JSON.parse(row.envelopes_solicitados || '[]');
            if (Array.isArray(list)) {
              list.forEach(tipo => reservados.add(tipo));
            }
          } catch (err) {
            console.warn('Erro ao interpretar envelopes pendentes:', err);
          }
        });

        envelopesSelecionados.forEach(tipo => {
          if (reservados.has(tipo)) {
            throw new Error(`Envelope ${tipo} já reservado em outra solicitação pendente.`);
          }
          const envelope = selectEnvelope.get(payload.pasta_id, tipo);
          if (!envelope) {
            throw new Error(`Envelope ${tipo} não encontrado para esta pasta.`);
          }
          if (envelope.status !== 'presente') {
            throw new Error(`Envelope ${tipo} não está disponível para retirada.`);
          }
        });

        const result = insertSolicitacao.run(
          payload.funcionario_id,
          payload.usuario_id,
          payload.pasta_id,
          payload.motivo,
          JSON.stringify(envelopesSelecionados),
          payload.is_demissao ? 1 : 0
        );
        return result.lastInsertRowid;
      });

      const solicitacaoId = transaction(solicitacao);
      return { success: true, lastInsertRowid: solicitacaoId };
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      return { success: false, message: error.message };
    }
  });

  // Solicitações
  ipcMain.handle('db:getSolicitacoes', async () => {
    try {
      const result = db.prepare(`
        SELECT s.*, f.nome as funcionario_nome, u.username 
        FROM solicitacoes s 
        JOIN funcionarios f ON s.funcionario_id = f.id 
        JOIN usuarios u ON s.usuario_id = u.id 
        WHERE s.status = ? 
        ORDER BY s.data_solicitacao DESC
      `).all('pendente');
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      return { success: false, message: error.message };
    }
  });

  // Retiradas ativas
  ipcMain.handle('db:getRetiradas', async () => {
    try {
      const result = db.prepare(`
        SELECT r.*, f.nome as funcionario_nome, u.username 
        FROM retiradas_com_pessoas r 
        JOIN funcionarios f ON r.funcionario_id = f.id 
        JOIN usuarios u ON r.usuario_id = u.id 
        WHERE r.status = ? 
        ORDER BY r.data_retirada DESC
      `).all('ativo');
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao buscar retiradas:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('retiradas:finalizar', async (event, retiradaId) => {
    try {
      const selecionarRetirada = db.prepare('SELECT * FROM retiradas_com_pessoas WHERE id = ?');
      const atualizarRetirada = db.prepare(`
        UPDATE retiradas_com_pessoas 
        SET status = 'devolvido', data_retorno = datetime('now') 
        WHERE id = ?
      `);
      const atualizarEnvelopeStatus = db.prepare(`
        UPDATE envelopes 
        SET status = 'presente'
        WHERE pasta_id = ? AND tipo = ?
      `);

      const transaction = db.transaction((id) => {
        const retirada = selecionarRetirada.get(id);
        if (!retirada) {
          throw new Error('Retirada não encontrada.');
        }
        if (retirada.status !== 'ativo') {
          throw new Error('Retirada já finalizada.');
        }

        let envelopes = [];
        try {
          envelopes = JSON.parse(retirada.envelopes || '[]');
        } catch (err) {
          console.warn('Erro ao interpretar envelopes da retirada:', err);
        }

        envelopes.forEach(tipo => atualizarEnvelopeStatus.run(retirada.pasta_id, tipo));
        atualizarRetirada.run(id);
      });

      transaction(retiradaId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao finalizar retirada:', error);
      return { success: false, message: error.message };
    }
  });

  // Alertas
  ipcMain.handle('db:getAlertas', async () => {
    try {
      const result = db.prepare(`
        SELECT a.*, r.funcionario_id, f.nome as funcionario_nome 
        FROM alertas a 
        JOIN retiradas_com_pessoas r ON a.retirada_id = r.id 
        JOIN funcionarios f ON r.funcionario_id = f.id 
        WHERE a.resolvido = 0 
        ORDER BY a.severidade DESC, a.data_criacao DESC
      `).all();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return { success: false, message: error.message };
    }
  });

  // Estatísticas do dashboard
  ipcMain.handle('db:getEstatisticas', async () => {
    try {
      const totalGavetas = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ocupacao_atual >= capacidade THEN 1 ELSE 0 END) as cheias,
          SUM(CASE WHEN capacidade > 0 AND ocupacao_atual < capacidade AND (CAST(ocupacao_atual AS REAL) / capacidade) >= 0.8 THEN 1 ELSE 0 END) as atencao,
          SUM(CASE WHEN ocupacao_atual = 0 THEN 1 ELSE 0 END) as vazias
        FROM gavetas
      `).get();

      const totalPastas = db.prepare(
        'SELECT COUNT(*) as total FROM pastas WHERE ativa = 1'
      ).get();

      const totalRetiradas = db.prepare(
        'SELECT COUNT(*) as total FROM retiradas_com_pessoas WHERE status = ?'
      ).get('ativo');

      const alertasCriticos = db.prepare(
        "SELECT COUNT(*) as total FROM alertas WHERE resolvido = 0 AND lower(severidade) = 'crítico'"
      ).get();

      return {
        success: true,
        data: {
          totalGavetas: totalGavetas.total || 0,
          totalPastas: totalPastas.total || 0,
          itensRetirados: totalRetiradas.total || 0,
          alertasCriticos: alertasCriticos.total || 0,
          gavetasCheias: totalGavetas.cheias || 0,
          gavetasAtencao: totalGavetas.atencao || 0,
          gavetasVazias: totalGavetas.vazias || 0,
          gavetasDisponiveis: Math.max(0, (totalGavetas.total || 0) - (totalGavetas.cheias || 0))
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, message: error.message };
    }
  });

  // ============================================
  // PERFIS DE ACESSO
  // ============================================
  
  // Listar todos os perfis
  ipcMain.handle('perfis:listar', async () => {
    try {
      const result = db.prepare(`
        SELECT * FROM perfis
        WHERE ativo = 1
        ORDER BY nome
      `).all();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao listar perfis:', error);
      return { success: false, message: error.message };
    }
  });

  // Buscar perfil específico com seus menus
  ipcMain.handle('perfis:buscar', async (event, perfilId) => {
    try {
      const perfil = db.prepare('SELECT * FROM perfis WHERE id = ?').get(perfilId);
      
      if (!perfil) {
        return { success: false, message: 'Perfil não encontrado' };
      }
      
      const menus = db.prepare(`
        SELECT m.*
        FROM menus m
        INNER JOIN perfis_menus pm ON m.id = pm.menu_id
        WHERE pm.perfil_id = ? AND m.ativo = 1
        ORDER BY m.ordem
      `).all(perfilId);
      
      return { success: true, data: { ...perfil, menus } };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return { success: false, message: error.message };
    }
  });

  // Criar novo perfil
  ipcMain.handle('perfis:criar', async (event, nome, descricao, menuIds) => {
    try {
      const insertPerfil = db.prepare('INSERT INTO perfis (nome, descricao, ativo) VALUES (?, ?, 1)');
      const insertMenu = db.prepare('INSERT INTO perfis_menus (perfil_id, menu_id) VALUES (?, ?)');
      
      const transaction = db.transaction(() => {
        const result = insertPerfil.run(nome, descricao);
        const perfilId = result.lastInsertRowid;
        
        for (const menuId of menuIds) {
          insertMenu.run(perfilId, menuId);
        }
        
        return perfilId;
      });
      
      const perfilId = transaction();
      
      return { success: true, data: { id: perfilId }, message: 'Perfil criado com sucesso' };
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return { success: false, message: error.message };
    }
  });

  // Atualizar perfil existente
  ipcMain.handle('perfis:atualizar', async (event, perfilId, nome, descricao, menuIds) => {
    try {
      const updatePerfil = db.prepare('UPDATE perfis SET nome = ?, descricao = ? WHERE id = ?');
      const deleteMenus = db.prepare('DELETE FROM perfis_menus WHERE perfil_id = ?');
      const insertMenu = db.prepare('INSERT INTO perfis_menus (perfil_id, menu_id) VALUES (?, ?)');
      
      const transaction = db.transaction(() => {
        updatePerfil.run(nome, descricao, perfilId);
        deleteMenus.run(perfilId);
        
        for (const menuId of menuIds) {
          insertMenu.run(perfilId, menuId);
        }
      });
      
      transaction();
      
      return { success: true, message: 'Perfil atualizado com sucesso' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, message: error.message };
    }
  });

  // Excluir perfil
  ipcMain.handle('perfis:excluir', async (event, perfilId) => {
    try {
      // Verificar se há usuários usando este perfil
      const usuariosComPerfil = db.prepare(
        'SELECT COUNT(*) as total FROM usuarios WHERE perfil_id = ?'
      ).get(perfilId);
      
      if (usuariosComPerfil.total > 0) {
        return {
          success: false,
          message: `Não é possível excluir. Existem ${usuariosComPerfil.total} usuário(s) usando este perfil.`
        };
      }
      
      db.prepare('DELETE FROM perfis WHERE id = ?').run(perfilId);
      
      return { success: true, message: 'Perfil excluído com sucesso' };
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      return { success: false, message: error.message };
    }
  });

  // ============================================
  // MENUS DO SISTEMA
  // ============================================
  
  // Listar todos os menus
  ipcMain.handle('menus:listar', async () => {
    try {
      const result = db.prepare(`
        SELECT * FROM menus
        WHERE ativo = 1
        ORDER BY ordem
      `).all();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao listar menus:', error);
      return { success: false, message: error.message };
    }
  });

  // Buscar menus de um usuário (através do perfil)
  ipcMain.handle('usuarios:menus', async (event, usuarioId) => {
    try {
      const result = getMenusForUsuario(usuarioId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao buscar menus do usuário:', error);
      return { success: false, message: error.message };
    }
  });

  // Buscar perfil de um usuário com menus
  ipcMain.handle('usuarios:perfil-completo', async (event, usuarioId) => {
    try {
      const usuario = db.prepare(`
        SELECT u.*, p.nome as perfil_nome, p.descricao as perfil_descricao
        FROM usuarios u
        INNER JOIN perfis p ON u.perfil_id = p.id
        WHERE u.id = ?
      `).get(usuarioId);
      
      if (!usuario) {
        return { success: false, message: 'Usuário não encontrado' };
      }
      
      const menus = getMenusForUsuario(usuarioId);
      
      return { success: true, data: { ...usuario, menus } };
    } catch (error) {
      console.error('Erro ao buscar perfil completo do usuário:', error);
      return { success: false, message: error.message };
    }
  });

  // ============================================
  // ALERTAS - ATUALIZACAO AUTOMATICA
  // ============================================
  
  ipcMain.handle('alertas:atualizar', async () => {
    try {
      db.prepare(`
        UPDATE retiradas_com_pessoas 
        SET dias_decorridos = CAST((julianday('now') - julianday(data_retirada)) AS INTEGER)
        WHERE status = 'ativo'
      `).run();
      
      const retiradas = db.prepare(`
        SELECT r.*, f.status as funcionario_status
        FROM retiradas_com_pessoas r
        JOIN funcionarios f ON r.funcionario_id = f.id
        WHERE r.status = 'ativo'
      `).all();
      
      const insertAlerta = db.prepare(`
        INSERT OR IGNORE INTO alertas (retirada_id, tipo_alerta, severidade, resolvido)
        VALUES (?, ?, ?, 0)
      `);
      
      for (const ret of retiradas) {
        const prazo = ret.funcionario_status === 'Demitido' ? 3 : 7;
        
        if (ret.dias_decorridos >= prazo) {
          insertAlerta.run(
            ret.id,
            `Prazo de devolucao vencido ha ${ret.dias_decorridos - prazo} dias`,
            'crítico'
          );
        } else if (ret.dias_decorridos >= prazo - 2) {
          insertAlerta.run(
            ret.id,
            `Prazo de devolucao se aproximando (${prazo - ret.dias_decorridos} dias restantes)`,
            'aviso'
          );
        }
      }
      
      console.log(`Alertas atualizados: ${retiradas.length} retiradas verificadas`);
      return { success: true, message: 'Alertas atualizados' };
    } catch (error) {
      console.error('Erro ao atualizar alertas:', error);
      return { success: false, message: error.message };
    }
  });
  
  // ============================================
  // USUARIOS - ATUALIZAR MENUS/PERMISSOES
  // ============================================
  
  ipcMain.handle('usuarios:atualizar-menus', async (event, usuarioId, menuIds = []) => {
    try {
      const deleteMenus = db.prepare('DELETE FROM usuarios_menus WHERE usuario_id = ?');
      const insertMenu = db.prepare('INSERT INTO usuarios_menus (usuario_id, menu_id) VALUES (?, ?)');
      
      const transaction = db.transaction(() => {
        deleteMenus.run(usuarioId);
        
        for (const menuId of menuIds) {
          insertMenu.run(usuarioId, menuId);
        }
      });
      
      transaction();
      console.log(`Permissoes atualizadas para usuario ${usuarioId}: ${menuIds.length} menus`);
      return { success: true, message: 'Permissões atualizadas' };
    } catch (error) {
      console.error('Erro ao atualizar menus do usuário:', error);
      return { success: false, message: error.message };
    }
  });

  console.log('IPC Handlers configurados com sucesso');
}

// ============================================
// CICLO DE VIDA DA APLICAÇÃO
// ============================================

// Quando o Electron terminar de inicializar
app.whenReady().then(() => {
  try {
    initDatabase();
    setupIpcHandlers();
    createWindow();
    console.log('Aplicação iniciada com sucesso');
  } catch (error) {
    console.error('Erro ao iniciar aplicação:', error);
    app.quit();
  }

  // No macOS, recriar janela quando clicar no ícone do dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Fechar aplicação quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  // No macOS, aplicativos ficam ativos até o usuário sair explicitamente
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
      console.log('Banco de dados fechado');
    }
    app.quit();
  }
});

// Cleanup antes de sair
app.on('before-quit', () => {
  if (db) {
    db.close();
    console.log('Aplicação encerrada');
  }
});