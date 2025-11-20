const { registerAuthHandlers } = require('./modules/auth-handlers');
const { registerDatabaseHandlers } = require('./modules/database-handlers');
const { registerFuncionariosHandlers } = require('./modules/funcionarios-handlers');
const { registerGavetaHandlers } = require('./modules/gaveta-handlers');
const { registerPastaHandlers } = require('./modules/pasta-handlers');
const { registerSolicitacaoHandlers } = require('./modules/solicitacao-handlers');
const { registerRetiradaHandlers } = require('./modules/retirada-handlers');
const { registerAlertaHandlers } = require('./modules/alerta-handlers');
const { registerEstatisticaHandlers } = require('./modules/estatistica-handlers');
const { registerPerfilHandlers } = require('./modules/perfil-handlers');
const { registerMenuHandlers } = require('./modules/menu-handlers');
const { registerUsuarioPermissaoHandlers } = require('./modules/usuario-permissao-handlers');

function registerIpcHandlers(ipcMain, db) {
  const handlers = [
    registerAuthHandlers,
    registerDatabaseHandlers,
    registerFuncionariosHandlers,
    registerGavetaHandlers,
    registerPastaHandlers,
    registerSolicitacaoHandlers,
    registerRetiradaHandlers,
    registerAlertaHandlers,
    registerEstatisticaHandlers,
    registerPerfilHandlers,
    registerMenuHandlers,
    registerUsuarioPermissaoHandlers
  ];

  handlers.forEach(register => register(ipcMain, db));
  console.log('IPC Handlers configurados com sucesso');
}

module.exports = { registerIpcHandlers };
