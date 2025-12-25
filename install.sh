#!/bin/bash
# Nexus Desktop - Easy Installation Script
# Usage: ./install.sh

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗          ║"
echo "║     ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝          ║"
echo "║     ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗          ║"
echo "║     ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║          ║"
echo "║     ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║          ║"
echo "║     ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝          ║"
echo "║                                                           ║"
echo "║              Installing Nexus Desktop...                 ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "🔍 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "   Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version too old (need 18+, found $(node -v))"
    echo "   Please update Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check npm
echo "🔍 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found!"
    exit 1
fi
echo "✅ npm $(npm -v) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "   This may take a few minutes on first install..."
npm install

# Rebuild native modules
echo ""
echo "🔨 Rebuilding native modules for Electron..."
npx electron-rebuild

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              ✅ Installation Complete!                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Quick Start:"
echo "   npm start          # Launch Nexus"
echo "   npm test           # Run tests"
echo "   npm run build      # Build for production"
echo ""
echo "📚 Documentation:"
echo "   GETTING-STARTED.md # Complete user guide"
echo "   README.md          # Features overview"
echo ""
echo "💡 Tip: Add this alias to ~/.zshrc for easy launching:"
echo "   alias nexus='cd ~/projects/dev-tools/nexus/nexus-desktop && npm start'"
echo ""
