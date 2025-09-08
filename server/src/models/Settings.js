const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  botToken: { type: String, default: '' },
  providerToken: { type: String, default: '' },
  channelId: { type: String, default: '' },
  channelUsername: { type: String, default: '' },
  productName: { type: String, default: '' },
  priceCents: { type: Number, default: 0 },
  currency: { type: String, default: 'RUB' },
  description: { type: String, default: '' },
  webhookUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

SettingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Settings', SettingsSchema);
