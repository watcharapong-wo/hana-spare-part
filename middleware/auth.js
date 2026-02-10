const jwt = require('jsonwebtoken');
const { fail } = require('../utils/respond');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return fail(res, 'Unauthorized', 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username, role }
    next();
  } catch (e) {
    return fail(res, 'Invalid token', 401);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 'Unauthorized', 401);
    if (!roles.includes(req.user.role)) return fail(res, 'Forbidden', 403);
    next();
  };
}

module.exports = { requireAuth, requireRole };
