const db = require('./database/db');

console.log('Checking transactions...\n');

// Check total transactions
db.all('SELECT * FROM transactions', [], (err, rows) => {
  if (err) {
    console.log('Error:', err);
    process.exit(1);
  }
  
  console.log(`Total transactions: ${rows.length}`);
  if (rows.length === 0) {
    console.log('⚠️  No transactions found in database!');
  } else {
    console.log('Transactions by sparepart:');
    const bySpare = {};
    rows.forEach(r => {
      if (!bySpare[r.sparepart_id]) bySpare[r.sparepart_id] = 0;
      bySpare[r.sparepart_id]++;
    });
    Object.keys(bySpare).forEach(sid => {
      console.log(`  Sparepart ID ${sid}: ${bySpare[sid]} transactions`);
    });
  }
  
  process.exit(0);
});
