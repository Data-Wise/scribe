# Dual-Mode Architecture: Tauri vs Browser

**Updated:** 2025-12-29

This document explains how Scribe runs in two modes and how features are shared between them.

---

## Overview

Scribe uses a **shared React frontend** with two different backends:

```
┌─────────────────────────────────────────────────────────────┐
│                   React Frontend (SHARED)                    │
│  StatsPanel, QuickChatPopover, HybridEditor, etc.           │
└─────────────────────────────┬───────────────────────────────┘
                              │
              api.ts: isTauri() ? tauriApi : browserApi
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────┐               ┌─────────────────────┐
│   Tauri (native)    │               │   Browser (web)     │
│   - SQLite          │               │   - IndexedDB       │
│   - Rust backend    │               │   - Dexie.js        │
│   - Claude/Gemini   │               │   - Stubs for AI    │
└─────────────────────┘               └─────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/renderer/src/lib/api.ts` | API factory - auto-selects backend |
| `src/renderer/src/lib/platform.ts` | Runtime detection (`isTauri()`, `isBrowser()`) |
| `src/renderer/src/lib/browser-api.ts` | IndexedDB implementation (46 operations) |
| `src/renderer/src/lib/browser-db.ts` | Dexie.js schema + seed data |
| `src-tauri/src/commands.rs` | Rust backend commands |
| `src-tauri/src/database.rs` | SQLite operations |

---

## Running Each Mode

```bash
# Tauri (full features, desktop app)
npm run dev

# Browser (testing, demos, development)
npm run dev:vite
```

---

## Feature Availability

### Automatically Shared (No Coordination Needed)

All React components work in both modes:

| Feature | Status |
|---------|--------|
| Stats Tab UI | ✅ Both modes |
| Quick Chat UI | ✅ Both modes |
| Tab system | ✅ Both modes |
| Editor modes (Source/Live/Reading) | ✅ Both modes |
| Note CRUD | ✅ Both modes (different backends) |
| Tags & filtering | ✅ Both modes |
| Backlinks | ✅ Both modes |
| Properties panel | ✅ Both modes |
| Command palette | ✅ Both modes |
| Keyboard shortcuts | ✅ Both modes |

### Tauri-Only Features

These features require native capabilities and are stubbed in browser mode:

| Feature | Tauri | Browser |
|---------|-------|---------|
| AI (Claude/Gemini CLI) | ✅ Works | Returns "unavailable" message |
| Font management | ✅ Homebrew | Stubbed |
| Obsidian sync | ✅ File system | Stubbed |
| Document export (PDF/DOCX) | ✅ Pandoc | Stubbed |
| Citation/Zotero | ✅ BibTeX files | Stubbed |

---

## Adding New Features

### UI Components (Automatic Sharing)

New React components automatically work in both modes:

```typescript
// Any component in src/renderer/src/components/
// Just works in both Tauri and Browser!
export function MyNewFeature() {
  return <div>Works everywhere</div>
}
```

### Features Requiring Backend

For features that need different implementations:

```typescript
// Check platform in component
import { isBrowser } from '../lib/platform'

if (isBrowser()) {
  // Show fallback or "unavailable" message
} else {
  // Use full Tauri functionality
}
```

Or use the API factory:

```typescript
// api.ts handles the switch automatically
import { api } from '../lib/api'

// This calls the right backend
const notes = await api.listNotes()
```

### Adding New API Methods

1. **Add to Tauri backend** (`src-tauri/src/commands.rs`)
2. **Add to tauriApi** (`src/renderer/src/lib/api.ts`)
3. **Add stub to browserApi** (`src/renderer/src/lib/browser-api.ts`)

---

## Quick Chat AI Example

The Quick Chat feature demonstrates the pattern:

```typescript
// In HybridEditor.tsx
const handleQuickChatSubmit = useCallback(async (message: string) => {
  if (isBrowser()) {
    // Browser mode: graceful degradation
    return 'AI features are only available in the desktop app.'
  }
  // Tauri mode: use actual AI
  return await api.runClaude(message)
}, [])
```

---

## Testing

- **Unit tests** (`npm test`): Run against mocked APIs
- **E2E tests** (`npm run test:e2e`): Run against browser mode (IndexedDB)
- **Manual Tauri testing**: `npm run dev` for full native features

---

## Related Documentation

- `ARCHITECTURE.md` - Overall system architecture
- `API.md` - Full API reference
- `BRAINSTORM-browser-fallback-2025-12-28.md` - Browser mode implementation notes
