const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

SubscriberSchema.index({ status: 1 });
SubscriberSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Subscriber', SubscriberSchema);
