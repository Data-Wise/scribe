# Architecture

Scribe is built with Tauri 2 + React, providing a native desktop experience with web-based UI.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Tauri 2 | Native desktop shell |
| **Backend** | Rust | Performance, security |
| **Frontend** | React 18 | UI components |
| **Editor** | HybridEditor | Markdown + preview |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **State** | Zustand | Lightweight state management |
| **Database** | SQLite | Local data storage |
| **Testing** | Vitest | Fast unit tests |

## Project Structure

```
scribe/
├── src/
│   └── renderer/              # React frontend
│       └── src/
│           ├── components/    # UI components
│           │   ├── HybridEditor.tsx
│           │   ├── CommandPalette.tsx
│           │   ├── SettingsModal.tsx
│           │   └── ...
│           ├── lib/           # Utilities
│           │   ├── themes.ts
│           │   └── api.ts
│           ├── store/         # Zustand state
│           │   └── useNotesStore.ts
│           ├── types/         # TypeScript types
│           └── App.tsx        # Main app
│
├── src-tauri/                 # Tauri backend
│   ├── src/
│   │   ├── lib.rs
│   │   ├── main.rs
│   │   ├── database.rs       # SQLite operations
│   │   └── commands.rs       # IPC handlers
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── docs/                      # Documentation (MkDocs)
├── scripts/                   # Build & install scripts
└── package.json
```

## Data Flow

```
User Input → React Component → Zustand Store → Tauri IPC → Rust Backend → SQLite
                                     ↓
                              UI Re-render
```

## Database Schema

### Notes Table

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  folder TEXT DEFAULT 'inbox',
  created_at TEXT,
  updated_at TEXT
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

Themes use CSS custom properties:

```css
:root {
  --nexus-bg-primary: #0a0c10;
  --nexus-bg-secondary: #12161c;
  --nexus-bg-tertiary: #1a1f26;
  --nexus-text-primary: #e2e8f0;
  --nexus-text-muted: #94a3b8;
  --nexus-accent: #38bdf8;
  --nexus-accent-hover: #7dd3fc;
}
```

Applied via JavaScript:

```typescript
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.style.setProperty('--nexus-bg-primary', theme.colors.bgPrimary);
  // ... etc
}
```

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

## Testing Strategy

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | Components, utilities |
| Integration | Vitest + Testing Library | User flows |
| E2E | Planned | Full app testing |

Current: **407 tests passing**
