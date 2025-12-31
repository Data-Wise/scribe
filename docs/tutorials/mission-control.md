# Mission Control Tutorial

> **Dashboard-first navigation for your writing workflow**

---

## What You'll Learn

- Navigate with Mission Control dashboard
- Understand project cards
- Use Quick Actions bar
- Switch between dashboard and editor
- Build an ADHD-friendly startup routine

**Time:** 8 minutes
**Prerequisites:** None

---

## What Is Mission Control?

**Mission Control** is Scribe's dashboard view that shows:

- 🎯 All your projects in a card grid
- ⚡ Quick Actions bar (Daily Note, New Note, Quick Capture)
- 📊 Project statistics (note count, last updated)
- 🚦 Status indicators (Active, Paused, Complete)

**ADHD benefits:**
- See everything at a glance (no hunting for files)
- Visual project cards (easier than text lists)
- One-click actions (reduced decision fatigue)

---

## Step 1: Open Mission Control

### From Anywhere

Press **⌘0** (Command + Zero)

**Result:** Dashboard view opens, showing all your projects.

### Smart Startup

Scribe automatically chooses where to start based on time since last use:

| Time Away | Scribe Opens |
|-----------|--------------|
| < 4 hours | Last open note (resume work) |
| ≥ 4 hours | Mission Control (fresh start) |

**Example:**
- **9am:** Open Scribe → Mission Control (morning start)
- **10am:** Close for coffee break
- **10:15am:** Reopen → Last note (same session)

---

## Step 2: Understanding Project Cards

### Card Layout

```
┌──────────────────────────────┐
│ 🔬 Mediation Analysis        │  ← Icon + Name
│                              │
│ Study on causal mediation... │  ← Description
│                              │
│ 🟢 Active | 12 notes         │  ← Status + Count
│ Updated: 2 hours ago         │  ← Timestamp
└──────────────────────────────┘
```

### Project Icons

| Icon | Type | Use Case |
|------|------|----------|
| 🔬 | Research | Academic research |
| 📚 | Teaching | Course materials |
| 📦 | R Package | Package development |
| 🛠️ | R Dev | Development tools |
| 📁 | Generic | General writing |

### Status Dots

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Active | Currently working |
| 🟡 Yellow | Paused | Temporarily on hold |
| 🔴 Red | Complete | Finished/archived |

---

## Step 3: Using Quick Actions

### Quick Actions Bar

Located at the top of Mission Control:

```
┌────────────────────────────────────────────────┐
│  📝 Daily Note  |  ➕ New Note  |  ⚡ Quick Capture  │
└────────────────────────────────────────────────┘
```

### Daily Note (⌘D)

**What it does:** Creates or opens today's daily note

**When to use:** Start of work session, morning planning

**Click:** Button in Quick Actions
**Keyboard:** ⌘D

### New Note (⌘N)

**What it does:** Creates new note in current project

**When to use:** Starting a new document, capturing an idea

**Click:** Button in Quick Actions
**Keyboard:** ⌘N

### Quick Capture (⌘⇧C)

**What it does:** Opens overlay for fast note creation

**When to use:** Quick idea without leaving current work

**Click:** Button in Quick Actions
**Keyboard:** ⌘⇧C

**Example:**

```
┌─────────────────────────────────┐
│ Quick Capture                    │
├─────────────────────────────────┤
│                                  │
│ Note Title: _                    │
│                                  │
│ Content:                         │
│ ┌─────────────────────────────┐ │
│ │ Your idea here...           │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                  │
│     [Cancel]    [Capture]        │
└─────────────────────────────────┘
```

**Result:** Note created, overlay closes, you're back to work.

---

## Step 4: Navigate Projects

### Click a Project Card

1. Click any project card
2. Sidebar switches to that project
3. Editor shows project's notes
4. Terminal uses project's directory

**Example:**

```
Click: 🔬 Mediation Analysis card
→ Sidebar shows: 12 notes from Mediation Analysis
→ Editor opens: Last note from this project
→ Terminal at: ~/projects/research/mediation-planning
```

### Project Card Menu

Hover over project card → **⚙️ Settings** icon appears

Click settings to:
- Edit project details
- Change working directory
- Archive project
- Delete project

---

## Step 5: Switch Between Views

### Dashboard → Editor

**Method 1:** Click a project card
**Method 2:** Click a note in sidebar (after selecting project)
**Method 3:** Press ⌘N (creates new note, switches to editor)

### Editor → Dashboard

**Method 1:** Press ⌘0
**Method 2:** Click "Mission Control" tab (first tab in editor)

**Note:** Mission Control is always the first tab (cannot close it).

---

## Step 6: Card Display Modes

### Grid View (Default)

