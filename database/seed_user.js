const db = require('./db');
const bcrypt = require('bcryptjs');

// ====== ปรับค่าตรงนี้ ======
const username = 'user01'; // username ที่ต้องการ
const password = 'userpass01'; // password ที่ต้องการ
const role = 'staff'; // หรือ 'admin' หรือ 'viewer'
const full_name = 'IT User'; // ชื่อเต็ม
const is_active = 1; // 1 = ใช้งานได้, 0 = ปิดใช้งาน
// ==========================

(async () => {
  const hash = await bcrypt.hash(password, 10);

  db.run(
    `INSERT OR REPLACE INTO users (username, password_hash, role, full_name, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [username, hash, role, full_name, is_active],
    function (err) {
      if (err) {
        console.error('❌ Seed user failed:', err.message);
      } else {
        console.log('✅ User seeded (or replaced):', username);
        console.log('   password:', password);
      }
      db.close();
    }
  );
})();
