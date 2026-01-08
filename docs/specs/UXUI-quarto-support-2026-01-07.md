# UX/UI Design: Quarto Support in Scribe

> **ADHD-Friendly Design Specification**

**Version:** 1.0.0
**Created:** 2026-01-07
**Designer:** Claude (UX/UI Consultant)
**Target:** Scribe v1.15.0

---

## Design Philosophy

### ADHD Principles Applied

| Principle | Application to Quarto Features |
|-----------|-------------------------------|
| **Zero Friction** | Autocomplete appears instantly, no configuration required |
| **One Thing at a Time** | Dropdowns show focused results, not overwhelming lists |
| **Escape Hatches** | Esc dismisses any dropdown, clicking away closes panels |
| **Visible Progress** | Running indicators for chunks, error counts always visible |
| **Sensory-Friendly** | Muted colors, no jarring animations |

### Design Constraints

- Must work within existing Scribe dark theme (`--nexus-*` CSS variables)
- Must follow existing component patterns (CitationAutocomplete, CommandPalette)
- Must not add visual clutter to the editor
- Must be keyboard-first with mouse as fallback
- Must degrade gracefully in browser mode

---

## 1. YAML Autocomplete UI

### Trigger Behavior

```
Trigger: Typing within `---` frontmatter block
Activation: Automatic after 150ms pause OR manual with Tab/Ctrl+Space
Dismissal: Escape, click outside, or continue typing without match
```

### ASCII Wireframe: YAML Key Autocomplete

```
+------------------------------------------------------------------+
|  ---                                                              |
|  title: "My Research Paper"                                       |
|  author: "DT"                                                     |
|  for|                                                             |
|     +----------------------------------------+                    |
|     | format:        Output format           | <- highlighted    |
|     | format-links:  Include format links    |                    |
|     | footnotes:     Footnote handling       |                    |
|     +----------------------------------------+                    |
|     | Tab/Enter: select  |  Esc: dismiss      |                   |
|     +----------------------------------------+                    |
|  ---                                                              |
+------------------------------------------------------------------+
```

### ASCII Wireframe: Nested YAML Value Autocomplete

```
+------------------------------------------------------------------+
|  ---                                                              |
|  title: "My Research Paper"                                       |
|  format: |                                                        |
|          +----------------------------------------+               |
|          | html         HTML document             | <- highlighted|
|          | pdf          PDF via LaTeX             |               |
|          | docx         Word document             |               |
|          | revealjs     Reveal.js slides          |               |
|          | beamer       LaTeX Beamer slides       |               |
|          | typst        Typst document            |               |
|          +----------------------------------------+               |
|  ---                                                              |
+------------------------------------------------------------------+
```

### Component Specification

```
+-----------------------------------------------+
|  Dropdown Container                           |
|  - Width: 320px (fixed)                       |
|  - Max height: 240px (scrollable)             |
|  - Position: Below cursor, inline with text   |
|  - Z-index: 50 (same as CitationAutocomplete) |
+-----------------------------------------------+

+-----------------------------------------------+
|  [key icon]  format:       Output format      |
|  +---------+ +----------+ +------------------+|
|  | 16x16   | | Label    | | Description      ||
|  | muted   | | 14px     | | 12px, muted      ||
|  +---------+ +----------+ +------------------+|
+-----------------------------------------------+
```

### Visual States

| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | `--nexus-bg-tertiary` | `rgba(255,255,255,0.1)` | `--nexus-text-primary` |
| Hover/Selected | `rgba(255,255,255,0.08)` | - | `--nexus-accent` (label) |
| Disabled | Same as default | - | 50% opacity |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow Down | Next item |
| Arrow Up | Previous item |
| Tab / Enter | Select and insert |
| Escape | Dismiss dropdown |
| Type | Filter list |

### Accessibility Checklist

- [x] `role="listbox"` on dropdown container
- [x] `role="option"` on each item
- [x] `aria-selected="true"` on highlighted item
- [x] `aria-label` describing dropdown purpose
- [x] Focus trap within dropdown when open
- [x] Escape key always dismisses
- [x] Screen reader announces: "YAML completions, X results"

---

## 2. Chunk Options Bar

### Design Decision: Inline vs. Floating

**Chosen: Autocomplete-only (inline)** - No floating bar.

Rationale:
- Floating bars add visual clutter
- Disrupts "one thing at a time" principle
- Autocomplete provides same functionality with less friction

