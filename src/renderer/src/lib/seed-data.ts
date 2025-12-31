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

import { markdownSyntaxDemo } from './demo-markdown-syntax'

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
  { name: 'tips', color: '#F59E0B' }
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

## More Examples

- [[Daily Note Example]] - Sample daily note template
- [[Callout Examples]] - Learn about styled callout blocks`
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
    title: 'Callout Examples',
    folder: 'inbox',
    tags: ['tutorial', 'tips'],
    content: `# Callout Examples

Callouts (also called admonitions) help highlight important information with styled blocks.

## Basic Callouts

> [!note] Note Callout
> This is a note callout with a blue theme. Great for general information and tips.

> [!tip] Tip Callout
> This is a tip callout with a cyan theme. Use it for helpful suggestions and pro tips.

> [!warning] Warning Callout
> This is a warning callout with a yellow/amber theme. Good for cautionary information.

> [!danger] Danger Callout
> This is a danger callout with a red theme. Use for critical warnings and errors.

## More Callout Types

> [!info] Information
> Additional information that's useful to know.

> [!success] Success!
> Something completed successfully or a positive outcome.

> [!question] Question
> Pose a question or highlight something unclear.

> [!example] Example
> Show a code example or demonstration.

> [!quote] Quote
> Highlight a quotation or reference.

> [!bug] Known Bug
> Document a known issue or bug.

> [!abstract] Summary
> Provide a summary or abstract of content.

## Custom Titles

> [!tip] Pro Tip: Keyboard Shortcuts
> Press **⌘E** to cycle through editor modes (Source → Live → Reading).

> [!warning] Before You Start
> Make sure to save your work regularly, even though Scribe auto-saves.

## Nested Content

> [!note] Callouts Support Markdown
> You can use **bold**, *italic*, and \`code\` inside callouts.
>
> - Bullet lists work
> - Multiple paragraphs too
>
> Even code blocks:
> \`\`\`javascript
> console.log("Hello from a callout!");
> \`\`\`

## Testing Instructions

To test callouts:
1. Switch to **Reading mode** (⌘3 or click "Reading" tab)
2. Callouts should display with:
   - Colored backgrounds and borders
   - Type-specific icons
   - Proper styling for dark/light themes
3. Switch back to **Source mode** (⌘1) to see the markdown syntax

## Syntax Reference

\`\`\`markdown
> [!type] Optional Title
> Content goes here
> Can span multiple lines
\`\`\`

**Available types:** note, tip, warning, danger, info, success, question, example, quote, bug, abstract, summary, tldr, important, hint, caution, attention, error, failure, fail, missing, check, done, help, faq, cite`
  },

  markdown: {
    title: 'Markdown Syntax Demo',
    folder: 'inbox',
    tags: ['tutorial', 'tips'],
    content: markdownSyntaxDemo
  }
} as const

// ============================================================================
// Wiki Links (for backlink demonstration)
// ============================================================================

export const DEMO_WIKI_LINKS = [
  { from: 'Welcome to Scribe', to: 'Features Overview' },
  { from: 'Features Overview', to: 'Welcome to Scribe' },
  { from: 'Features Overview', to: 'Daily Note Example' }
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
