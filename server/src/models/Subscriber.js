const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  userId: { type: Number, index: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  chatId: { type: Number },
  inviteLink: { type: String },
  inviteExpireAt: { type: Date },
  status: { type: String, enum: ['active', 'expired', 'revoked', 'pending'], default: 'pending' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  createdAt: { type: Date, default: Date.now },
});

SubscriberSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Subscriber', SubscriberSchema);
