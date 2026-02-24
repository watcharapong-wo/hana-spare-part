-- 1. ลบตาราง users เดิม (ถ้ามี)
DROP TABLE IF EXISTS users;

-- 2. สร้างตาราง users ใหม่ (รองรับ coadmin)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','coadmin','staff','viewer')),
  full_name TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. import ข้อมูล users เดิมกลับ (จากไฟล์ users_backup.csv)
.mode csv
.import users_backup.csv users
