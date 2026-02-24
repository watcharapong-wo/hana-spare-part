module.exports = function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role === "admin") return next();

    if (req.user.role !== role) {
      return res.status(403).json({
        ok: false,
        message: "Permission denied"
      });
    }

    next();
  };
};
