const express = require('express');
const { registerAdmin, login } = require('@src/controllers/authController');
const { getSettings, updateSettings } = require('@src/controllers/settingsController');
const authMiddleware = require('@src/middlewares/authMiddleware');
const telegramController = require('@src/controllers/telegramController');

const router = express.Router();

// Root info
router.get('/', async (req, res) => {
  try {
    return res.status(200).json({ ok: true, message: 'API root' });
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

// Auth routes
router.post('/auth/register-admin', registerAdmin);
router.post('/auth/login', login);

// Settings routes (protected)
router.get('/settings', authMiddleware, getSettings);
router.put('/settings', authMiddleware, updateSettings);

// Telegram webhook and management
router.post('/telegram/webhook', telegramController.webhook);
router.post('/telegram/set-webhook', authMiddleware, telegramController.setWebhook);
router.post('/telegram/test-send', authMiddleware, telegramController.testSend);

module.exports = router;
