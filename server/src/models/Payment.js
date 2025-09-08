const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  telegramPaymentChargeId: { type: String },
  providerPaymentChargeId: { type: String },
  userId: { type: Number }, // Telegram user id
  chatId: { type: Number },
  amountCents: { type: Number },
  currency: { type: String, default: 'RUB' },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'canceled'], default: 'pending' },
  payload: { type: String },
  createdAt: { type: Date, default: Date.now },
});

PaymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
