# Schematic: Left Sidebar Redesign

**Generated:** 2025-12-28
**Status:** ✅ **PLAN B SELECTED** - Obsidian Style + Gradient Tabs
**Vision:** Obsidian-style file tree + Editor tabs + Pinned Mission Control

---

## Current vs Proposed Terminology

| Current | Proposed | Description |
|---------|----------|-------------|
| Projects | **Vaults** | Top-level containers (Research, Teaching, Personal) |
| - | **Workspace** | Active vault context |
| Folders | **Folders** | Organization within vaults |
| Notes | **Pages** | Individual documents |
| - | **Inbox** | Permanent capture location (always visible) |
| Mission Control | **Command Center** | Dashboard/HQ view |

---

## Schematic A: Full Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SCRIBE - Command Center                        │
├────────┬────────────────────────────────────────────────────┬───────────┤
│        │                                                    │           │
│  TAB   │                    EDITOR                          │   RIGHT   │
│  BAR   │                                                    │  SIDEBAR  │
│        │                                                    │           │
│ ┌────┐ │  ┌──────────────────────────────────────────────┐  │ Properties│
│ │ ⚡ │ │  │  Note Title                                  │  │ Backlinks │
│ └────┘ │  │                                              │  │ Tags      │
│        │  │  Content...                                  │  │           │
│ ┌────┐ │  │                                              │  │           │
│ │ 📥 │ │  │                                              │  │           │
│ │Inbox│ │  │                                              │  │           │
│ └────┘ │  │                                              │  │           │
│        │  │                                              │  │           │
│ ┌────┐ │  └──────────────────────────────────────────────┘  │           │
│ │ 🔬 │ │                                                    │           │
│ │Res │ │                                                    │           │
│ └────┘ │                                                    │           │
│        │                                                    │           │
│ ┌────┐ │                                                    │           │
│ │ 📚 │ │                                                    │           │
│ │Teach│ │                                                    │           │
│ └────┘ │                                                    │           │
│        │                                                    │           │
│ ┌────┐ │                                                    │           │
│ │ 📝 │ │                                                    │           │
│ │Pers │ │                                                    │           │
│ └────┘ │                                                    │           │
│        │                                                    │           │
│ ▔▔▔▔▔▔ │                                                    │           │
│ STATUS │                                                    │           │
│  BAR   │                                                    │           │
│ ┌────┐ │                                                    │           │
│ │ ⚙️ │ │                                                    │           │
│ └────┘ │                                                    │           │
└────────┴────────────────────────────────────────────────────┴───────────┘
```

---

## Schematic B: Left Tab Bar Detail (VS Code Style)

```
┌──────────┐
│   LOGO   │  ← App branding / Home button
│    ⚡    │
├──────────┤
│          │
│  ┌────┐  │  ← INBOX (Always visible, permanent)
│  │ 📥 │  │     • Quick capture destination
│  │  3 │  │     • Badge shows unprocessed count
│  └────┘  │
│          │
├──────────┤  ← Separator
│          │
│  ┌────┐  │  ← VAULT TABS (Switchable workspaces)
│  │ 🔬 │◀─│     Research vault (active indicator)
│  │ 12 │  │     Badge: page count or activity
│  └────┘  │
│          │
│  ┌────┐  │
│  │ 📚 │  │     Teaching vault
│  │  8 │  │
│  └────┘  │
│          │
│  ┌────┐  │
│  │ 📝 │  │     Personal vault
│  │  5 │  │
│  └────┘  │
│          │
│  ┌────┐  │
│  │ ➕ │  │  ← Add new vault
│  └────┘  │
│          │
├──────────┤  ← STATUS BAR (VS Code style)
│ ● Online │  ← Sync status
│ 🔥 7     │  ← Writing streak
│ 📊 1.2k  │  ← Total words today
├──────────┤
│  ┌────┐  │
│  │ ⚙️ │  │  ← Settings (bottom anchor)
│  └────┘  │
│          │
│  ┌────┐  │
│  │ 👤 │  │  ← Profile / Account
│  └────┘  │
└──────────┘
```

---

## Schematic C: Expanded Vault View (When Tab Selected)

```
┌──────────┬─────────────────────────┐
│  TAB BAR │     VAULT CONTENT       │
├──────────┼─────────────────────────┤
│          │                         │
│  ┌────┐  │  Research               │  ← Vault name header
│  │ 📥 │  │  ─────────────────────  │
│  └────┘  │                         │
│          │  📁 Mediation           │  ← Folders (expandable)
│  ┌────┐  │    └─ 📄 Draft v2       │
│  │ 🔬 │◀─│    └─ 📄 Methods        │
│  └────┘  │    └─ 📄 Results        │
│          │                         │
│  ┌────┐  │  📁 Collider            │
│  │ 📚 │  │    └─ 📄 Biostatistics  │
│  └────┘  │                         │
│          │  📁 Sensitivity         │
│  ┌────┐  │    └─ 📄 Analysis       │
│  │ 📝 │  │                         │
│  └────┘  │  ─────────────────────  │
│          │  📄 Recent Notes        │  ← Quick access section
│  ➕      │  📄 Pinned              │
│          │                         │
├──────────┤  ─────────────────────  │
│ STATUS   │  + New Page    ⌘N      │  ← Action button
│ ● Sync   │  + New Folder  ⌘⇧N     │
│ 🔥 7     │                         │
├──────────┤                         │
│  ⚙️  👤  │                         │
└──────────┴─────────────────────────┘
```

---

## Schematic D: Inbox Always-Visible Design

```
┌──────────┬─────────────────────────────────────────┐
│ TAB BAR  │                 EDITOR                  │
├──────────┼─────────────────────────────────────────┤
│          │                                         │
│  ┌────┐  │  ┌─────────────────────────────────┐   │
│  │ 📥 │──│──│  INBOX QUICK CAPTURE            │   │  ← Floating inbox
│  │  3 │  │  │  ┌─────────────────────────────┐│   │     accessible from
│  └────┘  │  │  │ Type to capture...     ⌘⇧C ││   │     any context
│    ▲     │  │  └─────────────────────────────┘│   │
│    │     │  │  ┌─────────────────────────────┐│   │
│ ALWAYS   │  │  │ • Unsorted idea 1           ││   │
│ VISIBLE  │  │  │ • Quick thought 2           ││   │
│    │     │  │  │ • Meeting note 3            ││   │
│    ▼     │  │  └─────────────────────────────┘│   │
│  ┌────┐  │  └─────────────────────────────────┘   │
│  │ 🔬 │  │                                         │
│  └────┘  │  Main editing area...                  │
│          │                                         │
│  ┌────┐  │                                         │
│  │ 📚 │  │                                         │
│  └────┘  │                                         │
│          │                                         │
└──────────┴─────────────────────────────────────────┘
```

---

## Schematic E: Status Bar Detail (VS Code Inspired)

```
┌────────────────────┐
│                    │
│    VAULT TABS      │
│       ...          │
│                    │
├────────────────────┤  ← STATUS BAR SECTION
│ ┌────────────────┐ │
│ │  ● Connected   │ │  ← Sync status (green dot)
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │  🔥 7 day      │ │  ← Writing streak
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │  📊 1,247      │ │  ← Words today
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │  📝 3 drafts   │ │  ← Active drafts
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │  ⏱️ 2h 15m     │ │  ← Session time
│ └────────────────┘ │
├────────────────────┤
│   ⚙️        👤    │  ← Settings & Profile
└────────────────────┘
```

---

## Proposed Vault Structure (Based on Your Workflow)

```
PERMANENT VAULTS (Cannot be deleted)
├── 📥 Inbox                    ← Quick capture, unsorted
│   └── (flat list, no folders)
│
WORKSPACE VAULTS (User-created)
├── 🔬 Research                 ← Academic research projects
│   ├── mediation-planning/
│   ├── product-of-three/
│   ├── collider/
│   └── sensitivity/
│
├── 📚 Teaching                 ← Course materials
│   ├── stat-440/
│   ├── causal-inference/
│   └── templates/
│
├── 📝 Personal                 ← Personal notes, journal
│   ├── daily/
│   ├── ideas/
│   └── reference/
│
└── 🛠️ Dev Tools               ← Development projects (optional)
    ├── scribe/
    └── mcp-servers/
