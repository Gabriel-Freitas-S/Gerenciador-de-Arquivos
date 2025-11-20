function getMenusForUsuario(db, usuarioId) {
  const userMenus = db.prepare(`
    SELECT m.*
    FROM usuarios_menus um
    INNER JOIN menus m ON um.menu_id = m.id
    WHERE um.usuario_id = ? AND m.ativo = 1
    ORDER BY m.ordem
  `).all(usuarioId);

  if (userMenus.length > 0) {
    return userMenus;
  }

  return db.prepare(`
    SELECT m.*
    FROM menus m
    INNER JOIN perfis_menus pm ON m.id = pm.menu_id
    INNER JOIN usuarios u ON u.perfil_id = pm.perfil_id
    WHERE u.id = ? AND m.ativo = 1
    ORDER BY m.ordem
  `).all(usuarioId);
}

module.exports = { getMenusForUsuario };
