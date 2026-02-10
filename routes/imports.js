const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { ok, fail } = require('../utils/respond');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function makeExternalKey({ category, name, model, spec }) {
  const raw = [category, name, model, spec].map(norm).join('|');
  return raw.replace(/[^a-z0-9|ก-๙ ._-]/g, '').replace(/\s+/g, ' ').trim();
}

function asNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Parse sheet: header at row 4-5, data from row 6+
async function parseMonthly(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];

  let currentCategory = '';

  const items = [];
  for (let r = 6; r <= ws.rowCount; r++) {
    const a = ws.getRow(r).getCell(1).value; // ลำดับ หรือ category text
    const b = ws.getRow(r).getCell(2).value; // รายการ
    const c = ws.getRow(r).getCell(3).value; // รุ่น/โมเดล
    const d = ws.getRow(r).getCell(4).value; // หน่วย/ความจุ

    // category row example: " COMPUTER HARDWARE" in col A
    if (typeof a === 'string' && a.trim().length > 0 && !b) {
      currentCategory = a.trim();
      continue;
    }

    // data row: A is number and B has name
    const idx = asNumber(a);
    const name = (b && String(b).trim()) || '';
    if (!idx || !name) continue;

    const model = c ? String(c).trim() : '';
    const spec = d ? String(d).trim() : '';

    const target = asNumber(ws.getRow(r).getCell(5).value) ?? 0;
    const begin = asNumber(ws.getRow(r).getCell(6).value) ?? 0;
    const received = asNumber(ws.getRow(r).getCell(7).value) ?? 0;
    // H = remain (middle), I = issue, J = remain (end)
    const remainMid = asNumber(ws.getRow(r).getCell(8).value);
    const issued = asNumber(ws.getRow(r).getCell(9).value) ?? 0;
    const remainEnd = asNumber(ws.getRow(r).getCell(10).value);

    const remark = ws.getRow(r).getCell(12).value ? String(ws.getRow(r).getCell(12).value).trim() : '';
    const loan = asNumber(ws.getRow(r).getCell(13).value);

    // choose end stock priority: J -> H -> begin
    const endQty = (remainEnd ?? remainMid ?? begin ?? 0);

    const item = {
      row: r,
      category: currentCategory || '',
      name,
      model,
      spec,
      target_stock: target,
      begin_qty: begin,
      received_qty: received,
      issued_qty: issued,
      end_qty: endQty,
      remark,
      loan_qty: loan ?? 0,
    };

    item.external_key = makeExternalKey(item);
    items.push(item);
  }

  // detect duplicates by external_key in the file
  const seen = new Map();
  const dupKeys = [];
  for (const it of items) {
    if (seen.has(it.external_key)) dupKeys.push(it.external_key);
    else seen.set(it.external_key, 1);
  }

  return { items, dupKeys };
}

// Admin only
router.use(requireAuth, requireRole('admin'));

// POST /imports/monthly/preview
router.post('/monthly/preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return fail(res, 'file is required', 400);

    const { items, dupKeys } = await parseMonthly(req.file.buffer);

    return ok(res, {
      message: 'Preview monthly import',
      summary: {
        total_rows: items.length,
        duplicate_keys_in_file: dupKeys.length,
      },
      duplicates: dupKeys.slice(0, 50),
      data: items.slice(0, 200), // preview first 200
    });
  } catch (e) {
    return fail(res, 'Parse failed', 500, e.message);
  }
});

// POST /imports/monthly/apply
router.post('/monthly/apply', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return fail(res, 'file is required', 400);

    const { items, dupKeys } = await parseMonthly(req.file.buffer);
    if (dupKeys.length > 0) {
      return fail(res, 'Duplicate items detected in file (same external_key). Please fix file first.', 409, dupKeys.slice(0, 50));
    }

    await new Promise((resolve, reject) => db.run('BEGIN TRANSACTION', (err) => (err ? reject(err) : resolve())));

    let inserted = 0, updated = 0;

    for (const it of items) {
      // find by external_key
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM spareparts WHERE external_key = ?', [it.external_key], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!existing) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO spareparts (name, quantity, category, model, spec, target_stock, external_key, created_by, updated_by, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [it.name, it.end_qty, it.category, it.model, it.spec, it.target_stock, it.external_key, req.user.id, req.user.id],
            (err) => (err ? reject(err) : resolve())
          );
        });
        inserted++;
      } else {
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE spareparts
             SET name=?, quantity=?, category=?, model=?, spec=?, target_stock=?, updated_by=?, updated_at=datetime('now')
             WHERE id=?`,
            [it.name, it.end_qty, it.category, it.model, it.spec, it.target_stock, req.user.id, existing.id],
            (err) => (err ? reject(err) : resolve())
          );
        });
        updated++;
      }
    }

    await new Promise((resolve, reject) => db.run('COMMIT', (err) => (err ? reject(err) : resolve())));

    return ok(res, { message: 'Import applied', result: { inserted, updated, total: items.length } });
  } catch (e) {
    try { db.run('ROLLBACK'); } catch {}
    return fail(res, 'Apply failed', 500, e.message);
  }
});

module.exports = router;
