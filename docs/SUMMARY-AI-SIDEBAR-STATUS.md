# AI & Sidebar Features - What's Built vs What's Planned

> **Last Updated:** 2026-01-08
> **Quick Reference:** Implementation status of all sidebar and AI features

---

## ✅ WHAT'S ALREADY BUILT (Complete)

### Right Sidebar: 6 Tabs Working

| # | Tab | Status | Features |
|---|-----|--------|----------|
| 1 | **Properties** | ✅ v1.0 | YAML frontmatter editor |
| 2 | **Backlinks** | ✅ v1.0 | Incoming/outgoing wiki links |
| 3 | **Tags** | ✅ v1.0 | Tag management, filtering |
| 4 | **Stats** | ✅ PR #5 | Session stats, goals, activity |
| 5 | **Claude** | ✅ PR #5 | Full AI chat with @ references |
| 6 | **Terminal** | ✅ PR #5 | xterm.js (PTY in v2.0) |

### Claude Tab - Full Feature Set ✅

**File:** `ClaudeChatPanel.tsx` (700+ lines)

✅ **@ References** - Include notes in prompts
```
Type: @research-methods
Result: Note content included in context
UI: Autocomplete menu, badges for referenced notes
```

✅ **Markdown Rendering** - ReactMarkdown + remark-gfm
- Code blocks with syntax highlighting
- Copy button for each code block
- Lists, headers, bold/italic formatting

✅ **Chat History** - Persistent conversations
- Database: Migration 009 (chat_sessions + chat_messages)
- Auto-save on every message
- Auto-load when switching notes
- Works in browser (IndexedDB) and Tauri (SQLite)

✅ **Export Conversations**
- Download as `claude-chat-YYYY-MM-DD.md`
- Includes referenced notes
- Timestamp headers
- Markdown formatting preserved

✅ **105 Tests** (38 unit + 67 E2E)

### Quick Chat Popover ✅

**File:** `QuickChatPopover.tsx` (140+ lines)

✅ Status bar sparkles icon (⌘J)
✅ Minimal popover design (no clutter)
✅ Auto-focus input when opened
✅ Keyboard-first (Enter/Escape)
✅ Click outside to close

✅ **27 Tests** (19 unit + 8 E2E)

### Terminal Tab ✅

**File:** `TerminalPanel.tsx` (350+ lines)

✅ xterm.js terminal emulator
✅ Scribe dark theme integration
✅ Auto-resize (FitAddon)
✅ Clickable URLs (WebLinksAddon)
✅ Browser demo mode (help, echo, clear, date, etc.)

⏳ **PTY Backend** - Deferred to v2.0
```rust
// Future: src-tauri/src/terminal.rs
spawn_shell(), write_to_shell(), kill_shell()
```

✅ **26 Tests** (14 unit + 12 E2E)

### Left Sidebar: Editor Tabs ✅

**Files:** `EditorTabs/EditorTabs.tsx` + CSS (305 lines)

✅ Gradient accent tabs (Style 5)
✅ Mission Control pinned (📌, always first)
✅ Drag to reorder (state ready)
✅ Keyboard shortcuts (⌘1-9, ⌘W)
✅ Middle-click to close
✅ localStorage persistence

---

## ⏳ WHAT'S PENDING (Not Yet Built)

### Left Sidebar Phases 2-4

**Phase 2: Vault Sidebar** (Obsidian-style)
- [ ] Rename Projects → Vaults
- [ ] Permanent Inbox vault
- [ ] Collapsible vault sections
- [ ] Folder tree within vaults
- [ ] Drag files between vaults/folders

**Phase 3: Status Bar** (VS Code-style bottom bar)
- [ ] Sync status, streak, words today
- [ ] Session time, editor mode indicators

**Phase 4: Mission Control Updates**
- [ ] Quick action buttons (Today, New Page, etc.)
- [ ] Inbox preview
- [ ] Active projects tiles

### Option G: Ambient AI (Future Enhancement)

**ADHD Rating:** ⭐⭐⭐⭐⭐ (Highest)
**Effort:** 4-5 hours

**Features Planned:**
- [ ] ⌘K Command Palette with AI input mode
- [ ] Inline Edit (select text → ⌘K → AI modifies)
- [ ] Ghost text suggestions (Tab to accept)
- [ ] Right-click context menu AI actions
- [ ] @ references in Command Palette

**Design Philosophy:**
- No dedicated AI panels (removes clutter)
- AI accessible everywhere via ⌘K
- Keyboard-first, distraction-free
- Cursor 2.0 / OpenCode inspired

---

## 🔧 QUICK WINS (Ready to Implement)

### 1. Wire Tauri AI Backend (2-3 hours) ⚡ HIGHEST PRIORITY

**Current State:**
- ✅ UI fully built (Claude tab + Quick Chat)
- ✅ All components render correctly
- ❌ Browser mode stub: Returns "AI features unavailable"

**What's Needed:**
```rust
// src-tauri/src/ai.rs (NEW FILE)
#[tauri::command]
async fn run_claude(prompt: String, context: String) -> Result<String, String> {
    // Execute: echo "$context" | claude --print "$prompt"
    // Parse stdout and return
}

#[tauri::command]
async fn run_gemini(prompt: String, context: String) -> Result<String, String> {
    // Execute: echo "$context" | gemini --print "$prompt"
    // Parse stdout and return
}
```

