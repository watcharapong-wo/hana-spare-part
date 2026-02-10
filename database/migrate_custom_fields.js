const db = require('./db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS custom_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      key TEXT NOT NULL UNIQUE,
      field_type TEXT NOT NULL CHECK (field_type IN ('text','number','date','select','boolean')),
      options_json TEXT DEFAULT '[]',
      is_required INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `, (err) => {
    if (err) console.error('Error creating custom_fields table:', err.message);
    else console.log('✅ custom_fields table ready');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS sparepart_field_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sparepart_id INTEGER NOT NULL,
      field_id INTEGER NOT NULL,
      value_text TEXT DEFAULT '',
      updated_by INTEGER,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(sparepart_id, field_id),
      FOREIGN KEY(sparepart_id) REFERENCES spareparts(id),
      FOREIGN KEY(field_id) REFERENCES custom_fields(id)
    )
  `, (err) => {
    if (err) console.error('Error creating sparepart_field_values table:', err.message);
    else console.log('✅ sparepart_field_values table ready');
  });

  setTimeout(() => {
    console.log('✅ Migration ok: custom fields tables ready');
    db.close();
  }, 500);
});
