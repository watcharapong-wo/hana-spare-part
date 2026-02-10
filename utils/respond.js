function ok(res, payload = {}, status = 200) {
  return res.status(status).json({ success: true, ...payload });
}

function fail(res, message, status = 400, details) {
  const body = { success: false, message };
  if (details !== undefined) body.details = details;
  return res.status(status).json(body);
}

module.exports = { ok, fail };
