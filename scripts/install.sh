#!/bin/bash
# Scribe - Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/Data-Wise/scribe/main/scripts/install.sh | bash
# Or:    ./scripts/install.sh

set -e  # Exit on error

VERSION="0.4.0-alpha.1"
APP_NAME="Scribe"
INSTALL_DIR="/Applications"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     ███████╗ ██████╗██████╗ ██╗██████╗ ███████╗          ║"
echo "║     ██╔════╝██╔════╝██╔══██╗██║██╔══██╗██╔════╝          ║"
echo "║     ███████╗██║     ██████╔╝██║██████╔╝█████╗            ║"
echo "║     ╚════██║██║     ██╔══██╗██║██╔══██╗██╔══╝            ║"
echo "║     ███████║╚██████╗██║  ██║██║██████╔╝███████╗          ║"
echo "║     ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝          ║"
echo "║                                                           ║"
echo "║         ADHD-Friendly Distraction-Free Writer            ║"
echo "║                   v${VERSION}                              ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Darwin)
        PLATFORM="macos"
        case "$ARCH" in
            x86_64) ARCH_SUFFIX="x64" ;;
            arm64)  ARCH_SUFFIX="aarch64" ;;
            *)
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
                ;;
        esac
        ;;
    Linux)
        PLATFORM="linux"
        ARCH_SUFFIX="$ARCH"
        INSTALL_DIR="$HOME/.local/share/applications"
        ;;
    *)
        echo "❌ Unsupported operating system: $OS"
        exit 1
        ;;
esac

echo "📋 System detected: $PLATFORM ($ARCH_SUFFIX)"
echo ""

# Installation method selection
echo "Choose installation method:"
echo "  1) Homebrew (recommended for macOS)"
echo "  2) Direct download"
echo "  3) Build from source"
echo ""
read -p "Enter choice [1-3]: " INSTALL_METHOD

case "$INSTALL_METHOD" in
    1)
        # Homebrew installation
        echo ""
        echo "🍺 Installing via Homebrew..."
        
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew not found!"
            echo "   Install from: https://brew.sh"
            exit 1
        fi
        
        echo "   Adding Data-Wise tap..."
        brew tap data-wise/tap 2>/dev/null || true
        
        echo "   Installing Scribe..."
        brew install --cask data-wise/tap/scribe
        
        echo ""
        echo "✅ Scribe installed successfully!"
        echo ""
        echo "🚀 Launch Scribe:"
        echo "   • Open from Applications folder"
        echo "   • Or use global hotkey: ⌘⇧N"
        ;;
        
    2)
        # Direct download
        echo ""
        echo "📥 Direct download installation..."
        
        DOWNLOAD_URL="https://github.com/Data-Wise/scribe/releases/download/v${VERSION}/Scribe_${VERSION}_${ARCH_SUFFIX}.dmg"
        
        echo "   Downloading from: $DOWNLOAD_URL"
        
        TEMP_DIR=$(mktemp -d)
        DMG_FILE="$TEMP_DIR/Scribe.dmg"
        
        if command -v curl &> /dev/null; then
            curl -fsSL "$DOWNLOAD_URL" -o "$DMG_FILE"
        elif command -v wget &> /dev/null; then
            wget -q "$DOWNLOAD_URL" -O "$DMG_FILE"
        else
            echo "❌ Neither curl nor wget found!"
            exit 1
        fi
        
        echo "   Mounting DMG..."
        MOUNT_POINT=$(hdiutil attach "$DMG_FILE" -nobrowse | grep Volumes | awk '{print $3}')
        
        echo "   Copying to Applications..."
        cp -R "$MOUNT_POINT/Scribe.app" "$INSTALL_DIR/"
        
        echo "   Cleaning up..."
        hdiutil detach "$MOUNT_POINT" -quiet
        rm -rf "$TEMP_DIR"
        
        echo ""
        echo "✅ Scribe installed to $INSTALL_DIR/Scribe.app"
        ;;
        
    3)
        # Build from source
        echo ""
        echo "🔨 Building from source..."
        
        # Check dependencies
        echo "   Checking dependencies..."
        
        if ! command -v node &> /dev/null; then
            echo "❌ Node.js not found! Install from: https://nodejs.org/"
            exit 1
        fi
        
        if ! command -v cargo &> /dev/null; then
            echo "❌ Rust not found! Install from: https://rustup.rs/"
            exit 1
        fi
        
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            echo "❌ Node.js 18+ required (found $(node -v))"
            exit 1
        fi
        
        echo "   ✅ Node.js $(node -v)"
        echo "   ✅ Rust $(rustc --version | cut -d' ' -f2)"
        
        # Clone or use existing directory
        if [ -f "package.json" ] && grep -q '"name": "scribe"' package.json; then
            echo "   Using current directory..."
        else
            echo "   Cloning repository..."
            git clone https://github.com/Data-Wise/scribe.git
            cd scribe
        fi
        
        echo "   Installing dependencies..."
        npm install
        
        echo "   Building Tauri app (this may take a few minutes)..."
        npm run build
        
        echo "   Copying to Applications..."
        cp -R "src-tauri/target/release/bundle/macos/Scribe.app" "$INSTALL_DIR/"
        
        echo ""
        echo "✅ Scribe built and installed!"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                 Installation Complete!                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Quick Start:"
echo "   • Global hotkey: ⌘⇧N (opens Scribe from anywhere)"
echo "   • Command palette: ⌘K"
echo "   • Focus mode: ⌘⇧F"
echo ""
echo "📚 Documentation:"
echo "   https://github.com/Data-Wise/scribe#readme"
echo ""
echo "⚠️  Note: This is an ALPHA release (v${VERSION})"
echo "   Please report issues at:"
echo "   https://github.com/Data-Wise/scribe/issues"
echo ""
