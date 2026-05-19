/**
 * Production Configuration
 * Handles production-specific setup including error tracking and monitoring
 */

// Optional: Initialize Sentry for error tracking
const initSentry = (app) => {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    try {
      const Sentry = require('@sentry/node');
      
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({
            request: true,
            serverName: true,
            transaction: 'path',
          }),
        ],
      });
      
      // Attach Sentry to Express
      app.use(Sentry.Handlers.requestHandler());
      app.use(Sentry.Handlers.errorHandler());
      
      console.log('✅ Sentry error tracking initialized');
      return true;
    } catch (err) {
      console.warn('⚠️ Sentry initialization failed:', err.message);
      return false;
    }
  }
  return false;
};

// Validate required environment variables
const validateEnvironment = () => {
  const required = ['JWT_SECRET', 'MONGODB_URI', 'NODE_ENV'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Environment variables validated');
};

// Log startup information
const logStartupInfo = (port) => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 AI Skill Gym - Production Environment');
  console.log('='.repeat(60));
  console.log(`📍 Port: ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'mock'}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Connected (MongoDB Atlas)' : 'Not configured'}`);
  console.log(`🔐 Security: Helmet enabled`);
  console.log(`📊 Rate Limiting: Enabled (5 requests/min per user)`);
  if (process.env.SENTRY_DSN) {
    console.log(`🔍 Error Tracking: Sentry enabled`);
  }
  console.log('='.repeat(60) + '\n');
};

module.exports = {
  initSentry,
  validateEnvironment,
  logStartupInfo,
};
