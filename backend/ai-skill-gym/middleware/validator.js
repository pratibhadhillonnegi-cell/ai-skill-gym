/**
 * Common validation rules
 */

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const COMMON_PASSWORDS = [
  'password', 'password123', 'admin123', 'qwerty', '12345678', 'iloveyou', 'p@ssword', 'gym12345'
];

const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return res.status(400).json({ error: 'Password is too common. Please choose a more secure password.' });
  }

  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasNumber || !hasSpecial) {
    return res.status(400).json({ error: 'Password must contain at least one number and one special character' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || usernameOrEmail.length < 3) {
    return res.status(400).json({ error: 'Invalid username or email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  next();
};

const validateTraining = (req, res, next) => {
  const { challenge, userPrompt } = req.body;

  if (!challenge || typeof challenge !== 'string' || challenge.length > 2000) {
    return res.status(400).json({ error: 'Invalid challenge data' });
  }

  if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.length > 2000) {
    return res.status(400).json({ error: 'User prompt is too long or missing' });
  }

  next();
};

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ${paramName} format` });
    }
    next();
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateTraining,
  validateObjectId
};
