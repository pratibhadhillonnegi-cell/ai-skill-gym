const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true,
    enum: [1, 2, 3, 4]
  },
  title: String,
  description: String,
  topics: [String]
});

module.exports = mongoose.model('Level', levelSchema);
