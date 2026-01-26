# Scribe CI/CD Workflow Guide

> Automated release pipeline with checksum validation and Homebrew integration

---

## Overview

The Scribe release workflow automates the entire process from code push to user installation:

```
┌──────────────────────────────────────────────────────────────────┐
│ Developer: git push tag v1.16.3                                  │
└──────────────────────────────────────────────────────────────────┘
                          ↓
          GitHub Actions: Release Workflow Triggered
                          ↓
    ┌─────────────────────┬──────────────────────┐
    ↓                     ↓                      ↓
┌────────┐           ┌──────────┐          ┌─────────┐
│ build  │ (x64)     │ build    │(aarch64) │download │
└────────┘           └──────────┘          └─────────┘
    │                     │                      │
    └─────────────────────┴──────────────────────┘
                          ↓
              ┌───────────────────────┐
              │ create-checksums      │
              │ CHECKSUMS.txt         │
              └───────────────────────┘
                          ↓
              ┌───────────────────────┐
              │ update-homebrew       │
              │ - Verify checksums    │
              │ - Update cask formula │
              │ - Validate with brew  │
              │ - Push to tap         │
              └───────────────────────┘
                          ↓
              ┌───────────────────────┐
              │verify-installation    │
              │ - Install from tap    │
              │ - Test app launches   │
              └───────────────────────┘
                          ↓
         ✅ Release Complete & Verified
              Users can install:
         brew install --cask data-wise/tap/scribe
```

---

## Workflow Structure

### 1. Build Job

**Triggers:** On `v*` tag push
**Matrix:** x64 (Intel) + aarch64 (Apple Silicon) in parallel

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Setup Rust toolchain for target architecture
4. Install npm dependencies
5. Build React frontend (`npm run build:vite`)
6. Build Tauri app for target architecture (`npm run build`)
7. Generate SHA-256 checksum of DMG
8. Upload DMG to GitHub release

**Output:**
- `Scribe_VERSION_x64.dmg` (Intel)
- `Scribe_VERSION_aarch64.dmg` (Apple Silicon)

---

### 2. Create Checksums Job

**Trigger:** After `build` job completes
**Runs On:** macOS (latest)

**Steps:**
1. Get version from git tag
2. Download both DMG files from GitHub release
3. Generate SHA-256 for each DMG
4. Create `CHECKSUMS.txt` with format:
   ```
   SHA256_x64  Scribe_VERSION_x64.dmg
   SHA256_ARM64  Scribe_VERSION_aarch64.dmg
   ```
5. Upload `CHECKSUMS.txt` to GitHub release

**Output:**
- `CHECKSUMS.txt` available in release assets
- Checksums displayed in GitHub Actions logs

---

### 3. Update Homebrew Job

**Trigger:** After `create-checksums` completes
**Runs On:** macOS (latest)
**Access:** Uses `TAP_GITHUB_TOKEN` secret to access homebrew-tap repo

**Steps:**

#### Step 3.1: Download and Verify
- Download both DMGs and CHECKSUMS.txt
- Verify checksums with `shasum -a 256 -c CHECKSUMS.txt`
- Exit with error if verification fails
- Extract SHA256 values for cask update

#### Step 3.2: Update Cask Formula
- Checkout `Data-Wise/homebrew-tap` repository
- Use embedded Ruby script to safely update `Casks/scribe.rb`:
  ```ruby
  # Update version
  version "1.16.3"

  # Update ARM64 (Apple Silicon) checksum
  on_arm do
    sha256 "390574f67..."
    url "https://..."
  end

  # Update x64 (Intel) checksum
  on_intel do
    sha256 "abc123def..."
    url "https://..."
  end
  ```

#### Step 3.3: Validate Cask
- Run `brew audit --cask Casks/scribe.rb`
- Verify formula syntax and requirements
- Exit if validation fails

#### Step 3.4: Commit and Push
- Configure git user (GitHub Actions)
- Commit with detailed message including both SHA256 values
- Push to `data-wise/tap` main branch

**Output:**
- Updated Homebrew formula in tap repository
- Users can now install: `brew install --cask data-wise/tap/scribe`

---

### 4. Verify Installation Job

**Trigger:** After `update-homebrew` completes
**Runs On:** macOS (latest)

