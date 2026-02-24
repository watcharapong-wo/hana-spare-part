-- Manual SQL for user: run in SQLite3 CLI if migration failed
PRAGMA foreign_keys=off;

CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','coadmin','staff','viewer')),
  full_name TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO users_new (id, username, password_hash, role, full_name, is_active, created_at)
  SELECT id, username, password_hash, role, full_name, is_active, created_at FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

PRAGMA foreign_keys=on;
