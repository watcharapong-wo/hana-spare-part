const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ok, fail } = require('../utils/respond');
const { requireAuth } = require('../middleware/auth');
const { logActivity } = require('../utils/activity-logger');
const { loginLimit } = require('../middleware/rate-limiter');

// POST /auth/login
router.post('/login', loginLimit, (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) return fail(res, 'username and password are required', 400);

    db.get(
      `SELECT id, username, password_hash, role, is_active, full_name
       FROM users WHERE username = ?`,
      [String(username).trim()],
      async (err, user) => {
        try {
          if (err) return fail(res, 'DB error', 500, err.message);
          if (!user) return fail(res, 'Invalid credentials', 401);
          if (user.is_active !== 1) return fail(res, 'User inactive', 403);

          const match = await bcrypt.compare(password, user.password_hash);
          if (!match) return fail(res, 'Invalid credentials', 401);

          const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
          );

          // Log successful login
          logActivity({
            user_id: user.id,
            username: user.username,
            action: 'LOGIN',
            ip_address: req.ip || req.connection.remoteAddress
          });

          return ok(res, {
            message: 'Login success',
            token,
            user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name }
          });
        } catch (cbErr) {
          console.error('❌ Callback error:', cbErr.message);
          return fail(res, 'Internal error', 500, cbErr.message);
        }
      }
    );
  } catch (e) {
    console.error('❌ Route error:', e.message);
    return fail(res, 'Internal error', 500, e.message);
  }
});

// GET /auth/me (ต้องแนบ Bearer token)
router.get('/me', requireAuth, (req, res) => {
  db.get(
    `SELECT id, username, role, full_name, is_active, created_at
     FROM users
     WHERE id = ?`,
    [req.user.id],
    (err, user) => {
      if (err) return fail(res, 'DB error', 500, err.message);
      if (!user) return fail(res, 'User not found', 404);
      if (user.is_active !== 1) return fail(res, 'User inactive', 403);
      return ok(res, { message: 'Me', user });
    }
  );
});

module.exports = router;
