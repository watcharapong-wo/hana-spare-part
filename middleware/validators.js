const { fail } = require('../utils/respond');

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isNonNegInt(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0;
}

function isPosInt(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
}

// Validate create sparepart
function validateCreateSparepart(req, res, next) {
  const { name, quantity, min_stock } = req.body;

  if (!isNonEmptyString(name)) {
    return fail(res, 'name is required', 400);
  }
  if (quantity === undefined || !isNonNegInt(quantity)) {
    return fail(res, 'quantity must be an integer >= 0', 400);
  }
  if (min_stock !== undefined && !isNonNegInt(min_stock)) {
    return fail(res, 'min_stock must be an integer >= 0', 400);
  }
  next();
}

// Validate update sparepart (ทุก field เป็น optional แต่ถ้ามีต้องถูกชนิด)
function validateUpdateSparepart(req, res, next) {
  const { name, quantity, min_stock } = req.body;

  if (name !== undefined && !isNonEmptyString(name)) {
    return fail(res, 'name must be a non-empty string', 400);
  }
  if (quantity !== undefined && !isNonNegInt(quantity)) {
    return fail(res, 'quantity must be an integer >= 0', 400);
  }
  if (min_stock !== undefined && !isNonNegInt(min_stock)) {
    return fail(res, 'min_stock must be an integer >= 0', 400);
  }
  next();
}

// Validate issue/return transaction
function validateTransaction(req, res, next) {
  const { sparepart_id, qty } = req.body;

  if (sparepart_id === undefined || !isPosInt(sparepart_id)) {
    return fail(res, 'sparepart_id must be an integer > 0', 400);
  }
  if (qty === undefined || !isPosInt(qty)) {
    return fail(res, 'qty must be an integer > 0', 400);
  }
  next();
}

module.exports = {
  validateCreateSparepart,
  validateUpdateSparepart,
  validateTransaction,
};
