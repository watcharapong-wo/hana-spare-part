const db = require('./db');

db.serialize(() => {
  // Create settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating settings table:', err.message);
    } else {
      console.log('✅ Settings table initialized');
    }
  });
});

module.exports = db;