```

---

## Color Scheme for Vaults

| Vault | Icon | Color | Accent |
|-------|------|-------|--------|
| Inbox | 📥 | `#f59e0b` | Amber/Orange |
| Research | 🔬 | `#3b82f6` | Blue |
| Teaching | 📚 | `#10b981` | Emerald |
| Personal | 📝 | `#a78bfa` | Purple |
| Dev | 🛠️ | `#6b7280` | Gray |

---

## Interactive Behaviors

### Tab Bar Interactions

| Action | Behavior |
|--------|----------|
| **Click tab** | Switch to vault, show folder tree |
| **Double-click tab** | Rename vault |
| **Right-click tab** | Context menu: Rename, Archive, Settings, Delete |
| **Drag tab** | Reorder vaults |
| **Hover tab** | Show tooltip with vault stats |
| **Click active tab** | Collapse to icon-only mode |

### Inbox Interactions

| Action | Behavior |
|--------|----------|
| **Click inbox icon** | Toggle inbox panel |
| **⌘⇧C** | Quick capture to inbox |
| **Drag from inbox** | Move to vault/folder |
| **Right-click item** | Process: Move, Tag, Delete |

### Status Bar Interactions

| Element | Click Action |
|---------|--------------|
| Sync status | Open sync settings |
| Streak | Show streak history |
| Words | Show writing stats |
| Session | Show session details |

