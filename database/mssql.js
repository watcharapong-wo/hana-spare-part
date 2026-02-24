const sql = require('mssql');

const config = {
  user: 'sa', // เปลี่ยนเป็น user ของคุณ
  password: 'your_password', // เปลี่ยนเป็นรหัสผ่านของคุณ
  server: 'localhost', // หรือ 'localhost\\SQLEXPRESS' ถ้าใช้ instance name
  database: 'your_db_name', // ชื่อ database
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function connect() {
  try {
    await sql.connect(config);
    console.log('Connected to SQL Server');
  } catch (err) {
    console.error('DB connection error:', err);
  }
}

module.exports = { sql, connect };