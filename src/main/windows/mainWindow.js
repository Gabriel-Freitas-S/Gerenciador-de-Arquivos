const { BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, '../preload.js')
    },
    icon: path.join(__dirname, '../../../build/icon.png'),
    title: 'Sistema de Arquivo - Hospital',
    backgroundColor: '#ffffff'
  });

  mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

module.exports = { createMainWindow };
