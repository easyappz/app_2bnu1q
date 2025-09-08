const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    chatId: { type: String, required: true },
    username: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },

    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'active' },

    inviteLink: { type: String, default: '' },
    inviteExpireAt: { type: Date, default: null },

    lastPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null }
  },
  { timestamps: true }
);

SubscriberSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', SubscriberSchema);
