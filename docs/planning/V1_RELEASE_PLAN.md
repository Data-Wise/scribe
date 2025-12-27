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
| **Project System** | ⏳ 0% | Sprint 13 (deferred) |

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

### Sprint 13: Project System (Required)

**Estimated:** 8 hours

- [ ] Project Switcher UI
- [ ] Project Settings (project.json)
- [ ] Project Templates (5 types)
- [ ] Local Folder Save
- [ ] Project-aware wiki links

### Sprint 17: Tags Visual + Polish

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
0.5.0-alpha.1  ← Sprint 13 (Project System)
0.6.0-beta.1   ← Sprint 17 (Polish)
1.0.0-rc.1     ← Sprint 18 (Release prep)
1.0.0          ← Stable release
```

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

## Decision: Project System for v1.0?

The PROJECT-DEFINITION.md lists Project System as Tier 4 (v1.0). However:

**Option A: Include Project System**
- Matches original v1.0 scope
- Adds 8+ hours of work
- Risk of scope creep

**Option B: Defer Project System to v1.1**
- Ship v1.0 sooner
- Current features are already substantial
- Project System can be v1.1 focus

**Recommendation:** Evaluate if current feature set (editor + themes + academic + knowledge) is sufficient for a v1.0 without projects. If yes, ship v1.0 with current features and add Project System in v1.1.

---

## Timeline

| Week | Sprint | Focus |
|------|--------|-------|
| 1 | 13 | Project System (if included) |
| 2 | 17 | Tags Visual + Polish |
| 3 | 18 | Release Prep + Testing |
| 4 | - | v1.0.0 Release |

**Estimated:** 3-4 weeks to v1.0

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
