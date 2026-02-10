const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { ok, fail } = require('../utils/respond');

// Get all active custom fields
router.get('/', requireAuth, (req, res) => {
  db.all(
    `SELECT id, name, key, field_type, options_json, is_required, is_active, created_at
     FROM custom_fields
     WHERE is_active = 1
     ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) return fail(res, 'DB error', 500, err.message);
      const data = (rows || []).map(r => {
        let opts = [];
        try {
          opts = typeof r.options_json === 'string' ? JSON.parse(r.options_json) : (r.options_json || []);
        } catch (e) {
          opts = [];
        }
        return { ...r, options_json: opts };
      });
      return ok(res, { message: 'Custom fields', data });
    }
  );
});

// Admin: create field
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, key, field_type, options, is_required } = req.body;
  if (!name || !key || !field_type) {
    return fail(res, 'name, key, field_type are required', 400);
  }

  const allowed = ['text','number','date','select','boolean'];
  if (!allowed.includes(field_type)) {
    return fail(res, 'Invalid field_type', 400);
  }

  const options_json = JSON.stringify(Array.isArray(options) ? options : []);
  const reqFlag = Number(is_required) === 1 ? 1 : 0;

  db.run(
    `INSERT INTO custom_fields (name, key, field_type, options_json, is_required, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [String(name).trim(), String(key).trim(), field_type, options_json, reqFlag],
    function (err) {
      if (err) {
        if (String(err.message).includes('UNIQUE')) {
          return fail(res, 'key already exists', 409);
        }
        return fail(res, 'DB error', 500, err.message);
      }
      db.get(`SELECT * FROM custom_fields WHERE id = ?`, [this.lastID], (e2, row) => {
        if (e2) return fail(res, 'DB error', 500, e2.message);
        return ok(res, { message: 'Field created', data: row }, 201);
      });
    }
  );
});

// Admin: update field details
router.patch('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  const { name, field_type, options, is_required } = req.body;

  if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);

  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push('name = ?');
    params.push(String(name).trim());
  }

  if (field_type !== undefined) {
    const allowed = ['text','number','date','select','boolean'];
    if (!allowed.includes(field_type)) return fail(res, 'Invalid field_type', 400);
    updates.push('field_type = ?');
    params.push(field_type);
  }

  if (options !== undefined) {
    updates.push('options_json = ?');
    params.push(JSON.stringify(Array.isArray(options) ? options : []));
  }

  if (is_required !== undefined) {
    updates.push('is_required = ?');
    params.push(Number(is_required) === 1 ? 1 : 0);
  }

  if (updates.length === 0) return fail(res, 'No fields to update', 400);

  params.push(id);
  const sql = `UPDATE custom_fields SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, params, function (err) {
    if (err) return fail(res, 'DB error', 500, err.message);
    if (this.changes === 0) return fail(res, 'Not found', 404);
    
    db.get(`SELECT * FROM custom_fields WHERE id = ?`, [id], (e2, row) => {
      if (e2) return fail(res, 'DB error', 500, e2.message);
      return ok(res, { message: 'Field updated', data: row });
    });
  });
});

// Admin: disable field (soft delete)
router.patch('/:id/status', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  const active = Number(req.body.is_active) === 1 ? 1 : 0;

  if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);

  db.run(`UPDATE custom_fields SET is_active = ? WHERE id = ?`, [active, id], function (err) {
    if (err) return fail(res, 'DB error', 500, err.message);
    if (this.changes === 0) return fail(res, 'Not found', 404);
    return ok(res, { message: 'Field status updated' });
  });
});

// Get values for a sparepart
router.get('/spareparts/:sparepartId', requireAuth, (req, res) => {
  const sparepartId = Number(req.params.sparepartId);
  if (!Number.isInteger(sparepartId) || sparepartId <= 0) {
    return fail(res, 'Invalid sparepart id', 400);
  }

  db.all(
    `SELECT
        f.id AS field_id, f.name, f.key, f.field_type, f.options_json, f.is_required,
        COALESCE(v.value_text, '') AS value_text
     FROM custom_fields f
     LEFT JOIN sparepart_field_values v
       ON v.field_id = f.id AND v.sparepart_id = ?
     WHERE f.is_active = 1
     ORDER BY f.id ASC`,
    [sparepartId],
    (err, rows) => {
      if (err) return fail(res, 'DB error', 500, err.message);
      const data = (rows || []).map(r => {
        let opts = [];
        try {
          opts = typeof r.options_json === 'string' ? JSON.parse(r.options_json) : (r.options_json || []);
        } catch (e) {
          opts = [];
        }
        return { ...r, options_json: opts };
      });
      return ok(res, { message: 'Sparepart field values', data });
    }
  );
});

// Admin/Staff: upsert values for a sparepart
router.put('/spareparts/:sparepartId', requireAuth, requireRole('admin','staff'), (req, res) => {
  const sparepartId = Number(req.params.sparepartId);
  const values = req.body?.values;

  if (!Number.isInteger(sparepartId) || sparepartId <= 0) {
    return fail(res, 'Invalid sparepart id', 400);
  }
  if (!values || typeof values !== 'object') {
    return fail(res, 'values object is required', 400);
  }

  const entries = Object.entries(values); // { field_id: value_text }
  db.run('BEGIN TRANSACTION', (e0) => {
    if (e0) return fail(res, 'DB error', 500, e0.message);

    let pending = entries.length;
    if (pending === 0) {
      db.run('COMMIT', () => ok(res, { message: 'No values to update' }));
      return;
    }

    for (const [fieldIdStr, valueText] of entries) {
      const fieldId = Number(fieldIdStr);
      if (!Number.isInteger(fieldId) || fieldId <= 0) {
        pending--;
        continue;
      }

      db.run(
        `INSERT INTO sparepart_field_values (sparepart_id, field_id, value_text, updated_by, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(sparepart_id, field_id)
         DO UPDATE SET value_text=excluded.value_text, updated_by=excluded.updated_by, updated_at=datetime('now')`,
        [sparepartId, fieldId, String(valueText ?? ''), req.user.id],
        (err) => {
          if (err) {
            db.run('ROLLBACK', () => fail(res, 'DB error', 500, err.message));
            pending = -1;
            return;
          }
          pending--;
          if (pending === 0) db.run('COMMIT', () => ok(res, { message: 'Values saved' }));
        }
      );
    }
  });
});

module.exports = router;
