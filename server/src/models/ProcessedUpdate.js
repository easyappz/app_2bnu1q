const mongoose = require('mongoose');

const ProcessedUpdateSchema = new mongoose.Schema(
  {
    updateId: { type: Number, required: true, unique: true },
    type: { type: String, default: '' }
  },
  { timestamps: true }
);

ProcessedUpdateSchema.index({ updateId: 1 }, { unique: true });

module.exports = mongoose.model('ProcessedUpdate', ProcessedUpdateSchema);
