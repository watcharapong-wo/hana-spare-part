// --- Single-line item parser ---
function parseInvoiceFromOcrText(rawText) {
  const text = String(rawText || '').replace(/\r/g, '');

  // invoice no: ใน OCR ของคุณออกมาเป็น 1V69012204 (ตัว I มักถูกอ่านเป็น 1)
  let invoiceNo = (text.match(/\b[1I]V\d{6,}\b/)?.[0] || '').replace(/^1V/, 'IV');

  // date: 22/01/69
  const invoiceDate = text.match(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/)?.[0] || '';

  // vendor: บรรทัดแรกที่มีคำว่า บริษัท
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  const vendor = (lines.find(l => l.startsWith('บริษัท')) || '').trim();

  // item line: จับบรรทัดที่มี " | " และมีราคา 2 ตัวท้ายบรรทัด
  // ตัวอย่าง: "1 | RAM DDR5 ... 3,100.00     3,100.00"
  const itemLine = lines.find(l =>
    /\|\s*.+\s+[\d,]+\.\d{2}\s+[\d,]+\.\d{2}\s*$/.test(l)
  ) || '';

  if (!itemLine) {
    return { invoice_no: invoiceNo, invoice_date: invoiceDate, vendor, items: [], rawText };
  }

  // แยก: "1 | <desc> ... <unitPrice> <totalPrice>"
  const m = itemLine.match(/^\s*(\d+)\s*\|\s*(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*$/);
  if (!m) {
    return { invoice_no: invoiceNo, invoice_date: invoiceDate, vendor, items: [], rawText };
  }

  const description = m[2].trim();
  const unitPrice = Number(m[3].replace(/,/g, ''));
  const totalPrice = Number(m[4].replace(/,/g, ''));

  // qty: ใน invoice นี้ qty มักเป็น 1 แถวเดียวอยู่หน้าสุด (m[1]) แต่จริงๆ m[1] คือ item no
  // เราจะหา qty จากบรรทัดถัดๆ ไป: มักมีแค่ "1" อยู่เดี่ยว หรือใช้ default 1
  let qty = 1;
  // พยายามหา "บรรทัดเดี่ยวที่เป็นเลข" ใกล้ๆ itemLine (ถัดไป 1-3 บรรทัด)
  const idx = lines.indexOf(itemLine);
  for (let j = idx + 1; j <= Math.min(lines.length - 1, idx + 4); j++) {
    if (/^\d+(\.\d+)?$/.test(lines[j])) {
      const n = Number(lines[j]);
      if (n > 0 && n < 10000) { qty = n; break; }
    }
  }

  // part_no: หาในบรรทัดถัดไปที่มีวงเล็บหรือมีรหัสตัวอักษร/ตัวเลขยาวๆ เช่น AD5S...
  let partNo = '';
  for (let j = idx + 1; j <= Math.min(lines.length - 1, idx + 6); j++) {
    const ln = lines[j];
    const code = ln.match(/[A-Z0-9\-]{6,}/)?.[0];
    if (code) { partNo = code; break; }
  }

  return {
    invoice_no: invoiceNo,
    invoice_date: invoiceDate,
    vendor,
    items: [{
      description,
      part_no: partNo,
      qty,
      unit: 'PCS',
      unit_price: unitPrice,
      total_price: totalPrice
    }],
    rawText
  };
}
const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function runOCRFromPdfBuffer(pdfBuffer) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'invocr-'));
  const pdfPath = path.join(tmpDir, 'invoice.pdf');
  fs.writeFileSync(pdfPath, pdfBuffer);

  // 1) PDF -> PNG images (page-1.png, page-2.png...)
  const outPrefix = path.join(tmpDir, 'page');
  execFileSync('pdftoppm', ['-png', '-r', '200', pdfPath, outPrefix]);

  const files = fs.readdirSync(tmpDir)
    .filter(f => f.startsWith('page-') && f.endsWith('.png'))
    .map(f => path.join(tmpDir, f))
    .sort();

  if (files.length === 0) throw new Error('No pages rendered from PDF');

  // 2) OCR each page (eng+tha)
  let fullText = '';
  for (const img of files) {
    const base = img.replace(/\.png$/i, '');
    // tesseract <img> <outputbase> -l eng+tha
    execFileSync('tesseract', [img, base, '-l', 'eng+tha'], { stdio: 'ignore' });
    const txt = fs.readFileSync(base + '.txt', 'utf8');
    fullText += '\n' + txt;
  }

  // cleanup (best-effort)
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

  return fullText.trim();
}

