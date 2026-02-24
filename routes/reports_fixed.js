const express = require('express');
const router = express.Router();
const db = require('../database/db');
const ExcelJS = require('exceljs');

// GET /reports/export/recent-transactions.xlsx?limit=100
router.get('/export/recent-transactions.xlsx', (req, res) => {
  const limit = Math.min(Number(req.query.limit || 100), 1000);
  const sql = `
    SELECT
      t.id, t.type, t.qty, t.created_at, t.remark,
      s.name AS sparepart_name,
      u.username AS created_by_username,
      u.full_name AS created_by_full_name
    FROM transactions t
    JOIN spareparts s ON s.id = t.sparepart_id
    LEFT JOIN users u ON u.id = t.created_by
    ORDER BY t.id DESC
    LIMIT ?
  `;
  db.all(sql, [limit], async (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.creator = 'IT Spareparts System';
    const ws = wb.addWorksheet('Recent Transactions');
    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Qty', key: 'qty', width: 8 },
      { header: 'Sparepart', key: 'sparepart_name', width: 30 },
      { header: 'Created At', key: 'created_at', width: 20 },
      { header: 'By (username)', key: 'created_by_username', width: 18 },
      { header: 'By (full name)', key: 'created_by_full_name', width: 22 },
      { header: 'Remark', key: 'remark', width: 30 },
    ];
    ws.getRow(1).font = { bold: true };
    rows.forEach(r => ws.addRow(r));
    ws.autoFilter = { from: 'A1', to: 'H1' };
    const filename = `recent-transactions_${new Date().toISOString().slice(0,10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await wb.xlsx.write(res);
    res.end();
  });
});


// GET /reports/stock-summary
router.get('/stock-summary', (req, res) => {
  const summarySql = `
    SELECT
      COUNT(*) AS total_items,
      COALESCE(SUM(quantity), 0) AS total_quantity,
      COALESCE(SUM(CASE WHEN quantity <= min_stock THEN 1 ELSE 0 END), 0) AS low_stock_items,
      COALESCE(SUM(CASE WHEN quantity > min_stock AND quantity <= min_stock * 1.5 THEN 1 ELSE 0 END), 0) AS warning_items,
      COALESCE(SUM(CASE WHEN quantity > min_stock * 1.5 THEN 1 ELSE 0 END), 0) AS good_items
    FROM spareparts
  `;

  const lowStockSql = `
    SELECT *
    FROM spareparts
    WHERE quantity <= min_stock
    ORDER BY (min_stock - quantity) DESC, id DESC
    LIMIT 50
  `;

  db.get(summarySql, [], (err, summary) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });

    db.all(lowStockSql, [], (err2, lowStockRows) => {
      if (err2) return res.status(500).json({ message: 'DB error', error: err2.message });

      const statusData = {
        critical: summary.low_stock_items || 0,
        warning: summary.warning_items || 0,
        good: summary.good_items || 0
      };

      res.json({
        message: 'Stock summary',
        summary: {
          total_items: summary.total_items,
          total_quantity: summary.total_quantity,
          low_stock_items: summary.low_stock_items
        },
        status: statusData,
        low_stock: lowStockRows,
      });
    });
  });
});

// GET /reports/recent-transactions?limit=20
router.get('/recent-transactions', (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 200);

  db.all(
    `SELECT
        t.*,
        s.name AS sparepart_name,
        u.username AS created_by_username,
        u.full_name AS created_by_full_name
     FROM transactions t
     JOIN spareparts s ON s.id = t.sparepart_id
     LEFT JOIN users u ON u.id = t.created_by
     ORDER BY t.id DESC
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });
      res.json({ message: 'Recent transactions', data: rows });
    }
  );
});

