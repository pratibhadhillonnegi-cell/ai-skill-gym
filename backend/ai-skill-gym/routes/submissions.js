const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const { generateCritique } = require('../services/aiService');
const auth = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// simple per-user rate limiter for critique submissions
const critiqueLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
  message: { error: 'Too many requests, please slow down.' }
});

// POST submit prompt for critique (authenticated + rate-limited)
router.post('/critique', auth, critiqueLimiter, async (req, res) => {
  try {
    const { exerciseId, userPrompt } = req.body;

    if (!exerciseId || !userPrompt) {
      return res.status(400).json({ error: 'exerciseId and userPrompt required' });
    }

    // Get exercise context
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Generate critique using AI
    const aiResult = await generateCritique(userPrompt, exercise.challenge);

    // Save submission with user reference
    const submission = new Submission({
      exerciseId,
      userPrompt,
      critique: aiResult.critique,
      improvedPrompt: aiResult.improvedPrompt,
      explanation: aiResult.explanation,
      score: aiResult.score,
      userId: req.user.id
    });

    await submission.save();

    // update user stats
    const user = await User.findById(req.user.id);
    user.recordSubmission(aiResult.score, exerciseId);
    await user.save();

    res.json({
      submissionId: submission._id,
      critique: aiResult.critique,
      improvedPrompt: aiResult.improvedPrompt,
      explanation: aiResult.explanation,
      score: aiResult.score,
      userStats: {
        totalSubmissions: user.totalSubmissions,
        averageScore: user.averageScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET submission history
// history - returns logged-in user's submissions for an exercise
router.get('/history/:exerciseId', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({
      exerciseId: req.params.exerciseId,
      userId: req.user.id
    }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
