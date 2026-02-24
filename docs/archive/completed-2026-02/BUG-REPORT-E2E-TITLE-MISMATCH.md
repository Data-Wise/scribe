# Bug Report: E2E Test Title Mismatch

**Date**: 2026-01-02
**Status**: 🐛 Root Cause Identified → 🔧 Fix In Progress
**Severity**: Medium (Test Bug - Production Code Works Correctly)
**Sprint**: Sprint 30 Phase 1

---

## Summary

E2E tests for browser mode wiki link backlinks were failing (7/8 tests) because **note titles were never set**, causing wiki link target resolution to fail. Tests created notes with default title "New Note" but searched for wiki link targets like "Target Note" - no match resulted in empty backlinks.

---

## Root Cause Analysis

### The Problem

When E2E tests create notes using Playwright:

```typescript
// Test code
await page.click('button:has-text("New Page")')
const editor = page.locator('.cm-content, ...').first()
await editor.fill('# Target Note\n\nThis is the target')
```

**What happens:**
1. Note created with **default title: "New Note"**
2. Editor filled with markdown content (including `# Target Note` heading)
3. **Title field remains "New Note"** - heading is NOT auto-extracted

**Result:** Database has note with `title = "New Note"`, not `"Target Note"`

### Why Wiki Links Failed

When second note is created with `[[Target Note]]`:

```typescript
await editor.fill('# Source Note\n\nLinks to [[Target Note]]')
```

**Indexing process:**
1. ✅ `handleContentChange()` called
2. ✅ `updateNoteLinks()` called
3. ✅ Wiki link extracted: `"Target Note"`
4. ❌ **Database search:** `WHERE title = 'Target Note'`
5. ❌ **No match found** (actual title is "New Note")
6. ❌ **No link created**
7. ❌ **Backlinks panel empty**

---

## Evidence

### Console Log Output

```
BROWSER: [App.handleContentChange] CALLED for noteId: 41b9c107-...
BROWSER: [browserApi.updateNoteLinks] Found 1 wiki links: [Target Note]
BROWSER: [browserApi.updateNoteLinks] All note titles in DB: "New Note", "New Note", "Welcome to Scribe", ...
BROWSER: [browserApi.updateNoteLinks] Target note NOT FOUND for: "Target Note"
BROWSER: [browserApi.updateNoteLinks] COMPLETE - created 0 links
```

### Database State

| Note ID | Title Field | Markdown Heading | Wiki Link Target |
|---------|-------------|------------------|------------------|
| note-1 | **"New Note"** | `# Target Note` | - |
| note-2 | **"New Note"** | `# Source Note` | `[[Target Note]]` |

**Search:** `WHERE title = 'Target Note'`
**Result:** No match (title field is "New Note")

---

## Why BBL-06 Passed

Test BBL-06 ("Reindex on app initialization") **manually inserts notes to database** with correct titles:

```typescript
await db.notes.add({
  id: 'target-1',
  title: 'Target Note',  // ✅ Title explicitly set
  content: 'Target content',
  ...
})

await db.notes.add({
  id: 'source-1',
  title: 'Source Note',  // ✅ Title explicitly set
  content: 'Links to [[Target Note]]',
  ...
})

// Reload triggers reindexAllNotes()
await page.reload()

// ✅ Indexing finds "Target Note" by title field
// ✅ Backlinks appear correctly
```

---

## Investigation Timeline

### Phase 1: Timing Hypothesis ❌

**Hypothesis:** Tests not waiting long enough for async indexing

**Attempts:**
- Added 2-second waits before assertions
- Extended timeout to 10 seconds
- Increased editor fill waits from 1s to 3s

**Result:** Still failed - backlinks never appeared even after 15+ seconds total wait

### Phase 2: Integration Hypothesis ❌

**Hypothesis:** Editor not calling indexing functions

**Investigation:**
- Read `App.tsx` handleContentChange (lines 515-554)
- Found: ✅ Calls `updateNoteLinks()` and `updateNoteTags()`
- Found: ✅ Triggers `setBacklinksRefreshKey()` to refresh panel

**Result:** Editor integration confirmed working

### Phase 3: Debug Logging ✅ BREAKTHROUGH

**Action:** Added console.log to:
- `App.tsx handleContentChange()`
- `browserApi.updateNoteLinks()`
- `browserApi.getBacklinks()`

**Discovery:**
```
[browserApi.updateNoteLinks] Found 1 wiki links: [Target Note]
[browserApi.updateNoteLinks] All note titles in DB: "New Note", "New Note", ...
[browserApi.updateNoteLinks] Target note NOT FOUND for: "Target Note"
```

**Root Cause Identified:** Title field mismatch

---

## The Fix

### Before (Broken)