### Trigger Behavior

```
Trigger: Typing `#|` at start of line inside code block
Activation: Automatic, shows after `#| ` (space after pipe)
Context: Only active when cursor is between ``` delimiters
```

### ASCII Wireframe: Chunk Options Autocomplete

```
+------------------------------------------------------------------+
|  ```{r}                                                           |
|  #| |                                                             |
|     +--------------------------------------------------+          |
|     | #| echo:       Show source code    [true/false]  | <- sel  |
|     | #| eval:       Execute code        [true/false]  |          |
|     | #| warning:    Show warnings       [true/false]  |          |
|     | #| fig-cap:    Figure caption      [string]      |          |
|     | #| fig-width:  Figure width        [inches]      |          |
|     | #| label:      Chunk label         [string]      |          |
|     +--------------------------------------------------+          |
|     | Tab: select  |  Esc: dismiss  |  Type: filter    |          |
|     +--------------------------------------------------+          |
|  plot(x, y)                                                       |
|  ```                                                              |
+------------------------------------------------------------------+
```

### ASCII Wireframe: Chunk Option Value Autocomplete

```
+------------------------------------------------------------------+
|  ```{r}                                                           |
|  #| echo: |                                                       |
|           +--------------------------------+                      |
|           | true     Show code in output   | <- highlighted      |
|           | false    Hide code in output   |                      |
|           | fenced   Show with fences      |                      |
|           +--------------------------------+                      |
|  plot(x, y)                                                       |
|  ```                                                              |
+------------------------------------------------------------------+
```

### Chunk Execution Indicator (Future Enhancement)

When chunk execution is added (v2+), show minimal inline status:

```
+------------------------------------------------------------------+
|  ```{r}                                                           |
|  #| label: fig-scatter                          [Running...]      |
|  #| fig-cap: "Scatter plot"                                       |
|  plot(x, y)                                                       |
|  ```                                                              |
|  +---------- Output Preview (collapsed) -------------------------+
|  | [>] Click to expand output | 1 figure                         |
|  +---------------------------------------------------------------+
+------------------------------------------------------------------+
```

### Accessibility Checklist

- [x] Same listbox pattern as YAML autocomplete
- [x] Code block context detected via syntax tree
- [x] Option descriptions read by screen reader
- [x] Value type hints provided (boolean, string, number)

---

## 3. Cross-Reference Picker

### Trigger Behavior

```
Trigger: Typing `@` in document body (outside code blocks)
Activation: Automatic after `@` character
Grouping: Results grouped by type (@fig-, @tbl-, @eq-, @sec-)
Preview: Caption/title shown in dropdown
```

### ASCII Wireframe: Cross-Reference Dropdown

```
+------------------------------------------------------------------+
|  As shown in @fig-|                                               |
|                   +----------------------------------------------+|
|                   | FIGURES                                      ||
|                   | @fig-scatter    Scatter plot of X vs Y    <- ||
|                   | @fig-histogram  Distribution of residuals    ||
|                   |                                              ||
|                   | TABLES                                       ||
|                   | @tbl-summary    Summary statistics           ||
|                   | @tbl-regression Regression coefficients      ||
|                   |                                              ||
|                   | EQUATIONS                                    ||
|                   | @eq-model       The mediation model          ||
|                   +----------------------------------------------+|
|                   | Tab: select  |  Line 42  |  Type: filter     ||
|                   +----------------------------------------------+|
+------------------------------------------------------------------+
```

### Component Structure

```
+-----------------------------------------------+
|  GROUP HEADER                                 |
|  - Text: "FIGURES" (uppercase)                |
|  - Font: 10px, `--nexus-text-muted`           |
|  - Padding: 8px 12px                          |
|  - Background: `--nexus-bg-secondary`         |
+-----------------------------------------------+

+-----------------------------------------------+
|  [@] @fig-scatter      Scatter plot of X...   |
|  +--+ +-------------+ +----------------------+|
|  |  | | Reference   | | Caption preview      ||
|  |  | | 14px, mono  | | 12px, muted, 40 char ||
|  +--+ +-------------+ +----------------------+|
+-----------------------------------------------+
```

### Type Icons

