const db = require('./db');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

(async () => {
  try {
    // 1) ตรวจ part_no ซ้ำ (กัน UNIQUE ล้ม)
    const dup = await all(`
      SELECT part_no, COUNT(*) c
      FROM spareparts
      WHERE part_no IS NOT NULL AND TRIM(part_no) <> ''
      GROUP BY part_no
      HAVING c > 1
    `);

    if (dup.length > 0) {
      console.error('❌ Migration stopped: duplicate part_no found');
      console.table(dup);
      process.exit(1);
    }

    await run('PRAGMA foreign_keys = OFF');
    await run('BEGIN TRANSACTION');

    // 2) สร้างตารางใหม่พร้อม constraints
    await run(`
      CREATE TABLE IF NOT EXISTS spareparts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
        location TEXT DEFAULT '',
        category TEXT DEFAULT '',
        part_no TEXT UNIQUE, -- allow NULL; non-null must be unique
        min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
        unit TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // 3) ย้ายข้อมูล (normalize part_no: ว่าง -> NULL, name trim, number cast)
    await run(`
      INSERT INTO spareparts_new (
        id, name, quantity, location, category, part_no, min_stock, unit, created_at, updated_at
      )
      SELECT
        id,
        TRIM(name),
        CASE WHEN quantity IS NULL THEN 0 ELSE CAST(quantity AS INTEGER) END,
        COALESCE(location,''),
        COALESCE(category,''),
        CASE
          WHEN part_no IS NULL OR TRIM(part_no) = '' THEN NULL
          ELSE TRIM(part_no)
        END,
        CASE WHEN min_stock IS NULL THEN 0 ELSE CAST(min_stock AS INTEGER) END,
        COALESCE(unit,''),
        COALESCE(created_at, datetime('now')),
        COALESCE(updated_at, datetime('now'))
      FROM spareparts
    `);

    // 4) ลบตารางเก่า แล้วเปลี่ยนชื่อใหม่ให้เป็น spareparts
    await run('DROP TABLE spareparts');
    await run('ALTER TABLE spareparts_new RENAME TO spareparts');

    // 5) index เพิ่มเติม (ถ้าต้องการค้นหาเร็วขึ้น)
    await run(`CREATE INDEX IF NOT EXISTS idx_spareparts_name ON spareparts(name)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_spareparts_location ON spareparts(location)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_spareparts_category ON spareparts(category)`);

    await run('COMMIT');
    await run('PRAGMA foreign_keys = ON');

    console.log('✅ Migration success: constraints applied to spareparts');
  } catch (err) {
    try { await run('ROLLBACK'); } catch (_) {}
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
})();
