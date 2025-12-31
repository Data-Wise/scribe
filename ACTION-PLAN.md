# Performance Optimization - Action Plan

**Date:** 2025-12-31
**Goal:** Achieve < 16ms typing latency on 20k line markdown documents
**Approach:** Viewport-aware decorations in CodeMirror 6
**Estimated Time:** 1-2 days

---

## Quick Start (5 minutes)

### Read This First
1. **EDITOR-PERFORMANCE-SUMMARY.md** - TL;DR of entire analysis
2. **VIEWPORT-OPTIMIZATION-GUIDE.md** - Step-by-step implementation

### For Deep Dive
3. **PERFORMANCE-ANALYSIS-EDITORS.md** - Comprehensive editor comparison
4. **PERFORMANCE-METRICS-VISUAL.md** - Visual charts and metrics

---

## Implementation Checklist

### Phase 1: Code Changes (4-6 hours)

**File to modify:** `/Users/dt/.git-worktrees/scribe/live-editor-enhancements/src/renderer/src/lib/codeMirrorMarkdownExtension.ts`

- [ ] **Step 1:** Add viewport calculation to `buildDecorations()`
  ```typescript
  const viewport = view.viewport
  const BUFFER_LINES = 50
  const viewportStartLine = doc.lineAt(viewport.from).number
  const viewportEndLine = doc.lineAt(viewport.to).number
  const startLine = Math.max(1, viewportStartLine - BUFFER_LINES)
  const endLine = Math.min(doc.lines, viewportEndLine + BUFFER_LINES)
  const fromPos = doc.line(startLine).from
  const toPos = doc.line(endLine).to
  ```

- [ ] **Step 2:** Update `syntaxTree().iterate()` call
  ```typescript
  syntaxTree(view.state).iterate({
    from: fromPos,  // ← ADD THIS
    to: toPos,      // ← ADD THIS
    enter: (node) => {
      // ... existing logic
    }
  })
  ```

- [ ] **Step 3:** Add viewport change tracking to ViewPlugin
  ```typescript
  class {
    lastViewportFrom: number
    lastViewportTo: number

    constructor(view: EditorView) {
      // ... existing code
      this.lastViewportFrom = view.viewport.from
      this.lastViewportTo = view.viewport.to
    }

    update(update: ViewUpdate) {
      const viewportChanged =
        update.view.viewport.from !== this.lastViewportFrom ||
        update.view.viewport.to !== this.lastViewportTo

      if (update.docChanged || cursorLineChanged || viewportChanged) {
        this.lastViewportFrom = update.view.viewport.from
        this.lastViewportTo = update.view.viewport.to
        this.decorations = buildDecorations(update.view)
      }
    }
  }
  ```

- [ ] **Step 4 (Optional):** Add debug logging
  ```typescript
  if (import.meta.env.DEV) {
    console.debug(`Processing ${endLine - startLine}/${doc.lines} lines`)
  }
  ```

### Phase 2: Testing (2-4 hours)

- [ ] **Manual Testing**
  - [ ] Create 20k line test document (see VIEWPORT-OPTIMIZATION-GUIDE.md)
  - [ ] Test typing smoothness
  - [ ] Test cursor movement
  - [ ] Test scrolling performance
  - [ ] Verify no visual glitches

- [ ] **Functional Verification**
  - [ ] Bold text renders correctly (no `**`)
  - [ ] Italic text renders correctly (no `*` or `_`)
  - [ ] Headers render correctly (no `#`)
  - [ ] Wiki links render correctly (single brackets)
  - [ ] Inline code renders correctly (no backticks)
  - [ ] Cursor-aware syntax reveal still works

- [ ] **Performance Measurement**
  - [ ] Open Chrome DevTools Performance panel
  - [ ] Record typing session on 20k line doc
  - [ ] Verify decoration rebuild < 20ms
  - [ ] Verify no frame drops during scrolling

- [ ] **Edge Cases**
  - [ ] Works at top of document (line 1)
  - [ ] Works at bottom of document
  - [ ] Works with Cmd+Home / Cmd+End jumps
  - [ ] Works with Cmd+F search jumps
  - [ ] Works with rapid scrolling

### Phase 3: Documentation (30 minutes)

- [ ] Update PLAN-LIVE-EDITOR.md with optimization notes
- [ ] Add performance section to CHANGELOG.md
- [ ] Consider updating PROJECT-DEFINITION.md performance targets

---

## Success Criteria

**PASS if:**
- ✅ Typing latency < 16ms on 20k line document
- ✅ Scrolling is 60fps smooth
- ✅ Cursor movement is instant
- ✅ All existing features still work
- ✅ No console errors or warnings

**FAIL if:**
- ❌ Typing latency > 50ms
- ❌ Visual glitches or missing decorations
- ❌ Console errors or infinite loops
- ❌ Cursor-aware reveal broken

---

## Quick Reference

### Files Created (Read in Order)

1. **EDITOR-PERFORMANCE-SUMMARY.md** - Quick overview (5 min read)
2. **VIEWPORT-OPTIMIZATION-GUIDE.md** - Implementation guide (15 min read)
3. **PERFORMANCE-ANALYSIS-EDITORS.md** - Full analysis (30 min read)
4. **PERFORMANCE-METRICS-VISUAL.md** - Visual charts (10 min read)

### File to Modify

`/Users/dt/.git-worktrees/scribe/live-editor-enhancements/src/renderer/src/lib/codeMirrorMarkdownExtension.ts`

### Key Functions

- `buildDecorations(view: EditorView): DecorationSet` - Add viewport filtering here
- `ViewPlugin.update(update: ViewUpdate)` - Add viewport change tracking here

