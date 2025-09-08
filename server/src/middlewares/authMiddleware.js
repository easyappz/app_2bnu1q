const { verifyJwt } = require('@src/utils/jwt');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers['authorization'];
    if (!header) {
      return res.status(401).json({ ok: false, error: 'Authorization header is missing' });
    }

    let token = header;
    if (typeof header === 'string' && header.toLowerCase().startsWith('bearer ')) {
      token = header.slice(7);
    }

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ ok: false, error: 'Invalid Authorization header format' });
    }

    const payload = verifyJwt(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: error.message });
  }
};
