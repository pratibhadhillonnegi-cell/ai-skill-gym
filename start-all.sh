#!/bin/bash
# Start all services for AI Skill Gym with Lovable UI

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting AI Skill Gym Full Stack${NC}"
echo ""

# Check if ports are available
check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
    return 1
  fi
  return 0
}

# Start Backend
echo -e "${GREEN}1️⃣  Starting Backend API (port 5000)...${NC}"
if check_port 5000; then
  cd backend/ai-skill-gym
  npm start &
  BACKEND_PID=$!
  echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
else
  echo -e "${YELLOW}Backend port in use, skipping${NC}"
fi

# Wait for backend to be ready
sleep 3

# Start Original Frontend
echo -e "${GREEN}2️⃣  Starting Original React Frontend (port 3000)...${NC}"
if check_port 3000; then
  cd frontend
  REACT_APP_API_URL=http://localhost:5000 npm start &
  FRONTEND_PID=$!
  echo -e "${GREEN}✅ Original Frontend started (PID: $FRONTEND_PID)${NC}"
else
  echo -e "${YELLOW}Frontend port in use, skipping${NC}"
fi

# Start Lovable Frontend (if exists)
echo -e "${GREEN}3️⃣  Starting Lovable AI Frontend (port 3001)...${NC}"
if [ -d "lovable-ui" ]; then
  if check_port 3001; then
    cd lovable-ui
    REACT_APP_API_URL=http://localhost:5000 npm start &
    LOVABLE_PID=$!
    echo -e "${GREEN}✅ Lovable Frontend started (PID: $LOVABLE_PID)${NC}"
  else
    echo -e "${YELLOW}Lovable port in use, skipping${NC}"
  fi
else
  echo -e "${YELLOW}Lovable UI not found. Create with: npx create-react-app lovable-ui${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All services running!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "📍 Backend API:          http://localhost:5000"
echo "   - Health Check:      http://localhost:5000/api/health"
echo "   - API Docs:          See DEPLOYMENT.md"
echo ""
echo "🎨 Original Frontend:    http://localhost:3000"
echo "   - React App"
echo "   - Current production version"
echo ""
echo "✨ Lovable Frontend:     http://localhost:3001"
echo "   - AI-designed components"
echo "   - New experimental version"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
