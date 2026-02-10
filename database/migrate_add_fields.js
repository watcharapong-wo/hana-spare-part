const db = require('./db');

const migrations = [
  `ALTER TABLE spareparts ADD COLUMN category TEXT DEFAULT ''`,
  `ALTER TABLE spareparts ADD COLUMN part_no TEXT DEFAULT ''`,
  `ALTER TABLE spareparts ADD COLUMN min_stock INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE spareparts ADD COLUMN unit TEXT DEFAULT ''`
];

function runMigrations(i = 0) {
  if (i >= migrations.length) {
    console.log('✅ Migration completed: added category, part_no, min_stock, unit');
    db.close();
    return;
  }

  db.run(migrations[i], (err) => {
    // ถ้าคอลัมน์มีอยู่แล้ว SQLite จะ error: duplicate column name
    if (err && !String(err.message).includes('duplicate column name')) {
      console.error('❌ Migration failed:', err.message);
      db.close();
      return;
    }
    runMigrations(i + 1);
  });
}

runMigrations();
