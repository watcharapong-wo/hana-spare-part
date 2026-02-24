// Drop and recreate transactions table with qty column
const db = require('./db');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS transactions', [], (err) => {
    if (err) {
      console.error('Drop error:', err.message);
      db.close();
      return;
    }
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sparepart_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('ISSUE','RETURN')),
        qty INTEGER NOT NULL CHECK (qty > 0),
        requester TEXT DEFAULT '',
        note TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        created_by INTEGER,
        FOREIGN KEY (sparepart_id) REFERENCES spareparts(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `, [], (err2) => {
      if (err2) {
        console.error('Create error:', err2.message);
      } else {
        console.log('Recreated transactions table with qty column.');
      }
      db.close();
    });
  });
});
