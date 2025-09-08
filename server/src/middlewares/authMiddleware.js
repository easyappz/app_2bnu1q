const jwt = require('jsonwebtoken');

// Hardcoded for this step; will be moved to a proper config later
const JWT_SECRET = 'REPLACE_WITH_STRONG_SECRET';

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ ok: false, error: 'Authorization header missing or malformed' });
    }

    const token = parts[1];
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = { id: payload.id, email: payload.email, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: error.message });
  }
};
