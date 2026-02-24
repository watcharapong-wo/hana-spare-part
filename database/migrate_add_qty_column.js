// Migration script: add qty column to transactions table if not exists
const db = require('./db');

db.serialize(() => {
  db.run(`ALTER TABLE transactions ADD COLUMN qty INTEGER NOT NULL DEFAULT 1`, (err) => {
    if (err) {
      if (String(err.message).includes('duplicate column name')) {
        console.log('Column qty already exists.');
      } else {
        console.error('Migration error:', err.message);
      }
    } else {
      console.log('Column qty added to transactions table.');
    }
  });
});

db.close();
