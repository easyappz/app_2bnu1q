const mongoose = require('mongoose');

const ProcessedUpdateSchema = new mongoose.Schema({
  updateId: { type: Number, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ProcessedUpdate', ProcessedUpdateSchema);