| Type | Icon | Color |
|------|------|-------|
| @fig- | Image icon (Lucide) | `#7c9c6b` (green) |
| @tbl- | Table icon (Lucide) | `#5b8dd9` (blue) |
| @eq- | Function icon (Lucide) | `#d9a347` (yellow) |
| @sec- | Hash icon (Lucide) | `#b577c2` (purple) |

### Jump to Definition

When reference is selected:
1. Insert `@fig-label` at cursor
2. Show brief toast: "Jump to line 42?" with [Go] button (auto-dismiss 3s)
3. Or: Cmd+Click on inserted reference to jump

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow Down/Up | Navigate items |
| Tab / Enter | Insert reference |
| Cmd+Enter | Insert and jump to definition |
| Escape | Dismiss |

### Accessibility Checklist

- [x] Groups announced: "Figures group, 2 items"
- [x] Item announced: "@fig-scatter, Scatter plot of X vs Y, line 42"
- [x] Live region updates as user types
- [x] Color not sole indicator (icons + text labels)

---

## 4. Error Panel

### Design Decision: Bottom Drawer (Not Sidebar)

Rationale:
- Sidebar space is premium (Mission Control, Backlinks)
- Errors are transient, don't need permanent visibility
- Bottom drawer matches VS Code / RStudio pattern
- Can be fully collapsed when not needed

### Trigger Behavior

```
Trigger: Quarto render failure OR live validation error
Display: Badge on status bar + auto-expand on new error (configurable)
Dismissal: Click X, Escape, or successful render
Persistence: Panel remembers collapsed state across notes
```

### ASCII Wireframe: Collapsed State (Status Bar Integration)

```
+------------------------------------------------------------------+
|                          [Editor Content]                         |
+------------------------------------------------------------------+
| Words: 1,234 | Live | Ln 42, Col 8      [!] 3 errors    [^]      |
+------------------------------------------------------------------+
                                          ^              ^
                                          |              |
                              Error badge (click to expand)
                                              Expand/collapse toggle
```

### ASCII Wireframe: Expanded Error Panel

```
+------------------------------------------------------------------+
|                          [Editor Content]                         |
+------------------------------------------------------------------+
| QUARTO ERRORS                                           [_] [X]  |
+------------------------------------------------------------------+
| [!] Line 42: Undefined cross-reference '@fig-missing'            |
|     > Click to jump | Copy | Ask AI to fix                       |
+------------------------------------------------------------------+
| [!] Line 78: Invalid YAML: expected key-value pair               |
|     format: html                                                  |
|       theme sakura    <- missing colon                           |
|     > Click to jump | Copy | Ask AI to fix                       |
+------------------------------------------------------------------+
| [!] Line 156: Code chunk error (R)                               |
|     Error in plot(x, y): object 'x' not found                    |
|     > Click to jump | Copy | Ask AI to fix                       |
+------------------------------------------------------------------+
| 3 errors | Last render: 2:34 PM                     [Re-render]  |
+------------------------------------------------------------------+
| Words: 1,234 | Live | Ln 42, Col 8                               |
+------------------------------------------------------------------+
```

### Component Specification

```
+-----------------------------------------------+
|  Error Panel Container                        |
|  - Height: 200px (default, resizable)         |
|  - Min height: 80px                           |
|  - Max height: 50% of editor                  |
|  - Background: `--nexus-bg-secondary`         |
|  - Border-top: 1px solid rgba(255,255,255,0.1)|
+-----------------------------------------------+

+-----------------------------------------------+
|  Error Item                                   |
|  - Padding: 12px 16px                         |
|  - Border-bottom: 1px solid rgba(...)         |
|  - Hover: `--nexus-bg-tertiary`               |
+-----------------------------------------------+

+-----------------------------------------------+
|  [!] Line 42: Error message                   |
|  +--+ +------------------------------------+  |
|  |  | | Line prefix (red)                  |  |
|  +--+ | Message (14px, primary text)       |  |
|       +------------------------------------+  |
|       | Context snippet (12px, mono, muted)|  |
|       +------------------------------------+  |
|       | > Jump | Copy | AI Fix (links)     |  |
|       +------------------------------------+  |
+-----------------------------------------------+
```

### Error Badge Specification

