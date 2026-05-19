const express = require('express');
const router = express.Router();
const Level = require('../models/Level');

// GET all levels
router.get('/', async (req, res) => {
  try {
    const levels = await Level.find().sort({ levelNumber: 1 });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single level
router.get('/:levelNumber', async (req, res) => {
  try {
    const level = await Level.findOne({ levelNumber: req.params.levelNumber });
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json(level);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
