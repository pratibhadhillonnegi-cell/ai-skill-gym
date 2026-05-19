# AI Skill Gym 🎓

Train your prompt IQ with interactive AI evaluations.

## Features

- **4 Progressive Levels** – from basics to advanced optimization
- **Personalized Challenges** – random exercises from the curriculum
- **AI Critique** – powered by OpenAI, Anthropic, or local Ollama
- **User Profiles** – track your progress and view stats
- **Leaderboard** – compete with other learners globally
- **JWT Authentication** – secure user accounts
- **Password Reset** – email-based password recovery
- **Role-Based Access** – support for admin users

## Structure

```
ai-skill-gym/
├── backend/
│   ├── server.js           # Express server
│   ├── trainer.js          # AI evaluation logic
│   ├── package.json        # Dependencies
│   └── .env                # Configuration
└── frontend/
    └── index.html          # Single-page app (HTML/CSS/JS)
```

## Quick Start

### 1. Install Prerequisites

- **Node.js**: https://nodejs.org/ (LTS version)
- **Ollama**: https://ollama.ai (free local AI)

### 2. Start Ollama

In a terminal:
```bash
ollama run llama3
```

This will:
- Download llama3 model (if not already)
- Start API on `http://localhost:11434`
- Keep running in background

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Start Backend Server

```bash
npm start
```

Server runs on `http://localhost:4000`

> **Seeding data**
> To populate the database with levels/exercises, run:
> ```bash
> npm run seed
> ```
> You can also pre-create an admin user by exporting the following variables
> before running the seed script:
> ```bash
> export SEED_ADMIN_USERNAME=admin
> export SEED_ADMIN_EMAIL=admin@example.com
> export SEED_ADMIN_PASSWORD=secret
> ```

### 5. Open Frontend

Open in browser: **http://localhost:4000** (after you register/login)

## How It Works

1. **Select Level** (1-4)
2. **Get Challenge** (random prompt engineering task)
3. **Write Your Prompt** (your attempt)
4. **Get AI Evaluation**:
   - Score (1-10)
   - Feedback on your prompt
   - Improved version
   - Explanation why it's better
5. **Try Another** or improve your skills

## API Endpoint

**POST** `http://localhost:4000/train`

Request:
```json
{
  "challenge": "Your challenge text",
  "userPrompt": "User's prompt attempt"
}
```

Response:
```json
{
  "score": 7,
  "feedback": "Good attempt...",
  "improved_prompt": "Better version...",
  "explanation": "Why it's better..."
}
```

## Environment Variables

The backend lets you choose between different AI providers or fall back to a static response. Open `backend/.env` and set the variables you need:

```
# provider can be "ollama" (default), "openai" or "mock"
AI_PROVIDER=ollama

# Ollama settings (only used when provider=ollama)
OLLAMA_API=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3

# OpenAI settings (only used when provider=openai)
# requires you to have an OPENAI_API_KEY in env as well
OPENAI_MODEL=gpt-4o-mini

# JWT settings for authentication
JWT_SECRET=some-long-random-string

# database connection
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ai-skill-gym

PORT=4000
```

Authentication is now supported. The following endpoints are available:

```
POST /api/auth/register    { username, email, password } -> { token, user }
POST /api/auth/login       { usernameOrEmail, password } -> { token, user }
```

Include the returned token in subsequent requests:
```
Authorization: Bearer <token>
```

Routes that require authentication:
- `POST /api/submissions/critique` (rate‑limited to prevent abuse)
- `GET /api/submissions/history/:exerciseId`

Unprotected endpoints (`/api/levels`, `/api/exercises`, etc.) can be called without a token.

- **provider=ollama**: talks to a locally running Ollama model. See quick start above for installation.
- **provider=openai**: sends prompts to the OpenAI completions API; you must export `OPENAI_API_KEY`.
- **provider=mock**: skips any network call and returns the built-in fallback text (useful for demos).

The service automatically logs errors and falls back when the selected provider is unavailable.

## Troubleshooting

**"Cannot connect to server"**
- Check backend is running: `npm start`
- Check Ollama is running: `ollama run llama3`
- Both should be accessible

**"Ollama not found"**
- Download from https://ollama.ai
- Install and restart terminal

**"Node not found"**
- Download from https://nodejs.org/
- Restart terminal after install

## Next Steps

- Add user authentication (✅ implemented above)
- Track progress & scores (submissions now tied to users)
- Add more levels/challenges
- Deploy to cloud (see Render config below)
- Mobile app version

### Deploying on Render

1. Commit all changes including `render.yaml` to your GitHub repo.
2. Log in to https://render.com and create a **New Web Service**.
   - Select your repository and the `main` branch.
   - Set the build command to:
     ```bash
     cd backend/ai-skill-gym && npm install && npm run build
     ```
   - Set the start command to:
     ```bash
     cd backend/ai-skill-gym && npm start
     ```
   - Choose the Free plan (or paid as your needs grow).
3. In the Render dashboard, add environment variables matching the ones
   in the `.env` example (`MONGODB_URI`, `JWT_SECRET`, `AI_PROVIDER`, etc.).
4. Click **Create Web Service** – Render will build and deploy automatically.

Once deployed, your frontend will be served from the same service, and the
API will be reachable at the service URL. You can change CORS settings if you
separate the frontend later.

---

**Made with ❤️ for prompt engineers**
