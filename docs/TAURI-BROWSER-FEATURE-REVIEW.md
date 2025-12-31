# Tauri vs Browser Feature Parity Review

**Date:** 2025-12-30
**Status:** Comprehensive Audit
**Author:** Claude Code + DT

---

## Executive Summary

Scribe runs in two modes with separate backends:
- **Tauri Mode**: Native macOS app with SQLite (Rust backend)
- **Browser Mode**: Web app with IndexedDB (JavaScript backend)

This document identifies why features may work in browser but fail in Tauri, and proposes solutions.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│                    (Shared Components)                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                    api.ts (Factory)
                    isTauri() ? tauriApi : browserApi
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      TAURI MODE         │     │     BROWSER MODE        │
├─────────────────────────┤     ├─────────────────────────┤
│ api.ts → invoke()       │     │ browser-api.ts          │
│ commands.rs (Rust)      │     │ browser-db.ts (Dexie)   │
│ database.rs (SQLite)    │     │ IndexedDB               │
└─────────────────────────┘     └─────────────────────────┘
```

---

## Feature Comparison Matrix

### Core Features

| Feature | Browser | Tauri | Notes |
|---------|:-------:|:-----:|-------|
| **Note CRUD** | ✅ | ✅ | Full parity |
| **Project CRUD** | ✅ | ✅ | Full parity |
| **Tag CRUD** | ✅ | ✅ | Full parity |
| **Search** | ✅ | ✅ | Full parity |
| **Backlinks** | ✅ | ✅ | Full parity |
| **Wiki Links** | ✅ | ✅ | Full parity |
| **Daily Notes** | ✅ | ✅ | Full parity |
| **Folders** | ✅ | ✅ | Full parity |

### Native Features (Tauri-Only)

| Feature | Browser | Tauri | Notes |
|---------|:-------:|:-----:|-------|
| **Claude CLI** | ❌ Stub | ✅ | Requires `claude` in PATH |
| **Gemini CLI** | ❌ Stub | ✅ | Requires `gemini` in PATH |
| **Obsidian Export** | ❌ Stub | ✅ | File system access |
| **Font Management** | ❌ Stub | ✅ | Uses `fc-list` + Homebrew |
| **Zotero Citations** | ❌ Stub | ✅ | BibTeX file access |
| **Pandoc Export** | ❌ Stub | ✅ | PDF/DOCX/LaTeX |
| **Terminal Shell** | ❌ Stub | ⚠️ v2 | Not yet implemented |

### UI Features

| Feature | Browser | Tauri | Notes |
|---------|:-------:|:-----:|-------|
| **Left Sidebar** | ✅ | ✅ | Full parity |
| **Right Sidebar** | ✅ | ✅* | *Only shows when note selected |
| **Mission Control** | ✅ | ✅ | Full parity |
| **Command Palette** | ✅ | ✅ | Full parity |
| **Quick Capture** | ✅ | ✅ | Full parity |
| **Focus Timer** | ✅ | ✅ | Full parity |
| **Keyboard Shortcuts** | ✅ | ✅ | Full parity |

---

## Root Causes of Discrepancies

### 1. Development Workflow Bias

| Metric | Browser Mode | Tauri Mode |
|--------|-------------|------------|
| **Startup time** | ~200ms | ~3-5 seconds |
| **Hot reload** | Instant | Requires Rust compile |
| **Test coverage** | E2E tests run here | Manual testing only |
| **Developer preference** | `npm run dev:vite` | `npm run dev` |

**Impact:** Features are developed and tested primarily in browser mode.

### 2. API Command Name Drift

**Fixed Today (2025-12-30):**
```
Frontend invoked    → Should invoke
─────────────────────────────────────
get_project_notes   → get_notes_by_project  ✅ FIXED
set_note_project    → assign_note_to_project ✅ FIXED
```

**Remaining Issues:** None identified in core commands.

### 3. Silent Failure Pattern

**Problem:** Tauri invoke errors are caught and logged but not displayed:

```typescript
// Current pattern (silent failure)
try {
  const notes = await api.listNotes()
} catch (error) {
  console.error('Failed:', error)  // User never sees this
}
```

**Browser mode** handles errors gracefully with IndexedDB.
**Tauri mode** errors are invisible unless DevTools is open.

### 4. Initialization Differences

| Step | Browser | Tauri |
|------|---------|-------|
| **Data seeding** | `seedDemoData()` auto-runs | No demo data |
| **First run** | 3 demo projects + notes | Empty database |
| **Error feedback** | Inline errors | Console only |

### 5. Missing Tauri Commands

| Frontend Calls | Backend Status |
|----------------|----------------|
| `spawn_shell` | ❌ Not implemented (v2) |
| `write_to_shell` | ❌ Not implemented (v2) |
| `kill_shell` | ❌ Not implemented (v2) |

---

## Specific Issues & Solutions

### Issue 1: Right Sidebar Not Showing

**Cause:** The right sidebar only renders when `selectedNote` is truthy:
```tsx
// App.tsx line 1513
{selectedNote && (
  <RightSidebar ... />
)}
```

**Why it happens in Tauri:**
1. No demo data → no notes to select
2. User doesn't know to create a note first
3. Right sidebar appears empty/missing

**Solutions:**

| Solution | Effort | Impact |
|----------|--------|--------|
| A. Add first-run wizard | Medium | High |
| B. Show "Create Note" prompt when no notes | Low | Medium |
| C. Always show right sidebar (empty state) | Low | Medium |
| D. Seed demo data in Tauri too | Low | High ✅ |

**Recommended: Option D** - Seed demo data on Tauri first run.

### Issue 2: No Visible Error Feedback

**Current:** Errors logged to console only.

**Solution:** Add toast notifications for API failures:

```typescript
// Add to api.ts wrapper
const withErrorToast = async <T>(operation: Promise<T>, context: string): Promise<T> => {
  try {
    return await operation
  } catch (error) {
    showToast(`${context} failed: ${error.message}`, 'error')
    throw error
  }
}
```

### Issue 3: Platform Detection Confusion

**Current:** `isTauri()` checks `window.__TAURI__` at import time.

**Risk:** Race condition if Tauri injects `__TAURI__` after module loads.

**Solution:** Dynamic detection with fallback:
```typescript
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' &&
    ((window as any).__TAURI__ !== undefined ||
     (window as any).__TAURI_INTERNALS__ !== undefined)
}
```

---

## Recommended Action Plan

### Phase 1: Immediate Fixes (This Session)

- [x] Fix API command name mismatches
- [x] Add enhanced diagnostics
- [ ] Add Tauri demo data seeding
- [ ] Add visible error toast for API failures

### Phase 2: Short-Term (Next Sprint)

- [ ] Add E2E tests that run against Tauri (not just browser)
- [ ] Create API parity test suite
- [ ] Add "empty state" UI for right sidebar
- [ ] Add first-run onboarding

### Phase 3: Long-Term

- [ ] Implement unified error handling
- [ ] Add telemetry for silent failures
- [ ] Consider shared test database
- [ ] Document all platform differences

---

## Testing Recommendations

### 1. Run Both Modes Regularly

```bash
# Browser mode (fast iteration)
npm run dev:vite

