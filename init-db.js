const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./hana.db");

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");

  db.run(`
    CREATE TABLE IF NOT EXISTS Categories (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS SpareParts (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      PartName TEXT NOT NULL,
      CategoryId INTEGER,
      Price REAL,
      Quantity INTEGER,
      CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
    );
  `);

  console.log("Database created successfully.");
});

db.close();
