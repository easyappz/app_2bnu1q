const Settings = require('@src/models/Settings');

function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

async function ensureDefaultSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      botToken: '',
      providerToken: '',
      channelId: '',
      channelUsername: '',
      productName: 'Access to channel',
      priceCents: 0,
      currency: 'RUB',
      description: '',
      webhookUrl: ''
    });
  }
  return settings;
}

async function getSettings(req, res) {
  try {
    const settings = await ensureDefaultSettings();
    return res.status(200).json({ ok: true, data: settings });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

function validatePaymentFields(resulting) {
  const errors = [];

  if (!resulting || typeof resulting !== 'object') {
    return ['Invalid settings object'];
  }

  // providerToken
  if (typeof resulting.providerToken !== 'string' || !resulting.providerToken.trim()) {
    errors.push('providerToken is required and must be a non-empty string');
  }
  // productName
  if (typeof resulting.productName !== 'string' || !resulting.productName.trim()) {
    errors.push('productName is required and must be a non-empty string');
  }
  // priceCents
  if (typeof resulting.priceCents !== 'number' || !Number.isInteger(resulting.priceCents)) {
    errors.push('priceCents is required and must be an integer number');
  } else if (resulting.priceCents < 0) {
    errors.push('priceCents cannot be negative');
  }
  // currency
  if (typeof resulting.currency !== 'string' || !resulting.currency.trim()) {
    errors.push('currency is required and must be a non-empty string');
  } else if (resulting.currency !== 'RUB') {
    errors.push('currency must be RUB');
  }

  return errors;
}

async function updateSettings(req, res) {
  try {
    const allowedFields = [
      'botToken',
      'providerToken',
      'channelId',
      'channelUsername',
      'productName',
      'priceCents',
      'currency',
      'description',
      'webhookUrl'
    ];

    const body = req.body || {};

    const settings = await ensureDefaultSettings();

    const update = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        if (key === 'priceCents') {
          const n = Number(body[key]);
          if (!Number.isFinite(n)) {
            return res.status(400).json({ ok: false, error: 'priceCents must be a finite number' });
          }
          update[key] = Math.trunc(n);
        } else if (key === 'currency') {
          update[key] = sanitizeString(body[key]).toUpperCase();
        } else {
          update[key] = typeof body[key] === 'string' ? sanitizeString(body[key]) : body[key];
        }
      }
    }

    const resulting = { ...settings.toObject(), ...update };

    const paymentValidationErrors = validatePaymentFields(resulting);
    if (paymentValidationErrors.length > 0) {
      return res.status(400).json({ ok: false, error: paymentValidationErrors.join('; ') });
    }

    // Additional optional validations
    if (update.botToken !== undefined && typeof resulting.botToken !== 'string') {
      return res.status(400).json({ ok: false, error: 'botToken must be a string' });
    }
    if (
      resulting.channelId && typeof resulting.channelId !== 'string'
    ) {
      return res.status(400).json({ ok: false, error: 'channelId must be a string' });
    }
    if (
      resulting.channelUsername && typeof resulting.channelUsername !== 'string'
    ) {
      return res.status(400).json({ ok: false, error: 'channelUsername must be a string' });
    }

    // Apply update
    Object.assign(settings, update);
    await settings.save();

    return res.status(200).json({ ok: true, data: settings });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

module.exports = {
  getSettings,
  updateSettings
};
