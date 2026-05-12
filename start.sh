#!/bin/bash
# Start both backend and frontend together

echo "🏠 Starting Rent Ease And Homes Agency..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3."
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+."
    exit 1
fi

# Setup backend
echo "📦 Setting up backend..."
cd backend
pip install -r requirements.txt -q
cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
npm install --silent
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Starting servers..."
echo "  Backend  → http://localhost:5000"
echo "  Frontend → http://localhost:5173"
echo ""

# Start backend in background
cd backend && python app.py &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend && npm run dev

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null
