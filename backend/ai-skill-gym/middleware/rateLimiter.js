const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter for all endpoints
 * 100 requests per 15 minutes by default
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

/**
 * Stricter rate limiter for login-related routes
 * 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes'
  }
});

/**
 * Stricter rate limiter for expensive AI training routes
 * 10 requests per 15 minutes
 */
const trainingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Training limit exceeded. Please try again after 15 minutes'
  }
});

module.exports = {
  globalLimiter,
  loginLimiter,
  trainingLimiter
};