```
+-------+
| [!] 3 |
+-------+
- Background: `#ef4444` (red-500)
- Text: white, 11px, bold
- Border-radius: 9999px (pill)
- Padding: 2px 8px
- Animation: Subtle pulse on new error (1 cycle only)
```

### Action Buttons

| Action | Icon | Behavior |
|--------|------|----------|
| Jump to line | Arrow-right | Scroll editor to error line, highlight |
| Copy | Copy icon | Copy full error to clipboard |
| Ask AI to fix | Sparkles | Open Claude panel with error context |
| Re-render | Play icon | Run `quarto render` again |

### Error Categories

| Category | Icon Color | Example |
|----------|------------|---------|
| Syntax | Yellow (#d9a347) | Invalid YAML |
| Reference | Orange (#f97316) | Undefined @fig-* |
| Code | Red (#ef4444) | R/Python error |
| LaTeX | Purple (#b577c2) | Math compilation |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Cmd+Shift+E | Toggle error panel |
| Escape | Collapse panel (when focused) |
| Enter | Jump to selected error |
| Arrow Down/Up | Navigate errors |

### Accessibility Checklist

- [x] `role="log"` for error list (live region)
- [x] `aria-live="polite"` announces new errors
- [x] Error count announced: "3 errors"
- [x] Each error is focusable and actionable
- [x] Resize handle has aria-label

---

## 5. Live Slide Preview

### Design Decision: Optional Split View

Rationale:
- Split view is powerful but complex
- Only show for `.qmd` files with `format: revealjs/beamer`
- Toggle via shortcut, not forced on user
- Default: Preview in separate window (simpler)

### Trigger Behavior

```
Trigger: Manual toggle OR Cmd+Shift+P (Preview)
Detection: Auto-detect `format: revealjs` or `format: beamer` in YAML
Default: External browser preview (simpler)
Optional: Split view for power users (Settings toggle)
```

### ASCII Wireframe: Split View Layout

```
+------------------------------------------------------------------+
| [Scribe] My Presentation.qmd                              [_][X] |
+------------------------------------------------------------------+
| [Source]          |      [Divider]      |       [Preview]        |
+-------------------+----+----------------+------------------------+
|  ---                   |                | +--------------------+ |
|  title: "My Talk"      |                | |                    | |
|  format: revealjs      |                | |    Slide Title     | |
|  ---                   |                | |                    | |
|                        |                | |  - Bullet point 1  | |
|  # Introduction|       |  <- cursor     | |  - Bullet point 2  | |
|                        |    synced      | |                    | |
|  - Point one           |                | +--------------------+ |
|  - Point two           |                |                        |
|                        |                | [<] Slide 1/12 [>]     |
|  ---                   |                | [Sync: ON] [External]  |
+------------------------+----------------+------------------------+
| Words: 234 | Source | Ln 8, Col 15                   [Preview]  |
+------------------------------------------------------------------+
```

### Component Specification

```
+-----------------------------------------------+
|  Split View Container                         |
|  - Layout: CSS Grid (resizable columns)       |
|  - Default split: 60% source, 40% preview     |
|  - Min source width: 400px                    |
|  - Min preview width: 300px                   |
+-----------------------------------------------+

+-----------------------------------------------+
|  Preview Panel                                |
|  - Background: #0d1117 (darker than editor)   |
|  - Padding: 16px                              |
|  - Overflow: hidden (scaled to fit)           |
+-----------------------------------------------+

+-----------------------------------------------+
|  Slide Frame                                  |
|  - Aspect ratio: 16:9 (revealjs default)      |
|  - Border: 1px solid rgba(255,255,255,0.1)    |
|  - Scale: fit-content with letterboxing       |
+-----------------------------------------------+

+-----------------------------------------------+
|  Navigation Bar                               |
|  - Height: 32px                               |
|  - Background: `--nexus-bg-tertiary`          |
|  - Items: [<] [Slide X/Y] [>] [Sync] [External]|
+-----------------------------------------------+
```

### Sync Behavior

| User Action | Preview Response |
|-------------|------------------|
| Cursor moves to new slide section | Preview jumps to that slide |
| Click slide in preview | Cursor jumps to source section |
| Edit slide content | Preview updates after 500ms debounce |
| Add new slide | Preview shows new slide |

### Slide Detection

Slides are delimited by:
- `---` (horizontal rule) in revealjs
- `# Heading` (level 1) starts new slide
- `## Heading` (level 2) starts new sub-slide

### Navigation Controls

