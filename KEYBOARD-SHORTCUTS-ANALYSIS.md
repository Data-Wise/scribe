# Keyboard Shortcuts Analysis - Terminal Shortcut Conflict Check

## Terminal Shortcut

**Current:** `⌘\`` (Command + Backtick)
**Action:** Toggle Terminal panel in right sidebar
**Location:** `App.tsx:804`

---

## All Registered Shortcuts

### Global Application

| Shortcut | Action | Location | Notes |
|----------|--------|----------|-------|
| `⌘⇧N` | Open Scribe (global) | - | System-wide hotkey |
| `⌘,` | Settings | App.tsx:745 | Standard macOS convention |
| `⌘W` | Close tab | App.tsx:760 | Closes non-pinned tabs only |
| `⌘Q` | Quit | - | macOS native |

### Navigation

| Shortcut | Action | Location | Notes |
|----------|--------|----------|-------|
| `⌘N` | New note | App.tsx:703 | |
| `⌘D` | Daily note | App.tsx:708 | |
| `⌘F` | Search notes | App.tsx:720 | |
| `⌘K` | Command palette | - | Primary command interface |
| `⌘B` | Toggle left sidebar | App.tsx:689 | |
| `⌘⇧B` | Toggle right sidebar | App.tsx:694 | |
| `⌘0` | Cycle sidebar mode | App.tsx:727 | Icon/Compact/Card |

### Tabs

| Shortcut | Action | Location | Notes |
|----------|--------|----------|-------|
| `⌘1-9` | Switch to tab N | App.tsx:751 | Direct tab access |
| `⌘W` | Close tab | App.tsx:760 | Non-pinned only |
| `⌘⇧T` | Reopen closed tab | App.tsx:771 | Undo close |

### Right Sidebar Navigation

| Shortcut | Action | Location | Notes |
|----------|--------|----------|-------|
| `⌘]` | Next sidebar tab | App.tsx:782 | Cycles through visible tabs |
| `⌘[` | Previous sidebar tab | App.tsx:792 | Cycles through visible tabs |
| `⌘⇧]` | Toggle right sidebar | App.tsx:819 | Collapse/expand |
| `⌘⇧[` | Toggle left sidebar | App.tsx:825 | Collapse/expand |
| **`⌘\``** | **Toggle Terminal** | **App.tsx:804** | **NEW** |

### Editor

| Shortcut | Action | Location | Notes |
|----------|--------|----------|-------|
| `⌘E` | Toggle Write/Preview | - | Editor mode |
| `⌘⇧F` | Focus mode | App.tsx:670 | Distraction-free |
| `⌘B` | Bold | - | Text formatting |
| `⌘I` | Italic | - | Text formatting |
| `⌘Z` | Undo | - | Standard |
| `⌘⇧Z` | Redo | - | Standard |

### Features

| Shortcut | Action | Location | Notes |
|----------|--------|----------|-------|
| `⌘⇧E` | Export | App.tsx:676 | Document export |
| `⌘⇧G` | Graph view | App.tsx:684 | Knowledge graph |
| `⌘⇧C` | Quick capture | App.tsx:733 | Inbox note |
| `⌘⇧P` | New project | App.tsx:739 | Create project |
| `⌘?` or `⌘/` | Shortcuts panel | App.tsx:714 | Help reference |
| `⌘⇧A` | AI Panel | - | Planned |

### Themes

| Shortcut | Action | Location | Notes |
|----------|--------|----------|-------|
| `⌘⌥1-0` | Switch theme | App.tsx:368 | Quick theme access |

---

## Conflict Analysis

### ✅ No Conflicts Found

**Terminal shortcut `⌘\`` does NOT conflict with any existing shortcuts.**

| Key | Used In | Conflicts? |
|-----|---------|------------|
| **Backtick (\`)** | **Terminal only** | ✅ **NONE** |
| `[` | Sidebar navigation | No conflict (different key) |
| `]` | Sidebar navigation | No conflict (different key) |
| `B` | Sidebar toggle | No conflict (different key) |
| `0` | Sidebar mode cycle | No conflict (different key) |

### Why `⌘\`` is Perfect

1. **Convention:** Standard terminal shortcut in many apps (VS Code, iTerm2)
2. **Ergonomic:** Easy to reach, natural pairing with terminal
3. **Memorable:** Backtick (\`) is visually associated with command-line/code
4. **Available:** Not used anywhere else in Scribe
5. **macOS-safe:** Not a system reserved shortcut

---

## Terminal Shortcut Behavior

```typescript
// App.tsx:804-816
if ((e.metaKey || e.ctrlKey) && e.key === '`') {
  e.preventDefault()
  // If already on Terminal and sidebar is open, close it
  if (rightActiveTab === 'terminal' && !rightSidebarCollapsed) {
    setRightSidebarCollapsed(true)
  } else {
    // Switch to Terminal and ensure sidebar is visible
    setRightActiveTab('terminal')
    if (rightSidebarCollapsed) {
      setRightSidebarCollapsed(false)
    }
  }
}
```

**Smart Toggle:**
- First press: Opens Terminal (expands right sidebar if needed)
- Second press (when on Terminal): Closes right sidebar
- Press from other tab: Switches to Terminal tab

---

## Documentation Update Needed

### Current Documentation
`docs/guide/shortcuts.md` does **NOT** include Terminal shortcut.

### Recommended Addition

Add to "Navigation" section:

```markdown
## Navigation

| Action | Shortcut |
|--------|----------|
| **New Note** | `⌘N` |
| **Daily Note** | `⌘D` |
| **Search Notes** | `⌘F` |
| **Toggle Left Sidebar** | `⌘B` |
| **Toggle Right Sidebar** | `⌘⇧B` |
| **Toggle Terminal** | `⌘\`` |  <!-- ADD THIS -->
| **Back** | `⌘[` |
| **Forward** | `⌘]` |
```

Or add new "Terminal" section:

```markdown
## Terminal

| Action | Shortcut |
|--------|----------|
| **Toggle Terminal** | `⌘\`` |
```

---

## Status Bar Integration

**Current:** Terminal button in status bar (verified in code)
**Location:** Status bar shows Terminal toggle button
**Works:** Clicking status bar button also toggles Terminal

Both keyboard shortcut (`⌘\``) and status bar button provide same functionality.

---

## Recommendations

### ✅ Keep `⌘\`` - No Changes Needed

1. **No conflicts** with existing shortcuts
2. **Industry standard** (VS Code, iTerm2, many IDEs)
3. **Ergonomic** and easy to remember
4. **Well-implemented** with smart toggle behavior

### 📝 Action Items

1. **Update documentation:** Add `⌘\`` to shortcuts.md
2. **Update main README:** Include Terminal shortcut in feature list
3. **Add to keyboard shortcuts panel:** When user presses `⌘?`

---

## Keyboard Shortcuts Panel

**Current shortcuts panel location:** `⌘?` or `⌘/`
**Should include:** Terminal shortcut for discoverability

Ensure Terminal shortcut appears in the in-app shortcuts reference panel.

---

## Summary

| Aspect | Status |
|--------|--------|
| **Conflict check** | ✅ No conflicts |
| **Implementation** | ✅ Working correctly |
| **Convention** | ✅ Industry standard |
| **Documentation** | ⚠️ Needs update |
| **Discoverability** | ⚠️ Add to shortcuts panel |

**Verdict:** Terminal shortcut `⌘\`` is **perfectly safe** and should be kept as-is. Only documentation updates needed.
