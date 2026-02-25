# Scribe Release Process

## Current Version: v1.20.0

This document describes the release process for Scribe.

---

## Quick Release Checklist

```bash
# 1. Update version in ALL files (they drift!)
#    - package.json
#    - src-tauri/Cargo.toml
#    - src-tauri/tauri.conf.json
#    - .STATUS
#    Verify: grep for the old version across the entire repo

# 2. Run tests
npm test

# 3. Build release
npm run tauri build

# 4. Create GitHub release and upload DMG

# 5. Update Homebrew tap with SHA256 from CHECKSUMS.txt
```

---

## Build Artifacts

After running `npm run build`:

```
src-tauri/target/release/bundle/
├── macos/
│   └── Scribe.app              # macOS application bundle
└── dmg/
    └── Scribe_VERSION_ARCH.dmg # Distributable disk image
```

### Current Build

- **Version**: v1.20.0
- **Architecture**: aarch64 (Apple Silicon)
- **DMG Size**: ~5.5 MB
- **SHA256**: See `CHECKSUMS.txt` in the GitHub release assets

---

## Installation Methods

### 1. Homebrew (Recommended)

```bash
# Add tap
brew tap data-wise/tap

# Install Scribe
brew install --cask data-wise/tap/scribe

# Update
brew upgrade --cask scribe
```

### 2. Direct Download

Download DMG from GitHub Releases:
- macOS Intel: `Scribe_VERSION_x64.dmg`
- macOS Apple Silicon: `Scribe_VERSION_aarch64.dmg`

### 3. Build from Source

```bash
git clone https://github.com/Data-Wise/scribe.git
cd scribe
npm install
npm run build
cp -R src-tauri/target/release/bundle/macos/Scribe.app /Applications/
```

---

## Pre-Release Testing

Before releasing:

1. **Run all tests**: `npm test`
2. **TypeScript check**: `npm run typecheck`
3. **Build locally**: `npm run build`
4. **Test installation**: Copy to `/Applications/` and launch
5. **Verify features**:
   - Global hotkey (⌘⇧N)
   - Command palette (⌘K)
   - Theme switching
   - Focus mode (⌘⇧F)

---

## GitHub Release Process

### Manual Release

1. Create tag:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

2. Create release on GitHub:
   - Go to Releases → Draft a new release
   - Select tag: `vX.Y.Z`
   - Title: `Scribe vX.Y.Z`
   - Mark as pre-release
   - Upload DMG files

3. Update Homebrew tap:
   ```bash
   cd ~/projects/dev-tools/homebrew-tap
   # Update Casks/scribe.rb with new SHA256
   git commit -am "Update Scribe to vX.Y.Z"
   git push
   ```

### Automated Release (GitHub Actions)

Push a tag to trigger automated release:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

The workflow will:
1. Build for Intel and Apple Silicon
2. Create draft release
3. Upload DMG files
4. Update Homebrew tap (requires TAP_GITHUB_TOKEN secret)

---

## Version Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Stable | `X.Y.Z` | `1.20.0` |
| Patch | `X.Y.Z` | `1.20.1` |
| Minor | `X.Y.0` | `1.21.0` |
| Major | `X.0.0` | `2.0.0` |

---

## Homebrew Cask Location

```
~/projects/dev-tools/homebrew-tap/Casks/scribe.rb
```

After updating, push to remote:
```bash
cd ~/projects/dev-tools/homebrew-tap
git add Casks/scribe.rb
git commit -m "Update Scribe to vX.Y.Z"
git push
```

---

## Troubleshooting

### Build fails with Rust errors

```bash
# Update Rust
rustup update

# Clean and rebuild
cd src-tauri
cargo clean
cd ..
npm run build
```

### App won't open (macOS Gatekeeper)

```bash
# Remove quarantine attribute
xattr -cr /Applications/Scribe.app
```

### Homebrew can't find cask

```bash
# Update tap
brew tap --repair
brew update
```

---

## Files Modified for Release

| File | Purpose |
|------|---------|
| `package.json` | npm version |
| `src-tauri/Cargo.toml` | Rust version |
| `src-tauri/tauri.conf.json` | Tauri version |
| `.STATUS` | Status tracking |
| `CHANGELOG.md` | Release notes |
| `homebrew-tap/Casks/scribe.rb` | Homebrew cask |
