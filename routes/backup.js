const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { createBackup } = require('../utils/backup');

// POST /backup - Create database backup (Admin only)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await createBackup();
    res.json({
      message: 'Backup created',
      file: result.fileName
    });
  } catch (err) {
    res.status(500).json({ message: 'Backup failed', error: err.message });
  }
});

module.exports = router;
