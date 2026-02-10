const db = require('./database/db');

db.all("PRAGMA table_info(transactions)", [], (err, rows) => {
  console.log('Transactions table columns:');
  if (rows) {
    rows.forEach(r => console.log(`  ${r.name} (${r.type})`));
  }
  
  // Try to create transaction with correct columns
  console.log('\nCreating transaction with correct schema...');
  db.run(
    `INSERT INTO transactions (sparepart_id, type, quantity, issued_by, returned_by, notes, transaction_date)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [2, 'ISSUE', 5, 1, 1, 'Test transaction for delete protection'],
    function(err) {
      if (err) {
        console.log('Error:', err.message);
      } else {
        console.log('✓ Transaction created successfully');
        console.log(`  Transaction ID: ${this.lastID}`);
        console.log(`  Sparepart ID: 2`);
      }
      process.exit(0);
    }
  );
});
