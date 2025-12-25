#!/bin/bash
# Nexus Desktop - Shell Alias Setup
# Adds 'nexus' alias to your shell for easy launching from anywhere

set -e

NEXUS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHELL_RC=""

# Detect shell and config location
if [ -n "$ZSH_VERSION" ] || [ -n "$ZDOTDIR" ]; then
    # ZSH - check for custom ZDOTDIR first
    if [ -n "$ZDOTDIR" ] && [ -f "$ZDOTDIR/.zshrc" ]; then
        SHELL_RC="$ZDOTDIR/.zshrc"
    elif [ -f "$HOME/.config/zsh/.zshrc" ]; then
        SHELL_RC="$HOME/.config/zsh/.zshrc"
    elif [ -f "$HOME/.zshrc" ]; then
        SHELL_RC="$HOME/.zshrc"
    else
        echo "⚠️  Could not find .zshrc"
        echo "   Please manually add this alias to your shell config:"
        echo "   alias nexus='cd $NEXUS_DIR && npm start'"
        exit 1
    fi
elif [ -n "$BASH_VERSION" ]; then
    # Bash
    SHELL_RC="$HOME/.bashrc"
else
    echo "⚠️  Unable to detect shell type"
    echo "   Please manually add this alias to your shell config:"
    echo "   alias nexus='cd $NEXUS_DIR && npm start'"
    exit 1
fi

# Check if alias already exists
if grep -q "alias nexus=" "$SHELL_RC" 2>/dev/null; then
    echo "✅ 'nexus' alias already exists in $SHELL_RC"
    echo ""
    echo "To use it:"
    echo "  1. Restart your terminal, or run: source $SHELL_RC"
    echo "  2. Type: nexus"
    exit 0
fi

# Add alias
echo "" >> "$SHELL_RC"
echo "# Nexus Desktop - Quick Launcher" >> "$SHELL_RC"
echo "alias nexus='cd $NEXUS_DIR && npm start'" >> "$SHELL_RC"

echo "✅ Added 'nexus' alias to $SHELL_RC"
echo ""
echo "To use it:"
echo "  1. Restart your terminal, or run: source $SHELL_RC"
echo "  2. From any directory, type: nexus"
echo ""
echo "The alias will:"
echo "  - Navigate to: $NEXUS_DIR"
echo "  - Launch Nexus with: npm start"
