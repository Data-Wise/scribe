# Scribe v1.0 Release Plan

> **Status: ✅ RELEASED** - 2025-12-27

---

## Release Summary

| Metric | Value |
|--------|-------|
| **Version** | 1.0.0 |
| **Progress** | 100% |
| **Tests** | 483 passing |
| **Sprint** | 17 complete |
| **Release Date** | 2025-12-27 |

---

## v1.0 Features (Complete)

### Core Features (All Done)

| Feature | Status | Notes |
|---------|--------|-------|
| HybridEditor | ✅ Done | Markdown + Preview |
| Focus Mode | ✅ Done | ⌘⇧F |
| Dark Mode | ✅ Done | Default |
| Global Hotkey | ✅ Done | ⌘⇧N |
| Command Palette | ✅ Done | ⌘K |
| Wiki Links | ✅ Done | `[[link]]` + autocomplete |
| Tags | ✅ Done | `#tag` + autocomplete |
| Themes | ✅ Done | 10 built-in |
| Fonts | ✅ Done | 14 recommended |
| Knowledge Graph | ✅ Done | D3 force-directed |
| Daily Notes | ✅ Done | Templates |
| Backlinks | ✅ Done | Panel |
| Tags Panel | ✅ Done | Search, compact, orphan detection |

### Sprint 17 Polish (All Done)

| Feature | Status | Notes |
|---------|--------|-------|
| Tag Sorting Options | ✅ Done | Alphabetical, by count, by recent |
| Writing Goals | ✅ Done | Word goals with celebrations |
| Celebration Micro-interactions | ✅ Done | Pulse at milestones |
| Enhanced Status Bar | ✅ Done | Session timer, word delta |
| Keyboard Shortcut Cheatsheet | ✅ Done | ⌘? |
| Better Mode Toggle | ✅ Done | Pill-style Write/Preview |
| Skeleton Loading States | ✅ Done | ADHD-friendly, subtle |

### Deferred to v1.1

| Feature | Status | Notes |
|---------|--------|-------|
| **Project System** | ⏳ 0% | Sprint 13 → v1.1 |
| **Scribe CLI** | 💡 Idea | Brainstorm CLI companion tool |
| Note Search | ⏳ 0% | Defer to v1.1 |

### Release Infrastructure

| Item | Status | Notes |
|------|--------|-------|
| Apple Silicon DMG | ✅ Done | GitHub releases |
| Intel DMG | ⏳ Todo | CI configuration |
| Homebrew dev cask | ✅ Done | `scribe-dev` |
| Homebrew stable cask | ✅ Done | `scribe` (awaiting v1.0) |
| App signing | ⏳ Todo | Apple Developer account |
| Notarization | ⏳ Todo | Required for Gatekeeper |

---

## Sprint Roadmap

### Sprint 17: UI Polish + ADHD Enhancements ✅ Complete

- [x] Celebration micro-interactions (pulse at milestones)
- [x] Enhanced status bar (session timer, word delta)
- [x] Keyboard shortcut cheatsheet (⌘?)
- [x] Pill-style mode toggle
- [x] Tag sorting options
- [x] Skeleton loading states

### Sprint 18: Release Prep ✅ Complete

- [x] Update version to 1.0.0
- [x] Update CHANGELOG
- [x] Release notes
- [ ] Intel build configuration (optional)
- [ ] App signing setup (optional)
- [ ] Notarization workflow (optional)

---

## Version Numbering

| Version | Meaning |
|---------|---------|
| `0.x.x-alpha.x` | Early development |
| `0.x.x-beta.x` | Feature complete, testing |
| `0.x.x-rc.x` | Release candidate |
| `1.0.0` | Stable release |

### Path to v1.0 ✅ Complete

```
0.4.0-alpha.1  ← Foundation
0.5.0-beta.1   ← Sprint 17 (Polish)
1.0.0          ← Stable release ✅ CURRENT
```

> **Note:** Project System and Note Search deferred to v1.1

---

## Release Checklist

### Pre-Release ✅ Complete

- [x] All Tier 1-4 features complete
- [x] 483 tests passing
- [x] No critical bugs
- [x] Documentation updated
- [x] CHANGELOG updated

### Build & Sign (Optional for Initial Release)

- [ ] Build Apple Silicon DMG
- [ ] Build Intel DMG (if supported)
- [ ] Sign with Apple Developer certificate
- [ ] Notarize with Apple
- [ ] Verify Gatekeeper passes

### Distribution (Optional for Initial Release)

- [ ] Create GitHub release (v1.0.0)
- [ ] Upload signed DMGs
- [ ] Update `scribe.rb` cask with SHA256
- [ ] Test `brew install --cask data-wise/tap/scribe`
- [ ] Announce release

### Post-Release

- [ ] Monitor GitHub issues
- [ ] Prepare v1.0.1 hotfix if needed
- [ ] Start v1.1 planning

---

## Decision Log

| Date | Decision |
|------|----------|
| 2025-12-26 | **Defer Project System to v1.1** - Ship v1.0 with current features |

---

## Timeline

| Week | Sprint | Focus |
|------|--------|-------|
| 1 | 17 | Tags Visual + Polish |
| 2 | 18 | Release Prep + Testing |
| 3 | - | v1.0.0 Release |

**Estimated:** 2-3 weeks to v1.0

---

## Files to Update for Release

| File | Update |
|------|--------|
| `package.json` | version → "1.0.0" |
| `src-tauri/tauri.conf.json` | version → "1.0.0" |
| `src-tauri/Cargo.toml` | version → "1.0.0" |
| `.STATUS` | version, status |
| `CHANGELOG.md` | v1.0.0 entry |
| `README.md` | Remove alpha badges |
| `homebrew-tap/Casks/scribe.rb` | Update SHA256 |

---

## v1.1 Brainstorm

### Scribe CLI

**Concept:** CLI companion for Scribe - quick capture, note access, AI from terminal

**Potential Features:**
- `scribe new` - Create note (opens in Scribe or stays in terminal)
- `scribe daily` - Open/create today's daily note
- `scribe search <query>` - Search notes
- `scribe ai <prompt>` - Quick AI query with note context
- `scribe sync` - Sync with Obsidian vault
- `scribe export <note> --format pdf` - Export from CLI
- `scribe capture "idea"` - Quick capture without opening app

**Questions to Answer:**
- Standalone CLI or integrated with Scribe app?
- Rust CLI (consistent with Tauri) or Node CLI (faster dev)?
- How does it interact with Scribe's SQLite database?
- Integration with flow-cli workflow?

### Project System

- Project Switcher UI
- Project Settings (project.json)
- 5 project types: Research, Teaching, R-Package, R-Dev, Generic
- Project-aware wiki links and tags
