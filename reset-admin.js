const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database(path.join(__dirname, "database", "db.sqlite"));

(async () => {
  try {
    const hash = await bcrypt.hash("admin", 10);

    db.run(
      "UPDATE users SET password_hash=?, role='admin', is_active=1 WHERE username='admin'",
      [hash],
      function (err) {
        if (err) {
          console.error("UPDATE ERROR:", err.message);
        } else {
          console.log("UPDATED rows:", this.changes);
        }

        db.get(
          "SELECT id, username, role, is_active FROM users WHERE username='admin'",
          (e, row) => {
            console.log("admin row:", row);
            db.close();
          }
        );
      }
    );
  } catch (e) {
    console.error(e);
    db.close();
  }
})();
