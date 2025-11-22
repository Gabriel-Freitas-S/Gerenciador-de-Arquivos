class ThemeManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'themePreference';
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.preference = this.getStoredPreference();

    this.toggleButton = document.getElementById('themeToggle');

    this.bindEvents();
    this.applyTheme(this.preference);
    this.observeSystemChanges();
  }

  bindEvents() {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        const nextPreference = this.getNextPreference();
        this.setPreference(nextPreference);
      });
    }
  }

  getSystemTheme() {
    return this.mediaQuery.matches ? 'dark' : 'light';
  }

  getNextPreference() {
    const systemTheme = this.getSystemTheme();

    if (this.preference === null) {
      return systemTheme === 'dark' ? 'light' : 'dark';
    }

    if (this.preference === 'light') {
      return systemTheme === 'light' ? 'dark' : null;
    }

    if (this.preference === 'dark') {
      return systemTheme === 'dark' ? 'light' : null;
    }

    return null;
  }

  observeSystemChanges() {
    const listener = () => {
      if (!this.preference) {
        this.applyTheme(null);
      }
    };

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', listener);
    } else if (this.mediaQuery.addListener) {
      this.mediaQuery.addListener(listener);
    }
  }

  getStoredPreference() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return null;
  }

  setPreference(preference) {
    if (preference === 'light' || preference === 'dark') {
      localStorage.setItem(this.storageKey, preference);
    } else {
      localStorage.removeItem(this.storageKey);
      preference = null;
    }
    this.applyTheme(preference);
  }

  applyTheme(preference) {
    this.preference = preference === 'light' || preference === 'dark' ? preference : null;
    const root = document.documentElement;

    if (this.preference) {
      root.setAttribute('data-color-scheme', this.preference);
    } else {
      root.removeAttribute('data-color-scheme');
    }

    this.updateToggleState();
  }

  updateToggleState() {
    if (this.toggleButton) {
      const effectiveTheme = this.preference || this.getSystemTheme();
      const mode = this.preference ? 'manual' : 'system';
      this.toggleButton.dataset.theme = effectiveTheme;
      this.toggleButton.dataset.mode = mode;
      const ariaPressed = this.preference ? String(this.preference === 'dark') : 'mixed';
      this.toggleButton.setAttribute('aria-pressed', ariaPressed);
      const title =
        mode === 'system'
          ? 'Tema seguindo o sistema (clique para forçar claro)'
          : this.preference === 'light'
          ? 'Tema claro aplicado (clique para forçar escuro)'
          : 'Tema escuro aplicado (clique para voltar ao sistema)';
      this.toggleButton.setAttribute('title', title);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});
