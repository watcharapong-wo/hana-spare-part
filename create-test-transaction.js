const db = require('./database/db');

console.log('Creating test transaction for sparepart ID=2...\n');

// Create a test transaction
db.run(
  `INSERT INTO transactions (sparepart_id, type, quantity, requested_by, approved_by, notes, transaction_date)
   VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
  [2, 'ISSUE', 5, 1, 1, 'Test transaction'],
  function(err) {
    if (err) {
      console.log('Error creating transaction:', err);
      process.exit(1);
    }
    
    console.log('✓ Transaction created');
    console.log(`  Transaction ID: ${this.lastID}`);
    console.log(`  Sparepart ID: 2`);
    console.log('  Type: ISSUE');
    console.log('  Quantity: 5\n');
    
    // Check transactions
    db.get('SELECT COUNT(*) as cnt FROM transactions WHERE sparepart_id = 2', [], (e, r) => {
      console.log(`Transactions for sparepart_id=2: ${r.cnt}`);
      console.log('\n✓ Now try to DELETE /spareparts/2, it should return 409');
      process.exit(0);
    });
  }
);