// “Parser แบบยืดหยุ่น” → ให้ UI แก้ได้ใน preview
function parseInvoiceText(text) {
  // New parser: single item support
  const rawText = String(text || '').replace(/\r/g, '');
  const lines = rawText.split('\n').map(s => s.trim()).filter(Boolean);

  // invoice no เช่น IV69012204
  const invoiceNo = (rawText.match(/\bIV\d{6,}\b/i)?.[0]) || '';

  // date เช่น 22/01/69
  const invoiceDate = (rawText.match(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/)?.[0]) || '';

  // vendor (เดาจากคำว่า บริษัท / CO., LTD)
  let vendor = '';
  for (const ln of lines) {
    if (/บริษัท|co\.|ltd|limited/i.test(ln)) { vendor = ln; break; }
  }

  // --- หา item ---
  // heuristic: หา "บรรทัดที่มีราคา 2 ครั้งติดกัน" เช่น 3,100.00 3,100.00
  const priceRe = /([\d,]+\.\d{2})/g;

  // หา index ของบรรทัดที่มีราคา
  let priceLineIdx = -1;
  let prices = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(priceRe);
    if (m && m.length >= 1) {
      priceLineIdx = i;
      prices = m;
      if (m.length >= 2) break;
    }
  }

  // ถ้าราคาแยกหลายบรรทัด: มองหาราคา 2 บรรทัดติดกัน
  let unitPrice = null, totalPrice = null, priceIdxStart = -1;
  for (let i = 0; i < lines.length - 1; i++) {
    const a = lines[i].match(/^[\d,]+\.\d{2}$/);
    const b = lines[i + 1].match(/^[\d,]+\.\d{2}$/);
    if (a && b) {
      unitPrice = Number(lines[i].replace(/,/g, ''));
      totalPrice = Number(lines[i + 1].replace(/,/g, ''));
      priceIdxStart = i;
      break;
    }
  }

  // หา qty: มักอยู่ก่อนราคา 1-3 บรรทัด
  let qty = null;
  if (priceIdxStart !== -1) {
    for (let j = Math.max(0, priceIdxStart - 4); j < priceIdxStart; j++) {
      if (/^\d+(\.\d+)?$/.test(lines[j])) {
        const n = Number(lines[j]);
        if (n > 0 && n < 10000) qty = n;
      }
    }
  }

  // หา part_no/model: มักเป็นบรรทัดมีตัวอักษร+ตัวเลข ยาวพอ (เช่น AD5S56008G)
  let partNo = '';
  if (priceIdxStart !== -1) {
    for (let j = Math.max(0, priceIdxStart - 8); j < priceIdxStart; j++) {
      const ln = lines[j];
      if (/[A-Z0-9]{6,}/.test(ln) && !/^\d+(\.\d+)?$/.test(ln) && !/^[\d,]+\.\d{2}$/.test(ln)) {
        const tokens = ln.split(/\s+/);
        const code = tokens.find(t => /^[A-Z0-9\-]{6,}$/.test(t));
        if (code) { partNo = code; break; }
      }
    }
  }

  // หา description: มักอยู่เหนือ part_no/qty
  let description = '';
  if (priceIdxStart !== -1) {
    for (let j = Math.max(0, priceIdxStart - 12); j < priceIdxStart; j++) {
      const ln = lines[j];
      if (/ram|ssd|hdd|ddr|adapter|cable|keyboard|mouse/i.test(ln) || ln.length >= 10) {
        if (!/บริษัท|โทร|เลขที่|ที่อยู่|จังหวัด|อำเภอ|ตำบล|tax|vat|invoice|purchase/i.test(ln)) {
          if (/adata|kingston|samsung|seagate|wd|dell|hp|lenovo/i.test(ln) && ln.length < 25) continue;
          description = ln;
          break;
        }
      }
    }
  }

  const items = [];
  if (description && qty) {
    items.push({
      description,
      part_no: partNo,
      qty,
      unit: 'PCS',
      unit_price: unitPrice,
      total_price: totalPrice,
    });
  }

  return {
    invoice_no: invoiceNo,
    invoice_date: invoiceDate,
    vendor,
    items,
  };
}

