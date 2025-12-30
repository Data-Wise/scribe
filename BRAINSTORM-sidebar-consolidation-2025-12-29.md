# Sidebar Consolidation Brainstorm

**Generated:** 2025-12-29
**Context:** Scribe Mission Control HUD
**Updated:** Added research from OpenCode, Cursor, xterm.js + Terminal feasibility + Evolution path

## Current Architecture

Scribe currently has **THREE** right-side UI elements (not two):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              SCRIBE LAYOUT                               │
├──────────────┬────────────────────────────────────────────┬────────────┤
│  LEFT        │           MAIN CONTENT                     │   RIGHT    │
│  SIDEBAR     │                                            │   AREA     │
├──────────────┼────────────────────────────────────────────┼────────────┤
│ MissionSidebar│  EditorTabs + Editor                      │ Properties │
│ (3 modes):   │  OR                                       │ Backlinks  │
│ • Icon       │  MissionControl (dashboard)               │ Tags       │
│ • Compact    │                                            │ (tabbed)   │
│ • Card       │                                            │            │
│              │                                            │ + FLOATING:│
│              │                                            │ HudPanel   │
│              │                                            │ ClaudePanel│
└──────────────┴────────────────────────────────────────────┴────────────┘
```

---

## Research: Open Source Inspiration

### [OpenCode](https://github.com/opencode-ai/opencode) - AI Coding Agent for Terminal

**Key insights from OpenCode (41k+ GitHub stars):**

| Feature | Description | Scribe Relevance |
|---------|-------------|------------------|
| **TUI-first** | Built by neovim users, pushes terminal limits | Consider terminal tab in sidebar |
| **Client/Server** | Frontend is just one client, can drive remotely | Future: mobile companion app |
| **LSP Integration** | Multi-language code intelligence | Could integrate for code blocks |
| **75+ LLM providers** | Anthropic, local models, etc. | Keep CLI-only approach but note flexibility |
| **Custom Commands** | Markdown files as predefined prompts | Already have this pattern |
| **Privacy-first** | Choose provider, local models stay private | Aligns with Scribe CLI-only approach |

**OpenCode Architecture Pattern:**
```
┌─────────────────────────────────────────┐
│           TUI Interface                 │
├─────────────────────────────────────────┤
│  [Chat Panel]  │  [File Browser]        │
│                │  [Diagnostics]         │
│  AI responses  │  [Terminal output]     │
│  here          │                        │
├─────────────────────────────────────────┤
│  > Input prompt...                      │
└─────────────────────────────────────────┘
```

### [Cursor AI](https://cursor.com/features) - Agent-Centric Interface

**Key insights from Cursor 2.0:**

| Feature | Description | Scribe Application |
|---------|-------------|-------------------|
| **Agent as first-class** | Agents, plans, runs in sidebar | Consider "Sessions" tab |
| **Inline Edit (⌘K)** | Select code → modify directly | Could work for text blocks |
| **@ References** | `@file`, `@folder`, `@docs` | `@note`, `@project`, `@tag` |
| **Notepads** | Reusable prompt patterns | "Writing templates" feature |
| **Background Agents** | Spawn async agents, work in parallel | Future: parallel AI tasks |
| **Rules System** | Project/User/Team rules | Already have CLAUDE.md |

**Cursor Design Patterns to Adopt:**

1. **Context Reference (`@`)** - Reference notes in chat: `@Research-Methods suggest improvements`
2. **Inline Edit Mode** - Select text → `⌘K` → AI modifies in place
3. **Agent Sessions** - Named conversations that persist and can be resumed

---

## Options

### Option A: Merge HudPanel INTO Right Sidebar ⭐ RECOMMENDED

**Effort:** 🔧 Medium (1-2 hours)

Add a 4th tab to the Right Sidebar: **"Dashboard"** or **"Stats"**

```
Right Sidebar Tabs:
[Properties] [Backlinks] [Tags] [📊 Stats]
```

**Pros:**
- Single location for all right-side info
- Removes floating panel complexity
- Consistent collapse behavior
- Stats always accessible when editing

**Implementation:**
1. Create `StatsPanel.tsx` component (extract from HudPanel)
2. Add "stats" to `rightActiveTab` type
3. Remove HudPanel toggle button
4. Delete HudPanel.tsx

---

### Option F: Split Right Sidebar with Docked Claude Bottom

**Effort:** 🔧 Medium (2-3 hours)

Split-pane with Claude docked at bottom (like VS Code terminal):

```
┌─────────────────────────────────────────┐
│ [Properties] [Backlinks] [Tags] [Stats] │
├─────────────────────────────────────────┤
│   Tab content (resizable)               │
├─────────────────────────────────────────┤  ← Drag handle
│ 🤖 Claude Assistant                     │
│ [Chat history...]                       │
│ [Ask Claude...                       ⏎] │
└─────────────────────────────────────────┘
```

**If F feels cramped → Evolve to Option G (Ambient AI)**

---

### Option G: Ambient AI (Evolution Path) 🔄

**Effort:** 🏗️ Large (4-5 hours)

**Evolution trigger:** If Option F feels too cramped on smaller screens, evolve to ambient AI.

```
Evolution Path:
F (Split-pane) → cramped? → G (Ambient AI)
                         ↓
                   Remove bottom panel
                   AI via ⌘K only
                   Inline suggestions
