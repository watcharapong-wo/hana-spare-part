const db = require('./db');

const id = 2;
const username = 'coadmin2';
const password_hash = 'dummyhash'; // ใช้ hash จริงใน production
const role = 'coadmin';
const full_name = 'Coadmin User';

const info = db.run(`INSERT INTO users (id, username, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)`, [id, username, password_hash, role, full_name]);
console.log('Inserted user:', info);
db.close();
