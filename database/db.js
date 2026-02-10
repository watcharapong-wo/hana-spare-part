const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, 'it_spareparts.db');

const native = new Database(dbPath);
native.pragma('foreign_keys = ON');

function normalizeParams(params) {
  if (params === undefined) return [];
  if (Array.isArray(params)) return params;
  return [params];
}

// Adapter ให้โค้ดเดิม (sqlite3 callback style) ใช้งานได้
const db = {
  run(sql, params, cb) {
    try {
      const info = native.prepare(sql).run(normalizeParams(params));
      if (typeof cb === 'function') {
        cb.call({ lastID: info.lastInsertRowid, changes: info.changes }, null);
      }
      return info;
    } catch (err) {
      if (typeof cb === 'function') cb(err);
      else throw err;
    }
  },

  get(sql, params, cb) {
    try {
      const row = native.prepare(sql).get(normalizeParams(params));
      if (typeof cb === 'function') cb(null, row);
      return row;
    } catch (err) {
      if (typeof cb === 'function') cb(err);
      else throw err;
    }
  },

  all(sql, params, cb) {
    try {
      const rows = native.prepare(sql).all(normalizeParams(params));
      if (typeof cb === 'function') cb(null, rows);
      return rows;
    } catch (err) {
      if (typeof cb === 'function') cb(err);
      else throw err;
    }
  },

  serialize(fn) {
    if (typeof fn === 'function') fn();
  },

  prepare(sql) {
    const stmt = native.prepare(sql);
    return {
      run: (...args) => stmt.run(...args),
      get: (...args) => stmt.get(...args),
      all: (...args) => stmt.all(...args),
      finalize: (cb) => { if (cb) cb(); }
    };
  },

  close(cb) {
    try {
      native.close();
      if (cb) cb(null);
    } catch (err) {
      if (cb) cb(err);
      else throw err;
    }
  }
};

module.exports = db;