---

## Implementation Phases

### Phase 1: Core Structure
- [ ] Rename Projects → Vaults in codebase
- [ ] Add permanent Inbox vault
- [ ] Create TabBar component
- [ ] Basic vault switching

### Phase 2: Visual Design
- [ ] Implement VS Code-style tab bar
- [ ] Add status bar section
- [ ] Vault icons and colors
- [ ] Badge counts

### Phase 3: Interactions
- [ ] Right-click context menus
- [ ] Drag-and-drop reordering
- [ ] Quick capture (⌘⇧C)
- [ ] Keyboard navigation

### Phase 4: Polish
- [ ] Animations and transitions
- [ ] Tooltip hints
- [ ] Onboarding for new structure
- [ ] Migration path for existing data

---

## Questions to Resolve

1. **Inbox visibility**: Always expanded, or collapsible?
2. **Status bar items**: Which stats are most valuable?
3. **Vault limit**: Should there be a max number of vaults?
4. **Default vaults**: Pre-create Research/Teaching/Personal?
5. **Folder depth**: Limit nesting levels for ADHD-friendliness?

---

## ASCII Art: Final Vision

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ⚡ SCRIBE                                    │
├─────────┬──────────────────────────────────────────────────┬─────────┤
│         │                                                  │         │
│  ⚡     │  Research > Mediation > Draft v2                 │ Props   │
│  ────   │  ═══════════════════════════════════════════     │ Links   │
│  📥  3  │                                                  │ Tags    │
│  ────   │  # Methods Section                               │         │
│  🔬 ●12 │                                                  │ created │
│  📚   8 │  We propose a novel approach to mediation        │ Dec 28  │
│  📝   5 │  analysis that addresses...                      │         │
│  ────   │                                                  │ words   │
│  ➕     │                                                  │ 1,247   │
│         │                                                  │         │
│ ▔▔▔▔▔▔▔ │                                                  │         │
│ ● Sync  │                                                  │         │
│ 🔥 7    │                                                  │         │
│ 📊 1.2k │                                                  │         │
│ ────    │                                                  │         │
│  ⚙️  👤 │  Source    ⌘E                 1,247 words       │         │
└─────────┴──────────────────────────────────────────────────┴─────────┘
```

---

# ALTERNATIVE PLANS

---

## Plan A: Hybrid Design (Original - Above)

**Style:** VS Code activity bar + Obsidian file tree
**Best for:** Power users who want both quick access and deep navigation

---

## Plan B: Pure Obsidian Style ✅ SELECTED

**Style:** Full file tree with collapsible vaults
**Best for:** Users familiar with Obsidian, prefer traditional file navigation
**Status:** This is the chosen implementation approach

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚡ SCRIBE                                              [―] [□] [×]         │
├─────────────────────┬───────────────────────────────────────────┬───────────┤
│                     │  ┌─────────────────────────────────────┐  │           │
│  VAULTS             │  │ 🏠 Mission Control          📌 ✕   │  │  RIGHT    │
│  ─────────────────  │  ├─────────────────────────────────────┤  │  SIDEBAR  │
│                     │  │ 📄 Methods Draft            ✕       │  │           │
│  ▼ 📥 Inbox (3)     │  │ 📄 Results Section          ✕       │  │           │
│    • Quick note 1   │  └─────────────────────────────────────┘  │           │
│    • Idea capture   │                                           │           │
│    • Meeting note   │  ═══════════════════════════════════════  │           │
│                     │                                           │           │
│  ▼ 🔬 Research      │  # Methods Section                        │           │
│    ▼ 📁 Mediation   │                                           │           │
│      📄 Draft v2    │  We propose a novel approach to           │           │
│      📄 Methods  ●  │  mediation analysis that addresses...     │           │
│      📄 Results     │                                           │           │
│    ▶ 📁 Collider    │                                           │           │
│    ▶ 📁 Sensitivity │                                           │           │
│                     │                                           │           │
│  ▶ 📚 Teaching      │                                           │           │
│  ▶ 📝 Personal      │                                           │           │
│                     │                                           │           │
│  ─────────────────  │                                           │           │
│  + New Vault        │                                           │           │
│                     │                                           │           │
├─────────────────────┤                                           │           │
│ 🔥 7 │ 📊 1.2k │ ●  │  Source ⌘E              1,247 words      │           │
└─────────────────────┴───────────────────────────────────────────┴───────────┘
```

