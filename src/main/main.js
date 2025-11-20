const { app, BrowserWindow, ipcMain } = require('electron');
const { initDatabase } = require('./database');
const { registerIpcHandlers } = require('./ipc');
const { createMainWindow } = require('./windows/mainWindow');
const { createMenu } = require('./menu');

let mainWindow;
let db;

function startApplication() {
  db = initDatabase(app);
  registerIpcHandlers(ipcMain, db);
  mainWindow = createMainWindow();
  createMenu(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('Aplicação iniciada com sucesso');
}

app.whenReady().then(() => {
  try {
    startApplication();
  } catch (error) {
    console.error('Erro ao iniciar aplicação:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startApplication();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
      console.log('Banco de dados fechado');
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
    console.log('Aplicação encerrada');
  }
});