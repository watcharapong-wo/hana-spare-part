// Migration script: add remark column to transactions table if not exists
const db = require('./db');

db.serialize(() => {
  db.run(`ALTER TABLE transactions ADD COLUMN remark TEXT DEFAULT ''`, [], (err) => {
    if (err) {
      if (String(err.message).includes('duplicate column name')) {
        console.log('Column remark already exists.');
      } else {
        console.error('Migration error:', err.message);
      }
    } else {
      console.log('Column remark added to transactions table.');
    }
  });
});

db.close();
