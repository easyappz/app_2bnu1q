module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  return res.status(status).json({ ok: false, error: message });
};
