const db = require('./db');

const stmts = [
  `ALTER TABLE spareparts ADD COLUMN created_by INTEGER`,
  `ALTER TABLE spareparts ADD COLUMN updated_by INTEGER`
];

function run(i = 0) {
  if (i >= stmts.length) {
    console.log('✅ Migration ok: spareparts.created_by & spareparts.updated_by ready');
    db.close();
    return;
  }

  db.run(stmts[i], (err) => {
    if (err && !String(err.message).includes('duplicate column name')) {
      console.error('❌ Migration failed:', err.message);
      db.close();
      return;
    }
    run(i + 1);
  });
}

run();
