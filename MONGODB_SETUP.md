# MongoDB Atlas Setup Checklist

## 1. Create Free Account
- Go to https://mongodb.com/cloud/atlas
- Sign up with email or GitHub
- Create organization & project

## 2. Create Free Cluster
- Cluster Tier: **M0 Free**
- Cloud Provider: AWS (or your preference)
- Region: closest to you
- Click "Create Cluster"

## 3. Add Database User
- Security → Database Users
- Add New Database User
  - Username: `prompt_user` (example)
  - Password: `strong-password-here`
  - Built-in Role: `Atlas Admin`
- Add User

## 4. IP Allowlist
- Security → Network Access
- Add IP Address → "Allow Access from Anywhere"
  - Enter 0.0.0.0/0 (testing only; restrict in production)
- Confirm

## 5. Get Connection String
- Cluster Overview → Connect
- Choose: "Connect your application"
- Driver: Node.js, Version: 4.1 or later
- Copy connection string

## 6. Replace Credentials
Change this:
`mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai-skill-gym?retryWrites=true&w=majority`

To this (with your actual credentials):
`mongodb+srv://prompt_user:your-password@cluster0.mongodb.net/ai-skill-gym?retryWrites=true&w=majority`

## 7. Set Env Variable
```powershell
$env:MONGODB_URI="mongodb+srv://prompt_user:your-password@cluster0.mongodb.net/ai-skill-gym?retryWrites=true&w=majority"
$env:JWT_SECRET="test-secret"
$env:AI_PROVIDER="mock"
npm start
```

## 8. Verify Connection
Open http://localhost:5000/api/health
Should return: `{ "status": "Server running" }`

---

**You're ready to go!** Open http://localhost:5000 in browser
