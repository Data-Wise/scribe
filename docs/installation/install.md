# Installation

> **Requirements:** macOS 10.15+ (Catalina) on Apple Silicon (M1/M2/M3)

## Homebrew (Recommended)

The easiest way to install Scribe on macOS:

```bash
# Add the tap
brew tap data-wise/tap

# Install Scribe
brew install --cask data-wise/tap/scribe
```

## One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/Data-Wise/scribe/main/scripts/install.sh | bash
```

## Download DMG

Download the latest release from [GitHub Releases](https://github.com/Data-Wise/scribe/releases):

1. Download `Scribe_x.x.x_aarch64.dmg` (Apple Silicon)
2. Open the DMG file
3. Drag Scribe to Applications
4. Launch from Applications folder

## Build from Source

Building from source works on both Apple Silicon and Intel Macs.

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Rust (for Tauri)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Build Steps

```bash
# Clone the repository
git clone https://github.com/Data-Wise/scribe
cd scribe

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

The built application will be in:
- `src-tauri/target/release/bundle/macos/Scribe.app`
- `src-tauri/target/release/bundle/dmg/Scribe_x.x.x_aarch64.dmg`

## Optional Dependencies

For full functionality, install these optional tools:

```bash
# For AI features (CLI-based, no API keys needed)
brew install claude    # Claude CLI
# or
npm install -g @anthropic/claude-cli

# For academic features
brew install pandoc              # Document conversion
brew install --cask mactex       # LaTeX for PDF export
brew install quarto              # Quarto documents

# For citations
# Install Zotero + Better BibTeX plugin
brew install --cask zotero
```

## Updating

### Homebrew

```bash
brew upgrade --cask data-wise/tap/scribe
```

### Manual

1. Download the latest DMG from GitHub Releases
2. Replace the existing Scribe.app in Applications

## Uninstalling

### Homebrew

```bash
brew uninstall --cask data-wise/tap/scribe
```

### Manual

1. Move Scribe.app from Applications to Trash
2. Optionally remove data:
   ```bash
   rm -rf ~/Library/Application\ Support/com.scribe.app
   rm -rf ~/Library/Caches/com.scribe.app
   rm -rf ~/Library/Preferences/com.scribe.app.plist
   ```

## Troubleshooting

### Intel Mac Users

Intel builds are not yet available. Options:
1. **Build from source** (recommended)
2. **Rosetta 2** - The ARM build may work under Rosetta

### "App is damaged" Error

If macOS says the app is damaged:
```bash
xattr -cr /Applications/Scribe.app
```

### Global Hotkey Not Working

The global hotkey (⌘⇧N) requires Accessibility permissions:
1. Open System Settings → Privacy & Security → Accessibility
2. Add Scribe to the list
3. Restart Scribe

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **⌘⇧N** | Open Scribe (global) |
| **⌘K** | Command palette |
| **⌘N** | New note |
| **⌘D** | Daily note |
| **⌘E** | Toggle edit/preview |
| **⌘⇧F** | Focus mode |
