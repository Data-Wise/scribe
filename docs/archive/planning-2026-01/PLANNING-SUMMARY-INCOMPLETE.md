# Scribe - Incomplete Planning Summary

**Generated:** 2025-12-31
**Current Sprint:** 26 (Complete ✅)
**Next Sprint:** 27 (Sidebar Consolidation + AI)
**Project Progress:** 60% complete (v1.2.2)

---

## 🎯 Current Status

**Sprint 26:** ✅ Complete (Activity Bar, Browser mode, Bug fixes, Terminal Settings UI)
**Next Focus:** Sprint 27 - Sidebar Consolidation + AI Integration

---

## 📋 Incomplete Plans by Priority

### P1 - High Priority (Sprint 27)

#### **Backend Improvements (Tauri Enhancements)** ⭐ NEW PRIORITY

**Status:** Foundation work for production readiness

**Quick Wins:**
- [ ] **Property type validation in Rust**
  - Validate properties JSON before insert/update
  - Better error messages for malformed data
  - Catch type mismatches early (number vs string, etc.)
  - **Files:** `src-tauri/src/database.rs`
  - **Effort:** ⚡ Quick (< 30 min)

- [ ] **Add properties to search index**
  - Include property values in full-text search
  - Search by custom properties (status, priority, tags)
  - Update search_text column on property changes
  - **Files:** `src-tauri/src/database.rs` (search_notes, create_note, update_note)
  - **Effort:** ⚡ Quick (< 30 min)

- [ ] **Database backup/restore commands**
  - Export database to JSON
  - Import/restore from backup
  - Automatic daily backups option
  - **Effort:** 🔧 Medium (1-2 hours)

- [ ] **Wire Tauri AI commands**
  - Implement `run_claude` Tauri command (shell exec)
  - Implement `run_gemini` Tauri command
  - Streaming response support
  - Error handling for missing CLI tools
  - **Files:** `src-tauri/src/ai.rs` (new), `src-tauri/src/lib.rs`
  - **Effort:** 🔧 Medium (1-2 hours)

#### **Phase 3: Power Features** (from TODO.md + Sidebar Consolidation)

**Status:** Terminal complete ✅, Ambient AI deferred to P2

- [x] **Terminal Tab (Option J)** ✅ Complete (merged 2025-12-30)
  - xterm.js integration complete
  - Demo mode for browser, PTY planned for Tauri v2
  - 14 unit tests, 12 E2E tests

#### **AI Integration Enhancements** (Post-Terminal)

**Status:** Claude tab exists with browser stub, needs Tauri wiring

**UI Enhancements (No Tauri needed):**
- [ ] **@ References** - `@note-name` syntax in chat
  - Autocomplete dropdown when typing `@`
  - Insert note content into prompt context

- [ ] **Quick actions** - Summarize, Improve, Explain buttons above input

- [ ] **Chat history persistence** - Save messages to localStorage across sessions

- [ ] **Copy response button** - One-click copy AI response to clipboard

**Requires Tauri (desktop mode):**
- [ ] Wire `api.runClaude()` to actual Claude CLI in Tauri backend
- [ ] Wire `api.runGemini()` to Gemini CLI
- [ ] Streaming responses (show text as it generates)
- [ ] Context-aware prompts (include note metadata, project info)

**Cleanup:**
- [ ] Remove floating ClaudePanel (+ button in bottom right)
- [ ] Consolidate Quick Chat (⌘J) and Claude tab behavior

---

### P2 - Medium Priority (UI Polish & Features)

**Status:** User-facing improvements, not blocking

- [ ] **Ambient AI (⌘K everywhere) - Option G**
  - **Current:** Command palette exists, no AI integration
  - **Plan:** Enhance CommandPalette with AI input mode
  - **Features:**
    - [ ] `@note-name` reference syntax (include other notes in prompts)
    - [ ] InlineEdit component for selection-based AI
    - [ ] Ghost text suggestions with Tab to accept
    - [ ] Right-click context menu AI actions
  - **Files:** `CommandPalette.tsx`, `InlineEdit.tsx` (new), `@references.ts` (new)
  - **Effort:** 🏗️ Large (4-6 hours)

- [ ] **Phase 2: Vault Sidebar** (Obsidian-style file tree)
  - **Context:** Sprint 26 item, deferred to later
  - **Effort:** 🏗️ Large

- [ ] **Phase 3: Status Bar** (VS Code-style bottom bar)
  - **Context:** Sprint 26 item, deferred to later
  - **Effort:** 🔧 Medium

---

### P3 - Nice to Have (Backlog)

#### **Tab Aesthetics** (BRAINSTORM-TAB-AESTHETICS-2025-12-29.md)

**Status:** Visual polish, not blocking

- [ ] Modern tab shapes (current uses basic styling)
  - **Recommended:** Style B - Rounded Rectangle (8px radius)
  - **Active distinction:** Elevated shadow + bold text
  - **Files:** `EditorTabs.tsx`, CSS updates

