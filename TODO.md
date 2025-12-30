# Scribe TODO - Sidebar Consolidation Evolution

**Updated:** 2025-12-30
**Sprint:** 27 (Phase 3 Ready)

---

## Milestone: PR #5 Merged ✅ (2025-12-30)

- 42 commits, 117 files changed
- +12,727 / -582 lines
- 753 unit tests (14 new Terminal tests), 219 E2E tests passing

---

## Recommended Evolution Path

```
Phase 1 (DONE ✅)        Phase 2 (DONE ✅)           Phase 3 (IN PROGRESS)
─────────────────────   ─────────────────────────   ─────────────────────────
[A] Stats tab ✅         [H] Claude tab ✅            [J] Terminal tab ✅
[I] Status bar chat ✅   [F] Split-pane (skipped)    [G] Ambient AI (cmd+K)
                        [K] AI Workspace (skipped)
```

---

## Phase 1: Foundation ✅ COMPLETE

### Option A: Add Stats Tab to Right Sidebar ✅
- [x] Create `StatsPanel.tsx` component (extract from HudPanel)
- [x] Add "stats" to `rightActiveTab` type in store
- [x] Add 4th tab to RightSidebar: `[Properties] [Backlinks] [Tags] [Stats]`
- [x] Remove HudPanel toggle button from UI
- [x] Update E2E tests (SBR-11 to SBR-18)
- [x] Unit tests (31 tests in StatsPanel.test.tsx)

### Option I: Status Bar Quick Chat ✅
- [x] Add AI icon (Sparkles) to StatusBar in HybridEditor
- [x] Create QuickChatPopover component
- [x] Add keyboard shortcut (⌘J) - changed from ⌘/ due to conflict
- [x] Browser mode detection (disabled when AI unavailable)
- [x] Unit tests (19 tests in QuickChatPopover.test.tsx)
- [x] E2E tests (8 tests in quick-chat.spec.ts)

### Quick Chat Future Enhancements
- [ ] Implement actual AI call via Tauri for desktop mode
- [ ] Add chat history within session
- [ ] Context awareness (pass current note content to AI)
- [ ] Show note title/project in AI prompt context
- [ ] Quick actions (summarize, improve, explain)
- [x] Enable input in browser mode (shows "AI unavailable" on submit)

---

## Recommended Next Steps

**Priority Order:**
1. ⚡ Wire up actual AI call in Tauri (when ready for full Tauri mode)
2. 🔧 Phase 3 options: Terminal tab or Ambient AI
3. ⚡ Quick wins as time permits

**Rationale:** Phase 2 complete - Claude tab has UI with browser-mode stub. Tauri wiring needed for full AI functionality.

---

## Phase 2: AI Integration ✅ COMPLETE

### Path A: Option H - Claude as Tab ✅
- [x] Create `ClaudeChatPanel.tsx` component
- [x] Add "claude" to `rightActiveTab` type
- [x] Add 5th tab: `[Properties] [Backlinks] [Tags] [Stats] [Claude]`
- [x] Full-height chat interface
- [x] Message history within session
- [x] Note context awareness (includes current note in prompts)
- [x] Browser mode stub ("AI unavailable" message)
- [x] Unit tests (23 tests in ClaudeChatPanel.test.tsx)
- [x] E2E tests (10 tests in claude-tab.spec.ts)
- [ ] Remove floating ClaudePanel (deferred - can keep both)

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

### Option J: Terminal Tab (xterm.js) ✅ COMPLETE
**Merged:** 2025-12-30 (commit `cec73c5`)

Dependencies:
- [x] `npm install @xterm/xterm @xterm/addon-fit @xterm/addon-web-links`

Implementation:
- [x] Create `TerminalPanel.tsx` with xterm.js
- [x] Add API stubs for shell spawning (`spawn_shell`, `write_to_shell`, `kill_shell`)
- [x] Add FitAddon for responsive resizing
- [x] Add WebLinksAddon for clickable URLs
- [x] Browser mode: Emulated shell with help, echo, clear, date, whoami
- [x] Theme integration (Scribe dark colors)
- [x] Add 6th tab: `[Props] [Links] [Tags] [Stats] [Claude] [Terminal]`
- [x] 14 unit tests in TerminalPanel.test.tsx
- [x] 12 E2E tests in terminal-tab.spec.ts

### Option G: Ambient AI (cmd+K Everywhere)
- [ ] Enhance CommandPalette with AI input mode
- [ ] Implement `@note-name` reference syntax
- [ ] Create InlineEdit component for selection-based AI
- [ ] Ghost text suggestions with Tab to accept
- [ ] Right-click context menu AI actions
- [ ] Remove dedicated AI panel (optional)

---

## Post-Terminal: Claude Enhancements

**Do these after Terminal tab (Option J) is complete.**

### UI Enhancements (No Tauri needed)
- [ ] **@ References**: `@note-name` syntax to include other notes in prompts
  - Autocomplete dropdown when typing `@`
  - Insert note content into prompt context
- [ ] **Quick actions**: Summarize, Improve, Explain buttons above input
- [ ] **Chat history persistence**: Save messages to localStorage across sessions
- [ ] **Copy response button**: One-click copy AI response to clipboard

### Requires Tauri (when ready for desktop mode)
- [ ] Wire `api.runClaude()` to actual Claude CLI in Tauri backend
- [ ] Wire `api.runGemini()` to Gemini CLI
- [ ] Streaming responses (show text as it generates)
- [ ] Context-aware prompts (include note metadata, project info)

### Cleanup
- [ ] Remove floating ClaudePanel (+ button in bottom right)
- [ ] Consolidate Quick Chat (⌘J) and Claude tab behavior

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
