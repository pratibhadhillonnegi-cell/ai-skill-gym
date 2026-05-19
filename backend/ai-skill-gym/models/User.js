const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // profile
  displayName: { type: String, default: function() { return this.username; } },
  bio: { type: String, default: '' },
  
  // stats
  totalSubmissions: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  completedExercises: { type: [mongoose.Schema.Types.ObjectId], ref: 'Exercise', default: [] },
  
  // role-based access
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // economic security
  dailyUsageCount: { type: Number, default: 0 },
  lastUsageReset: { type: Date, default: Date.now },
  totalCostUnits: { type: Number, default: 0 }, // Weighted cost tracking
  
  // session management
  tokenVersion: { type: Number, default: 0 },
  refreshTokenHash: { type: String, default: null },
  refreshTokenExpires: { type: Date, default: null },
  
  // password reset
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// update updatedAt before saving
userSchema.pre('save', async function (next) {
  this.updatedAt = new Date();
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// instance method to compare plaintext password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// instance method to generate password reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  this.resetToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');
  this.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return resetToken; // return unhashed token to send via email
};

// instance method to update stats after a submission
userSchema.methods.recordSubmission = function (score, exerciseId) {
  this.totalSubmissions += 1;
  this.totalScore += score;
  this.averageScore = Math.round((this.totalScore / this.totalSubmissions) * 10) / 10;
  
  if (!this.completedExercises.includes(exerciseId)) {
    this.completedExercises.push(exerciseId);
  }
};

module.exports = mongoose.model('User', userSchema);
