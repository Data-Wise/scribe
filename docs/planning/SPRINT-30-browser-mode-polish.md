# Sprint 30: Browser Mode Polish

**Branch:** `feat/browser-mode-polish`
**Target:** v1.12.0
**Started:** 2026-01-02

---

## Overview

Polish browser mode functionality to achieve feature parity with Tauri mode for core wiki link and tag features.

---

## Key Findings

### 🐛 Critical Bug: Wiki Links & Tags Not Indexed in Browser Mode

**Root Cause:** Utility functions `updateNoteLinks()` and `updateNoteTags()` exist in `browser-api.ts` but are **never called** when notes are created or updated.

**Evidence:**
```typescript
// src/renderer/src/lib/browser-api.ts

createNote: async (note: Partial<Note>): Promise<Note> => {
  // ... creates note ...
  await db.notes.add(noteToRecord(newNote) as any)
  return newNote
  // ❌ Missing: updateNoteLinks(id, content)
  // ❌ Missing: updateNoteTags(id, content)
}

updateNote: async (id: string, updates: Partial<Note>): Promise<Note | null> => {
  // ... updates note ...
  await db.notes.put(updatedRecord)
  return parseNoteRecord(updatedRecord)
  // ❌ Missing: updateNoteLinks(id, content)
  // ❌ Missing: updateNoteTags(id, content)
}
```

**Impact:**
- Wiki links `[[Note Title]]` are not indexed → Backlinks panel is empty
- Tags `#tag` are not indexed → Tag filtering doesn't work
- Core Obsidian-like features broken in browser mode

**Existing Functions (Already Implemented):**
- ✅ `updateNoteLinks(noteId, content)` - Extracts `[[wiki links]]` and creates `noteLinks` entries
- ✅ `updateNoteTags(noteId, content)` - Extracts `#tags` and creates tag associations
- ✅ `getBacklinks(noteId)` - Returns notes linking to this note
- ✅ `getOutgoingLinks(noteId)` - Returns notes linked from this note

---

## Sprint 30 Tasks

### Phase 1: Fix Wiki Link & Tag Indexing (P0 - Critical)

**Goal:** Make browser mode index wiki links and tags when notes are created/updated

**Tasks:**

1. **Update `createNote` function**
   - Call `updateNoteLinks(id, content)` after note creation
   - Call `updateNoteTags(id, content)` after note creation
   - Test: Create note with `[[link]]` → Verify backlink appears

2. **Update `updateNote` function**
   - Call `updateNoteLinks(id, content)` if content changed
   - Call `updateNoteTags(id, content)` if content changed
   - Test: Edit note to add `[[link]]` → Verify backlink appears

3. **Add batch indexing for existing notes**
   - Create `reindexAllNotes()` utility function
   - Run on app initialization in browser mode
   - Show progress toast: "Indexing notes... (X/Y)"

4. **E2E Tests**
   - Create note with wiki link → Backlinks panel shows link
   - Update note to add wiki link → Backlinks panel updates
   - Delete note with wiki link → Backlinks panel removes link
   - Create note with tag → Tag panel shows note
   - Tag filtering works correctly

**Files to modify:**
- `src/renderer/src/lib/browser-api.ts` (createNote, updateNote)
- `src/renderer/src/lib/browser-db.ts` (add reindexAllNotes)
- `src/renderer/src/App.tsx` (call reindex on browser mode init)
- `e2e/browser-backlinks.spec.ts` (new test file)

**Acceptance Criteria:**
- [ ] Wiki links indexed on note create/update
- [ ] Tags indexed on note create/update
- [ ] Backlinks panel shows correct links in browser mode
- [ ] Tag filtering works in browser mode
- [ ] Existing notes reindexed on app start
- [ ] 5+ E2E tests passing

---

### Phase 2: PWA Improvements (P1 - High)

**Goal:** Improve Progressive Web App experience for offline usage

**Tasks:**

1. **Service Worker Optimization**
   - Review current SW cache strategy
   - Add offline page fallback
   - Cache app shell (HTML, CSS, JS)
   - Cache fonts and icons

2. **Manifest Improvements**
   - Add app screenshots for install prompt
   - Define app shortcuts (New Note, Daily Note, Search)
   - Set proper theme colors
   - Add maskable icon

3. **Offline Indicators**
   - Show "Offline" badge when network unavailable
   - Disable Tauri-only features gracefully
   - Queue sync operations for when online

4. **Install Prompts**
   - Detect if app is installable
   - Show install CTA in Mission Control (browser mode only)
   - Track if user dismissed prompt

**Files to modify:**
- `vite.config.ts` (PWA plugin config)
- `public/manifest.json`
- `src/renderer/src/components/OfflineIndicator.tsx` (new)
- `src/renderer/src/components/MissionControl/MissionControl.tsx`

