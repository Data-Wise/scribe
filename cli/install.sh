#!/bin/bash
# Scribe CLI - Installation Script
# Copies scribe.zsh to ZSH functions directory

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_FILE="$SCRIPT_DIR/scribe.zsh"
TARGET_DIR="$HOME/.config/zsh/functions"
TARGET_FILE="$TARGET_DIR/scribe.zsh"

echo "╭─────────────────────────────────────────────╮"
echo "│ 📝 Scribe CLI Installer                     │"
echo "╰─────────────────────────────────────────────╯"
echo ""

# Check source exists
if [[ ! -f "$SOURCE_FILE" ]]; then
    echo "❌ Error: scribe.zsh not found at $SOURCE_FILE"
    exit 1
fi

# Create target directory if needed
if [[ ! -d "$TARGET_DIR" ]]; then
    echo "📁 Creating $TARGET_DIR..."
    mkdir -p "$TARGET_DIR"
fi

# Copy file
echo "📋 Copying scribe.zsh..."
cp "$SOURCE_FILE" "$TARGET_FILE"

# Install man page
MAN_DIR="$HOME/.local/share/man/man1"
MAN_SOURCE="$SCRIPT_DIR/scribe.1"
if [[ -f "$MAN_SOURCE" ]]; then
    echo "📘 Installing man page..."
    mkdir -p "$MAN_DIR"
    cp "$MAN_SOURCE" "$MAN_DIR/scribe.1"
fi

# Check if already sourced in .zshrc
ZSHRC="$HOME/.zshrc"
if [[ -f "$HOME/.config/zsh/.zshrc" ]]; then
    ZSHRC="$HOME/.config/zsh/.zshrc"
fi

if grep -q "scribe.zsh" "$ZSHRC" 2>/dev/null; then
    echo "✅ Already sourced in $ZSHRC"
else
    echo ""
    echo "📝 Add this to your $ZSHRC:"
    echo ""
    echo "  # Scribe CLI - Terminal-based note access"
    echo "  if [[ -f ~/.config/zsh/functions/scribe.zsh ]]; then"
    echo "      source ~/.config/zsh/functions/scribe.zsh"
    echo "  fi"
fi

echo ""
echo "✅ Scribe CLI installed to $TARGET_FILE"
echo ""
echo "🚀 Quick start:"
echo "   source $TARGET_FILE"
echo "   scribe help"
echo ""
