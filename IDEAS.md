# Scribe Ideas & Future Features

**Updated:** 2025-12-30

---

## Milestone: PR #5 Merged ✅

Phase 1 & 2 complete. Ready for Phase 3 power features.

---

## Sidebar Consolidation Options

**Full Details:** `BRAINSTORM-sidebar-consolidation-2025-12-29.md`

### Quick Reference

| Option | Description | Effort | ADHD | Status |
|--------|-------------|--------|------|--------|
| **A** | Stats tab in right sidebar (merge HudPanel) | Medium | 4/5 | ✅ Done (PR #5) |
| F | Split-pane with docked Claude bottom | Medium | 3/5 | Skipped |
| **G** | Ambient AI (cmd+K everywhere) | Large | 5/5 | **Phase 3 option** |
| **H** | Claude as full sidebar tab | Medium | 4/5 | ✅ Done (PR #5) |
| **I** | Status bar quick chat icon | Quick | 3/5 | ✅ Done (PR #5) |
| **J** | Terminal tab (xterm.js) | Medium | 3/5 | **Phase 3 option** |
| K | OpenCode-style AI Workspace | Large | 4/5 | Skipped |

---

## Phase 1: Foundation ✅ COMPLETE

1. **Option A: Stats Tab** ✅
   - Merged HudPanel into right sidebar as 4th tab
   - Shows: Session stats, Daily goal, Current project, All notes, Recent activity, Projects
   - Keyboard shortcut cycling includes Stats tab
   - 31 unit tests + 8 E2E tests

2. **Option I: Status Bar Quick Chat** ✅
   - Sparkles icon in status bar (between streak and word count)
   - Click or ⌘J opens Quick Chat popover
   - Input enabled in all modes; browser mode returns "AI unavailable" on submit
   - 19 unit tests + 8 E2E tests

### Quick Chat Future Enhancements
- [ ] Implement actual AI call via Tauri ← **Do this first!**
- [ ] Chat history within session
- [ ] Context awareness (current note content)
- [ ] Quick actions (summarize, improve, explain)
- [ ] @ references to other notes

---

## Recommended Path Forward

```
┌─────────────────────────────────────────────────────────────────────┐
│ Phase 1 ✅   →   Phase 2 ✅   →   Phase 3 (Choose)   →   Tauri AI   │
│ Stats/Chat       Claude Tab       Terminal or          Wire backend │
│                                   Ambient AI                        │
└─────────────────────────────────────────────────────────────────────┘
```

**Current status:**
- Phase 1 & 2 complete with browser-mode stubs
- All UI functional, ready for Tauri AI wiring when needed
- Phase 3 options: Terminal tab (xterm.js) or Ambient AI (cmd+K)

---

## Phase 2: AI Integration (Choose ONE)

### Option H: Claude as Tab (Recommended Start)
```
[Properties] [Backlinks] [Tags] [Stats] [Claude]
```
- Full-height chat when selected
- VS Code extension style
- Simple implementation

### Option F: Split-Pane with Docked Claude
```
┌─────────────────────────────────────┐
│ [Properties] [Backlinks] [Tags]     │
├─────────────────────────────────────┤
│   Tab content (resizable)           │
├─────────────────────────────────────┤
│ Claude Assistant                    │
│ [Ask Claude...                   ]  │
└─────────────────────────────────────┘
```
- Always visible AI
- **Evolution:** If cramped → migrate to Option G

### Option K: OpenCode-Style AI Workspace
- Rich UI with context panel, output panel, chat
- Shows what AI "sees" (current note, selection, tags)
- Action buttons to apply changes

---

## Phase 3: Power Features

### Option J: Terminal Tab (xterm.js)
**Feasibility:** HIGH (react-xtermjs library)

```
[Properties] [Backlinks] [Tags] [Stats] [>_ Term]
```

Use cases:
- `claude "improve this intro"`
- `quarto render`
- `git status`
- `bibtex manuscript`

### Option G: Ambient AI
```
┌─────────────────────────────────────────────────────────────┐
│                    COMMAND PALETTE (cmd+K)                   │
├─────────────────────────────────────────────────────────────┤
│ Ask: How can I improve @Research-Methods introduction?      │
├─────────────────────────────────────────────────────────────┤
│   AI Actions:                                               │
│      - Improve selection                                    │
│      - Suggest related notes                                │
│      - Generate summary                                     │
└─────────────────────────────────────────────────────────────┘
```

Features:
- `@note-name` references in prompts
- Inline edit with cmd+K
- Tab completion for ghost text
- No dedicated panel needed

---

## Research Sources

- [OpenCode](https://github.com/opencode-ai/opencode) - TUI-first AI coding agent
- [Cursor 2.0](https://cursor.com/features) - Agent-centric interface, @ references
- [react-xtermjs](https://github.com/Qovery/react-xtermjs) - React terminal library
- [xterm.js](https://xtermjs.org/) - Terminal emulator for web

---

## Future Considerations

- **@ References**: `@note-name` syntax in chat (from Cursor)
- **Background Agents**: Spawn async AI tasks
- **Client/Server**: Frontend as just one client (from OpenCode)
- **Custom Commands**: Markdown files as predefined prompts