| Control | Action |
|---------|--------|
| [<] | Previous slide |
| [>] | Next slide |
| Slide X/Y | Current position indicator |
| [Sync: ON/OFF] | Toggle auto-sync |
| [External] | Open in browser |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Cmd+Shift+P | Toggle preview panel |
| Cmd+[ | Previous slide |
| Cmd+] | Next slide |
| Cmd+Shift+B | Open in browser |

### Alternative: External Preview (Default)

For users who prefer simplicity:

```
+------------------------------------------------------------------+
|                     [Full Editor View]                            |
+------------------------------------------------------------------+
| Words: 234 | Source | Ln 8, Col 15      [Preview] (Cmd+Shift+P)  |
+------------------------------------------------------------------+

Clicking [Preview] or Cmd+Shift+P:
1. Renders document with `quarto preview`
2. Opens in default browser
3. Browser auto-refreshes on save (Quarto feature)
```

### Accessibility Checklist

- [x] Divider is keyboard-resizable (Arrow keys when focused)
- [x] Preview has `aria-label="Slide preview"`
- [x] Navigation buttons have aria-labels
- [x] Slide number announced on change
- [x] Sync state announced when toggled

---

## User Flow Diagrams

### Flow 1: Writing with YAML Autocomplete

```
                    +------------------+
                    |   Open .qmd file |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Cursor in YAML   |
                    | block (---)      |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Type "for"       |
                    +--------+---------+
                             |
                             v
                +------------+------------+
                |                         |
                v                         v
     +------------------+       +------------------+
     | [150ms elapsed]  |       | [Tab/Ctrl+Space] |
     +--------+---------+       +--------+---------+
              |                          |
              +------------+-------------+
                           |
                           v
                  +------------------+
                  | Dropdown appears |
                  | "format:" first  |
                  +--------+---------+
                           |
           +---------------+---------------+
           |               |               |
           v               v               v
    +----------+    +-----------+   +----------+
    | Arrow    |    | Tab/Enter |   | Escape   |
    | keys     |    | to select |   | dismiss  |
    +----+-----+    +-----+-----+   +----+-----+
         |                |              |
         v                v              v
    +----------+    +-----------+   +----------+
    | Navigate |    | "format:" |   | Resume   |
    | options  |    | inserted  |   | typing   |
    +----------+    +-----------+   +----------+
```

### Flow 2: Handling Quarto Errors

```
                    +-------------------+
                    | User saves file   |
                    | OR clicks Render  |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    | Quarto render     |
                    | executes          |
                    +---------+---------+
                              |
              +---------------+---------------+
              |                               |
              v                               v
     +------------------+           +------------------+
     | Render SUCCESS   |           | Render FAILED    |
     +--------+---------+           +--------+---------+
              |                              |
              v                              v
     +------------------+           +------------------+
     | Toast: "Rendered |           | Error badge      |
     | successfully"    |           | appears in       |
     | (auto-dismiss)   |           | status bar       |
     +------------------+           +--------+---------+
                                             |
                        +--------------------+--------------------+
                        |                    |                    |
                        v                    v                    v
               +----------------+   +----------------+   +----------------+
               | Click badge    |   | Cmd+Shift+E    |   | Auto-expand    |
               | in status bar  |   | shortcut       |   | (if enabled)   |
               +-------+--------+   +-------+--------+   +-------+--------+
                       |                    |                    |
                       +--------------------+--------------------+
                                            |
                                            v
                                  +-------------------+
                                  | Error panel       |
                                  | expands           |
                                  +---------+---------+
                                            |
                        +-------------------+-------------------+
                        |                   |                   |
                        v                   v                   v
               +----------------+   +----------------+   +----------------+
               | Jump to line   |   | Copy error     |   | Ask AI to fix  |
               +-------+--------+   +----------------+   +-------+--------+
                       |                                         |
                       v                                         v
               +----------------+                       +----------------+
               | Editor scrolls |                       | Claude panel   |
               | to error line  |                       | opens with     |
               +----------------+                       | error context  |
                                                        +----------------+
```

### Flow 3: Cross-Reference Insertion

```
                    +-------------------+
                    | Writing paragraph |
                    | in document body  |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    | Type "@fig-"      |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    | Document scanned  |
                    | for #fig-* labels |
                    +---------+---------+
                              |
              +---------------+---------------+
              |                               |
              v                               v
     +------------------+           +------------------+
     | Labels found     |           | No labels found  |
     +--------+---------+           +--------+---------+
              |                              |
              v                              v
     +------------------+           +------------------+
     | Dropdown shows:  |           | Show hint:       |
     | - @fig-scatter   |           | "No figures      |
     | - @fig-histogram |           | defined yet.     |
     +--------+---------+           | Use #| label:"   |
              |                     +------------------+
              v
     +------------------+
     | Select with      |
     | Tab/Enter        |
     +--------+---------+
              |
              v
     +------------------+
     | "@fig-scatter"   |
     | inserted at      |
     | cursor           |
     +------------------+
```

