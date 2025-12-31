# Visual Testing Guide - Viewport Optimization

**Purpose:** Verify the viewport optimization delivers smooth, responsive editing

**Estimated Time:** 5-10 minutes

---

## Setup

1. **Start browser mode:**
   ```bash
   cd ~/.git-worktrees/scribe/live-editor-enhancements
   npm run dev:vite
   ```

2. **Open browser:** http://localhost:5173

3. **Create test note:**
   - Press `⌘N` to create new note
   - Title: "Performance Test - Large Document"

---

## Test 1: Large Document Performance

### Create Large Content

Copy this content and paste it 50+ times (creates ~1000 lines):

```markdown
# Header Level 1

This is **bold text** and this is *italic text* and this is `inline code`.

## Header Level 2

More content here with [[wiki links]] and more **formatting**.

### Header Level 3

> [!note]
> This is a callout block with some content.

- [ ] Unchecked task
- [x] Completed task

Some regular paragraph text with multiple lines to create
a document that is long enough to test viewport performance.

The viewport optimization should only process ~100-200 visible
nodes instead of processing all 5000-20000 nodes in the document.
```

### Switch to Live Preview

1. **Switch mode:** Press `⌘2`
2. **Observe transition:** Should be SMOOTH (no jank, no delay)

### Test Typing Responsiveness

1. **Position cursor:** Click anywhere in the middle of the document
2. **Type rapidly:** `asdfasdfasdfasdfasdf` (mash keyboard)
3. **Observe latency:** Text should appear INSTANTLY (< 16ms = imperceptible)

**✅ PASS:** Typing feels instant, no lag
**❌ FAIL:** Noticeable delay between keypress and character appearing

### Test Cursor Movement

1. **Move cursor:** Use arrow keys to move up/down rapidly
2. **Observe syntax reveal:** Should reveal/hide INSTANTLY
3. **No stuttering:** Cursor movement should be smooth

**✅ PASS:** Syntax reveals instantly, no stutter
**❌ FAIL:** Syntax reveal is delayed or stutters

### Test Scrolling Performance

1. **Scroll rapidly:** Use trackpad/mouse wheel to scroll fast through document
2. **Observe smoothness:** Should be 60 FPS (buttery smooth, no jank)
3. **Check decorations:** Syntax hiding should work throughout scroll

**✅ PASS:** Scrolling is smooth, decorations render correctly
**❌ FAIL:** Stuttering, jank, or visual glitches during scroll

---

## Test 2: Cursor-Aware Syntax Reveal

### Test Headers

1. **Find header:** Navigate to a line with `# Header`
2. **Cursor ON line:** Should show `# Header` (raw syntax)
3. **Cursor OFF line:** Should show `Header` (# hidden)

**✅ PASS:** Syntax toggles correctly based on cursor position
**❌ FAIL:** Syntax always visible or always hidden

### Test Bold/Italic

1. **Find bold:** Navigate to `**bold text**`
2. **Cursor ON:** Shows `**bold text**`
3. **Cursor OFF:** Shows `bold text` (** hidden)

**✅ PASS:** Markers toggle correctly
**❌ FAIL:** Markers don't hide or always hidden

### Test Wiki Links

1. **Find link:** Navigate to `[[wiki link]]`
2. **Cursor ON:** Shows `[[wiki link]]`
3. **Cursor OFF:** Shows `[wiki link]` (one bracket hidden on each side)

**✅ PASS:** Link brackets toggle correctly
**❌ FAIL:** Brackets don't hide or link doesn't work

---

## Test 3: Mode Switching Smoothness

### Source → Live → Source

1. **Start in Source:** Press `⌘1`
2. **Switch to Live:** Press `⌘2` (observe transition)
3. **Click to edit:** Click anywhere in content
4. **Switch back:** Press `⌘1`

**✅ PASS:** All transitions smooth, no jank, < 100ms delay
**❌ FAIL:** Jerky transitions, visible lag, UI freeze

### Live → Preview → Live

1. **Start in Live:** Press `⌘2`
2. **Switch to Preview:** Press `⌘3`
3. **Switch back:** Press `⌘2`

**✅ PASS:** Transitions smooth
**❌ FAIL:** Stuttering or delays

---

## Performance Metrics to Observe

### Chrome DevTools (Optional)

1. **Open DevTools:** `⌘⌥I`
2. **Performance Tab:** Start recording
3. **Type in editor:** Type rapidly for 5 seconds
4. **Stop recording:** Analyze results

**Expected Metrics:**
- **Frame Rate:** 60 FPS (no drops below 55 FPS)
- **Main Thread:** No long tasks > 50ms
- **Typing Latency:** < 16ms from keypress to paint

### Console Errors

1. **Open Console:** `⌘⌥J`
2. **Clear console:** Click clear button
3. **Interact with editor:** Type, scroll, move cursor
4. **Check for errors:** Should be ZERO errors

**✅ PASS:** No console errors
**❌ FAIL:** Any errors related to CodeMirror, decorations, or React

---

## Success Criteria

### Must Pass (Critical)

- [ ] Typing latency < 16ms (feels instant)
- [ ] Scrolling at 60 FPS (smooth, no jank)
- [ ] Mode transitions smooth (< 100ms)
- [ ] Zero console errors

### Should Pass (Important)

- [ ] Cursor-aware syntax reveal works correctly
- [ ] All markdown elements render properly
- [ ] Large documents (1000+ lines) perform well
- [ ] Viewport decorations update on scroll

### Nice to Have (Optional)

- [ ] DevTools shows 60 FPS consistently
- [ ] No main thread tasks > 50ms
- [ ] Memory usage stable (no leaks)

---

## Expected Results

**Before Viewport Optimization:**
- Typing latency: 50-200ms (noticeable delay)
- Scrolling: 15-30 FPS (stuttering, jank)
- Mode transitions: Jerky, UI freeze
- Console: 2000+ errors (infinite loop)

**After Viewport Optimization:**
- Typing latency: < 16ms (instant)
- Scrolling: 60 FPS (buttery smooth)
- Mode transitions: Smooth, responsive
- Console: Zero errors

**Performance Improvement:**
- **40x reduction** in nodes processed (5000-20000 → 100-200)
- **3-12x faster** typing response
- **2-4x smoother** scrolling

---

## Reporting Results

### If ALL Tests Pass ✅

**Action:** Close investigation, prepare PR to dev branch

**Message:**
```
Viewport optimization successful! All performance targets met:
✅ Typing latency < 16ms (instant)
✅ Scrolling at 60 FPS (smooth)
✅ Mode transitions smooth
✅ Zero console errors
✅ Cursor-aware syntax reveal works perfectly

Ready to merge feat/live-editor-enhancements → dev
```

### If ANY Test Fails ❌

**Action:** Document specific failure, re-evaluate approach

**Report:**
1. Which test failed?
2. What was observed vs expected?
3. Any console errors?
4. DevTools performance metrics?

**Next Steps:**
- Minor issue: Tweak buffer zone or optimization parameters
- Major issue: Consider Milkdown migration (fallback plan)

---

## Quick Test (1 minute)

**Minimal validation if short on time:**

1. Start dev server: `npm run dev:vite`
2. Create note with 500+ lines (paste demo content 25 times)
3. Switch to Live Preview (⌘2)
4. Type rapidly: Does it feel instant? ✅/❌
5. Scroll fast: Is it smooth? ✅/❌
6. Check console: Zero errors? ✅/❌

If all three pass ✅, detailed testing optional. If any fail ❌, run full test suite above.

---

**Testing Date:** _____________

**Tester:** DT

**Result:** ✅ PASS / ❌ FAIL

**Notes:**

---
