const db = require('./db');
const bcrypt = require('bcryptjs');

const username = 'staff';
const password = 'staff123';
const role = 'staff';
const full_name = 'IT Staff';

(async () => {
  const hash = await bcrypt.hash(password, 10);

  db.run(
    `INSERT OR IGNORE INTO users (username, password_hash, role, full_name)
     VALUES (?, ?, ?, ?)`,
    [username, hash, role, full_name],
    function (err) {
      if (err) {
        console.error('❌ Seed staff failed:', err.message);
      } else {
        console.log('✅ Staff seeded (if not exists):', username);
        console.log('   password:', password);
      }
      db.close();
    }
  );
})();
