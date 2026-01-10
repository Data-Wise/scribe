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
// Demo Projects
// ============================================================================

export const DEMO_PROJECTS = [
  {
    name: 'Getting Started',
    type: 'generic' as const,
    status: 'active' as const,
    description: 'Learn how to use Scribe with these example notes',
    color: '#3B82F6'
  },
  {
    name: 'Research Notes',
    type: 'research' as const,
    status: 'active' as const,
    description: 'Example research project showcasing vault pinning',
    color: '#8B5CF6'
  }
] as const

// Legacy export for compatibility
export const DEMO_PROJECT = DEMO_PROJECTS[0]

// ============================================================================
// Demo Tags
// ============================================================================

export const DEMO_TAGS = [
  { name: 'welcome', color: '#10B981' },
  { name: 'tutorial', color: '#8B5CF6' },
  { name: 'tips', color: '#F59E0B' },
  { name: 'phase3', color: '#EC4899' }
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

## Quick Start

- Press **⌘N** to create a new note
- Press **⌘D** to open today's daily note
- Press **⌘K** for command palette
- Press **Escape** to close panels

## Browser Mode

You're running Scribe in **browser mode** with IndexedDB storage.
Your notes persist even after refreshing the page!

## What's New: Phase 3 Vault Pinning

Check out the new vault pinning features:

- **Pin projects** for quick access in Mission Control
- **Icon mode** shows pinned projects as icons
- **Drag to reorder** your favorite projects
- **Max 5 pinned vaults** to stay focused

See [[Phase 3: Vault Pinning Guide]] to get started.

## Next Steps

1. Read [[Phase 3: Vault Pinning Guide]] to learn the new features
2. Try [[Icon Mode Tutorial]] to see compact project view
3. Browse [[Keyboard Shortcuts]] for productivity tips`
  },

  phase3Guide: {
    title: 'Phase 3: Vault Pinning Guide',
    folder: 'inbox',
    tags: ['tutorial', 'phase3'],
    content: `# Phase 3: Vault Pinning Guide

**What's New:** Quick access to your favorite projects with vault pinning!

## What is Vault Pinning?

Pin up to **5 projects** to Mission Control for instant access. Pinned projects appear at the top with special visual treatment.

## How to Pin a Project

1. **Right-click** (or Ctrl+click) on any project card
2. Select **"Pin to Mission Control"** from context menu
3. Project moves to top of Mission Control

> [!tip]
> You can pin up to 5 projects. After that, you'll need to unpin one before pinning another.

## Icon Mode

When you have pinned projects, try **Icon Mode**:

- Click the **grid icon** in Mission Control header
- Pinned projects show as **large icons**
- Other projects hide for less clutter
- Switch back to **Card Mode** anytime

See [[Icon Mode Tutorial]] for details.

## Managing Pinned Projects

### Reorder Pinned Projects
In Icon Mode, **drag icons** to reorder your favorites.

### Unpin a Project
Two ways to unpin:

1. **Context Menu:** Right-click → "Unpin from Mission Control"
2. **Settings:** Open Settings → Projects → Manage pinned projects

## Settings Integration

Open Settings (⌘,) to:

- View all pinned projects
- Quickly unpin projects
- See pin count (X/5)

See [[Settings: Pinned Projects]] for details.

## Quick Reference

| Action | How To |
|--------|--------|
| Pin project | Right-click → Pin to Mission Control |
| Unpin project | Right-click → Unpin / Settings → Projects |
| Reorder pinned | Drag icons in Icon Mode |
| Switch view | Click grid/card icon in header |

---

**Next:** Try [[Icon Mode Tutorial]] to see it in action!`
  },

  iconModeTutorial: {
    title: 'Icon Mode Tutorial',
    folder: 'inbox',
    tags: ['tutorial', 'phase3'],
    content: `# Icon Mode Tutorial

**Icon Mode** gives you a clean, focused view of your pinned projects.

## What is Icon Mode?

A compact view that shows:
- **Pinned projects** as large, colorful icons
- **Project names** below each icon
- **Clean layout** with no clutter

Unpinned projects are hidden in Icon Mode.

## When to Use Icon Mode

Icon Mode is perfect when you:
- Have 2-5 favorite projects you switch between
- Want zero distractions in Mission Control
- Need quick visual recognition of projects
- Prefer a dashboard-like interface

## How to Enable Icon Mode

1. Open **Mission Control** (⌘⇧M)
2. Look for the **view toggle** in the header (grid icon)
3. Click to switch between **Card** and **Icon** modes

> [!tip] Visual Cues
> - **Grid icon** = Currently in Card Mode (click to switch to Icon)
> - **List icon** = Currently in Icon Mode (click to switch to Card)

## Icon Mode Layout

Pinned projects appear as icons with:
- **Colorful icon** representing the project type
- **Project name** below the icon
- **Hover effect** for visual feedback
- **Click** to open the project

## Drag to Reorder

In Icon Mode, you can **drag icons** to reorder:

1. Click and hold an icon
2. Drag to new position
3. Drop to reorder

Your order is saved automatically.

## Switching Back to Card Mode

Click the **list icon** in the header to return to Card Mode.

Card Mode shows:
- All projects (pinned + unpinned)
- Project descriptions
- Note counts
- Last modified dates

---

**Next:** See [[Settings: Pinned Projects]] to manage your pinned projects.`
  },

  settingsPinnedProjects: {
    title: 'Settings: Pinned Projects',
    folder: 'inbox',
    tags: ['tutorial', 'phase3'],
    content: `# Settings: Pinned Projects

Manage your pinned projects from **Settings**.

## Opening Settings

Press **⌘,** (Command + Comma) or click the gear icon.

## Finding Pinned Projects

1. Open Settings
2. Navigate to **Projects** section
3. Look for **"Pinned Projects"** panel

## What You'll See

The Pinned Projects panel shows:

- **Count:** "3/5 projects pinned"
- **List:** All pinned projects with unpin buttons
- **Status:** Visual feedback when at max (5/5)

## Unpinning from Settings

1. Find the project in the list
2. Click the **X button** next to it
3. Project unpins immediately

> [!tip] Quick Access
> Settings is the fastest way to see all pinned projects at once.

## Pin Limit

- **Maximum:** 5 pinned projects
- **Why?** Keeps your workspace focused and ADHD-friendly
- **At limit:** Unpin one before pinning another

> [!note]
> The 5-project limit is intentional to prevent decision fatigue.

## Other Project Settings

While in Settings → Projects, you can also:

- View all projects
- Edit project details
- Create new projects
- Archive old projects

---

**Learn More:**
- [[Phase 3: Vault Pinning Guide]] - Full pinning guide
- [[Icon Mode Tutorial]] - Using Icon Mode
- [[Keyboard Shortcuts]] - Productivity shortcuts`
  },

  keyboardShortcuts: {
    title: 'Keyboard Shortcuts',
    folder: 'inbox',
    tags: ['tips', 'tutorial'],
    content: `# Keyboard Shortcuts

Master these shortcuts for maximum productivity.

## Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘N | New note |
| ⌘D | Daily note |
| ⌘K | Command palette |
| ⌘P | Switch projects |
| ⌘, | Settings |
| ⌘W | Close note |
| Escape | Close panels |

## Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘1 | Source mode |
| ⌘2 | Live mode |
| ⌘3 | Reading mode |
| ⌘E | Cycle editor modes |
| ⌘⇧F | Focus mode |
| ⌘? | Keyboard help |

## Mission Control

| Shortcut | Action |
|----------|--------|
| ⌘⇧M | Toggle Mission Control |
| Right-click | Context menu (pin/unpin) |
| Drag | Reorder in Icon Mode |

## Quick Capture

| Shortcut | Action |
|----------|--------|
| ⌘⇧C | Quick capture |
| ⌘⇧I | Capture to inbox |

## Search & Navigation

| Shortcut | Action |
|----------|--------|
| ⌘F | Search in note |
| ⌘⇧F | Global search |
| ⌘Click | Navigate WikiLink (Source mode) |
| Click | Navigate WikiLink (Live/Reading) |

---

**Tips:**
- Use ⌘K (command palette) when you forget a shortcut
- Press ⌘? to see all shortcuts anytime
- Most shortcuts work across all modes`
  },

  researchExample: {
    title: 'Research Project Example',
    folder: 'inbox',
    tags: ['tutorial'],
    content: `# Research Project Example

This note is part of the **Research Notes** project to demonstrate multi-project workflows.

## Using Multiple Projects

Projects help organize different areas of work:

- **Getting Started** - Tutorial notes (like this one)
- **Research Notes** - Example research project
- **Personal Journal** - Daily reflections
- **Work Projects** - Professional writing

## Pin Your Favorites

Right-click on the **Research Notes** project and select **"Pin to Mission Control"** to add it to your pinned list.

## Project-Specific Features

Each project can have:
- Custom **daily note templates**
- Unique **color schemes**
- Separate **tag namespaces**
- Independent **folder structures**

## Try It Out

1. Pin the **Research Notes** project
2. Switch to **Icon Mode** to see pinned projects
3. Click on **Research Notes** icon to open it
4. Create a new note in this project (⌘N)

---

**Tip:** Pin projects you access daily, keep others in Card Mode for occasional access.`
  },

  modeConsolidation: {
    title: 'v1.15.0: Mode Consolidation Testing',
    folder: 'inbox',
    tags: ['tutorial', 'phase3'],
    content: `# v1.15.0: Mode Consolidation Testing

**Feature:** Smart sidebar mode persistence and universal expansion (Phase 1 complete)

## What's New in Phase 1

### 1. Mode-Specific Width Memory

Each sidebar mode now remembers its own width:

- **Compact Mode** - Remembers last manual width (default 240px)
- **Card Mode** - Remembers last manual width (default 320px)
- **Icon Mode** - Always 48px (no custom width)

**Test:** Resize Compact to 260px, switch to Card, resize to 340px, then cycle back to Compact. Width should restore to 260px!

### 2. Smart Mode Persistence

The sidebar remembers your last expanded mode:

- Expanding from Icon → restores last mode (Compact or Card)
- Setting: "Remember sidebar mode on collapse" (coming in Phase 5)

**Test:** Expand to Card mode, collapse to Icon, expand again → should restore Card mode!

### 3. localStorage Tracking

Check browser DevTools → Application → Local Storage:

\`\`\`
scribe:lastExpandedMode = "card"
scribe:compactModeWidth = "260"
scribe:cardModeWidth = "340"
scribe:lastModeChangeTimestamp = "1736524800000"
\`\`\`

## Testing Checklist

### Basic Mode Switching

- [ ] Click sidebar to cycle: Icon → Compact → Card → Icon
- [ ] Press ⌘⇧[ to cycle modes
- [ ] Width changes correctly for each mode

### Width Memory

- [ ] Resize Compact to custom width (e.g., 250px)
- [ ] Switch to Card mode
- [ ] Resize Card to custom width (e.g., 350px)
- [ ] Switch back to Compact → width restored to 250px
- [ ] Switch to Card → width restored to 350px

### Last Mode Persistence

- [ ] Expand to Compact mode
- [ ] Collapse to Icon
- [ ] Expand again → should restore Compact
- [ ] Expand to Card mode
- [ ] Collapse to Icon
- [ ] Expand again → should restore Card

### localStorage Verification

Open DevTools (F12) → Application → Local Storage → localhost:

- [ ] \`scribe:lastExpandedMode\` updates when switching modes
- [ ] \`scribe:compactModeWidth\` updates when resizing Compact
- [ ] \`scribe:cardModeWidth\` updates when resizing Card
- [ ] \`scribe:lastModeChangeTimestamp\` updates on mode changes

## Coming in Phase 2 (Next)

- **Preset-aware cycling** - narrow: C↔I, wide: C→W→I
- **200ms debounce** - prevents rapid clicking spam
- **Settings integration** - width preset determines cycle pattern

## Coming in Future Phases

- **Phase 3:** Universal expansion (Inbox + Smart Folders)
- **Phase 5:** Settings UI (2 new toggles)
- **Phase 6:** Preset update dialog ("Don't ask again")
- **Phase 7:** Mode indicator (ActivityBar footer)
- **Phase 8:** Migration & polish

## Bug Reports

If you notice issues with Phase 1:

1. Open DevTools Console (F12)
2. Check for errors in localStorage operations
3. Verify state in useAppViewStore (React DevTools)
4. Report with specific steps to reproduce

---

**Status:** Phase 1 COMPLETE ✅
**Commit:** c655013
**Branch:** feat/sidebar-v2
**Next:** Phase 2 (Cycle Behavior)`
  }
} as const

