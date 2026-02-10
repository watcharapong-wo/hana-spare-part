const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { ok, fail } = require('../utils/respond');
const { validateCreateSparepart, validateUpdateSparepart } = require('../middleware/validators');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /spareparts
router.get('/', (req, res) => {
  const { q, location, min_qty, max_qty, min_stock, max_stock } = req.query;

  let sql = `
    SELECT
      s.*,
      cu.username AS created_by_username,
      cu.full_name AS created_by_full_name,
      uu.username AS updated_by_username,
      uu.full_name AS updated_by_full_name
    FROM spareparts s
    LEFT JOIN users cu ON cu.id = s.created_by
    LEFT JOIN users uu ON uu.id = s.updated_by
  `;
  const params = [];
  const where = [];

  if (q) {
    where.push('s.name LIKE ?');
    params.push(`%${q}%`);
  }

  if (location) {
    where.push('s.location = ?');
    params.push(location);
  }

  const minQty = Number(min_qty);
  if (!Number.isNaN(minQty)) {
    where.push('s.quantity >= ?');
    params.push(minQty);
  }

  const maxQty = Number(max_qty);
  if (!Number.isNaN(maxQty)) {
    where.push('s.quantity <= ?');
    params.push(maxQty);
  }

  const minStock = Number(min_stock);
  if (!Number.isNaN(minStock)) {
    where.push('s.min_stock >= ?');
    params.push(minStock);
  }

  const maxStock = Number(max_stock);
  if (!Number.isNaN(maxStock)) {
    where.push('s.min_stock <= ?');
    params.push(maxStock);
  }

  if (where.length) {
    sql += ' WHERE ' + where.join(' AND ');
  }

  sql += ' ORDER BY s.id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.json({ message: 'Spareparts list', data: rows });
  });
});

// GET /spareparts/low-stock -> ของใกล้หมด (quantity <= min_stock)
router.get('/low-stock', (req, res) => {
  db.all(
    `SELECT * FROM spareparts
     WHERE quantity <= min_stock
     ORDER BY (min_stock - quantity) DESC, id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });
      res.json({ message: 'Low stock list', data: rows });
    }
  );
});

// GET /spareparts/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.get(
    `SELECT
        s.*,
        cu.username AS created_by_username,
        cu.full_name AS created_by_full_name,
        uu.username AS updated_by_username,
        uu.full_name AS updated_by_full_name
     FROM spareparts s
     LEFT JOIN users cu ON cu.id = s.created_by
     LEFT JOIN users uu ON uu.id = s.updated_by
     WHERE s.id = ?`,
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });
      if (!row) return res.status(404).json({ message: 'Sparepart not found' });
      res.json({ message: 'Sparepart detail', data: row });
    }
  );
});

// POST /spareparts
router.post('/', requireAuth, requireRole('admin', 'staff'), validateCreateSparepart, (req, res) => {
  const { name, quantity, location, category, part_no, min_stock, unit } = req.body;

  const q = Number(quantity);
  const loc = location || '';
  const cat = category || '';
  const part = (part_no && part_no.trim()) ? part_no.trim() : null; // NULL if empty
  const min = min_stock === undefined ? 0 : Number(min_stock);
  const u = unit || '';

  db.run(
    `INSERT INTO spareparts (name, quantity, location, category, part_no, min_stock, unit, created_by, updated_by, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [name.trim(), q, loc, cat, part, min, u, req.user.id, req.user.id],
    function (err) {
      if (err) return fail(res, 'DB error', 500, err.message);

      db.get('SELECT * FROM spareparts WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) return fail(res, 'DB error', 500, err2.message);
        return ok(res, { message: 'Sparepart created', data: row }, 201);
      });
    }
  );
});

// PUT /spareparts/:id
router.put('/:id', requireAuth, requireRole('admin', 'staff'), validateUpdateSparepart, (req, res) => {
  const id = Number(req.params.id);
  const { name, quantity, location, category, part_no, min_stock, unit } = req.body;

  db.get('SELECT * FROM spareparts WHERE id = ?', [id], (err, row) => {
    if (err) return fail(res, 'DB error', 500, err.message);
    if (!row) return fail(res, 'Sparepart not found', 404);

    const newName = name !== undefined ? name : row.name;
    const newQty = quantity !== undefined ? Number(quantity) : row.quantity;
    const newLoc = location !== undefined ? location : row.location;
    const newCat = category !== undefined ? category : (row.category || '');
    const newPart = part_no !== undefined ? ((part_no && part_no.trim()) ? part_no.trim() : null) : row.part_no;
    const newMin = min_stock !== undefined ? Number(min_stock) : (row.min_stock || 0);
    const newUnit = unit !== undefined ? unit : (row.unit || '');

    db.run(
      `UPDATE spareparts
       SET name = ?, quantity = ?, location = ?, category = ?, part_no = ?, min_stock = ?, unit = ?,
           updated_by = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [newName, newQty, newLoc, newCat, newPart, newMin, newUnit, req.user.id, id],
      function (err2) {
        if (err2) return fail(res, 'DB error', 500, err2.message);

        db.get('SELECT * FROM spareparts WHERE id = ?', [id], (err3, updated) => {
          if (err3) return fail(res, 'DB error', 500, err3.message);
          return ok(res, { message: 'Sparepart updated', data: updated });
        });
      }
    );
  });
});

// DELETE /spareparts/:id
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  // 1) ตรวจว่ามี sparepart ไหม
  db.get('SELECT * FROM spareparts WHERE id = ?', [id], (err, part) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    if (!part) return res.status(404).json({ message: 'Sparepart not found' });

    // 2) ตรวจว่ามี transactions ไหม
    db.get(
      'SELECT COUNT(*) AS cnt FROM transactions WHERE sparepart_id = ?',
      [id],
      (err2, row) => {
        if (err2) return res.status(500).json({ message: 'DB error', error: err2.message });

        if ((row?.cnt || 0) > 0) {
          return res.status(409).json({
            message: 'Cannot delete: sparepart has transactions. Use disable/soft-delete instead.',
            transactions_count: row.cnt,
          });
        }

        // 3) ถ้าไม่มี transactions -> ลบได้
        db.run('DELETE FROM spareparts WHERE id = ?', [id], function (err3) {
          if (err3) return res.status(500).json({ message: 'DB error', error: err3.message });
          return res.json({ message: 'Sparepart deleted', data: part });
        });
      }
    );
  });
});

module.exports = router;
const { normalLimit } = require('../middleware/rate-limiter');

router.use(normalLimit);
