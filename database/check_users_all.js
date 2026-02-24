const db = require('./db');

try {
  const users = db.all('SELECT id, username, role FROM users');
  console.log('All users:', users);
  const user2 = db.get('SELECT id, username, role FROM users WHERE id = ?', [2]);
  console.log('User id=2:', user2);
} catch (err) {
  console.error('DB error:', err);
}
db.close();
