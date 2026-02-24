require("dotenv").config();
require("./src/config/init");

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/users", require("./src/routes/users.routes"));
app.use("/api/spareparts", require("./src/routes/spareparts.routes"));
app.use("/api/transactions", require("./src/routes/transactions.routes"));

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: err?.message || String(err),
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
