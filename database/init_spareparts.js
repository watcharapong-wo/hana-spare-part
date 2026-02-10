// สคริปต์ seed ข้อมูลอะไหล่ตัวอย่าง
const db = require('./db');

const sampleSpareparts = [
  { name: 'RAM 8GB DDR4', quantity: 10, min_stock: 2, location: 'คลังหลัก', note: 'สำหรับ PC' },
  { name: 'SSD 256GB', quantity: 5, min_stock: 1, location: 'คลังหลัก', note: 'สำหรับอัพเกรด' },
  { name: 'Mouse Logitech', quantity: 20, min_stock: 5, location: 'ห้อง IT', note: 'อุปกรณ์ต่อพ่วง' },
  { name: 'Keyboard HP', quantity: 15, min_stock: 3, location: 'คลังย่อย', note: 'อุปกรณ์ต่อพ่วง' }
];

function seedSpareparts() {
  sampleSpareparts.forEach(item => {
    db.run(
      `INSERT INTO spareparts (name, quantity, min_stock, location, created_by, updated_by, updated_at)
       VALUES (?, ?, ?, ?, 1, 1, datetime('now'))`,
      [item.name, item.quantity, item.min_stock, item.location],
      function (err) {
        if (err) {
          if (String(err.message).includes('UNIQUE')) return;
          console.error('❌ Insert error:', err.message);
        }
      }
    );
  });
  console.log('✅ Sample spareparts seeded');
}

seedSpareparts();
db.close();