### Plan B Features:
- **Full tree view** - All vaults visible, expandable
- **Inline file list** - No separate panel needed
- **Horizontal status bar** at bottom
- **Tab bar** in editor for open files
- **Mission Control pinned** as first tab (📌 icon)

---

## Plan C: Pure VS Code Style

**Style:** Activity bar + Explorer panel + Editor tabs
**Best for:** Developers, users of VS Code/IDEs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚡ SCRIBE                                              [―] [□] [×]         │
├────┬────────────────┬───────────────────────────────────────────┬───────────┤
│    │                │  ┌─────────────────────────────────────┐  │           │
│ 🏠 │  EXPLORER      │  │ 🏠 Mission Control   📌│📄 Methods ✕│  │  OUTLINE  │
│    │  ───────────   │  └─────────────────────────────────────┘  │  ───────  │
│ 📥 │                │                                           │           │
│ 3  │  🔬 RESEARCH   │  ═══════════════════════════════════════  │  # H1     │
│    │  ▼ Mediation   │                                           │  ## H2    │
│ 🔬 │    Draft v2    │  # Methods Section                        │  ### H3   │
│ ●  │    Methods  ●  │                                           │           │
│    │    Results     │  We propose a novel approach to           │  PROPS    │
│ 📚 │  ▶ Collider    │  mediation analysis that addresses...     │  ───────  │
│    │  ▶ Sensitivity │                                           │  created  │
│ 📝 │                │                                           │  modified │
│    │  📚 TEACHING   │                                           │  words    │
│    │  (collapsed)   │                                           │           │
│ 🔍 │                │                                           │  TAGS     │
│    │  📝 PERSONAL   │                                           │  ───────  │
│ ⚙️ │  (collapsed)   │                                           │  #stats   │
│    │                │                                           │  #method  │
├────┼────────────────┤                                           │           │
│ ●  │ Sync OK        │  Source ⌘E              1,247 words      │           │
└────┴────────────────┴───────────────────────────────────────────┴───────────┘
```

### Plan C Features:
- **Narrow activity bar** (icons only, ~48px)
- **Explorer panel** expands from activity bar
- **Multiple views**: Explorer, Search, Settings
- **Editor tabs** with pinned Mission Control
- **Right sidebar** for outline + properties
- **Bottom status bar** spans full width

---

# EDITOR TAB DESIGN

## Pinned Mission Control (Always First Tab)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EDITOR TAB BAR                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐ ┌─────────────────┐ ┌─────────────────┐              │
│  │ 🏠 Mission Control│ │ 📄 Methods Draft │ │ 📄 Results      │   ···       │
│  │        📌        │ │              ✕  │ │              ✕  │              │
│  └──────────────────┘ └─────────────────┘ └─────────────────┘              │
│        PINNED           ACTIVE (highlight)    INACTIVE                     │
│     (cannot close)       (visible content)                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Fashionable Tab Styles

### Style 1: Pill Tabs (Modern/Notion-like)
```
  ╭──────────────────╮ ╭─────────────────╮ ╭─────────────────╮
  │ 🏠 Mission  📌   │ │ 📄 Methods   ✕  │ │ 📄 Results   ✕  │
  ╰──────────────────╯ ╰─────────────────╯ ╰─────────────────╯
       Active              Hover               Default
    (filled bg)        (subtle border)       (transparent)
