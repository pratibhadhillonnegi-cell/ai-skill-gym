const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validateRegistration, validateLogin } = require('../middleware/validator');
const { revokeToken } = require('../middleware/blacklistMiddleware');
const { invalidateCache, setCachedVersion } = require('../services/cacheService');

const router = express.Router();

function createAccessToken(user) {
  const jti = crypto.randomBytes(16).toString('hex');
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role, v: user.tokenVersion, jti },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
}

function createRefreshToken(user) {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Store hash in DB
  user.refreshTokenHash = hashed;
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return refreshToken;
}

// register new user
router.post('/register', loginLimiter, validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password required' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ error: 'Username or email already taken' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// login
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'username/email and password required' });
    }

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// forgot password - generate reset token
router.post('/forgot-password', loginLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // don't reveal whether email exists for security
      return res.json({ message: 'If email exists, password reset link will be sent' });
    }

    const resetToken = user.generateResetToken();
    await user.save();

    // in production, send via email; for now we'll return it
    // TODO: integrate email service (SendGrid, Mailgun, etc.)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    res.json({ message: 'Password reset link sent to email', resetLink }); // remove in production
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// reset password - verify token and update password
router.post('/reset-password', loginLimiter, async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'resetToken and newPassword required' });
    }

    // hash the provided token to find the user
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// refresh access token (Atomic Rotation)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // ATOMIC UPDATE: Only match if the hashed token is exactly what we have in DB
    // This prevents race condition replays
    const user = await User.findOneAndUpdate(
      {
        refreshTokenHash: hashed,
        refreshTokenExpires: { $gt: Date.now() }
      },
      {
        $set: { refreshTokenHash: null } // Mark as consumed immediately
      },
      { new: true }
    );

    if (!user) {
      logSecurityEvent('REFRESH_TOKEN_FAILURE', { tokenHash: hashed, reason: 'Invalid, expired, or replayed' });
      return res.status(401).json({ error: 'Invalid, expired, or already used refresh token' });
    }

    // Rotate and generate new session
    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    await user.save();

    // Update cache with new version (if changed)
    await setCachedVersion(user._id, user.tokenVersion);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get current user profile (authenticated)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetToken -resetTokenExpires -refreshTokenHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// logout
router.post('/logout', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    user.refreshTokenHash = null;
    user.refreshTokenExpires = null;
    await user.save();
    await invalidateCache(user._id);
  }

  // Revoke Access Token (Uniform Set Add)
  if (req.user.jti) {
    await revokeToken(req.user.jti);
  }

  res.json({ message: 'Logged out successfully' });
});

// update profile (authenticated)
router.patch('/me', auth, async (req, res) => {
  try {
    const { displayName, bio, password } = req.body;
    const user = await User.findById(req.user.id);

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;

    if (password) {
      user.password = password;
      // Global Session Revocation: Increment version to invalidate all current Access Tokens
      user.tokenVersion += 1;
      // Revoke refresh token as well
      user.refreshTokenHash = null;
      await invalidateCache(user._id);
    }

    await user.save();
    res.json({ user, message: password ? 'Profile updated. Please re-login.' : 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
