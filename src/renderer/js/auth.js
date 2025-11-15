// ============================================
// AUTH LAYER - Autenticação e Permissões
// ============================================

/**
 * Gerencia autenticação de usuários e controle de permissões
 * Responsável por login, logout e verificação de acesso
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
  }

  /**
   * Realiza login do usuário
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha
   * @returns {Promise<boolean>} - true se login bem-sucedido
   */
  async handleLogin(username, password) {
    try {
      // Validação básica
      if (!username || !password) {
        return false;
      }

      // Chamar API do Electron para autenticar
      const result = await window.electronAPI.login(username, password);
      
      if (result.success && result.user) {
        this.currentUser = {
          id: result.user.id,
          username: result.user.username,
          perfil: result.user.perfil,
          funcionario_id: result.user.funcionario_id
        };
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  }

  /**
   * Realiza logout do usuário
   */
  logout() {
    this.currentUser = null;
  }

  /**
   * Retorna o usuário atual
   * @returns {Object|null} - Dados do usuário logado
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verifica se há um usuário logado
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Verifica se o usuário atual tem uma permissão específica
   * @param {string} requiredRole - Perfil necessário ('Administrador' ou 'Usuário Operacional')
   * @returns {boolean}
   */
  hasPermission(requiredRole) {
    if (!this.currentUser) {
      return false;
    }

    // Administrador tem acesso total
    if (this.currentUser.perfil === 'Administrador') {
      return true;
    }

    // Verifica se o perfil do usuário corresponde ao requerido
    return this.currentUser.perfil === requiredRole;
  }

  /**
   * Verifica se o usuário atual é administrador
   * @returns {boolean}
   */
  isAdmin() {
    return this.currentUser && this.currentUser.perfil === 'Administrador';
  }

  /**
   * Verifica se o usuário atual é operacional
   * @returns {boolean}
   */
  isOperacional() {
    return this.currentUser && this.currentUser.perfil === 'Usuário Operacional';
  }

  /**
   * Obtém o ID do usuário atual
   * @returns {number|null}
   */
  getUserId() {
    return this.currentUser ? this.currentUser.id : null;
  }

  /**
   * Obtém o username do usuário atual
   * @returns {string|null}
   */
  getUsername() {
    return this.currentUser ? this.currentUser.username : null;
  }

  /**
   * Obtém o perfil do usuário atual
   * @returns {string|null}
   */
  getUserProfile() {
    return this.currentUser ? this.currentUser.perfil : null;
  }
}