```

**Ambient AI Features (from Cursor/OpenCode):**

| Feature | Keyboard | Behavior |
|---------|----------|----------|
| **Quick Ask** | `⌘K` | Command palette with AI input |
| **Inline Edit** | Select + `⌘K` | AI modifies selection in place |
| **@ References** | `@note-name` | Reference notes in prompts |
| **Tab Completion** | `Tab` | Accept ghost text suggestions |
| **Context Menu** | Right-click | AI actions on selection |

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           COMMAND PALETTE (⌘K)                          │
├─────────────────────────────────────────────────────────────────────────┤
│ 🔍 Ask: How can I improve @Research-Methods introduction?               │
├─────────────────────────────────────────────────────────────────────────┤
│   📝 Recent Notes                                                       │
│   🤖 AI Actions:                                                        │
│      • Improve selection                                                │
│      • Suggest related notes                                            │
│      • Generate summary                                                 │
│      • Find citations via @zotero                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Option H: Claude as Right Sidebar Tab (VS Code Style)

**Effort:** 🔧 Medium (1-2 hours)

Claude becomes a full tab (inspired by [VS Code Claude extension](https://cursor.com/features)):

```
[Props] [Links] [Tags] [Stats] [🤖 AI]
```

Full-height chat when selected. See previous section for details.

---

### Option I: Status Bar Quick Chat

**Effort:** ⚡ Quick (1 hour)

Status bar icon opens quick chat popover. See previous section for details.

---

### Option J: Terminal Tab (xterm.js) 🆕

**Effort:** 🔧 Medium (2-3 hours)

**Feasibility: ✅ HIGH** - Well-supported libraries exist.

Add a terminal tab to the right sidebar using [xterm.js](https://xtermjs.org/) (used by VS Code, Hyper, and many others).

```
┌─────────────────────────────────────────┐
│ [Props] [Links] [Tags] [Stats] [>_ Term]│
├─────────────────────────────────────────┤
│                                         │
│  $ claude "improve this intro"          │
│  [Claude response...]                   │
│                                         │
│  $ git status                           │
│  On branch feat/mission-control-hud     │
│                                         │
│  $ quarto render                        │
│  [Rendering output...]                  │
│                                         │
├─────────────────────────────────────────┤
│  $ _                                    │
└─────────────────────────────────────────┘
```

**React Libraries for xterm.js:**

| Library | Status | Recommendation |
|---------|--------|----------------|
| [react-xtermjs](https://github.com/Qovery/react-xtermjs) | Active, hooks support | ✅ **Best choice** |
| [@pablo-lion/xterm-react](https://github.com/PabloLION/xterm-react) | Active, full API | Good alternative |
| [xterm-for-react](https://github.com/robert-harbison/xterm-for-react) | Outdated | Skip |

**Key Features:**
- **FitAddon** for responsive resizing
- **WebLinksAddon** for clickable URLs
- **SearchAddon** for terminal search
- **Unicode11Addon** for emoji support

**Implementation:**

```typescript
// Using react-xtermjs hook approach
import { useXTerm } from '@nickelittle/react-xtermjs'
import { FitAddon } from 'xterm-addon-fit'

function TerminalPanel() {
  const { instance, ref } = useXTerm({
    options: { cursorBlink: true, theme: scribeTheme },
    addons: [new FitAddon()]
  })

  // Connect to Tauri shell or browser PTY
  useEffect(() => {
    if (instance) {
      instance.onData(data => sendToShell(data))
      onShellOutput(data => instance.write(data))
    }
  }, [instance])

  return <div ref={ref} className="h-full" />
}
```

**Tauri Integration:**

```rust
// src-tauri/src/terminal.rs
use tauri::command;
use std::process::{Command, Stdio};

#[command]
async fn spawn_shell() -> Result<u32, String> {
    // Spawn zsh with PTY
    let shell = Command::new("zsh")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(shell.id())
}
```

**Browser Mode Fallback:**
- Limited shell emulation (echo, help, basic commands)
- Or: WebSocket to local server for full shell access

**Pros:**
- Run Claude CLI directly: `claude "improve this"`
- Run Quarto: `quarto render`
- Git operations without leaving app
- Full shell power for academics

**Cons:**
- Adds complexity (PTY management)
- Security considerations (shell access)
- 6 tabs total with Terminal

**Use Cases for Writers:**
```bash
# Quick AI query
$ claude "summarize this note in 3 bullet points"

# Render manuscript
$ quarto render manuscript.qmd --to pdf

# Bibliography
$ bibtex manuscript

# Word count
$ wc -w *.md

