# 🎓 AI Skill Gym

**Train your prompt IQ.**

An interactive platform where users get AI prompt-engineering exercises, write solutions, receive AI critique with improved versions, and compete on leaderboards.

- 🎯 4 Progressive levels (basics → advanced)
- 🤖 AI-powered critiques (OpenAI, Ollama, or mock)
- 👥 User profiles & leaderboards
- 🔐 Authentication with JWT & password reset
- 📊 Real-time stats tracking
- ☁️ Cloud-ready (Render, Vercel, AWS)

---

## 🚀 Quick Start (5 minutes)

```bash
# Option 1: Instant (mock mode)
cd backend/ai-skill-gym
set JWT_SECRET=test
set AI_PROVIDER=mock
npm install && npm start
# → Open http://localhost:5000

# Option 2: Free AI (Ollama)
ollama run llama3          # in separate terminal
# (back in backend folder)
set JWT_SECRET=test
set AI_PROVIDER=ollama
npm start

# Option 3: Best quality (OpenAI)
# Set API key: https://platform.openai.com/api-keys
set JWT_SECRET=test
set AI_PROVIDER=openai
set OPENAI_API_KEY=sk-...
npm start
```

Then register, select a level, and start training! 💪

---

## 📚 Documentation

| Guide | Purpose | Time |
|-------|---------|------|
| **[QUICKSTART.md](./QUICKSTART.md)** | Get running locally in 5 min | 5 min |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Deploy to production + advanced setup | 30 min |
| **[SUMMARY.md](./SUMMARY.md)** | What was built & architecture | 15 min |
| **[VERIFICATION.md](./VERIFICATION.md)** | Test checklist & troubleshooting | 20 min |

---

## 🏗️ What's Included

### ✅ Backend (Express + Node.js)
- JWT authentication with password reset
- User profiles with stats & roles
- Leaderboards & public profiles
- Multi-AI provider abstraction (OpenAI, Ollama, Anthropic, mock)
- Rate limiting per user
- MongoDB integration

### ✅ Frontend (React)
- Login/Register UI
- Exercise selection & interactive UI
- AI critique display
- User profile page
- Responsive design

### ✅ Deployment
- Render configuration (render.yaml)
- Guides for Vercel/Netlify frontend deployment
- CI/CD pipeline setup
- Security best practices
- Monitoring integration (Sentry, Analytics)

---

## 🎯 Use Cases

**For learners:**
- Build practical prompt-engineering skills
- Get instant feedback from AI
- Track progress with stats
- Compete on global leaderboards

**For educators/organizations:**
- Integrate into training programs
- Track student progress
- Customize curriculum
- Deploy on your own servers

---

## 🔧 Tech Stack

**Backend**
- Node.js + Express
- MongoDB (Atlas)
- JWT authentication
- bcrypt password hashing
- OpenAI, Ollama, Anthropic APIs

**Frontend**
- React
- Fetch API
- localStorage for tokens
- Responsive CSS

**Deployment**
- Render (backend)
- Vercel/Netlify (optional frontend)
- GitHub Actions (CI/CD)
- Sentry (monitoring)

---

## 📦 Project Structure

```
ai-skill-gym/
├── backend/ai-skill-gym/          # Express server
│   ├── models/                    # MongoDB schemas
│   ├── routes/                    # API endpoints
│   ├── middleware/                # Auth, roles, rate-limiting
│   ├── services/                  # AI provider abstraction
│   ├── frontend/src/              # React components
│   ├── config/                    # Database config
│   ├── scripts/                   # Seed database
│   ├── package.json
│   └── server.js
├── QUICKSTART.md                  # Get running in 5 min
├── DEPLOYMENT.md                  # Production guide
├── SUMMARY.md                     # Implementation overview
├── VERIFICATION.md                # Testing checklist
└── render.yaml                    # Infrastructure-as-code
```

---

## 🚢 Deployment

### Local Testing
1. Read **[QUICKSTART.md](./QUICKSTART.md)**
2. Pick your AI provider (mock/Ollama/OpenAI)
3. Run `npm start`
4. Test at http://localhost:5000

