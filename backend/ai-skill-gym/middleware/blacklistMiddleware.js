/**
 * Token Revocation Set (Mocking Redis Set)
 * Uses high-speed jti-based lookups for uniform auth paths.
 */

const revokedJtis = new Set();

const isBlacklisted = async (jti) => {
  if (!jti) return true; // Deny if jti is missing
  return revokedJtis.has(jti);
};

const revokeToken = async (jti) => {
  if (jti) revokedJtis.add(jti);
};

module.exports = { isBlacklisted, revokeToken };
