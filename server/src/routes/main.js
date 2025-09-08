const express = require('express');

const router = express.Router();

// Root info
router.get('/', async (req, res) => {
  try {
    return res.status(200).json({ ok: true, message: 'API root. Stub routes are active.' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// GET /api/status
router.get('/status', async (req, res) => {
  try {
    return res.status(200).json({ ok: true, status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

function makeStubRouter(name) {
  const r = express.Router();
  r.all('*', async (req, res) => {
    try {
      return res.status(200).json({ ok: true, message: `${name} route stub` });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
  });
  return r;
}

// Subrouters (controllers will be attached later via @src/controllers)
router.use('/auth', makeStubRouter('auth'));
router.use('/settings', makeStubRouter('settings'));
router.use('/payments', makeStubRouter('payments'));
router.use('/subscribers', makeStubRouter('subscribers'));
router.use('/stats', makeStubRouter('stats'));
router.use('/telegram', makeStubRouter('telegram'));

module.exports = router;
