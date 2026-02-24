// add_coadmin_user.js
// สร้าง user ตัวอย่างที่มี role เป็น coadmin
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new Database(dbPath);

const username = 'coadmin1';
const password = 'coadmin123';
const hash = bcrypt.hashSync(password, 10);
const full_name = 'Example Co-Admin';
const is_active = 1;
const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

try {
  db.prepare(`INSERT INTO users (username, password_hash, role, full_name, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(username, hash, 'coadmin', full_name, is_active, created_at);
  console.log('✅ Created coadmin user:', username, '/', password);
} catch (e) {
  console.error('❌ Error creating coadmin user:', e.message);
}
db.close();
