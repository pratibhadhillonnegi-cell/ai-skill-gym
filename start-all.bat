@echo off
REM Start all services for AI Skill Gym with Lovable UI

color 0B
echo.
echo ===============================================
echo 🚀 Starting AI Skill Gym Full Stack
echo ===============================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorLevel% neq 0 (
    echo ❌ npm not found! Install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Starting services...
echo.

REM Start Backend in new window
echo 1️⃣  Starting Backend API (port 5000)...
start "AI Skill Gym - Backend" cmd /k "cd backend\ai-skill-gym && npm start"
timeout /t 3 /nobreak

REM Start Original Frontend in new window
echo 2️⃣  Starting Original React Frontend (port 3000)...
start "AI Skill Gym - Frontend (Original)" cmd /k "cd frontend && set REACT_APP_API_URL=http://localhost:5000 && npm start"
timeout /t 2 /nobreak

REM Start Lovable Frontend in new window (if exists)
if exist "lovable-ui" (
    echo 3️⃣  Starting Lovable AI Frontend (port 3001)...
    start "AI Skill Gym - Frontend (Lovable)" cmd /k "cd lovable-ui && set REACT_APP_API_URL=http://localhost:5000 && npm start"
) else (
    echo ⚠️  Lovable UI not found. Create with: npx create-react-app lovable-ui
)

echo.
echo ===============================================
echo ✅ Services starting in separate windows
echo ===============================================
echo.
echo 📍 Backend API:          http://localhost:5000
echo 🎨 Original Frontend:    http://localhost:3000
echo ✨ Lovable Frontend:     http://localhost:3001 (if created)
echo.
echo Close any window to stop that service
echo.
pause
