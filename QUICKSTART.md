# 🚀 Quick Setup Guide

Get AI Skill Gym running locally in 5 minutes.

## Option 1: Using Mock Data (No LLM Required)

Fastest way to test the UI and auth flow.

```bash
cd backend/ai-skill-gym

# Set env vars for mock provider
set JWT_SECRET=test-secret
set AI_PROVIDER=mock

# Start server
npm install
npm start
```

Open **http://localhost:5000** and:
1. Register a new account
2. Select a level
3. Write a prompt
4. See mock critique (instant, no API calls)

---

## Option 2: Using Ollama (Free, Local AI)

For realistic AI results without paying.

### Prerequisites
- Download Ollama: https://ollama.ai
- ~5GB disk space for a model

### Steps

1. **Start Ollama in a separate terminal**
   ```bash
   ollama run llama3
   ```
   This downloads and starts the `llama3` model on `http://localhost:11434`.

2. **In another terminal, start the backend**
   ```bash
   cd backend/ai-skill-gym

   set JWT_SECRET=test-secret
   set AI_PROVIDER=ollama
   set OLLAMA_MODEL=llama3

   npm install
   npm start
   ```

3. **Open http://localhost:5000**
   - Register and try exercises
   - AI responses come from local Ollama (slower but free)

---

## Option 3: Using OpenAI (Best Quality, Paid)

For production-quality critiques.

### Prerequisites
- OpenAI account with API key
- Credit card for billing

### Steps

1. **Create OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Start the backend**
   ```bash
   cd backend/ai-skill-gym

   set JWT_SECRET=test-secret
   set AI_PROVIDER=openai
   set OPENAI_API_KEY=sk-your-key-here
   set OPENAI_MODEL=gpt-4o-mini

   npm install
   npm start
   ```

3. **Open http://localhost:5000**
   - Register and enjoy premium AI critiques

---

## Testing the Full Flow

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": { "id": "...", "username": "alice", "email": "alice@example.com" }
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "alice",
    "password": "password123"
  }'
```

### 3. Get a Random Exercise
```bash
curl http://localhost:5000/api/exercises/random/1
```

### 4. Submit a Prompt (with token)
```bash
curl -X POST http://localhost:5000/api/submissions/critique \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d '{
    "exerciseId": "<exercise-id>",
    "userPrompt": "Write a haiku about programming"
  }'
```

### 5. Check Leaderboard
```bash
curl http://localhost:5000/api/users/leaderboard
```

### 6. View Your Profile
```bash
curl http://localhost:5000/api/users/<user-id>/stats \
  -H "Authorization: Bearer <token>"
```

---

## Seed Database with Sample Data

Populate the database with all 4 levels and exercises:

```bash
npm run seed
```

This creates:
- 4 levels
- ~20 exercises across levels
- (Optional) Admin user if you set these env vars:
  ```bash
  set SEED_ADMIN_USERNAME=admin
  set SEED_ADMIN_EMAIL=admin@example.com
  set SEED_ADMIN_PASSWORD=admin123
  npm run seed
  ```

---

## Frontend

The backend serves the frontend automatically.  
Open **http://localhost:5000** in your browser.

Features:
- Register/Login
- Select level & exercise
- Submit prompt
- View critique + improved version
- Check your profile & stats
- See leaderboard

---

## Troubleshooting

**"Cannot connect to MongoDB"**
- Check `MONGODB_URI` is correct
- Ensure MongoDB/Atlas is running
- Create cluster at https://mongodb.com/cloud/atlas

**"Ollama timeout"**
- Ollama process isn't running: `ollama run llama3`
- Wrong model: check `OLLAMA_MODEL` matches what you pulled

**"OpenAI rate limit"**
- You're making >3 requests/second
- Wait a moment and retry
- Or upgrade your OpenAI plan

**"Port 5000 already in use"**
- Change `PORT` env var: `set PORT=6000`
- Or kill the process using the port

---

## Next Steps

1. ✅ Local testing complete?
2. 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
3. 🚀 Deploy to Render
4. 🔗 Configure custom domain
5. 📊 Setup monitoring (Sentry, analytics)
6. 💳 Add billing (if offering premium features)

---

**Have questions?** Check README.md or open an issue.
