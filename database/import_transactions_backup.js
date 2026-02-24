// Import transactions from backup JSON (set qty=1 for all)
const db = require('./db');
const fs = require('fs');

const rows = JSON.parse(fs.readFileSync('transactions_backup.json', 'utf8'));

let imported = 0;

function insertNext(i) {
  if (i >= rows.length) {
    console.log(`Imported ${imported} transactions.`);
    db.close();
    return;
  }
  const row = rows[i];
  db.run(
    `INSERT INTO transactions (id, sparepart_id, type, qty, requester, note, created_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.sparepart_id,
      row.type,
      1, // set qty=1 for all old data
      row.requester || '',
      row.note || '',
      row.created_at || null,
      row.created_by || null
    ],
    (err) => {
      if (err) {
        console.error('Import error:', err.message, row);
      } else {
        imported++;
      }
      insertNext(i + 1);
    }
  );
}

insertNext(0);
