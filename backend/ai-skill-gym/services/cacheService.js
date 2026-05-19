/**
 * High-Speed Cache Service (Mocking Redis)
 * Used to offload token version checks from the database.
 */

const versionCache = new Map();

const getCachedVersion = async (userId) => {
  return versionCache.get(userId.toString());
};

const setCachedVersion = async (userId, version) => {
  versionCache.set(userId.toString(), version);
};

const invalidateCache = async (userId) => {
  versionCache.delete(userId.toString());
};

module.exports = {
  getCachedVersion,
  setCachedVersion,
  invalidateCache
};
