# 📚 Advanced Setup Guide

This guide covers deploying AI Skill Gym to production, integrating real LLM providers, monitoring, and scaling.

## Table of Contents

1. [OpenAI Integration](#openai-integration)
2. [Alternative LLM Providers](#alternative-providers)
3. [Monitoring & Analytics](#monitoring)
4. [Render Deployment](#render-deployment)
5. [Separate Frontend Deployment](#frontend-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Security & Secrets Management](#security)

---

## OpenAI Integration

### Configuration

1. **Get an API key from OpenAI**
   - Sign up at [https://platform.openai.com](https://platform.openai.com)
   - Go to API keys → Create new secret key
   - Copy the key (starts with `sk-`)

2. **Update `.env` in `backend/ai-skill-gym/`**
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-actual-key-here
   OPENAI_MODEL=gpt-4o-mini    # or gpt-3.5-turbo, gpt-4, etc.
   ```

3. **Update `package.json`**
   The `openai` package is already installed. No action needed.

4. **Test locally**
   ```bash
   cd backend/ai-skill-gym
   npm start
   ```
   Submit a prompt in the web UI and verify it's using OpenAI.

### Cost Management

- **gpt-4o-mini** is cheap (~$0.00015 per 1K input tokens).
- **gpt-3.5-turbo** is even cheaper but lower quality.
- Monitor usage at [https://platform.openai.com/usage](https://platform.openai.com/usage).
- Set spending limits in the OpenAI dashboard to avoid surprises.

### Rate Limiting

The backend already includes rate limiting (5 requests/minute per user). You can adjust in `routes/submissions.js`:
```javascript
const critiqueLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,               // 5 requests
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
});
```

---

## Alternative LLM Providers

### Using Anthropic Claude

1. **Install package**
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. **Update `services/aiService.js`**
   ```javascript
   if (AI_PROVIDER === 'anthropic') {
     const Anthropic = require('@anthropic-ai/sdk');
     const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

     const response = await anthropic.messages.create({
       model: 'claude-3-5-sonnet-20241022',
       max_tokens: 500,
       messages: [{ role: 'user', content: prompt }],
     });
     content = response.content[0].text;
   }
   ```

3. **Set environment variables**
   ```env
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### Using Cohere

1. **Install package**
   ```bash
   npm install cohere-ai
   ```

2. **Similar setup** – add another branch in `generateCritique()`.

### Keeping Ollama as Fallback

Set a cron job to monitor availability:
```javascript
// Fallback to mock if neither service responds
if (provider_unavailable) {
  console.warn('Falling back to mock responses');
  AI_PROVIDER = 'mock';
}
```

---

## Monitoring & Analytics

### Option 1: Sentry (Error Tracking)

1. **Create account** at [https://sentry.io](https://sentry.io)
2. **Install package**
   ```bash
   npm install @sentry/node
   ```

3. **Initialize in `server.js`**
   ```javascript
   const Sentry = require('@sentry/node');

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV || 'development',
     tracesSampleRate: 0.1,
   });

   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.errorHandler());
   ```

4. **Set environment variable**
   ```env
   SENTRY_DSN=https://key@sentry.io/project_id
   NODE_ENV=production
   ```

5. **Errors will automatically be captured** and visible in Sentry dashboard.

### Option 2: Google Analytics (Frontend)

1. **Install package**
   ```bash
   npm install react-ga4
   ```

2. **Initialize in `frontend/src/index.js`**
   ```javascript
   import ReactGA from 'react-ga4';

   ReactGA.initialize('G-XXXXXXXXXX');
   ReactGA.pageview(window.location.pathname);
   ```

3. **Track custom events**
   ```javascript
   ReactGA.event({
     category: 'Exercise',
     action: 'Submit',
     label: 'Level 2',
   });
   ```

### Option 3: LogRocket (Session Recording)

1. **Create account** at [https://logrocket.com](https://logrocket.com)
2. **Install package**
   ```bash
   npm install logrocket
   ```

3. **Initialize in `frontend/src/index.js`**
   ```javascript
   import LogRocket from 'logrocket';
   LogRocket.init('app-id');
   ```

4. Replay user sessions, track errors, and monitor performance.

---

## Render Deployment

### Prerequisites

- GitHub repo with all changes committed
- MongoDB Atlas account (or use Render's PostgreSQL)
- OpenAI API key (or switch to `AI_PROVIDER=mock`)

### Step-by-Step

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add auth, profiles, and monitoring"
   git push origin main
   ```

2. **On Render.com**
   - Click **New** → **Web Service**
   - Select repository and `main` branch
   - Name: `ai-skill-gym-backend`

3. **Build Settings**
   ```
   Build Command: cd backend/ai-skill-gym && npm install && npm run build
   Start Command: cd backend/ai-skill-gym && npm start
   ```
   > Note: `npm run build` is optional if you don't have a build step; remove if not needed.

4. **Environment Variables** (in Render dashboard)
   ```
   PORT=4000
   NODE_ENV=production
   
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-skill-gym
   JWT_SECRET=<generate-a-long-random-string>
   
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   
   SENTRY_DSN=https://key@sentry.io/project_id
   
   FRONTEND_URL=https://your-render-url.onrender.com
   ```

5. **Deploy**
   - Click **Create Web Service**
   - Render builds and deploys automatically
   - Service URL will be `https://ai-skill-gym-backend.onrender.com`

6. **Test**
   ```bash
   curl https://ai-skill-gym-backend.onrender.com/api/health
   ```
   Should return `{ "status": "Server running" }`.

### Custom Domain

1. Go to service Settings → Custom Domain
2. Add your domain (e.g., `gym.example.com`)
3. Follow DNS instructions to point your domain to Render

### Auto-Deploy on Push

- Render automatically redeploys when you push to your branch
- No additional setup needed

---

## Separate Frontend Deployment

### Option 1: Deploy Frontend on Vercel

1. **Build the frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   This outputs static files to `build/`.

2. **Create `.vercelignore` in `frontend/`**
   ```
   node_modules
   .git
   ```

3. **Deploy**
   - Go to [vercel.com](https://vercel.com)
   - Import project
   - Select `frontend` directory as root
   - Set environment variable:
     ```
     REACT_APP_API_URL=https://your-render-backend.onrender.com
     ```
   - Deploy

4. **Update frontend API calls**
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

   // Use in all fetch calls
   fetch(`${API_URL}/api/auth/login`, ...)
   ```

### Option 2: Deploy on Netlify

1. **Same build process as Vercel**
2. **On Netlify.com**
   - New site from Git
   - Select repo
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`
   - Deploy

### Option 3: Keep Frontend with Backend

If you prefer single deployment (what we have now):
- Backend serves frontend from `public/` (via `express.static`)
- Everything lives on same URL: `https://ai-skill-gym-backend.onrender.com`
- Simpler, no CORS issues, but backend must include frontend build

To use this approach:
```bash
cd frontend
npm run build
# Copy build output to backend/ai-skill-gym/public/
```

---

## CI/CD Pipeline

### Automated Tests Before Deploy

1. **Add test script to `backend/package.json`**
   ```json
   "scripts": {
     "test": "jest",
     "start": "node server.js"
   }
   ```

2. **Create `.github/workflows/deploy.yml`**
   ```yaml
   name: Test & Deploy
   on: [push, pull_request]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: cd backend/ai-skill-gym && npm install && npm test
         - run: cd frontend && npm install && npm test

     deploy:
       needs: test
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/main'
       steps:
         - uses: actions/checkout@v2
         - name: Deploy to Render
           run: |
             # Render auto-deploys on push; you can add webhook triggers here
   ```

3. **Push – GitHub Actions will:**
   - Run tests
   - Deploy to Render if tests pass
   - Notify on Slack/email if failures

---

## Security & Secrets Management

### Best Practices

1. **Never commit secrets**
   - Use `.env.local` (gitignore'd)
   - Use CI/CD platform's secret manager (Render, GitHub Secrets)

2. **Environment Isolation**
   ```bash
   NODE_ENV=production  # Set this on production
   ```

3. **JWT Secret**
   - Generate a strong random string:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Store in Render's environment variables

4. **Database Credentials**
   - Use MongoDB Atlas IP whitelist
   - Don't share connection strings
   - Rotate credentials periodically

5. **API Keys**
   - Rotate OpenAI/Anthropic keys every 90 days
   - Monitor usage for suspicious activity
   - Use separate keys for dev/prod

6. **HTTPS Everywhere**
   - Render provides free SSL
   - Verify certificate is valid
   - Never send credentials over HTTP

### Database Backups

- **MongoDB Atlas:** Automatic backups (free tier: 7-day retention)
- **Enable backup** in cluster settings
- **Export data regularly:**
  ```bash
  mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/ai-skill-gym"
  ```

---

## Monitoring in Production

### Health Checks

1. **Render** automatically pings `/api/health`
   - Restarts container if unhealthy
   - Configure in Service Settings → Health Check

2. **Add custom health check**
   ```javascript
   app.get('/api/health', async (req, res) => {
     try {
       await mongoose.connection.db.admin().ping();
       res.json({ status: 'ok', timestamp: new Date() });
     } catch {
       res.status(500).json({ status: 'error' });
     }
   });
   ```

### Uptime Monitoring

- **Uptime Robot** (free at [uptimerobot.com](https://uptimerobot.com))
- Ping your service periodically
- Alert you if down

### Cost Monitoring

- **MongoDB Atlas:** View current usage
- **OpenAI:** Set spending alerts
- **Render:** View logs for performance bottlenecks

---

## Next Steps

- ✅ Deploy backend to Render
- ✅ Add real LLM provider (OpenAI)
- ✅ Setup monitoring (Sentry/LogRocket)
- 🔄 Deploy frontend separately (Vercel/Netlify)
- 🔄 Setup CI/CD
- 🔄 Configure custom domain
- 🔄 Add email service (SendGrid for password resets)
- 🔄 Build mobile app (React Native)
- 🔄 Add payment system (Stripe)

---

**Questions?** Check the main README or open an issue on GitHub.
