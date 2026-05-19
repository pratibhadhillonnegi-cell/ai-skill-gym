# 📋 Production Deployment Guide

## Quick Start to Production (10 minutes)

### Step 1: Prepare Your Environment Variables

1. Generate JWT Secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Get MongoDB Connection String:
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster (M0)
   - Get connection string in format:
     ```
     mongodb+srv://username:password@cluster.mongodb.net/ai-skill-gym
     ```

3. Get OpenAI API Key (optional but recommended):
   - Sign up at [OpenAI Platform](https://platform.openai.com)
   - Create API key at https://platform.openai.com/api-keys
   - Key starts with `sk-`

### Step 2: Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Dashboard → New → Web Service
   - Select your `ai-skill-gym` repository
   - Build Command: `cd backend/ai-skill-gym && npm install`
   - Start Command: `cd backend/ai-skill-gym && npm start`
   - Plan: **Free**

3. **Add Environment Variables**
   
   In Render dashboard, add these variables:
   
   | Variable | Value | Secret? |
   |----------|-------|---------|
   | `NODE_ENV` | `production` | No |
   | `PORT` | `4000` | No |
   | `JWT_SECRET` | [Generated from Step 1] | **Yes** |
   | `MONGODB_URI` | [From MongoDB Atlas] | **Yes** |
   | `AI_PROVIDER` | `openai` (or `mock`) | No |
   | `OPENAI_API_KEY` | [From OpenAI] | **Yes** |
   | `OPENAI_MODEL` | `gpt-4o-mini` | No |
   | `FRONTEND_URL` | `https://ai-skill-gym-backend.onrender.com` | No |

4. **Deploy**
   - Click **Create Web Service**
   - Wait 2-3 minutes for build
   - Your app is live! 🎉

### Step 3: Test Your Deployment

```bash
# Test health endpoint
curl https://ai-skill-gym-backend.onrender.com/api/health

# Should return:
# {"status":"Server running","timestamp":"...","environment":"production"}
```

### Step 4: Use Your App

1. Open the URL in your browser
2. Register a new account
3. Select a skill level
4. Submit a prompt and get AI critique!

---

## Full Production Checklist

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for:
- ✅ Detailed setup instructions
- ✅ Security configuration
- ✅ Monitoring setup
- ✅ Custom domain configuration
- ✅ Troubleshooting guide

---

## Environment Variables Reference

### Required Variables

**`NODE_ENV`** (production)
- Controls app behavior
- Must be `production` for live deployment

**`PORT`** (4000)
- Port to listen on
- Render assigns automatically; keep as 4000

**`MONGODB_URI`** (MongoDB connection)
- Database connection string
- Format: `mongodb+srv://user:pass@host/database`
- Must be marked as **Secret** in Render

**`JWT_SECRET`** (32+ character random string)
- Used to sign authentication tokens
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Must be marked as **Secret** in Render

### AI Provider Variables

**`AI_PROVIDER`** (Required)
- Options: `openai`, `ollama`, `anthropic`, `mock`
- Default: `mock` (instant responses, no API calls)

**If using OpenAI:**
- `OPENAI_API_KEY`: Get from https://platform.openai.com/api-keys
- `OPENAI_MODEL`: `gpt-4o-mini` (recommended), `gpt-3.5-turbo`, or `gpt-4`

**If using Ollama:**
- Requires local Ollama server running
- Run: `ollama run llama3` in separate terminal

### Optional Variables

**`FRONTEND_URL`** (for CORS)
- URL where your frontend is hosted
- Default: backend URL

**`SENTRY_DSN`** (for error tracking)
- Sentry project DSN
- Get from https://sentry.io
- Optional but recommended for production

---

## Common Issues & Solutions

### "Build failed: npm install error"
- **Cause**: Missing or broken dependency
- **Solution**: Check `package.json` syntax, verify internet connection

### "Cannot connect to database"
- **Cause**: MongoDB URI incorrect or IP not whitelisted
- **Solution**: 
  1. Verify URI format
  2. In MongoDB Atlas: Network Access → Add current IP (or use 0.0.0.0)

### "OpenAI API errors"
- **Cause**: Invalid API key or insufficient balance
- **Solution**:
  1. Verify API key is correct
  2. Check usage at https://platform.openai.com/usage
  3. Set spending limits in dashboard

### "App loads but no AI critiques"
- **Cause**: AI provider not configured or failed
- **Solution**:
  1. Check `AI_PROVIDER` environment variable
  2. Verify API keys in Render dashboard
  3. Check Render logs for error messages

---

## Monitoring Your App

### Check Render Logs

1. Go to your service on Render dashboard
2. Click **Logs**
3. See all server output and errors in real-time

### Monitor Performance

1. Go to service metrics
2. Watch CPU, memory, and network usage
3. Check response times

### Set Up Alerts

- **Free tier**: Check logs daily
- **Paid tier**: Enable Render notifications (email on errors)
- **Optional**: Set up Sentry for error tracking

---

## Scaling to Production

### When You Outgrow Free Tier

If your app is too slow or hitting rate limits:

1. **Upgrade Render Plan**
   - Free: 0.50 USD/month (sleeps after 15 min)
   - Starter: 7 USD/month (always running)
   - Standard: 12+ USD/month (more resources)

2. **Optimize Database**
   - Upgrade MongoDB to shared cluster (M2: 9 USD/month)
   - Add indexes to frequently queried fields

3. **Increase Rate Limits**
   - Modify `rates/submissions.js` if needed
   - Allow more requests per minute

4. **Add Caching**
   - Cache exercise lists
   - Cache user profiles

---

## Next Steps

After successful deployment:

1. ✅ **Share with Users**: Give them the live URL
2. ✅ **Collect Feedback**: Ask users to test and report issues
3. ✅ **Monitor Logs**: Check Render logs daily for errors
4. ✅ **Setup Monitoring**: (Optional) Add Sentry for error tracking
5. ✅ **Phase 2**: Add more features (achievements, social features)

---

## Deploy Updates

To update your live app:

1. Make changes locally
2. Commit and push to GitHub
   ```bash
   git add .
   git commit -m "Update feature description"
   git push origin main
   ```
3. Render automatically redeploys
4. Wait 1-2 minutes for build completion
5. Test at your live URL

---

## Support & Help

- 📚 [Render Documentation](https://render.com/docs)
- 🤖 [OpenAI Documentation](https://platform.openai.com/docs)
- 🗄️ [MongoDB Documentation](https://docs.mongodb.com)
- 🐛 Check Render logs for error messages
- 💬 Review [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for troubleshooting
