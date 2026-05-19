const express = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/authMiddleware');
const {
  searchGoogle,
  searchGoogleImages,
  searchGoogleNews,
  searchGoogleShopping,
  searchGoogleMaps,
  getSearchSuggestions
} = require('../services/googleSearchService');

const router = express.Router();

// Rate limiting for search endpoints (more restrictive than AI critiques)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
  message: {
    error: 'Too many search requests. Please wait before searching again.'
  }
});

// Apply rate limiting to all search routes
router.use(searchLimiter);

// All search routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/search/google
 * @desc Search Google and return structured results
 * @access Private
 */
router.get('/google', async (req, res) => {
  try {
    const { q: query, ...options } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter "q" is required'
      });
    }

    const results = await searchGoogle(query, options);

    res.json({
      success: true,
      query,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Google search error:', error);
    res.status(500).json({
      error: 'Failed to perform Google search',
      message: error.message
    });
  }
});

/**
 * @route GET /api/search/images
 * @desc Search Google Images
 * @access Private
 */
router.get('/images', async (req, res) => {
  try {
    const { q: query, ...options } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter "q" is required'
      });
    }

    const results = await searchGoogleImages(query, options);

    res.json({
      success: true,
      query,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Google images search error:', error);
    res.status(500).json({
      error: 'Failed to search Google Images',
      message: error.message
    });
  }
});

/**
 * @route GET /api/search/news
 * @desc Search Google News
 * @access Private
 */
router.get('/news', async (req, res) => {
  try {
    const { q: query, ...options } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter "q" is required'
      });
    }

    const results = await searchGoogleNews(query, options);

    res.json({
      success: true,
      query,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Google news search error:', error);
    res.status(500).json({
      error: 'Failed to search Google News',
      message: error.message
    });
  }
});

/**
 * @route GET /api/search/maps
 * @desc Search Google Maps/Local results
 * @access Private
 */
router.get('/maps', async (req, res) => {
  try {
    const { q: query, ...options } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter "q" is required'
      });
    }

    const results = await searchGoogleMaps(query, options);

    res.json({
      success: true,
      query,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Google maps search error:', error);
    res.status(500).json({
      error: 'Failed to search Google Maps',
      message: error.message
    });
  }
});

/**
 * @route GET /api/search/shopping
 * @desc Search Google Shopping results
 * @access Private
 */
router.get('/shopping', async (req, res) => {
  try {
    const { q: query, ...options } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter "q" is required'
      });
    }

    const results = await searchGoogleShopping(query, options);

    res.json({
      success: true,
      query,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Google shopping search error:', error);
    res.status(500).json({
      error: 'Failed to search Google Shopping',
      message: error.message
    });
  }
});

/**
 * @route GET /api/search/suggestions
 * @desc Get search suggestions/autocomplete
 * @access Private
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter "q" is required'
      });
    }

    const suggestions = await getSearchSuggestions(query);

    res.json({
      success: true,
      query,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get search suggestions',
      message: error.message
    });
  }
});

module.exports = router;