```typescript
test('BBL-01: Create note with wiki link - target exists', async ({ page }) => {
  // Create target note
  await page.click('button:has-text("New Page")')
  const editor = page.locator('.cm-content, ...').first()
  await editor.fill('# Target Note\n\nThis is the target')
  // ❌ Title is still "New Note" in database

  // Create source note
  await page.click('button:has-text("+ New Note")')
  await editor.fill('# Source Note\n\nLinks to [[Target Note]]')
  // ❌ Search for "Target Note" finds nothing
})
```

### After (Fixed)

```typescript
test('BBL-01: Create note with wiki link - target exists', async ({ page }) => {
  // Create target note
  await page.click('button:has-text("New Page")')

  // ✅ Set the note title first (CRITICAL!)
  await page.click('text=New Note')  // Enter edit mode
  const titleInput = page.locator('input').filter({ hasText: /./ }).first()
  await titleInput.fill('Target Note')
  await titleInput.press('Enter')
  await page.waitForTimeout(500)

  // Then fill content
  const editor = page.locator('.cm-content, ...').first()
  await editor.fill('# Target Note\n\nThis is the target')
  // ✅ Title is "Target Note" in database

  // Create source note
  await page.click('button:has-text("+ New Note")')

  // ✅ Set title
  await page.click('text=New Note')
  await titleInput.fill('Source Note')
  await titleInput.press('Enter')

  // Fill content
  await editor.fill('# Source Note\n\nLinks to [[Target Note]]')
  // ✅ Search for "Target Note" finds note-1
  // ✅ Link created, backlink appears
})
```

---

## Impact Assessment

### Unit Tests: ✅ ALL PASSING (23/23)

Unit tests use API directly with correct titles:

```typescript
const targetId = await browserApi.createNote({
  title: 'Target Note',  // ✅ Title explicitly set
  content: 'Target content',
  folder: 'inbox'
})
```

**Result:** All unit tests pass - proves indexing logic works correctly

### E2E Tests: ⚠️ FAILING (1/8)

| Test | Status | Reason |
|------|--------|--------|
| BBL-01 | ❌ Fail | Title not set |
| BBL-02 | ❌ Fail | Title not set |
| BBL-03 | ❌ Fail | Title not set |
| BBL-04 | ❌ Fail | Title not set |
| BBL-05 | ❌ Fail | Title not set |
| **BBL-06** | **✅ Pass** | **Direct DB insert with correct titles** |
| TAG-01 | ❌ Fail | Title not set |
| TAG-02 | ❌ Fail | Title not set |

### Production Code: ✅ NO BUGS

- Indexing functions work correctly
- Editor integration works correctly
- Wiki link extraction works correctly
- Database queries work correctly

**This is a TEST BUG, not a PRODUCTION BUG.**

---

## Files Modified (Investigation)

| File | Changes | Purpose |
|------|---------|---------|
| `src/renderer/src/App.tsx` | Added console.log | Debug handleContentChange |
| `src/renderer/src/lib/browser-api.ts` | Added console.log + DB dump | Debug updateNoteLinks/getBacklinks |
| `e2e/browser-backlinks.spec.ts` | Added console listener | Capture browser logs in test |

**These debug logs should be removed after fix is verified.**

---

## Next Steps

1. ✅ **Root cause identified** - Title field mismatch
2. ⏳ **Apply fix to all 7 failing tests** - Add title setting steps
3. ⏳ **Run full E2E suite** - Verify all 8 tests pass
4. ⏳ **Remove debug logging** - Clean up console.log statements
5. ⏳ **Update SPRINT-30-PHASE-1-SUMMARY.md** - Document final status
6. ⏳ **Commit fix** - "fix(e2e): Set note titles explicitly in wiki link backlinks tests"

---

## Lessons Learned

### For Future E2E Tests

**Always set note titles explicitly when testing wiki links:**

```typescript
// PATTERN: Create note with specific title
await page.click('button:has-text("New Page")')

// Set title (required for wiki link resolution)
await page.click('text=New Note')
const titleInput = page.locator('input').filter({ hasText: /./ }).first()
await titleInput.fill('Desired Title')
await titleInput.press('Enter')

// Then fill content
const editor = page.locator('.cm-content, ...').first()
await editor.fill('Content with [[Wiki Links]]')
```

### Why This Bug Was Subtle

1. **Unit tests passed** - They use API correctly
2. **BBL-06 passed** - It uses DB directly
3. **Production works** - Users click title and change it
4. **No obvious error** - Indexing runs, just finds nothing

Only **detailed console logging** revealed the title mismatch.

---

## Related Documents

- `SPRINT-30-PHASE-1-SUMMARY.md` - Overall phase 1 progress
- `e2e/browser-backlinks.spec.ts` - E2E test file
- `src/renderer/src/__tests__/browser-api-backlinks.test.ts` - Unit tests (all passing)

---

**Conclusion:** Production code works perfectly. E2E tests need to properly set note titles before testing wiki link functionality.
