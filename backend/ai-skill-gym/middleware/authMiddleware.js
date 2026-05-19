const jwt = require('jsonwebtoken');
const { getCachedVersion } = require('../services/cacheService');
const { isBlacklisted } = require('../middleware/blacklistMiddleware');

/**
 * IDENTITY GATE (Auth Layer)
 * Failure Domain: Identity Verification
 * Latency Budget: < 5ms
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization required' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const startTime = Date.now();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Identity Authority Check
    try {
      const version = await getCachedVersion(payload.id);
      if (version !== undefined && version !== payload.v) {
        return res.status(401).json({ error: 'Session invalidated' });
      }
      
      if (await isBlacklisted(payload.jti)) {
        return res.status(401).json({ error: 'Token revoked' });
      }
    } catch (cacheErr) {
      console.warn('Identity Cache Failure (Fail-Open):', cacheErr);
    }

    const latency = Date.now() - startTime;
    console.log(`[IDENTITY_GATE] User: ${payload.id}, Latency: ${latency}ms`);

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
