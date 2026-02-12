const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// POST /auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  const isAdmin = username === 'admin' && password === 'admin123';
  const isStaff = username === 'staff' && password === 'staff123';

  if (!isAdmin && !isStaff) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const role = isAdmin ? 'admin' : 'staff';

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT_SECRET not set' });
  }

  const token = jwt.sign({ username, role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token, user: { username, role } });
});

module.exports = router;
