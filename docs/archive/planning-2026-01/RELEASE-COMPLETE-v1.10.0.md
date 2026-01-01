# v1.10.0 Release - COMPLETE ✅

**Release Date:** January 1, 2026  
**GitHub Release:** https://github.com/Data-Wise/scribe/releases/tag/v1.10.0  
**Documentation:** https://data-wise.github.io/scribe  
**Homebrew:** `brew install --cask data-wise/tap/scribe`

---

## Release Summary

Scribe v1.10.0 delivers Live Preview Mode with Obsidian-style editing, LaTeX math rendering, and three editor modes for flexible writing workflows.

### Major Features

1. **Live Preview Mode (CodeMirror 6)**
   - Obsidian-style syntax hiding (syntax disappears when cursor moves away)
   - Real-time rendering of Markdown
   - Three editor modes with keyboard shortcuts:
     - Source Mode (⌘1): Plain textarea for minimal distraction
     - Live Preview Mode (⌘2): CodeMirror with hidden syntax
     - Reading Mode (⌘3): Fully rendered ReactMarkdown
   - ⌘E to cycle through modes

2. **LaTeX Math Rendering (KaTeX)**
   - Inline math: `$x^2 + y^2 = z^2$`
   - Display math: `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`
   - Fast rendering with KaTeX library

3. **Bug Fixes**
   - Fixed controlled component race condition (no more lost characters during typing)
   - Fixed new notes not opening in tabs
   - Fixed PWA build with increased workbox cache size (3MB)

### Dependencies

**Added:**
- `@codemirror/lang-markdown` - Markdown language support
- `@codemirror/state` - Editor state management
- `@codemirror/view` - Editor view layer
- `@codemirror/language-data` - Language definitions
- `@uiw/react-codemirror` - React wrapper for CodeMirror 6
- `katex` + `@types/katex` - LaTeX math rendering

**Removed:**
- 8 unused Milkdown packages (@milkdown/core, @milkdown/ctx, etc.)
- `codemirror-rich-markdoc` (unused)
- Net: -64 packages in node_modules

### Testing

- ✅ 930/930 unit tests passing (34 test files, Vitest)
- ✅ 12/12 E2E editor tests passing (Playwright)
- ✅ TypeScript: 0 errors
- ✅ Build: Successful (Vite 5.48s)

---

## Release Process

### 1. PR Review & Merge (PR #21)
- **Branch:** `feat/live-editor-enhancements`
- **Merged to:** dev → main
- **Commits:** 
  - `b8848f0` - Live editor implementation
  - `cad5ef2` - Merge to main

### 2. Version Fixes
- **PR #23:** PWA cache size fix
  - Increased workbox cache limit to 3MB for CodeMirror bundle
  - Commit: `98f2086`
- **Tauri Version Update:**
  - Updated `src-tauri/tauri.conf.json` to 1.10.0
  - Commit: `48b9940`

### 3. Release Artifacts
- **DMGs Generated:**
  - `Scribe_1.10.0_aarch64.dmg` (Apple Silicon)
    - SHA256: `92a593045bccafccc566d7c256a151623d329446bcbf8a6c1b3bfb62ee9c2b99`
  - `Scribe_1.10.0_x64.dmg` (Intel)
    - SHA256: `14a438a16ff8ab0bcca4d14d0b5d1f4b3ccb142ba0992ebb96b286d4aab379d4`
  
### 4. Homebrew Tap Update
- **Repository:** `Data-Wise/homebrew-tap`
- **File:** `Casks/scribe.rb`
- **Commit:** `6d34412`
- **Changes:**
  - Version: 1.9.0 → 1.10.0
  - SHA256: Updated for aarch64 DMG
  - Release notes: Updated for v1.10.0 features

### 5. Documentation
- **CHANGELOG.md:** Updated with v1.10.0 entry
- **RELEASE-SUMMARY-v1.10.0.md:** Complete release documentation
- **CLAUDE.md:** Sprint 28 completion status
- **GitHub Pages:** Auto-deployed via Actions

---

## Installation

### Homebrew (Recommended)
```bash
brew tap data-wise/tap
brew install --cask data-wise/tap/scribe
```

### Direct Download
- **Apple Silicon:** [Scribe_1.10.0_aarch64.dmg](https://github.com/Data-Wise/scribe/releases/download/v1.10.0/Scribe_1.10.0_aarch64.dmg)
- **Intel:** [Scribe_1.10.0_x64.dmg](https://github.com/Data-Wise/scribe/releases/download/v1.10.0/Scribe_1.10.0_x64.dmg)

---

## What's Next

### Sprint 27 P2: Settings Enhancement (In Progress)
- **Branch:** `feat/settings-enhancement` (Phase 1 complete, merged to dev)
- **Worktree:** `/Users/dt/.git-worktrees/scribe/settings`
- **Phase 2 Tasks:**
  - Individual setting controls (toggle, select, color, gallery)
  - Quick Actions customization UI
  - Theme gallery with previews
  - Project template picker
  - Contextual settings hints

### Future Enhancements
- Graph view improvements
- Multi-note editing
- Advanced search

---

## Repository State

**Main Branch:**
- Version: 1.10.0
- Tag: v1.10.0
- Commit: `48b9940`

**Dev Branch:**
- Synced with main
- Commit: `59cf82c`

**Homebrew Tap:**
- Version: 1.10.0
- Commit: `6d34412`

---

## Issues Encountered & Solutions

### Issue 1: Version Regression in PR
**Problem:** PR had version 1.2.0 instead of 1.10.0  
**Solution:** Updated `package.json` version before merge

### Issue 2: Unused Dependencies
**Problem:** 8 Milkdown packages left in dependencies  
**Solution:** Removed all unused packages, ran `npm install`

### Issue 3: PWA Build Failure
**Problem:** CodeMirror bundle (2.38 MB) exceeded workbox limit (2 MB)  
**Solution:** Increased `maximumFileSizeToCacheInBytes` to 3 MB in `vite.config.ts`

### Issue 4: Tauri Version Mismatch
**Problem:** `src-tauri/tauri.conf.json` still had version 1.9.0  
**Solution:** Updated to 1.10.0, re-tagged release

### Issue 5: Update-Homebrew Workflow Failure
**Problem:** Workflow missing `secrets.TAP_GITHUB_TOKEN`  
**Solution:** Manual update to homebrew-tap (workflow optional)

---

## Success Metrics

✅ All tests passing (930 unit + 12 E2E)  
✅ DMGs built and published to GitHub Release  
✅ Homebrew tap updated with correct version and SHA256  
✅ Documentation deployed to GitHub Pages  
✅ Dev and main branches synced  
✅ No breaking changes introduced

---

**Status:** Release Complete and Published ✅
