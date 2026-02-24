const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'db.sqlite');
const backupDir = path.join(__dirname, '..', 'backups');

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function createBackup() {
  await fs.promises.mkdir(backupDir, { recursive: true });

  const fileName = `backup-${getTimestamp()}.db`;
  const destPath = path.join(backupDir, fileName);

  await fs.promises.copyFile(dbPath, destPath);

  return {
    fileName,
    path: destPath
  };
}

module.exports = {
  createBackup
};
