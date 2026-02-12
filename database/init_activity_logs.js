const db = require('./db');

// Create activity_logs table
db.run(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

console.log('✅ Activity logs table ready');

db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id)');
db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at)');
db.close();
