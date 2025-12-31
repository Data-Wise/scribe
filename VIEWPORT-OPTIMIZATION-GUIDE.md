# CodeMirror 6 Viewport Optimization - Implementation Guide

**Date:** 2025-12-31
**Estimated Time:** 1-2 days
**Expected Performance Gain:** 40x improvement for large documents

---

## Problem Statement

Current implementation iterates through the ENTIRE syntax tree on every line change, processing 5000-20000 nodes even when only 30-50 lines are visible on screen.

```typescript
// CURRENT (SLOW): Processes ALL nodes
syntaxTree(view.state).iterate({
  enter: (node) => {
    // Processes 20,000 nodes on a 20k line document
    // Even though only ~50 lines are visible
  }
})
```

---

## Solution: Viewport-Aware Iteration

Only process nodes in the visible viewport + a small buffer.

```typescript
// OPTIMIZED: Processes only visible nodes
const viewport = view.viewport
syntaxTree(view.state).iterate({
  from: viewport.from - bufferSize,
  to: viewport.to + bufferSize,
  enter: (node) => {
    // Processes only ~100-200 nodes (visible + buffer)
    // 98% reduction in work
  }
})
```

---

## Implementation Steps

### Step 1: Update `buildDecorations()` Function

**File:** `/Users/dt/.git-worktrees/scribe/live-editor-enhancements/src/renderer/src/lib/codeMirrorMarkdownExtension.ts`

**Before:**
```typescript
function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const cursorPos = view.state.selection.main.head
  const doc = view.state.doc
  const cursorLine = doc.lineAt(cursorPos)

  // Iterate through ENTIRE syntax tree
  syntaxTree(view.state).iterate({
    enter: (node) => {
      const { from, to, name } = node

      // Don't apply rendering on cursor line
      if (from >= cursorLine.from && to <= cursorLine.to) {
        return
      }

      // ... decoration logic
    }
  })

  return builder.finish()
}
```

**After:**
```typescript
function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const cursorPos = view.state.selection.main.head
  const doc = view.state.doc
  const cursorLine = doc.lineAt(cursorPos)

  // ✅ NEW: Calculate viewport range
  const viewport = view.viewport
  const BUFFER_LINES = 50 // Lines above/below viewport to pre-render

  // Get line numbers for viewport boundaries
  const viewportStartLine = doc.lineAt(viewport.from).number
  const viewportEndLine = doc.lineAt(viewport.to).number

  // Add buffer (but don't go below 1 or above total lines)
  const startLine = Math.max(1, viewportStartLine - BUFFER_LINES)
  const endLine = Math.min(doc.lines, viewportEndLine + BUFFER_LINES)

  // Convert line numbers to positions
  const fromPos = doc.line(startLine).from
  const toPos = doc.line(endLine).to

  // ✅ NEW: Only iterate visible range + buffer
  syntaxTree(view.state).iterate({
    from: fromPos,
    to: toPos,
    enter: (node) => {
      const { from, to, name } = node

      // Don't apply rendering on cursor line
      if (from >= cursorLine.from && to <= cursorLine.to) {
        return
      }

      // ... (existing decoration logic stays the same)

      // Handle bold text: **text** or __text__
      if (name === 'StrongEmphasis') {
        const text = doc.sliceString(from, to)
        if (text.startsWith('**') && text.endsWith('**')) {
          builder.add(from, from + 2, hideSyntax)
          builder.add(from + 2, to - 2, boldDeco)
          builder.add(to - 2, to, hideSyntax)
        } else if (text.startsWith('__') && text.endsWith('__')) {
          builder.add(from, from + 2, hideSyntax)
          builder.add(from + 2, to - 2, boldDeco)
          builder.add(to - 2, to, hideSyntax)
        }
      }

      // ... (rest of decoration logic unchanged)
    }
  })

  return builder.finish()
}
```

---

### Step 2: Update ViewPlugin to Track Viewport Changes

**File:** Same file as above

