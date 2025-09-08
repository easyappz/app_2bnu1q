const jwt = require('jsonwebtoken');

// Do not move to .env as per project rules
const JWT_SECRET = 'EASYAPPZ_STRONG_JWT_SECRET_CHANGE_ME';

function signJwt(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...options });
}

function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  JWT_SECRET,
  signJwt,
  verifyJwt
};
