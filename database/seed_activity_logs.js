const db = require('./db');

const logs = [
  {
    user_id: 1,
    username: 'admin',
    action: 'LOGIN',
    entity_type: null,
    entity_id: null,
    details: JSON.stringify({ method: 'POST', path: '/auth/login' }),
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString()
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'CREATE_SPAREPART',
    entity_type: 'sparepart',
    entity_id: 101,
    details: JSON.stringify({ name: 'RAM DDR4', quantity: 10 }),
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString()
  },
  {
    user_id: 2,
    username: 'user1',
    action: 'ISSUE_TRANSACTION',
    entity_type: 'transaction',
    entity_id: 201,
    details: JSON.stringify({ sparepart: 'SSD', qty: 2 }),
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString()
  },
  {
    user_id: 2,
    username: 'user1',
    action: 'RETURN_TRANSACTION',
    entity_type: 'transaction',
    entity_id: 202,
    details: JSON.stringify({ sparepart: 'SSD', qty: 1 }),
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString()
  },
  {
    user_id: 1,
    username: 'admin',
    action: 'DELETE_USER',
    entity_type: 'user',
    entity_id: 3,
    details: JSON.stringify({ username: 'olduser' }),
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString()
  }
];

db.serialize(() => {
  logs.forEach(log => {
    db.run(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [log.user_id, log.username, log.action, log.entity_type, log.entity_id, log.details, log.ip_address, log.created_at],
      (err) => {
        if (err) {
          console.error('❌ Failed to insert log:', err.message);
        }
      }
    );
  });
  console.log('✅ Seeded activity_logs with test data');
  db.close();
});