**Before:**
```typescript
export const markdownLivePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    cursorLine: number
    isInitialized: boolean

    constructor(view: EditorView) {
      this.cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number
      this.decorations = Decoration.none
      this.isInitialized = false

      requestAnimationFrame(() => {
        this.isInitialized = true
        this.decorations = buildDecorations(view)
        view.update([])
      })
    }

    update(update: ViewUpdate) {
      if (!this.isInitialized) return

      const newCursorLine = update.state.doc.lineAt(update.state.selection.main.head).number
      const cursorLineChanged = newCursorLine !== this.cursorLine

      if (update.docChanged || cursorLineChanged) {
        this.cursorLine = newCursorLine
        this.decorations = buildDecorations(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations
  }
)
```

**After:**
```typescript
export const markdownLivePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    cursorLine: number
    isInitialized: boolean
    // ✅ NEW: Track viewport range
    lastViewportFrom: number
    lastViewportTo: number

    constructor(view: EditorView) {
      this.cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number
      this.decorations = Decoration.none
      this.isInitialized = false

      // ✅ NEW: Initialize viewport tracking
      this.lastViewportFrom = view.viewport.from
      this.lastViewportTo = view.viewport.to

      requestAnimationFrame(() => {
        this.isInitialized = true
        this.decorations = buildDecorations(view)
        view.update([])
      })
    }

    update(update: ViewUpdate) {
      if (!this.isInitialized) return

      const newCursorLine = update.state.doc.lineAt(update.state.selection.main.head).number
      const cursorLineChanged = newCursorLine !== this.cursorLine

      // ✅ NEW: Check if viewport changed (user scrolled)
      const viewportChanged =
        update.view.viewport.from !== this.lastViewportFrom ||
        update.view.viewport.to !== this.lastViewportTo

      // Rebuild decorations if:
      // 1. Document content changed (typing)
      // 2. Cursor moved to different line (syntax reveal)
      // 3. Viewport scrolled (need to render newly visible lines)
      if (update.docChanged || cursorLineChanged || viewportChanged) {
        this.cursorLine = newCursorLine

        // ✅ NEW: Update viewport tracking
        this.lastViewportFrom = update.view.viewport.from
        this.lastViewportTo = update.view.viewport.to

        this.decorations = buildDecorations(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations
  }
)
```

---

### Step 3: Fine-Tune Buffer Size

The `BUFFER_LINES` constant controls how many lines above/below the viewport are pre-rendered.

**Trade-offs:**
- **Small buffer (10-20 lines):** Less memory, faster decoration build, but flicker on fast scroll
- **Medium buffer (50 lines):** Good balance, smooth scrolling, acceptable memory
- **Large buffer (100+ lines):** Smoothest scrolling, more memory, slower decoration build

**Recommended starting value:** `50 lines`

**Tuning based on document size:**
```typescript
function getBufferSize(docLines: number): number {
  if (docLines < 1000) return 100  // Small docs: larger buffer for ultra-smooth
  if (docLines < 5000) return 50   // Medium docs: balanced
  return 30                         // Large docs: smaller buffer for performance
}

const BUFFER_LINES = getBufferSize(doc.lines)
```

---

### Step 4: Add Debug Logging (Optional)

To verify optimization is working:

```typescript
function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const cursorPos = view.state.selection.main.head
  const doc = view.state.doc
  const cursorLine = doc.lineAt(cursorPos)

  const viewport = view.viewport
  const BUFFER_LINES = 50

  const viewportStartLine = doc.lineAt(viewport.from).number
  const viewportEndLine = doc.lineAt(viewport.to).number
  const startLine = Math.max(1, viewportStartLine - BUFFER_LINES)
  const endLine = Math.min(doc.lines, viewportEndLine + BUFFER_LINES)

  const fromPos = doc.line(startLine).from
  const toPos = doc.line(endLine).to

  // ✅ DEBUG: Log processing stats
  if (import.meta.env.DEV) {
    const processingLines = endLine - startLine + 1
    const totalLines = doc.lines
    const percentageProcessed = ((processingLines / totalLines) * 100).toFixed(1)

    console.debug(`[LivePreview] Processing ${processingLines}/${totalLines} lines (${percentageProcessed}%)`)
  }

  let nodeCount = 0 // Track how many nodes we process

  syntaxTree(view.state).iterate({
    from: fromPos,
    to: toPos,
    enter: (node) => {
      nodeCount++

      const { from, to, name } = node

      if (from >= cursorLine.from && to <= cursorLine.to) {
        return
      }

      // ... decoration logic
    }
  })

  // ✅ DEBUG: Log node processing stats
  if (import.meta.env.DEV) {
    console.debug(`[LivePreview] Processed ${nodeCount} nodes`)
  }

  return builder.finish()
}
```

