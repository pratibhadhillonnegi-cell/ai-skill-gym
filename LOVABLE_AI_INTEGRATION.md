# 🎨 Lovable AI Integration Guide

Integrate Lovable AI-generated components into your existing AI Skill Gym application.

---

## What is Lovable AI?

**Lovable** is an AI-powered web builder that generates React components from natural language descriptions. It's perfect for:
- ✅ Building UI components faster
- ✅ Generating responsive designs
- ✅ Creating components with AI assistance
- ✅ Exporting React code to integrate with existing apps

---

## Integration Strategy

### Architecture: Keep Both Running

```
┌─────────────────────────────────────────┐
│  AI Skill Gym Backend (Express)         │
│  - API endpoints (/api/*)               │
│  - Authentication (JWT)                 │
│  - Database (MongoDB)                   │
└─────────────────────────────────────────┘
           ↓                  ↓
    ┌──────────────────┐  ┌──────────────┐
    │ Original React   │  │ Lovable AI   │
    │ Frontend (Keep)  │  │ Frontend     │
    │ Port 3000        │  │ Port 3001    │
    └──────────────────┘  └──────────────┘
           ↓
    Both connect to same backend API
```

### Benefits

1. **Zero Downtime**: Keep existing app live while building new version
2. **A/B Testing**: Compare old vs new UI with users
3. **Feature Migration**: Move components one at a time
4. **Rollback Safety**: Easy rollback if new version has issues

---

## Step 1: Create Lovable Project

### Setup

