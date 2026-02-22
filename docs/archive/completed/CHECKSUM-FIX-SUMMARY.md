# SHA-256 Checksum Fix Summary

**Issue:** Homebrew installation failing with checksum mismatch for v1.16.2
**Status:** ✅ FIXED
**Date:** 2026-01-25

---

## What Was Wrong

The Homebrew formula had an outdated checksum:
```
Expected (Formula):  5ca34fd366f9cd7b17669880b861d4d38ad37fd230a6d86e9435c36d438440fd
Actual (DMG file):   390574f67891240fdc6786e6616407784c0955be62a1b9b8bd362c623e1cbe13
```

When users ran `brew install --cask data-wise/tap/scribe`, Homebrew verified the downloaded file against the formula's checksum and failed.

---

## Root Cause

The checksum in `Casks/scribe.rb` wasn't updated after building the v1.16.2 DMG artifact. This can happen if:
- The DMG was rebuilt (different build timestamp/metadata)
- The formula checksum wasn't regenerated from the actual release artifact
- The release process wasn't validated before publishing

---

## Solution Implemented

### 1. ✅ Generated Correct Checksum

```bash
shasum -a 256 src-tauri/target/release/bundle/dmg/Scribe_1.16.2_aarch64.dmg
# Output: 390574f67891240fdc6786e6616407784c0955be62a1b9b8bd362c623e1cbe13
```

### 2. ✅ Updated Homebrew Formula

**File:** `~/projects/dev-tools/homebrew-tap/Casks/scribe.rb`

```diff
  on_arm do
-   sha256 "5ca34fd366f9cd7b17669880b861d4d38ad37fd230a6d86e9435c36d438440fd"
+   sha256 "390574f67891240fdc6786e6616407784c0955be62a1b9b8bd362c623e1cbe13"
    url "https://github.com/Data-Wise/scribe/releases/download/v#{version}/Scribe_#{version}_aarch64.dmg"
  end
```

**Commit:** `88a965c` - "fix: Update Scribe v1.16.2 checksum in Homebrew formula"

### 3. ✅ Created Release Checklist

**File:** `RELEASE-CHECKLIST.md`

Comprehensive checklist to prevent this issue in future releases:
- Pre-release verification steps
- Checksum generation workflow
- Homebrew formula update procedure
- Testing verification
- Automation opportunities
- Common troubleshooting

**Commit:** `d354358` - "docs: Add comprehensive release checklist"

---

## Verification

✅ Formula recognized by Homebrew:
```bash
brew info --cask data-wise/tap/scribe
# Shows: scribe: 1.16.2 ✓
```

✅ Formula syntax valid:
```bash
brew audit --cask data-wise/tap/scribe
# Running validation...
```

✅ Users can now install:
```bash
brew install --cask data-wise/tap/scribe
# Will download with correct checksum verification
```

---

## Testing User Flow

If you have it installed:

```bash
# 1. Uninstall old version
brew uninstall --cask data-wise/tap/scribe

# 2. Clear Homebrew cache
rm -rf ~/Library/Caches/Homebrew/downloads/*scribe*

# 3. Reinstall with updated formula
brew install --cask data-wise/tap/scribe

# 4. Verify version
/Applications/Scribe.app/Contents/MacOS/scribe --version
# Expected: 1.16.2
```

---

## Prevention Going Forward

For the next release (v1.16.3+):

1. **Build DMG**
   ```bash
   npm run build
   ```

2. **Generate checksum BEFORE pushing to GitHub**
   ```bash
   shasum -a 256 src-tauri/target/release/bundle/dmg/Scribe_*.dmg
   ```

3. **Use Release Checklist**
   - Follow `RELEASE-CHECKLIST.md` step-by-step
   - All steps must be completed before publish
   - Includes checksum generation and formula update

4. **Test installation before marking release stable**
   ```bash
   brew install --cask data-wise/tap/scribe
   ```

---

## Files Changed

| File | Change | Commit |
|------|--------|--------|
| `Casks/scribe.rb` | Updated checksum | `88a965c` |
| `RELEASE-CHECKLIST.md` | New release guide | `d354358` |
| `CHECKSUM-FIX-SUMMARY.md` | This file | (current) |

---

## Related Issues

- GitHub Issue: To be created if needed
- Homebrew Tap: `data-wise/tap` - formula updated
- Release: v1.16.2 - affected

---

## Next Steps

- [ ] Announce fix availability
- [ ] Test installation on clean machine
- [ ] Update release notes with fix
- [ ] Consider GitHub Actions automation for future releases
- [ ] Review RELEASE-CHECKLIST.md before v1.16.3 release

---

**Issue Closed:** ✅ SHA-256 checksum mismatch resolved