**Expected output:**
```
Before optimization (20k line doc):
[LivePreview] Processing 20000/20000 lines (100%)
[LivePreview] Processed 18543 nodes

After optimization (20k line doc):
[LivePreview] Processing 130/20000 lines (0.7%)
[LivePreview] Processed 247 nodes
```

---

## Performance Measurement

### Before Optimization Benchmark

Create a test document and measure:

```typescript
// In browser console or test file
const testDoc = generateLargeMarkdown(20000) // 20k lines

// Load into editor
window.scribe.loadNote({ id: 'perf-test', content: testDoc })

// Measure typing latency
const latencies = []
for (let i = 0; i < 100; i++) {
  const start = performance.now()
  // Simulate typing
  editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
  const end = performance.now()
  latencies.push(end - start)
}

console.log('Average latency:', latencies.reduce((a, b) => a + b) / latencies.length)
console.log('P95 latency:', latencies.sort((a, b) => a - b)[95])
```

**Expected before optimization:**
- Average: 50-200ms
- P95: 100-500ms
- ❌ Visible lag, jerky typing

### After Optimization Benchmark

Run same test after implementing viewport optimization:

**Expected after optimization:**
- Average: 5-15ms
- P95: 10-25ms
- ✅ Smooth, buttery typing

---

## Testing Checklist

After implementing optimization, verify:

### Functional Tests
- [ ] Bold text renders correctly (no `**` markers)
- [ ] Italic text renders correctly (no `*` or `_` markers)
- [ ] Headers render correctly (no `#` symbols)
- [ ] Wiki links render correctly (single brackets)
- [ ] Inline code renders correctly (no backticks)
- [ ] Cursor-aware reveal works (syntax shows on cursor line)

### Performance Tests
- [ ] Typing feels smooth on 20k line document
- [ ] Cursor movement is instant
- [ ] Scrolling is 60fps smooth
- [ ] No console errors
- [ ] No infinite loops or freezing

### Edge Cases
- [ ] Works at top of document (line 1)
- [ ] Works at bottom of document (last line)
- [ ] Works when cursor jumps far (Cmd+Home, Cmd+End)
- [ ] Works with rapid scrolling
- [ ] Works with large jumps (Cmd+F search)

---

## Rollback Plan

If optimization causes issues:

1. **Keep a backup of original file:**
   ```bash
   cp src/renderer/src/lib/codeMirrorMarkdownExtension.ts \
      src/renderer/src/lib/codeMirrorMarkdownExtension.ts.backup
   ```

2. **Git branch strategy:**
   ```bash
   # Work on optimization branch
   git checkout -b feat/viewport-optimization

   # If issues, easy rollback
   git checkout feat/live-editor-enhancements
   ```

3. **Feature flag (optional):**
   ```typescript
   const USE_VIEWPORT_OPTIMIZATION = true // Toggle off if issues

   syntaxTree(view.state).iterate({
     ...(USE_VIEWPORT_OPTIMIZATION ? {
       from: fromPos,
       to: toPos
     } : {}),
     enter: (node) => { /* ... */ }
   })
   ```

---

## Expected Performance Gains

| Document Size | Before (ms) | After (ms) | Improvement |
|--------------|-------------|------------|-------------|
| **Small (500 lines)** | 10-20ms | 2-5ms | 2-4x faster |
| **Medium (2500 lines)** | 40-100ms | 5-10ms | 8-10x faster |
| **Large (10k lines)** | 150-400ms | 8-15ms | 20-30x faster |
| **XLarge (20k lines)** | 300-800ms | 10-20ms | 30-40x faster |

