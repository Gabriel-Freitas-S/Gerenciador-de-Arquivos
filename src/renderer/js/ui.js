// ... restante do código ...
    for (const user of usuarios) {
      const statusClass = user.ativo ? 'status--success' : 'status--error';
      const statusTexto = user.ativo ? 'Ativo' : 'Inativo';

      html += `
        <tr>
          <td><strong>${user.username}</strong></td>
          <td>${user.perfil_nome || user.perfil || 'N/A'}</td>
          <td><span class="status ${statusClass}">${statusTexto}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn--outline btn-sm" onclick="app.editarUsuario(${user.id})">Editar</button>
              <button class="btn btn--outline btn-sm" onclick="app.toggleUsuarioStatus(${user.id})">
                ${user.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }
// ... restante do código ...