**Acceptance Criteria:**
- [ ] App works offline (basic CRUD)
- [ ] Install prompt appears when appropriate
- [ ] Offline indicator shows network status
- [ ] App shortcuts work from home screen

---

### Phase 3: Documentation Updates (P2 - Medium)

**Goal:** Document browser mode features and limitations

**Tasks:**

1. **Update README.md**
   - Add "Browser Mode" section
   - List feature parity table (Tauri vs Browser)
   - Add PWA installation instructions

2. **Create Browser Mode Guide**
   - `docs/tutorials/BROWSER-MODE-GUIDE.md`
   - How to use browser mode
   - Feature differences from desktop app
   - IndexedDB storage limits
   - Offline usage guide

3. **Update CLAUDE.md**
   - Document browser-api.ts architecture
   - Note reindexing behavior
   - Testing browser mode features

4. **Add JSDoc comments**
   - Document all browser-api functions
   - Add usage examples
   - Note async/await patterns

**Files to modify:**
- `README.md`
- `docs/tutorials/BROWSER-MODE-GUIDE.md` (new)
- `CLAUDE.md`
- `src/renderer/src/lib/browser-api.ts`

**Acceptance Criteria:**
- [ ] README has browser mode section
- [ ] Browser mode guide complete
- [ ] CLAUDE.md updated
- [ ] All browser-api functions documented

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
describe('browser-api: Note Link Indexing', () => {
  it('should index wiki links when creating note', async () => {
    const note = await browserApi.createNote({
      title: 'Source Note',
      content: 'Link to [[Target Note]]'
    })

    const targetNote = await browserApi.createNote({
      title: 'Target Note',
      content: 'Content'
    })

    const backlinks = await browserApi.getBacklinks(targetNote.id)
    expect(backlinks).toHaveLength(1)
    expect(backlinks[0].id).toBe(note.id)
  })

  it('should update links when note content changes', async () => {
    const note = await browserApi.createNote({
      title: 'Note',
      content: 'No links'
    })

    await browserApi.updateNote(note.id, {
      content: 'Now has [[Link]]'
    })

    const links = await browserApi.getOutgoingLinks(note.id)
    expect(links.length).toBeGreaterThan(0)
  })
})
```

### E2E Tests (Playwright)

```typescript
test.describe('Browser Mode: Backlinks', () => {
  test('should show backlinks in panel', async ({ page }) => {
    // Create target note
    await page.click('[data-testid="new-note"]')
    await page.fill('[data-testid="note-title"]', 'Target Note')

    // Create source note with link
    await page.click('[data-testid="new-note"]')
    await page.fill('[data-testid="note-title"]', 'Source Note')
    await page.fill('[data-testid="note-editor"]', 'Links to [[Target Note]]')

    // Navigate to target note
    await page.click('text=Target Note')

    // Verify backlink appears
    await page.click('[data-testid="backlinks-panel"]')
    await expect(page.locator('text=Source Note')).toBeVisible()
  })
})
```

---

## Success Metrics

**Phase 1 (Critical):**
- ✅ 100% wiki link indexing accuracy
- ✅ Backlinks panel functional in browser mode
- ✅ Tag filtering functional in browser mode
- ✅ 5+ new E2E tests passing

**Phase 2 (PWA):**
- ✅ App installable via browser prompt
- ✅ Offline mode functional (basic CRUD)
- ✅ PWA audit score > 90

**Phase 3 (Docs):**
- ✅ All browser-api functions documented
- ✅ Browser mode guide complete
- ✅ Feature parity table in README

---

## Release Plan

**Target:** v1.12.0
**Timeline:** 1-2 days

**Release Checklist:**
- [ ] All Phase 1 tasks complete (critical)
- [ ] Phase 2 complete (PWA improvements)
- [ ] Phase 3 complete (documentation)
- [ ] E2E tests passing (978+ tests)
- [ ] No TypeScript errors
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json, Cargo.toml, tauri.conf.json
- [ ] PR to dev → merge → PR to main
- [ ] Tag v1.12.0
- [ ] GitHub release with notes

---

## Notes

- **Browser mode is a DEMO/TESTING tool** - Not intended to replace Tauri app
- **IndexedDB limits:** ~50MB per domain (browser-dependent)
- **No AI features in browser** - Requires Tauri for CLI access
- **No file system access** - Can't sync with Obsidian vault

---

## Next Sprint (Sprint 31) Ideas

- Advanced search filters
- Export notes to markdown zip
- Import markdown files via drag-drop
- Theme customization in browser mode
- Keyboard shortcuts customization

---

**Last Updated:** 2026-01-02
**Author:** DT
**Status:** Planning → Implementation
