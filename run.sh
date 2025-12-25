#!/bin/bash
# Scribe - Quick Start Script
# Run: ./run.sh

set -e

echo "🚀 Starting Scribe..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if native modules need rebuild (by checking for .rebuilt file)
if [ ! -f "node_modules/.rebuilt" ]; then
  echo "🔧 Rebuilding native modules for Electron..."
  npx electron-rebuild
  touch node_modules/.rebuilt
  echo "✅ Native modules rebuilt"
fi

# Start dev server
echo "🎯 Starting development server..."
npm run dev
