module.exports = function errorHandler(err, req, res, next) {
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';
  return res.status(status).json({ ok: false, error: message });
};
