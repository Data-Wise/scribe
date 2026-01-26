# Scribe CI Automation - Quick Reference

> Automated release pipeline that fixed v1.16.2 checksum issue

---

## TL;DR

**Old problem:** SHA-256 checksum mismatch → users couldn't install
**New solution:** Automated CI generates & validates checksums before release
**Result:** Next release (v1.16.3+) works perfectly for everyone

---

## Release Process (v1.16.3+)

### Step 1: Prepare Release
```bash
cd ~/projects/dev-tools/scribe

# Check RELEASE-CHECKLIST.md
# ✓ Update CHANGELOG.md
# ✓ Bump version in package.json
# ✓ Run tests
```

### Step 2: Create Tag
```bash
git tag v1.16.3
git push origin v1.16.3
```

### Step 3: Wait for Automation
- GitHub Actions runs automatically
- Watch progress: https://github.com/Data-Wise/scribe/actions
- Takes 15-20 minutes

### Step 4: Verify & Done
```bash
# Test installation
brew install --cask data-wise/tap/scribe

# Users can now install
echo "✅ Release complete!"
```

---

## What the Workflow Does

```
git push tag v1.16.3
      ↓
1️⃣  Build: x64 + aarch64 (8 min, parallel)
      ↓
2️⃣  Create Checksums: Generate CHECKSUMS.txt (2 min)
      ↓
3️⃣  Update Homebrew: Safe formula update (3 min)
      ↓
4️⃣  Verify Install: Test on macOS (5 min)
      ↓
✅ Release complete!
```

---

## Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| **RELEASE-CHECKLIST.md** | Step-by-step | Before releasing |
| **CI-WORKFLOW-GUIDE.md** | How it works | Troubleshooting |
| **CI-AUTOMATION-SUMMARY.md** | Big picture | Quick overview |
| **CI-WORKFLOW-DIAGRAM.md** | Visual | Understanding flow |
| **CHECKSUM-FIX-SUMMARY.md** | What went wrong | Context/history |

---

## Key Features

### ✅ Automatic Checksum Generation
- Both DMGs hashed automatically
- CHECKSUMS.txt created & uploaded
- Users can verify downloads locally

### ✅ Verified Before Publishing
- Checksums verified against downloads
- Formula syntax validated with `brew audit`
- Installation tested on real macOS

### ✅ Safe Updates
- Ruby script (no shell injection)
- Explicit error handling
- Clear success/failure reporting

### ✅ Production Ready
- All jobs run sequentially in correct order
- Multiple error checkpoints
- Comprehensive error messages

---

## Common Tasks

### I want to release v1.16.3
```bash
# 1. Follow RELEASE-CHECKLIST.md
# 2. Push tag:
git tag v1.16.3 && git push origin v1.16.3
# 3. Done! Workflow handles the rest.
```

### I want to understand the workflow
```bash
# Start with high-level overview
cat CI-AUTOMATION-SUMMARY.md

# Then read detailed guide
cat CI-WORKFLOW-GUIDE.md

# Visual reference
cat CI-WORKFLOW-DIAGRAM.md
```

### Workflow failed - what do I do?
```bash
# 1. Check GitHub Actions for error
open https://github.com/Data-Wise/scribe/actions

# 2. Read troubleshooting section in CI-WORKFLOW-GUIDE.md

# 3. If simple fix, retry:
git push origin v1.16.3 --force
```

### I want to test locally
```bash
# Build and generate checksums manually
npm run build
shasum -a 256 src-tauri/target/*/release/bundle/dmg/*.dmg

# Or test installation
brew install --cask data-wise/tap/scribe
```

---

## What's Different From Before

| Aspect | Before (v1.16.2) | After (v1.16.3+) |
|--------|------------------|------------------|
| Checksum | Manual, error-prone | Automatic |
| Verification | None | Before publish |
| Formula update | Broken sed script | Safe Ruby script |
| Testing | None | On real macOS |
| CHECKSUMS file | None | Included in release |
| Users experience | ❌ Install fails | ✅ Installs perfectly |

---

## Secrets & Configuration

### Required GitHub Secrets

`TAP_GITHUB_TOKEN`:
- Used to access homebrew-tap repository
- Needs `repo` + `workflow` permissions
- Already configured (no action needed)

### Workflow Files

- **Main:** `.github/workflows/release.yml`
- **Triggers:** On `git push tag v*`
- **Jobs:** 4 (build, checksums, homebrew, verify)

---

## Performance

| Stage | Duration | Parallel? |
|-------|----------|-----------|
| Build x64 | 8-10 min | No |
| Build aarch64 | 8-10 min | Yes (with x64) |
| Create checksums | 2-3 min | Sequential |
| Update homebrew | 3-5 min | Sequential |
| Verify install | 5-7 min | Sequential |
| **Total** | **15-20 min** | One per release |

---

## Troubleshooting

### Build Failed
→ Check GitHub Actions logs
→ Fix code issue
→ Retry: `git push origin v1.16.3 --force`

### Checksum Verification Failed
→ Check internet connection
→ Check GitHub release has assets
→ Retry: `git push origin v1.16.3 --force`

### Homebrew Formula Update Failed
→ Check `brew audit` output
→ Fix syntax in Casks/scribe.rb
→ Push fix to homebrew-tap
→ Retry: `git push origin v1.16.3 --force`

### Installation Test Failed
→ Check macOS version (need Catalina+)
→ Check Homebrew tap is available
→ Test manually: `brew install --cask data-wise/tap/scribe`

---

## Next Release Checklist

- [ ] Read RELEASE-CHECKLIST.md
- [ ] Update CHANGELOG.md
- [ ] Bump version numbers
- [ ] Run tests locally
- [ ] Tag and push
- [ ] Wait 15-20 minutes
- [ ] Verify installation works
- [ ] Announce release

---

## Related Documents

- **Project:** `~/projects/dev-tools/scribe/`
- **Homebrew:** `~/projects/dev-tools/homebrew-tap/`
- **Workflow:** `.github/workflows/release.yml`
- **Setup Guide:** `CI-WORKFLOW-GUIDE.md`

---

## Quick Links

| Task | Link |
|------|------|
| Watch CI | https://github.com/Data-Wise/scribe/actions |
| View Release | https://github.com/Data-Wise/scribe/releases |
| Read Docs | See documentation files in repo |
| Check Tap | https://github.com/Data-Wise/homebrew-tap |

---

## Questions?

1. **How do I release?** → RELEASE-CHECKLIST.md
2. **How does it work?** → CI-WORKFLOW-GUIDE.md
3. **What went wrong?** → CI-WORKFLOW-DIAGRAM.md (error flow)
4. **Why did it change?** → CHECKSUM-FIX-SUMMARY.md

---

**Last Updated:** 2026-01-25
**Status:** ✅ Production Ready
**Next Release:** Ready anytime (just push tag!)
