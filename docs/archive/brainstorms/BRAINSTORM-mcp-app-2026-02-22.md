# BRAINSTORM: Scribe as MCP App in Claude Desktop

**Mode:** Architecture | **Depth:** Deep (8 questions) | **Date:** 2026-02-22

---

## Context

MCP Apps is a new extension to the Model Context Protocol that lets any MCP server deliver interactive UI (HTML/JS/CSS) within a sandboxed iframe inside Claude Desktop's chat window. Scribe already has a complete browser-mode fallback (IndexedDB via Dexie) that mirrors its Tauri backend 1:1 — making it uniquely well-positioned for this integration.

### User Answers (8 Expert Questions)

| # | Question | Answer |
|---|----------|--------|
| 1 | Primary use case | Write alongside Claude — draft/edit notes while chatting |
| 2 | Data sharing | Undecided — wants pros/cons |
| 3 | UI scope | Full app (ambitious) |
| 4 | AI bridge | Full tool integration — notes, search, organize as MCP tools |
| 5 | Bundling | Single HTML file (vite-plugin-singlefile) |
| 6 | Code location | In Scribe repo (monorepo) — `src/mcp-server/` |
| 7 | Discovery | Both: local custom connector (dev) + published (production) |
| 8 | Deploy v1 | Local only (`npm run serve`) |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Claude Desktop / claude.ai                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Chat Conversation                                     │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  MCP App Iframe (sandboxed)                      │  │  │
│  │  │  ┌──────────────────────────────────────────────┐│  │  │
│  │  │  │  SCRIBE (browser mode)                       ││  │  │
│  │  │  │  - Full React UI                             ││  │  │
│  │  │  │  - IndexedDB persistence (Dexie)             ││  │  │
│  │  │  │  - CodeMirror editor                         ││  │  │
│  │  │  │  - All features except Tauri-native          ││  │  │
│  │  │  └──────────────────────────────────────────────┘│  │  │
│  │  │        ↕ App.connect() / postMessage              │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│            ↕ MCP Protocol (HTTP)                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Scribe MCP Server (localhost:3001)                    │  │
│  │  - Registers tools (create/search/edit notes)          │  │
│  │  - Serves bundled HTML as ui:// resource               │  │
│  │  - Express + StreamableHTTP transport                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Quick Wins (< 2 hours each)

1. **Proof of concept: static editor** — Bundle `vite build` + `vite-plugin-singlefile`, serve from a minimal MCP server, verify it renders in Claude Desktop
2. **Platform detection for iframe** — Extend `platform.ts` to detect MCP App iframe context (no `__TAURI__`, inside iframe)
3. **Single "open-scribe" tool** — Register one tool that renders the full Scribe UI

## Medium Effort (4-8 hours)

4. **Full tool suite** — Map `browserApi` operations to MCP tools: `create-note`, `search-notes`, `list-projects`, `get-note`, `update-note`
5. **Bidirectional context** — Use `app.updateContext()` to push current note content to Claude's context window
6. **Vite build pipeline** — Add `mcp-app` build target with singlefile plugin alongside existing Tauri/Vite builds
7. **iframe-specific CSS** — Handle sandboxed iframe viewport: no title bar, constrained height, responsive layout

## Long-term (Future sessions)

8. **Data sharing via MCP server** — Server reads Scribe's SQLite DB for unified data
9. **Published connector** — Package and list in Claude's connector directory
10. **Theme sync** — Detect Claude Desktop's dark/light mode and match Scribe's theme
11. **Collaborative editing** — Claude writes directly into the editor via tool calls

---

## Data Strategy: Pros & Cons

### Option A: Independent (Sandboxed IndexedDB)

| Aspect | Detail |
|--------|--------|
| **Pro** | Zero setup — browser mode "just works" in iframe |
| **Pro** | No filesystem access needed — fully sandboxed |
| **Pro** | Each Claude conversation gets its own workspace |
| **Con** | Notes created in Claude Desktop are isolated from desktop Scribe |
| **Con** | No cross-session persistence (iframe storage may be ephemeral) |
| **Complexity** | Low — existing `browserApi` works unchanged |

### Option B: Shared via MCP Server

| Aspect | Detail |
|--------|--------|
| **Pro** | Unified data — notes visible in both desktop Scribe and Claude Desktop |
| **Pro** | MCP server can read/write Scribe's SQLite DB directly |
| **Pro** | Claude's MCP tools operate on real data |
| **Con** | Requires server to locate and access Scribe's DB file |
| **Con** | Concurrent access (Tauri + MCP server) needs WAL mode or locking |
| **Con** | More complex — server becomes a data layer |
| **Complexity** | Medium — new DB access layer in server |

### Option C: Export/Import Bridge

| Aspect | Detail |
|--------|--------|
| **Pro** | Clean separation — explicit user action to sync |
| **Pro** | No concurrency issues |
| **Con** | Manual friction — not seamless |
| **Complexity** | Low |

### Recommendation

**Start with Option A (independent)** for v1 — it works immediately with zero changes to existing code. Plan for **Option B** in v2 when the feature proves valuable. The MCP server already has access to tools; adding SQLite read access is a natural evolution.

---

## MCP Tool Design

### Core Tools (v1)

| Tool | Description | UI? |
|------|-------------|-----|
| `open-scribe` | Opens the full Scribe editor in-conversation | Yes (primary) |
| `create-note` | Creates a note with title/content | No (text result) |
| `search-notes` | Full-text search across notes | No (text result) |
| `get-note` | Retrieve a specific note by ID or title | No (text result) |
| `list-notes` | List recent/all notes | No (text result) |

