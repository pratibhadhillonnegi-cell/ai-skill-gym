@echo off
REM AI Skill Gym - Quick Start for Windows

echo.
echo 🎓 AI Skill Gym - Quick Start
echo ================================
echo.

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Install from nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%

REM Check Ollama
echo.
echo Checking Ollama...
timeout /t 1 /nobreak >nul
powershell -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:11434/api/generate' -TimeoutSec 1 -ErrorAction Stop; echo '✓ Ollama is running' } catch { echo '❌ Ollama not running'; exit 1 }"

if errorlevel 1 (
    echo.
    echo ❌ Ollama is not running!
    echo.
    echo 1. Download from https://ollama.ai
    echo 2. Run: ollama serve
    echo 3. In another terminal: ollama pull mistral
    echo 4. Then run this script again
    pause
    exit /b 1
)

REM Install dependencies
echo.
echo Installing dependencies...
call npm install

REM Create .env
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo 📝 .env created. Update MONGODB_URI if needed.
)

REM Seed database
echo.
echo Seeding database with curriculum...
call npm run seed

REM Start server
echo.
echo 🚀 Starting server...
echo 📖 Open http://localhost:5000 in your browser
call npm start

pause