---

## Keyboard Shortcuts Proposal

### New Shortcuts for Quarto Features

| Shortcut | Action | Context |
|----------|--------|---------|
| **Cmd+Shift+E** | Toggle error panel | Global |
| **Cmd+Shift+P** | Toggle slide preview | .qmd with revealjs |
| **Cmd+Shift+R** | Render with Quarto | .qmd files |
| **Cmd+[** | Previous slide | Preview active |
| **Cmd+]** | Next slide | Preview active |
| **Ctrl+Space** | Trigger autocomplete | In YAML or code block |
| **Cmd+/** | Comment/uncomment | In code block |

### Existing Shortcuts Reference (No Conflicts)

| Shortcut | Current Action |
|----------|----------------|
| Cmd+K | Command palette |
| Cmd+E | Cycle editor mode |
| Cmd+1/2/3 | Source/Live/Reading mode |
| Cmd+D | Daily note |
| Cmd+N | New note |
| Cmd+Shift+F | Focus mode |
| Cmd+, | Settings |

---

## Accessibility Comprehensive Checklist

### Screen Reader Support

- [ ] All dropdowns announce item count
- [ ] Selected item announced on change
- [ ] Error panel uses `aria-live="polite"`
- [ ] Slide changes announced
- [ ] Keyboard shortcuts announced in tooltips

### Keyboard Navigation

- [ ] All features accessible via keyboard
- [ ] Focus visible on all interactive elements
- [ ] Tab order logical and predictable
- [ ] Escape always dismisses overlays
- [ ] Arrow keys navigate within components

### Visual Accessibility

- [ ] Color contrast >= 4.5:1 for text
- [ ] Error states use icon + color + text
- [ ] Focus ring visible (2px, high contrast)
- [ ] No reliance on color alone
- [ ] Text resizable up to 200%

### Motion & Animation

- [ ] Respects `prefers-reduced-motion`
- [ ] No auto-playing animations > 5s
- [ ] Error pulse is single cycle only
- [ ] Transitions < 200ms

### Testing Checklist

- [ ] Test with VoiceOver (macOS)
- [ ] Test with keyboard only
- [ ] Test with high contrast mode
- [ ] Test at 200% zoom
- [ ] Test with reduced motion enabled

---

## Implementation Priority

### Phase 1: Core Autocomplete (Sprint 33)
1. YAML autocomplete (highest impact, lowest risk)
2. Chunk options autocomplete (same pattern)
3. Cross-reference picker (document scanning)

### Phase 2: Error Handling (Sprint 34)
4. Error panel (bottom drawer)
5. Error badges in status bar
6. Jump to line functionality

### Phase 3: Preview (Sprint 35+)
7. External preview (browser)
8. Split view preview (optional, settings toggle)
9. Slide sync

---

## Design Tokens Reference

### Colors (from existing theme)

```css
--nexus-bg-primary: #1a1f2e
--nexus-bg-secondary: #232938
--nexus-bg-tertiary: #2a3142
--nexus-text-primary: #e4e4e7
--nexus-text-muted: #71717a
--nexus-accent: #7c9c6b
```

### Spacing Scale

```
4px  - xs (inline padding)
8px  - sm (item padding)
12px - md (section padding)
16px - lg (panel padding)
24px - xl (major sections)
```

### Typography

```
10px - Badge text, hints
12px - Descriptions, secondary
14px - Body text, labels
16px - Headings, emphasis
```

---

## Open Questions

1. **Error Panel Auto-Expand:** Should new errors auto-expand the panel?
   - Proposed: Yes by default, with Settings toggle to disable

2. **Preview Panel Default:** Split view or external browser?
   - Proposed: External browser (simpler), split view opt-in

3. **Autocomplete Delay:** 150ms or immediate?
   - Proposed: 150ms to avoid flickering on fast typers

---

**Status:** Ready for Review
**Next Steps:** Implementation in Sprint 33, starting with YAML autocomplete
