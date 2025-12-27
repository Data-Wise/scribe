# Features Overview

Scribe is designed with ADHD users in mind. Every feature follows the principle of **minimal friction** and **maximum focus**.

## Editor

### HybridEditor

The core of Scribe is the HybridEditor - a simple, distraction-free markdown editor:

- **Write Mode**: Plain textarea for reliable input
- **Preview Mode**: Rendered markdown with clickable links
- **Toggle**: Press `⌘E` to switch modes

### Focus Mode

Enter distraction-free mode with `⌘⇧F`:

- Sidebars collapse
- Editor centers on screen
- Only your words remain

Press `⌘⇧F` or `Escape` to exit.

### Word Count

Always visible in the status bar at the bottom. No clicks required.

## Wiki Links

Connect your notes with wiki-style links:

```markdown
See [[My Other Note]] for more details.
```

- Type `[[` to trigger autocomplete
- Click links in preview mode to navigate
- View backlinks in the right sidebar

## Tags

Organize notes with tags:

```markdown
This is about #research and #causal-inference.
```

- Type `#` to trigger autocomplete
- Tags get consistent colors based on name
- Filter notes by clicking tags in the sidebar

### Tags Panel

The Tags Panel (right sidebar, click "Tags" tab) provides powerful tag management:

**Views:**
- **Tree View**: Hierarchical display for nested tags (`research/statistics`)
- **Flat View**: Alphabetical list of all tags

**Features:**
- **Search**: Filter tags in real-time
- **Recent Tags**: Quick access to recently used tags
- **Compact Mode**: Reduce padding for more tags on screen
- **Note Counts**: See how many notes use each tag

**Tag Management:**
- Right-click any tag to **Rename** or **Delete**
- **Orphan Detection**: Unregistered `#tags` found in notes are highlighted
- **Register Tags**: One-click to add orphan tags to your tag library

### Hierarchical Tags

Use path notation for tag hierarchies:

```markdown
#research/statistics/mediation
#teaching/stat-440
```

Hierarchical tags appear as expandable trees in the Tags Panel.

## Daily Notes

Quick capture for daily thoughts:

- Press `⌘D` to open/create today's note
- Template auto-applied
- 5 built-in templates:
  - **Minimal**: Just the date heading
  - **Journaling**: Gratitude, focus, reflections
  - **Research**: Notes, papers, ideas sections
  - **Meeting**: Attendees, agenda, action items
  - **Focus**: Single priority with blockers

Configure templates in Settings → Writing → Daily Note Template.

## Knowledge Graph

Visualize connections between your notes:

- Access via command palette or ribbon
- Interactive D3 force-directed graph
- Notes appear as nodes, links as edges
- Pan, zoom, and click to navigate
- See clusters of related ideas

## Command Palette

Press `⌘K` for quick access to all features:

- Create New Note
- Open Daily Note
- Toggle Focus Mode
- Sync to Obsidian
- Ask Claude / Gemini

## AI Integration

Use your existing Claude and Gemini CLI subscriptions:

| Action | What it does |
|--------|--------------|
| **Improve** | Enhance clarity and flow |
| **Expand** | Develop the idea further |
| **Summarize** | Condense to key points |
| **Explain** | Simplify complex text |
| **Research** | Find related information |

No API keys needed - uses your CLI subscriptions.

## Global Hotkey

Open Scribe from anywhere: `⌘⇧N`

Works even when Scribe is minimized or closed.

## Empty State

When no note is selected, Scribe shows an engaging empty state:

- Animated pen icon
- "Ready to write" heading
- Quick action buttons (New Note, Daily Note)
- Random inspirational writing quote
- Command palette hint

## UI Polish

### Micro-interactions

All interactive elements provide tactile feedback:

- **Buttons**: Scale down slightly on click (0.95x)
- **Ribbon icons**: Press feedback with background change
- **Transitions**: Smooth 150ms animations

### Sidebar Tooltips

Hover over sidebar icons to see:

- Icon name
- Keyboard shortcut

Tooltips appear after 200ms delay to avoid flickering.

### Accessibility

Scribe respects your system preferences:

- **Reduced motion**: All animations disabled when `prefers-reduced-motion` is set
- **Screen readers**: Proper ARIA labels on all interactive elements
- **Keyboard navigation**: Full support for keyboard-only users

## Math Support

Write math using LaTeX syntax:

**Inline math:**
```markdown
The formula $E = mc^2$ is famous.
```

**Display math:**
```markdown
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

Powered by KaTeX for fast, native rendering.
