# 🚀 Production Launch Checklist

Complete this checklist before deploying to production.

---

## Pre-Deployment Setup

### Backend Configuration

- [ ] **Environment Variables Set**
  - [ ] `NODE_ENV=production`
  - [ ] `JWT_SECRET` (generated: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  - [ ] `MONGODB_URI` (MongoDB Atlas connection string)
  - [ ] `AI_PROVIDER` (openai, ollama, anthropic, or mock)
  - [ ] `PORT=4000`

### AI Provider Setup

- [ ] **Choose AI Provider**
  - [ ] **Option A: OpenAI** (recommended for production)
    - [ ] Create account at https://platform.openai.com
    - [ ] Get API key from https://platform.openai.com/api-keys
    - [ ] Set `OPENAI_API_KEY=sk-...`
    - [ ] Set `OPENAI_MODEL=gpt-4o-mini` (or preferred model)
    - [ ] Set spending limits in OpenAI dashboard
  - [ ] **Option B: Ollama** (free, local)
    - [ ] Install Ollama from https://ollama.ai
    - [ ] Run: `ollama run llama3` in separate terminal
    - [ ] Set `AI_PROVIDER=ollama`
  - [ ] **Option C: Mock** (testing only)
    - [ ] Set `AI_PROVIDER=mock`

### Database Setup

- [ ] **MongoDB Atlas**
  - [ ] Sign up at https://www.mongodb.com/cloud/atlas
  - [ ] Create free cluster (M0)
  - [ ] Create database user with strong password
  - [ ] Whitelist IP address (or use 0.0.0.0 for any)
  - [ ] Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/ai-skill-gym`
  - [ ] Seed database: `npm run seed` (runs `scripts/seedDatabase.js`)

### Security

- [ ] **Generate JWT Secret**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  - [ ] Store securely in Render dashboard (mark as secret)
  - [ ] Never commit to git

- [ ] **Review Security Headers** (Helmet enabled in `server.js`)
  - [ ] CORS: Configured for allowed origins
  - [ ] HTTPS: Enforced on Render (automatic)
  - [ ] Rate Limiting: 5 requests/minute per user

### Optional: Monitoring & Error Tracking

- [ ] **Sentry Setup** (optional but recommended)
  - [ ] Create account at https://sentry.io
  - [ ] Create Node.js project
  - [ ] Get DSN from project settings
  - [ ] Set `SENTRY_DSN=https://key@sentry.io/project_id`
  - [ ] Run `npm install @sentry/node`

- [ ] **Google Analytics** (optional, for frontend)
  - [ ] Create Google Analytics account
  - [ ] Get Measurement ID (G-XXXXXXXXX)
  - [ ] Add to frontend `index.js`: `ReactGA.initialize('G-XXXXX')`

---

## Deployment to Render

### Prerequisites

- [ ] Code committed and pushed to GitHub
- [ ] GitHub repository is public or Render has access
- [ ] All environment variables prepared

### Step-by-Step Deployment

1. **Create Render Account**
   - [ ] Sign up at https://render.com
   - [ ] Connect GitHub account

2. **Create Web Service**
   - [ ] Go to Dashboard → New → Web Service
   - [ ] Select your `ai-skill-gym` repository
   - [ ] Branch: `main`
   - [ ] Name: `ai-skill-gym-backend`
   - [ ] Build Command: `cd backend/ai-skill-gym && npm install`
   - [ ] Start Command: `cd backend/ai-skill-gym && npm start`
   - [ ] Plan: **Free** (0.50 USD/month, auto-sleeps after 15 min inactivity)

3. **Add Environment Variables**
   ```
   NODE_ENV: production
   PORT: 4000
   JWT_SECRET: [your-generated-secret]
   MONGODB_URI: [your-mongodb-connection-string]
   AI_PROVIDER: openai
   OPENAI_API_KEY: sk-...
   OPENAI_MODEL: gpt-4o-mini
   FRONTEND_URL: https://ai-skill-gym-backend.onrender.com
   SENTRY_DSN: [optional]
   ```
   - [ ] Mark sensitive variables as **Encrypted**

4. **Deploy**
   - [ ] Click **Create Web Service**
   - [ ] Wait for build to complete (~2-3 minutes)
   - [ ] Check service URL: `https://ai-skill-gym-backend.onrender.com`

---

## Post-Deployment Testing

### Health Checks

- [ ] **Server Health**
  ```bash
  curl https://ai-skill-gym-backend.onrender.com/api/health
  # Should return: {"status":"Server running",...}
  ```

- [ ] **Database Connection**
  ```bash
  curl https://ai-skill-gym-backend.onrender.com/api/levels
  # Should return list of levels (or 401 if auth required)
  ```

### Authentication Flow

- [ ] **Register**: Sign up with new user account
- [ ] **Login**: Log in with credentials
- [ ] **Profile**: View user profile and stats
- [ ] **Token**: Verify JWT token in local storage

### Exercise Workflow

- [ ] **Levels**: Display all 4 skill levels
- [ ] **Exercise**: Load random exercise from level 1
- [ ] **Submission**: Submit a prompt and get critique
- [ ] **Score**: Verify submission is saved and scored

### Leaderboard

- [ ] **Leaderboard**: View global leaderboard
- [ ] **Stats**: Verify top users display correctly
- [ ] **Sort**: Works by submissions, average, or total score

### Error Tracking (if Sentry enabled)

- [ ] **Sentry Dashboard**: Check for any error reports
- [ ] **Test Error**: Submit bad request and verify captured

---

## Custom Domain (Optional)

### Setup Custom Domain

1. **Buy Domain**
   - [ ] Purchase domain from Namecheap, GoDaddy, or Cloudflare
   - [ ] Example: `gym.example.com`

2. **Configure Render**
   - [ ] Go to Service Settings → Custom Domain
   - [ ] Add your domain
   - [ ] Copy DNS records provided

3. **Update DNS**
   - [ ] Log into domain registrar
   - [ ] Add CNAME record pointing to Render URL
   - [ ] Wait for DNS propagation (5 minutes - 24 hours)

4. **Verify**
   - [ ] Test: `https://gym.example.com`
   - [ ] Should show padlock 🔒 (HTTPS/SSL certificate auto-enabled)

---

## Scaling & Performance

### Monitor Performance

- [ ] **Render Dashboard**
  - [ ] Check CPU usage (should be low)
  - [ ] Check memory usage (should be < 256MB for free tier)
  - [ ] Check build logs for errors

- [ ] **Response Time**
  ```bash
  curl -w "\nTime: %{time_total}s\n" https://ai-skill-gym-backend.onrender.com/api/health
  # Should be < 1 second
  ```

### Optimization

- [ ] **If slow (response > 2s)**
  - [ ] Check MongoDB connection (network latency)
  - [ ] Check Render logs for errors
  - [ ] Consider upgrading to paid plan

- [ ] **If hitting rate limits**
  - [ ] Increase `max` in rate limiter
  - [ ] Inform users of limits

---

## Maintenance & Monitoring

### Ongoing Tasks

- [ ] **Daily**: Check Render logs for errors
- [ ] **Weekly**: Review Sentry for new issues
- [ ] **Monthly**: Monitor OpenAI API usage and costs
- [ ] **Monthly**: Check MongoDB storage usage

### Update Dependencies

```bash
cd backend/ai-skill-gym
npm outdated  # List outdated packages
npm update    # Update packages
npm audit     # Check for security vulnerabilities
```

### Rollback Procedure

If deployment fails:
1. Go to Render Dashboard
2. Click Service Settings → Deploy History
3. Select previous successful deployment
4. Click **Redeploy**

---

## Success Indicators ✅

Your deployment is successful when:

- ✅ Health check returns 200 OK
- ✅ Users can register and login
- ✅ Exercises load and submit successfully
- ✅ Critiques are generated (from AI provider)
- ✅ Leaderboard displays scores
- ✅ No errors in Render logs
- ✅ Response time < 1 second
- ✅ HTTPS certificate is valid (green padlock)

---

## Troubleshooting

### Common Issues

**Build Failed: npm install error**
- Check `package.json` syntax
- Verify all dependencies are published on npm
- Try deleting `package-lock.json` and rebuild

**Blank Page in Browser**
- Check frontend build (in `public/` folder)
- Verify API URL is correct in frontend code
- Check browser console for CORS errors

**Critiques Not Working**
- Verify `AI_PROVIDER` environment variable is set
- If using OpenAI, check API key is valid
- Review Render logs for API errors

**Database Connection Error**
- Verify `MONGODB_URI` is correct format
- Check IP whitelist in MongoDB Atlas (add 0.0.0.0)
- Verify database user password (no special chars in URI)

**Slow Responses**
- Check MongoDB query performance
- Use MongoDB Atlas monitoring tools
- Consider upgrading plan or optimizing queries

---

## Support

- 📚 Documentation: See [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced setup
- 🐛 Issues: Check Render logs at dashboard
- 📞 Help: https://render.com/docs/
