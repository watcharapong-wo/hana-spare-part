// สคริปต์สร้างตาราง user_permissions สำหรับกำหนดสิทธิ์เมนูหลักของแต่ละ user
const db = require('./db');

db.run(`
CREATE TABLE IF NOT EXISTS user_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  menu_key TEXT NOT NULL,
  allowed INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, menu_key),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)
`, [], (err) => {
  if (err) {
    console.error('❌ Failed to create user_permissions:', err.message);
  } else {
    console.log('✅ user_permissions table created or already exists');
  }
  db.close();
});