---

## Advanced Optimizations (Future)

If viewport optimization meets targets, you're done! 🎉

If you need even more performance, consider:

### 1. Incremental Decoration Updates
Only rebuild decorations for changed lines, reuse unchanged decorations.

```typescript
// Cache decorations by line number
const decorationCache = new Map<number, Decoration[]>()

function buildDecorations(view: EditorView): DecorationSet {
  // Check which lines changed
  const changedLines = getChangedLines(view)

  // Reuse cached decorations for unchanged lines
  // Only rebuild decorations for changed lines
}
```

**Complexity:** High
**Gain:** 2-5x additional improvement
**Recommended:** Only if viewport optimization isn't enough

### 2. Web Worker for Syntax Parsing
Move syntax tree parsing to background thread.

```typescript
// Worker thread
self.onmessage = (e) => {
  const { content } = e.data
  const tree = parseMarkdown(content)
  self.postMessage({ tree })
}

// Main thread
const worker = new Worker('markdown-parser.worker.js')
worker.postMessage({ content })
worker.onmessage = (e) => {
  const { tree } = e.data
  updateDecorations(tree)
}
```

**Complexity:** Very High
**Gain:** Unblock main thread (smooth UI during parsing)
**Recommended:** Only for 50k+ line documents

### 3. Virtual Scrolling
Render only visible DOM nodes, recycle off-screen nodes.

**Complexity:** Very High (requires major refactor)
**Gain:** 10x+ for 100k+ line documents
**Recommended:** Unlikely needed for Scribe's use case

---

## Questions & Troubleshooting

### Q: What if decorations flicker during scrolling?
**A:** Increase `BUFFER_LINES` from 50 to 100. This pre-renders more lines above/below viewport.

### Q: What if performance is still slow?
**A:** Check Chrome DevTools Performance panel:
- Look for long tasks (> 50ms)
- Check if syntax tree iteration is still the bottleneck
- Consider incremental decoration updates

### Q: What if viewport detection doesn't work?
**A:** Verify `view.viewport` is defined:
```typescript
console.log('Viewport:', view.viewport)
// Expected: { from: 0, to: 1500 } (positions, not line numbers)
```

### Q: What if decorations are missing near viewport edges?
**A:** Buffer is too small. Increase `BUFFER_LINES` or check boundary calculations:
```typescript
const startLine = Math.max(1, viewportStartLine - BUFFER_LINES)
const endLine = Math.min(doc.lines, viewportEndLine + BUFFER_LINES)
```

---

## Success Criteria

✅ **Optimization is successful if:**
1. Typing latency < 16ms (avg) on 20k line document
2. Scrolling is 60fps smooth
3. Cursor movement is instant
4. No visual glitches or missing decorations
5. All existing features still work

❌ **Optimization failed if:**
1. Decorations missing or flickering
2. Typing latency > 50ms
3. Console errors or infinite loops
4. Cursor-aware reveal broken

---

## Next Steps After Implementation

1. **Profile with Chrome DevTools** - Verify 40x improvement
2. **Add performance tests** - Automated latency benchmarks
3. **Update documentation** - Note viewport optimization in PLAN-LIVE-EDITOR.md
4. **Consider Playwright E2E tests** - Automated performance regression tests
5. **Close performance investigation** - If targets met, no need for ProseMirror/Milkdown migration

---

## References

- [CodeMirror 6 Viewport Documentation](https://codemirror.net/docs/ref/#view.EditorView.viewport)
- [CodeMirror 6 Decorations Guide](https://codemirror.net/examples/decoration/)
- [RangeSet Documentation](https://codemirror.net/docs/ref/#state.RangeSet)
- [Lezer Syntax Tree Iteration](https://lezer.codemirror.net/docs/ref/#common.Tree.iterate)

---

**Estimated Implementation Time:** 1-2 days
**Expected Performance Gain:** 40x improvement
**Risk Level:** Low (incremental improvement, easy rollback)
