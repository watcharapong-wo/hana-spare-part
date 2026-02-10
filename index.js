require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();

// -------------------- Basic middleware --------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -------------------- CORS (simple + permissive for intranet/dev) --------------------
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// -------------------- Security headers (light hardening) --------------------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// -------------------- Health check --------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// -------------------- Routes (MUST be before 404) --------------------
try {
  app.use('/import-pdf', require('./routes/import-pdf'));
  console.log('[DEBUG] Mounted: /import-pdf');
} catch (e) {
  console.error('[ERROR] Failed to mount /import-pdf:', e);
}

// (ถ้าคุณมี routes อื่น ให้ mount ตรงนี้)
// app.use('/auth', require('./routes/auth'));
// app.use('/spareparts', require('./routes/spareparts'));

// -------------------- Static (optional) --------------------
// ถ้ามีเว็บเก่าอยู่ใน public/ จะ serve ได้ที่ / (GET เท่านั้นโดยมาก)
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- 404 handler (LAST) --------------------
app.use((req, res) => {
  res.status(404).send('Not found');
});

// -------------------- Error handler --------------------
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err && err.message ? err.message : String(err)
  });
});

// -------------------- Start server --------------------
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
