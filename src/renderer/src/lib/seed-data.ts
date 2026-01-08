/**
 * Shared Demo Seed Data
 *
 * This file defines the demo data structure used for new users.
 * The same data is seeded in both:
 * - Browser mode: browser-db.ts uses this directly
 * - Tauri mode: database.rs migration 007 mirrors this structure
 *
 * SYNC NOTE: If you modify this file, update database.rs migration 007 to match.
 * Search for "Migration 007: Seed demo data" in src-tauri/src/database.rs
 */

// ============================================================================
// Demo Project
// ============================================================================

export const DEMO_PROJECT = {
  name: 'Getting Started',
  type: 'generic' as const,
  status: 'active' as const,
  description: 'Learn how to use Scribe with these example notes',
  color: '#3B82F6'
}

// ============================================================================
// Demo Tags
// ============================================================================

export const DEMO_TAGS = [
  { name: 'welcome', color: '#10B981' },
  { name: 'tutorial', color: '#8B5CF6' },
  { name: 'tips', color: '#F59E0B' },
  { name: 'quarto', color: '#2563EB' }
] as const

// ============================================================================
// Demo Notes
// ============================================================================

export const DEMO_NOTES = {
  welcome: {
    title: 'Welcome to Scribe',
    folder: 'inbox',
    tags: ['welcome', 'tutorial'],
    content: `# Welcome to Scribe! 👋

Scribe is an **ADHD-friendly distraction-free writer** designed to help you focus.

## Quick Tips

- Press **⌘N** to create a new note
- Press **⌘D** to open today's daily note
- Press **⌘P** to switch projects
- Press **Escape** to close panels

## Browser Mode

You're running Scribe in **browser mode** with IndexedDB storage.
Your notes persist even after refreshing the page!

## Getting Started

1. Create a new note with ⌘N
2. Start writing without distractions
3. Use #tags to organize your notes
4. Link notes with [[wiki links]]

See the [[Features Overview]] note for more details.`
  },

  features: {
    title: 'Features Overview',
    folder: 'inbox',
    tags: ['tutorial', 'tips'],
    content: `# Features Overview

Scribe includes powerful features for focused writing:

## Wiki Links

Link between notes using [[double brackets]]. Try clicking: [[Welcome to Scribe]]

## Tags

Organize with #tags like #research or #writing. Tags appear in the sidebar.

## Daily Notes

Press **⌘D** to open today's daily note - great for journaling or quick thoughts.

## Focus Mode

Press **⌘⇧F** to enter distraction-free focus mode.

## Keyboard Shortcuts

- **⌘K** - Command palette
- **⌘⇧C** - Quick capture
- **⌘?** - Keyboard shortcuts help

## Projects

Organize your notes into projects. Each project can have its own daily notes template.

## Callouts

Use callouts to highlight important information with colors and icons.

See the [[Callout Types]] for all supported callout types.

---

See the [[Daily Note Example]] for a sample daily note.`
  },

  daily: {
    title: 'Daily Note Example',
    folder: 'inbox',
    tags: ['tips'],
    content: `# Daily Note Example

This is what a daily note might look like:

## Morning Intentions
- [ ] Write for 30 minutes
- [ ] Review yesterday's notes
- [ ] Plan today's focus

## Notes & Ideas
*Capture thoughts throughout the day...*

## End of Day Reflection
*What went well? What to improve?*

---

💡 **Tip:** Press ⌘D any time to open today's daily note!`
  },

  callouts: {
    title: 'Callout Types',
    folder: 'inbox',
    tags: ['tutorial', 'tips'],
    content: `# Callout Types

Scribe supports Obsidian-style callouts for highlighting important information. Use the syntax \`> [!type]\` to create callouts.

## Informational Callouts

> [!note]
> This is a **note** callout. Use it for general information or side notes.

> [!info]
> This is an **info** callout. Perfect for additional context or explanations.

> [!abstract] Summary
> This is an **abstract** callout (also: summary, tldr). Great for executive summaries.

## Positive Callouts

> [!tip] Pro Tip
> This is a **tip** callout (also: hint, important). Share helpful suggestions!

> [!success] Well Done!
> This is a **success** callout (also: check, done). Celebrate achievements!

## Warning Callouts

> [!warning]
> This is a **warning** callout (also: caution, attention). Highlight potential issues.

> [!danger] Critical
> This is a **danger** callout (also: error). For critical warnings or errors.

> [!bug]
> This is a **bug** callout. Document known issues or bugs.

## Other Callouts

> [!question] FAQ
> This is a **question** callout (also: help, faq). Perfect for Q&A sections.

> [!example]
> This is an **example** callout. Show code examples or demonstrations.

> [!quote] Albert Einstein
> This is a **quote** callout (also: cite). Attribute quotes elegantly.

---

## Syntax Reference

\`\`\`markdown
> [!note]
> Basic callout with default title

> [!tip] Custom Title
> Callout with a custom title

> [!warning]
> Multi-line callouts work too.
> Just keep using > on each line.
\`\`\`

## Supported Types

| Type | Aliases | Color |
|------|---------|-------|
| note | - | Blue |
| info | - | Blue |
| tip | hint, important | Green |
| success | check, done | Green |
| warning | caution, attention | Orange |
| danger | error | Red |
| bug | - | Red |
| question | help, faq | Purple |
| example | - | Gray |
| quote | cite | Gray |
| abstract | summary, tldr | Cyan |

See also: [[Features Overview]]`
  },

  quarto: {
    title: '🧪 Quarto Autocomplete Test Page',
    folder: 'inbox',
    tags: ['tutorial', 'quarto'],
    content: `# 🧪 Quarto Autocomplete Test Page

**Welcome!** This page helps you test and explore Quarto's powerful autocomplete features.

> [!tip] Getting Started
> 1. Press **⌘1** to enter Source mode (required for autocomplete)
> 2. Try the examples below - autocomplete will appear as you type!
> 3. Press **Ctrl+Space** to manually trigger autocomplete anytime

---

## 📝 Test 1: YAML Frontmatter Autocomplete

**Instructions:** Place your cursor in the YAML section below (between the \`---\` lines) and start typing.

\`\`\`yaml
---
# Type "for" here to see format: completion
# Try: format, title, author, execute, bibliography, theme

# Example: Type "for" then accept "format:"
format:

# Try typing "tit" for title:
title:

# Try "exec" for execute options:
execute:
  echo:
  warning:

# More to try: cite-method, toc, code-fold, highlight-style
---
\`\`\`

**What to expect:**
- Type partial keys (e.g., "for") → Menu shows matching options ("format:")
- After colon, type partial values (e.g., "ht") → Menu shows "html", "pdf", etc.

---

## 💻 Test 2: Chunk Options Autocomplete

**Instructions:** Inside code blocks below, type \`#|\` followed by a space to see chunk options.

### Example 1: Figure with Multiple Options

\`\`\`{r}
#| label: fig-test-plot
#| fig-cap: "My test plot"
#| fig-width: 8
#| fig-height: 6
#| echo: false
#| warning: false

# Try adding more options here!
# Type "#| " (hash-pipe-space) below and explore:

plot(1:10)
\`\`\`

### Example 2: Try It Yourself!

\`\`\`python
# Add chunk options here:
# Type "#| " and try:
#   - echo (true/false)
#   - eval (true/false)
#   - output (true/false/asis)
#   - code-fold (true/false/show)

import matplotlib.pyplot as plt
plt.plot([1,2,3], [1,4,9])
\`\`\`

**What to expect:**
- \`#| \` (with space) → Menu shows all chunk options
- After option name, type value → Menu shows valid values (true/false, numbers, etc.)

---

## 🔗 Test 3: Cross-Reference Autocomplete

**Instructions:** Type \`@\` followed by a label prefix to see all matching references.

### Figures for Testing

![Test Figure 1](image1.png){#fig-example1}
![Test Figure 2](image2.png){#fig-example2}

\`\`\`{r}
#| label: fig-scatter
#| fig-cap: "Scatter plot example"
plot(rnorm(100), rnorm(100))
\`\`\`

### Tables for Testing

| Item | Value |
|------|-------|
| A    | 10    |
| B    | 20    |
{#tbl-data}

| Metric | Score |
|--------|-------|
| Speed  | 95%   |
{#tbl-performance}

### Sections for Testing

## Introduction {#sec-intro}

## Methods {#sec-methods}

## Results {#sec-results}

### Equations for Testing

$$
E = mc^2
$$ {#eq-einstein}

$$
y = mx + b
$$ {#eq-linear}

---

## 🎯 Now Try Cross-References!

Type \`@\` followed by a prefix below to see autocomplete:

- Figures: Type \`@fig\` to see all figures (@fig-example1, @fig-example2, @fig-scatter)
- Tables: Type \`@tbl\` to see all tables (@tbl-data, @tbl-performance)
- Sections: Type \`@sec\` to see all sections (@sec-intro, @sec-methods, @sec-results)
- Equations: Type \`@eq\` to see all equations (@eq-einstein, @eq-linear)

**Try it here:**



**What to expect:**
- \`@fig\` → Menu shows all figure labels with their captions
- \`@tbl\` → Menu shows all table labels
- \`@sec\` → Menu shows all section headers
- \`@eq\` → Menu shows all equation labels

---

## 📚 Complete Example Document

Here's a complete Quarto document showing all features together:

---
title: "My Analysis Report"
author: "Your Name"
format: html
execute:
  echo: true
  warning: false
toc: true
number-sections: true
---

# Introduction {#sec-intro}

This document demonstrates Quarto autocomplete features.

## Background

For methodology details, see @sec-methods.

# Methods {#sec-methods}

We use linear regression as shown in @eq-model.

$$
y = \\beta_0 + \\beta_1 x + \\epsilon
$$ {#eq-model}

\`\`\`{r}
#| label: fig-data-viz
#| fig-cap: "Data visualization"
#| fig-width: 7
#| echo: false

x <- 1:100
y <- 2*x + rnorm(100, sd=10)
plot(x, y, main="Sample Data")
\`\`\`

# Results {#sec-results}

The visualization in @fig-data-viz shows the relationship.

| Model | R² | P-value |
|-------|-----|---------|
| Linear | 0.92 | <0.001 |
{#tbl-stats}

Statistical results are in @tbl-stats.

---

## 🎓 Learning Tips

### YAML Frontmatter
- **40+ keys supported**: format, title, author, date, execute, bibliography, toc, theme, etc.
- **Smart value completion**: After typing key and colon, get relevant value suggestions
- **Nested options**: Works with nested YAML like \`execute: echo: false\`

### Chunk Options
- **30+ options**: echo, eval, warning, message, fig-width, fig-cap, label, etc.
- **Type-aware values**: Boolean options suggest true/false, numeric options suggest common sizes
- **Language agnostic**: Works in R, Python, Julia, JavaScript code blocks

### Cross-References
- **6 label types**: fig, tbl, eq, sec, lst, thm
- **Auto-detection**: Scans document for \`{#type-label}\` and \`#| label: type-label\`
- **Context hints**: Shows captions/titles in autocomplete detail panel
- **Fast scanning**: Handles 100+ labels instantly

---

## 🚀 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Trigger autocomplete | **Ctrl+Space** |
| Accept suggestion | **Enter** or **Tab** |
| Navigate options | **↑** / **↓** |
| Dismiss menu | **Escape** |
| Source mode | **⌘1** |
| Live Preview mode | **⌘2** |

---

## 🐛 Troubleshooting

**Autocomplete not appearing?**
1. Make sure you're in Source mode (**⌘1**)
2. Try **Ctrl+Space** to force trigger
3. Check you're in the right context (YAML block, code block, or typing \`@\`)

**Wrong suggestions?**
1. Verify cursor position (before/after special characters)
2. Check for proper spacing (e.g., \`#| \` needs space after pipe)

---

> [!success] All Set!
> You now know how to use Quarto autocomplete in Scribe. Happy writing! 📝

See [[Features Overview]] for more Scribe tips.`
  }
} as const

// ============================================================================
// Wiki Links (for backlink demonstration)
// ============================================================================

export const DEMO_WIKI_LINKS = [
  { from: 'Welcome to Scribe', to: 'Features Overview' },
  { from: 'Features Overview', to: 'Welcome to Scribe' },
  { from: 'Features Overview', to: 'Daily Note Example' },
  { from: 'Features Overview', to: 'Callout Types' },
  { from: 'Callout Types', to: 'Features Overview' },
  { from: 'Quarto Document Example', to: 'Features Overview' }
] as const

// ============================================================================
// Seed Data Summary (for logging)
// ============================================================================

export const SEED_DATA_SUMMARY = {
  projectCount: 1,
  noteCount: Object.keys(DEMO_NOTES).length,
  tagCount: DEMO_TAGS.length,
  description: `${DEMO_PROJECT.name} project with ${Object.keys(DEMO_NOTES).length} notes and ${DEMO_TAGS.length} tags`
}
