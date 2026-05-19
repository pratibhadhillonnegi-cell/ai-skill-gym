const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  topic: String,
  title: String,
  description: String,
  challenge: String,
  context: String,
  expectedOutcomes: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
