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
        // Corrige para aceitar tanto .perfil_nome quanto .perfil vindo do backend
        this.currentUser = {
          id: result.user.id,
          username: result.user.username,
          perfil: result.user.perfil_nome || result.user.perfil, // Suporta ambos!
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
  logout() {
    this.currentUser = null;
  }
  getCurrentUser() {
    return this.currentUser;
  }
  isAuthenticated() {
    return this.currentUser !== null;
  }
  hasPermission(requiredRole) {
    if (!this.currentUser) {
      return false;
    }
    if (this.currentUser.perfil === 'Administrador') {
      return true;
    }
    return this.currentUser.perfil === requiredRole;
  }
  isAdmin() {
    return this.currentUser && this.currentUser.perfil === 'Administrador';
  }
  isOperacional() {
    return this.currentUser && this.currentUser.perfil === 'Usuário Operacional';
  }
  getUserId() {
    return this.currentUser ? this.currentUser.id : null;
  }
  getUsername() {
    return this.currentUser ? this.currentUser.username : null;
  }
  getUserProfile() {
    return this.currentUser ? this.currentUser.perfil : null;
  }
}
