// migrate_users_add_coadmin.js
// สคริปต์นี้จะ migrate ตาราง users ให้รองรับ role 'coadmin' ใน CHECK constraint

const db = require('./database/db');

db.serialize(() => {
  // 1. สร้างตารางใหม่ที่มี CHECK ใหม่
  db.run(`CREATE TABLE IF NOT EXISTS users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','coadmin','staff','viewer')),
    full_name TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // 2. คัดลอกข้อมูลเดิม
  db.run(`INSERT INTO users_new (id, username, password_hash, role, full_name, is_active, created_at)
    SELECT id, username, password_hash, role, full_name, is_active, created_at FROM users`);

  // 3. ลบตารางเดิม
  db.run(`DROP TABLE users`);

  // 4. เปลี่ยนชื่อ users_new เป็น users
  db.run(`ALTER TABLE users_new RENAME TO users`);

  console.log('✅ Migrated users table to support coadmin role');
});

db.close();