// ============================================================================
// Wiki Links (for backlink demonstration)
// ============================================================================

export const DEMO_WIKI_LINKS = [
  { from: 'Welcome to Scribe', to: 'Phase 3: Vault Pinning Guide' },
  { from: 'Welcome to Scribe', to: 'Icon Mode Tutorial' },
  { from: 'Welcome to Scribe', to: 'Keyboard Shortcuts' },
  { from: 'Phase 3: Vault Pinning Guide', to: 'Icon Mode Tutorial' },
  { from: 'Phase 3: Vault Pinning Guide', to: 'Settings: Pinned Projects' },
  { from: 'Icon Mode Tutorial', to: 'Settings: Pinned Projects' },
  { from: 'Settings: Pinned Projects', to: 'Phase 3: Vault Pinning Guide' },
  { from: 'Settings: Pinned Projects', to: 'Icon Mode Tutorial' },
  { from: 'Settings: Pinned Projects', to: 'Keyboard Shortcuts' }
] as const

// ============================================================================
// Seed Data Summary (for logging)
// ============================================================================

export const SEED_DATA_SUMMARY = {
  projectCount: DEMO_PROJECTS.length,
  noteCount: Object.keys(DEMO_NOTES).length,
  tagCount: DEMO_TAGS.length,
  description: `${DEMO_PROJECTS.length} projects with ${Object.keys(DEMO_NOTES).length} notes and ${DEMO_TAGS.length} tags (Phase 3: Vault Pinning demo)`
}
