# Sistema de Perfis de Acesso

## Visão Geral

O sistema agora utiliza **perfis de acesso** ao invés de permissões individuais por usuário. Isso facilita o gerenciamento e padronização das permissões.

## Estrutura do Banco de Dados

### Tabela: perfis
Armazena os perfis de acesso disponíveis no sistema.

**Campos:**
- `id`: Identificador único
- `nome`: Nome do perfil (ex: "Administrador", "Operador")
- `descricao`: Descrição detalhada do perfil
- `ativo`: Se o perfil está ativo (0 ou 1)
- `created_at`: Data de criação

### Tabela: menus
Define todos os menus/funcionalidades disponíveis no sistema.

**Campos:**
- `id`: Identificador único
- `nome`: Nome do menu (ex: "Dashboard", "Funcionários")
- `descricao`: Descrição da funcionalidade
- `icone`: Nome do ícone para exibição na UI
- `rota`: Identificador da rota/tela
- `ordem`: Ordem de exibição no menu
- `ativo`: Se o menu está ativo (0 ou 1)
- `created_at`: Data de criação

### Tabela: perfis_menus
Relacionamento N:N entre perfis e menus (quais menus cada perfil pode acessar).

**Campos:**
- `id`: Identificador único
- `perfil_id`: ID do perfil
- `menu_id`: ID do menu
- `created_at`: Data de criação

### Tabela: usuarios (Atualizada)
Usuários agora são vinculados a um perfil ao invés de ter um campo de texto.

**Mudança importante:**
- **ANTES:** `perfil TEXT` (ex: "Administrador")
- **DEPOIS:** `perfil_id INTEGER` (referência à tabela perfis)

## Perfis Padrão

### 1. Administrador
**Acesso:** Total ao sistema
**Menus:**
- Dashboard
- Funcionários
- Gaveteiros
- Gavetas
- Pastas
- Solicitações
- Retiradas
- Alertas
- Movimentações
- Relatórios
- Usuários
- Perfis
- Logs
- Configurações

### 2. Operador Completo
**Acesso:** Todas as funcionalidades operacionais
**Menus:**
- Dashboard
- Funcionários
- Gaveteiros
- Gavetas
- Pastas
- Solicitações
- Retiradas
- Alertas
- Movimentações
- Relatórios

### 3. Operador Consulta
**Acesso:** Apenas visualização
**Menus:**
- Dashboard
- Funcionários (visualização)
- Gavetas (visualização)
- Pastas (visualização)
- Retiradas (visualização)
- Relatórios

### 4. Arquivista
**Acesso:** Foco em gerenciamento de arquivo físico
**Menus:**
- Dashboard
- Funcionários
- Gaveteiros
- Gavetas
- Pastas
- Movimentações
- Relatórios

## Handlers IPC Disponíveis

### Gerenciamento de Perfis

#### `perfis:listar`
Lista todos os perfis ativos.
```javascript
const result = await window.api.invoke('perfis:listar');
// result.data = [{ id, nome, descricao, ativo, created_at }, ...]
```

#### `perfis:buscar`
Busca um perfil específico com seus menus.
```javascript
const result = await window.api.invoke('perfis:buscar', perfilId);
// result.data = { id, nome, descricao, ativo, menus: [...] }
```

#### `perfis:criar`
Cria um novo perfil.
```javascript
const result = await window.api.invoke('perfis:criar', nome, descricao, menuIds);
// menuIds = [1, 2, 3, 5, 7]
```

#### `perfis:atualizar`
Atualiza um perfil existente.
```javascript
const result = await window.api.invoke('perfis:atualizar', perfilId, nome, descricao, menuIds);
```

#### `perfis:excluir`
Exclui um perfil (apenas se não houver usuários usando).
```javascript
const result = await window.api.invoke('perfis:excluir', perfilId);
```

### Menus

#### `menus:listar`
Lista todos os menus disponíveis.
```javascript
const result = await window.api.invoke('menus:listar');
```

#### `usuarios:menus`
Busca os menus de um usuário (através do seu perfil).
```javascript
const result = await window.api.invoke('usuarios:menus', usuarioId);
```

#### `usuarios:perfil-completo`
Busca informações completas do usuário incluindo perfil e menus.
```javascript
const result = await window.api.invoke('usuarios:perfil-completo', usuarioId);
// result.data = { 
//   ...usuarioData, 
//   perfil_nome, 
//   perfil_descricao, 
//   menus: [...] 
// }
```

