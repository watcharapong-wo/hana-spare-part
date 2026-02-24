const express = require("express");
const db = require("../config/db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

/* GET ALL */
router.get("/", requireAuth, (req, res) => {
  db.all("SELECT * FROM transactions", [], (err, rows) => {
    res.json({ ok: true, data: rows });
  });
});

/* ISSUE (เบิก) */
router.post("/issue", requireAuth, (req, res) => {
  const { sparepart_id, qty, requester } = req.body;

  db.get(
    "SELECT quantity FROM spareparts WHERE id=?",
    [sparepart_id],
    (err, part) => {
      if (!part || part.quantity < qty) {
        return res.status(400).json({
          ok: false,
          message: "Not enough stock"
        });
      }

      db.run(
        "UPDATE spareparts SET quantity = quantity - ? WHERE id=?",
        [qty, sparepart_id]
      );

      db.run(
        `INSERT INTO transactions (sparepart_id, type, qty, requester)
         VALUES (?, 'issue', ?, ?)`,
        [sparepart_id, qty, requester],
        function () {
          res.json({ ok: true, message: "Issued successfully" });
        }
      );
    }
  );
});

/* RETURN (คืน) */
router.post("/return", requireAuth, (req, res) => {
  const { sparepart_id, qty, requester } = req.body;

  db.run(
    "UPDATE spareparts SET quantity = quantity + ? WHERE id=?",
    [qty, sparepart_id]
  );

  db.run(
    `INSERT INTO transactions (sparepart_id, type, qty, requester)
     VALUES (?, 'return', ?, ?)`,
    [sparepart_id, qty, requester],
    function () {
      res.json({ ok: true, message: "Returned successfully" });
    }
  );
});

module.exports = router;
