const db = require('../database/db');

/**
 * Log user activity
 * @param {Object} params - Activity parameters
 * @param {number} params.user_id - User ID
 * @param {string} params.username - Username
 * @param {string} params.action - Action performed (e.g., 'LOGIN', 'CREATE_SPAREPART', 'UPDATE_SPAREPART', 'DELETE_SPAREPART', 'ISSUE_TRANSACTION', 'RETURN_TRANSACTION')
 * @param {string} params.entity_type - Type of entity (e.g., 'sparepart', 'transaction', 'user')
 * @param {number} params.entity_id - ID of the entity
 * @param {Object} params.details - Additional details (will be stringified)
 * @param {string} params.ip_address - IP address of the request
 */
function logActivity({ user_id, username, action, entity_type, entity_id, details, ip_address }) {
  const detailsStr = details ? JSON.stringify(details) : null;
  
  db.run(
    `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id || null, username || null, action, entity_type || null, entity_id || null, detailsStr, ip_address || null],
    (err) => {
      if (err) {
        console.error('⚠️ Activity log failed:', err.message);
      }
    }
  );
}

/**
 * Get activity logs with filters
 * @param {Object} filters - Filter parameters
 * @param {number} filters.user_id - Filter by user ID
 * @param {string} filters.action - Filter by action
 * @param {string} filters.entity_type - Filter by entity type
 * @param {number} filters.limit - Limit results (default: 100, max: 500)
 * @param {Function} callback - Callback function
 */
function getActivityLogs(filters, callback) {
  const { user_id, action, entity_type, limit = 100 } = filters;
  
  let sql = `
    SELECT * FROM activity_logs
    WHERE 1=1
  `;
  const params = [];
  
  if (user_id) {
    sql += ' AND user_id = ?';
    params.push(user_id);
  }
  
  if (action) {
    sql += ' AND action = ?';
    params.push(action);
  }
  
  if (entity_type) {
    sql += ' AND entity_type = ?';
    params.push(entity_type);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Math.min(Number(limit), 500));
  
  db.all(sql, params, callback);
}

/**
 * Middleware to log activity automatically
 */
function activityLogger(action, entity_type = null) {
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to log after successful response
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entity_id = data.id || data.data?.id || req.params.id || null;
        
        logActivity({
          user_id: req.user?.id,
          username: req.user?.username,
          action,
          entity_type,
          entity_id,
          details: {
            method: req.method,
            path: req.path,
            body: req.body
          },
          ip_address: req.ip || req.connection.remoteAddress
        });
      }
      
      return originalJson(data);
    };
    
    next();
  };
}

module.exports = {
  logActivity,
  getActivityLogs,
  activityLogger
};
