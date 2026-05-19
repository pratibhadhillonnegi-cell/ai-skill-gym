/**
 * Basic input sanitizer and validator
 */

const sanitizeValue = (val) => {
  if (typeof val !== 'string') return val;
  // Trim and remove any HTML-like tags for basic XSS protection
  return val.trim().replace(/<[^>]*>?/gm, '');
};

const deepSanitizeMongo = (obj) => {
  if (obj instanceof Array) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = deepSanitizeMongo(obj[i]);
    }
  } else if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      // Prevent NoSQL Injection by stripping $ and . from keys
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        obj[key] = deepSanitizeMongo(obj[key]);
      }
    });
  } else if (typeof obj === 'string') {
    return sanitizeValue(obj);
  }
  return obj;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = deepSanitizeMongo(req.body);
  if (req.query) req.query = deepSanitizeMongo(req.query);
  if (req.params) req.params = deepSanitizeMongo(req.params);
  next();
};

/**
 * Rejects requests that are malformed or missing required structure
 */
const validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }
  next();
};

module.exports = {
  sanitize,
  validateJSON
};
