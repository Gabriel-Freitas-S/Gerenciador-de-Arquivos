# 🧪 Guia de Teste - Sistema de Arquivos Hospital

## ⚠️ Pré-requisitos Obrigatórios

### 1. Instalar Node.js
**IMPORTANTE**: Node.js não foi detectado no sistema.

Antes de continuar, instale o Node.js 18+ (recomendado: versão LTS):
- 📥 **Download**: https://nodejs.org/
- Escolha a versão **LTS (Long Term Support)**
- Durante a instalação, marque a opção "Automatically install necessary tools"

Após a instalação:
1. **Reinicie o terminal/VSCode**
2. Verifique com: `node --version` (deve mostrar v18.x ou superior)
3. Verifique com: `npm --version` (deve mostrar versão do npm)

### 2. Requisitos do Sistema
- ✅ Node.js 18+ instalado
- ✅ Windows 10/11
- ✅ Visual Studio Build Tools (instaladas automaticamente com Node.js)

---

## 🚀 Instalação do Projeto

### Passo 1: Instalar Dependências
```bash
# No diretório do projeto (d:/arquivo-hospital)
npm install
```

**O que será instalado:**
- Electron (~28.0.0) - Framework desktop
- better-sqlite3 (~9.2.0) - Banco de dados SQLite
- electron-store (~8.1.0) - Persistência de configurações
- electron-builder (~24.9.0) - Build do executável
- electron-rebuild (~3.2.0) - Rebuild de módulos nativos
- cross-env (~7.0.3) - Variáveis de ambiente cross-platform

### Passo 2: Rebuild de Módulos Nativos
```bash
npm run rebuild
```

**Nota**: Este comando já é executado automaticamente após `npm install` via script `postinstall`.

### Passo 3: Verificar Instalação
Verifique se a pasta `node_modules/` foi criada no diretório do projeto.

---

## 🎮 Executar em Modo Desenvolvimento

### Opção 1: Modo Normal
```bash
npm start
```

### Opção 2: Modo Desenvolvimento (com DevTools aberto)
```bash
npm run dev
```

**Recomendação**: Use `npm run dev` para ver logs e depurar.

---

## 🔍 Checklist de Testes Completo

### 1. ✅ Inicialização
- [ ] Aplicação abre sem erros
- [ ] Tela de login é exibida
- [ ] DevTools mostra logs sem erros críticos
- [ ] Banco de dados é criado automaticamente

### 2. 🔐 Login
- [ ] Login com credenciais corretas funciona:
  - **Admin**: `admin` / `admin123`
  - **Operador**: `operador` / `senha123`
- [ ] Login com credenciais incorretas é rejeitado
- [ ] Mensagens de erro são exibidas corretamente
- [ ] Após login, dashboard é carregado

### 3. 📊 Dashboard
- [ ] Estatísticas são carregadas corretamente
- [ ] Cards exibem números:
  - Total de funcionários
  - Total de gaveteiros
  - Total de pastas
  - Total de envelopes
  - Pastas retiradas
  - Solicitações pendentes
- [ ] Alertas (se houver) são exibidos
- [ ] Layout é responsivo

### 4. 🧭 Navegação
- [ ] Menu lateral funciona
- [ ] Transição entre views é suave
- [ ] View ativa é destacada no menu
- [ ] Informações do usuário logado são exibidas no topo

### 5. 👥 Funcionários
- [ ] Lista de funcionários é carregada
- [ ] Filtro por status funciona (Ativo/Demitido)
- [ ] Busca por nome funciona
- [ ] Adicionar novo funcionário:
  - [ ] Formulário abre corretamente
  - [ ] Validação de campos funciona
  - [ ] Novo funcionário é salvo no banco
  - [ ] Lista é atualizada
- [ ] Editar funcionário:
  - [ ] Dados são carregados no formulário
  - [ ] Alterações são salvas
- [ ] Demitir funcionário:
  - [ ] Confirmação é solicitada
  - [ ] Status é alterado para "Demitido"
  - [ ] Pastas são movidas para arquivo morto

### 6. 🗄️ Gaveteiros e Gavetas
- [ ] Lista de gaveteiros é carregada
- [ ] Visualização de gavetas por gaveteiro funciona
- [ ] Indicador de ocupação está correto (X de Y envelopes)
- [ ] Cores indicam status (vazio/parcial/cheio)
- [ ] Adicionar gaveteiro:
  - [ ] Formulário funciona
  - [ ] Gaveteiro é criado
- [ ] Adicionar gaveta:
  - [ ] Gaveta é associada ao gaveteiro correto
  - [ ] Capacidade é definida

### 7. 📁 Pastas e Envelopes
- [ ] Visualizar pastas de uma gaveta funciona
- [ ] Envelopes são listados corretamente
- [ ] Status dos envelopes (presente/retirado) está correto
- [ ] Cores indicam status
- [ ] Adicionar pasta:
  - [ ] Pasta é criada e associada ao funcionário
  - [ ] Envelopes são criados automaticamente
