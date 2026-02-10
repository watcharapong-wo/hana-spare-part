const db = require('./database/db');

console.log('Creating transaction for sparepart ID=2...\n');

db.run(
  `INSERT INTO transactions (sparepart_id, type, quantity, notes, created_by, created_at)
   VALUES (?, ?, ?, ?, ?, datetime('now'))`,
  [2, 'ISSUE', 5, 'Test transaction for delete protection', 'admin'],
  function(err) {
    if (err) {
      console.log('Error:', err.message);
      process.exit(1);
    }
    
    console.log('✓ Transaction created successfully');
    console.log(`  Sparepart ID: 2`);
    console.log(`  Type: ISSUE`);
    console.log(`  Quantity: 5\n`);
    
    // Verify
    db.get('SELECT COUNT(*) as cnt FROM transactions WHERE sparepart_id = 2', [], (e, r) => {
      console.log(`Transactions for sparepart_id=2: ${r.cnt}`);
      console.log('\n✓ Now DELETE /spareparts/2 should return 409 Conflict');
      process.exit(0);
    });
  }
);
