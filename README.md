# Sistema de Gerenciamento de Arquivos Físicos - Hospital

Sistema desktop para gerenciamento de arquivos físicos hospitalares desenvolvido com Electron.

## Descrição

Aplicação profissional para controle e rastreamento de arquivos físicos em ambientes hospitalares, oferecendo interface intuitiva e banco de dados local SQLite.

## ⚠️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **Node.js 18+** (recomendado: versão LTS)
  - Download: https://nodejs.org/
- **Windows 10/11**
- **Visual Studio Build Tools** (instaladas automaticamente com Node.js)

Verifique a instalação:
```bash
node --version  # Deve mostrar v18.x ou superior
npm --version   # Deve mostrar versão do npm
```

## 📦 Instalação

### 1. Instalar Dependências
```bash
npm install
```

**O que será instalado:**
- Electron (~28.0.0) - Framework desktop
- better-sqlite3 (~9.2.0) - Banco de dados SQLite
- electron-store (~8.1.0) - Persistência de configurações
- electron-builder (~24.9.0) - Build do executável
- electron-rebuild (~3.2.0) - Rebuild de módulos nativos
- cross-env (~7.0.3) - Variáveis de ambiente

### 2. Rebuild de Módulos Nativos (se necessário)
```bash
npm run rebuild
```

**Nota**: Este comando é executado automaticamente após `npm install`.

## 🚀 Comandos Disponíveis

### Desenvolvimento
```bash
# Executar em modo desenvolvimento (com DevTools aberto)
npm run dev

# Executar em modo normal
npm start

# Rebuild de módulos nativos
npm run rebuild
```

### Build
```bash
# Gerar executável Windows (instalador .exe)
npm run build

# Gerar build sem instalador (pasta descompactada)
npm run build:dir
```

### Localização do Executável
Após `npm run build`, o instalador estará em:
```
dist/Sistema de Arquivos Hospital-Setup-1.0.0.exe
```

## 🔐 Credenciais Padrão

### Usuário Administrador
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Permissões**: Acesso total ao sistema

### Usuário Operador
- **Usuário**: `operador`
- **Senha**: `senha123`
- **Permissões**: Acesso limitado (operações básicas)

## Tecnologias

- Electron
- SQLite (better-sqlite3)
- HTML5 / CSS3 / JavaScript

## 🎨 Preferências de Tema

- O layout respeita automaticamente o tema configurado no sistema operacional (claro ou escuro).
- O switch com ícones de sol e lua fica ao lado do nome do usuário (parte inferior da barra lateral).
- Um clique sempre alterna entre o visual claro e escuro; se o resultado coincidisse com o tema do sistema, o clique seguinte retorna ao modo padrão automaticamente.
- A escolha atual fica salva no dispositivo e será aplicada na próxima abertura do aplicativo.

## 📂 Estrutura do Projeto

```
Gerenciador-de-Arquivos/
├── build/
│   └── icon.png
├── src/
│   ├── db/
│   │   ├── schema_perfis.sql
│   │   ├── seeds_perfis.sql
│   │   └── seed_admin.sql
│   ├── main/                         # Processo principal do Electron
│   │   ├── database/                 # Inicialização e migrações do SQLite
│   │   │   └── index.js
│   │   ├── ipc/
│   │   │   ├── helpers/
│   │   │   │   └── menu-helper.js
│   │   │   ├── modules/              # Handlers separados por domínio
│   │   │   │   ├── alerta-handlers.js
│   │   │   │   ├── auth-handlers.js
│   │   │   │   ├── database-handlers.js
│   │   │   │   ├── estatistica-handlers.js
│   │   │   │   ├── funcionarios-handlers.js
│   │   │   │   ├── gaveta-handlers.js
│   │   │   │   ├── menu-handlers.js
│   │   │   │   ├── pasta-handlers.js
│   │   │   │   ├── perfil-handlers.js
│   │   │   │   ├── retirada-handlers.js
│   │   │   │   ├── solicitacao-handlers.js
│   │   │   │   └── usuario-permissao-handlers.js
│   │   │   └── index.js              # Registro central dos handlers
│   │   ├── windows/
│   │   │   └── mainWindow.js         # Criação da BrowserWindow
│   │   ├── main.js                   # Bootstrap contendo apenas orquestração
│   │   ├── preload.js                # Ponte segura renderer/main
│   │   └── menu.js                   # Menu nativo
│   └── renderer/
│       ├── index.html
│       ├── css/style.css
│       └── js/
│           ├── utils/date-utils.js
│           ├── utils/dom-utils.js
│           ├── controllers/modal-controller.js
│           ├── auth.js
│           ├── database.js
│           ├── ui.js
│           └── app.js
├── electron-builder.json
├── package.json
└── README.md
```

### Organização em camadas

- **Processo principal**: `src/main/main.js` apenas coordena inicialização delegando responsabilidades para `database/`, `ipc/` e `windows/`.
- **Camada de dados**: `src/main/database/index.js` cuida do ciclo de vida do SQLite (criação, migração e seeds).
- **IPC modular**: cada domínio de negócio possui um arquivo dedicado em `src/main/ipc/modules`, facilitando manutenção e futuras adições sem arquivos monolíticos.
- **Renderer**: utilitários globais (`DateUtils`, `DomUtils`) e `ModalController` compartilham lógica entre `app.js`, `ui.js` e demais módulos.

Essa divisão mantém responsabilidades pequenas, melhora testabilidade e reduz impacto de mudanças futuras.

## 🧪 Testes

Para instruções detalhadas de teste, consulte: [`TESTE.md`](TESTE.md:1)

O guia de testes inclui:
- Checklist completo de funcionalidades
- Problemas comuns e soluções
- Logs esperados
- Critérios de sucesso

## 💾 Banco de Dados

O banco de dados SQLite é criado automaticamente em:
```
C:\Users\{usuario}\AppData\Roaming\Sistema de Arquivos Hospital\database.db
```

Dados iniciais (seeds) são carregados na primeira execução.

## 🐛 Problemas Comuns

### Node.js não reconhecido
**Solução**: Instale Node.js de https://nodejs.org/ e reinicie o terminal.

### Erro ao compilar better-sqlite3
**Solução**: Execute `npm run rebuild` ou instale Visual Studio Build Tools.

### Banco de dados bloqueado
**Solução**: Feche todas as instâncias da aplicação antes de reabrir.

## 📞 Suporte

Para mais detalhes sobre resolução de problemas, consulte: [`TESTE.md`](TESTE.md:1)

## 📄 Licença

MIT