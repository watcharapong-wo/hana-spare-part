const db = require('./db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS import_invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_sha256 TEXT NOT NULL UNIQUE,
      invoice_no TEXT,
      invoice_date TEXT,
      vendor TEXT,
      raw_text TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS import_invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      import_invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      part_no TEXT,
      qty REAL NOT NULL DEFAULT 0,
      unit TEXT,
      unit_price REAL,
      total_price REAL,
      matched_sparepart_id INTEGER,
      FOREIGN KEY(import_invoice_id) REFERENCES import_invoices(id)
    )
  `);

  console.log('✅ Migration ok: import_invoices tables ready');
});

db.close();
