#!/bin/bash

# Installation script for RWA DEX Project

echo "🚀 Installing RWA DEX Project..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install contract dependencies
echo "📦 Installing contract dependencies..."
cd contracts
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables (see docs/LOCAL_SETUP.md)"
echo "2. Start Hardhat node: cd contracts && npm run node"
echo "3. Deploy contracts: cd contracts && npm run deploy:local"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm run dev"