- [ ] Detalhes da pasta mostram informações corretas

### 8. 📝 Solicitações
- [ ] Lista de funcionários para solicitar arquivo
- [ ] Criar solicitação:
  - [ ] Motivo é obrigatório
  - [ ] Prazo de devolução é definido
  - [ ] Solicitação é criada com status "pendente"
- [ ] **(Admin)** Aprovar solicitação:
  - [ ] Status muda para "aprovada"
  - [ ] Retirada é criada automaticamente
  - [ ] Envelope é marcado como retirado
- [ ] **(Admin)** Rejeitar solicitação:
  - [ ] Status muda para "rejeitada"
  - [ ] Motivo da rejeição é salvo
  - [ ] Envelope permanece disponível

### 9. 📤 Retiradas
- [ ] Minhas retiradas são listadas
- [ ] Dias decorridos são calculados corretamente
- [ ] Status é exibido:
  - [ ] 🟢 Ativo (dentro do prazo)
  - [ ] 🔴 Vencido (ultrapassou prazo)
  - [ ] ⚪ Devolvido
- [ ] Finalizar devolução:
  - [ ] Confirmação é solicitada
  - [ ] Status muda para "devolvido"
  - [ ] Envelope volta a ficar disponível
  - [ ] Data de devolução é registrada

### 10. ⚠️ Alertas
- [ ] Alertas são listados por severidade
- [ ] Cores corretas:
  - [ ] 🟡 Amarelo (alerta)
  - [ ] 🔴 Vermelho (crítico)
- [ ] Tipos de alertas:
  - [ ] Retiradas vencidas
  - [ ] Gavetas com capacidade próxima ao limite
  - [ ] Solicitações pendentes há muito tempo
- [ ] Resolver alerta:
  - [ ] Status muda para "resolvido"
  - [ ] Alerta é removido da lista ativa

### 11. 📜 Movimentações
- [ ] Histórico de movimentações é carregado
- [ ] Registrar movimentação manual:
  - [ ] Tipo é selecionado
  - [ ] Observação é adicionada
  - [ ] Movimentação é salva
- [ ] Data/hora são exibidas corretamente
- [ ] Filtros funcionam (por tipo, data, usuário)

### 12. 🗂️ Arquivo Morto
- [ ] Pastas de funcionários demitidos são listadas
- [ ] Informações do funcionário são exibidas
- [ ] Status "Demitido" é visível
- [ ] Pastas não podem ser retiradas

### 13. 🔧 Área Administrativa (apenas admin)
- [ ] Gerenciar funcionários:
  - [ ] Lista completa (ativos e demitidos)
  - [ ] Filtros funcionam
- [ ] Gerenciar usuários do sistema:
  - [ ] Lista de usuários é carregada
  - [ ] Adicionar novo usuário
  - [ ] Editar usuário existente
  - [ ] Desativar usuário
  - [ ] Alterar senha
  - [ ] Definir permissões (admin/operador)
- [ ] Logs de auditoria:
  - [ ] Ações são registradas
  - [ ] Histórico completo é exibido

### 14. 📋 Menu Nativo
- [ ] Menu da aplicação está presente na barra superior
- [ ] Atalhos de teclado funcionam:
  - [ ] `F5` - Recarregar
  - [ ] `Ctrl+1` - Dashboard
  - [ ] `Ctrl+2` - Funcionários
  - [ ] `Ctrl+3` - Gaveteiros
  - [ ] `Ctrl+4` - Solicitações
  - [ ] `Ctrl+5` - Retiradas
  - [ ] `Ctrl+Q` - Sair
  - [ ] `F12` - DevTools
- [ ] Menu Arquivo > Sair funciona
- [ ] Menu Desenvolvedor > DevTools funciona
- [ ] Menu Ajuda > Sobre exibe informações

### 15. 💾 Persistência de Dados
- [ ] Fechar e reabrir aplicação mantém dados
- [ ] Banco de dados é criado em AppData/Roaming
- [ ] Localização do banco (Windows):
  ```
  C:\Users\{usuario}\AppData\Roaming\Sistema de Arquivos Hospital\database.db
  ```
- [ ] Dados iniciais (seeds) são carregados na primeira execução
- [ ] Login persiste entre sessões (se "Lembrar de mim" marcado)

---

## 🐛 Problemas Comuns e Soluções

### ❌ Erro: "npm: The term 'npm' is not recognized"
**Causa**: Node.js não está instalado ou não está no PATH.

**Solução**:
1. Instale o Node.js de https://nodejs.org/
2. Reinicie o terminal/VSCode
3. Verifique com `node --version`

---

### ❌ Erro: "Cannot find module 'better-sqlite3'"
**Causa**: Módulo nativo não foi compilado corretamente.

