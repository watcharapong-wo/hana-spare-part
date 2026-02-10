const db = require('./db');
const bcrypt = require('bcryptjs');

db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      is_active INTEGER DEFAULT 1,
      full_name TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Insert default users if not exists
  const hashedAdmin = bcrypt.hashSync('admin123', 10);
  const hashedStaff = bcrypt.hashSync('staff123', 10);
  const hashedViewer = bcrypt.hashSync('viewer123', 10);

  db.run(`INSERT OR IGNORE INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)`, 
    ['admin', hashedAdmin, 'admin', 'Administrator']);
  db.run(`INSERT OR IGNORE INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)`, 
    ['staff', hashedStaff, 'staff', 'Staff User']);
  db.run(`INSERT OR IGNORE INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)`, 
    ['viewer', hashedViewer, 'viewer', 'Viewer User']);

  // Create spareparts table
  db.run(`
    CREATE TABLE IF NOT EXISTS spareparts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      location TEXT DEFAULT '',
      min_stock INTEGER DEFAULT 5,
      created_by TEXT DEFAULT 'system',
      updated_by TEXT DEFAULT 'system',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sparepart_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      created_by TEXT DEFAULT 'system',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(sparepart_id) REFERENCES spareparts(id)
    )
  `);

  // Insert sample data
  db.run(`INSERT OR IGNORE INTO spareparts (name, quantity, location, min_stock, created_by) VALUES (?, ?, ?, ?, ?)`,
    ['Hard Drive 1TB', 15, 'Rack A', 5, 'admin']);
  db.run(`INSERT OR IGNORE INTO spareparts (name, quantity, location, min_stock, created_by) VALUES (?, ?, ?, ?, ?)`,
    ['RAM 16GB', 8, 'Rack B', 3, 'admin']);
  db.run(`INSERT OR IGNORE INTO spareparts (name, quantity, location, min_stock, created_by) VALUES (?, ?, ?, ?, ?)`,
    ['SSD 512GB', 2, 'Rack A', 5, 'admin']);

  console.log('✅ Database initialized (users, spareparts, transactions tables ready)');
  
  // Close after serialize completes
  db.close();
});
