# Command Palette Tutorial

> **Access all actions with ⌘K - your keyboard-first power tool**

---

## What You'll Learn

- Open and use the Command Palette
- Navigate with keyboard
- Understand all available commands
- Build muscle memory for common actions
- Customize command shortcuts

**Time:** 5 minutes
**Prerequisites:** None

---

## What Is the Command Palette?

The **Command Palette** is a keyboard-driven search interface for all Scribe actions:

- 🔍 Search for any command by typing
- ⌨️ Fully keyboard-navigable (no mouse needed)
- ⚡ Faster than clicking through menus
- 🎯 Shows keyboard shortcuts for each command

**ADHD benefits:**
- No menu hunting (type to find instantly)
- Visible shortcuts (learn as you use)
- One consistent interface (⌘K for everything)

---

## Step 1: Open Command Palette

### Keyboard Shortcut

Press **⌘K** (Command + K)

**Result:** Palette opens with search bar focused

```
┌────────────────────────────────────┐
│ Search commands...                  │
├────────────────────────────────────┤
│ > Daily Note                   ⌘D  │
│   New Note                     ⌘N  │
│   Search Notes                 ⌘F  │
│   Create Project               ⌘⇧P │
│   Open Settings                ⌘,  │
│   ...                               │
└────────────────────────────────────┘
```

### Close Palette

Press **Esc** to close without selecting

---

## Step 2: Search for Commands

### Type to Filter

```
Type: "daily"

┌────────────────────────────────────┐
│ daily                               │
├────────────────────────────────────┤
│ > Daily Note                   ⌘D  │  ← Selected
│   Open Yesterday's Daily Note       │
│   Open Last Week's Daily Notes      │
└────────────────────────────────────┘
```

### Fuzzy Matching

Command Palette uses fuzzy search:

| You Type | Matches |
|----------|---------|
| "note" | **Note** Search, New **Note**, Daily **Note** |
| "proj" | Create **Proj**ect, Switch **Proj**ect |
| "term" | Open **Term**inal, Close **Term**inal |
| "np" | **N**ew **P**roject, **N**ew Page |

**Tip:** Type abbreviations for faster access.

---

## Step 3: Navigate Results

### Keyboard Navigation

| Key | Action |
|-----|--------|
| ↓ (Down Arrow) | Move to next command |
| ↑ (Up Arrow) | Move to previous command |
| Enter | Execute selected command |
| Esc | Close palette |

### Visual Indicator

Selected command has `>` prefix:

```
  Daily Note                      # Not selected
> New Note                    ⌘N  # Selected
  Search Notes                ⌘F
```

---

## Step 4: All Available Commands

### Note Actions

| Command | Shortcut | What It Does |
|---------|----------|--------------|
| **New Note** | ⌘N | Create note in current project |
| **Daily Note** | ⌘D | Open/create today's daily note |
| **Quick Capture** | ⌘⇧C | Fast note creation overlay |
| **Search Notes** | ⌘F | Full-text search |
| **Recent Notes** | | List recent notes |

### Project Actions

| Command | Shortcut | What It Does |
|---------|----------|--------------|
| **Create Project** | ⌘⇧P | New project wizard |
| **Switch Project** | | Change active project |
| **Project Settings** | | Edit current project |

### View Actions

| Command | Shortcut | What It Does |
|---------|----------|--------------|
| **Mission Control** | ⌘0 | Dashboard view |
| **Focus Mode** | ⌘⇧F | Distraction-free writing |
| **Toggle Sidebar** | ⌘B | Show/hide left sidebar |
| **Toggle Right Sidebar** | ⌘⇧B | Show/hide right sidebar |

### Editor Actions

| Command | Shortcut | What It Does |
|---------|----------|--------------|
| **Editor Mode: Write** | ⌘1 | Markdown editing |
| **Editor Mode: Preview** | ⌘2 | Rendered preview |
| **Editor Mode: Hybrid** | ⌘3 | Split view |
| **Cycle Editor Modes** | ⌘E | Rotate through modes |

### Terminal Actions

| Command | Shortcut | What It Does |
|---------|----------|--------------|
| **Toggle Terminal** | ⌘⌥T | Show/hide terminal |
| **New Terminal** | | Open additional terminal |
| **Clear Terminal** | | Clear terminal output |

### Settings

| Command | Shortcut | What It Does |
|---------|----------|--------------|
| **Open Settings** | ⌘, | App preferences |
| **Keyboard Shortcuts** | ⌘K ⌘S | Shortcut reference |

---

## Step 5: Common Workflows

### Workflow 1: Quick Command Access

```markdown
**Scenario:** You want to create a new note

1. Press ⌘K (open palette)
2. Type "new" (filters to "New Note")
3. Press Enter (executes command)

**Time:** < 2 seconds
```

### Workflow 2: Discover Shortcuts

```markdown
**Scenario:** You don't remember the shortcut for Focus Mode

1. Press ⌘K
2. Type "focus"
3. See: Focus Mode        ⌘⇧F
4. Press Enter OR remember ⌘⇧F for next time

**Learning:** Palette teaches shortcuts
```