```

### Style 2: Underline Tabs (Clean/Minimal)
```
   🏠 Mission 📌     📄 Methods ✕      📄 Results ✕
   ▔▔▔▔▔▔▔▔▔▔▔▔▔     ▔▔▔▔▔▔▔▔▔▔▔
      Active            Hover            Default
   (accent line)     (subtle line)     (no line)
```

### Style 3: Card Tabs (Elevated/Material)
```
  ┌──────────────────┐
  │ 🏠 Mission  📌   │  ┌─────────────────┐  ─────────────────
  │                  │  │ 📄 Methods   ✕  │  📄 Results   ✕
  └──────────────────┘  └─────────────────┘
       Active               Hover              Default
   (elevated card)      (slight lift)       (flat/inline)
```

### Style 4: Arc Browser Style (Vertical + Compact)
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 🏠 │ │ 📄 │ │ 📄 │ │ 📄 │
│ 📌 │ │ Me │ │ Re │ │ Da │
└────┘ └────┘ └────┘ └────┘
Pinned  ...truncated titles...
```

### ⭐ Style 5: Gradient Accent (Recommended)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Tab Bar with gradient accent on active tab                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀┐                                                      │
│  │ 🏠 Mission    📌  │  📄 Methods ✕    📄 Results ✕    📄 Draft ✕         │
│  └───────────────────┘                                                      │
│   ↑ Gradient top      ↑ Subtle hover    ↑ Muted text                       │
│   border (accent)     on mouseover                                          │
│                                                                             │
│  Active tab has:                                                            │
│  • Gradient top border (vault color)                                        │
│  • Slightly elevated background                                             │
│  • Bold text                                                                │
│  • No close button (pinned) or ✕ visible                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mission Control as Home Tab

### Pinned Behavior
- **Always first position** - Cannot be reordered
- **Cannot be closed** - 📌 icon instead of ✕
- **Click when active** - Refreshes dashboard
- **Keyboard shortcut** - ⌘1 always goes to Mission Control

### Mission Control Content (When Active)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────┐ ┌─────────────────┐                                  │
│  │ 🏠 Mission    📌  │ │ 📄 Methods   ✕  │                                  │
│  └──────────────────┘ └─────────────────┘                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                      MISSION CONTROL                                        │
│                      ════════════════                                       │
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │   TODAY     │  │  NEW PAGE   │  │   CAPTURE   │  │  NEW VAULT  │       │
│   │     📅      │  │     📄      │  │     ⚡      │  │     📁      │       │
│   │    ⌘D      │  │    ⌘N      │  │    ⌘⇧C     │  │    ⌘⇧V     │       │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│   RECENT PAGES                          WRITING STATS                       │
│   ─────────────                         ─────────────                       │
│   📄 Methods Draft      2m ago          🔥 7 day streak                     │
│   📄 Results Section    1h ago          📊 1,247 words today               │
│   📄 Daily Note         3h ago          📈 Week: 8,432 words               │
│   📄 Meeting Notes      1d ago          ⏱️ 2h 15m session                   │
│                                                                             │
│   INBOX (3 items)                       ACTIVE PROJECTS                     │
│   ───────────────                       ────────────────                    │
│   • Quick capture idea                  🔬 Mediation - Methods             │
│   • Meeting follow-up                   📚 STAT 440 - Lecture 12           │
│   • Research thought                    📝 Blog post draft                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tab Interactions

