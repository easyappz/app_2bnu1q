const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    botToken: { type: String, default: '' },
    providerToken: { type: String, default: '' },
    channelId: { type: String, default: '' },
    channelUsername: { type: String, default: '' },
    productName: { type: String, default: 'Access to channel' },
    priceCents: { type: Number, default: 0 },
    currency: { type: String, default: 'RUB' },
    description: { type: String, default: '' },
    webhookUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
