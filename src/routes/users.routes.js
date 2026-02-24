const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/permission");

const router = express.Router();

/* GET ALL USERS */
router.get("/", requireAuth, requireRole("admin"), (req, res) => {
  db.all("SELECT id, username, full_name, role FROM users", [], (err, rows) => {
    res.json({ ok: true, data: rows });
  });
});

/* CREATE USER */
router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { username, password, full_name, role } = req.body;

  const hashed = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (username, password, full_name, role)
     VALUES (?, ?, ?, ?)`,
    [username, hashed, full_name, role],
    function (err) {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: "Username already exists"
        });
      }

      res.json({
        ok: true,
        message: "User created",
        id: this.lastID
      });
    }
  );
});

/* UPDATE USER */
router.patch("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const { full_name, role } = req.body;
  const id = req.params.id;

  db.run(
    `UPDATE users SET full_name=?, role=? WHERE id=?`,
    [full_name, role, id],
    function () {
      res.json({ ok: true, message: "User updated" });
    }
  );
});

/* DELETE USER */
router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  db.run("DELETE FROM users WHERE id=?", [req.params.id], function () {
    res.json({ ok: true, message: "User deleted" });
  });
});

module.exports = router;
