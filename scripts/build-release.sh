#!/bin/bash
# Scribe - Build Release Script
# Creates DMG files for distribution
# Usage: ./scripts/build-release.sh

set -e

VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
ARCH=$(uname -m)

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              Building Scribe v${VERSION}                    ║"
echo "║              Architecture: ${ARCH}                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust not found!"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found!"
    exit 1
fi

echo "   ✅ Node.js $(node -v)"
echo "   ✅ npm $(npm -v)"
echo "   ✅ Rust $(rustc --version | cut -d' ' -f2)"
echo ""

# Run tests first
echo "🧪 Running tests..."
npm test -- --run
echo "   ✅ All tests passed"
echo ""

# TypeScript check
echo "🔍 Type checking..."
npm run typecheck || echo "   ⚠️  TypeScript warnings (non-blocking)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
echo ""

# Build frontend
echo "🔨 Building frontend..."
npm run build:vite
echo ""

# Build Tauri app
echo "🔨 Building Tauri app..."
echo "   This may take several minutes..."
npm run build

# Check output
BUILD_DIR="src-tauri/target/release/bundle"

if [ -d "$BUILD_DIR/macos" ]; then
    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📦 Build artifacts:"
    
    if [ -f "$BUILD_DIR/dmg/Scribe_${VERSION}_${ARCH}.dmg" ]; then
        DMG_FILE="$BUILD_DIR/dmg/Scribe_${VERSION}_${ARCH}.dmg"
        DMG_SIZE=$(du -h "$DMG_FILE" | cut -f1)
        SHA256=$(shasum -a 256 "$DMG_FILE" | cut -d' ' -f1)
        
        echo "   📀 DMG: $DMG_FILE"
        echo "      Size: $DMG_SIZE"
        echo "      SHA256: $SHA256"
    fi
    
    if [ -d "$BUILD_DIR/macos/Scribe.app" ]; then
        APP_SIZE=$(du -sh "$BUILD_DIR/macos/Scribe.app" | cut -f1)
        echo "   📱 App: $BUILD_DIR/macos/Scribe.app"
        echo "      Size: $APP_SIZE"
    fi
    
    echo ""
    echo "🚀 To install locally:"
    echo "   cp -R '$BUILD_DIR/macos/Scribe.app' /Applications/"
    echo ""
    echo "📤 To create a release:"
    echo "   1. Create GitHub repo: https://github.com/Data-Wise/scribe"
    echo "   2. Push code and tag: git tag v${VERSION} && git push --tags"
    echo "   3. Upload DMG to release"
    echo "   4. Update homebrew-tap/Casks/scribe.rb with SHA256"
else
    echo ""
    echo "❌ Build failed - no output in $BUILD_DIR"
    exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    Build Complete!                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
