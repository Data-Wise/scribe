# Architecture

Scribe is built with Tauri 2 + React, providing a native desktop experience with web-based UI.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Tauri 2 | Native desktop shell |
| **Backend** | Rust | Performance, security |
| **Frontend** | React 18 | UI components |
| **Editor** | CodeMirror 6 | Source editor with extensions |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **State** | Zustand (5 stores) | Lightweight state management |
| **Database** | SQLite (Tauri) / IndexedDB (Browser) | Local data storage |
| **Terminal** | xterm.js | Embedded PTY shell |
| **Graph** | D3.js | Knowledge graph visualization |
| **Math** | KaTeX | LaTeX rendering |
| **Testing** | Vitest + Testing Library | Unit/integration tests |

## Dual Runtime Architecture

Scribe runs in two modes with a unified API:

| Mode | Database | Launch | Use Case |
|------|----------|--------|----------|
| **Tauri** | SQLite (Rust) | `npm run dev` | Full features, desktop app |
| **Browser** | IndexedDB (Dexie.js) | `npm run dev:vite` | Testing, demos, development |

The API factory (`src/renderer/src/lib/api.ts`) auto-switches based on runtime detection via `platform.ts`.

## Project Structure

```
scribe/
├── src/
│   └── renderer/              # React frontend
│       └── src/
│           ├── components/    # UI components
│           │   ├── sidebar/   # MissionSidebar system (25+ files)
│           │   ├── EditorTabs/
│           │   ├── Settings/  # Settings subsystem (12 files)
│           │   ├── HybridEditor.tsx
│           │   ├── CodeMirrorEditor.tsx
│           │   ├── EditorOrchestrator.tsx
│           │   ├── KeyboardShortcutHandler.tsx
│           │   ├── PomodoroTimer.tsx
│           │   ├── CommandPalette.tsx
│           │   └── ...        # 50+ components total
│           ├── hooks/
│           │   ├── usePreferences.ts
│           │   ├── useResponsiveLayout.ts  # Auto-collapse sidebars on resize
│           │   ├── useGlobalZoom.ts         # ⌘+/⌘- zoom (0.5–2.0)
│           │   ├── useIconGlowEffect.ts
│           │   └── useForestTheme.ts
│           ├── lib/           # Utilities
│           │   ├── api.ts            # API factory (Tauri/Browser)
│           │   ├── browser-api.ts    # IndexedDB API
│           │   ├── browser-db.ts     # Dexie.js schema
│           │   ├── preferences.ts
│           │   ├── shortcuts.ts      # 27-shortcut registry
│           │   ├── themes.ts
│           │   ├── quarto-completions.ts
│           │   └── settingsSchema.ts
│           ├── store/         # Zustand state (singular)
│           │   ├── useNotesStore.ts
│           │   ├── useProjectStore.ts
│           │   ├── useAppViewStore.ts
│           │   ├── usePomodoroStore.ts
│           │   └── useSettingsStore.ts
│           └── __tests__/     # 81 test files, 2,326 tests
│
├── src-tauri/                 # Tauri backend
│   ├── src/
│   │   ├── lib.rs
│   │   ├── main.rs
│   │   ├── database.rs       # SQLite operations
│   │   ├── database/         # Database modules
│   │   ├── commands.rs       # IPC handlers
│   │   ├── academic.rs       # Citations + export
│   │   └── terminal.rs       # PTY backend
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── docs/                      # Documentation (MkDocs)
├── scripts/                   # Build & install scripts
└── package.json
```

## Data Flow

```
User Input → React Component → Zustand Store → API Layer → Backend → Database
                                     ↓                         ↓
                              UI Re-render            SQLite (Tauri) or
                                                      IndexedDB (Browser)
```

## Database Schema

### Notes Table

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  folder TEXT DEFAULT 'inbox',
  project_id TEXT REFERENCES projects(id),
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  deleted_at INTEGER NULL
);
```

### Projects Table

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('research','teaching','r-package','r-dev','generic')) DEFAULT 'generic',
  color TEXT,
  icon TEXT,
  settings TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### Tags Table

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TEXT
);
```

### Note-Tags Junction

```sql
CREATE TABLE note_tags (
  note_id TEXT,
  tag_id TEXT,
  PRIMARY KEY (note_id, tag_id)
);
```

### Links Table

```sql
CREATE TABLE links (
  source_note_id TEXT,
  target_note_id TEXT,
  PRIMARY KEY (source_note_id, target_note_id)
);
```

## Theme System

Themes use CSS custom properties applied to `:root`:

```typescript
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--nexus-${key}`, value);
  });
}
```

10 built-in themes (5 dark, 5 light) with keyboard shortcuts (`⌘⌥0`–`⌘⌥9`).

## IPC Communication

Frontend → Backend communication via Tauri commands:

```typescript
// Frontend
import { invoke } from '@tauri-apps/api/core';
const notes = await invoke('get_all_notes');

// Backend (Rust)
#[tauri::command]
fn get_all_notes(db: State<Database>) -> Result<Vec<Note>, String> {
  db.get_all_notes().map_err(|e| e.to_string())
}
```

## Testing

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | Components, utilities, stores |
| Integration | Vitest + Testing Library | User flows |
| Store | Vitest | Zustand store state machines |

Current: **2,326 tests passing** across 81 test files