| Action | Behavior |
|--------|----------|
| **Click tab** | Switch to that page |
| **Middle-click tab** | Close tab (except pinned) |
| **Right-click tab** | Context menu |
| **Drag tab** | Reorder (except pinned stays first) |
| **Double-click tab** | Rename page (if editable) |
| **⌘W** | Close current tab |
| **⌘⇧T** | Reopen last closed tab |
| **⌘1-9** | Switch to tab by position |
| **⌘Tab** | Cycle through tabs |
| **Scroll on tab bar** | Scroll through overflow tabs |

### Tab Context Menu
```
┌─────────────────────┐
│ Close               │
│ Close Others        │
│ Close All           │
├─────────────────────┤
│ Pin Tab         📌  │
│ Duplicate Tab       │
├─────────────────────┤
│ Move to New Window  │
│ Copy Path           │
├─────────────────────┤
│ Rename...           │
│ Open in Finder      │
└─────────────────────┘
```

---

## Comparison Matrix

| Feature | Plan A (Hybrid) | Plan B (Obsidian) | Plan C (VS Code) |
|---------|-----------------|-------------------|------------------|
| Activity bar | ✅ Vertical icons | ❌ | ✅ Narrow icons |
| File tree | ✅ In expanded panel | ✅ Always visible | ✅ Explorer panel |
| Status bar | ✅ In activity bar | ✅ Bottom horizontal | ✅ Bottom horizontal |
| Vault tabs | ✅ Icon tabs | ❌ Collapsible sections | ✅ Explorer sections |
| Editor tabs | ❌ Single view | ✅ Multiple tabs | ✅ Multiple tabs |
| Mission Control | Dashboard view | 📌 Pinned tab | 📌 Pinned tab |
| Learning curve | Medium | Low (familiar) | Medium |
| Screen space | Efficient | Uses more width | Most flexible |

---

## Decision: Plan B Selected ✅

### Chosen Approach: Plan B (Obsidian) + Style 5 (Gradient Tabs)

**Why:**
1. **Familiar** - Users know Obsidian/file tree pattern
2. **ADHD-friendly** - Everything visible, no hidden panels
3. **Fashionable tabs** - Modern look without complexity
4. **Pinned Mission Control** - Always-accessible home base

---

# IMPLEMENTATION PLAN

## Phase 1: Editor Tabs (Priority 1) ✅ COMPLETE

**Completed:** 2025-12-28

### 1.1 Create EditorTabs Component ✅
```
src/renderer/src/components/
├── EditorTabs/
│   ├── EditorTabs.tsx        # Main tab bar component (105 lines)
│   ├── EditorTabs.css        # Gradient accent styling (200 lines)
│   └── index.ts
```

### 1.2 Tab State Management ✅
```typescript
// Added to useAppViewStore.ts
export type TabType = 'mission-control' | 'note'

export interface EditorTab {
  id: string
  type: TabType
  noteId?: string
  title: string
  isPinned: boolean
}

// Actions: openTab, openNoteTab, closeTab, setActiveTab,
// reorderTabs, pinTab, unpinTab, updateTabTitle
// localStorage persistence for openTabs and activeTabId
```

### 1.3 Tab Features
- [x] Gradient accent on active tab (Style 5)
- [x] Mission Control always pinned first
- [x] Close button (✕) on hover
- [x] Middle-click to close
- [x] Drag to reorder (state ready, UI pending)
- [ ] Tab context menu (deferred)
- [x] ⌘1-9 keyboard shortcuts
- [x] ⌘W to close (non-pinned only)
- [ ] ⌘⇧T to reopen (deferred)

