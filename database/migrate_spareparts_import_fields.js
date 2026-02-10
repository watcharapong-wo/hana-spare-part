const db = require('./db');

const stmts = [
  `ALTER TABLE spareparts ADD COLUMN model TEXT`,
  `ALTER TABLE spareparts ADD COLUMN spec TEXT`,
  `ALTER TABLE spareparts ADD COLUMN target_stock INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE spareparts ADD COLUMN external_key TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_spareparts_external_key ON spareparts(external_key)`
];

function run(i = 0) {
  if (i >= stmts.length) {
    console.log('✅ Migration ok: import fields ready');
    db.close();
    return;
  }
  db.run(stmts[i], (err) => {
    if (err && !String(err.message).includes('duplicate') && !String(err.message).includes('already exists')) {
      console.error('❌ Migration failed:', err.message);
      db.close();
      return;
    }
    run(i + 1);
  });
}

run();