# Git workflow
$ git add . && git commit -m "Draft complete"
```

---

### Option K: OpenCode-Style TUI Panel 🆕

**Effort:** 🏗️ Large (4-5 hours)

**Inspired by [OpenCode's TUI design](https://opencode.ai/)**: A dedicated "AI Workspace" panel that combines chat, file context, and output.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Props] [Links] [Tags] [Stats] [🤖 AI Workspace]                        │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─ Context ──────────────────────────┐ ┌─ Output ─────────────────────┐ │
│ │ 📄 Research Methods (current)      │ │ Running: improve intro...   │ │
│ │ 📎 Selected: paragraph 3           │ │ ████████░░ 80%              │ │
│ │ 🏷️ Tags: #research #methods        │ │                             │ │
│ │ 🔗 Links: [[Statistics]], [[IRB]]  │ │ Suggestion ready:           │ │
│ └────────────────────────────────────┘ │ "Consider starting with..." │ │
│                                        └─────────────────────────────┘ │
│ ┌─ Chat ─────────────────────────────────────────────────────────────┐ │
│ │ You: Improve the introduction, make it more engaging               │ │
│ │                                                                     │ │
│ │ Claude: I've analyzed your introduction. Here are my suggestions:  │ │
│ │ 1. Start with a compelling hook about the research gap             │ │
│ │ 2. Move the methodology preview to paragraph 2                     │ │
│ │ [Apply changes] [Copy] [Regenerate]                                │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Ask about @Research-Methods...                                    ⏎│ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Features (from OpenCode):**
- **Context Panel**: Shows what AI "sees" (current note, selection, tags)
- **Output Panel**: Progress indicator, results preview
- **@ References**: Type `@note-name` to include in context
- **Action Buttons**: Apply changes directly to editor

**This is essentially Option H (Claude tab) + richer UI inspired by OpenCode.**

---

## Updated Decision Matrix

| Option | Effort | ADHD | AI UX | Terminal | Tabs | Recommendation |
|--------|--------|------|-------|----------|------|----------------|
| **A: Stats tab** | 🔧 Med | ⭐⭐⭐⭐ | - | - | 4 | ✅ **Do first** |
| F: Split Claude | 🔧 Med | ⭐⭐⭐ | Good | - | 4 | Evolve to G if cramped |
| **G: Ambient AI** | 🏗️ Lg | ⭐⭐⭐⭐⭐ | Best | - | 4 | 🥇 **Long-term goal** |
| H: Claude tab | 🔧 Med | ⭐⭐⭐⭐ | Great | - | 5 | Good middle ground |
| I: Status bar | ⚡ Quick | ⭐⭐⭐ | Quick | - | 4 | Quick win |
| **J: Terminal tab** | 🔧 Med | ⭐⭐⭐ | CLI | ✅ | 5-6 | 🥈 **Power users** |
| K: AI Workspace | 🏗️ Lg | ⭐⭐⭐⭐ | Rich | - | 5 | Future option |

---

## Evolution Path (Recommended)

```
Phase 1: Foundation
├── Option A: Stats tab (remove HudPanel) ✓
└── Option I: Status bar quick chat ✓

Phase 2: AI Integration (Choose ONE)
├── Option H: Claude as tab (simple)
├── Option F: Split-pane (always visible)
│   └── → Evolve to G if cramped
└── Option K: AI Workspace (rich, complex)

Phase 3: Power Features
├── Option J: Terminal tab (xterm.js)
└── Option G: Ambient AI (⌘K everywhere)
```

---

## Terminal Feasibility Summary

### ✅ Feasible with [react-xtermjs](https://github.com/Qovery/react-xtermjs)

**Pros:**
- Mature library, used by VS Code
- React hooks API
- Easy addon integration (fit, search, links)
- Works with Tauri's shell spawn

**Challenges:**
- PTY management in Rust/Tauri
- Browser mode needs fallback
- Security (shell access from web view)

**Recommendation:** Add as Phase 3 feature for power users. Not essential for v1.0 but valuable for academic workflow (Quarto, BibTeX, Claude CLI).

---

## Quick Wins

1. ⚡ **Add Stats tab** (Option A) - Consolidates HudPanel
2. ⚡ **Status bar AI icon** (Option I) - Quick chat access
3. ⚡ **@ References** in chat - `@note-name` syntax (from Cursor)

---

## Sources

- [OpenCode - AI Coding Agent](https://github.com/opencode-ai/opencode) - TUI design, client/server architecture
- [OpenCode Docs](https://opencode.ai/docs/) - Custom commands, LSP integration
- [Cursor Features](https://cursor.com/features) - Agent-centric interface, inline edit, @ references
- [Cursor 2.0 Guide](https://skywork.ai/blog/vibecoding/cursor-2-0-ultimate-guide-2025-ai-code-editing/) - Background agents, rules system
- [react-xtermjs](https://github.com/Qovery/react-xtermjs) - React terminal library
- [xterm.js](https://xtermjs.org/) - Terminal emulator for web

---

## Next Steps

**Phase 1 (Now):** Option A - Add Stats tab, remove HudPanel

**Phase 2 (Choose one for AI):**
- Option H: Simple Claude tab (easiest)
- Option F → G: Split-pane that can evolve to ambient (flexible)
- Option K: Rich AI Workspace (most featured)

**Phase 3 (Power features):**
- Option J: Terminal tab with xterm.js
- Option G: Full ambient AI with @ references

Which path appeals to you?
