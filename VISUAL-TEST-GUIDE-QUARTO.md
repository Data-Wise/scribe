# Visual Testing Guide - Quarto Autocomplete

**Status:** Browser mode running on http://localhost:5173
**Chrome:** Should be open and showing Scribe app

---

## Test Setup

1. **Switch to Source Mode** - Press `⌘1` (Cmd+1) to enable CodeMirror editor
2. **Create new note** - Click on any project or create a test note
3. **Clear editor** - Start with blank editor for testing

---

## Test 1: YAML Frontmatter Autocomplete

### Steps:
1. Type `---` and press Enter
2. Type `for`
3. **Expected:** Autocomplete menu appears with `format:` option
4. Press Enter or Tab to accept
5. Type ` ht` after the colon
6. **Expected:** Autocomplete shows `html`, `pdf`, `docx` options
7. Accept `html`

### Success Criteria:
- ✅ Menu appears within 1 second
- ✅ Options are relevant to what you typed
- ✅ Selecting option inserts correct text
- ✅ Cursor positioned after insertion

---

## Test 2: Multiple YAML Keys

### Steps:
1. Continue in YAML block
2. Press Enter for new line
3. Type `tit`
4. **Expected:** `title:` appears
5. Accept and type ` "My Document"`
6. Press Enter
7. Type `auth`
8. **Expected:** `author:` appears

### Success Criteria:
- ✅ Multiple completions work in same YAML block
- ✅ Each completion is context-aware
- ✅ No interference between completions

---

## Test 3: Chunk Options Autocomplete

### Steps:
1. Close YAML with `---` and press Enter twice
2. Type <code>```r</code> and press Enter
3. Type `#| ` (hash-pipe-space)
4. **Expected:** Chunk option menu with `#| echo:`, `#| eval:`, etc.
5. Navigate with arrow keys
6. Select `#| echo:`
7. Type ` fal`
8. **Expected:** `false` value appears
9. Accept

### Success Criteria:
- ✅ Chunk options only appear in code blocks
- ✅ Space after `#|` triggers menu
- ✅ Value completion works after option name
- ✅ Boolean values (true/false) suggested correctly

---

## Test 4: Multiple Chunk Options

### Steps:
1. Continue in same code block
2. Press Enter for new line
3. Type `#| warn`
4. **Expected:** `#| warning:` appears
5. Accept and type ` false`
6. Press Enter
7. Type `#| fig-c`
8. **Expected:** `#| fig-cap:` appears

### Success Criteria:
- ✅ Multiple chunk options in same block
- ✅ Different option types (boolean, string, numeric)
- ✅ No false triggers outside `#|` pattern

---

## Test 5: Cross-Reference Autocomplete

### Steps:
1. Type `plot(x, y)` in code block and close with <code>```</code>
2. Above the code block, insert:
   ```
   #| label: fig-scatter
   #| fig-cap: "My scatter plot"
   ```
3. Below code block, press Enter twice
4. Type `See @fig`
5. **Expected:** Menu shows `@fig-scatter` with caption in detail
6. Accept

### Success Criteria:
- ✅ Label detected from `#| label:` in code block
- ✅ Caption shown in autocomplete detail
- ✅ `@` trigger works for cross-refs
- ✅ Label correctly inserted with `@` prefix

---

## Test 6: Multiple Label Types

### Steps:
1. Create multiple labeled elements:
   ```markdown
   ## Methods {#sec-methods}

   ![Plot](img.png){#fig-plot}

   | Data | Values |
   |------|--------|
   {#tbl-data}

   $$E=mc^2$${#eq-einstein}
   ```
2. Below, type `References: @`
3. **Expected:** Menu shows all 4 labels grouped by type

### Success Criteria:
- ✅ All label types detected (sec, fig, tbl, eq)
- ✅ Grouping by type (if implemented)
- ✅ Context shown for each label
- ✅ Can select and insert any label

---

## Test 7: Autocomplete in Different Editor Modes

### Steps:
1. In Source mode (⌘1), verify YAML autocomplete works
2. Switch to Live Preview mode (⌘2)
3. Type `---` and Enter, then `for`
4. **Expected:** Autocomplete still works
5. Switch to Reading mode (⌘3)
6. **Expected:** No autocomplete (read-only mode)

### Success Criteria:
- ✅ Works in Source mode
- ✅ Works in Live Preview mode
- ✅ Disabled in Reading mode (expected)

---

## Test 8: Keyboard Navigation

### Steps:
1. Trigger any autocomplete menu
2. Press `ArrowDown` multiple times
3. **Expected:** Selection moves down
4. Press `ArrowUp`
5. **Expected:** Selection moves up
6. Press `Escape`
7. **Expected:** Menu closes, text remains

### Success Criteria:
- ✅ Arrow keys navigate options
- ✅ Selected option highlighted
- ✅ Escape dismisses menu
- ✅ Typing filters options

---

## Test 9: Autocomplete Performance

### Steps:
1. Create a document with 20+ labels:
   ```markdown
   ![Fig 1](a.png){#fig-1}
   ![Fig 2](b.png){#fig-2}
   ...
   ![Fig 20](t.png){#fig-20}
   ```
2. Type `@fig`
3. **Expected:** Menu appears quickly (<500ms)
4. All 20 labels shown

### Success Criteria:
- ✅ Fast response even with many labels
- ✅ All labels detected
- ✅ Filtering works with partial text

---

## Test 10: Edge Cases

### Test A: Autocomplete outside valid context
- Type regular text (no YAML, no code block, no `@`)
- **Expected:** No autocomplete menu

### Test B: Incomplete YAML block
- Type `---` but don't close with second `---`
- Type `format: `
- **Expected:** Still suggests values

### Test C: Code block without language
- Type <code>```</code> (no language specified)
- Type `#| `
- **Expected:** Chunk options still work

### Test D: Multiple `@` on same line
- Type `See @fig-1 and @fig-2`
- **Expected:** Each `@` triggers autocomplete independently

---

## Common Issues to Check

### Issue: Autocomplete doesn't appear
- ✓ Check you're in Source or Live Preview mode (not Reading)
- ✓ Verify cursor is in correct context (YAML/code/body)
- ✓ Try Ctrl+Space to force trigger

### Issue: Wrong suggestions
- ✓ Check cursor position (before/after special characters)
- ✓ Verify context detection (are you actually in a code block?)

### Issue: Accepted text incorrect
- ✓ Check if option includes trailing space
- ✓ Verify cursor position after insertion

---

## Reporting Results

After testing, note:
1. ✅ Features that work correctly
2. ⚠️ Features with minor issues
3. ❌ Features that don't work
4. 💡 Unexpected behaviors or suggestions for improvement

**Take screenshots** of any issues for debugging!

---

## Browser DevTools (Optional)

Press F12 to open DevTools and check:
- Console for any errors
- Network tab for API calls
- Performance tab if autocomplete feels slow
