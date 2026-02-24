const db = require('./db');

const user_id = 2;
const user = db.get('SELECT id, username, role FROM users WHERE id = ?', [user_id]);
console.log('User:', user);
db.close();