**Solução**:
```bash
npm run rebuild
```

Se o erro persistir:
```bash
npm install --build-from-source better-sqlite3
```

---

### ❌ Erro: "Database is locked"
**Causa**: Múltiplas instâncias da aplicação tentando acessar o banco.

**Solução**:
1. Feche todas as instâncias da aplicação
2. Abra apenas uma instância
3. Se persistir, delete o arquivo de lock:
   ```
   C:\Users\{usuario}\AppData\Roaming\Sistema de Arquivos Hospital\database.db-wal
   C:\Users\{usuario}\AppData\Roaming\Sistema de Arquivos Hospital\database.db-shm
   ```

---

### ⚪ Tela branca ao iniciar
**Causa**: Erro de JavaScript não capturado.

**Solução**:
1. Abra DevTools (`F12`)
2. Vá para a aba Console
3. Verifique erros em vermelho
4. Reporte o erro encontrado

---

### 📋 Menu não aparece
**Causa**: [`menu.js`](src/main/menu.js:1) não está sendo importado.

**Solução**:
1. Verifique se [`main.js`](src/main/main.js:1) importa o menu
2. Verifique linha: `const menu = require('./menu');`
3. Reinicie a aplicação

---

### 🔄 Rebuild falha no Windows
**Causa**: Visual Studio Build Tools não instaladas.

**Solução**:
1. Execute como Administrador:
   ```bash
   npm install --global windows-build-tools
   ```
2. Ou instale manualmente: [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
3. Depois execute: `npm run rebuild`

---

## 📊 Logs Esperados

### Console do Terminal (ao executar `npm run dev`)
```
> arquivo-hospital@1.0.0 dev
> cross-env NODE_ENV=development electron .

🚀 Inicializando Sistema de Arquivos Hospital...
📁 Banco de dados: C:\Users\...\AppData\Roaming\Sistema de Arquivos Hospital\database.db
📊 Banco de dados existente encontrado
🔌 IPC Handlers registrados: 15 handlers
🎨 Menu da aplicação configurado
✅ Aplicação pronta!
```

### Console do DevTools (F12 - aba Console)
```
🚀 Inicializando Sistema de Arquivos Hospital...
📦 window.electronAPI disponível
✅ Sistema pronto!
```

### Logs de IPC (em operações)
```
[IPC] auth:login - Usuário autenticado: admin
[IPC] funcionarios:listar - Retornando 3 funcionários
[IPC] gaveteiros:listar - Retornando 2 gaveteiros
[IPC] solicitacoes:criar - Solicitação criada com sucesso
```

---

## ✅ Critérios de Sucesso

O teste é considerado **bem-sucedido** se:

1. ✅ Aplicação inicia sem erros
2. ✅ Login funciona com credenciais válidas
3. ✅ Todas as views carregam dados do banco
4. ✅ Operações CRUD funcionam (Create, Read, Update, Delete)
5. ✅ Dados persistem após fechar/abrir
6. ✅ Não há erros no console (exceto warnings)
7. ✅ Menu nativo funciona e atalhos respondem
8. ✅ Transições entre views são suaves
9. ✅ Banco de dados é criado e populado corretamente
10. ✅ Retiradas e devoluções funcionam corretamente

---

## 🔧 Estrutura do Projeto

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
├── package.json           # Dependências e scripts
├── electron-builder.json  # Configuração de build
└── README.md              # Documentação principal
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Renderer)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  UI.js   │  │ Auth.js  │  │ Database │  │  App.js  │   │
│  │          │  │          │  │   .js    │  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │             │          │
│       └─────────────┴─────────────┴─────────────┘          │
│                         │                                   │
│              window.electronAPI (IPC)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  Preload.js (contextBridge)                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Backend (Main Process)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Main.js  │  │ Menu.js  │  │  SQLite  │                  │
│  │  (IPC)   │  │          │  │ Database │                  │
│  └────┬─────┘  └──────────┘  └────┬─────┘                  │
│       │                            │                         │
│       └────────────────────────────┘                         │
│              better-sqlite3                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 📝 Próximos Passos

### Após Testes Bem-Sucedidos:

1. **Corrigir bugs encontrados** (se houver)
2. **Ajustar UX** conforme necessário
3. **Executar build** para gerar executável:
   ```bash
   npm run build
   ```
4. **Testar instalador gerado** em:
   ```
   dist/Sistema de Arquivos Hospital-Setup-1.0.0.exe
   ```

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no console
2. Abra DevTools (`F12`) e veja erros
3. Consulte a seção "Problemas Comuns"
4. Verifique se o Node.js está instalado corretamente

---

## 📄 Licença

Projeto desenvolvido para fins de gestão hospitalar.

---

**Última atualização**: 2025-11-15
**Versão do documento**: 1.0.0