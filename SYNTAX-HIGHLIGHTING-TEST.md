# Syntax Highlighting Test Document

Use this document to test syntax highlighting in Source mode (⌘1).

## Test Instructions

1. Press **⌘1** to switch to Source mode
2. Look for syntax markers being highlighted with colors/styles
3. Compare with Live Preview mode (⌘2) where syntax should hide when cursor is away

---

## Headings Test

# Heading 1 - The # should be visible and colored
## Heading 2 - The ## should be visible and colored
### Heading 3 - The ### should be visible and colored
#### Heading 4
##### Heading 5
###### Heading 6

---

## Emphasis Test

This is **bold text** - The ** markers should be visible
This is *italic text* - The * markers should be visible
This is ~~strikethrough~~ - The ~~ markers should be visible
This is **_bold and italic_** - Both markers visible

---

## Code Test

This is `inline code` - The backticks should be visible

```javascript
// Fenced code block
const test = "value"
```

---

## Links Test

This is a [link](https://example.com) - The [] and () should be visible
This is a <https://example.com> autolink

---

## Lists Test

- Bullet list item 1 - The - marker should be visible
- Bullet list item 2
  - Nested item

* Asterisk list
+ Plus list

1. Numbered list
2. Second item

---

## Blockquotes Test

> This is a blockquote - The > marker should be visible
> Second line of quote
>> Nested quote

---

## Math Test (LaTeX)

Inline math: $E = mc^2$ - The $ markers should be visible

Display math:
$$
\int_0^1 x^2 dx = \frac{1}{3}
$$

---

## What to Look For in Source Mode (⌘1)

✅ **Heading markers (#, ##, ###)** should be:
- Visible
- Colored with accent color
- Slightly reduced opacity (0.6)

✅ **Emphasis markers (**, *, ~~)** should be:
- Visible
- Styled to match the content they create

✅ **Code markers (`)** should be:
- Visible
- Monospace font

✅ **Link markers ([], ())** should be:
- Visible
- Link colored

✅ **List markers (-, *, +)** should be:
- Visible
- Accent colored

✅ **Quote markers (>)** should be:
- Visible
- Quote colored

---

## What to Look For in Live Preview Mode (⌘2)

❌ **All syntax markers should HIDE** when cursor is on a different line
✅ **Syntax reveals** when you click into that line
✅ **Content renders** styled (bold, italic, headings, etc.)

---

## Quick Test Procedure

1. **Switch to Source mode (⌘1)**
   - Do you see `#` before "Heading 1"?
   - Do you see `**` around "bold text"?
   - Do you see `` ` `` around "inline code"?

2. **Check colors**
   - Are the `#` markers colored differently than the heading text?
   - Are the markers slightly transparent?

3. **Switch to Live Preview (⌘2)**
   - Do the `#` markers disappear when cursor is elsewhere?
   - Do they reappear when you click the heading line?

4. **Switch to Reading mode (⌘3)**
   - Everything should be rendered (no markers visible)
   - No editing possible

---

## Expected Behavior Summary

| Mode | Syntax Markers | Content Styled | Editable |
|------|---------------|----------------|----------|
| Source (⌘1) | ✅ Visible & Colored | ✅ Yes | ✅ Yes |
| Live Preview (⌘2) | ⚠️ Show on cursor line only | ✅ Yes | ✅ Yes |
| Reading (⌘3) | ❌ Hidden | ✅ Yes | ❌ No |

---

## Color Expectations

Based on the nexus-dark theme:

- **Heading markers (#)**: Accent color with 60% opacity
- **Emphasis markers (**, *)**: Text muted color with 50% opacity
- **Code markers (`)**: Monospace with muted color
- **Link markers ([], ())**: Link color with 60% opacity
- **Quote markers (>)**: Text secondary with 60% opacity
- **List markers (-, *, +)**: Accent color with bold weight
