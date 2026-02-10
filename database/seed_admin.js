const db = require('./db');
const bcrypt = require('bcryptjs');

const username = 'admin';
const password = 'admin123'; // เปลี่ยนได้
const role = 'admin';
const full_name = 'System Admin';

(async () => {
  const hash = await bcrypt.hash(password, 10);

  db.run(
    `INSERT OR IGNORE INTO users (username, password_hash, role, full_name)
     VALUES (?, ?, ?, ?)`,
    [username, hash, role, full_name],
    function (err) {
      if (err) {
        console.error('❌ Seed failed:', err.message);
      } else {
        console.log('✅ Admin seeded (if not exists):', username);
        console.log('   password:', password);
      }
      db.close();
    }
  );
})();
