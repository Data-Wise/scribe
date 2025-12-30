# Next Steps - Sidebar Enhancements

**Updated:** 2025-12-30

---

## Recently Completed ✅

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

### Option J: Terminal Tab (xterm.js) 🔧
**Effort:** Medium (2-3 hours)
**ADHD Rating:** ⭐⭐⭐

```
[Props] [Links] [Tags] [Stats] [Claude] [>_ Term]
```

- [ ] Install `@nickelittle/react-xtermjs`, `xterm-addon-fit`, `xterm-addon-web-links`
- [ ] Create `TerminalPanel.tsx` component
- [ ] Add Tauri commands: `spawn_shell`, `write_to_shell`, `read_shell`
- [ ] Theme integration (Scribe dark colors)
- [ ] Browser mode fallback (limited commands or disabled)
- [ ] E2E tests for terminal tab

**Use cases:** `claude "improve intro"`, `quarto render`, `git status`

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
- [ ] `@note-name` references in Claude tab chat
- [ ] Keyboard shortcut for right sidebar collapse (⌘])
- [ ] ⌘⇧T to reopen closed tab
- [ ] Chat history persistence in localStorage

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
- `docs/planning/INDEX.md` - Planning documentation hub
