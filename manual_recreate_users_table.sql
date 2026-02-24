-- 1. สำรองข้อมูล users เดิม
.output users_backup.csv
.headers on
.mode csv
SELECT * FROM users;
.output stdout

-- 2. ลบตาราง users เดิม
DROP TABLE IF EXISTS users;

-- 3. สร้างตาราง users ใหม่ (รองรับ coadmin)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','coadmin','staff','viewer')),
  full_name TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 4. นำเข้าข้อมูล users เดิมกลับ (ถ้าต้องการ)
.mode csv
.import users_backup.csv users