## Como Criar um Usuário

### Antes (Sistema Antigo)
```javascript
// Usuário precisava especificar perfil como texto
INSERT INTO usuarios (username, senha, perfil) VALUES 
('joao', 'senha123', 'Administrador');
```

### Agora (Sistema Novo)
```javascript
// 1. Listar perfis disponíveis
const perfis = await window.api.invoke('perfis:listar');

// 2. Usuário seleciona um perfil da lista
// Ex: perfil_id = 1 (Administrador)

// 3. Criar usuário vinculado ao perfil
await window.api.invoke('db:execute', 
  'INSERT INTO usuarios (username, senha, perfil_id) VALUES (?, ?, ?)',
  ['joao', 'senha123', 1]
);
```

## Vantagens do Novo Sistema

1. **Centralização:** Permissões gerenciadas em um só lugar
2. **Flexibilidade:** Fácil criar novos perfis personalizados
3. **Manutenção:** Alterar um perfil atualiza todos os usuários
4. **Auditoria:** Histórico claro de quais perfis existem
5. **Escalabilidade:** Suporta quantos perfis forem necessários
6. **Consistência:** Garante que usuários do mesmo perfil tenham mesmas permissões

## Interface de Criação de Usuário

A interface deve:

1. Exibir um **dropdown/select** com os perfis disponíveis
2. Mostrar a **descrição** do perfil selecionado
3. Opcionalmente, mostrar os **menus** que o perfil tem acesso
4. Salvar o `perfil_id` ao criar o usuário

### Exemplo de HTML
```html
<form id="formNovoUsuario">
  <input type="text" name="username" placeholder="Nome de usuário" required>
  <input type="password" name="senha" placeholder="Senha" required>
  
  <select name="perfil_id" id="selectPerfil" required>
    <option value="">Selecione um perfil</option>
    <!-- Opções carregadas dinamicamente -->
  </select>
  
  <div id="perfilDescricao" class="info-box">
    <!-- Descrição do perfil selecionado -->
  </div>
  
  <button type="submit">Criar Usuário</button>
</form>
```

### Exemplo de JavaScript
```javascript
// Carregar perfis no select
async function carregarPerfis() {
  const result = await window.api.invoke('perfis:listar');
  
  if (result.success) {
    const select = document.getElementById('selectPerfil');
    
    result.data.forEach(perfil => {
      const option = document.createElement('option');
      option.value = perfil.id;
      option.textContent = perfil.nome;
      option.dataset.descricao = perfil.descricao;
      select.appendChild(option);
    });
  }
}

// Mostrar descrição ao selecionar perfil
document.getElementById('selectPerfil').addEventListener('change', (e) => {
  const option = e.target.selectedOptions[0];
  const descricao = option.dataset.descricao;
  document.getElementById('perfilDescricao').textContent = descricao;
});

// Criar usuário
document.getElementById('formNovoUsuario').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const username = formData.get('username');
  const senha = formData.get('senha');
  const perfil_id = parseInt(formData.get('perfil_id'));
  
  const result = await window.api.invoke('db:execute',
    'INSERT INTO usuarios (username, senha, perfil_id, ativo) VALUES (?, ?, ?, 1)',
    [username, senha, perfil_id]
  );
  
  if (result.success) {
    alert('Usuário criado com sucesso!');
  }
});
```

## Migração de Dados

Se você tem usuários no sistema antigo, precisará migrar:

```sql
-- 1. Criar mapeamento de perfis antigos para novos
-- Administrador (texto) -> perfil_id = 1
-- Usuário Operacional (texto) -> perfil_id = 2

-- 2. Atualizar usuários existentes
UPDATE usuarios SET perfil_id = 1 WHERE perfil = 'Administrador';
UPDATE usuarios SET perfil_id = 2 WHERE perfil = 'Usuário Operacional';

-- 3. Remover coluna antiga (opcional)
-- ALTER TABLE usuarios DROP COLUMN perfil;
```

## Arquivos Relacionados

- **Schema:** `src/db/schema_perfis.sql`
- **Seeds:** `src/db/seeds_perfis.sql`
- **Handlers:** `src/main/main.js` (linhas 318-450)
- **Documentação:** `SISTEMA_PERFIS.md` (este arquivo)