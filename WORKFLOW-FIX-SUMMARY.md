# v1.16.3 Release Workflow - Critical Fix Summary

**Date:** 2026-01-26
**Status:** 🟡 IN PROGRESS - Workflow run #34 with all four fixes applied

---

## FOUR Issues Found and Fixed

### Issue #1: Version Mismatch (Run #21343601236 - FAILED)

**Problem:** Build configuration files had outdated version numbers

| File | Expected | Actual | Status |
|------|----------|--------|--------|
| `src-tauri/tauri.conf.json` | 1.16.3 | **1.16.2** | ❌ WRONG |
| `package.json` | 1.16.3 | **1.16.2** | ❌ WRONG |
| `src-tauri/Cargo.toml` | 1.16.3 | **1.16.1** | ❌ WRONG |

**Cascade Failure:**
```
Build jobs → Scribe_1.16.2_*.dmg files created
   ↓
Workflow downloads → Looking for Scribe_1.16.3_*.dmg
   ↓
Files not found → shasum verification failed
```

**Fix (Commit 76a6c17):**
```bash
- src-tauri/tauri.conf.json: 1.16.2 → 1.16.3
- package.json: 1.16.2 → 1.16.3
- src-tauri/Cargo.toml: 1.16.1 → 1.16.3
```

---

### Issue #2: Filename Mismatch (Run #31 - FAILED)

**Problem:** Downloaded filenames didn't match CHECKSUMS.txt entries

**Workflow downloaded as:**
```bash
curl -o x64.dmg "${URL}/Scribe_1.16.3_x64.dmg"
curl -o aarch64.dmg "${URL}/Scribe_1.16.3_aarch64.dmg"
```

**But CHECKSUMS.txt contained:**
```
620c...  Scribe_1.16.3_aarch64.dmg
340d...  Scribe_1.16.3_x64.dmg
```

**Error:**
```
shasum: Scribe_1.16.3_aarch64.dmg: No such file or directory
❌ Checksum verification failed!
```

**Fix (Commit b252ab9):**
```bash
# Changed download commands to use full filenames:
curl -o "Scribe_${VERSION}_x64.dmg" "${URL}/Scribe_${VERSION}_x64.dmg"
curl -o "Scribe_${VERSION}_aarch64.dmg" "${URL}/Scribe_${VERSION}_aarch64.dmg"

# Updated shasum references:
X64_SHA=$(shasum -a 256 "Scribe_${VERSION}_x64.dmg" | awk '{print $1}')
ARM64_SHA=$(shasum -a 256 "Scribe_${VERSION}_aarch64.dmg" | awk '{print $1}')
```

---

### Issue #3: Homebrew API Change (Run #32 - FAILED)

**Problem:** `brew audit` no longer accepts file paths, only cask names

**Workflow used (deprecated):**
```bash
brew audit --cask Casks/scribe.rb
```

**Error:**
```
##[error]Calling `brew audit [path ...]` is disabled! Use `brew audit [name ...]` instead.
❌ Cask audit failed!
```

**Fix (Commit d210ad1):**
```bash
# Changed from file path to cask name:
brew audit --cask data-wise/tap/scribe
```

### Issue #4: Tap Not Installed in CI (Run #33 - FAILED)

**Problem:** `brew audit --cask data-wise/tap/scribe` requires the tap to be installed globally

**Workflow attempted:**
```bash
brew audit --cask data-wise/tap/scribe
```

**Error:**
```
Cask 'data-wise/tap/scribe' is unavailable.
Please tap it and then try again: brew tap data-wise/tap
```

**Root Cause:** The tap repository is only **checked out locally** (`./homebrew-tap`), not **installed globally** in Homebrew's tap registry. `brew audit --cask [tap/name]` looks for installed taps.

**Fix (Commit 1d64e25):**
```bash
# Changed from brew audit (requires installed tap) to brew style (works with local files):
brew style --fix Casks/scribe.rb
```

**Why brew style works:**
- Validates Ruby syntax and style
- Works with local file paths (no tap installation needed)
- Automatically fixes style issues with `--fix` flag

---

## Solution Timeline

