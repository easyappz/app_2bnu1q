const bcrypt = require('bcryptjs');
const Admin = require('@src/models/Admin');
const { signJwt } = require('@src/utils/jwt');

async function registerAdmin(req, res) {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ ok: false, error: 'Email is required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters long' });
    }

    const existingCount = await Admin.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({ ok: false, error: 'Admin already exists. Registration is allowed only once.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await Admin.create({ email: normalizedEmail, passwordHash, role: 'admin' });

    return res.status(201).json({
      ok: true,
      user: { email: admin.email, role: admin.role }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string') {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }

    const token = signJwt({ id: admin._id.toString(), email: admin.email, role: admin.role });

    return res.status(200).json({
      ok: true,
      token,
      user: { email: admin.email, role: admin.role }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

module.exports = {
  registerAdmin,
  login
};
