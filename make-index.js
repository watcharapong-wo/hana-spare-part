const fs=require('fs');
const code=`require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

try {
  app.use('/import-pdf', require('./routes/import-pdf'));
  console.log('[DEBUG] Mounted: /import-pdf');
} catch (e) {
  console.error('[ERROR] Failed to mount /import-pdf:', e);
}

app.use('/auth', require('./routes/auth'));
app.use('/spareparts', require('./routes/spareparts'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err && err.message ? err.message : String(err)
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
`;
fs.writeFileSync('index.js', code, 'utf8');
console.log('✅ index.js created');
