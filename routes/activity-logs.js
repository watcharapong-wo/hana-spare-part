const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getActivityLogs } = require('../utils/activity-logger');

// GET /activity-logs - Get activity logs (Admin only)
router.get('/', requireAuth, requireRole('admin'), (req, res) => {
  const { user_id, action, entity_type, limit } = req.query;
  
  getActivityLogs({ user_id, action, entity_type, limit }, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'DB error', error: err.message });
    }
    
    // Parse details JSON
    const logs = rows.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
    
    res.json({
      message: 'Activity logs',
      data: logs
    });
  });
});

// GET /activity-logs/my - Get current user's activity logs
router.get('/my', requireAuth, (req, res) => {
  getActivityLogs({ user_id: req.user.id, limit: 50 }, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'DB error', error: err.message });
    }
    
    const logs = rows.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
    
    res.json({
      message: 'My activity logs',
      data: logs
    });
  });
});

module.exports = router;