```
┌──────┬──────┬──────┐
│ Proj │ Proj │ Proj │
│   1  │   2  │   3  │
├──────┼──────┼──────┤
│ Proj │ Proj │ Proj │
│   4  │   5  │   6  │
└──────┴──────┴──────┘
```

**Best for:** Visual overview, seeing many projects

### List View

```
┌────────────────────────────┐
│ 🔬 Project 1 | 🟢 12 notes │
├────────────────────────────┤
│ 📚 Project 2 | 🟡 45 notes │
├────────────────────────────┤
│ 📦 Project 3 | 🟢 8 notes  │
└────────────────────────────┘
```

**Best for:** Scanning names, compact view

**Toggle:** Click view switcher in Mission Control header

---

## Common Workflows

### Workflow 1: Morning Startup

```markdown
1. Open Scribe (⌘⇧N from anywhere)
   → Mission Control appears (> 4 hours since last use)

2. Review project cards
   - Which projects are Active?
   - What needs attention?

3. Click project you'll work on today
   → Switches to that project

4. Create daily note (⌘D)
   → Start writing today's plan

5. Open terminal (⌘⌥T)
   → Ready to run commands
```

### Workflow 2: Quick Idea Capture

```markdown
1. Working in editor on Note A

2. Get new idea for different project

3. Press ⌘⇧C (Quick Capture)
   → Overlay opens without disrupting work

4. Title: "New simulation idea"
5. Content: "What if we vary effect size?"
6. Click "Capture"
   → Note created, back to Note A

7. Continue working on Note A
```

### Workflow 3: Multi-Project Day

```markdown
**Morning (Research):**
1. ⌘0 (Mission Control)
2. Click: 🔬 Mediation Analysis
3. Work on research notes

**Afternoon (Teaching):**
4. ⌘0 (Mission Control)
5. Click: 📚 STAT 440 - Regression
6. Prepare lecture materials

**Evening (Writing):**
7. ⌘0 (Mission Control)
8. Click: 📁 Book Project
9. Write chapter draft
```

---

## Project Statistics

### Card Info

Each card shows:

| Metric | Meaning | Example |
|--------|---------|---------|
| **Note count** | Total notes in project | "12 notes" |
| **Last updated** | Time since last edit | "2 hours ago" |
| **Status** | Project state | 🟢 Active |
| **Color** | Custom indicator | Green dot |

### Sorting

Projects sort by:
1. **Status** (Active → Paused → Complete)
2. **Last updated** (most recent first)
3. **Name** (alphabetical within status)

---

## Troubleshooting

### Mission Control Shows No Projects

**Problem:** Empty grid, no project cards

**Solutions:**

1. Create your first project:
   - Click "+ New Project" button
   - Fill out form
   - Click "Create"

2. Check you're not in filtered view

3. Restart Scribe

### Can't See Project I Just Created

**Problem:** Created project but it's not visible

**Solutions:**

1. Refresh Mission Control (⌘0 twice)
2. Check project status isn't "Complete"
3. Verify project saved (check database)

### Quick Actions Don't Work

**Problem:** Buttons are grayed out or don't respond

**Solutions:**

1. Ensure at least one project exists
2. Daily Note requires active project
3. Check keyboard shortcuts aren't conflicting

---

## Advanced Tips

### Keyboard-Only Navigation

```bash
⌘0          # Open Mission Control
Tab         # Move between project cards
Enter       # Open selected project
⌘N          # New note (switches to editor)
⌘0          # Back to Mission Control
```

### Project Organization

**Group by status:**
- Active projects at top
- Paused in middle
- Complete at bottom

**Use colors:**
```json
{
  "color": "#3B82F6"  // Blue for research
  "color": "#10B981"  // Green for teaching
  "color": "#F59E0B"  // Orange for development
}
```

### Quick Project Access

**Most used projects:**
- Keep them Active
- They stay at top of grid
- Quick to access with ⌘0

**Archived projects:**
- Set status to Complete
- Still searchable
- Less visual clutter

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘0 | Toggle Mission Control |
| ⌘D | Daily Note (from Mission Control) |
| ⌘N | New Note (from Mission Control) |
| ⌘⇧C | Quick Capture overlay |
| ⌘F | Search across all projects |

---

## Next Steps

- **Explore:** Press ⌘0 and click each project card
- **Organize:** Set project statuses and colors
- **Use Quick Actions:** Try Daily Note and Quick Capture
- **Learn more:** [Project System Tutorial](./projects.md)

---

## See Also

- [Project System Tutorial](./projects.md) - Create and manage projects
- [Daily Notes Tutorial](./daily-notes.md) - Use daily notes
- [Command Palette Tutorial](./command-palette.md) - Quick actions
- [Keyboard Shortcuts](../guide/shortcuts.md) - All keyboard shortcuts