// --- PREVIEW ---
router.post('/preview', requireAuth, requireRole('admin','staff'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'file is required' });

    const fileHash = sha256(req.file.buffer);

    // กัน import ซ้ำ (แค่แจ้งเตือนใน preview)
    const existed = db.prepare('SELECT id, invoice_no, invoice_date, vendor FROM import_invoices WHERE file_sha256=?').get(fileHash);

    const ocrText = runOCRFromPdfBuffer(req.file.buffer);
    const parsed = parseInvoiceFromOcrText(ocrText);

    if (!parsed.items || parsed.items.length === 0) {
      return res.json({
        success: false,
        message: 'OCR succeeded but item parsing failed. Please review rawText.',
        parsed,
        rawText: ocrText
      });
    }

    return res.json({
      success: true,
      message: 'Parsed invoice from PDF',
      parsed
    });
  } catch (e) {
    return res.status(500).json({ message: 'Preview failed', error: e.message });
  }
});

// --- APPLY ---
router.post('/apply', requireAuth, requireRole('admin','staff'), async (req, res) => {
  try {
    const { file_sha256, extracted, options } = req.body || {};
    if (!file_sha256 || !extracted) return res.status(400).json({ message: 'file_sha256 and extracted are required' });

    const { invoice_no, invoice_date, vendor, items } = extracted;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items to apply' });

    const existed = db.prepare('SELECT id FROM import_invoices WHERE file_sha256=?').get(file_sha256);
    if (existed) return res.status(409).json({ message: 'This PDF was already imported', import_invoice_id: existed.id });

    const createIfNotFound = options?.create_if_not_found !== false; // default true
    const defaultCategory = options?.default_category || 'Imported';
    const defaultLocation = options?.default_location || 'Receiving';

    db.prepare('BEGIN TRANSACTION').run();

    // 1) insert import invoice
    const importInvoiceInfo = db.prepare(`INSERT INTO import_invoices (file_sha256, invoice_no, invoice_date, vendor, raw_text, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`)
      .run(file_sha256, invoice_no || '', invoice_date || '', vendor || '', '', req.user.id);
    const importInvoiceId = importInvoiceInfo.lastInsertRowid;

    let createdSpareparts = 0;
    let matchedSpareparts = 0;
    let receiveTx = 0;

    for (const it of items) {
      const qty = Number(it.qty || 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      // match by part_no if provided, else by name
      let sp = null;
      if (it.part_no && String(it.part_no).trim()) {
        sp = db.prepare('SELECT id, quantity FROM spareparts WHERE part_no = ?').get(String(it.part_no).trim());
      }
      if (!sp) {
        sp = db.prepare('SELECT id, quantity FROM spareparts WHERE name = ?').get(String(it.description).trim());
      }

      let sparepartId;
      if (!sp) {
        if (!createIfNotFound) throw new Error(`Sparepart not found: ${it.description}`);
        // create sparepart
        const info = db.prepare(`INSERT INTO spareparts (name, quantity, location, category, part_no, created_by, updated_by, created_at, updated_at)
             VALUES (?, 0, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
          .run(String(it.description).trim(), defaultLocation, defaultCategory, String(it.part_no || '').trim(), req.user.id, req.user.id);
        sparepartId = info.lastInsertRowid;
        createdSpareparts++;
      } else {
        sparepartId = sp.id;
        matchedSpareparts++;
      }

      // 2) add stock
      db.prepare(`UPDATE spareparts SET quantity = quantity + ?, updated_by=?, updated_at=datetime('now') WHERE id=?`)
        .run(qty, req.user.id, sparepartId);

      // 3) insert RECEIVE transaction
      db.prepare(`INSERT INTO transactions (type, sparepart_id, qty, requester, note, created_by, created_at)
           VALUES ('RECEIVE', ?, ?, ?, ?, ?, datetime('now'))`)
        .run(sparepartId, qty, vendor || '-', `Imported Invoice ${invoice_no || ''} ${invoice_date || ''}`.trim(), req.user.id);
      receiveTx++;

      // 4) store invoice items
      db.prepare(`INSERT INTO import_invoice_items
           (import_invoice_id, description, part_no, qty, unit, unit_price, total_price, matched_sparepart_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(importInvoiceId, String(it.description).trim(), String(it.part_no || '').trim(), qty, String(it.unit || 'PCS'),
           it.unit_price ?? null, it.total_price ?? null, sparepartId);
    }

    db.prepare('COMMIT').run();

    res.json({
      message: 'PDF invoice imported',
      import_invoice_id: importInvoiceId,
      result: { createdSpareparts, matchedSpareparts, receiveTransactions: receiveTx }
    });
  } catch (e) {
    try { db.prepare('ROLLBACK').run(); } catch {}
    res.status(400).json({ message: 'Apply failed', error: e.message });
  }
});

module.exports = router;
