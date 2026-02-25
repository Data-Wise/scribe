# Scribe Release Checklist

> Prevents checksum mismatches and ensures consistent releases across platforms

---

## Pre-Release (In Feature Branch)

- [ ] Version bumped in `package.json` and `src-tauri/tauri.conf.json`
- [ ] CHANGELOG.md updated with v{VERSION} section
- [ ] Tests passing: `npm run test`
- [ ] TypeScript check passing: `npm run typecheck`
- [ ] Production build succeeds: `npm run build`

---

## Build DMG Artifacts

```bash
# From scribe root
npm run build  # Creates DMG files in src-tauri/target/release/bundle/dmg/
```

**Output files:**
- `Scribe_{VERSION}_aarch64.dmg` (Apple Silicon)
- `Scribe_{VERSION}_x64.dmg` (Intel - optional for v1.16.2+)

---

## Generate & Verify Checksums

**Before uploading to GitHub, generate checksums:**

```bash
# ARM64 (Apple Silicon - REQUIRED)
shasum -a 256 src-tauri/target/release/bundle/dmg/Scribe_1.16.2_aarch64.dmg
# Output: 390574f67891240fdc6786e6616407784c0955be62a1b9b8bd362c623e1cbe13

# Intel x64 (if building)
shasum -a 256 src-tauri/target/release/bundle/dmg/Scribe_1.16.2_x64.dmg
```

**Save these values - you'll need them for the formula update.**

---

## GitHub Release

1. Create release on GitHub: `https://github.com/Data-Wise/scribe/releases/new`
   - **Tag version:** `v1.16.2`
   - **Title:** `Release v1.16.2`
   - **Description:** Copy from CHANGELOG.md

2. **Upload DMG files** to release assets

3. **Create CHECKSUMS.txt file:**
   ```
   390574f67891240fdc6786e6616407784c0955be62a1b9b8bd362c623e1cbe13  Scribe_1.16.2_aarch64.dmg
   ```

4. **Publish release** (do NOT check "Pre-release" or "Draft")

---

## Update Homebrew Formula

**File:** `~/projects/dev-tools/homebrew-tap/Casks/scribe.rb`

Update the `sha256` hash in the `on_arm` block:

```ruby
on_arm do
  sha256 "390574f67891240fdc6786e6616407784c0955be62a1b9b8bd362c623e1cbe13"
  url "https://github.com/Data-Wise/scribe/releases/download/v#{version}/Scribe_#{version}_aarch64.dmg"
end
```

**Critical:** The checksum MUST match the one generated from the actual DMG file.

---

## Test Homebrew Installation

```bash
# 1. Clear Homebrew cache
rm -rf ~/Library/Caches/Homebrew/downloads/*scribe*

# 2. Test installation
brew install --cask data-wise/tap/scribe

# 3. Verify version
/Applications/Scribe.app/Contents/MacOS/scribe --version
# Expected: 1.16.2
```

**If test fails:** Check checksum, clear cache, and retry.

---

## Commit & Push Formula Update

```bash
cd ~/projects/dev-tools/homebrew-tap

git add Casks/scribe.rb
git commit -m "fix: Update Scribe v1.16.2 checksum in Homebrew formula

Checksum: 390574f67891240fdc6786e6616407784c0955be62a1b9b8bd362c623e1cbe13
Generated from: src-tauri/target/release/bundle/dmg/Scribe_1.16.2_aarch64.dmg

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

git push origin main
```

---

## Post-Release Verification

- [ ] GitHub release page shows DMG files
- [ ] `brew install --cask data-wise/tap/scribe` succeeds
- [ ] App runs and shows correct version
- [ ] Homebrew formula passes linting: `brew audit --cask data-wise/tap/scribe`
- [ ] Update `.STATUS` file:
  ```
  status: stable
  version: 1.16.2
  ```

---

## Automation Opportunities

### GitHub Actions Workflow

Could add `.github/workflows/release.yml`:

```yaml
name: Release

on:
  release:
    types: [published]

jobs:
  verify-checksum:
    runs-on: macos-latest-xlarge
    steps:
      - uses: actions/checkout@v4

      - name: Generate checksums
        run: |
          npm run build
          shasum -a 256 src-tauri/target/release/bundle/dmg/Scribe_*.dmg > CHECKSUMS.txt

      - name: Upload checksums to release
        uses: actions/upload-release-asset@v1
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: ./CHECKSUMS.txt
          asset_name: CHECKSUMS.txt
```

### Pre-Release Validation Script

```bash
#!/bin/bash
# scripts/validate-release.sh

VERSION=${1:?Usage: validate-release.sh <version>}
DMG="src-tauri/target/release/bundle/dmg/Scribe_${VERSION}_aarch64.dmg"

if [ ! -f "$DMG" ]; then
  echo "❌ DMG not found: $DMG"
  exit 1
fi

CHECKSUM=$(shasum -a 256 "$DMG" | cut -d' ' -f1)
echo "✅ Checksum: $CHECKSUM"

# Check formula has matching checksum
FORMULA_CHECKSUM=$(grep -oP 'sha256 "\K[^"]+' ~/projects/dev-tools/homebrew-tap/Casks/scribe.rb)

if [ "$CHECKSUM" == "$FORMULA_CHECKSUM" ]; then
  echo "✅ Formula checksum matches DMG"
else
  echo "❌ Checksum mismatch!"
  echo "   DMG:     $CHECKSUM"
  echo "   Formula: $FORMULA_CHECKSUM"
  exit 1
fi
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| SHA-256 mismatch when installing | Clear cache: `rm -rf ~/Library/Caches/Homebrew/downloads/*` |
| Formula checksum out of sync | Regenerate from actual DMG, update formula, commit |
| DMG file path changes | Update formula `url` field to match GitHub release asset path |
| Build creates different DMG | Ensure clean build: `npm run clean && npm run build` |

---

## Next Release (v1.16.3+)

Copy this checklist and update version numbers:

1. Find & replace `1.16.2` → `1.16.3`
2. Follow steps 1-8 above
3. Keep this checklist in sync with actual workflow

---

**Last Updated:** 2026-01-25
**Version:** 1.0