### Expected Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **Typing latency** | 100-500ms | 5-15ms | < 16ms ✅ |
| **Nodes processed** | 20,000 | 100-200 | N/A |
| **Scrolling FPS** | 20-30fps | 60fps | 60fps ✅ |

---

## Troubleshooting

### Problem: Decorations flicker during scroll
**Solution:** Increase `BUFFER_LINES` from 50 to 100

### Problem: Still slow after optimization
**Solution:**
1. Verify viewport filtering is active (check debug logs)
2. Profile with Chrome DevTools to find new bottleneck
3. Consider incremental decoration caching (advanced)

### Problem: Decorations missing near viewport edges
**Solution:** Check boundary calculations:
```typescript
const startLine = Math.max(1, viewportStartLine - BUFFER_LINES)
const endLine = Math.min(doc.lines, viewportEndLine + BUFFER_LINES)
```

### Problem: Console errors about invalid positions
**Solution:** Ensure `fromPos` and `toPos` are valid:
```typescript
console.log('From:', fromPos, 'To:', toPos, 'Doc length:', doc.length)
```

---

## Rollback Plan

### If optimization fails:

1. **Git rollback:**
   ```bash
   cd /Users/dt/.git-worktrees/scribe/live-editor-enhancements
   git checkout src/renderer/src/lib/codeMirrorMarkdownExtension.ts
   ```

2. **Restore from backup (if created):**
   ```bash
   cp src/renderer/src/lib/codeMirrorMarkdownExtension.ts.backup \
      src/renderer/src/lib/codeMirrorMarkdownExtension.ts
   ```

3. **Re-evaluate approach:**
   - Read PERFORMANCE-ANALYSIS-EDITORS.md section on ProseMirror
   - Consider migration if viewport optimization fundamentally flawed
   - Open issue with CodeMirror community for advice

---

## Timeline

### Day 1 (4-6 hours)
- 09:00 - 09:30: Read EDITOR-PERFORMANCE-SUMMARY.md and VIEWPORT-OPTIMIZATION-GUIDE.md
- 09:30 - 10:30: Implement viewport filtering in `buildDecorations()`
- 10:30 - 11:30: Add viewport change tracking to ViewPlugin
- 11:30 - 12:00: Add debug logging and test compilation
- 12:00 - 13:00: Break
- 13:00 - 14:00: Create 20k line test document
- 14:00 - 15:00: Manual testing (typing, scrolling, cursor movement)
- 15:00 - 16:00: Functional verification (all features still work)

### Day 2 (2-4 hours)
- 09:00 - 10:00: Performance measurement with Chrome DevTools
- 10:00 - 11:00: Edge case testing
- 11:00 - 11:30: Fix any issues found
- 11:30 - 12:00: Documentation updates
- 12:00 - 12:30: Final verification
- **Done!** 🎉

---

## Next Steps After Success

### Immediate
1. Remove debug logging (or wrap in `DEV` flag)
2. Update CHANGELOG.md with performance improvement
3. Consider adding performance regression tests

### Short-term
1. Add Playwright E2E performance tests
2. Set up performance monitoring (Lighthouse CI)
3. Document optimization in Scribe's performance best practices

### Long-term
1. Consider incremental decoration caching (if needed)
2. Evaluate web worker for syntax parsing (if needed)
3. Share optimization learnings with community

---

## Alternative Path (If Viewport Optimization Fails)

**Only if optimization doesn't meet targets (<5% chance):**

### Plan B: ProseMirror Migration

**Timeline:** 3-5 days
**Read:** PERFORMANCE-ANALYSIS-EDITORS.md - ProseMirror section
**Pros:** Proven at scale, native contentEditable typing feel
**Cons:** Major refactor, 3-5 days lost to rewriting

### Plan C: Milkdown Migration

**Timeline:** 4-7 days
**Read:** PERFORMANCE-ANALYSIS-EDITORS.md - Milkdown section
**Pros:** ProseMirror wrapper with better DX, markdown-first
**Cons:** Larger bundle, extra abstraction layer

**Do NOT consider:** Quill 2.0, TUI Editor (architecture mismatch)

---

## Confidence Assessment

**95% confident viewport optimization will succeed**

**Why:**
- ✅ Math checks out (98% reduction in work)
- ✅ VSCode uses same approach (proven)
- ✅ Simple implementation (low risk)
- ✅ Easy rollback (incremental change)

**5% failure scenarios:**
- Syntax tree iteration not the main bottleneck (unlikely)
- CodeMirror viewport API has bugs (unlikely, mature library)
- Other unknown performance issues (addressable with profiling)

---

## Support

### Documentation
- VIEWPORT-OPTIMIZATION-GUIDE.md - Step-by-step guide
- PERFORMANCE-ANALYSIS-EDITORS.md - Deep dive analysis
- PERFORMANCE-METRICS-VISUAL.md - Visual charts

### External Resources
- [CodeMirror 6 Viewport Docs](https://codemirror.net/docs/ref/#view.EditorView.viewport)
- [CodeMirror 6 Decorations Guide](https://codemirror.net/examples/decoration/)
- [Lezer Syntax Tree API](https://lezer.codemirror.net/docs/ref/#common.Tree.iterate)

### Community
- [CodeMirror Discussion Forum](https://discuss.codemirror.net/)
- [CodeMirror GitHub Issues](https://github.com/codemirror/dev/issues)

---

## Final Recommendation

**Start with viewport optimization NOW**

1. Read EDITOR-PERFORMANCE-SUMMARY.md (5 min)
2. Implement viewport filtering (4-6 hours)
3. Test with 20k line document (2-4 hours)
4. Re-evaluate in 2 days if needed (unlikely)

**Expected result:** 40x performance improvement, buttery smooth typing, mission accomplished! 🚀
