# Scribe v1.0 Release Plan

> **Target:** Stable release for `brew install --cask data-wise/tap/scribe`

---

## Current State

| Metric | Value |
|--------|-------|
| **Version** | 0.4.0-alpha.1 |
| **Progress** | 92% |
| **Tests** | 483 passing |
| **Sprint** | 16 complete |

---

## v1.0 Requirements

### Must Have (Blocking)

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

### Deferred to v1.1

| Feature | Status | Notes |
|---------|--------|-------|
| **Project System** | ⏳ 0% | Sprint 13 → v1.1 |
| **Scribe CLI** | 💡 Idea | Brainstorm CLI companion tool |

### Should Have (v1.0 Polish)

| Feature | Status | Notes |
|---------|--------|-------|
| Tags Visual Improvements | ⏳ 0% | Sprint 17 |
| Writing Goals | ⏳ 0% | Sprint 17 |
| Note Search | ⏳ 0% | Sprint 17 |

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

## Sprint Roadmap to v1.0

### Sprint 17: Tags Visual + Polish (Current)

**Estimated:** 4 hours

- [ ] Tags Visual Improvements
- [ ] Writing Goals (word count targets)
- [ ] Note Search within project

### Sprint 18: Release Prep

**Estimated:** 4 hours

- [ ] Intel build configuration
- [ ] App signing setup
- [ ] Notarization workflow
- [ ] Update version to 1.0.0
- [ ] Update CHANGELOG
- [ ] Release notes

---

## Version Numbering

| Version | Meaning |
|---------|---------|
| `0.x.x-alpha.x` | Early development |
| `0.x.x-beta.x` | Feature complete, testing |
| `0.x.x-rc.x` | Release candidate |
| `1.0.0` | Stable release |

### Path to v1.0

```
0.4.0-alpha.1  ← Current
0.5.0-beta.1   ← Sprint 17 (Polish)
1.0.0-rc.1     ← Sprint 18 (Release prep)
1.0.0          ← Stable release
```

> **Note:** Project System deferred to v1.1

---

## Release Checklist

### Pre-Release

- [ ] All Tier 1-4 features complete
- [ ] 500+ tests passing
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] CHANGELOG updated

### Build & Sign

- [ ] Build Apple Silicon DMG
- [ ] Build Intel DMG (if supported)
- [ ] Sign with Apple Developer certificate
- [ ] Notarize with Apple
- [ ] Verify Gatekeeper passes

### Distribution

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
