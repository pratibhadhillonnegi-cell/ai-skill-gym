const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET exercises by level
router.get('/level/:levelNumber', async (req, res) => {
  try {
    const exercises = await Exercise.find({ levelNumber: req.params.levelNumber });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET random exercise by level
router.get('/random/:levelNumber', async (req, res) => {
  try {
    const exercises = await Exercise.find({ levelNumber: req.params.levelNumber });
    if (exercises.length === 0) {
      return res.status(404).json({ error: 'No exercises found for this level' });
    }
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
    res.json(randomExercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single exercise
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE exercise (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, challenge, context, expectedOutcomes, topic, levelNumber } = req.body;

    if (!title || !challenge || !levelNumber) {
      return res.status(400).json({ error: 'Title, challenge, and levelNumber are required' });
    }

    const exercise = new Exercise({
      title,
      challenge,
      context,
      expectedOutcomes,
      topic,
      levelNumber: parseInt(levelNumber)
    });

    await exercise.save();
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE exercise (admin only)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, challenge, context, expectedOutcomes, topic, levelNumber } = req.body;

    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        title,
        challenge,
        context,
        expectedOutcomes,
        topic,
        levelNumber: levelNumber ? parseInt(levelNumber) : undefined
      },
      { new: true, runValidators: true }
    );

    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE exercise (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
