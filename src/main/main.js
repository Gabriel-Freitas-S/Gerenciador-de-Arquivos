const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

let mainWindow;
let db;

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
        SELECT p.*, f.nome as funcionario_nome 
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

      const transaction = db.transaction((payload) => {
        const gaveta = buscarGaveta.get(payload.gaveta_id);
        if (!gaveta) {
          throw new Error('Gaveta não encontrada.');
        }
        if (gaveta.ocupacao_atual >= gaveta.capacidade) {
          throw new Error('Gaveta selecionada está cheia.');
        }

        const dataCriacao = payload.data_criacao || new Date().toISOString().split('T')[0];

        const result = insertPasta.run(
          payload.gaveta_id,
          payload.funcionario_id,
          payload.nome,
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