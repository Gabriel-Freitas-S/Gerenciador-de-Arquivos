const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

function columnExists(db, table, column) {
  const info = db.prepare(`PRAGMA table_info(${table})`).all();
  return info.some(col => col.name === column);
}

function ensureColumn(db, table, column, definition) {
  if (!columnExists(db, table, column)) {
    console.log(`Adicionando coluna ${column} em ${table}`);
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${definition}`).run();
  }
}

function applySchemaMigrations(db) {
  ensureColumn(db, 'funcionarios', 'matricula', 'TEXT UNIQUE');
  ensureColumn(db, 'solicitacoes', 'pasta_id', 'INTEGER');
  ensureColumn(db, 'solicitacoes', 'envelopes_solicitados', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn(db, 'solicitacoes', 'is_demissao', 'INTEGER NOT NULL DEFAULT 0 CHECK(is_demissao IN (0, 1))');
  ensureColumn(db, 'retiradas_com_pessoas', 'envelopes', "TEXT NOT NULL DEFAULT '[]'");
}

function runSqlFile(db, relativePath) {
  const absolutePath = path.join(__dirname, relativePath);
  if (fs.existsSync(absolutePath)) {
    const content = fs.readFileSync(absolutePath, 'utf-8');
    db.exec(content);
    console.log(`Arquivo SQL executado com sucesso: ${relativePath}`);
  } else {
    console.warn(`Arquivo SQL não encontrado: ${absolutePath}`);
  }
}

function initDatabase(appInstance) {
  const dbPath = path.join(appInstance.getPath('userData'), 'database.db');
  console.log('Inicializando banco de dados em:', dbPath);

  const db = new Database(dbPath);
  const tableCount = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get();

  if (tableCount.count === 0) {
    console.log('Banco de dados vazio. Criando schema e seeds...');
    runSqlFile(db, '../../db/schema_perfis.sql');
    runSqlFile(db, '../../db/seeds_perfis.sql');
  } else {
    console.log('Banco de dados existente encontrado');
  }

  applySchemaMigrations(db);
  return db;
}

module.exports = { initDatabase };
