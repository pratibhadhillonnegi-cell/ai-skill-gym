require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { evaluatePrompt } = require('./trainer');

// Routes
const levelRoutes = require('./routes/levels');
const exerciseRoutes = require('./routes/exercises');
const submissionRoutes = require('./routes/submissions');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const { globalLimiter, trainingLimiter } = require('./middleware/rateLimiter');
const { sanitize, validateJSON } = require('./middleware/sanitizer');
const { validateTraining } = require('./middleware/validator');
const auth = require('./middleware/authMiddleware');
const abuseGovernor = require('./middleware/abuseGovernor');
const policyEngine = require('./middleware/policyEngine');
const { checkQuota } = require('./middleware/quotaMiddleware');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware with strict CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // 'unsafe-inline' is temporarily needed for some frontend scripts, but restricted to 'self'
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.groq.com", "https://google.serper.dev"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(globalLimiter);

// CORS configuration - allow frontend URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware with size limit (10kb)
app.use(express.json({ limit: '10kb' }));
app.use(validateJSON); // Handle malformed JSON
app.use(sanitize);    // Deep NoSQL & XSS sanitization
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/search', searchRoutes);

// Train endpoint (Authenticated with Daily Quota)
app.post('/train', auth, abuseGovernor, policyEngine, trainingLimiter, validateTraining, checkQuota, async (req, res) => {
  const { challenge, userPrompt } = req.body;

  try {
    const result = await evaluatePrompt(challenge, userPrompt);

    // Increment usage count and weighted cost on success
    if (req.dbUser) {
      // Simple cost model: 1 unit per 100 characters of total prompt volume
      const costUnits = Math.ceil((challenge.length + userPrompt.length) / 100);
      req.dbUser.dailyUsageCount += 1;
      req.dbUser.totalCostUnits += costUnits;
      await req.dbUser.save();
    }

    res.json(result);
  } catch (err) {
    console.error('Train endpoint error:', err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({ error: message });
});

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Temporarily skip DB connection for testing - MongoDB Atlas auth needs fixing
    // await connectDB();
    console.log('⚠️  Skipping MongoDB connection (Atlas auth issue)');
    console.log('💡 Server will run on port 4000 without database');
    app.listen(PORT, () => {
      console.log(`\n🚀 AI Skill Gym Backend running on port ${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 AI Provider: ${process.env.AI_PROVIDER || 'mock'}`);
      console.log(`\n✅ API ready at http://localhost:${PORT}`);
      console.log(`🎯 /train endpoint available`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();