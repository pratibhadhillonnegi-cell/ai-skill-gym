const express = require('express');
const User = require('../models/User');
const Submission = require('../models/Submission');
const auth = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validator');

const router = express.Router();

// get leaderboard - top users by average score
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const users = await User.find({ totalSubmissions: { $gt: 0 } })
      .select('username displayName totalSubmissions averageScore createdAt')
      .sort({ averageScore: -1, totalSubmissions: -1 })
      .limit(limit);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get public user profile
router.get('/:userId', validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username displayName bio totalSubmissions averageScore completedExercises createdAt')
      .populate('completedExercises', 'title levelNumber');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's submissions with exercise details
    const submissions = await Submission.find({ userId: req.params.userId })
      .populate('exerciseId', 'title topic levelNumber')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalSubmissions: user.totalSubmissions,
        averageScore: user.averageScore,
        createdAt: user.createdAt
      },
      submissions: submissions.map(sub => ({
        _id: sub._id,
        score: sub.score,
        userPrompt: sub.userPrompt,
        improvedPrompt: sub.improvedPrompt,
        critique: sub.critique,
        explanation: sub.explanation,
        createdAt: sub.createdAt,
        exercise: sub.exerciseId ? {
          title: sub.exerciseId.title,
          topic: sub.exerciseId.topic,
          levelNumber: sub.exerciseId.levelNumber
        } : null
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get user's submission history (authenticated)
router.get('/:userId/submissions', auth, validateObjectId('userId'), async (req, res) => {
  try {
    // users can only view their own submission history or admins can view anyone
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const submissions = await Submission.find({ userId: req.params.userId })
      .populate('exerciseId', 'title levelNumber challenge')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get user stats (authenticated)
router.get('/:userId/stats', auth, validateObjectId('userId'), async (req, res) => {
  try {
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findById(req.params.userId).select(
      'username displayName totalSubmissions totalScore averageScore completedExercises'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // get breakdown by exercise level
    const submissions = await Submission.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.params.userId) } },
      { $group: { _id: null, avgScore: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);

    res.json({
      user: {
        username: user.username,
        displayName: user.displayName,
        totalSubmissions: user.totalSubmissions,
        totalScore: user.totalScore,
        averageScore: user.averageScore,
        exercisesCompleted: user.completedExercises.length
      },
      stats: submissions[0] || { avgScore: 0, count: 0 }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
