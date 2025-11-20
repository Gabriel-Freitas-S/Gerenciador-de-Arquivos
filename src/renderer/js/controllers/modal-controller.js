(function(global) {
  class ModalController {
    constructor() {
      this.modal = document.getElementById('modal');
      this.title = document.getElementById('modalTitle');
      this.body = document.getElementById('modalBody');
      this.footer = document.getElementById('modalFooter');
    }

    open(title, bodyContent, footerContent = '') {
      this.title.textContent = title;
      this.body.innerHTML = bodyContent;
      this.footer.innerHTML = footerContent || `
        <button class="btn btn--outline" onclick="app.ui.closeModal()">Cancelar</button>
      `;
      this.modal.classList.add('show');
    }

    close() {
      this.modal.classList.remove('show');
    }
  }

  global.ModalController = ModalController;
})(window);
