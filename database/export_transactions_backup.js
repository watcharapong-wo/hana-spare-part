// Export all transactions to JSON (backup before dropping table)
const db = require('./db');
const fs = require('fs');

db.all('SELECT * FROM transactions', [], (err, rows) => {
  if (err) {
    console.error('Export error:', err.message);
    db.close();
    return;
  }
  fs.writeFileSync('transactions_backup.json', JSON.stringify(rows, null, 2));
  console.log('Exported transactions to transactions_backup.json');
  db.close();
});
