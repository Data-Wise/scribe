# Release Automation Fix Plan

**Date:** 2026-01-24
**Issue:** Automatic Homebrew releases failing since v1.14.0
**Status:** 🔴 BROKEN → 🟡 PARTIALLY FIXED → 🟢 READY (after completing steps)

---

## 🔍 Issues Found

### ✅ Issue 1: Missing Step ID (FIXED)

**Problem:** `steps.download.outputs` referenced non-existent step ID
**Fix:** Added `id: download` to "Download release assets" step
**Status:** ✅ Fixed in commit `cf9434a`

---

### 🔴 Issue 2: Missing GitHub Token (ACTION REQUIRED)

**Problem:** `TAP_GITHUB_TOKEN` secret not configured
**Error:** `##[error]Input required and not supplied: token`
**Impact:** All releases since v1.14.0 failed to update Homebrew tap

**Fix Steps:**

1. **Create Personal Access Token (PAT):**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: `Homebrew Tap Auto-Update`
   - Scopes: ✅ `repo` (full control)
   - Expiration: 1 year (recommended)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again)

2. **Add Secret to Repository:**
   - Go to: https://github.com/Data-Wise/scribe/settings/secrets/actions
   - Click "New repository secret"
   - Name: `TAP_GITHUB_TOKEN`
   - Value: [paste token from step 1]
   - Click "Add secret"

3. **Verify Secret:**
   ```bash
   gh secret list
   # Should show: TAP_GITHUB_TOKEN
   ```

---

### 🟡 Issue 3: Version Mismatch (ACTION REQUIRED)

**Problem:** Package versions don't match dev branch state

| File | Current | Should Be |
|------|---------|-----------|
| `package.json` | 1.14.0 | 1.16.1 |
| `src-tauri/tauri.conf.json` | 1.14.0 | 1.16.1 |
| `src-tauri/Cargo.toml` | 1.14.0 | 1.16.1 |

**Impact:** Release assets have wrong filenames, breaking Homebrew downloads

**Fix Steps:**

1. **Update version numbers:**
   ```bash
   # Update package.json
   npm version 1.16.1 --no-git-tag-version

   # Update src-tauri/tauri.conf.json
   sed -i '' 's/"version": "1.14.0"/"version": "1.16.1"/' src-tauri/tauri.conf.json

   # Update src-tauri/Cargo.toml
   sed -i '' 's/^version = "1.14.0"/version = "1.16.1"/' src-tauri/Cargo.toml
   ```

2. **Commit version bump:**
   ```bash
   git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml package-lock.json
   git commit -m "chore: Bump version to v1.16.1

   Reflects Phase 1 Technical Debt Remediation completion.

   Changes:
   - 4 new extracted components (KeyboardShortcutHandler, EditorOrchestrator, etc.)
   - -881 lines removed from monolithic files
   - +32 tests (2,162 passing)
   - 0 breaking changes

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

3. **Push to dev:**
   ```bash
   git push origin dev
   ```

---

## 🚀 Release Workflow (After Fixes)

### Step 1: Test the Workflow Fix (Optional)

Before creating a new release, verify the workflow fix:

```bash
# Check workflow syntax
gh workflow view release.yml

# List recent workflow runs
gh run list --workflow=release.yml --limit 5
```

### Step 2: Create v1.16.1 Release

**From Main Branch (recommended):**

```bash
# 1. Merge dev → main (if ready for stable release)
git checkout main
git pull origin main
gh pr create --base main --head dev --title "Release v1.16.1" --body "Phase 1 Technical Debt Remediation

**Changes:**
- Extracted 4 components from monolithic files
- Reduced App.tsx by 13% (267 lines)
- Reduced SettingsModal.tsx by 27% (623 lines)
- Added 32 new tests (2,162 passing)
- Fixed auto-seed in test environment
- 0 breaking changes

See CHANGELOG.md for full details."

# 2. Merge the PR (in GitHub UI or via gh)
gh pr merge <PR-NUMBER> --merge

