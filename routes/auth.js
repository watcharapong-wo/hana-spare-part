

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database/db');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT_SECRET not set' });
  }

  db.get(
    `SELECT id, username, password_hash, role, is_active, full_name
     FROM users
     WHERE username = ?`,
    [String(username).trim()],
    async (err, user) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      if (Number(user.is_active) !== 1) return res.status(403).json({ message: 'Account disabled' });

      const ok = await bcrypt.compare(String(password), user.password_hash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        token,
        user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name }
      });
    }
  );
});

module.exports = router;