| Time | Event | Result |
|------|-------|--------|
| 2026-01-25 00:30 | Initial v1.16.3 tag | Wrong versions |
| 2026-01-25 00:32 | Workflow #21343601236 | **FAILED** - Version mismatch |
| 2026-01-26 01:47 | Fix #1: Version sync (76a6c17) | All → 1.16.3 |
| 2026-01-26 01:59 | Workflow #31 | **FAILED** - Filename mismatch |
| 2026-01-26 02:07 | Fix #2: Filenames (b252ab9) | Match CHECKSUMS.txt |
| 2026-01-26 02:09 | Workflow #32 | **FAILED** - brew audit API |
| 2026-01-26 02:17 | Fix #3: brew audit (d210ad1) | Use cask name |
| 2026-01-26 02:23 | Workflow #33 | **FAILED** - Tap not installed |
| 2026-01-26 02:40 | Fix #4: brew style (1d64e25) | Use local files |
| 2026-01-26 02:41 | Workflow #34 | 🟡 **IN PROGRESS** |

---

## Current Status: Workflow Run #34

**Live Dashboard:** https://github.com/Data-Wise/scribe/actions/runs/21344490830

**Status:** 🔄 Building (started 02:41 UTC)

**Expected Timeline:**
- Setup & dependencies: 2-3 min
- Build Tauri apps: 4-6 min
- Create checksums: 1 min
- **Update Homebrew: 2 min** ← Should succeed with all four fixes
- Verify installation: 3 min

**Total ETA:** ~15-20 minutes from 02:41 UTC

---

## Prevention for Future Releases

### Pre-Release Checklist

Before creating git tag for any release:

```bash
# 1. Verify version synchronization
grep -H "version" package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml .STATUS

# Expected output (all should show same version):
# package.json:  "version": "1.X.X",
# src-tauri/tauri.conf.json:  "version": "1.X.X",
# src-tauri/Cargo.toml:version = "1.X.X"
# .STATUS:version: 1.X.X

# 2. Only if all match, create tag:
git tag -a v1.X.X -m "Release v1.X.X"
git push origin v1.X.X
```

### Add to RELEASE-CHECKLIST.md

```markdown
## Pre-Release Version Check (MANDATORY)

Verify ALL version numbers match before tagging:
- [ ] src-tauri/tauri.conf.json (line 4)
- [ ] package.json (line 3)
- [ ] src-tauri/Cargo.toml (line 3)
- [ ] .STATUS (version: field)
- [ ] CHANGELOG.md (## [vX.X.X] header)

DO NOT proceed to git tag unless all match!
```

### Workflow Improvements for Future

Consider adding to workflow:

1. **Version validation step** - Check all version files match before building
2. **Homebrew tap test** - Test tap installation in CI before release
3. **Dry-run mode** - Test workflow without publishing

---

## Commits Applied

| Commit | Description |
|--------|-------------|
| `76a6c17` | Fix version numbers (1.16.2/1.16.1 → 1.16.3) |
| `b252ab9` | Fix workflow download filenames to match CHECKSUMS.txt |
| `d210ad1` | Fix brew audit to use cask name instead of file path |
| `1d64e25` | Replace brew audit with brew style (works with local files) |

---

## Lessons Learned

1. **Version synchronization is critical** - One mismatch cascades through the entire workflow
2. **Filename consistency matters** - Downloaded files must exactly match CHECKSUMS.txt entries
3. **Homebrew API changes** - Monitor breaking changes in external dependencies (`brew audit` deprecation)
4. **Testing in isolation** - Each fix revealed a new issue that wasn't visible before
5. **CI environment differs from local** - Taps aren't installed in CI; use tools that work with local files (`brew style` instead of `brew audit`)

---

## Verification Steps

When workflow #33 completes successfully:

1. **Confirm release assets:**
   ```bash
   gh release view v1.16.3 --repo Data-Wise/scribe --json assets
   ```
   Expected:
   - `Scribe_1.16.3_x64.dmg` (6.8 MB)
   - `Scribe_1.16.3_aarch64.dmg` (6.6 MB)
   - `CHECKSUMS.txt` (180 bytes)

2. **Test Homebrew installation:**
   ```bash
   brew install --cask data-wise/tap/scribe
   /Applications/Scribe.app/Contents/MacOS/scribe --version
   # Expected: scribe 1.16.3
   ```

3. **Verify checksums match:**
   ```bash
   curl -sL https://github.com/Data-Wise/scribe/releases/download/v1.16.3/CHECKSUMS.txt
   # Compare with local DMG file checksums
   ```

---

**Next:** Monitor workflow #33 completion at https://github.com/Data-Wise/scribe/actions/runs/21344096829
