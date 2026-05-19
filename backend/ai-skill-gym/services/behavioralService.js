/**
 * RESILIENT RISK ENGINE (v1.1)
 * Models distributed inconsistency and probabilistic trust.
 */

const userHistory = new Map(); // userId -> { timestamps[], lastScore, consensusState }

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

const computeRiskScore = async (userId, req) => {
  const now = Date.now();
  const history = userHistory.get(userId) || { timestamps: [], consensusState: 'STABLE' };
  
  // 1. Feature Extraction (Normalized)
  history.timestamps = history.timestamps.filter(t => now - t < 60000);
  history.timestamps.push(now);
  
  const V = Math.min(1, history.timestamps.length / 30);
  let B = 0.5; // Default neutral burstiness
  if (history.timestamps.length > 3) {
    const intervals = Array.from({length: history.timestamps.length - 1}, (_, i) => history.timestamps[i+1] - history.timestamps[i]);
    const mean = intervals.reduce((a, b) => a + b) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    B = 1 - Math.min(1, Math.sqrt(variance) / 500);
  }

  // 2. Distributed Consistency Check
  // In production, this compares regional Redis timestamps.
  const isStale = Math.random() > 0.95; // Simulating 5% partition/drift
  const state = isStale ? 'INCONSISTENT' : 'STABLE';

  // 3. Probabilistic Trust (Bayesian Prior)
  const prior = history.timestamps.length > 100 ? 0.1 : 0.4; // Older sessions have lower abuse prior

  // 4. RESILIENT FORMULA: S_risk = sigmoid( Σ(w_i * x_i) - β )
  // If INCONSISTENT, we use a conservative bias (+1.0)
  const bias = state === 'INCONSISTENT' ? 2.0 : 3.0;
  const z = (4.0 * V + 2.5 * B + (prior * 10)) - bias;
  const S_risk = sigmoid(z) * 100;
  
  history.consensusState = state;
  userHistory.set(userId, history);

  return { 
    score: Math.round(S_risk),
    state,
    confidence: isStale ? 0.6 : 0.95,
    signals: { V, B, prior }
  };
};

module.exports = { computeRiskScore };
