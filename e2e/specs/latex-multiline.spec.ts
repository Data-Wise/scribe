import { test, expect } from '../fixtures'

/**
 * Multi-line LaTeX E2E Tests
 *
 * Tests for Sprint 32 Task 1.1: Multi-line LaTeX Support
 * Tests the end-to-end user experience of multi-line display math in Live Preview mode
 *
 * Tests: LAT-E2E-01 to LAT-E2E-20
 */

test.describe('Multi-line LaTeX in Live Preview Mode', () => {
  test.beforeEach(async ({ seededPage, cmEditor }) => {
    // seededPage already has test notes loaded
    await seededPage.page.waitForTimeout(500)

    // Open an existing test note
    const testNote = seededPage.page.locator('button:has-text("Test Note Two")').first()
    await expect(testNote).toBeVisible({ timeout: 5000 })
    await testNote.click()
    await seededPage.page.waitForTimeout(500)

    // Wait for editor to be ready
    await cmEditor.waitForEditor()

    // Clear existing content
    await cmEditor.clear()
    await seededPage.page.waitForTimeout(200)

    // Switch to Live Preview mode
    const liveBtn = seededPage.page.locator('button:has-text("Live")')
    await liveBtn.click()
    await seededPage.page.waitForTimeout(300)
  })

  test.describe('Basic Rendering', () => {
    test('LAT-E2E-01: Single-line display math renders in Live mode', async ({ seededPage }) => {
      // Type single-line display math
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()
      await seededPage.page.keyboard.type('$$E = mc^2$$')
      await seededPage.page.waitForTimeout(500)

      // Click away from the math block
      await seededPage.page.keyboard.press('End')
      await seededPage.page.keyboard.press('Enter')
      await seededPage.page.keyboard.type('Text after')
      await seededPage.page.waitForTimeout(300)

      // Verify KaTeX rendered output is visible
      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })

    test('LAT-E2E-02: Multi-line aligned equation renders in Live mode', async ({ seededPage }) => {
      // Type multi-line aligned equation
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const equation = `$$
\\begin{aligned}
f(x) &= x^2 + 2x + 1 \\\\
     &= (x + 1)^2
\\end{aligned}
$$`

      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(500)

      // Click away from the block
      await seededPage.page.keyboard.press('End')
      await seededPage.page.keyboard.press('Enter')
      await seededPage.page.keyboard.type('Text after equation')
      await seededPage.page.waitForTimeout(500)

      // Verify rendered math is visible
      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()

      // Verify raw LaTeX is hidden
      const rawLatex = seededPage.page.locator('text=/\\\\begin\\{aligned\\}/')
      await expect(rawLatex).not.toBeVisible()
    })

    test('LAT-E2E-03: System of equations renders correctly', async ({ seededPage }) => {
      const equation = `$$
\\begin{cases}
x + y = 5 \\\\
x - y = 1
\\end{cases}
$$`

      const editor = seededPage.page.locator('.cm-content')
      await editor.click()
      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(500)

      // Move cursor away
      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.waitForTimeout(300)

      // Verify rendering
      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })

    test('LAT-E2E-04: Matrix equation renders correctly', async ({ seededPage }) => {
      const equation = `$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
$$`

      const editor = seededPage.page.locator('.cm-content')
      await editor.click()
      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(500)

      // Move cursor away
      await seededPage.page.keyboard.press('End')
      await seededPage.page.keyboard.press('Enter')
      await seededPage.page.waitForTimeout(300)

      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })

    test('LAT-E2E-05: Integral with limits renders correctly', async ({ seededPage }) => {
      const equation = `$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$`

      const editor = seededPage.page.locator('.cm-content')
      await editor.click()
      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(500)

      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.waitForTimeout(300)

      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })
  })

  test.describe('Cursor-Based Reveal', () => {
    test('LAT-E2E-06: Clicking inside block reveals raw LaTeX', async ({ seededPage }) => {
      // Create a multi-line equation
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const equation = `Text before

$$
f(x) = x^2
$$

Text after`

      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(500)

      // Click on "Text after" to render the math
      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      // Verify math is rendered
      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()

      // Click inside the math block area (where the rendered math is)
      await mathWidget.click()
      await seededPage.page.waitForTimeout(300)

      // Raw LaTeX should now be visible
      const rawLatex = seededPage.page.locator('text=/\\$\\$/')
      await expect(rawLatex.first()).toBeVisible()
    })

    test('LAT-E2E-07: Moving cursor away re-renders math', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const equation = `$$
E = mc^2
$$`

      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(300)

      // Initially cursor is inside, raw LaTeX visible
      let rawLatex = seededPage.page.locator('text=/\\$\\$/')
      await expect(rawLatex.first()).toBeVisible()

      // Move cursor down and away
      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.waitForTimeout(300)

      // Math should now be rendered
      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()

      // Raw $$ should be hidden
      rawLatex = seededPage.page.locator('text=/^\\$\\$$/')
      await expect(rawLatex).not.toBeVisible()
    })

    test('LAT-E2E-08: Arrow keys navigate within revealed block', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const equation = `$$
Line 1 \\\\
Line 2 \\\\
Line 3
$$`

      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(300)

      // Navigate with arrow keys while inside block
      await seededPage.page.keyboard.press('ArrowUp')
      await seededPage.page.keyboard.press('ArrowUp')
      await seededPage.page.waitForTimeout(200)

      // Raw LaTeX should still be visible
      const rawLatex = seededPage.page.locator('text=/Line 1/')
      await expect(rawLatex).toBeVisible()
    })

    test('LAT-E2E-09: Editing inside block updates on cursor leave', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const equation = `$$
a = b
$$`

      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(300)

      // Edit the equation
      await seededPage.page.keyboard.press('ArrowUp')
      await seededPage.page.keyboard.press('End')
      await seededPage.page.keyboard.type(' + c')
      await seededPage.page.waitForTimeout(200)

      // Move cursor away
      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.keyboard.press('ArrowDown')
      await seededPage.page.waitForTimeout(300)

      // Updated math should render
      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })
  })

  test.describe('Multiple Blocks', () => {
    test('LAT-E2E-10: Multiple display math blocks render independently', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const content = `First equation:
$$
a = b
$$

Second equation:
$$
c = d
$$`

      await seededPage.page.keyboard.type(content)
      await seededPage.page.waitForTimeout(500)

      // Move cursor to end
      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      // Both math blocks should be visible
      const mathWidgets = seededPage.page.locator('.cm-math-display')
      await expect(mathWidgets).toHaveCount(2)
    })

    test('LAT-E2E-11: Clicking one block reveals only that block', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const content = `$$
First equation
$$

$$
Second equation
$$`

      await seededPage.page.keyboard.type(content)
      await seededPage.page.waitForTimeout(500)

      // Move to end to render both
      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      const mathWidgets = seededPage.page.locator('.cm-math-display')
      await expect(mathWidgets).toHaveCount(2)

      // Click first block
      await mathWidgets.first().click()
      await seededPage.page.waitForTimeout(300)

      // First block should show raw LaTeX
      const firstRaw = seededPage.page.locator('text=/First equation/')
      await expect(firstRaw).toBeVisible()

      // Second block should still be rendered
      await expect(mathWidgets.nth(1)).toBeVisible()
    })

    test('LAT-E2E-12: Consecutive blocks without blank lines work', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const content = `$$
a = b
$$
$$
c = d
$$`

      await seededPage.page.keyboard.type(content)
      await seededPage.page.waitForTimeout(500)

      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      const mathWidgets = seededPage.page.locator('.cm-math-display')
      await expect(mathWidgets).toHaveCount(2)
    })
  })

  test.describe('Mixed Content', () => {
    test('LAT-E2E-13: Inline math and display math coexist', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const content = `Inline: $E = mc^2$

Display:
$$
F = ma
$$`

      await seededPage.page.keyboard.type(content)
      await seededPage.page.waitForTimeout(500)

      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      // Both inline and display math should render
      const inlineMath = seededPage.page.locator('.cm-math-inline')
      const displayMath = seededPage.page.locator('.cm-math-display')

      await expect(inlineMath).toBeVisible()
      await expect(displayMath).toBeVisible()
    })

    test('LAT-E2E-14: Display math within text paragraphs', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const content = `Here is some text with an equation:

$$
\\int_a^b f(x) dx
$$

And more text after the equation.`

      await seededPage.page.keyboard.type(content)
      await seededPage.page.waitForTimeout(500)

      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })

    test('LAT-E2E-15: Display math with headings and lists', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const content = `# Math Section

- Point 1
- Point 2

$$
x^2 + y^2 = r^2
$$`

      await seededPage.page.keyboard.type(content)
      await seededPage.page.waitForTimeout(500)

      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })
  })

  test.describe('Mode Switching', () => {
    test('LAT-E2E-16: Switch to Source mode shows raw LaTeX', async ({ seededPage, cmEditor }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const equation = `$$
E = mc^2
$$`

      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(500)

      // Move cursor away to render
      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      // Verify rendered
      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()

      // Switch to Source mode
      const sourceBtn = seededPage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await seededPage.page.waitForTimeout(300)

      // Should show raw LaTeX in CodeMirror
      await cmEditor.waitForEditor()
      const content = await cmEditor.getTextContent()
      expect(content).toContain('$$')
      expect(content).toContain('E = mc^2')
    })

    test('LAT-E2E-17: Switch to Reading mode renders LaTeX', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const equation = `$$
\\frac{1}{2}
$$`

      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(500)

      // Switch to Reading mode
      const readingBtn = seededPage.page.locator('button:has-text("Reading")')
      await readingBtn.click()
      await seededPage.page.waitForTimeout(300)

      // Should render math in ReactMarkdown
      const prose = seededPage.page.locator('.prose')
      await expect(prose).toBeVisible()

      // KaTeX should be rendered (check for katex class)
      const katexDisplay = seededPage.page.locator('.katex-display')
      await expect(katexDisplay).toBeVisible()
    })

    test('LAT-E2E-18: Switching back to Live preserves content', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const equation = `$$
a^2 + b^2 = c^2
$$`

      await seededPage.page.keyboard.type(equation)
      await seededPage.page.waitForTimeout(300)

      // Switch to Source
      const sourceBtn = seededPage.page.locator('button:has-text("Source")')
      await sourceBtn.click()
      await seededPage.page.waitForTimeout(200)

      // Switch back to Live
      const liveBtn = seededPage.page.locator('button:has-text("Live")')
      await liveBtn.click()
      await seededPage.page.waitForTimeout(300)

      // Math should still render
      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })
  })

  test.describe('Edge Cases', () => {
    test('LAT-E2E-19: Very long multi-line equation renders', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const longEquation = `$$
\\begin{aligned}
${Array.from({ length: 10 }, (_, i) =>
  `line_{${i}} &= ${i} \\\\`
).join('\n')}
\\end{aligned}
$$`

      await seededPage.page.keyboard.type(longEquation)
      await seededPage.page.waitForTimeout(700)

      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(400)

      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })

    test('LAT-E2E-20: Deeply nested environments render', async ({ seededPage }) => {
      const editor = seededPage.page.locator('.cm-content')
      await editor.click()

      const nested = `$$
\\begin{aligned}
  \\begin{cases}
    \\begin{pmatrix}
      a & b \\\\
      c & d
    \\end{pmatrix}
  \\end{cases}
\\end{aligned}
$$`

      await seededPage.page.keyboard.type(nested)
      await seededPage.page.waitForTimeout(500)

      await seededPage.page.keyboard.press('End')
      await seededPage.page.waitForTimeout(300)

      const mathWidget = seededPage.page.locator('.cm-math-display')
      await expect(mathWidget).toBeVisible()
    })
  })
})
