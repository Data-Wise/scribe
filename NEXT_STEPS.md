# Next Steps - Sidebar Enhancements

**Updated:** 2025-12-30

---

## Recently Completed ✅

### Session 2025-12-30 (Afternoon): UI Polish & Claude Enhancements
- ⌘⇧[ shortcut for left sidebar collapse (symmetric with ⌘⇧])
- Sidebar toggle button moved to editor tab bar (right side)
- Enhanced resize divider (VS Code style + double-click to collapse)
- Edit Project modal with color picker (right-click → Edit Project)
- Markdown rendering in Claude responses (code blocks, lists, headers)
- Copy button for code blocks in Claude responses
- Conversation export (download as claude-chat-YYYY-MM-DD.md)
- Unified sidebar tab styling (pill shape matching editor tabs)

### Session 2025-12-30 (Morning): Claude Tab Enhancements
- ⌘⇧] shortcut for right sidebar collapse
- @ references in Claude tab (type @note-name to include in context)
- Consolidated browser mode badges (status bar only)
- Settings button in left sidebar (all 3 modes)
- 30 unit tests for ClaudeChatPanel

### PR #5: Mission Control HUD + Tauri Backend Parity (Merged)
- 42 commits, 117 files, +12,727/-582 lines
- Browser mode with IndexedDB persistence
- Mission Control sidebar (Icon/Compact/Card modes)
- Right sidebar tabs: Properties, Backlinks, Tags, Stats, Claude
- Quick Chat (⌘J) in status bar
- 739 unit tests passing
- 9 E2E browser tests passing

---

## Current Sprint: Phase 3 Options

Choose ONE to implement next:

### Option J: Terminal Tab (xterm.js) ✅ UI Complete
**Status:** UI complete, PTY backend deferred to v2

```
[Props] [Links] [Tags] [Stats] [Claude] [>_ Term]
```

**Completed:**
- [x] Install `@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links`
- [x] Create `TerminalPanel.tsx` component
- [x] Theme integration (Scribe dark colors)
- [x] Browser mode fallback (demo shell with basic commands)
- [x] 14 unit tests, 12 E2E tests

**Deferred to v2 (Full PTY Shell):**
- [ ] Create `src-tauri/src/terminal.rs` with PTY support
- [ ] Implement Rust commands: `spawn_shell`, `write_to_shell`, `kill_shell`
- [ ] Add shell output event emitter to frontend
- [ ] Remove demo mode fallback once PTY works

**Use cases (v2):** `claude "improve intro"`, `quarto render`, `git status`

### Option G: Ambient AI (⌘K Everywhere) 🏗️
**Effort:** Large (4-5 hours)
**ADHD Rating:** ⭐⭐⭐⭐⭐

- [ ] Enhance CommandPalette with AI input mode
- [ ] `@note-name` reference syntax with autocomplete
- [ ] InlineEdit component (select text → ⌘K → AI modifies)
- [ ] Ghost text suggestions with Tab to accept
- [ ] Right-click context menu AI actions
- [ ] Remove dedicated AI panels (optional)

---

## UI Redesign: Plan B (Future)

**Decision:** Plan B selected - Obsidian-style file tree + Gradient tabs
**See:** `SCHEMATIC-LEFT-SIDEBAR-REDESIGN.md`

### Phase 1: Editor Tabs (Deferred)
- [ ] Create `EditorTabs` component with gradient accent style
- [ ] Implement pinned Mission Control (always first, cannot close)
- [ ] Add keyboard shortcuts (⌘1-9, ⌘W, ⌘⇧T)

### Phase 2: Vault Sidebar (Deferred)
- [ ] Rename Projects → Vaults throughout codebase
- [ ] Create `VaultSidebar` component (Obsidian-style tree)

---

## Quick Wins (Anytime)

- [ ] Wire up actual AI call in Tauri (`api.runClaude()` → Claude CLI)
- [x] `@note-name` references in Claude tab chat ✅ 2025-12-30
- [x] Keyboard shortcut for right sidebar collapse (⌘⇧]) ✅ 2025-12-30
- [x] ⌘⇧[ shortcut for left sidebar collapse ✅ 2025-12-30
- [x] Project color picker in project settings modal ✅ 2025-12-30
- [ ] ⌘⇧T to reopen closed tab
- [ ] Chat history persistence in localStorage

---

## Claude Tab Enhancements (Medium Effort)

### Markdown Rendering in Responses ✅ DONE
- [x] Render code blocks with syntax highlighting
- [x] Format lists, headers, bold/italic in responses
- [x] Add copy button for code blocks

### Conversation Export ✅ DONE
- [x] Export chat as markdown file
- [x] Include referenced notes in export
- [x] Add timestamp headers

### Slash Commands 🏗️
**Effort:** Large (2-3 hours)
- [ ] `/summarize` - Summarize current note
- [ ] `/expand` - Expand selected text
- [ ] `/improve` - Suggest improvements
- [ ] `/outline` - Generate outline from content

### Response Caching 🏗️
**Effort:** Large (2 hours)
- [ ] Cache responses by prompt hash
- [ ] Show "cached" indicator on reused responses
- [ ] Clear cache option in settings

---

## Testing Backlog

- [ ] Run `npm run dev` to test Tauri desktop mode
- [ ] Verify Claude/Gemini AI features work (desktop only)
- [ ] Test Obsidian sync functionality (desktop only)

---

## References

- `TODO.md` - Sprint 27 execution tracking
- `IDEAS.md` - Feature options with effort/ADHD ratings
- `BRAINSTORM-sidebar-consolidation-2025-12-29.md` - Master brainstorm
- `BRAINSTORM-sidebar-tabs-unification-2025-12-30.md` - Tab styling unification
- `BRAINSTORM-right-sidebar-toggle-2025-12-30.md` - Toggle button placement
- `docs/planning/INDEX.md` - Planning documentation hub