1. **Sign up at [lovable.dev](https://lovable.dev)**
   - Free tier available
   - No credit card required initially

2. **Create New Project**
   - Click "New Project"
   - Name: `AI Skill Gym UI`
   - Template: React + TypeScript (recommended)

### First Component: Login Form

1. **Tell Lovable what you want to build:**
   ```
   Prompt: "Create a beautiful login form for an AI prompt engineering 
   platform called AI Skill Gym. Include email/username field, password 
   field, remember me checkbox, forgot password link, and login button. 
   Use dark theme with blue accents. Add validation messages below fields."
   ```

2. **Review the generated code**
3. **Export the component**

---

## Step 2: Export from Lovable to Your App

### Export Steps

1. **In Lovable Dashboard**
   - Click component
   - Click "Code" tab
   - Click "Export" → "React Component"

2. **Copy the generated code**
   - Includes React component
   - CSS-in-JS or Tailwind CSS
   - PropTypes

3. **Save to new folder**
   ```
   frontend/src/lovable-components/
   ├── LoginForm.jsx
   ├── RegisterForm.jsx
   ├── ExerciseCard.jsx
   └── LeaderboardTable.jsx
   ```

### Example: Export Login Component

**In Lovable:**
```jsx
export function LoginForm({ onSubmit, isLoading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    // Generated JSX
  );
}
```

**Save to:** `frontend/src/lovable-components/LoginForm.jsx`

---

## Step 3: Integrate with Backend

### Update API Calls

**Original component in `components/Login.js`:**
```javascript
// Old approach - might be tied to specific API structure
```

**New Lovable component wrapper:**
```jsx
// frontend/src/lovable-components/LoginForm.jsx
import { useState } from 'react';

export function LoginForm({ onSubmit, isLoading, error: externalError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(externalError || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    // Lovable-generated JSX
  );
}
```

**Container component that calls API:**
```jsx
// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../lovable-components/LoginForm';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />;
}
```

---

## Step 4: Run Both Frontends in Parallel

### Option A: Keep Original at Port 3000, New at Port 3001

**1. Update backend CORS:**
```javascript
// backend/ai-skill-gym/server.js
const allowedOrigins = [
  'http://localhost:3000',  // Original React app
  'http://localhost:3001',  // Lovable app
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL,
].filter(Boolean);
```

**2. Create new React app for Lovable version:**
```bash
cd frontend/..
npx create-react-app lovable-ui
cd lovable-ui
npm install react-router-dom axios
```

**3. Copy Lovable components:**
```bash
# Copy exported components from Lovable
cp /path/to/lovable/components/* src/lovable-components/
```

**4. Port configuration:**
```bash
# Terminal 1: Original app
cd frontend
REACT_APP_API_URL=http://localhost:5000 npm start
# Runs on http://localhost:3000

# Terminal 2: Lovable app
cd lovable-ui
REACT_APP_API_URL=http://localhost:5000 npm start
# Runs on http://localhost:3001

# Terminal 3: Backend
cd backend/ai-skill-gym
npm start
# Runs on http://localhost:5000
```

### Option B: Route Switch at Backend

**Route requests based on header:**
```javascript
// backend/ai-skill-gym/server.js

app.use((req, res, next) => {
  const clientVersion = req.headers['x-client-version'] || 'original';
  
  if (clientVersion === 'lovable') {
    // Route to Lovable frontend
    res.sendFile(path.join(__dirname, '../lovable-ui/build/index.html'));
  } else {
    // Route to original frontend
    res.sendFile(path.join(__dirname, './public/index.html'));
  }
});
```

**Then in React:**
```javascript
// Both frontends send version header
fetch('/api/endpoint', {
  headers: {
    'X-Client-Version': 'lovable'
    // or 'original'
  }
});
```

---

## Step 5: Component Generation Workflow

### Components to Build with Lovable

| Component | Priority | Use Case |
|-----------|----------|----------|
| Login Form    | High | Start here - simpler |
| Register Form | High | Validation showcase |
| Exercise Card | High | Main content |
| Critique Display | High | Results view |
| Leaderboard Table | Medium | Sorting & pagination |
| Level Selector | Medium | Navigation |
| Profile Page | Medium | User info |
| Navigation Header | Low | Setup last |

### Build Order

1. **Phase 1: Auth Components** (2-3 hours)
   - LoginForm.jsx
   - RegisterForm.jsx
   - PasswordResetForm.jsx

2. **Phase 2: Main Flow** (4-5 hours)
   - LevelSelector.jsx
   - ExerciseView.jsx
   - SubmitPrompt.jsx

3. **Phase 3: Results & Social** (3-4 hours)
   - CritiqueDisplay.jsx
   - LeaderboardTable.jsx
   - UserProfile.jsx

4. **Phase 4: Layout** (1-2 hours)
   - Header.jsx
   - Sidebar.jsx
   - Footer.jsx

---

## Step 6: Testing & Migration

### Local Testing

```bash
# Test original app
curl http://localhost:3000

# Test Lovable app
curl http://localhost:3001

# Both should connect to same backend
curl http://localhost:5000/api/health
```

### A/B Testing

**Send users to different versions:**

```javascript
// frontend/src/App.js - Original
export function App() {
  // Old implementation
}

// lovable-ui/src/App.js - New
export function App() {
  // New implementation
}
```

**Track which version users prefer:**
```javascript
// Add to both frontends
ReactGA.event({
  category: 'Version',
  action: 'UsersOn' + (process.env.REACT_APP_VERSION || 'original'),
  label: new Date().toDateString(),
});
```

### Migration Checklist

- [ ] All Lovable components match original functionality
- [ ] API integrations tested
- [ ] Form validation working
- [ ] Authentication flow complete
- [ ] Error handling working
- [ ] Responsive design tested
- [ ] Performance acceptable
- [ ] Security headers present

---

## Step 7: Production Deployment

### Option A: Keep Both Live (A/B Testing)

**Deploy both to Render:**

1. Original app → `https://ai-skill-gym-original.onrender.com`
2. Lovable app → `https://ai-skill-gym.onrender.com`
3. Backend → `https://api.ai-skill-gym.onrender.com`

### Option B: Replace Frontend (Clean Migration)

1. **When ready:**
   - Build Lovable app: `npm run build`
   - Move build to backend: `cp -r build/* backend/ai-skill-gym/public/`
   - Redeploy backend

2. **Rollback** (if needed):
   - Revert to previous commit
   - Redeploy

### Option C: Canary Deployment

**Route 10% traffic to new version:**
```javascript
// backend/ai-skill-gym/server.js
app.use((req, res, next) => {
  const random = Math.random();
  
  if (random < 0.1) {
    // 10% → Lovable
    req.clientVersion = 'lovable';
  } else {
    // 90% → Original
    req.clientVersion = 'original';
  }
  next();
});
```

---

## Workflow: Lovable → Integration

### Quick Reference

```
1. Design in Lovable
   ↓
2. Export React component
   ↓
3. Save to lovable-components/ folder
   ↓
4. Create container component with API logic
   ↓
5. Import in App.js or page
   ↓
6. Test locally (port 3001)
   ↓
7. Deploy to staging
   ↓
8. A/B test with users
   ↓
9. Migrate or keep both
```

---

## Tips & Best Practices

### ✅ Do's

- ✅ Start with single components, not full pages
- ✅ Keep API logic separate from UI components
- ✅ Test both versions against same backend
- ✅ Generate TypeScript components for better type safety
- ✅ Use Tailwind CSS (matches your existing app)
- ✅ Export components frequently to version control

### ❌ Don'ts

- ❌ Don't hard-code API URLs in Lovable components
- ❌ Don't duplicate API logic
- ❌ Don't ignore mobile responsiveness
- ❌ Don't skip testing before deployment
- ❌ Don't commit both apps to same git repo (or use monorepo)
- ❌ Don't forget CORS configuration

---

## Troubleshooting

### Components Not Rendering

**Problem:** Lovable component shows blank or errors
**Solution:**
1. Check browser console for errors
2. Verify props passed correctly
3. Check CSS/Tailwind dependencies
4. Ensure backend API is running

### CORS Errors

**Problem:** `Access to XMLHttpRequest has been blocked by CORS policy`
**Solution:**
```javascript
// In backend server.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
```

### Components Look Different

**Problem:** Lovable components don't match your brand colors
**Solution:**
1. Use Lovable's theme customization
2. Or manually update CSS in exported components
3. Or wrap components with your CSS variables

### State Management

**Problem:** Can't share state between pages
**Solution:**
```javascript
// Use React Context or Redux
// frontend/lovable-ui/src/context/AuthContext.jsx
import { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## Support Resources

- 📚 [Lovable Documentation](https://lovable.dev/docs)
- 🎨 [Lovable Prompting Guide](https://lovable.dev/guides/prompting)
- 💻 [React Documentation](https://react.dev)
- 🔗 [Backend Integration Guide](./DEPLOYMENT.md)

---

## Next Steps

1. ✅ Create Lovable account
2. ✅ Build first component (LoginForm)
3. ✅ Export and test locally
4. ✅ Integrate with backend
5. ✅ Build remaining components
6. ✅ Run parallel testing
7. ✅ Deploy to production
