# Scribe Browser App - Full Implementation Plan

**Generated:** 2025-12-28
**Mode:** architecture (thorough)
**Context:** Create fully functional Chrome browser version of Scribe

## Goal

**NOT a demo/mock** - A fully functional browser app with:
- Real IndexedDB persistence (survives refresh)
- Full-text search
- All 46 API operations working
- CLI `scribe browser` command integration

## Problem Statement

Scribe runs at `localhost:5173` but all Tauri APIs fail in browser:
- 46 `invoke()` calls for database operations
- Dialog APIs (`open`, `ask`, `message`)
- Event listener (`listen` for menu events)
- Window controls (`getCurrentWindow`)

**Current Error:**
```
TypeError: Cannot read properties of undefined (reading 'transformCallback')
```

---

## Quick Wins (< 30 min each)

1. **isTauri detection utility** - Single check for runtime environment
   ```typescript
   export const isTauri = () => '__TAURI__' in window || '__TAURI_INTERNALS__' in window
   ```

2. **Guard existing listen() call** - Prevent crash on App.tsx:617
   ```typescript
   if (isTauri()) {
     const unlisten = listen<string>('menu-event', handler)
   }
   ```

3. **localStorage fallback for preferences** - Already using Zustand with persist

---

## Medium Effort Options (1-2 hours each)

### Option A: In-Memory Mock Database (Recommended)

**Pros:** Fast, no external deps, mirrors test setup pattern
**Cons:** Data lost on refresh, no persistence

```typescript
// src/renderer/src/lib/browser-api.ts
import { Note, Project, Tag } from '../types'

class BrowserMockDB {
  private notes: Map<string, Note> = new Map()
  private projects: Map<string, Project> = new Map()
  private tags: Map<string, Tag> = new Map()

  // Seed with demo data on init
  constructor() {
    this.seedDemoData()
  }

  createNote(note: Partial<Note>): Note {
    const id = crypto.randomUUID()
    const newNote = { id, ...note, created_at: new Date().toISOString() }
    this.notes.set(id, newNote)
    return newNote
  }

  // ... all 46 API methods
}

export const browserDB = new BrowserMockDB()
```

**Implementation:**
1. Create `browser-api.ts` with in-memory store
2. Create `api-factory.ts` that returns real or mock API
3. Seed with demo projects/notes for testing

---

### Option B: IndexedDB Persistence

**Pros:** Data persists across refresh, closer to real DB
**Cons:** More complex, async everywhere, migration headaches

```typescript
// Using Dexie.js for cleaner IndexedDB API
import Dexie from 'dexie'

class ScribeDB extends Dexie {
  notes!: Table<Note>
  projects!: Table<Project>
  tags!: Table<Tag>

  constructor() {
    super('scribe-browser')
    this.version(1).stores({
      notes: 'id, title, folder, project_id, created_at',
      projects: 'id, name, type',
      tags: 'id, name'
    })
  }
}
```

---

### Option C: API Factory Pattern (Cleanest Architecture)

**Pros:** Clean separation, easy to swap implementations
**Cons:** Requires refactoring api.ts imports throughout codebase

```typescript
// src/renderer/src/lib/api-factory.ts
import { api as tauriApi } from './tauri-api'
import { api as browserApi } from './browser-api'

export const isTauri = () => '__TAURI__' in window

export const api = isTauri() ? tauriApi : browserApi
```

**File Structure:**
```
src/renderer/src/lib/
├── api.ts              # Current file → rename to tauri-api.ts
├── tauri-api.ts        # Real Tauri invoke calls
├── browser-api.ts      # In-memory/IndexedDB mock
├── api-factory.ts      # Runtime detection + export
└── demo-data.ts        # Seed data for browser mode
```

---

## Long-term (Future Sessions)

- [ ] **Sync browser data to Tauri** - Export/import between modes
- [ ] **Service Worker persistence** - Offline-capable PWA mode
- [ ] **Storybook integration** - Component testing with mock data
- [ ] **E2E tests in browser** - Playwright tests against browser mode

---

## Tauri APIs Requiring Mocks

| Import | Location | Browser Fallback |
|--------|----------|------------------|
| `invoke` | api.ts (46 calls) | In-memory DB |
| `open/ask/message` | App.tsx | Browser `confirm()`, `alert()`, `prompt()` |
| `listen` | App.tsx:617 | No-op or custom event emitter |
| `getCurrentWindow` | DragRegion.tsx | No-op (hide drag region) |

