#!/bin/bash

echo "🚀 Setting up Firebase Notifications Demo"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "🔧 Configuration needed:"
echo "======================="
echo ""
echo "1. Backend Configuration:"
echo "   - Create a .env file in the backend directory"
echo "   - Add your Firebase service account credentials"
echo "   - See README.md for details"
echo ""
echo "2. Frontend Configuration:"
echo "   - Update firebase.js with your Firebase project config"
echo "   - Add your VAPID key for web push notifications"
echo "   - See README.md for details"
echo ""
echo "3. Start the servers:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "📚 See README.md for complete setup instructions"
echo ""
echo "🎉 Setup complete! Happy coding!"