// ...existing code...
router.get('/spareparts/:id/history', (req, res) => {
  const id = Number(req.params.id);
  const limit = Math.min(Number(req.query.limit || 50), 500);

  db.get('SELECT * FROM spareparts WHERE id = ?', [id], (err, part) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    if (!part) return res.status(404).json({ message: 'Sparepart not found' });

    db.all(
      `SELECT
          t.*,
          u.username AS created_by_username,
          u.full_name AS created_by_full_name
       FROM transactions t
       LEFT JOIN users u ON u.id = t.created_by
       WHERE t.sparepart_id = ?
       ORDER BY t.id DESC
       LIMIT ?`,
      [id, limit],
      (err2, rows) => {
        if (err2) return res.status(500).json({ message: 'DB error', error: err2.message });

        const summarySql = `
          SELECT
            COALESCE(SUM(CASE WHEN type='ISSUE' THEN qty ELSE 0 END), 0) AS total_issue,
            COALESCE(SUM(CASE WHEN type='RETURN' THEN qty ELSE 0 END), 0) AS total_return,
            COUNT(*) AS total_transactions
          FROM transactions
          WHERE sparepart_id = ?
        `;

        db.get(summarySql, [id], (err3, summary) => {
          if (err3) return res.status(500).json({ message: 'DB error', error: err3.message });

          res.json({
            message: 'Sparepart history',
            sparepart: part,
            summary,
            data: rows,
          });
        });
      }
    );
  });
});

