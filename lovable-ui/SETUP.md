# Lovable UI Setup Instructions

Quick setup for running the new Lovable AI frontend alongside the original.

## Quick Start

### 1. Create Lovable UI Project Folder

```bash
cd c:\Users\Kulvinder Singh\OneDrive\Desktop\ai-skill-gym
npx create-react-app lovable-ui
cd lovable-ui
npm install react-router-dom axios
```

### 2. Create Component Structure

```bash
mkdir -p src/lovable-components
mkdir -p src/pages
mkdir -p src/context
mkdir -p src/utils
```

### 3. Start All Services

```bash
# Windows
start-all.bat

# Mac/Linux
bash start-all.sh
```

## What You'll Have

- **Port 5000**: Backend API
- **Port 3000**: Original React frontend
- **Port 3001**: New Lovable UI frontend

Both frontends connect to the same backend API!

## Next: Build Components in Lovable

1. Go to [lovable.dev](https://lovable.dev)
2. Create new project: "AI Skill Gym UI"
3. Build first component with prompt like:

```
Create a beautiful login form for AI Skill Gym. 
Include email field, password field, remember me checkbox, 
forgot password link, and login button. 
Use dark theme with blue accents and smooth animations.
```

4. Export the component code
5. Save to `lovable-ui/src/lovable-components/LoginForm.jsx`

## Example Component Template

**File:** `lovable-ui/src/lovable-components/LoginForm.jsx`

```jsx
import { useState } from 'react';

export function LoginForm({ onSubmit, isLoading = false, error = '' }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    // Paste your Lovable exported JSX here
    <div>
      {/* Component code */}
    </div>
  );
}
```

**File:** `lovable-ui/src/pages/Login.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../lovable-components/LoginForm';
import { API_URL } from '../config';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />;
}
```

## Configuration Files

See the example files in this directory:
- `lovable-ui.example.env` - Environment setup
- `App.example.jsx` - App structure with routing

## Testing Locally

```bash
# Terminal 1: Backend
cd backend/ai-skill-gym
npm start

# Terminal 2: Original Frontend
cd frontend
npm start

# Terminal 3: Lovable Frontend
cd lovable-ui
REACT_APP_API_URL=http://localhost:5000 npm start
```

Then visit:
- Original: http://localhost:3000
- Lovable:  http://localhost:3001

## Deployment Options

1. **Keep both live** - Run A/B test
2. **Replace original** - Deploy Lovable as main
3. **Canary deployment** - Route % of traffic to new version

See [LOVABLE_AI_INTEGRATION.md](../LOVABLE_AI_INTEGRATION.md) for full details.

## Resources

- 🎨 [Lovable AI Docs](https://lovable.dev/docs)
- ⚛️ [React Docs](https://react.dev)
- 📚 [Integration Guide](../LOVABLE_AI_INTEGRATION.md)
