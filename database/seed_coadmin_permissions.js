const db = require('./db');

// ตัวอย่าง default permissions สำหรับ coadmin
const defaultPermissions = [
  { user_id: 2, menu: 'dashboard', can_view: 1, can_edit: 1 },
  { user_id: 2, menu: 'spareparts', can_view: 1, can_edit: 1 },
  { user_id: 2, menu: 'transactions', can_view: 1, can_edit: 1 },
  { user_id: 2, menu: 'users', can_view: 1, can_edit: 0 },
];

defaultPermissions.forEach(perm => {
  const result = db.run(
    'INSERT OR IGNORE INTO user_permissions (user_id, menu, can_view, can_edit) VALUES (?, ?, ?, ?)',
    [perm.user_id, perm.menu, perm.can_view, perm.can_edit]
  );
  console.log(`Inserted permission for user_id=${perm.user_id}, menu=${perm.menu}, result:`, result);
});

console.log('Seeded default permissions for coadmin (user_id=2)');