**Steps:**
1. Add `data-wise/tap` to Homebrew
2. Install app: `brew install --cask data-wise/tap/scribe`
3. Verify app exists at `/Applications/Scribe.app`
4. List app bundle contents
5. Report successful verification

**Output:**
- Confirmation that installation works end-to-end
- Users know the release is validated

---

## Security Features

### 1. Checksum Verification

**How it works:**
```bash
# Workflow downloads CHECKSUMS.txt and verifies
shasum -a 256 -c CHECKSUMS.txt

# Users can verify locally
curl https://github.com/Data-Wise/scribe/releases/download/v1.16.3/CHECKSUMS.txt
shasum -a 256 Scribe_1.16.3_*.dmg
# Compare with values in CHECKSUMS.txt
```

**Prevents:**
- Corrupted downloads
- MITM attacks
- Accidental file modification

### 2. Safe Cask Updates

**Ruby script approach:**
- Avoids shell injection via sed
- Uses Ruby regex substitution instead
- Reads file, modifies in memory, writes back
- Clear error reporting if update fails

**Old problematic approach:**
```bash
# DANGEROUS - can fail silently or inject code
sed -i '' "s/sha256 \"[^\"]*\"/sha256 \"${CHECKSUM}\"/" Casks/scribe.rb
```

**New safe approach:**
```ruby
# SAFE - explicit substitution with error handling
content = File.read(cask_file)
content.sub!(/on_arm do\s+sha256\s+"[^"]+"/, %Q{on_arm do\n    sha256 "#{arm64_sha}"})
File.write(cask_file, content)
```

### 3. Validation Before Release

- Checksums verified before cask update
- Cask syntax validated with `brew audit`
- Installation tested on macOS runner
- Multiple error exit points prevent invalid releases

---

## Manual Testing

### Test a Release Locally

```bash
# 1. Create a test tag (don't push yet)
git tag v1.16.3-test

# 2. Or push to trigger workflow
git push origin v1.16.3

# 3. Watch GitHub Actions
open https://github.com/Data-Wise/scribe/actions

# 4. After workflow completes, check release
open https://github.com/Data-Wise/scribe/releases/tag/v1.16.3
```

### Test Installation

```bash
# 1. Clear Homebrew cache
rm -rf ~/Library/Caches/Homebrew/downloads/*scribe*

# 2. Update tap
brew tap --repair data-wise/tap

# 3. Install new version
brew install --cask data-wise/tap/scribe

# 4. Verify
ls -la /Applications/Scribe.app
```

### Verify Checksums

```bash
# Download release assets
VERSION="1.16.3"
cd /tmp

# Option A: Use CHECKSUMS.txt
curl -L -o CHECKSUMS.txt \
  "https://github.com/Data-Wise/scribe/releases/download/v${VERSION}/CHECKSUMS.txt"

curl -L -o "Scribe_${VERSION}_aarch64.dmg" \
  "https://github.com/Data-Wise/scribe/releases/download/v${VERSION}/Scribe_${VERSION}_aarch64.dmg"

shasum -a 256 -c CHECKSUMS.txt

# Option B: Verify individual checksum
ACTUAL=$(shasum -a 256 "Scribe_${VERSION}_aarch64.dmg" | awk '{print $1}')
echo "Actual: $ACTUAL"
echo "Compare with CHECKSUMS.txt value"
```

---

## Troubleshooting

### Workflow Failed: Checksum Mismatch

**Symptoms:** Job `update-homebrew` exits with "Checksum verification failed"

**Causes:**
- DMG file corrupted during build
- Network issue downloading assets
- CHECKSUMS.txt not created properly

**Fix:**
```bash
# 1. Check GitHub Actions logs
open https://github.com/Data-Wise/scribe/actions

# 2. Click failed workflow run
# 3. Look for error in "Download and verify" step
# 4. Delete the tag and retry
git tag -d v1.16.3
git push origin :refs/tags/v1.16.3
git tag v1.16.3
git push origin v1.16.3
```

### Workflow Failed: Brew Audit Error

**Symptoms:** Job `update-homebrew` exits with "Cask audit failed"

**Causes:**
- Cask file syntax error
- Invalid URL format
- Missing required fields

