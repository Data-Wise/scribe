# Manual Testing Guide - v1.14.1-alpha

> **Test Sprint 34 improvements (Phases 1-3) in Quarto demo project**

**Version:** v1.14.1-alpha
**Date:** 2026-01-09
**Tester:** _____________________
**Environment:** Browser / Tauri (circle one)

---

## Prerequisites

### Setup Instructions

1. **Start the app:**
   ```bash
   cd /Users/dt/.git-worktrees/scribe/quarto-v115

   # Browser mode (recommended for PWA testing)
   npm run dev:vite
   # Opens at http://localhost:5173

   # OR Tauri mode (full features)
   npm run dev
   ```

2. **Create/Open Quarto Demo Project:**
   - Click "New Project" or use ⌘⇧P
   - Select "R Package" or "Quarto Manuscript" type
   - Name it "Quarto Testing v1.14.1"
   - Create 20-30 demo notes with Quarto content

3. **Sample Quarto Content:**
   ```markdown
   ---
   title: "Test Document"
   format: html
   ---

   ## Introduction

   This is a test with inline math $y = mx + b$ and display math:

   $$
   \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
   $$

   ```{r}
   #| label: fig-plot
   #| fig-cap: "Test Plot"
   plot(1:10)
   ```

   ## Cross-references

   See @fig-plot for the visualization.

   [[Another Note]] links to other content.
   ```

---

## Phase 1: Critical Fixes Testing

### Test 1.1: Error Boundary (Crash Prevention)

**Objective:** Verify app doesn't crash completely when component errors occur