### Extended Tools (v2)

| Tool | Description | UI? |
|------|-------------|-----|
| `edit-note` | Update existing note content | Yes (opens editor to note) |
| `list-projects` | Show all projects | No |
| `create-project` | Create a new project | No |
| `search-tags` | Find notes by tag | No |
| `daily-note` | Open/create today's daily note | Yes (opens editor) |
| `export-note` | Export note as markdown/PDF | No (text result) |

### Tool Result → UI Flow

```
User: "Open my writing app"
Claude: Calls open-scribe tool
  → Host fetches ui://scribe/app.html
  → Renders full Scribe in iframe
  → app.ontoolresult receives initial state
  → User writes alongside Claude

User: "Create a note about our discussion"
Claude: Calls create-note tool with title + content
  → Returns note ID + confirmation
  → If Scribe is open, app receives tool result and navigates to new note
```

---

## Build Pipeline

### New Scripts (package.json)

```json
{
  "scripts": {
    "mcp:build": "INPUT=src/mcp-app/mcp-app.html vite build --config vite.mcp.config.ts",
    "mcp:serve": "npx tsx src/mcp-server/server.ts",
    "mcp:dev": "npm run mcp:build && npm run mcp:serve"
  }
}
```

### Vite Config (vite.mcp.config.ts)

Separate Vite config for MCP App build:
- Uses `vite-plugin-singlefile` to inline all JS/CSS
- Excludes Tauri-specific imports
- Targets `src/mcp-app/mcp-app.html` as entry
- Outputs to `dist-mcp/`

### Directory Structure

```
scribe/
├── src/
│   ├── renderer/          # Existing React app
│   │   └── src/
│   │       ├── lib/       # browserApi, platform, etc.
│   │       └── components/
│   ├── mcp-app/           # MCP App entry point
│   │   ├── mcp-app.html   # HTML entry (loads React app)
│   │   └── mcp-app.ts     # App class + host communication
│   └── mcp-server/        # MCP server
│       ├── server.ts       # Express + MCP SDK server
│       ├── tools.ts        # Tool definitions
│       └── resources.ts    # UI resource handler
├── src-tauri/             # Existing Tauri backend
├── vite.config.ts         # Existing (Tauri build)
├── vite.mcp.config.ts     # New (MCP App build)
├── dist/                  # Existing (Tauri frontend)
└── dist-mcp/              # New (MCP bundled HTML)
```

---

## Iframe Constraints & Adaptations

### What Works in Sandboxed Iframe
- React rendering
- IndexedDB / Dexie persistence
- CodeMirror editor
- Zustand state management
- CSS / Tailwind styling
- localStorage (preferences)
- KaTeX math rendering
- Markdown rendering (react-markdown)

### What Needs Adaptation
| Feature | Desktop | MCP App | Solution |
|---------|---------|---------|----------|
| Title bar / drag region | Tauri overlay | N/A | Hide via CSS class |
| File dialogs | Tauri native | N/A | Disable export buttons |
| Terminal panel | xterm.js + PTY | N/A | Hide terminal tab |
| Font installation | Homebrew | N/A | Use web-safe fonts only |
| Clipboard | Tauri API | navigator.clipboard | Already has browser fallback |
| Window resize | Tauri window | Iframe resize | CSS max-height |
| Global shortcuts | Tauri shortcuts | N/A | Use in-app shortcuts only |

### New Platform Detection

```typescript
// src/renderer/src/lib/platform.ts (extended)
export const isMcpApp = (): boolean => {
  return isBrowser() && window.self !== window.top  // in iframe
}

export const getPlatform = (): 'tauri' | 'browser' | 'mcp-app' => {
  if (isTauri()) return 'tauri'
  if (isMcpApp()) return 'mcp-app'
  return 'browser'
}
```

---

## Security Considerations

- **CSP**: `vite-plugin-singlefile` inlines everything, avoiding cross-origin issues
- **IndexedDB isolation**: Each origin gets separate storage — MCP iframe will have its own
- **No credential exposure**: Scribe stores no API keys in browser mode (AI features use Tauri backend)
- **Tool authorization**: Host manages tool call approvals — users see each tool invocation

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Bundle too large for iframe | Medium | Medium | Tree-shake unused deps, lazy-load CodeMirror |
| IndexedDB not persistent in iframe | High | Low | Use `navigator.storage.persist()`, warn user |
| Claude Desktop iframe size too small | Medium | Medium | Responsive CSS, collapsible sidebar |
| MCP Apps spec changes | Low | Medium | Pin `@modelcontextprotocol/ext-apps` version |

---

## Recommended Path

**Phase 1 (v1.17.0):** Proof of concept
- `open-scribe` tool renders full editor in Claude Desktop
- Independent IndexedDB storage
- Local server only (`npm run mcp:serve`)
- 3 additional text-only tools (`create-note`, `search-notes`, `get-note`)

**Phase 2 (v1.18.0):** Full integration
- Bidirectional context (Claude sees your writing)
- 10+ tools covering full CRUD
- Shared SQLite data (read from Tauri DB)
- Published connector

**Phase 3 (v1.19.0):** Polish
- Theme sync with Claude Desktop
- Responsive iframe layout optimization
- Offline persistence guarantees
- User documentation and setup guide
