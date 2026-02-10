const db = require('./db');

db.all(
  `SELECT part_no, COUNT(*) c 
   FROM spareparts 
   WHERE part_no IS NOT NULL AND TRIM(part_no) <> '' 
   GROUP BY part_no 
   HAVING c > 1`,
  [],
  (err, rows) => {
    if (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
    
    if (rows.length > 0) {
      console.log('❌ Duplicate part_no found:');
      console.table(rows);
      process.exit(1);
    } else {
      console.log('✅ No duplicates found - safe to proceed with migration');
    }
    
    db.close();
  }
);
