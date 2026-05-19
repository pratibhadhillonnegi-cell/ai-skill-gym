/**
 * POLICY ENGINE (v1.0)
 * Decouples risk scoring from operational decisions using context-aware rules.
 */

const getPolicyAction = (riskScore, endpoint) => {
  // Contextual Sensitivity: Training endpoint is higher risk
  const isSensitive = endpoint === '/train';
  
  if (riskScore >= 90) {
    return { action: 'BLOCK', reason: 'Critical threat signature detected' };
  }
  
  if (riskScore >= 70) {
    return { action: 'THROTTLE', reason: 'High-risk behavioral anomaly', backoff: '30s' };
  }
  
  if (riskScore >= 40 && isSensitive) {
    return { action: 'CHALLENGE', reason: 'Suspicious activity on sensitive endpoint' };
  }
  
  return { action: 'ALLOW' };
};

module.exports = async (req, res, next) => {
  if (!req.trustSignal) return next();

  const { score } = req.trustSignal;
  const policy = getPolicyAction(score, req.path);

  console.log(`[POLICY_ENGINE] Score: ${score}, Endpoint: ${req.path}, Action: ${policy.action}`);

  if (policy.action === 'BLOCK') {
    return res.status(403).json({ error: policy.reason, action: 'BLOCK' });
  }

  if (policy.action === 'THROTTLE') {
    res.set('Retry-After', policy.backoff);
    return res.status(429).json({ error: policy.reason, action: 'THROTTLE', backoff: policy.backoff });
  }

  req.policyDecision = policy;
  next();
};
