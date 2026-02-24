const express = require('express');
const router = express.Router();
// GET /transactions/recent?limit=10
router.get('/recent', (req, res) => {
  const limit = Number(req.query.limit) || 10;
  // TODO: ดึงข้อมูลจริงจากฐานข้อมูล
  res.json({ data: [] }); // mock data
});
const db = require('../database/db');
const { ok, fail } = require('../utils/respond');
const { validateTransaction } = require('../middleware/validators');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /transactions -> ดูประวัติทั้งหมด
router.get('/', (req, res) => {
  const { type, requester, date_from, date_to } = req.query;

  let sql = `SELECT
        t.*,
        s.name AS sparepart_name,
        u.username AS created_by_username,
        u.full_name AS created_by_full_name
     FROM transactions t
     JOIN spareparts s ON s.id = t.sparepart_id
     LEFT JOIN users u ON u.id = t.created_by`;

  const where = [];
  const params = [];

  if (type) {
    where.push('t.type = ?');
    params.push(String(type).toUpperCase());
  }

  if (requester) {
    where.push('t.requester LIKE ?');
    params.push(`%${requester}%`);
  }

  if (date_from) {
    where.push('date(t.created_at) >= date(?)');
    params.push(date_from);
  }

  if (date_to) {
    where.push('date(t.created_at) <= date(?)');
    params.push(date_to);
  }

  if (where.length) {
    sql += ' WHERE ' + where.join(' AND ');
  }

  sql += ' ORDER BY t.id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.json({ message: 'Transactions list', data: rows });
  });
});

// POST /transactions/issue -> เบิกของ (ลด stock)
router.post('/issue', requireAuth, requireRole('admin', 'staff'), validateTransaction, (req, res) => {
  const { sparepart_id, qty, requester, note } = req.body;

  const id = Number(sparepart_id);
  const q = Number(qty);

  db.get('SELECT * FROM spareparts WHERE id = ?', [id], (err, part) => {
    if (err) {
      console.error('DB error (select sparepart):', err);
      return fail(res, 'DB error', 500, err.message);
    }
    if (!part) {
      console.error('Sparepart not found:', id);
      return fail(res, 'Sparepart not found', 404);
    }

    if (part.quantity < q) {
      console.error('Not enough stock:', { current: part.quantity, requested: q });
      return fail(res, 'Not enough stock', 400, { current_stock: part.quantity });
    }

    // ทำแบบ transaction (BEGIN -> UPDATE -> INSERT -> COMMIT)
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      db.run(
        `UPDATE spareparts SET quantity = quantity - ?, updated_at = datetime('now') WHERE id = ?`,
        [q, id],
        function (err2) {
          if (err2) {
            console.error('DB error (update sparepart):', err2);
            db.run('ROLLBACK');
            return fail(res, 'DB error', 500, err2.message);
          }

          db.run(
            `INSERT INTO transactions (sparepart_id, type, qty, requester, note, created_by)
             VALUES (?, 'ISSUE', ?, ?, ?, ?)`,
            [id, q, requester || req.user.username, note || '', req.user.id],
            function (err3) {
              if (err3) {
                console.error('DB error (insert transaction):', err3);
                db.run('ROLLBACK');
                return fail(res, 'DB error', 500, err3.message);
              }

              db.run('COMMIT');

              db.get('SELECT * FROM spareparts WHERE id = ?', [id], (err4, updatedPart) => {
                if (err4) {
                  console.error('DB error (select updated sparepart):', err4);
                  return fail(res, 'DB error', 500, err4.message);
                }
                return ok(res, {
                  message: 'Issued successfully',
                  transaction_id: this.lastID,
                  sparepart: updatedPart
                }, 201);
              });
            }
          );
        }
      );
    });
  });
});

// POST /transactions/return -> คืนของ (เพิ่ม stock)
router.post('/return', requireAuth, requireRole('admin', 'staff'), validateTransaction, (req, res) => {
  const { sparepart_id, qty, requester, note } = req.body;

  const id = Number(sparepart_id);
  const q = Number(qty);

  db.get('SELECT * FROM spareparts WHERE id = ?', [id], (err, part) => {
    if (err) return fail(res, 'DB error', 500, err.message);
    if (!part) return fail(res, 'Sparepart not found', 404);

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      db.run(
        `UPDATE spareparts SET quantity = quantity + ?, updated_at = datetime('now') WHERE id = ?`,
        [q, id],
        function (err2) {
          if (err2) {
            db.run('ROLLBACK');
            return fail(res, 'DB error', 500, err2.message);
          }

          db.run(
            `INSERT INTO transactions (sparepart_id, type, qty, requester, note, created_by)
             VALUES (?, 'RETURN', ?, ?, ?, ?)`,
            [id, q, requester || req.user.username, note || '', req.user.id],
            function (err3) {
              if (err3) {
                db.run('ROLLBACK');
                return fail(res, 'DB error', 500, err3.message);
              }

              db.run('COMMIT');

              db.get('SELECT * FROM spareparts WHERE id = ?', [id], (err4, updatedPart) => {
                if (err4) return fail(res, 'DB error', 500, err4.message);
                return ok(res, {
                  message: 'Returned successfully',
                  transaction_id: this.lastID,
                  sparepart: updatedPart
                }, 201);
              });
            }
          );
        }
      );
    });
  });
});

module.exports = router;
const { normalLimit } = require('../middleware/rate-limiter');

router.use(normalLimit);