---

## Recommended Path

**Start with Option A + Quick Wins:**

1. **Quick Win #1:** Add `isTauri()` utility (5 min)
2. **Quick Win #2:** Guard `listen()` call to prevent crash (5 min)
3. **Option A:** Create `browser-api.ts` with in-memory mock (1 hour)
4. **API Factory:** Create `api-factory.ts` for runtime switching (30 min)
5. **Demo Data:** Seed 2-3 projects, 5-10 notes for testing (15 min)

**Total: ~2 hours for full browser testing capability**

---

## Implementation Plan

### Phase 1: Stop the Crash (15 min)

```typescript
// src/renderer/src/lib/platform.ts
export const isTauri = (): boolean => {
  return '__TAURI__' in window || '__TAURI_INTERNALS__' in window
}

export const isBrowser = (): boolean => !isTauri()
```

```typescript
// App.tsx - guard the listen call
import { isTauri } from './lib/platform'

useEffect(() => {
  if (!isTauri()) return  // Skip in browser mode

  const unlisten = listen<string>('menu-event', handler)
  return () => { unlisten.then(fn => fn()) }
}, [])
```

### Phase 2: Mock API (1 hour)

Create `browser-api.ts` based on existing test setup pattern.

### Phase 3: Factory + Demo Data (30 min)

Wire up factory, add demo projects/notes.

### Phase 4: Dialog Fallbacks (15 min)

```typescript
// Browser fallbacks for Tauri dialogs
export const browserDialogs = {
  open: async () => prompt('Enter path:'),
  ask: async (msg: string) => confirm(msg),
  message: async (msg: string) => alert(msg)
}
```

---

## Next Steps

1. [ ] Create `src/renderer/src/lib/platform.ts` with `isTauri()` helper
2. [ ] Guard `listen()` call in App.tsx
3. [ ] Create `src/renderer/src/lib/browser-api.ts` with in-memory mock
4. [ ] Create `src/renderer/src/lib/api-factory.ts`
5. [ ] Add demo seed data
6. [ ] Test in Chrome at localhost:5173

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     App Components                          │
│  (App.tsx, ProjectSwitcher, MissionControl, etc.)          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    api-factory.ts                           │
│                                                             │
│   export const api = isTauri() ? tauriApi : browserApi     │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     tauri-api.ts        │     │    browser-api.ts       │
│                         │     │                         │
│  invoke('create_note')  │     │  browserDB.createNote() │
│  invoke('list_projects')│     │  browserDB.listProjects()│
│         ...             │     │         ...             │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│    Rust Backend         │     │   In-Memory Store       │
│    (SQLite)             │     │   (Map<string, T>)      │
└─────────────────────────┘     └─────────────────────────┘
```

---

---

## Implementation Status

### ✅ COMPLETED (2025-12-28)

**Files Created:**
- `src/renderer/src/lib/platform.ts` - Platform detection (`isTauri()`, `isBrowser()`)
- `src/renderer/src/lib/browser-db.ts` - IndexedDB database schema using Dexie.js
- `src/renderer/src/lib/browser-api.ts` - Full browser API implementation (46 operations)
- `src/renderer/src/lib/browser-dialogs.ts` - Dialog fallbacks for browser mode

**Files Modified:**
- `src/renderer/src/lib/api.ts` - Now factory that auto-switches Tauri/Browser
- `src/renderer/src/App.tsx` - Guarded Tauri-only code, use dialogs API
- `src/renderer/src/components/DragRegion.tsx` - Dynamic Tauri import

**Tested:**
- ✅ App loads in Chrome without crashes
- ✅ Platform detection works (`[Scribe] Running in browser mode`)
- ✅ Project creation works with IndexedDB
- ✅ Projects persist across page refresh
- ✅ Note creation works
- ✅ All UI components render correctly

**Stubs (require native Tauri):**
- AI operations (Claude/Gemini CLI)
- Obsidian sync
- Font management via Homebrew
- Citation/Zotero integration
- Pandoc document export

### Next Steps

1. [ ] Complete CLI `scribe browser` command integration
2. [ ] Add demo seed data for new users
3. [ ] Test note persistence and full-text search
4. [ ] Add browser mode indicator in UI
