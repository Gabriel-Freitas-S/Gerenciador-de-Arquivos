# 🏥 Sistema de Gerenciamento de Arquivos Físicos - Hospital

## 📌 Status do Projeto

**Versão Atual**: 0.1.0 (Web Prototype)  
**Próxima Versão**: 1.0.0 (Electron Desktop App)  
**Plataforma Alvo**: Windows 10/11

---

## 🎯 Objetivos da Profissionalização

Este projeto está sendo transformado de uma aplicação web de demonstração em uma aplicação desktop profissional usando Electron, com as seguintes melhorias:

### ✅ Melhorias Planejadas

1. **Persistência de Dados**
   - ❌ Dados em memória (volátil)
   - ✅ Banco SQLite persistente e confiável

2. **Estrutura de Código**
   - ❌ Código monolítico em arquivos únicos
   - ✅ Código modular organizado por responsabilidade

3. **Distribuição**
   - ❌ Requer navegador e servidor web
   - ✅ Executável standalone (.exe) para Windows

4. **Segurança**
   - ❌ Dados expostos no navegador
   - ✅ Isolamento de processos Electron

5. **Experiência do Usuário**
   - ❌ Interface web genérica
   - ✅ App nativo com menu e atalhos

---

## 📁 Estrutura Atual vs Nova

### Atual (v0.1.0)
```
arquivo-hospital/
├── index.html    (374 linhas)
├── app.js        (1839 linhas)
└── style.css     (1734 linhas)
```

### Nova (v1.0.0)
```
arquivo-hospital/
├── src/
│   ├── main/
│   │   ├── main.js           # Backend Electron
│   │   ├── preload.js        # IPC Bridge
│   │   └── menu.js           # Menu da aplicação
│   ├── renderer/
│   │   ├── index.html        # Interface
│   │   ├── css/
│   │   │   └── style.css     # Estilos organizados
│   │   └── js/
│   │       ├── app.js        # App principal (~200 linhas)
│   │       ├── database.js   # Camada de dados (~300 linhas)
│   │       ├── auth.js       # Autenticação (~100 linhas)
│   │       └── ui.js         # UI Manager (~400 linhas)
│   └── db/
│       ├── schema.sql        # Estrutura do banco
│       └── seeds.sql         # Dados iniciais
├── build/
│   └── icon.ico              # Ícone do app
├── dist/                     # Executáveis gerados
├── package.json              # Dependências
├── electron-builder.json     # Configuração de build
└── README.md                 # Documentação
```

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Electron** | ~28.0.0 | Framework desktop multiplataforma |
| **better-sqlite3** | ~9.2.0 | Driver SQLite nativo e rápido |
| **electron-builder** | ~24.9.0 | Empacotador de aplicações |
| **Node.js** | 18+ | Runtime JavaScript |

---

## 📊 Comparação: Web vs Desktop

| Aspecto | Web (Atual) | Desktop (Novo) |
|---------|-------------|----------------|
| **Instalação** | Servidor + Navegador | Executável único |
| **Dados** | Memória (perde ao fechar) | SQLite persistente |
| **Performance** | Limitada pelo navegador | Nativa do SO |
| **Offline** | Não funciona | Funciona 100% |
| **Distribuição** | Manual (copiar arquivos) | Instalador automático |
| **Atualizações** | Manual | Potencial para auto-update |
| **Tamanho** | ~50KB | ~150MB (inclui runtime) |
| **Segurança** | Baixa (código exposto) | Alta (código protegido) |

---

## 🚀 Roadmap de Implementação

### Fase 1: Preparação (✅ Concluído)
- [x] Análise do código existente
- [x] Planejamento da arquitetura
- [x] Criação da documentação técnica
- [x] Definição da estrutura de módulos

### Fase 2: Estrutura Base (Próximo)
- [ ] Criar estrutura de diretórios
- [ ] Configurar package.json com dependências
- [ ] Criar arquivos base do Electron

### Fase 3: Backend (Main Process)
- [ ] Implementar main.js com BrowserWindow
- [ ] Criar preload.js com API segura
- [ ] Configurar SQLite e schema
- [ ] Implementar IPC handlers

### Fase 4: Frontend (Renderer)
- [ ] Modularizar JavaScript em componentes
- [ ] Adaptar UI para usar IPC
- [ ] Integrar com banco de dados
- [ ] Testar funcionalidades

### Fase 5: Build e Distribuição
- [ ] Configurar electron-builder
- [ ] Criar ícones e assets
- [ ] Gerar executável Windows
- [ ] Testar instalação

### Fase 6: Documentação
- [ ] README com instruções
- [ ] Guia do usuário
- [ ] Documentação técnica

---

## 📦 Como Será a Distribuição Final

### Instalador Windows
```
Sistema-de-Arquivos-Hospital-Setup-1.0.0.exe  (~150 MB)
```

**O que inclui:**
- Aplicação Electron empacotada
- Runtime Node.js incorporado
- SQLite nativo compilado
- Ícones e recursos visuais
- Atalhos para Desktop e Menu Iniciar

