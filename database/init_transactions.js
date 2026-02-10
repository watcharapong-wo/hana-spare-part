const db = require('./db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sparepart_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('ISSUE','RETURN')),
      qty INTEGER NOT NULL CHECK (qty > 0),
      requester TEXT DEFAULT '',
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sparepart_id) REFERENCES spareparts(id)
    )
  `);

  console.log('✅ Database initialized (transactions table ready)');
});

db.close();