### Production Deployment
1. Read **[DEPLOYMENT.md](./DEPLOYMENT.md)** → "Render Deployment" section
2. Push to GitHub
3. Create Web Service on Render.com
4. Set environment variables
5. Deploy (takes 2–3 minutes)

### Frontend Separately (Optional)
See **[DEPLOYMENT.md](./DEPLOYMENT.md)** → "Separate Frontend Deployment" section
- Deploy on Vercel/Netlify
- Keep backend on Render
- Both can be on same domain via reverse proxy

---

## 🔐 Security

- Passwords hashed with bcrypt
- JWT authentication (7-day expiration)
- Password reset tokens (30-min validation)
- Rate limiting (5 requests/minute)
- HTTPS enforced in production
- Secrets in environment variables (never committed)
- Role-based access control (user/admin)

---

## 📊 Features

### 🎓 Learning
- 4 progressive skill levels
- ~4 exercises per level (16 total)
- Curriculum covers: LLM basics, structured prompting, applied tracks, optimization
- Auto-rating: 1-10 scale

### 👤 User Experience
- Create account → submit prompts → get feedback
- Track stats: submitted count, average score, completed exercises
- View leaderboard to compete
- Edit profile (display name, bio)
- Logout and login

### 🤖 AI Integration
- Switch providers: OpenAI (quality), Ollama (free), mock (instant)
- Cost control: gpt-4o-mini is $0.00015 per 1K tokens
- Automatic fallback if provider fails
- Rate limiting prevents abuse

---

## 💡 Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"alice","password":"pass123"}'
# Returns: { "token": "eyJ...", "user": {...} }
```

### Submit Exercise
```bash
curl -X POST http://localhost:5000/api/submissions/critique \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"exerciseId":"...","userPrompt":"Write a haiku"}'
# Returns: { "critique": "...", "improvedPrompt": "...", "score": 8 }
```

### Get Leaderboard
```bash
curl http://localhost:5000/api/users/leaderboard
# Returns: [{ "username": "alice", "averageScore": 8.5, ... }]
```

---

## 🎁 What's Next?

**Immediate:**
- [ ] Clone/pull repo
- [ ] Read QUICKSTART.md
- [ ] Run locally
- [ ] Try all 3 AI options

**Near Term:**
- [ ] Deploy to Render
- [ ] Configure custom domain
- [ ] Setup monitoring (Sentry)
- [ ] Invite beta users

**Future:**
- [ ] Mobile app (React Native)
- [ ] Payment system (Stripe)
- [ ] Advanced admin dashboard
- [ ] Email service (SendGrid)
- [ ] Multi-language support

---

## ❓ FAQ

**Q: Do I need to download Ollama?**  
A: No. Use mock mode for instant testing or OpenAI for production.

**Q: Can I customize exercises?**  
A: Yes, edit `scripts/seedDatabase.js` and run `npm run seed`.

**Q: How much does it cost?**  
A: OpenAI ~$0.15 per 1000 prompts. Ollama is free. Render's free tier handles low traffic.

**Q: Can I deploy the frontend separately?**  
A: Yes, see DEPLOYMENT.md. Frontend is currently served by backend for simplicity.

**Q: Is it production-ready?**  
A: Yes. It has auth, rate limiting, error handling, and cloud deployment. You'll want monitoring and backups for serious use.

---

## 📞 Support

**For setup questions:**
- → Read [QUICKSTART.md](./QUICKSTART.md)

**For deployment questions:**
- → Read [DEPLOYMENT.md](./DEPLOYMENT.md)

**For debugging:**
- → Check [VERIFICATION.md](./VERIFICATION.md)

**For architecture questions:**
- → Read [SUMMARY.md](./SUMMARY.md)

**For issues/bugs:**
- Create an issue on GitHub

---

## 📄 License

MIT - Feel free to use, modify, and deploy!

---

## 🙏 Contributing

Pull requests welcome! Areas to improve:
- More exercise levels
- Additional AI providers
- Mobile app
- Admin dashboard
- Analytics dashboard

---

## 🎯 Start Here

👉 **Next step:** Read [QUICKSTART.md](./QUICKSTART.md) and run locally.

Then deploy to [Render](./DEPLOYMENT.md#render-deployment) and share with your team!

---

**Built with ❤️ for prompt engineers learning to train their IQ.**

*Last updated: March 2026*