**Steps:**
1. Open developer console (⌘⌥I)
2. Try to trigger an error (e.g., corrupt a note's data manually)
3. Or wait for any unexpected errors during testing

**Expected Results:**
- ✅ Error boundary shows fallback UI (not white screen)
- ✅ Error message is displayed with details
- ✅ "Reset" button is available
- ✅ "Go Home" button returns to safe state
- ✅ Copy button allows copying error details

**Pass/Fail:** ☐ Pass  ☐ Fail  ☐ N/A

**Notes:**
```
_____________________________________________________________
_____________________________________________________________
```

---

### Test 1.2: Logger Utility (No Console Spam)

**Objective:** Verify logging is environment-aware

**Steps:**
1. Open browser console (⌘⌥I)
2. Perform various actions:
   - Create a note
   - Edit content
   - Switch between notes
   - Use wiki-link autocomplete
   - Use Quarto autocomplete
3. Check console output

**Expected Results (Development Mode):**
- ✅ Console shows structured logs with timestamps
- ✅ Format: `[HH:MM:SS] [LEVEL] Message`
- ✅ Color-coded: debug (gray), info (blue), warn (orange), error (red)
- ✅ No plain `console.log()` statements
- ✅ Log messages are informative and structured

**Example Log:**
```
[10:15:23] [DEBUG] [HybridEditor] Wiki-link trigger detected: "test"
[10:15:24] [INFO] [Scribe] Note created successfully
```

**Pass/Fail:** ☐ Pass  ☐ Fail

**Notes:**
```
_____________________________________________________________
_____________________________________________________________
```

---

### Test 1.3: ESLint Configuration

**Objective:** Verify code quality checks are enabled

**Steps:**
1. Run linter:
   ```bash
   npm run lint
   ```
2. Check output for any warnings/errors

**Expected Results:**
- ✅ Linter runs without critical errors
- ✅ Reports any code quality issues
- ✅ `react-hooks/exhaustive-deps` warnings if any

**Pass/Fail:** ☐ Pass  ☐ Fail

**Lint Output:**
```
_____________________________________________________________
_____________________________________________________________
```

---

## Phase 2: Performance Testing

### Test 2.1: IndexedDB Query Performance (Browser Mode Only)

**Objective:** Verify compound index improves folder queries

**Prerequisites:** Test in browser mode with 50+ notes

**Steps:**
1. Create 50+ notes in various folders (Inbox, Projects, Resources)
2. Open browser DevTools → Application → IndexedDB → scribe-db
3. Check "notes" object store has compound index `[folder+deleted_at]`
4. Switch between folders rapidly in sidebar
5. Monitor query performance in Network/Performance tab

**Expected Results:**
- ✅ Compound index `[folder+deleted_at]` exists
- ✅ Folder switching is instant (<100ms)
- ✅ No lag when filtering 100+ notes by folder
- ✅ Console shows no performance warnings

**Performance Observations:**
```
Folder switch time: _____ ms
Notes filtered: _____ notes
Lag noticed: ☐ Yes  ☐ No
```

**Pass/Fail:** ☐ Pass  ☐ Fail  ☐ N/A (Tauri mode)

---

### Test 2.2: Editor Memoization (Typing Performance)

**Objective:** Verify editor doesn't recreate extensions on every keystroke

**Steps:**
1. Open a Quarto note with complex content (math, code, wiki-links)
2. Type continuously for 30 seconds
3. Switch editor modes (Source → Live → Reading) repeatedly
4. Observe typing responsiveness

**Expected Results:**
- ✅ Typing is smooth with no lag
- ✅ No dropped keystrokes
- ✅ Mode switching is instant
- ✅ Math rendering doesn't block typing
- ✅ Autocomplete appears quickly (<100ms)

**Typing Experience:**
```
Lag during typing: ☐ Yes  ☐ No
Dropped keystrokes: ☐ Yes  ☐ No
Mode switch delay: _____ ms
Overall smoothness: ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor
```

**Pass/Fail:** ☐ Pass  ☐ Fail

---

### Test 2.3: State Updates with Immer

**Objective:** Verify state updates are clean and don't cause re-render issues

**Steps:**
1. Open React DevTools Profiler
2. Perform state-heavy operations:
   - Create 5 notes rapidly
   - Update note titles repeatedly
   - Delete and restore notes
   - Add/remove tags
3. Check profiler for unnecessary re-renders

**Expected Results:**
- ✅ No console warnings about immutability
- ✅ Components only re-render when data changes
- ✅ No "Cannot update while rendering" warnings
- ✅ State updates are atomic

**Pass/Fail:** ☐ Pass  ☐ Fail

**DevTools Observations:**
```
_____________________________________________________________
_____________________________________________________________
```

---

## Phase 3: UX Polish Testing

### Test 3.1: Skeleton Loaders

**Objective:** Verify loading states show skeletons instead of spinners

**Steps:**
1. Clear browser cache (⌘⇧R or hard reload)
2. Reload the app
3. Observe loading states for:
   - Note list
   - Search results
   - Projects list
   - Backlinks panel
   - Tags panel

**Expected Results:**
- ✅ Skeleton loaders appear during loading (not blank/spinner)
- ✅ Skeletons match the shape of actual content
- ✅ Pulse or wave animation is smooth
- ✅ Transition to real content is seamless
- ✅ Loading feels faster (perceived performance)

**Skeleton Variants Observed:**
- ☐ SkeletonNote (note list items)
- ☐ SkeletonProject (project cards)
- ☐ SkeletonSearchResult (search results)
- ☐ SkeletonBacklink (backlinks)
- ☐ SkeletonTag (tags)

**Pass/Fail:** ☐ Pass  ☐ Fail

**Screenshots/Notes:**
```
_____________________________________________________________
_____________________________________________________________
```

---

### Test 3.2: Virtual Scrolling (Large Note Sets)

**Objective:** Verify smooth scrolling with 500+ notes

**Prerequisites:** Create 100+ notes (or use seed data multiple times)

**Steps:**
1. Search for common term (e.g., "test") that matches 50+ notes
2. Observe search results panel
3. Scroll rapidly through results
4. Select notes at different positions (top, middle, bottom)
5. Open DevTools → Elements and inspect rendered items

**Expected Results:**
- ✅ Scrolling is smooth (60 fps)
- ✅ Only ~15-20 items rendered in DOM at once
- ✅ Auto-scroll to selected note works
- ✅ No lag with 100+ search results
- ✅ Results count shown correctly

**Performance Metrics:**
```
Total search results: _____ notes
DOM items rendered: _____ items (should be ~15-20)
Scrolling FPS: ☐ Smooth  ☐ Laggy
Auto-scroll works: ☐ Yes  ☐ No
```

**Pass/Fail:** ☐ Pass  ☐ Fail

---

### Test 3.3: Undo/Redo History

**Objective:** Verify undo/redo works with keyboard shortcuts

**Steps:**
1. Open a new or existing note
2. Type some content, wait 2 seconds (debounce)
3. Make several edits with pauses:
   - Add a heading: `## Test`
   - Add inline math: `$x^2$`
   - Add a wiki-link: `[[Another Note]]`
   - Add a code chunk: ` ```{r} `
4. Test undo/redo:
   - Press ⌘Z (undo) multiple times
   - Press ⌘⇧Z (redo) multiple times
5. Switch to another note and back
6. Verify history is cleared for new note

**Expected Results:**
- ✅ ⌘Z undoes last change (after 1 second debounce)
- ✅ ⌘⇧Z redoes last undo
- ✅ Undo stack works for multiple changes
- ✅ History cleared when switching notes
- ✅ Maximum 100 entries (no memory leak)
- ✅ Cursor position restored (optional)

**Undo/Redo Test Results:**
```
Undo (⌘Z) works: ☐ Yes  ☐ No
Redo (⌘⇧Z) works: ☐ Yes  ☐ No
Multiple undo/redo: ☐ Yes  ☐ No
History cleared on switch: ☐ Yes  ☐ No
Debounce delay observed: ☐ Yes  ☐ No
```

**Pass/Fail:** ☐ Pass  ☐ Fail

---

### Test 3.4: PWA Support (Browser Mode Only)

**Objective:** Verify app works offline and is installable

**Prerequisites:** Build production version
```bash
npm run build:vite
cd dist
npx serve
# Visit http://localhost:3000
```

**Steps:**
1. Open app in browser (Chrome recommended)
2. Check DevTools → Application → Service Workers
3. Verify service worker registered
4. Check Application → Manifest
5. Test installation:
   - Look for install icon in address bar
   - Click "Install App"
6. Test offline mode:
   - Open DevTools → Network → Enable "Offline"
   - Reload the page
   - Try creating/editing notes

**Expected Results:**
- ✅ Service worker registers successfully
- ✅ Status: "Activated and running"
- ✅ Precache: 165 entries (~4.1 MB)
- ✅ Manifest.json loads correctly
- ✅ Install button appears in browser
- ✅ App installs as standalone
- ✅ Works offline (with IndexedDB)
- ✅ Google Fonts cached

**PWA Checklist:**
```
Service Worker:
- ☐ sw.js loads (9.5 KB)
- ☐ workbox-*.js loads
- ☐ Status: Activated

Manifest:
- ☐ Name: "Scribe - ADHD-Friendly Writer"
- ☐ Icons: 192x192, 512x512
- ☐ Display: standalone
- ☐ Theme color: #0f172a

Installation:
- ☐ Install prompt appears
- ☐ App installs successfully
- ☐ Launches in standalone window

Offline:
- ☐ App loads offline
- ☐ Notes load from IndexedDB
- ☐ Can create/edit notes offline
- ☐ Static assets cached
```

**Pass/Fail:** ☐ Pass  ☐ Fail  ☐ N/A (Tauri mode)

**Screenshots:**
```
Service Worker status: _________________________________
Offline functionality: _________________________________
```

---

## Quarto-Specific Features Testing

### Test 4.1: Quarto YAML Autocomplete

**Objective:** Verify v1.15 autocomplete works correctly

**Steps:**
1. Create new note
2. Type `---` and press Enter (start YAML frontmatter)
3. Type partial keys:
   - `tit` → should suggest `title:`
   - `for` → should suggest `format:`
   - `aut` → should suggest `author:`
4. For nested values, type:
   - `format: ` → should suggest `html`, `pdf`, `docx`
   - `html: ` → should suggest nested options
5. Test all 40+ YAML keys from Quarto v1.15

**Expected Results:**
- ✅ Autocomplete popup appears on partial match
- ✅ Suggestions are context-aware
- ✅ Nested values autocomplete correctly
- ✅ Tab/Enter accepts suggestion
- ✅ ESC dismisses suggestions

**Pass/Fail:** ☐ Pass  ☐ Fail

**Keys Tested:**
```
☐ title, author, date
☐ format (html, pdf, docx)
☐ execute (echo, warning, message)
☐ bibliography, csl
☐ Other: _____________________________________________
```

---

### Test 4.2: Chunk Options Autocomplete

**Objective:** Verify code chunk autocomplete works

**Steps:**
1. Create code chunk: ` ```{r} ` (note space before backticks)
2. On next line, type `#|` (chunk option prefix)
3. Type partial options:
   - `#| lab` → should suggest `label:`
   - `#| fig-` → should suggest `fig-cap:`, `fig-width:`, etc.
   - `#| echo:` → should suggest `true`, `false`
4. Test all 30+ chunk options

**Expected Results:**
- ✅ Chunk option autocomplete triggered by `#|`
- ✅ 30+ chunk options available
- ✅ Value completion for boolean/enum options
- ✅ Works for R, Python, Julia code chunks

**Pass/Fail:** ☐ Pass  ☐ Fail

**Chunk Options Tested:**
```
☐ label, echo, warning, message
☐ fig-cap, fig-width, fig-height
☐ eval, include, output
☐ Other: _____________________________________________
```

---

### Test 4.3: Cross-Reference Autocomplete

**Objective:** Verify cross-reference autocomplete works

**Steps:**
1. Create figure/table/equation with label:
   ```markdown
   ![Caption](image.png){#fig-plot}

   | A | B |
   |---|---|
   | 1 | 2 |
   : Table caption {#tbl-data}

   $$
   y = mx + b
   $$ {#eq-line}
   ```
2. Type `@` in text
3. Try to reference: `@fig-`, `@tbl-`, `@eq-`

**Expected Results:**
- ✅ `@` triggers cross-reference autocomplete
- ✅ Shows all defined labels
- ✅ Grouped by type (fig-, tbl-, eq-, sec-)
- ✅ Inserts correct reference syntax

**Pass/Fail:** ☐ Pass  ☐ Fail

---

### Test 4.4: Live Preview Mode

**Objective:** Verify Live Preview shows/hides syntax

**Steps:**
1. Create note with mixed content:
   - Headings, bold, italic, lists
   - Inline math: `$x^2$`
   - Display math: `$$ y = mx + b $$`
   - Code: `` `code` ``
   - Wiki-links: `[[Note]]`
2. Switch between modes (⌘1/⌘2/⌘3):
   - Source mode (⌘1)
   - Live Preview mode (⌘2)
   - Reading mode (⌘3)

**Expected Results:**
- ✅ **Source mode:** Shows all raw syntax
- ✅ **Live mode:** Hides syntax when not editing
- ✅ **Reading mode:** Full rendered preview
- ✅ Math renders with KaTeX
- ✅ Wiki-links are clickable (Live/Reading)
- ✅ Mode shortcuts work (⌘1, ⌘2, ⌘3)

**Pass/Fail:** ☐ Pass  ☐ Fail

---

## Integration Testing

### Test 5.1: End-to-End Workflow

**Objective:** Test complete Quarto workflow

**Scenario:** Create a small Quarto manuscript

**Steps:**
1. Create new project: "Test Manuscript"
2. Create 5 notes:
   - `index.qmd` (main document)
   - `introduction.qmd`
   - `methods.qmd`
   - `results.qmd`
   - `references.bib`
3. Add content with:
   - YAML frontmatter (title, author, format)
   - Cross-references between sections
   - Math equations
   - Code chunks
   - Citations (if available)
4. Use features:
   - Undo/redo while editing
   - Search across notes
   - Wiki-link between documents
   - Switch editor modes
5. Check performance with 50+ notes in project

**Expected Results:**
- ✅ All autocomplete features work together
- ✅ No lag with multiple open notes
- ✅ Undo/redo works across edits
- ✅ Search is fast and accurate
- ✅ Editor modes switch smoothly
- ✅ No console errors

**Pass/Fail:** ☐ Pass  ☐ Fail

**Workflow Notes:**
```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

## Regression Testing

### Test 6.1: Existing Features Still Work

**Quick checks to ensure nothing broke:**

- ☐ Focus mode (⌘⇧F) works
- ☐ Daily notes (⌘D) work
- ☐ Command palette (⌘K) works
- ☐ Search (⌘F) works
- ☐ Tag management works
- ☐ Backlinks panel updates
- ☐ Projects panel works
- ☐ Settings modal opens
- ☐ Export dialog works
- ☐ Theme switching works

**Pass/Fail:** ☐ Pass  ☐ Fail

**Issues Found:**
```
_____________________________________________________________
_____________________________________________________________
```

---

## Performance Benchmarks

### Baseline Measurements

Record these metrics for comparison:

**Startup Time:**
```
Cold start (first launch): _____ seconds
Hot start (subsequent): _____ seconds
```

**Note Operations:**
```
Create note: _____ ms
Load note: _____ ms
Save note (auto-save): _____ ms
Search 100+ notes: _____ ms
```

**Editor Performance:**
```
Typing latency: ☐ <50ms  ☐ <100ms  ☐ <200ms  ☐ >200ms
Math rendering: _____ ms
Mode switch: _____ ms
Autocomplete popup: _____ ms
```

**Memory Usage (DevTools → Memory):**
```
Initial heap size: _____ MB
After 30 min use: _____ MB
Memory leaks detected: ☐ Yes  ☐ No
```

---

## Bug Report Template

If you find issues, use this template:

### Bug #___

**Title:** _______________________________________________________

**Severity:** ☐ Critical  ☐ High  ☐ Medium  ☐ Low

**Environment:**
- OS: macOS / Windows / Linux
- Mode: Browser / Tauri
- Browser: Chrome / Safari / Firefox (if browser mode)

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**


**Actual Result:**


**Screenshots/Console Output:**
```

```

**Related to Phase:** ☐ Phase 1  ☐ Phase 2  ☐ Phase 3  ☐ Other

---

## Test Summary

**Test Date:** _____________________
**Tester:** _____________________
**Version Tested:** v1.14.1-alpha
**Environment:** ☐ Browser  ☐ Tauri
**Total Time:** _____ minutes

### Results Overview

| Category | Tests | Passed | Failed | N/A |
|----------|-------|--------|--------|-----|
| Phase 1: Critical Fixes | 3 | ___ | ___ | ___ |
| Phase 2: Performance | 3 | ___ | ___ | ___ |
| Phase 3: UX Polish | 4 | ___ | ___ | ___ |
| Quarto Features | 4 | ___ | ___ | ___ |
| Integration | 1 | ___ | ___ | ___ |
| Regression | 1 | ___ | ___ | ___ |
| **TOTAL** | **16** | ___ | ___ | ___ |

**Overall Pass Rate:** _____ %

### Critical Issues Found

☐ No critical issues
☐ Critical issues (list below):

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

### Recommendation

☐ **Ready for beta** - No critical issues, minor bugs acceptable
☐ **Needs fixes** - Address critical issues before beta
☐ **Major issues** - Requires significant rework

### Tester Notes

```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

## Appendix: Quick Test Scripts

### Generate Test Data (Browser Console)

```javascript
// Create 50 test notes
for (let i = 1; i <= 50; i++) {
  const note = {
    title: `Test Note ${i}`,
    folder: ['inbox', 'projects', 'resources'][i % 3],
    content: `# Test Note ${i}

This is test content for note ${i}.

## Math
$y = mx + b$

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Code
\`\`\`{r}
#| label: fig-plot-${i}
plot(1:10)
\`\`\`

[[Another Note]] links here.
`
  };
  // Use API to create note
  window.api.createNote(note);
}
```

### Check Service Worker (Browser Console)

```javascript
// Check if service worker is active
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
  regs.forEach(reg => {
    console.log('State:', reg.active?.state);
    console.log('Scope:', reg.scope);
  });
});
```

### Monitor Performance (Browser Console)

```javascript
// Monitor render performance
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });
```

---

**End of Testing Guide**

Questions? Issues? Report at: https://github.com/Data-Wise/scribe/issues
