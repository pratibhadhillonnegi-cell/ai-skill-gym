const { computeRiskScore } = require('../services/behavioralService');

/**
 * ABUSE GOVERNOR (Behavioral Intelligence Layer)
 * Decoupled failure domain for risk signaling and throttling.
 * Latency Budget: < 10ms
 */
module.exports = async (req, res, next) => {
  if (!req.user) return next();

  try {
    const startTime = Date.now();
    const risk = await computeRiskScore(req.user.id, req);
    const latency = Date.now() - startTime;

    // Log metrics for empirical proof
    console.log(`[ABUSE_GOVERNOR] User: ${req.user.id}, S_risk: ${risk.score}, Latency: ${latency}ms`);

    // Threshold Logic: S_risk >= 70 triggers immediate rejection
    if (risk.score >= 70) {
      return res.status(429).json({ 
        error: 'Critical behavioral anomaly detected.', 
        riskScore: risk.score 
      });
    }

    // Attach trust signal for downstream consumption
    req.trustSignal = {
      score: risk.score,
      isHighRisk: risk.score >= 40,
      latency
    };

    next();
  } catch (err) {
    console.error('Abuse Governor Failure (Fail-Open):', err);
    next(); // Fail-open to preserve availability
  }
};
