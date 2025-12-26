# Installation

## Homebrew (Recommended)

The easiest way to install Scribe on macOS:

```bash
# Add the tap
brew tap data-wise/tap

# Install Scribe
brew install --cask data-wise/tap/scribe
```

## Download DMG

Download the latest release from [GitHub Releases](https://github.com/Data-Wise/scribe/releases):

1. Download `Scribe_x.x.x_aarch64.dmg` (Apple Silicon) or `Scribe_x.x.x_x64.dmg` (Intel)
2. Open the DMG file
3. Drag Scribe to Applications
4. Launch from Applications folder

## Build from Source

### Prerequisites

```bash
# Check Node.js version (18+ required)
node --version

# Check npm version (9+ required)
npm --version

# Install Rust (for Tauri)
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
# For AI features
brew install claude    # Claude CLI
brew install gemini    # Gemini CLI (if available)

# For academic features
brew install pandoc    # Document conversion
brew install --cask mactex   # LaTeX for PDF export
brew install quarto    # Quarto documents

# For citations
# Install Zotero + Better BibTeX plugin
```

## Updating

### Homebrew

```bash
brew upgrade data-wise/tap/scribe
```

### Manual

1. Download the latest DMG from GitHub Releases
2. Replace the existing Scribe.app in Applications

## Uninstalling

### Homebrew

```bash
brew uninstall data-wise/tap/scribe
```

### Manual

1. Move Scribe.app from Applications to Trash
2. Optionally remove data: `rm -rf ~/.config/scribe`
