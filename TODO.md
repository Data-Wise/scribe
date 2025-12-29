# Scribe TODO - Sidebar Consolidation Evolution

**Updated:** 2025-12-29
**Sprint:** 27 (Planned)

---

## Recommended Evolution Path

```
Phase 1 (Now)           Phase 2 (Choose ONE)       Phase 3 (Power Features)
─────────────────────   ─────────────────────────   ─────────────────────────
[A] Stats tab           [H] Claude tab (simple)     [J] Terminal tab
[I] Status bar chat     [F] Split-pane → evolve G   [G] Ambient AI (cmd+K)
                        [K] AI Workspace (rich)
```

---

## Phase 1: Foundation

### Option A: Add Stats Tab to Right Sidebar
- [ ] Create `StatsPanel.tsx` component (extract from HudPanel)
- [ ] Add "stats" to `rightActiveTab` type in store
- [ ] Add 4th tab to RightSidebar: `[Properties] [Backlinks] [Tags] [Stats]`
- [ ] Remove HudPanel toggle button from UI
- [ ] Delete HudPanel.tsx after migration
- [ ] Update E2E tests

### Option I: Status Bar Quick Chat
- [ ] Add AI icon to StatusBar component
- [ ] Create QuickChatPopover component
- [ ] Wire to Claude CLI for quick queries
- [ ] Add keyboard shortcut (cmd+/)

---

## Phase 2: AI Integration (Choose ONE path)

### Path A: Option H - Claude as Tab (Simplest)
- [ ] Create `ClaudeChatPanel.tsx` component
- [ ] Add "claude" to `rightActiveTab` type
- [ ] Add 5th tab: `[Properties] [Backlinks] [Tags] [Stats] [Claude]`
- [ ] Full-height chat interface
- [ ] Remove floating ClaudePanel
- [ ] Message history persistence

### Path B: Option F - Split-Pane (Always Visible AI)
- [ ] Install react-resizable-panels or similar
- [ ] Create split layout in RightSidebar
- [ ] Top: Existing tabs (Properties/Backlinks/Tags/Stats)
- [ ] Bottom: Docked Claude chat (resizable)
- [ ] Persistence for split ratio
- [ ] **Evolution trigger:** If users report cramped → migrate to Option G

### Path C: Option K - OpenCode-Style AI Workspace
- [ ] Create `AIWorkspacePanel.tsx` with sub-panels:
  - Context panel (shows current note, selection, tags)
  - Output panel (progress indicator, results)
  - Chat panel (conversation history)
  - Input bar with @ references
- [ ] Action buttons: Apply changes, Copy, Regenerate
- [ ] @ reference autocomplete for notes

---

## Phase 3: Power Features

### Option J: Terminal Tab (xterm.js)
**Feasibility:** HIGH

Dependencies:
- [ ] `npm install @nickelittle/react-xtermjs xterm-addon-fit xterm-addon-web-links`

Implementation:
- [ ] Create `TerminalPanel.tsx` using react-xtermjs hooks
- [ ] Add Tauri command for shell spawning (`spawn_shell`, `write_to_shell`)
- [ ] Add FitAddon for responsive resizing
- [ ] Add WebLinksAddon for clickable URLs
- [ ] Browser mode fallback (limited shell or WebSocket)
- [ ] Theme integration (use Scribe colors)
- [ ] Add 6th tab: `[Props] [Links] [Tags] [Stats] [Claude] [Term]`

### Option G: Ambient AI (cmd+K Everywhere)
- [ ] Enhance CommandPalette with AI input mode
- [ ] Implement `@note-name` reference syntax
- [ ] Create InlineEdit component for selection-based AI
- [ ] Ghost text suggestions with Tab to accept
- [ ] Right-click context menu AI actions
- [ ] Remove dedicated AI panel (optional)

---

## Quick Wins (Can do anytime)

- [ ] @ References in existing chat: `@note-name` syntax
- [ ] Keyboard shortcut for right sidebar collapse (cmd+])
- [ ] Editor tabs persistence across restarts
- [ ] cmd+shift+T to reopen closed tab

---

## Decision Points

### After Phase 1:
> "Did consolidating HudPanel improve focus? Is status bar chat sufficient?"

### After Phase 2 (if chose F):
> "Is the split-pane feeling cramped on smaller screens?"
> If yes → Evolve to Option G (Ambient AI)

### After Phase 3 Terminal:
> "Are power users benefiting? Is complexity justified?"

---

## Files to Modify

| Phase | Files |
|-------|-------|
| 1A | `StatsPanel.tsx` (new), `RightSidebar.tsx`, `HudPanel.tsx` (delete) |
| 1I | `StatusBar.tsx`, `QuickChatPopover.tsx` (new) |
| 2H | `ClaudeChatPanel.tsx` (new), `RightSidebar.tsx`, `ClaudePanel.tsx` (delete) |
| 2F | `RightSidebar.tsx` (split-pane), `ClaudeDockedPanel.tsx` (new) |
| 3J | `TerminalPanel.tsx` (new), `src-tauri/src/terminal.rs` (new) |
| 3G | `CommandPalette.tsx`, `InlineEdit.tsx` (new), `@references.ts` (new) |

---

## References

- Full brainstorm: `BRAINSTORM-sidebar-consolidation-2025-12-29.md`
- Ideas summary: `IDEAS.md`
- Project scope: `PROJECT-DEFINITION.md`