**Processo de Instalação:**
1. Usuário baixa o instalador
2. Executa o .exe
3. Escolhe pasta de instalação
4. Instalador cria atalhos
5. Aplicação pronta para uso

**Primeira Execução:**
1. App cria banco de dados SQLite vazio
2. Executa schema.sql (cria tabelas)
3. Executa seeds.sql (dados de exemplo)
4. Tela de login aparece
5. Usuário pode entrar com credenciais padrão

---

## 🔐 Credenciais Padrão

Após instalação, use estas credenciais:

**Administrador:**
- Usuário: `admin`
- Senha: `admin123`
- Acesso total ao sistema

**Operador:**
- Usuário: `operador`
- Senha: `senha123`
- Acesso limitado (sem administração)

---

## 💾 Localização dos Dados

O banco de dados SQLite será criado em:

```
Windows: C:\Users\{SEU_USUARIO}\AppData\Roaming\Sistema de Arquivos Hospital\database.db
```

**Backup Manual:**
1. Copie o arquivo `database.db`
2. Guarde em local seguro
3. Para restaurar, substitua o arquivo

---

## 📋 Funcionalidades do Sistema

### Para Todos os Usuários
- ✅ Login seguro
- ✅ Dashboard com estatísticas
- ✅ Visualizar gavetas e pastas
- ✅ Solicitar retirada de arquivos
- ✅ Ver meus arquivos em poder
- ✅ Registrar movimentações
- ✅ Gerar relatórios

### Apenas para Administradores
- ✅ Aprovar/rejeitar solicitações
- ✅ Criar gaveteiros e gavetas
- ✅ Cadastrar funcionários
- ✅ Gerenciar usuários do sistema
- ✅ Acessar logs de auditoria
- ✅ Visualizar alertas críticos

---

## 🎨 Design System

O sistema usa um design system moderno baseado no Perplexity UI:
- **Cores**: Paleta teal/cream com suporte a dark mode
- **Tipografia**: FK Grotesk Neue, fallback para system fonts
- **Componentes**: Botões, cards, modais, tabelas consistentes
- **Responsivo**: Adapta-se a diferentes tamanhos de janela

---

## 🔄 Próximos Passos

### Para Começar a Implementação:

1. **Revise os Documentos**
   - 📄 `PLANO_PROFISSIONALIZACAO.md` - Plano técnico completo
   - 🏛️ `ARQUITETURA.md` - Diagramas e arquitetura
   - 📖 `README_PROJETO.md` - Este documento

2. **Aprove o Plano**
   - Se estiver de acordo, confirme para iniciar
   - Sugestões e ajustes são bem-vindos

3. **Mudar para Modo Code**
   - O Architect criará uma task para o Code mode
   - O Code mode implementará tudo conforme planejado

4. **Acompanhar Progresso**
   - Todo list será atualizado a cada etapa
   - Você pode testar a cada milestone

---

## 📞 Perguntas Frequentes

### P: Perco os dados atuais?
**R:** Como os dados estão em memória, não há dados para perder. O novo sistema criará um banco limpo com dados de exemplo.

### P: Funciona sem internet?
**R:** Sim! 100% offline. Tudo é local na máquina.

### P: Posso usar em vários PCs?
**R:** Sim, mas cada PC terá seu próprio banco de dados. Para sincronização entre PCs, seria necessária uma versão futura com servidor central.

### P: Quanto tempo leva a implementação?
**R:** Estimativa de 4-6 horas de desenvolvimento focado, dividido em:
- 1h: Estrutura e configuração
- 2h: Backend Electron + SQLite
- 2h: Modularização do frontend
- 1h: Testes e build

### P: Posso customizar depois?
**R:** Sim! A estrutura modular facilita adicionar novas funcionalidades, ajustar UI, etc.

---

## ✅ Checklist de Aprovação

Antes de iniciar a implementação, confirme:

- [ ] Entendi a nova estrutura de diretórios
- [ ] Concordo com as tecnologias escolhidas (Electron + SQLite)
- [ ] Estou ciente do tamanho do executável (~150MB)
- [ ] Revisarei o plano técnico (`PLANO_PROFISSIONALIZACAO.md`)
- [ ] Pronto para mudar para o modo Code e implementar

---

## 🎯 Resultado Final Esperado

Ao final da implementação, você terá:

1. ✅ Executável Windows funcional (`.exe`)
2. ✅ Instalador profissional com atalhos
3. ✅ Banco de dados SQLite persistente
4. ✅ Código organizado e modular
5. ✅ Documentação completa
6. ✅ Aplicação pronta para distribuir

**Qualidade**: Aplicação nível produção, pronta para uso real em hospital.

---

## 📞 Próxima Ação

**Está satisfeito com o plano?**

👉 Se **SIM**: Responda "Aprovar e começar implementação" e eu criarei a task para o modo Code.

👉 Se **NÃO**: Me diga o que gostaria de ajustar ou esclarecer.

---

*Documentação criada em: 15 de Novembro de 2025*  
*Modo: Architect (Planejamento)*  
*Status: Aguardando aprovação para implementação*