**Fix:**
```bash
# 1. Check audit output in GitHub Actions logs
# 2. Manually validate cask locally
brew audit --cask ~/projects/dev-tools/homebrew-tap/Casks/scribe.rb

# 3. Fix syntax errors
# 4. Commit and push fix to homebrew-tap
cd ~/projects/dev-tools/homebrew-tap
git add Casks/scribe.rb
git commit -m "fix: Cask syntax error"
git push
```

### Workflow Failed: Installation Test Failed

**Symptoms:** Job `verify-installation` exits with "Installation failed"

**Causes:**
- Homebrew tap out of sync
- DMG file invalid
- App bundle corrupted

**Fix:**
```bash
# 1. Check logs in GitHub Actions
# 2. Test installation manually (see above)
# 3. If issue is in tap, fix and re-run workflow:
git push origin v1.16.3 --force  # Re-trigger
```

---

## Environment Secrets Required

To run this workflow, you need:

**Repository Secrets (Scribe):**
- None required (uses GITHUB_TOKEN automatically)

**Repository Secrets (homebrew-tap):**
- None (accessed via TAP_GITHUB_TOKEN from Scribe repo)

**Setup Token:**
```bash
# 1. Generate GitHub Personal Access Token
#    https://github.com/settings/tokens
#    Scopes: repo (full), workflow

# 2. Add to Scribe repo secrets
#    Settings → Secrets → TAP_GITHUB_TOKEN

# 3. Value: Your GitHub token with repo access
```

---

## Release Process Checklist

When releasing a new version:

### Pre-Release
- [ ] CHANGELOG.md updated with v1.16.3 section
- [ ] Version bumped in package.json
- [ ] Version bumped in src-tauri/tauri.conf.json
- [ ] Tests passing: `npm run test`
- [ ] TypeScript check: `npm run typecheck`
- [ ] Production build succeeds: `npm run build`

### Release
- [ ] Tag and push: `git tag v1.16.3 && git push origin v1.16.3`
- [ ] Watch GitHub Actions at https://github.com/Data-Wise/scribe/actions

### Post-Release
- [ ] Verify release page: https://github.com/Data-Wise/scribe/releases/tag/v1.16.3
- [ ] Confirm CHECKSUMS.txt in assets
- [ ] Test installation: `brew install --cask data-wise/tap/scribe`
- [ ] Update release notes with any additional info
- [ ] Announce on social media / user channels

---

## Workflow Performance

| Job | Duration | Notes |
|-----|----------|-------|
| build (x64) | 8-10 min | Rust compile time |
| build (aarch64) | 8-10 min | Rust compile time (parallel) |
| create-checksums | 2-3 min | Download + hash |
| update-homebrew | 3-5 min | Download + verify + update + validate |
| verify-installation | 5-7 min | Install + test |
| **Total** | **15-20 min** | Sequential after build |

---

## Version History

### v2.0 (Current) - Complete Overhaul

**Added:**
- ✅ `create-checksums` job - Generates CHECKSUMS.txt
- ✅ `verify-installation` job - Tests Homebrew installation
- ✅ Ruby-based cask updates (safe from injection)
- ✅ Checksum verification before cask update
- ✅ `brew audit` validation
- ✅ Environment variables for all untrusted inputs

**Fixed:**
- ✅ Placeholder issue (no more sed substitution)
- ✅ Security vulnerabilities in sed commands
- ✅ Silent failures in cask updates
- ✅ No verification of checksums before publishing

**Removed:**
- ❌ Problematic sed-based cask updates
- ❌ Manual placeholder substitution

### v1.0 (Previous)

**Issues:**
- ❌ Used sed placeholders that didn't exist
- ❌ No checksum verification
- ❌ Silent failures in automation
- ❌ No installation testing
- ❌ Command injection vulnerabilities

---

## References

- **Homebrew Tap Repo**: https://github.com/Data-Wise/homebrew-tap
- **Release Checklist**: `RELEASE-CHECKLIST.md`
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Homebrew Cask Guide**: https://docs.brew.sh/Cask-Cookbook
- **Checksum Security**: https://en.wikipedia.org/wiki/Checksum

---

**Last Updated:** 2026-01-25
**Maintained By:** GitHub Actions + Claude AI
**Status:** ✅ Production Ready
