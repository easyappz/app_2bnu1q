const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    chatId: { type: String, required: true },
    username: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },

    telegramPaymentChargeId: { type: String, required: true },
    providerPaymentChargeId: { type: String, required: true },

    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    payload: { type: String, required: true },

    status: { type: String, enum: ['paid'], default: 'paid' }
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
