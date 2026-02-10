const { createBackup } = require('../utils/backup');

(async () => {
  try {
    const result = await createBackup();
    console.log('✅ Backup created:', result.fileName);
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
  }
})();
