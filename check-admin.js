const db = require('./database/db');
db.all('SELECT id, username, role FROM users WHERE role = ?', ['admin'], (e, r) => {
  if (e) console.error(e);
  else console.log(JSON.stringify(r, null, 2));
  process.exit(0);
});
