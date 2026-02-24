// routes/user_permissions.js
// API สำหรับ admin จัดการสิทธิ์เมนูหลักของแต่ละ user
const express = require('express');
const db = require('../database/db');
const router = express.Router();

// GET: ดึงสิทธิ์เมนูของ user ตาม user_id (mock fallback)
const DEFAULT = (role = 'staff') => ([
  { menu_key: "dashboard", allowed: true },
  { menu_key: "spareparts", allowed: true },
  { menu_key: "transactions", allowed: true },
  { menu_key: "reports", allowed: true },
  { menu_key: "users", allowed: role === 'admin' },
  { menu_key: "settings", allowed: role === 'admin' },
  { menu_key: "activity", allowed: true },
]);

router.get('/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  let rows = [];
  try {
    rows = db.all('SELECT menu_key, allowed FROM user_permissions WHERE user_id = ?', [user_id]);
  } catch (err) {
    rows = [];
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    // fallback mock
    const role = String(req.query.role || 'staff').toLowerCase();
    return res.json({ user_id, permissions: DEFAULT(role) });
  }
  return res.json({ user_id, permissions: rows });
});

// POST: กำหนดสิทธิ์เมนูของ user (admin เท่านั้น)
// body: { permissions: [{ menu_key, allowed }] }
router.post('/:user_id', (req, res) => {
  console.log('--- POST /user-permissions/:user_id ---');
  const user_id = req.params.user_id;
  console.log('user_id:', user_id);
  console.log('req.body:', req.body);
  if (typeof req.body === 'undefined') {
    console.error('req.body is undefined!');
    return res.status(400).json({ message: 'req.body is undefined' });
  }
  try {
    const { permissions } = req.body;
    console.log('permissions:', permissions);
    if (!Array.isArray(permissions)) {
      console.error('permissions is not array:', permissions);
      return res.status(400).json({ message: 'Invalid permissions', debug: { permissions } });
    }
    db.run('DELETE FROM user_permissions WHERE user_id = ?', [user_id]);
    for (const perm of permissions) {
      console.log('Insert perm:', perm);
      db.run('INSERT INTO user_permissions (user_id, menu_key, allowed) VALUES (?, ?, ?)', [user_id, perm.menu_key, perm.allowed ? 1 : 0]);
    }
    const rows = db.all('SELECT menu_key, allowed FROM user_permissions WHERE user_id = ?', [user_id]);
    console.log('Permissions after update:', rows);
    res.json({ user_id, permissions: rows });
    console.log('--- END POST /user-permissions/:user_id ---');
  } catch (err) {
    console.error('user_permissions POST error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message, stack: err.stack });
  }
});

module.exports = router;
