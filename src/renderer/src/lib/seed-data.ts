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
  { from: 'Callout Types', to: 'Features Overview' }
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
