#!/bin/bash

# AI Skill Gym - Quick Start Script

echo "🎓 AI Skill Gym - Quick Start"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from nodejs.org"
    exit 1
fi

echo "✓ Node.js found: $(node -v)"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠ MongoDB not found. Install from mongodb.com or use Atlas"
fi

# Check if Ollama is running
echo ""
echo "Checking Ollama..."
if curl -s http://localhost:11434/api/generate > /dev/null 2>&1; then
    echo "✓ Ollama is running"
else
    echo "❌ Ollama not running. Start with: ollama serve"
    echo "   Then in another terminal: ollama pull mistral"
    exit 1
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "📝 .env created. Update MONGODB_URI if needed."
fi

# Seed database
echo ""
echo "Seeding database with curriculum..."
npm run seed

# Start server
echo ""
echo "🚀 Starting server..."
npm start
