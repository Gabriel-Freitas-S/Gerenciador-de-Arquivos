const { Menu, dialog, shell } = require('electron');

/**
 * Cria o menu nativo da aplicação
 * 
 * @param {BrowserWindow} mainWindow - Janela principal da aplicação
 */
function createMenu(mainWindow) {
  const template = [
    // ============================================
    // MENU ARQUIVO
    // ============================================
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Recarregar Dados',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Exportar Relatório',
          accelerator: 'Ctrl+E',
          click: () => {
            // Esta funcionalidade pode ser implementada futuramente
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Exportar Relatório',
              message: 'Funcionalidade em desenvolvimento',
              detail: 'A exportação de relatórios será implementada em versão futura.'
            });
          }
        },
        {
          label: 'Backup de Dados',
          accelerator: 'Ctrl+B',
          click: async () => {
            const { app } = require('electron');
            const path = require('path');
            const fs = require('fs');
            
            const dbPath = path.join(app.getPath('userData'), 'database.db');
            const backupDir = path.join(app.getPath('userData'), 'backups');
            
            // Criar diretório de backups se não existir
            if (!fs.existsSync(backupDir)) {
              fs.mkdirSync(backupDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const backupPath = path.join(backupDir, `backup-${timestamp}.db`);
            
            try {
              fs.copyFileSync(dbPath, backupPath);
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Backup Concluído',
                message: 'Backup realizado com sucesso!',
                detail: `Arquivo salvo em:\n${backupPath}`
              });
            } catch (error) {
              dialog.showErrorBox('Erro no Backup', 
                `Não foi possível criar o backup:\n${error.message}`);
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Sair',
          accelerator: 'Alt+F4',
          click: () => {
            mainWindow.close();
          }
        }
      ]
    },
    
    // ============================================
    // MENU EDITAR
    // ============================================
    {
      label: 'Editar',
      submenu: [
        {
          role: 'undo',
          label: 'Desfazer',
          accelerator: 'Ctrl+Z'
        },
        {
          role: 'redo',
          label: 'Refazer',
          accelerator: 'Ctrl+Y'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut',
          label: 'Recortar',
          accelerator: 'Ctrl+X'
        },
        {
          role: 'copy',
          label: 'Copiar',
          accelerator: 'Ctrl+C'
        },
        {
          role: 'paste',
          label: 'Colar',
          accelerator: 'Ctrl+V'
        },
        {
          role: 'selectAll',
          label: 'Selecionar Tudo',
          accelerator: 'Ctrl+A'
        },
        {
          type: 'separator'
        },
        {
          label: 'Buscar',
          accelerator: 'Ctrl+F',
          click: () => {
            // Pode ser implementado para focar no campo de busca
            mainWindow.webContents.executeJavaScript(`
              const searchInput = document.querySelector('input[type="search"]');
              if (searchInput) searchInput.focus();
            `);
          }
        }
      ]
    },
    
    // ============================================
    // MENU VISUALIZAR
    // ============================================
    {
      label: 'Visualizar',
      submenu: [
        {
          role: 'reload',
          label: 'Recarregar',
          accelerator: 'Ctrl+R'
        },
        {
          role: 'forceReload',
          label: 'Forçar Recarregar',
          accelerator: 'Ctrl+Shift+R'
        },
        {
          type: 'separator'
        },
        {
          role: 'resetZoom',
          label: 'Zoom Padrão',
          accelerator: 'Ctrl+0'
        },
        {
          role: 'zoomIn',
          label: 'Aumentar Zoom',
          accelerator: 'Ctrl+Plus'
        },
        {
          role: 'zoomOut',
          label: 'Diminuir Zoom',
          accelerator: 'Ctrl+-'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen',
          label: 'Tela Cheia',
          accelerator: 'F11'
        }
      ]
    },
    
    // ============================================
    // MENU NAVEGAÇÃO
    // ============================================
    {
      label: 'Navegação',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'Ctrl+1',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (typeof app !== 'undefined' && app.ui) {
                app.ui.navigateToView('dashboard');
              }
            `);
          }
        },
        {
          label: 'Funcionários',
          accelerator: 'Ctrl+2',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (typeof app !== 'undefined' && app.ui) {
                app.ui.navigateToView('funcionarios');
              }
            `);
          }
        },
        {
          label: 'Gaveteiros',
          accelerator: 'Ctrl+3',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (typeof app !== 'undefined' && app.ui) {
                app.ui.navigateToView('gaveteiros');
              }
            `);
          }
        },
        {
          label: 'Solicitações',
          accelerator: 'Ctrl+4',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (typeof app !== 'undefined' && app.ui) {
                app.ui.navigateToView('solicitacoes');
              }
            `);
          }
        },
        {
          label: 'Retiradas',
          accelerator: 'Ctrl+5',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (typeof app !== 'undefined' && app.ui) {
                app.ui.navigateToView('retiradas');
              }
            `);
          }
        },
        {
          label: 'Alertas',
          accelerator: 'Ctrl+6',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (typeof app !== 'undefined' && app.ui) {
                app.ui.navigateToView('alertas');
              }
            `);
          }
        }
      ]
    },
    
    // ============================================
    // MENU FERRAMENTAS
    // ============================================
    {
      label: 'Ferramentas',
      submenu: [
        {
          label: 'Verificar Alertas',
          accelerator: 'Ctrl+Shift+A',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (typeof app !== 'undefined' && app.ui) {
                app.ui.checkAndDisplayAlerts();
              }
            `);
          }
        },
        {
          label: 'Atualizar Estatísticas',
          accelerator: 'Ctrl+Shift+E',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (typeof app !== 'undefined' && app.ui) {
                app.ui.updateStatistics();
              }
            `);
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Limpar Cache',
          click: () => {
            mainWindow.webContents.session.clearCache().then(() => {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Cache Limpo',
                message: 'O cache foi limpo com sucesso.',
                detail: 'A aplicação será recarregada.'
              }).then(() => {
                mainWindow.webContents.reload();
              });
            });
          }
        }
      ]
    },
    
    // ============================================
    // MENU DESENVOLVEDOR
    // ============================================
    {
      label: 'Desenvolvedor',
      submenu: [
        {
          role: 'toggleDevTools',
          label: 'Ferramentas de Desenvolvimento',
          accelerator: 'F12'
        },
        {
          type: 'separator'
        },
        {
          label: 'Informações do Sistema',
          click: () => {
            const { app } = require('electron');
            const os = require('os');
            const path = require('path');
            
            const info = {
              'Versão da Aplicação': app.getVersion(),
              'Versão do Electron': process.versions.electron,
              'Versão do Chrome': process.versions.chrome,
              'Versão do Node': process.versions.node,
              'Plataforma': os.platform(),
              'Arquitetura': os.arch(),
              'Diretório de Dados': app.getPath('userData'),
              'Banco de Dados': path.join(app.getPath('userData'), 'database.db')
            };
            
            const message = Object.entries(info)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
            
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Informações do Sistema',
              message: 'Detalhes Técnicos',
              detail: message
            });
          }
        },
        {
          label: 'Abrir Pasta de Dados',
          click: () => {
            const { app } = require('electron');
            shell.openPath(app.getPath('userData'));
          }
        }
      ]
    },
    
    // ============================================
    // MENU AJUDA
    // ============================================
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Manual do Usuário',
          accelerator: 'F1',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Manual do Usuário',
              message: 'Documentação',
              detail: 'Consulte o arquivo README.md no diretório da aplicação para informações detalhadas sobre o uso do sistema.'
            });
          }
        },
        {
          label: 'Atalhos de Teclado',
          click: () => {
            const shortcuts = `
ATALHOS GERAIS:
  F5 - Recarregar dados
  Ctrl+R - Recarregar página
  Ctrl+F - Buscar
  F11 - Tela cheia
  F12 - Ferramentas de desenvolvimento
  
NAVEGAÇÃO:
  Ctrl+1 - Dashboard
  Ctrl+2 - Funcionários
  Ctrl+3 - Gaveteiros
  Ctrl+4 - Solicitações
  Ctrl+5 - Retiradas
  Ctrl+6 - Alertas
  
FERRAMENTAS:
  Ctrl+B - Backup de dados
  Ctrl+E - Exportar relatório
  Ctrl+Shift+A - Verificar alertas
  Ctrl+Shift+E - Atualizar estatísticas
            `.trim();
            
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Atalhos de Teclado',
              message: 'Atalhos Disponíveis',
              detail: shortcuts
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Sobre',
          click: () => {
            const { app } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'Sistema de Gerenciamento de Arquivos Físicos',
              detail: `
Versão: ${app.getVersion()}

Desenvolvido para gerenciar arquivos físicos de funcionários em ambiente hospitalar.

Funcionalidades:
• Controle de gaveteiros e gavetas
• Gestão de pastas e envelopes
• Solicitações e retiradas de documentos
• Sistema de alertas automáticos
• Auditoria completa

© 2024 Hospital System
              `.trim()
            });
          }
        },
        {
          label: 'Verificar Atualizações',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Atualizações',
              message: 'Sistema atualizado',
              detail: 'Você está usando a versão mais recente do sistema.'
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Reportar Problema',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Reportar Problema',
              message: 'Suporte Técnico',
              detail: 'Para reportar problemas ou sugerir melhorias, entre em contato com o departamento de TI do hospital.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  console.log('Menu da aplicação criado com sucesso');
}

module.exports = { createMenu };