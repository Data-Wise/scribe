# Project Dashboard Brainstorm

**Context:** When selecting a project in the sidebar, what should happen?

---

## Current Behavior
- Click project → expands to show notes inline
- No project overview/stats visible
- Feels like "just a folder"

---

## Options

### Option A: Contextual Header Bar
**Effort:** Medium

When a project is selected, a slim header appears above the editor:

```
┌─────────────────────────────────────────────────────────┐
│ 📁 Test Project    ●●●○○ 60%    12 notes • 4.2k words │
│ "Research manuscript on causal inference"               │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  [Editor content here]                                  │
```

**Pros:** Non-intrusive, always visible context
**Cons:** Takes vertical space

---

### Option B: Sidebar Transform
**Effort:** Medium

When project is selected, the sidebar top section transforms:

```
┌──────────────────┐
│ ← All Projects   │  (back button)
├──────────────────┤
│ 📁 Test Project  │
│ ●●●○○ 60%       │
│ 12 notes • 4.2k  │
│ Updated 2h ago   │
├──────────────────┤
│ 📄 Note 1        │
│ 📄 Note 2        │
│ 📄 Note 3        │
└──────────────────┘
```

**Pros:** Uses existing space, clear hierarchy
**Cons:** Loses project list overview

---

### Option C: Floating HUD Card
**Effort:** Low

A floating card appears near the project when selected:

```
        ┌─────────────────┐
        │ Test Project    │
        │ ●●●○○ 60%      │
        │ 12 notes        │
        │ 4,231 words     │
        │ [+ Note] [Edit] │
        └─────────────────┘
```

**Pros:** Doesn't take permanent space, dismissable
**Cons:** Can feel cluttered

---

### Option D: Mission Control Mode (NEW)
**Effort:** High | **Creativity:** ⭐⭐⭐

A **fourth sidebar mode** that shows a project dashboard:

```
⌘0 cycles: icon → compact → card → mission
```

**Mission Control Mode (400px+):**
```
┌─────────────────────────┐
│ MISSION CONTROL         │
├─────────────────────────┤
│ 📁 Test Project     ⚡  │
│ ━━━━━━━━━━━━━━━━░░░ 60% │
│                         │
│ 📊 Stats                │
│ • 12 notes              │
│ • 4,231 words           │
│ • 847 today             │
│                         │
│ 🎯 Momentum             │
│ ████████░░ 80% active   │
│ Last edit: 2h ago       │
│                         │
│ 📝 Recent               │
│ • Note title 1    2h    │
│ • Note title 2    1d    │
│ • Note title 3    3d    │
│                         │
│ ⚡ Quick Actions        │
│ [+ Note] [Daily] [AI]   │
└─────────────────────────┘
```

**Pros:** Full project context, ADHD-friendly stats, momentum tracking
**Cons:** Higher effort, another mode to cycle

---

### Option E: The "Pulse" Indicator ⭐ CREATIVE
**Effort:** Low | **Creativity:** ⭐⭐⭐⭐

Instead of a dashboard, add a **living pulse** to projects:

```
┌──────────────────────────────┐
│ ▼ 📂 Test Project  ◉ ◉ ◉   │  ← 3 pulses = high activity
│   │ 📄 Note 1               │
│   │ 📄 Note 2               │
│                              │
│ ▶ 📁 Archive Project  ○     │  ← 1 dim pulse = stale
│                              │
│ ▶ 📁 New Project    ◉ ◉ ◉ ◉ │  ← 4 pulses = on fire!
└──────────────────────────────┘
```

The pulses:
- **Glow/animate** based on recent activity
- **Count** shows activity level (edits in last 7 days)
- **Dim** when project goes stale (no edits in 7+ days)
- **Hover** shows tooltip with quick stats

**Pros:** Zero UI overhead, glanceable, motivating
**Cons:** Less detailed info

---

### Option F: Hybrid - Momentum Gauge + Context ⭐ RECOMMENDED
**Effort:** Medium | **Creativity:** ⭐⭐⭐⭐⭐

Combine the best ideas:

1. **Add Momentum Gauge** to project items (subtle pulse/glow)
2. **Transform sidebar header** when project selected
3. **Keep notes inline** below

```
┌──────────────────────────────┐
│ ≡  Projects (3)              │
├──────────────────────────────┤
│ ┌────────────────────────┐   │  ← Selected project card
│ │ 📂 Test Project    ◉◉◉ │   │
│ │ ━━━━━━━━━━━░░░░ 60%   │   │
│ │ 12 notes • 4.2k words  │   │
│ │ +847 today 🔥          │   │
│ └────────────────────────┘   │
│   ├─ 📄 Note 1               │
│   ├─ 📄 Note 2               │
│   └─ 📄 Note 3               │
│                              │
│ ▶ 📁 Other Project      ○    │
│ ▶ 📁 Archive            ○    │
└──────────────────────────────┘
```

**Features:**
- Selected project gets a **highlight card** with stats
- **Momentum dots** show activity level
- **Progress bar** for project completion
- **"+847 today 🔥"** celebrates daily progress
- Collapsed projects show just name + momentum dot

---

## Recommendation

**Start with Option F** (Hybrid) because:
1. Low-medium effort
2. ADHD-friendly (visible progress, momentum feedback)
3. Doesn't add new modes or panels
4. Celebrates small wins (+words today)
5. Glanceable project health

---

## Next Steps
1. [ ] Add `MomentumGauge` component (activity dots)
2. [ ] Create `ProjectContextCard` for selected project
3. [ ] Add daily word tracking to project
4. [ ] Celebrate milestones (+100 words, etc.)
