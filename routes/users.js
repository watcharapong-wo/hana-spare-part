const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { ok, fail } = require('../utils/respond');
const { requireAuth, requireRole } = require('../middleware/auth');
const { normalLimit } = require('../middleware/rate-limiter');

// ทุก endpoint ต้องเป็น admin
router.use(normalLimit);
router.use(requireAuth, requireRole('admin'));

// GET /users
router.get('/', (req, res) => {
  const { q, role, is_active } = req.query;

  let sql = `SELECT id, username, role, full_name, is_active, created_at
     FROM users`;
  const where = [];
  const params = [];

  if (q) {
    where.push('(username LIKE ? OR full_name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  if (role) {
    where.push('role = ?');
    params.push(String(role).trim());
  }

  if (is_active !== undefined && is_active !== '') {
    where.push('is_active = ?');
    params.push(Number(is_active) === 1 ? 1 : 0);
  }

  if (where.length) {
    sql += ' WHERE ' + where.join(' AND ');
  }

  sql += ' ORDER BY id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return fail(res, 'DB error', 500, err.message);
    return ok(res, { message: 'Users list', data: rows });
  });
});

// GET /users (ดึงข้อมูลผู้ใช้)
router.get('/user', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.json({ message: 'Users list', data: rows });
  });
});

// POST /users  (สร้างผู้ใช้)
router.post('/', async (req, res) => {
  const { username, password, role, full_name } = req.body;

  if (!username || !password || !role) {
    return fail(res, 'username, password, role are required', 400);
  }

  const u = String(username).trim();
  if (u.length < 3) return fail(res, 'username must be at least 3 characters', 400);

  const r = String(role).trim();
  if (!['admin', 'staff', 'viewer'].includes(r)) {
    return fail(res, 'role must be one of: admin, staff, viewer', 400);
  }

  if (String(password).length < 8) {
    return fail(res, 'password must be at least 8 characters', 400);
  }

  const hash = await bcrypt.hash(String(password), 10);

  db.run(
    `INSERT INTO users (username, password_hash, role, full_name, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [u, hash, r, full_name || ''],
    function (err) {
      if (err) {
        // username ซ้ำ
        if (String(err.message).includes('UNIQUE')) {
          return fail(res, 'username already exists', 409);
        }
        return fail(res, 'DB error', 500, err.message);
      }

      db.get(
        `SELECT id, username, role, full_name, is_active, created_at
         FROM users WHERE id = ?`,
        [this.lastID],
        (err2, row) => {
          if (err2) return fail(res, 'DB error', 500, err2.message);
          return ok(res, { message: 'User created', data: row }, 201);
        }
      );
    }
  );
});

// PATCH /users/:id/status  (เปิด/ปิด)
router.patch('/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const { is_active } = req.body;

  if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid user id', 400);
  if (is_active === undefined) return fail(res, 'is_active is required (0 or 1)', 400);

  const active = Number(is_active) === 1 ? 1 : 0;

  // กันปิดตัวเอง
  if (id === req.user.id && active === 0) {
    return fail(res, 'You cannot disable your own account', 400);
  }

  db.run(
    `UPDATE users SET is_active = ? WHERE id = ?`,
    [active, id],
    function (err) {
      if (err) return fail(res, 'DB error', 500, err.message);
      if (this.changes === 0) return fail(res, 'User not found', 404);

      db.get(
        `SELECT id, username, role, full_name, is_active, created_at
         FROM users WHERE id = ?`,
        [id],
        (err2, row) => {
          if (err2) return fail(res, 'DB error', 500, err2.message);
          return ok(res, { message: 'User status updated', data: row });
        }
      );
    }
  );
});

// PATCH /users/:id/password  (รีเซ็ตรหัส)
router.patch('/:id/password', async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body;

  if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid user id', 400);
  if (!password) return fail(res, 'password is required', 400);
  if (String(password).length < 8) return fail(res, 'password must be at least 8 characters', 400);

  const hash = await bcrypt.hash(String(password), 10);

  db.run(
    `UPDATE users SET password_hash = ? WHERE id = ?`,
    [hash, id],
    function (err) {
      if (err) return fail(res, 'DB error', 500, err.message);
      if (this.changes === 0) return fail(res, 'User not found', 404);

      return ok(res, { message: 'Password updated' });
    }
  );
});
// DELETE /users/:id (ลบผู้ใช้)
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid user id', 400);

  // กันลบตัวเอง
  if (id === req.user.id) {
    return fail(res, 'You cannot delete your own account', 400);
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) return fail(res, 'DB error', 500, err.message);
    if (this.changes === 0) return fail(res, 'User not found', 404);
    return ok(res, { message: 'User deleted' });
  });
});

module.exports = router;
