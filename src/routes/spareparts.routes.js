const express = require("express");
const db = require("../config/db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

/* GET ALL */
router.get("/", (req, res) => {
  db.all("SELECT * FROM spareparts", [], (err, rows) => {
    res.json({ ok: true, data: rows });
  });
});

/* CREATE */
router.post("/", requireAuth, (req, res) => {
  const { name, quantity, min_stock, location, note } = req.body;

  db.run(
    `INSERT INTO spareparts (name, quantity, min_stock, location, note)
     VALUES (?, ?, ?, ?, ?)`,
    [name, quantity, min_stock, location, note],
    function () {
      res.json({ ok: true, message: "Sparepart created", id: this.lastID });
    }
  );
});

/* UPDATE */
router.patch("/:id", requireAuth, (req, res) => {
  const { name, quantity, min_stock, location, note } = req.body;

  db.run(
    `UPDATE spareparts
     SET name=?, quantity=?, min_stock=?, location=?, note=?
     WHERE id=?`,
    [name, quantity, min_stock, location, note, req.params.id],
    function () {
      res.json({ ok: true, message: "Sparepart updated" });
    }
  );
});

/* DELETE */
router.delete("/:id", requireAuth, (req, res) => {
  db.run("DELETE FROM spareparts WHERE id=?", [req.params.id], function () {
    res.json({ ok: true, message: "Sparepart deleted" });
  });
});

module.exports = router;