// GET /reports/export/stock-summary.xlsx
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/export/stock-summary.xlsx', requireAuth, requireRole('admin', 'coadmin'), (req, res) => {
  console.log('EXPORT STOCK SUMMARY route called by user:', req.user && req.user.username, 'role:', req.user && req.user.role);
  console.log('DEBUG: /reports/export/stock-summary.xlsx route HIT at', new Date().toISOString());
  const summarySql = `
    SELECT
      COUNT(*) AS total_items,
      COALESCE(SUM(quantity), 0) AS total_quantity,
      COALESCE(SUM(CASE WHEN quantity <= min_stock THEN 1 ELSE 0 END), 0) AS low_stock_items
    FROM spareparts
  `;

  const lowStockSql = `
    SELECT *
    FROM spareparts
    WHERE quantity <= min_stock
    ORDER BY (min_stock - quantity) DESC, id DESC
    LIMIT 500
  `;


  db.get(summarySql, [], async (err, summary) => {
    if (err) {
      console.error('Export summarySql error:', err);
      return res.status(500).json({ message: 'DB error', error: err.message });
    }


    db.all(lowStockSql, [], async (err2, lowRows) => {
      if (err2) {
        console.error('Export lowStockSql error:', err2);
        return res.status(500).json({ message: 'DB error', error: err2.message });
      }

      // ดึง recent transactions
      const recentSql = `
        SELECT
          t.id, t.type, t.qty, t.created_at, t.remark,
          s.name AS sparepart_name,
          u.username AS created_by_username,
          u.full_name AS created_by_full_name
        FROM transactions t
        JOIN spareparts s ON s.id = t.sparepart_id
        LEFT JOIN users u ON u.id = t.created_by
        ORDER BY t.id DESC
        LIMIT 50
      `;

      db.all(recentSql, [], async (err3, recentRows) => {
        if (err3) {
          console.error('Export recentSql error:', err3);
          return res.status(500).json({ message: 'DB error', error: err3.message });
        }

        const wb = new ExcelJS.Workbook();
        wb.creator = 'IT Spareparts System';

        const s1 = wb.addWorksheet('Summary');
        s1.columns = [
          { header: 'Metric', key: 'metric', width: 25 },
          { header: 'Value', key: 'value', width: 15 },
        ];
        s1.addRow({ metric: 'Total items', value: summary.total_items });
        s1.addRow({ metric: 'Total quantity', value: summary.total_quantity });
        s1.addRow({ metric: 'Low stock items', value: summary.low_stock_items });
        s1.addRow({ metric: 'Export time', value: new Date().toISOString() });
        s1.getRow(1).font = { bold: true };

        const s2 = wb.addWorksheet('Low Stock');
        s2.columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Qty', key: 'quantity', width: 10 },
          { header: 'Min Stock', key: 'min_stock', width: 12 },
          { header: 'Unit', key: 'unit', width: 10 },
          { header: 'Location', key: 'location', width: 20 },
          { header: 'Category', key: 'category', width: 18 },
          { header: 'Part No', key: 'part_no', width: 20 },
          { header: 'Updated At', key: 'updated_at', width: 20 },
        ];
        s2.getRow(1).font = { bold: true };
        lowRows.forEach(r => s2.addRow(r));
        s2.autoFilter = { from: 'A1', to: 'I1' };

        // Recent Transactions Sheet
        const s3 = wb.addWorksheet('Recent Transactions');
        s3.columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Type', key: 'type', width: 10 },
          { header: 'Qty', key: 'qty', width: 8 },
          { header: 'Sparepart', key: 'sparepart_name', width: 30 },
          { header: 'Created At', key: 'created_at', width: 20 },
          { header: 'By (username)', key: 'created_by_username', width: 18 },
          { header: 'By (full name)', key: 'created_by_full_name', width: 22 },
          { header: 'Remark', key: 'remark', width: 30 },
        ];
        s3.getRow(1).font = { bold: true };
        recentRows.forEach(r => s3.addRow(r));
        s3.autoFilter = { from: 'A1', to: 'H1' };

        const filename = `stock-summary_${new Date().toISOString().slice(0,10)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        try {
          await wb.xlsx.write(res);
          res.end();
        } catch (e) {
          // แสดงรายละเอียด error ทั้งหมดใน terminal
          console.error('Export ExcelJS write error:', e);
          if (e && e.stack) console.error('Stack:', e.stack);
          res.status(500).json({ message: 'Export failed', error: e.message, stack: e.stack });
        }
      });
    });
  });
});

// GET /reports/usage-summary?from=2026-02-01&to=2026-02-29&limit=50
router.get('/usage-summary', (req, res) => {
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';
  const limit = Math.min(Number(req.query.limit || 50), 500);

  db.all(
    `SELECT
        s.id AS sparepart_id,
        s.name AS sparepart_name,
        s.category,
        s.location,
        SUM(CASE WHEN t.type='ISSUE' THEN t.qty ELSE 0 END) AS issued_qty,
        SUM(CASE WHEN t.type='RETURN' THEN t.qty ELSE 0 END) AS returned_qty,
        (SUM(CASE WHEN t.type='ISSUE' THEN t.qty ELSE 0 END)
         - SUM(CASE WHEN t.type='RETURN' THEN t.qty ELSE 0 END)) AS net_used
     FROM transactions t
     JOIN spareparts s ON s.id = t.sparepart_id
     WHERE date(t.created_at) BETWEEN date(?) AND date(?)
     GROUP BY s.id, s.name, s.category, s.location
     HAVING net_used > 0
     ORDER BY net_used DESC
     LIMIT ?`,
    [from, to, limit],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });
      res.json({ message: 'Usage summary', range: { from, to }, data: rows });
    }
  );
});

// GET /reports/export/usage-summary.xlsx?from=2026-02-01&to=2026-02-29
router.get('/export/usage-summary.xlsx', (req, res) => {
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';
  const limit = Math.min(Number(req.query.limit || 500), 5000);

  db.all(
    `SELECT
        s.id AS sparepart_id,
        s.name AS sparepart_name,
        s.category,
        s.location,
        SUM(CASE WHEN t.type='ISSUE' THEN t.qty ELSE 0 END) AS issued_qty,
        SUM(CASE WHEN t.type='RETURN' THEN t.qty ELSE 0 END) AS returned_qty,
        (SUM(CASE WHEN t.type='ISSUE' THEN t.qty ELSE 0 END)
         - SUM(CASE WHEN t.type='RETURN' THEN t.qty ELSE 0 END)) AS net_used
     FROM transactions t
     JOIN spareparts s ON s.id = t.sparepart_id
     WHERE date(t.created_at) BETWEEN date(?) AND date(?)
     GROUP BY s.id, s.name, s.category, s.location
     HAVING net_used > 0
     ORDER BY net_used DESC
     LIMIT ?`,
    [from, to, limit],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err.message });

      const wb = new ExcelJS.Workbook();
      wb.creator = 'IT Spareparts System';

      const ws = wb.addWorksheet('Usage Report');
      ws.columns = [
        { header: 'Sparepart ID', key: 'sparepart_id', width: 12 },
        { header: 'Name', key: 'sparepart_name', width: 30 },
        { header: 'Category', key: 'category', width: 18 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Issued Qty', key: 'issued_qty', width: 12 },
        { header: 'Returned Qty', key: 'returned_qty', width: 12 },
        { header: 'Net Used', key: 'net_used', width: 12 },
      ];
      ws.getRow(1).font = { bold: true };

      rows.forEach(r => ws.addRow(r));
      ws.autoFilter = { from: 'A1', to: 'G1' };

      const filename = `usage-report_${from}_${to}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await wb.xlsx.write(res);
      res.end();
    }
  );
});

module.exports = router;
