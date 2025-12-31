/**
 * Comprehensive Markdown Syntax Demo
 *
 * This note contains all supported markdown syntax types for testing
 * Live Preview inline rendering.
 */

export const markdownSyntaxDemo = `# Markdown Syntax Demo

Test all markdown elements in Live Preview mode to verify inline rendering.

---

## Headers

# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6

---

## Text Formatting

**Bold text** using double asterisks
__Bold text__ using double underscores

*Italic text* using single asterisk
_Italic text_ using single underscore

***Bold and italic*** combined
___Bold and italic___ with underscores

~~Strikethrough text~~ using tildes

---

## Code

Inline code with \`backticks\` in a sentence.

\`\`\`javascript
// Code block
function hello(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`python
# Python code block
def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)
\`\`\`

---

## Lists

### Unordered Lists

- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

* Alternative bullet
* Another item

### Ordered Lists

1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item

### Task Lists

- [ ] Unchecked task
- [x] Completed task
- [ ] Another unchecked task

---

## Links

[Regular link](https://example.com)
[Link with title](https://example.com "Example Website")

Auto-link: https://example.com

[[Wiki Link]] to another note
[[Wiki Link|Custom Text]] with display text

---

## Math Equations

Inline math: $E = mc^2$

Display math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Matrix equation:

$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
\\begin{bmatrix}
x \\\\
y
\\end{bmatrix}
=
\\begin{bmatrix}
ax + by \\\\
cx + dy
\\end{bmatrix}
$$

---

## Blockquotes

> This is a blockquote
> It can span multiple lines
>
> And have multiple paragraphs

> Nested quote
>> Even more nested

---

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

| Left | Center | Right |
|:-----|:------:|------:|
| L1   | C1     | R1    |
| L2   | C2     | R2    |

---

## Horizontal Rules

Three or more hyphens:

---

Three or more asterisks:

***

Three or more underscores:

___

---

## Images

![Alt text](https://via.placeholder.com/150)
![Image with title](https://via.placeholder.com/150 "Placeholder Image")

---

## Callouts (Obsidian-style)

> [!note] Note Callout
> This is a note with **bold** and *italic* text.

> [!tip] Pro Tip
> Use Live Preview mode (⌘2) to see inline rendering!

> [!warning] Warning
> Some features may not render in all modes.

> [!danger] Danger Zone
> This contains critical information with \`inline code\`.

---

## Mixed Content Test

Here's a paragraph with **bold**, *italic*, and \`code\` all together. You can also have [[Wiki Links]] and [regular links](https://example.com) in the same sentence.

This paragraph includes inline math like $x^2 + y^2 = r^2$ and **bold text** and even ~~strikethrough~~.

### Task List with Formatting

- [x] **Bold task** that is completed
- [ ] *Italic task* that is pending
- [ ] Task with \`inline code\`
- [x] Task with [[Wiki Link]]

---

## Testing Instructions

**In Live Preview Mode:**

1. Place cursor on lines with markdown syntax
2. Verify syntax markers show on current line
3. Move cursor away - markers should hide
4. Text should remain styled (bold, italic, headers)

**Expected Behavior:**

- ✅ Headers should be larger without # symbols (except cursor line)
- ✅ Bold should show without ** markers (except cursor line)
- ✅ Italic should show without * markers (except cursor line)
- ✅ Code should show without backtick markers (except cursor line)
- ✅ Wiki links should be clickable and styled
- ✅ Math equations should render properly

---

## End of Demo

Switch between modes to compare:
- ⌘1: Source (raw markdown)
- ⌘2: Live Preview (inline rendering)
- ⌘3: Reading (full preview)
`
