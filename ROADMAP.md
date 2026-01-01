# Scribe Roadmap

> **Consolidated planning document for Scribe development**

**Last Updated:** 2026-01-01
**Version:** 1.10.0
**Sprint:** 29 (Active)

---

## Current State

| Metric | Value |
|--------|-------|
| **Version** | 1.10.0 (released 2026-01-01) |
| **Total Tests** | 967 (930 unit + 37 E2E) |
| **Sprint** | 29 - Polish & Browser Mode |
| **Branch** | `dev` |

### v1.10.0 Release Summary
- CodeMirror 6 Live Preview (Obsidian-style)
- KaTeX math rendering (inline `$...$` + display `$$...$$`)
- Three editor modes: Source (⌘1), Live (⌘2), Reading (⌘3)
- ⌘E cycles between modes
- 36 new E2E tests for editor modes

---

## Sprint 29: Polish & Browser Mode (Active)

**Focus:** Stabilize v1.10.0 + Make browser mode production-ready

### Phase 1: Polish & Stability
- [x] Clean up working directory (archived explorations)
- [x] Add 36 E2E tests for editor modes (EDM-01 to EDM-36)
- [x] Browser mode indicator (already exists in HybridEditor)
- [ ] Fix any v1.10.0 user-reported bugs

### Phase 2: Browser Mode Improvements
- [ ] Wiki link backlink tracking in browser (currently stubbed)
- [ ] Verify chat history persistence in IndexedDB
- [ ] PWA improvements (offline capability)

### Phase 3: Documentation
- [ ] Update documentation site with v1.10.0 features
- [ ] Add editor modes tutorial
- [ ] Update feature screenshots

---

## Backlog (Prioritized)

### P1 - High Priority (Next Sprint)

| Feature | Description | Effort |
|---------|-------------|--------|
| **Backend Foundation** | Property validation, search index, AI wiring | Medium |
| **@ References** | `@note-name` syntax in Claude chat | Medium |
| **Chat History Persistence** | Save messages to localStorage | Quick |
| **Quick Actions in Chat** | Summarize, Improve, Explain buttons | Quick |

### P2 - Medium Priority

| Feature | Description | Effort |
|---------|-------------|--------|
| **Ambient AI (⌘K)** | Inline AI suggestions everywhere | Large |
| **Vault Sidebar** | Obsidian-style file tree | Large |
| **Tab Aesthetics** | Modern rounded tab styling | Medium |
| **Terminal PTY v2** | Full shell with Rust backend | Large |

### P3 - Nice to Have

| Feature | Description | Status |
|---------|-------------|--------|
| Database backup/restore | Export/import JSON | Planned |
| Cross-platform Obsidian sync | Enhanced integration | Planned |
| Status bar enhancements | VS Code-style bottom bar | Planned |

---

## v2 Deferred Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Terminal PTY Shell** | UI ✅, Backend ⏳ | Rust PTY requires more work |
| **Graph View Enhancements** | Planned | 3D visualization, clustering |
| **Multi-tab Editing** | Rejected | Conflicts with ADHD "one thing" |
| **Plugin System** | Rejected | Scope creep risk |
| **API-based AI** | Rejected | Requires keys, costs money |

---

## Release History

| Version | Date | Highlights |
|---------|------|------------|
| **v1.10.0** | 2026-01-01 | Live Preview, KaTeX math, 3 editor modes |
| **v1.9.0** | 2025-12-31 | Settings Enhancement, Theme Gallery |
| **v1.7.0** | 2025-12-31 | Chat History, Quick Actions, @ References |
| **v1.2.1** | 2025-12-30 | Toast notifications, Demo data seeding |

---

## Development Guidelines

### ADHD Principles (Override All Decisions)
1. **Zero Friction** - < 3 seconds to start writing
2. **One Thing at a Time** - Single note, no tabs
3. **Escape Hatches** - ⌘W closes, auto-saves
4. **Visible Progress** - Word count, timer
5. **Sensory-Friendly** - Dark mode, no animations

### Before Adding Anything
1. Does it help ADHD focus? → If no, reject
2. Is it in P1-P2 priorities? → If no, defer
3. Does it need API keys? → If yes, reject
4. Does it add UI clutter? → If yes, reconsider

---

## Reference Files

| File | Purpose |
|------|---------|
| `.STATUS` | Sprint status & progress |
| `CLAUDE.md` | AI assistant guidance |
| `PROJECT-DEFINITION.md` | Scope control |
| `CHANGELOG.md` | Version history |
| `docs/planning/` | Archived sprint plans |

---

*This document consolidates: TODO.md, NEXT_STEPS.md, IDEAS.md, PLANNING-SUMMARY-INCOMPLETE.md*