### Workflow 3: Keyboard-Only Navigation

```markdown
**No mouse needed:**

1. ⌘K (open palette)
2. Type to filter
3. ↓ ↑ to navigate
4. Enter to execute
5. Work continues uninterrupted
```

---

## Advanced Usage

### Command Sequences

Some commands open sub-palettes:

```
⌘K → "Create Project"
  ↓
┌────────────────────────────────┐
│ Project Type                    │
├────────────────────────────────┤
│ > Research           🔬         │
│   Teaching           📚         │
│   R Package          📦         │
│   R Dev              🛠️         │
│   Generic            📁         │
└────────────────────────────────┘
```

### Recent Commands

Palette shows recently used commands first:

```
┌────────────────────────────────┐
│ Search commands...              │
├────────────────────────────────┤
│ RECENT                          │
│ > Daily Note               ⌘D  │
│   New Note                 ⌘N  │
│                                 │
│ ALL COMMANDS                    │
│   Search Notes             ⌘F  │
│   Create Project           ⌘⇧P │
│   ...                           │
└────────────────────────────────┘
```

### Contextual Commands

Available commands change based on context:

**In Editor:**
```
- Editor Mode: Write
- Editor Mode: Preview
- Focus Mode
```

**In Mission Control:**
```
- New Project
- Daily Note
- Quick Capture
```

---

## Building Muscle Memory

### Learning Strategy

1. **Week 1:** Use ⌘K for everything
   - Force yourself to use palette instead of mouse
   - Note shortcuts as you go

2. **Week 2:** Start using direct shortcuts
   - ⌘N, ⌘D, ⌘F (most common)
   - Keep palette as backup

3. **Week 3:** Muscle memory forms
   - Direct shortcuts become automatic
   - Palette only for rare actions

### Most Used Commands

Practice these first:

| Frequency | Command | Shortcut |
|-----------|---------|----------|
| **Daily** | New Note | ⌘N |
| **Daily** | Daily Note | ⌘D |
| **Daily** | Search | ⌘F |
| **Daily** | Mission Control | ⌘0 |
| **Weekly** | Create Project | ⌘⇧P |
| **Weekly** | Focus Mode | ⌘⇧F |

---

## Troubleshooting

### Palette Won't Open

**Problem:** ⌘K doesn't work

**Solutions:**

1. Check another app isn't capturing ⌘K
2. Try clicking in Scribe window first
3. Restart Scribe

### Can't Find a Command

**Problem:** Typing doesn't show expected command

**Solutions:**

1. Try different keywords:
   - "new note" vs "create note"
   - "terminal" vs "shell"

2. Scroll through full list (don't type, just browse)

3. Check command exists in current context

### Wrong Command Executes

**Problem:** Press Enter, unexpected action happens

**Solutions:**

1. Use ↓ ↑ to verify selection before Enter
2. Look for `>` indicator
3. Check for similar command names

---

## Customization

### Keyboard Shortcut Reference

Press **⌘K ⌘S** to see all shortcuts:

```
┌─────────────────────────────────────────┐
│ Keyboard Shortcuts                       │
├─────────────────────────────────────────┤
│ New Note                ⌘N               │
│ Daily Note              ⌘D               │
│ Search                  ⌘F               │
│ Mission Control         ⌘0               │
│ ...                                      │
└─────────────────────────────────────────┘
```

### Future: Custom Shortcuts

**Coming in v2:**
- Remap any command
- Create custom command sequences
- Save favorite commands

---

## Tips for ADHD Users

### Reduce Decision Fatigue

```markdown
Don't overthink command choice:

❌ "Should I use palette or click the button?"
✅ "⌘K + type what I want"

⌘K is ALWAYS correct.
```

### Visual Search

```markdown
Can't remember command name?

1. ⌘K (open palette)
2. Don't type - just scroll
3. Scan for familiar words
4. Icons help recognition
```

### Interrupt Recovery

```markdown
Got distracted? Back to work:

1. ⌘K
2. Type "recent"
3. See your last 5 commands
4. Pick up where you left off
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K | Open Command Palette |
| ↓ / ↑ | Navigate commands |
| Enter | Execute command |
| Esc | Close palette |
| ⌘K ⌘S | Shortcut reference |

---

## Next Steps

- **Practice:** Use ⌘K for your next 10 actions
- **Learn:** Notice shortcuts as you use palette
- **Build habit:** ⌘K becomes automatic in ~1 week
- **Explore:** [Keyboard Shortcuts Guide](../guide/shortcuts.md)

---

## See Also

- [Keyboard Shortcuts](../guide/shortcuts.md) - Complete shortcut reference
- [Mission Control Tutorial](./mission-control.md) - Dashboard navigation
- [Terminal Tutorial](./terminal.md) - Embedded terminal usage
- [Features Overview](../guide/features.md) - All Scribe features
