# Mission Control Layout Proposals

**Generated:** 2025-12-27
**Purpose:** Choose the right layout for Scribe's dashboard experience
**Decision needed:** Which approach best serves ADHD-friendly writing?

---

## Option A: Toggle View (Original Plan)

### Sketch
```
┌─────────────────────────────────────────────────────────────┐
│                    MISSION CONTROL                          │
│            3 projects • 15 pages • 12,400 words        [⚙️] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     [Today]    [New Page]    [Capture]    [New Project]     │
│                                                             │
│  ─────────────────── Recent Pages ───────────────────────   │
│  📄 Chapter 3 Draft ............................ 2h ago     │
│  📄 Methods Section ............................ yesterday  │
│  📄 Literature Notes ........................... 3 days     │
│                                                             │
│  ─────────────────── Projects ───────────────────────────   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ ● Research  │  │ ● Teaching  │  │ ● Blog      │          │
│  │   Paper     │  │   Notes     │  │   Posts     │          │
│  │             │  │             │  │             │          │
│  │  3 pages    │  │  12 pages   │  │  5 pages    │          │
│  │  2.4k words │  │  8.1k words │  │  1.2k words │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              Press ⌘0 to open editor                        │
└─────────────────────────────────────────────────────────────┘

        ⌘0 toggles to...

┌─────────────────────────────────────────────────────────────┐
│  Chapter 3 Draft                              [⌘0 Dashboard]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  The methodology for this study involves...                 │
│                                                             │
│  ## Data Collection                                         │
│                                                             │
│  We collected data from 150 participants...                 │
│                                                             │
│                                                             │
│                        [cursor]                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Words: 2,450  │  Reading: 8 min  │  Last saved: just now   │
└─────────────────────────────────────────────────────────────┘
```

### How It Works
- **Two completely separate views**: Dashboard OR Editor
- **⌘0** toggles between them
- Click project/page → switches to editor with that content
- Smart startup: >4 hours → Dashboard, <4 hours → Resume editor

### Pros
- **Maximum focus**: Editor has zero distractions
- **Clear mental model**: "I'm either browsing or writing"
- **Full-screen dashboard**: Plenty of room for projects/pages
- **ADHD-friendly**: One thing at a time

### Cons
- **Context switch**: Lose sight of project list while editing
- **Extra keystroke**: Need ⌘0 to see other projects
- **No quick glance**: Can't see project status while writing

---

## Option B: Shell with Collapsible Sidebar (Current Build)

### Sketch
```
EXPANDED MODE:
┌────────────────────────────────────────────────────────────────┐
│ Mission Control  │  3 projects • 15 pages • 12,400 words  [⚙️] │
├──────────────────┼─────────────────────────────────────────────┤
│ [Today] [New]    │                                             │
│ [Capture] [Find] │  Chapter 3 Draft                            │
├──────────────────┤                                             │
│ PROJECTS         │  The methodology for this study involves... │
│ ● Research Paper │                                             │
│   3 pages, 2.4k  │  ## Data Collection                         │
│ ○ Teaching Notes │                                             │
│   12 pages       │  We collected data from 150 participants... │
│ ○ Blog Posts     │                                             │
│   5 pages        │                                             │
│                  │                        [cursor]             │
│ [+ New Project]  │                                             │
├──────────────────┴─────────────────────────────────────────────┤
│ Recent: Chapter 3 • Methods • Literature      [⌘0 to collapse] │
└────────────────────────────────────────────────────────────────┘

COLLAPSED MODE (⌘0):
┌────────────────────────────────────────────────────────────────┐
│ ● Research Paper ▼  │ [Today] [+] [⚡]     [◎] [⚙️] [⌘0 expand] │
├─────────────────────┴──────────────────────────────────────────┤
│                                                                │
│  Chapter 3 Draft                                               │
│                                                                │
│  The methodology for this study involves...                    │
│                                                                │
│  ## Data Collection                                            │
│                                                                │
│  We collected data from 150 participants...                    │
│                                                                │
│                        [cursor]                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  15 pages  │  12,400 words                                     │
└────────────────────────────────────────────────────────────────┘
```

### How It Works
- **Editor always visible** with sidebar
- **⌘0** collapses/expands sidebar
- Projects panel shows all projects with stats
- Quick actions in header

### Pros
- **Always see projects**: Quick context while writing
- **No view switching**: Everything in one place
- **Familiar**: Like VS Code, Obsidian, etc.
- **Quick access**: Click project → see its pages

### Cons
- **Less focused**: Sidebar can be distracting
- **Smaller editor**: Sidebar takes horizontal space
- **More complex**: More UI elements to process
- **Not a true dashboard**: No "overview" moment

---

## Option C: Dashboard Home with Slide-Out Editor

