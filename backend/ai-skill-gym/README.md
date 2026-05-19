# AI Skill Gym — Train your prompt IQ

A progressive prompt engineering curriculum with interactive exercises, AI critiques, and improvement suggestions.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI Engine**: Ollama (local, free, no API keys needed)
- **Frontend**: Plain HTML/CSS/JavaScript (no build tools)

## Features

✅ 4-Level Progressive Curriculum
- Level 1: AI Literacy
- Level 2: Structured Prompting
- Level 3: Applied Tracks
- Level 4: Optimization

✅ 16+ Exercises across all levels

✅ AI Critique System
- Analyzes your prompt
- Shows improved version
- Explains why it's better
- Scores 1-10

## Prerequisites

1. **Node.js** (v14+)
2. **MongoDB** (local or Atlas)
3. **Ollama** (free, runs locally)

## Installation

### 1. Install Ollama

Download from [ollama.ai](https://ollama.ai)

Pull a model (choose one):
```bash
ollama pull mistral        # Recommended: fastest & best quality
ollama pull neural-chat    # Alternative: good for chat
ollama pull llama2         # Alternative: larger model
```

Start Ollama (it runs on http://localhost:11434):
```bash
ollama serve
```

### 2. Install MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows: Download from mongodb.com/download/community

# Linux: https://docs.mongodb.com/manual/installation/
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Create a cluster
- Update `MONGODB_URI` in `.env`

### 3. Setup Backend

```bash
cd backend/ai-skill-gym

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Seed database with curriculum
npm run seed

# Start server
npm start
```

Server runs on http://localhost:5000

### 4. Access the App

Open your browser to: **http://localhost:5000**

## Puter.js Quick Start

Puter.js lets you use browser-based AI and cloud features without API keys or additional backend configuration.

### Install

```bash
npm install @heyputer/puter.js
```

### Use in the browser

```js
import { puter } from '@heyputer/puter.js';

puter.ai.chat(`Why did the chicken cross the road?`).then(console.log);
```

### Use in Node.js

```js
import { init } from '@heyputer/puter.js/src/init.cjs';
const puter = init(process.env.puterAuthToken);

puter.ai.chat("What color was Napoleon's white horse?").then(console.log);
```

### Deploy to Custom URL

To deploy your AI Skill Gym to a custom subdomain on Puter.site:

1. **Start your development servers:**
   ```bash
   # Terminal 1: Start backend
   npm start

   # Terminal 2: Start frontend dev server
   cd frontend
   npm run dev
   ```

2. **Deploy from the browser:**
   - Open http://localhost:3000
   - Register/Login with any credentials
   - Switch to "Puter Mode" (top-right toggle)
   - Scroll down to "Publish Static Website" section
   - Enter "ai-xpress" as the subdomain
   - Click "Publish AI Skill Gym"

3. **Access your deployed app:**
   Your AI Skill Gym landing page will be available at: **https://ai-xpress.puter.site**

This creates a beautiful landing page that links users back to your local development server. For production deployment with full functionality, you would need to deploy both frontend and backend to a hosting service that supports Node.js.

### What you can do with Puter.js

- Browser-based AI chat with models like GPT-5.4 nano, Claude, Gemini, Grok, Kimi, LLaMA, and more
- Text generation, image generation, and image analysis
- Streaming responses in real time
- Cloud storage, authentication, and NoSQL database features

## Project Structure

```
backend/ai-skill-gym/
├── public/
│   └── index.html          # Frontend (served static)
├── models/
│   ├── Level.js            # Course levels (1-4)
│   ├── Exercise.js         # Individual exercises
│   └── Submission.js       # User responses & AI critiques
├── routes/
│   ├── levels.js           # GET /api/levels
│   ├── exercises.js        # GET /api/exercises
│   └── submissions.js      # POST /api/submissions/critique
├── services/
│   └── aiService.js        # Ollama integration
├── config/
│   └── database.js         # MongoDB connection
├── scripts/
│   └── seedDatabase.js     # Populate curriculum
└── server.js               # Express app
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/levels` | List all 4 levels |
| GET | `/api/exercises/random/:level` | Get random exercise for level |
| POST | `/api/submissions/critique` | Submit prompt & get AI critique |

**Submit Prompt Example:**
```bash
curl -X POST http://localhost:5000/api/submissions/critique \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": "exercise_id_here",
    "userPrompt": "Your prompt here"
  }'
```

**Response:**
```json
{
  "submissionId": "...",
  "critique": "Your critique...",
  "improvedPrompt": "Better version...",
  "explanation": "Why it's better...",
  "score": 7
}
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/ai-skill-gym
PORT=5000
NODE_ENV=development
OLLAMA_API=http://localhost:11434/api/generate
OLLAMA_MODEL=mistral
```

## Usage

1. **Select a Level** (1-4)
2. **Read the Challenge** and expected outcomes
3. **Write Your Prompt** in the text box
4. **Get Critique** from AI
5. **Compare** your version vs improved version
6. **Learn** why the improved version is better
7. **Try Again** or **Next Exercise**

## Customization

### Change AI Model

Edit `.env`:
```env
OLLAMA_MODEL=neural-chat  # or llama2, mistral, etc.
```

### Add More Exercises

Edit `scripts/seedDatabase.js` and add to the `CURRICULUM` array, then run:
```bash
npm run seed
```

### Modify Exercise Structure

Edit `models/Exercise.js` to add new fields, then update seed script.

## Troubleshooting

**"Cannot connect to Ollama"**
- Make sure Ollama is running: `ollama serve`
- Check `OLLAMA_API` in `.env`

**"MongoDB connection failed"**
- If local: Start MongoDB (`brew services start mongodb-community`)
- If Atlas: Check connection string in `.env`

**"Exercises not loading"**
- Run: `npm run seed`
- Check MongoDB is connected

**Frontend shows blank page**
- Check browser console for errors
- Verify backend is running on port 5000

## Next Steps (Future Versions)

- [ ] User authentication & progress tracking
- [ ] Community prompts & voting
- [ ] Advanced domain tracks
- [ ] Multi-model comparison
- [ ] Export report as PDF
- [ ] Mobile app

## License

MIT