# 3. Create and push tag
git checkout main
git pull origin main
git tag -a v1.16.1 -m "Release v1.16.1 - Phase 1 Technical Debt Remediation"
git push origin v1.16.1
```

**OR From Dev Branch (for pre-release testing):**

```bash
# Create tag directly on dev
git checkout dev
git pull origin dev
git tag -a v1.16.1-alpha -m "Release v1.16.1-alpha - Phase 1 Testing"
git push origin v1.16.1-alpha
```

### Step 3: Monitor Release Workflow

```bash
# Watch workflow execution
gh run watch

# Or check status
gh run list --workflow=release.yml --limit 1

# If it fails, view logs
gh run view --log-failed
```

### Step 4: Verify Homebrew Update

```bash
# Check homebrew-tap was updated
cd ~/projects/dev-tools/homebrew-tap
git pull origin main
git log --oneline -n 3

# Should see: "Update Scribe to v1.16.1"

# Check cask content
cat Casks/scribe.rb | grep version
# Should show: version "1.16.1"
```

### Step 5: Test Installation

```bash
# Update tap
brew update

# Check available version
brew info data-wise/tap/scribe

# Upgrade (if already installed)
brew upgrade data-wise/tap/scribe

# OR install fresh
brew install --cask data-wise/tap/scribe
```

---

## 🔄 Future Releases (Fully Automated)

Once the token is configured and versions are correct:

```bash
# 1. Bump version
npm version patch  # or minor, or major
# This updates package.json AND creates a git tag

# 2. Update tauri versions manually
sed -i '' 's/"version": "X.Y.Z"/"version": "X.Y.Z+1"/' src-tauri/tauri.conf.json
sed -i '' 's/^version = "X.Y.Z"/version = "X.Y.Z+1"/' src-tauri/Cargo.toml

# 3. Commit
git add src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "chore: Bump version to vX.Y.Z+1"

# 4. Push tag
git push origin vX.Y.Z+1

# 5. Workflow runs automatically:
#    ✅ Builds x64 + ARM64 DMGs
#    ✅ Creates GitHub Release
#    ✅ Downloads DMGs
#    ✅ Calculates SHA256
#    ✅ Updates homebrew-tap/Casks/scribe.rb
#    ✅ Commits and pushes to tap
#    ✅ Users can `brew upgrade`
```

---

## 📋 Quick Checklist

- [x] Fix workflow bug (missing step ID)
- [x] Commit and push workflow fix
- [ ] Create GitHub PAT with `repo` scope
- [ ] Add `TAP_GITHUB_TOKEN` secret to repository
- [ ] Update version to 1.16.1 in package.json
- [ ] Update version to 1.16.1 in tauri.conf.json
- [ ] Update version to 1.16.1 in Cargo.toml
- [ ] Commit version bump
- [ ] Push to dev
- [ ] Merge dev → main (or create alpha tag)
- [ ] Create v1.16.1 tag
- [ ] Push tag to trigger workflow
- [ ] Monitor workflow execution
- [ ] Verify Homebrew tap updated
- [ ] Test brew install/upgrade

---

## 🛠️ Troubleshooting

### Workflow Still Fails After Token Added

```bash
# Check secret is visible
gh secret list
# Should show TAP_GITHUB_TOKEN

# Re-run failed workflow
gh run rerun <RUN-ID>

# Or delete and recreate tag
git tag -d v1.16.1
git push origin :v1.16.1
git tag -a v1.16.1 -m "Release v1.16.1"
git push origin v1.16.1
```

### DMG Download Fails (404 Error)

**Cause:** Version mismatch between tag and package.json

**Fix:** Ensure all three files have matching versions:
- `package.json`: `"version": "1.16.1"`
- `src-tauri/tauri.conf.json`: `"version": "1.16.1"`
- `src-tauri/Cargo.toml`: `version = "1.16.1"`

### Homebrew Formula Has Wrong SHA256

**Cause:** Workflow calculated SHA before build completed

**Fix:** Re-run the `update-homebrew` job:
```bash
gh run rerun <RUN-ID> --job=update-homebrew
```

---

## 📚 Related Files

- **Workflow:** `.github/workflows/release.yml`
- **Homebrew Tap:** `~/projects/dev-tools/homebrew-tap/Casks/scribe.rb`
- **Version Files:**
  - `package.json`
  - `src-tauri/tauri.conf.json`
  - `src-tauri/Cargo.toml`

---

**Created:** 2026-01-24
**Last Updated:** 2026-01-24
**Status:** Ready for execution