### Sketch
```
HOME STATE (Dashboard is always "home"):
┌─────────────────────────────────────────────────────────────┐
│                    MISSION CONTROL                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     [Today]    [New Page]    [Capture]    [New Project]     │
│                                                             │
│  ─────────────── Recent Pages ────────────────────────────  │
│  📄 Chapter 3 Draft        ←── CLICK                        │
│  📄 Methods Section                                         │
│                                                             │
│  ─────────────── Projects ────────────────────────────────  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Research    │  │ Teaching    │  │ Blog        │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘

EDITING STATE (Editor slides over dashboard):
┌──────────┬──────────────────────────────────────────────────┐
│ ← Back   │  Chapter 3 Draft                            [⚙️] │
│          ├──────────────────────────────────────────────────┤
│ MISSION  │                                                  │
│ CONTROL  │  The methodology for this study involves...      │
│ (dimmed) │                                                  │
│          │  ## Data Collection                              │
│ Recent:  │                                                  │
│ • Ch 3 ◀ │  We collected data from 150 participants...      │
│ • Methods│                                                  │
│ • Lit    │                        [cursor]                  │
│          │                                                  │
│ Projects │                                                  │
│ • Rsrch  ├──────────────────────────────────────────────────┤
│ • Teach  │  Words: 2,450  │  ⌘← to go back                  │
└──────────┴──────────────────────────────────────────────────┘
```

### How It Works
- **Dashboard is always "home"**
- Click page → editor **slides over** (or overlays)
- **← Back** or **⌘←** returns to dashboard
- Dashboard stays partially visible (or fully hidden)

### Pros
- **Clear home base**: Always know where you are
- **Easy return**: One click/key to get back
- **Context preserved**: See where you came from
- **Mobile-like**: Familiar navigation pattern

### Cons
- **Animation overhead**: Slide transitions
- **Partial visibility**: Dashboard peek might distract
- **Different mental model**: Not traditional desktop app
- **Implementation complexity**: More state management

---

## Option D: Compact Header + Full Editor (Minimal)

### Sketch
```
┌─────────────────────────────────────────────────────────────┐
│ ● Research ▼ │ Chapter 3 Draft │ [Today][+][⚡][🔍]    [⚙️] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│  The methodology for this study involves...                 │
│                                                             │
│  ## Data Collection                                         │
│                                                             │
│  We collected data from 150 participants across             │
│  three different institutional settings...                  │
│                                                             │
│                                                             │
│                        [cursor]                             │
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  2,450 words │ 8 min read │ Saved │    [⌘K Command Palette] │
└─────────────────────────────────────────────────────────────┘

⌘K opens Command Palette (the "dashboard"):
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  🔍 Search pages, projects, commands...                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  QUICK ACTIONS                                              │
│  1. Create New Page ............................ ⌘N         │
│  2. Open Today's Journal ...................... ⌘D         │
│  3. Quick Capture ............................. ⌘⇧C        │
│                                                             │
│  RECENT PAGES                                               │
│  📄 Chapter 3 Draft ........................... 2h ago      │
│  📄 Methods Section ........................... yesterday   │
│  📄 Literature Notes .......................... 3 days      │
│                                                             │
│  PROJECTS                                                   │
│  📁 Research Paper (3 pages)                                │
│  📁 Teaching Notes (12 pages)                               │
│  📁 Blog Posts (5 pages)                                    │
└─────────────────────────────────────────────────────────────┘
```

### How It Works
- **Editor is always full-screen**
- **⌘K** opens command palette as the "dashboard"
- Project dropdown in header for quick switching
- Minimal chrome, maximum writing space

### Pros
- **Maximum writing space**: Nearly full screen
- **Keyboard-first**: Power users love this
- **No context switching**: Everything via ⌘K
- **Clean and minimal**: Very distraction-free

### Cons
- **Hidden navigation**: Must remember ⌘K
- **No visual overview**: Can't see projects at a glance
- **Steeper learning curve**: Need to learn shortcuts
- **Less discoverable**: New users might be lost

---

## Comparison Table

| Aspect | A: Toggle | B: Shell | C: Slide-Out | D: Minimal |
|--------|-----------|----------|--------------|------------|
| **Focus level** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Project visibility** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Ease of navigation** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **ADHD-friendly** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Implementation** | Medium | Done | Complex | Medium |
| **Familiarity** | Unique | VS Code-like | Mobile-like | Raycast-like |

---

## Recommendation

**For ADHD-focused writing app:** Option A (Toggle View)

Reasons:
1. **One thing at a time** - Core ADHD principle
2. **Clear mental states** - "I'm browsing" vs "I'm writing"
3. **Already partially built** - MissionControl.tsx exists
4. **Maximum focus** - Editor has zero distractions

**Second choice:** Option D (Minimal) if you want keyboard-first UX.

---

## Decision Needed

Which layout feels right for Scribe?

- [ ] **A: Toggle View** - Dashboard ⌘0 Editor (original plan)
- [ ] **B: Shell** - Sidebar + Editor (current build)
- [ ] **C: Slide-Out** - Dashboard home with editor overlay
- [ ] **D: Minimal** - Full editor + ⌘K command palette

---

**File saved:** Ready for your review
