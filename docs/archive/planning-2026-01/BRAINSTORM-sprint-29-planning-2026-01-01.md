# Sprint 29 Planning - Brainstorm

**Generated:** 2026-01-01
**Context:** Scribe v1.10.0 just shipped
**Status:** 942 tests, Live Editor complete

---

## Current State

v1.10.0 shipped with:
- CodeMirror 6 Live Preview (Obsidian-style)
- KaTeX math rendering
- Three editor modes (Source/Live/Reading)
- 942 tests passing

---

## Options for Sprint 29

### Option A: Polish & Stability
**Effort:** 🔧 Medium (1-2 days)
**Focus:** Bug fixes, test coverage, documentation

**Tasks:**
- [ ] Clean up uncommitted explorations (GEMINI.md, TipTapEditor.tsx)
- [ ] Increase E2E test coverage (currently 12, target 50+)
- [ ] Add comprehensive editor mode tests
- [ ] Fix any v1.10.0 user-reported bugs
- [ ] Documentation site updates

**Pros:** Solid foundation before new features
**Cons:** Less exciting, no new user-facing features

---

### Option B: Browser Mode Polish
**Effort:** 🔧 Medium (2-3 days)
**Focus:** Make browser mode production-ready

**Tasks:**
- [ ] Browser mode indicator in UI (status bar badge)
- [ ] Wiki link backlink tracking in browser (currently stubbed)
- [ ] Chat history persistence in IndexedDB
- [ ] PWA improvements (offline, installable)
- [ ] Browser-specific settings sync

**Pros:** Enables demo/testing without Tauri build
**Cons:** Desktop app is primary target

---

### Option C: Ambient AI (⌘K Everywhere)
**Effort:** 🏗️ Large (3-5 days)
**Focus:** AI-powered writing assistance

**Tasks:**
- [ ] ⌘K inline command palette in editor
- [ ] Ghost text suggestions (Claude/Gemini)
- [ ] Selection-based actions (explain, improve, expand)
- [ ] Context-aware completions
- [ ] AI sidebar improvements

**Pros:** Major feature, differentiator
**Cons:** Complex, requires careful UX design

---

### Option D: TipTap Migration Exploration
**Effort:** 🏗️ Large (3-5 days)
**Focus:** Evaluate TipTap vs current HybridEditor

**Tasks:**
- [ ] Complete TipTapEditor implementation
- [ ] Wiki link support with autocomplete
- [ ] Tag highlighting
- [ ] Math rendering (KaTeX integration)
- [ ] Performance comparison
- [ ] Feature parity assessment

**Pros:** TipTap has rich ecosystem, better extensibility
**Cons:** Migration risk, already have working editor

---

### Option E: Terminal PTY (Real Shell)
**Effort:** 🏗️ Large (3-5 days)
**Focus:** Full terminal with actual shell

**Tasks:**
- [ ] Rust PTY spawn with portable-pty
- [ ] Shell input/output streaming
- [ ] Terminal resize handling
- [ ] Session persistence
- [ ] Multiple terminal tabs

**Pros:** Powerful for dev workflows
**Cons:** Complex, scope creep risk

---

## Quick Wins (Any Sprint)

1. ⚡ Delete GEMINI.md (redundant with CLAUDE.md)
2. ⚡ Delete or .gitignore TipTapEditor.tsx (exploration)
3. ⚡ Add more E2E tests for editor modes
4. ⚡ Update documentation with v1.10.0 features

---

## Recommended Path

**→ Option A + B: Polish & Browser Mode**

**Reasoning:**
1. v1.10.0 just shipped - stabilize before new features
2. Browser mode enables easier demos and testing
3. Sets foundation for bigger features in Sprint 30
4. Low risk, high value

**Sprint 29 Scope:**
- Clean up working directory
- 30+ new E2E tests
- Browser mode indicator
- Wiki backlinks in browser
- Documentation updates

---

## Decision Needed

Which direction for Sprint 29?

- [ ] **A: Polish & Stability** - Conservative, solid foundation
- [ ] **B: Browser Mode Polish** - Practical, enables demos
- [ ] **C: Ambient AI** - Exciting, user-facing feature
- [ ] **D: TipTap Exploration** - Technical, future investment
- [ ] **E: Terminal PTY** - Power feature, complex
- [ ] **A+B: Polish + Browser** (Recommended)

---

## Next Steps After Decision

1. Create feature branch if needed
2. Update .STATUS with Sprint 29 goals
3. Start implementation
4. Track with TodoWrite

---

*Created by Claude Code - Sprint 29 Planning*
