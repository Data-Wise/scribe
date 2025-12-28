# Scribe Dual Runtime Architecture

**Generated:** 2025-12-28
**Context:** Understanding Tauri vs Browser development coordination

---

## Overview

Scribe is **ONE React application** that runs in **TWO runtime environments**:

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Frontend (Single Codebase)            │
│                                                                 │
│   Components, Store, UI - identical in both modes               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      api.ts (Runtime Detection)                  │
│                                                                  │
│   const api = isTauri() ? tauriApi : browserApi                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     TAURI MODE          │     │     BROWSER MODE        │
│                         │     │                         │
│  npm run dev            │     │  npm run dev:vite       │
│  SQLite (Rust)          │     │  IndexedDB (Dexie.js)   │
│  Full features          │     │  Core features only     │
│  Desktop app            │     │  Any Chrome browser     │
└─────────────────────────┘     └─────────────────────────┘
```

---

## Why Two Modes?

### Tauri Mode (Production)
- **Database:** SQLite via Rust backend (fast, reliable)
- **Features:** AI (Claude/Gemini CLI), Obsidian sync, Pandoc export, Zotero
- **Distribution:** macOS .dmg, Windows .exe, Linux AppImage
- **Use case:** Daily writing, full functionality

### Browser Mode (Development)
- **Database:** IndexedDB via Dexie.js (persists in browser)
- **Features:** Core CRUD, search, tags, backlinks, UI testing
- **Distribution:** None needed - runs at localhost:5173
- **Use cases:**
  - UI development without Rust compilation
  - Testing on different browsers
  - Demos and screenshots
  - CI/CD testing

---

## Development Workflow

### When to Use Tauri Mode
```bash
npm run dev
```
- Testing Rust backend changes
- Testing native features (AI, export, sync)
- Final integration testing
- Building release binaries

### When to Use Browser Mode
```bash
npm run dev:vite
```
- UI/UX development (faster HMR)
- Component styling and layout
- Testing search, tags, backlinks
- Creating demos or screenshots
- Browser compatibility testing

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/platform.ts` | `isTauri()`, `isBrowser()` detection |
| `lib/api.ts` | Factory that exports correct API |
| `lib/browser-api.ts` | IndexedDB implementation (46 operations) |
| `lib/browser-db.ts` | Dexie.js schema + seed data |
| `lib/browser-dialogs.ts` | Browser `confirm()`/`alert()` fallbacks |

---

## Coordination Principles

### 1. Single Source of Truth
- **UI components:** One set of React components, works in both modes
- **Types:** Shared TypeScript types in `types/`
- **State:** Zustand store works identically in both

### 2. API Parity
- `browserApi` implements **all 46 operations** from `tauriApi`
- Stubbed methods return sensible defaults or messages
- Example: `runClaude()` returns "AI requires desktop app"

### 3. Test in Browser First
For UI changes:
1. Start with `npm run dev:vite` (fast, no Rust)
2. Iterate on UI/UX quickly
3. Test in Tauri when stable

### 4. Feature Flags by Platform
```typescript
// In components
if (isBrowser()) {
  // Show "Browser Mode" badge
  // Hide AI buttons or show "desktop only" tooltip
}
```

---

## Feature Availability Matrix

| Feature | Tauri | Browser | Notes |
|---------|-------|---------|-------|
| Create/Edit Notes | ✅ | ✅ | Full parity |
| Projects | ✅ | ✅ | Full parity |
| Tags | ✅ | ✅ | Full parity |
| Backlinks | ✅ | ✅ | Full parity |
| Full-text Search | ✅ | ✅ | Browser uses simple search |
| Command Palette | ✅ | ✅ | Full parity |
| Daily Notes | ✅ | ✅ | Full parity |
| Claude AI | ✅ | ❌ | Requires CLI |
| Gemini AI | ✅ | ❌ | Requires CLI |
| Obsidian Sync | ✅ | ❌ | Requires filesystem |
| PDF/Word Export | ✅ | ❌ | Requires Pandoc |
| Zotero Citations | ✅ | ❌ | Requires Zotero |
| Window Dragging | ✅ | ❌ | Native window API |

---

## Adding New Features

### If the feature is UI-only:
1. Develop in browser mode (fast iteration)
2. No changes to api.ts needed
3. Test in Tauri before merge

### If the feature needs backend:
1. Add to Tauri backend first (`src-tauri/`)
2. Add to `tauriApi` in `api.ts`
3. Add stub to `browserApi` (return default or message)
4. Test in both modes

### Example: Adding a new operation
```typescript
// api.ts - tauriApi
exportToPdf: (noteId: string): Promise<string> =>
  invoke('export_to_pdf', { noteId }),

// browser-api.ts - browserApi
exportToPdf: async (_noteId: string): Promise<string> => {
  return 'PDF export requires the desktop app'
}
```

---

## CLI Integration

The `scribe browser` command launches browser mode:
```bash
scribe browser              # Opens Chrome at localhost:5173
scribe browser --help       # Shows options
```

This is useful for:
- Quick demos without launching full Tauri app
- Testing on machines without Rust toolchain
- CI/CD environments

---

## Summary

| Question | Answer |
|----------|--------|
| How many apps? | **1 React app, 2 runtime modes** |
| Same UI? | **Yes, identical components** |
| Same data? | **No, separate databases (SQLite vs IndexedDB)** |
| Can sync between them? | **Not currently (future enhancement)** |
| Which to develop with? | **Browser for UI, Tauri for integration** |
| Which for production? | **Tauri only** |
