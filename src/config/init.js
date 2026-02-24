const db = require("./db");
const bcrypt = require("bcryptjs");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      full_name TEXT,
      role TEXT,
      permissions TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS spareparts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      quantity INTEGER,
      min_stock INTEGER,
      location TEXT,
      note TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sparepart_id INTEGER,
      type TEXT,
      qty INTEGER,
      requester TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // create default admin if not exists
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      const hashed = bcrypt.hashSync("admin123", 10);
      db.run(
        `INSERT INTO users (username, password, role, permissions)
         VALUES (?, ?, ?, ?)`,
        [
          "admin",
          hashed,
          "admin",
          JSON.stringify({})
        ]
      );
      console.log("👑 Default admin created (admin/admin123)");
    }
  });
});