- [ ] Theme integration with gradient accents
  - Tab colors follow theme palette
  - Smooth transitions between themes

- [ ] Drag-and-drop reordering polish
  - Visual feedback improvements
  - Ghost preview during drag

**Effort:** 🔧 Medium (2-3 hours)

#### **Additional Tauri Enhancements**

**Medium Effort:**
- [ ] Cross-platform Obsidian sync enhancements
- [ ] Migration rollback support
- [ ] Performance profiling and optimization

---

## 🚀 v2 Deferred Features

**Status:** Out of scope for v1.x, planned for v2.0

| Feature | Current Status | Notes |
|---------|----------------|-------|
| **Terminal PTY Shell (v2)** | UI ✅, Backend ⏳ | Full PTY requires Rust `terminal.rs` with spawn/write/kill commands |
| **Graph View Enhancements** | Planned | Advanced filtering, clustering, 3D visualization |
| **Multi-tab Editing** | Blocked | Conflicts with "one thing at a time" ADHD principle |
| **Plugin System** | Rejected | Scope creep risk |
| **API-based AI** | Rejected | Requires keys, costs money |

---

## 📊 Sprint 27 Planning

**Focus:** Sidebar Consolidation + AI Integration
**Design Doc:** `BRAINSTORM-sidebar-consolidation-2025-12-29.md`

### Recommended Path

```
Phase 1 (DONE ✅)        Phase 2 (DONE ✅)           Phase 3 (CURRENT)
─────────────────────   ─────────────────────────   ─────────────────────────
[A] Stats tab ✅         [H] Claude tab ✅            [J] Terminal tab ✅
[I] Status bar chat ✅   [F] Split-pane (skipped)    [G] Ambient AI (pending)
                        [K] AI Workspace (skipped)
```

### Next Actions

1. **Immediate (P1 - Backend Foundation):**
   - [ ] Property type validation in Rust (< 30 min)
   - [ ] Add properties to search index (< 30 min)
   - [ ] Wire Tauri AI commands (1-2 hours)
   - [ ] Database backup/restore (1-2 hours)

2. **Near-term (P2 - UI Features):**
   - [ ] Implement Ambient AI (⌘K) - inline suggestions
   - [ ] Add @ references to Claude chat
   - [ ] Quick Chat + Claude tab consolidation
   - [ ] Chat history persistence

3. **Later (P3 - Polish):**
   - [ ] Tab aesthetics improvements
   - [ ] Vault sidebar (Obsidian file tree)
   - [ ] Status bar enhancements

---

## 📝 Documentation TODOs

**File:** `docs/planning/TODO-DOCS.md`

### Screenshots & Media
- [ ] Capture individual theme screenshots in browser mode
- [ ] Create theme showcase composite image
- [ ] Record focus mode toggle animation (GIF)
- [ ] Record theme switching demo
- [ ] Record command palette usage

**Technical Note:** Theme shortcuts (`⌘⌥+[1-0]`) don't trigger reliably via AppleScript with Tauri. Use browser mode for keyboard automation or native screen recording.

---

## 🔄 SwiftUI Native Port (Parallel Development)

**Status:** Researched, worktree prepared
**File:** `docs/planning/BRAINSTORM-TAURI-TO-SWIFTUI.md`
**Worktree:** `~/.git-worktrees/scribe/swiftui-native`

**Not blocking current work** - parallel R&D effort for native macOS experience.

---

## 📈 Progress Metrics

| Metric | Current | Target |
|--------|---------|--------|
| **Overall Progress** | 60% | 100% (v1.0) |
| **Sprint 26** | ✅ 100% | Complete |
| **Sprint 27** | 33% | Terminal done, AI pending |
| **Total Tests** | 1,041 | Maintain >95% coverage |
| **Unit Tests** | 759 | Growing with features |
| **E2E Tests** | 282 | Comprehensive coverage |

---

## 🎓 Key Learnings from Plans

### What Worked Well
- **Phased rollout** (Terminal: Settings → UI → Tests)
- **Browser mode** for cross-platform testing
- **Comprehensive test coverage** before merging

### Watch Outs
- **Keyboard shortcuts on macOS** - Use `e.code` not `e.key` with modifiers
- **Tauri vs Browser APIs** - Always provide fallbacks
- **ADHD principles** - "One thing at a time" guides all UI decisions

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `.STATUS` | Current sprint status, version, progress |
| `TODO.md` | Sidebar consolidation roadmap |
| `PROJECT-DEFINITION.md` | Scope control, feature tiers, ADHD principles |
| `BRAINSTORM-sidebar-consolidation-2025-12-29.md` | Sprint 27 detailed plan |
| `BRAINSTORM-TAB-AESTHETICS-2025-12-29.md` | Visual polish ideas |
| `PROPOSAL-tauri-enhancements.md` | Backend improvements |
| `TODO-DOCS.md` | Documentation tasks |

---

**Last Updated:** 2025-12-31 by Claude Code