---

## Phase 2: Left Sidebar Restructure (Priority 2)

### 2.1 Rename Projects → Vaults
```
Files to update:
- types.ts: Project → Vault
- useProjectsStore.ts → useVaultsStore.ts
- All components referencing "project"
```

### 2.2 New Sidebar Structure
```
src/renderer/src/components/sidebar/
├── VaultSidebar/
│   ├── VaultSidebar.tsx      # Main container
│   ├── VaultSection.tsx      # Collapsible vault
│   ├── FolderTree.tsx        # File/folder tree
│   ├── InboxSection.tsx      # Permanent inbox
│   └── index.ts
```

### 2.3 Vault Features
- [ ] Permanent Inbox (cannot delete)
- [ ] Collapsible vault sections
- [ ] Folder tree within each vault
- [ ] Drag files between vaults/folders
- [ ] Right-click context menus
- [ ] Badge counts (unread/items)

---

## Phase 3: Status Bar (Priority 3)

### 3.1 Bottom Status Bar
```
src/renderer/src/components/
├── StatusBar/
│   ├── StatusBar.tsx         # Horizontal bottom bar
│   ├── SyncStatus.tsx        # ● Connected
│   ├── StreakIndicator.tsx   # 🔥 7
│   ├── WordCount.tsx         # 📊 1,247
│   └── index.ts
```

### 3.2 Status Items
- [ ] Sync status (●/○)
- [ ] Writing streak (🔥)
- [ ] Words today (📊)
- [ ] Session time (⏱️)
- [ ] Editor mode (Source/Live/Reading)

---

## Phase 4: Mission Control Updates (Priority 4)

### 4.1 Update Dashboard Content
- [ ] Quick action buttons (Today, New Page, Capture, New Vault)
- [ ] Recent pages list
- [ ] Writing stats panel
- [ ] Inbox preview
- [ ] Active projects

### 4.2 Pinned Tab Behavior
- [ ] Always first position
- [ ] Cannot be closed (📌 icon)
- [ ] ⌘1 shortcut
- [ ] Refresh on click when active

---

## File Changes Summary

| Current | New | Action |
|---------|-----|--------|
| `Project` type | `Vault` type | Rename |
| `useProjectsStore` | `useVaultsStore` | Rename |
| `MissionSidebar` | `VaultSidebar` | Restructure |
| - | `EditorTabs` | New component |
| - | `StatusBar` | New component |
| `App.tsx` | Update layout | Add tabs + status bar |

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: Editor Tabs | 1-2 days | None |
| Phase 2: Vault Sidebar | 2-3 days | Phase 1 |
| Phase 3: Status Bar | 0.5 day | None |
| Phase 4: Mission Control | 1 day | Phase 1, 2 |

**Total: ~5-6 days**

---

## Next Immediate Steps

### Phase 1: Editor Tabs ✅ COMPLETE (2025-12-28)
1. [x] Create `EditorTabs` component with gradient style
2. [x] Add tab state to `useAppViewStore`
3. [x] Integrate tabs into `App.tsx` layout
4. [x] Test pinned Mission Control behavior
5. [x] Add keyboard shortcuts (⌘1-9, ⌘W)

### Phase 2: Vault Sidebar (Next)
1. [ ] Transform MissionSidebar into Obsidian-style file tree
2. [ ] Add collapsible vault sections
3. [ ] Implement folder tree within vaults
4. [ ] Add permanent Inbox section

### Phase 3: Status Bar
1. [ ] Create horizontal bottom status bar
2. [ ] Add sync status, streak, words today
3. [ ] Add editor mode indicator

---

*Decision made: 2025-12-28*
*Plan B (Obsidian Style) + Style 5 (Gradient Tabs)*
*Phase 1 Complete: 2025-12-28*
*Saved to: `SCHEMATIC-LEFT-SIDEBAR-REDESIGN.md`*