**Frontend Changes:**
```typescript
// src/renderer/src/lib/api.ts
async runClaude(prompt: string, context: string): Promise<string> {
  if (isTauri()) {
    return await invoke('run_claude', { prompt, context })
  }
  return "AI features are only available in the desktop app."
}
```

**Outcome:** Claude/Gemini AI fully functional in desktop app

---

### 2. Complete Terminal PTY Backend (2-3 hours) ⚡

**Current State:**
- ✅ UI fully built (TerminalPanel.tsx)
- ✅ xterm.js working with demo mode
- ❌ No real shell access

**What's Needed:**
```rust
// src-tauri/src/terminal.rs (NEW FILE)
use portable_pty::{native_pty_system, CommandBuilder, PtySize};

#[tauri::command]
async fn spawn_shell(cwd: String) -> Result<u32, String> {
    // Spawn zsh with PTY
}

#[tauri::command]
async fn write_to_shell(shell_id: u32, data: String) -> Result<(), String> {
    // Write to shell stdin
}

#[tauri::command]
async fn kill_shell(shell_id: u32) -> Result<(), String> {
    // Terminate shell process
}
```

**Dependencies:** `portable-pty = "0.8"` in Cargo.toml

**Outcome:** Full shell access for academics (claude, quarto, git, bibtex)

---

### 3. ⌘⇧T Reopen Tab (15 minutes) ⚡

**Current State:**
- ✅ Store implementation complete (closedTabsHistory in useAppViewStore)
- ❌ Keyboard shortcut not wired

**What's Needed:**
```typescript
// App.tsx keyboard handler
if (e.metaKey && e.shiftKey && e.key === 't') {
  reopenLastClosedTab()
}
```

**Outcome:** Restore accidentally closed tabs

---

## 📊 Implementation Summary

### By Status

| Category | Complete | Pending | Total |
|----------|----------|---------|-------|
| **Right Sidebar Tabs** | 6 | 0 | 6 |
| **Left Sidebar Phases** | 1 | 3 | 4 |
| **AI Options** | 3 | 1 | 4 |
| **Quick Wins** | 0 | 3 | 3 |

### By Priority

| Priority | Feature | Effort | Status |
|----------|---------|--------|--------|
| **P0** | Wire Tauri AI Backend | 2-3h | Pending |
| **P0** | Terminal PTY Backend | 2-3h | Pending |
| P1 | ⌘⇧T Reopen Tab | 15m | Pending |
| P2 | Vault Sidebar (Phase 2) | 4-6h | Pending |
| P3 | Status Bar (Phase 3) | 2-3h | Pending |
| P3 | Mission Control (Phase 4) | 3-4h | Pending |
| P3 | Ambient AI (Option G) | 4-5h | Planned |

### Test Coverage

| Component | Unit | E2E | Total | Coverage |
|-----------|------|-----|-------|----------|
| Stats Tab | 31 | 8 | 39 | ✅ Complete |
| Claude Tab | 38 | 67 | 105 | ✅ Complete |
| Quick Chat | 19 | 8 | 27 | ✅ Complete |
| Terminal | 14 | 12 | 26 | ✅ Complete |
| **Total New** | **102** | **95** | **197** | **100%** |

**Overall Scribe:** 2,015 tests (all passing)

---

## 🎯 Recommended Next Steps

### Immediate (This Week)
1. **Wire Tauri AI Backend** (2-3h) - Highest impact
   - Makes Claude tab and Quick Chat fully functional
   - All UI already built and tested
   - Just needs Rust command wiring

2. **Complete Terminal PTY** (2-3h) - Academic power users
   - Unlocks shell access for researchers
   - Enable Quarto, BibTeX, Git workflows
   - xterm.js UI already complete

3. **⌘⇧T Reopen Tab** (15m) - Quick polish
   - Store implementation done
   - Just wire keyboard shortcut

### Medium Term (Next Sprint)
4. **Vault Sidebar** (Phase 2, 4-6h)
   - Obsidian-style file tree
   - Rename Projects → Vaults
   - Better organization for large projects

### Long Term (v2.0+)
5. **Ambient AI** (Option G, 4-5h)
   - Ultimate ADHD-friendly experience
   - ⌘K everywhere, inline suggestions
   - Remove dedicated AI panels

---

## 📁 Reference Documents

| Document | Purpose |
|----------|---------|
| `IMPLEMENTATION-STATUS-2026-01-08.md` | Detailed implementation status (this doc's source) |
| `ROADMAP-CONSOLIDATED-2026-01-08.md` | Complete roadmap (v1.15 Quarto + v2.0 LaTeX) |
| `BRAINSTORM-sidebar-consolidation-2025-12-29.md` | Original design brainstorm |
| `SCHEMATIC-LEFT-SIDEBAR-REDESIGN.md` | Left sidebar Plan B design |
| `IDEAS.md` | Feature options with effort ratings |
| `NEXT_STEPS.md` | Sprint tracking |

---

**Last Updated:** 2026-01-08
**Next Review:** After Tauri AI backend wiring or Sprint 34 completion
