const User = require('../models/User');
const { logSecurityEvent } = require('../services/securityLogger');

/**
 * Enforces daily usage quotas for AI endpoints
 * Default: 50 requests per day per user
 */
const checkQuota = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required for training' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const lastReset = new Date(user.lastUsageReset);

    // Reset count if it's a new day
    if (now.toDateString() !== lastReset.toDateString()) {
      user.dailyUsageCount = 0; // Legacy count
      user.totalCostUnits = 0;
      user.lastUsageReset = now;
    }

    // BEHAVIORAL ANALYSIS: Adaptive Throttling
    // In a real system, 'trustScore' would be calculated based on velocity, 
    // account age, and prompt injection history.
    let trustScore = user.totalSubmissions > 10 ? 1.0 : 0.5; // New users are untrusted
    if (user.dailyUsageCount > 10 && user.totalSubmissions < 2) trustScore = 0.2; // Likely bot

    const BASE_LIMIT = 1000;
    const ADAPTIVE_LIMIT = Math.floor(BASE_LIMIT * trustScore);

    if (user.totalCostUnits >= ADAPTIVE_LIMIT && user.role !== 'admin') {
      logSecurityEvent('QUOTA_EXCEEDED', {
        userId: user._id,
        currentUnits: user.totalCostUnits,
        limitApplied: ADAPTIVE_LIMIT,
        trustScore
      });
      return res.status(429).json({
        error: 'Daily compute quota exceeded',
        message: trustScore < 0.5 ? 'Account restricted due to anomalous behavior.' : 'Daily limit reached.'
      });
    }

    // Attach user to request for later use (incrementing count after successful AI call)
    req.dbUser = user;
    next();
  } catch (err) {
    console.error('Quota check error:', err);
    res.status(500).json({ error: 'Internal server error during quota check' });
  }
};

module.exports = { checkQuota };
