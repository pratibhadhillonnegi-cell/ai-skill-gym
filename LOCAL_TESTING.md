# 🧪 Local Testing Guide

Complete features test after MongoDB is configured.

---

## Phase 1: Server Startup ✅

```powershell
cd "c:\Users\Kulvinder Singh\OneDrive\Desktop\ai-skill-gym\backend\ai-skill-gym"

# Set environment variables
$env:MONGODB_URI="mongodb+srv://prompt_user:your-password@cluster0.mongodb.net/ai-skill-gym?retryWrites=true&w=majority"
$env:JWT_SECRET="test-secret-123"
$env:AI_PROVIDER="mock"

# Start server
npm start
```

**Expected Output:**
```
✓ MongoDB connected
🚀 AI Skill Gym Backend running on http://localhost:5000
```

---

## Phase 2: Seed Database ✅

In a new PowerShell terminal (keep server running):

```powershell
cd "c:\Users\Kulvinder Singh\OneDrive\Desktop\ai-skill-gym\backend\ai-skill-gym"

# Set same MongoDB URI as above
$env:MONGODB_URI="mongodb+srv://prompt_user:your-password@cluster0.mongodb.net/ai-skill-gym?retryWrites=true&w=majority"

# Seed all levels and exercises
npm run seed
```

**Expected Output:**
```
✓ Database seeded successfully
✓ 4 levels created
✓ 16 exercises created
```

---

## Phase 3: API Testing ✅

### Test 1: Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
```

Expected: `{ "status": "Server running" }`

---

### Test 2: Register User
```powershell
$body = @{
    username = "alice"
    email = "alice@test.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected response:
```json
{
  "token": "eyJhbGc...",
  "user": {"id": "...", "username": "alice", "email": "alice@test.com"}
}
```

**Save the token for next tests:**
```powershell
$token = "your-token-from-above"
```

---

### Test 3: Get Levels
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/levels" -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected: Array of 4 levels with titles (AI Literacy, Structured Prompting, Applied Tracks, Optimization)

---

### Test 4: Get Random Exercise
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/exercises/random/1" -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected: Exercise object with `challenge`, `title`, `description`, etc.

---

### Test 5: Get Your Profile
```powershell
$token = "your-token-from-test-2"

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" `
  -Headers @{"Authorization"="Bearer $token"} `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected: User object with profile fields (displayName, bio, role, stats)

---

### Test 6: Submit Exercise & Get Critique
```powershell
# First, get an exercise ID
$exercise = Invoke-WebRequest -Uri "http://localhost:5000/api/exercises/random/1" `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
$exerciseId = $exercise._id

# Submit a prompt
$body = @{
    exerciseId = $exerciseId
    userPrompt = "Write a haiku about AI"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/submissions/critique" `
  -Method POST `
  -Headers @{
    "Content-Type"="application/json"
    "Authorization"="Bearer $token"
  } `
  -Body $body `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected response:
```json
{
  "score": 5,
  "critique": "Your prompt shows good intent...",
  "improvedPrompt": "...",
  "explanation": "...",
  "userStats": {
    "totalSubmissions": 1,
    "averageScore": 5
  }
}
```

---

### Test 7: Check Updated Stats
```powershell
# Get your updated profile
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" `
  -Headers @{"Authorization"="Bearer $token"} `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Format-Table totalSubmissions, averageScore
```

Expected: `totalSubmissions: 1`, `averageScore: 5`

---

### Test 8: View Leaderboard
```powershell
# You should now appear on the leaderboard
Invoke-WebRequest -Uri "http://localhost:5000/api/users/leaderboard" `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

Expected: Array with your user (alice) showing score 5

---

### Test 9: View Public Profile
```powershell
# Get your user ID from any response
$userId = "your-user-id-from-earlier"

Invoke-WebRequest -Uri "http://localhost:5000/api/users/$userId" `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

Expected: Public profile (username, displayName, stats)

---

### Test 10: Update Profile
```powershell
$body = @{
    displayName = "Alice Engineer"
    bio = "Learning prompt engineering"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" `
  -Method PATCH `
  -Headers @{
    "Content-Type"="application/json"
    "Authorization"="Bearer $token"
  } `
  -Body $body `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected: Updated user object

---

## Phase 4: Frontend Testing ✅

1. Open **http://localhost:5000** in your browser
2. Click **Register** (or use existing alice account, click Login)
3. Create account (or login)
4. Should redirect to **Level Selector**
5. Select **Level 1**
6. See exercise with prompt
7. Type any prompt in textarea
8. Click **Submit**
9. See AI critique (mock response, instant)
10. Check **Profile** button in header
11. View stats and leaderboard link

---

## Phase 5: Rate Limiting Test ✅

Submit the same exercise 6 times rapidly:

```powershell
# Run this in a loop - 6th request should fail
for ($i = 1; $i -le 6; $i++) {
  Write-Host "Request $i of 6"
  
  $body = @{
    exerciseId = $exerciseId
    userPrompt = "Test prompt $i"
  } | ConvertTo-Json
  
  try {
    Invoke-WebRequest -Uri "http://localhost:5000/api/submissions/critique" `
      -Method POST `
      -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $token"
      } `
      -Body $body `
      -UseBasicParsing | Select-Object StatusCode, @{n='Message';e={($_.Content | ConvertFrom-Json).error}}
  } catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
  }
  
  Start-Sleep -Milliseconds 200
}
```

Expected:
- Requests 1-5: Status 200 (success)
- Request 6: Status 429 (rate limited)

---

## Phase 6: Error Handling ✅

### Test 6a: Missing Auth Token
```powershell
$body = @{
    exerciseId = "123"
    userPrompt = "test"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/submissions/critique" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -UseBasicParsing
```

Expected: Status 401, error "Authorization header required"

---

### Test 6b: Invalid Credentials
```powershell
$body = @{
    usernameOrEmail = "alice"
    password = "wrong-password"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -UseBasicParsing
```

Expected: Status 400, error "Invalid credentials"

---

## ✅ All Tests Passed?

You're ready for production! Next steps:

1. **→ Read [DEPLOYMENT.md](./DEPLOYMENT.md)** for Render setup
2. **→ Create Render account** at render.com
3. **→ Push code to GitHub**
4. **→ Deploy on Render** (10 minutes)
5. **→ Test production endpoints**

---

## 🐛 Troubleshooting

**Test 1 fails (health check error)?**
- Server didn't start: check MongoDB connection string

**Test 2 fails (register error)?**
- Check MongoDB is running: look at server logs

**Tests 6-10 fail (need token)?**
- Use token from Test 2 response: `$token = "..."`

**Frontend won't load (http://localhost:5000)?**
- Check server is running: `npm start`
- Check terminal for error messages

**"Port 5000 already in use"?**
- Kill previous process: `Stop-Process -Name node`
- Or use different port: `$env:PORT="6000"`

---

**Next:** Complete these tests, then read DEPLOYMENT.md for cloud setup! 🚀
