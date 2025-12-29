# Sprint 28 Plan: PWA/Browser Support

> **Status:** 📋 Planned
> **Focus:** Platform abstraction for browser deployment
> **Target:** v1.9.0

---

## Overview

Sprint 28 focuses on enabling Scribe to run as a Progressive Web App (PWA) in addition to the Tauri desktop app. This requires implementing platform-agnostic storage and offline capabilities.

---

## Goals

1. **Browser Storage** - IndexedDB adapter for IStorage interface
2. **Offline Support** - Service worker for PWA functionality
3. **Platform Detection** - Auto-switch storage based on runtime
4. **Data Portability** - Export/import for cross-platform sync

---

## Sprint 28 Tasks

### P0 - Core Architecture

| Task | Effort | Description |
|------|--------|-------------|
| BrowserStorage adapter | 4h | IndexedDB implementation of IStorage |
| Storage factory | 2h | Runtime platform detection & switching |
| Service worker | 3h | Offline caching, background sync |
| PWA manifest | 1h | Icons, theme colors, install prompt |

### P1 - Feature Parity

| Task | Effort | Description |
|------|--------|-------------|
| Settings persistence | 2h | LocalStorage for preferences in browser |
| Sync UI for browser | 3h | Visual indicator when offline/online |
| Export/import data | 3h | JSON export for backup/transfer |
| Browser-safe shortcuts | 2h | Remap conflicting keyboard shortcuts |

### P2 - Polish & Future

| Task | Effort | Description |
|------|--------|-------------|
| Keyboard shortcut hints | 1h | Tooltips showing shortcuts throughout app |
| Collapsible section animations | 2h | Smooth transitions for expand/collapse |
| Focus management | 2h | Improved keyboard navigation in panels |
| Graph preview | 4h | Mini-graph in Backlinks tab (future) |

---

## Technical Design

### IStorage Interface (Already Created)

```typescript
// src/renderer/src/lib/storage.ts
interface IStorage {
  // Notes
  getAllNotes(): Promise<Note[]>
  getNote(id: string): Promise<Note | null>
  createNote(note: Partial<Note>): Promise<Note>
  updateNote(id: string, updates: Partial<Note>): Promise<Note>
  deleteNote(id: string): Promise<void>

  // Projects
  getAllProjects(): Promise<Project[]>
  // ... etc
}
```

### BrowserStorage Implementation

```typescript
// src/renderer/src/lib/browser-storage.ts
import { IStorage } from './storage'
import { openDB, DBSchema } from 'idb'

interface ScribeDB extends DBSchema {
  notes: {
    key: string
    value: Note
    indexes: { 'by-project': string; 'by-updated': number }
  }
  projects: {
    key: string
    value: Project
  }
  tags: {
    key: string
    value: Tag
  }
}

export class BrowserStorage implements IStorage {
  private db: Promise<IDBPDatabase<ScribeDB>>

  constructor() {
    this.db = openDB<ScribeDB>('scribe', 1, {
      upgrade(db) {
        const notes = db.createObjectStore('notes', { keyPath: 'id' })
        notes.createIndex('by-project', 'projectId')
        notes.createIndex('by-updated', 'updatedAt')

        db.createObjectStore('projects', { keyPath: 'id' })
        db.createObjectStore('tags', { keyPath: 'id' })
      }
    })
  }

  async getAllNotes(): Promise<Note[]> {
    const db = await this.db
    return db.getAll('notes')
  }

  // ... implement remaining methods
}
```

### Storage Factory

```typescript
// src/renderer/src/lib/storage-factory.ts
import { IStorage } from './storage'
import { TauriStorage } from './tauri-storage'
import { BrowserStorage } from './browser-storage'

export function createStorage(): IStorage {
  // Check if running in Tauri
  if (window.__TAURI__) {
    return new TauriStorage()
  }
  return new BrowserStorage()
}

// Singleton for app-wide use
export const storage = createStorage()
```

### Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'scribe-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/renderer/src/lib/browser-storage.ts` | Create | IndexedDB IStorage implementation |
| `src/renderer/src/lib/storage-factory.ts` | Create | Platform detection & storage switching |
| `public/sw.js` | Create | Service worker for offline support |
| `public/manifest.json` | Create | PWA manifest |
| `index.html` | Modify | Register service worker |
| `vite.config.ts` | Modify | PWA plugin configuration |

---

## Dependencies

```bash
# IndexedDB wrapper
npm install idb

# PWA Vite plugin (optional, for manifest generation)
npm install -D vite-plugin-pwa
```

---

## Testing Strategy

### Unit Tests

- BrowserStorage CRUD operations
- Storage factory platform detection
- Offline/online state handling

### Integration Tests

- Data export/import roundtrip
- Cross-storage migration
- Service worker caching

### Manual Testing

- Install PWA on Chrome/Safari
- Test offline mode
- Verify data persistence after browser restart

---

## Success Criteria

- [ ] BrowserStorage passes all IStorage interface tests
- [ ] PWA installable on Chrome/Safari
- [ ] Works offline (cached assets + local data)
- [ ] Export/import data works between Tauri and browser
- [ ] No breaking changes to existing Tauri functionality

---

## Future Considerations

### Sprint 29: Cloud Sync (Optional)

- PouchDB for automatic sync
- CouchDB backend (self-hosted or Cloudant)
- Conflict resolution strategy

### Sprint 30: Mobile PWA

- Responsive design adjustments
- Touch-friendly UI
- Mobile keyboard shortcuts

---

## Decision Log

| Date | Decision |
|------|----------|
| 2025-12-28 | Use `idb` library for IndexedDB (type-safe, promise-based) |
| 2025-12-28 | PWA is opt-in deployment, Tauri remains primary |
| 2025-12-28 | Export/import is JSON format for simplicity |

---

## Related Documents

- [ARCHITECTURE.md](../ARCHITECTURE.md) - IStorage interface design
- [CLAUDE.md](../../CLAUDE.md) - Storage abstraction decisions
- [.STATUS](../../.STATUS) - Sprint tracking