# Tauri mode (verify parity)
npm run dev
```

### 2. Check Diagnostics

Open DevTools (⌘+Option+I) and look for:
```
[Scribe Diagnostics] Platform: TAURI
[Scribe Diagnostics] listNotes returned: X notes
[Scribe Diagnostics] listProjects returned: X projects
```

### 3. API Parity Test

```bash
# Compare frontend invoke calls vs backend registrations
grep -o "invoke('[^']*'" src/renderer/src/lib/api.ts | sort -u
grep "commands::" src-tauri/src/lib.rs | sort -u
```

---

## Appendix: Full Command Mapping

### Matched Commands (43)

| Frontend `invoke()` | Backend `#[tauri::command]` |
|---------------------|----------------------------|
| `create_note` | `create_note` |
| `get_note` | `get_note` |
| `list_notes` | `list_notes` |
| `update_note` | `update_note` |
| `delete_note` | `delete_note` |
| `search_notes` | `search_notes` |
| `create_tag` | `create_tag` |
| `get_tag` | `get_tag` |
| `get_tag_by_name` | `get_tag_by_name` |
| `get_all_tags` | `get_all_tags` |
| `rename_tag` | `rename_tag` |
| `delete_tag` | `delete_tag` |
| `add_tag_to_note` | `add_tag_to_note` |
| `remove_tag_from_note` | `remove_tag_from_note` |
| `get_note_tags` | `get_note_tags` |
| `get_notes_by_tag` | `get_notes_by_tag` |
| `filter_notes_by_tags` | `filter_notes_by_tags` |
| `update_note_tags` | `update_note_tags` |
| `get_folders` | `get_folders` |
| `update_note_links` | `update_note_links` |
| `get_backlinks` | `get_backlinks` |
| `get_outgoing_links` | `get_outgoing_links` |
| `run_claude` | `run_claude` |
| `run_gemini` | `run_gemini` |
| `get_or_create_daily_note` | `get_or_create_daily_note` |
| `export_to_obsidian` | `export_to_obsidian` |
| `get_installed_fonts` | `get_installed_fonts` |
| `is_font_installed` | `is_font_installed` |
| `install_font_via_homebrew` | `install_font_via_homebrew` |
| `is_homebrew_available` | `is_homebrew_available` |
| `get_citations` | `get_citations` |
| `search_citations` | `search_citations` |
| `get_citation_by_key` | `get_citation_by_key` |
| `set_bibliography_path` | `set_bibliography_path` |
| `get_bibliography_path` | `get_bibliography_path` |
| `export_document` | `export_document` |
| `is_pandoc_available` | `is_pandoc_available` |
| `create_project` | `create_project` |
| `get_project` | `get_project` |
| `list_projects` | `list_projects` |
| `update_project` | `update_project` |
| `delete_project` | `delete_project` |
| `get_notes_by_project` | `get_notes_by_project` |
| `assign_note_to_project` | `assign_note_to_project` |
| `get_project_settings` | `get_project_settings` |
| `update_project_settings` | `update_project_settings` |

### Frontend-Only (Not in Backend)

| Command | Status |
|---------|--------|
| `spawn_shell` | v2 feature (Terminal) |
| `write_to_shell` | v2 feature (Terminal) |
| `kill_shell` | v2 feature (Terminal) |

### Backend-Only (Not Called by Frontend)

| Command | Status |
|---------|--------|
| `get_project_note_count` | Available but unused |

---

## Conclusion

The core functionality is at parity. The perception of "Tauri being behind" comes from:

1. **No demo data** in Tauri (empty state looks broken)
2. **Silent failures** (errors not visible to users)
3. **Right sidebar hidden** when no note selected (by design)
4. **Testing bias** toward browser mode

The recommended fix is to **seed demo data in Tauri** and **add visible error feedback**.
