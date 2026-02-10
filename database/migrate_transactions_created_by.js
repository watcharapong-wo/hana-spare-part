const db = require('./db');

db.run(`ALTER TABLE transactions ADD COLUMN created_by INTEGER`, (err) => {
  if (err && !String(err.message).includes('duplicate column name')) {
    console.error('❌ Migration failed:', err.message);
  } else {
    console.log('✅ Migration ok: transactions.created_by ready');
  }
  db.close();
});
