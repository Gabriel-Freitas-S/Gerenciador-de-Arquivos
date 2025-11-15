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

## 📂 Estrutura do Projeto

```
arquivo-hospital/
├── src/
│   ├── main/              # Backend Electron
│   │   ├── main.js        # Processo principal
│   │   ├── preload.js     # IPC bridge (segurança)
│   │   └── menu.js        # Menu nativo
│   ├── renderer/          # Frontend
│   │   ├── index.html     # Interface HTML
│   │   ├── css/
│   │   │   └── style.css  # Estilos
│   │   └── js/
│   │       ├── auth.js    # Autenticação
│   │       ├── database.js # Acesso a dados
│   │       ├── ui.js      # Gerenciamento de interface
│   │       └── app.js     # Coordenação geral
│   └── db/                # Banco de dados
│       ├── schema.sql     # Estrutura das tabelas
│       └── seeds.sql      # Dados iniciais
├── build/
│   └── icon.png           # Ícone da aplicação
├── dist/                  # Executáveis gerados
├── package.json           # Dependências e scripts
├── electron-builder.json  # Configuração de build
├── README.md              # Este arquivo
└── TESTE.md               # Guia completo de testes
```

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