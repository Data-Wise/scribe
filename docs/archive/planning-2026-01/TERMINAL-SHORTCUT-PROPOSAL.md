# Terminal Shortcut Proposal

## Problem

**Current:** `⌘\`` (Command + Backtick)
**Issue:** Not working - backtick may be a dead key or have keyboard layout issues on macOS

---

## Why `⌘\`` Doesn't Work

Possible causes:
1. **Dead Key:** Backtick (`) is often a dead key for accents on international keyboards
2. **Keyboard Layout:** Non-US keyboards may have backtick in different positions
3. **macOS Behavior:** System may intercept backtick for special input methods
4. **Terminal Conflict:** Backtick is used in shell commands, may interfere

---

## Proposed Solutions (Ranked)

### 🥇 Option 1: `⌘J` (RECOMMENDED)

**Pros:**
- ✅ **Industry Standard** - VS Code, WebStorm, PyCharm use this
- ✅ **Easy to Type** - J key is home row adjacent
- ✅ **Available** - Not used anywhere in Scribe
- ✅ **Memorable** - "J" for "Jump to terminal" or "J" for console/log
- ✅ **Universal** - Works on all keyboard layouts

**Cons:**
- None identified

**Implementation:**
```typescript
if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
  e.preventDefault()
  // Toggle terminal logic
}
```

---

### 🥈 Option 2: `⌘T`

**Pros:**
- ✅ Natural mnemonic - "T" for Terminal
- ✅ Easy to remember
- ✅ Available in Scribe

**Cons:**
- ⚠️ Browser users expect `⌘T` = New Tab
- ⚠️ Conflicts with muscle memory from web browsers
- ⚠️ Might confuse users switching between browser/app

**Not Recommended** - Too much conflict with browser conventions

---

### 🥉 Option 3: `⌘\` (Backslash)

**Pros:**
- ✅ Close to backtick on keyboard
- ✅ Terminal/CLI association (paths use /)
- ✅ Available in Scribe

**Cons:**
- ⚠️ Harder to reach than J
- ⚠️ Not an industry standard
- ⚠️ May vary on international keyboards

**Acceptable Alternative** - Good if `⌘J` is rejected

---

### Option 4: `Ctrl+\``

**Pros:**
- ✅ VS Code secondary shortcut
- ✅ Works if backtick available

**Cons:**
- ❌ Same backtick problem as original
- ❌ Ctrl+key not standard on macOS for app shortcuts
- ❌ Inconsistent with rest of app (uses ⌘)

**Not Recommended**

---

### Option 5: `⌘;` (Semicolon)

**Pros:**
- ✅ Available
- ✅ Easy to type

**Cons:**
- ⚠️ No mnemonic connection to terminal
- ⚠️ Not used by other apps
- ⚠️ Hard to discover/remember

**Not Recommended**

---

## Recommendation: `⌘J`

### Why `⌘J` is the Best Choice

| Criteria | Score | Notes |
|----------|-------|-------|
| **Industry Standard** | ⭐⭐⭐⭐⭐ | VS Code, JetBrains IDEs |
| **Ergonomics** | ⭐⭐⭐⭐⭐ | Home row adjacent |
| **Memorability** | ⭐⭐⭐⭐⭐ | J = Jump to terminal |
| **Availability** | ⭐⭐⭐⭐⭐ | Not used in Scribe |
| **Consistency** | ⭐⭐⭐⭐⭐ | Matches developer tools |
| **Keyboard Layout** | ⭐⭐⭐⭐⭐ | Universal across layouts |

**Overall:** ⭐⭐⭐⭐⭐ (30/30)

---

## Shortcuts While Terminal is Focused

### Current Behavior

When terminal panel has focus:
- ❓ Do global Scribe shortcuts still work?
- ❓ Are keyboard events captured by xterm.js?
- ❓ Can user navigate away from terminal?

### Expected Behavior

**Terminal-specific shortcuts should work:**
- Regular typing → Terminal input
- Arrow keys → Terminal navigation
- `Ctrl+C` → Interrupt command
- `Ctrl+L` → Clear screen

**Global Scribe shortcuts should still work:**
- `⌘J` → Close terminal / toggle
- `⌘K` → Command palette
- `⌘,` → Settings
- `⌘N` → New note
- `⌘]` / `⌘[` → Cycle sidebar tabs
- `⌘W` → Close tab
- `Esc` → Focus editor (exit terminal)

### Implementation Considerations

**Terminal panel must:**
1. Allow global shortcuts to bubble up
2. Let ⌘-based shortcuts through to App.tsx
3. Only capture terminal-relevant keys (typing, Ctrl combos)
4. Not block navigation shortcuts

**Check in TerminalPanel.tsx:**
```typescript
terminal.onData((data) => {
  // Only capture terminal input
  // Don't block ⌘ shortcuts
})
```

---

## Migration Plan

### Step 1: Update Code
- Change `e.key === '\`'` to `e.key === 'j'`
- Update comments in App.tsx

### Step 2: Update Documentation
- docs/guide/shortcuts.md
- README.md
- Keyboard shortcuts panel

### Step 3: Test
- Verify `⌘J` opens/closes terminal
- Test all global shortcuts while terminal focused
- Verify terminal input still works

---

## Implementation

### Code Change Required

**File:** `src/renderer/src/App.tsx`

**Before (Line 803-816):**
```typescript
// Terminal tab shortcut (⌘`) - toggle or switch to Terminal
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

**After:**
```typescript
// Terminal tab shortcut (⌘J) - toggle or switch to Terminal
if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'j') {
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

**Changes:**
1. Comment: `⌘\`` → `⌘J`
2. Condition: `e.key === '\`'` → `e.key === 'j'`
3. Add: `!e.shiftKey` to avoid conflict with `⌘⇧J`

---

## Alternative: Keep Both Shortcuts

**Option:** Support both `⌘J` and `⌘\`` as fallback

```typescript
// Terminal shortcuts: ⌘J (primary) or ⌘` (fallback)
if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'j' || e.key === '`')) {
  e.preventDefault()
  // Toggle logic
}
```

**Pros:**
- Users can choose what works for their keyboard
- Backwards compatible

**Cons:**
- Two shortcuts for same action may confuse
- Harder to document

**Recommendation:** Use `⌘J` only for clarity

---

## Summary

| Aspect | Recommendation |
|--------|----------------|
| **New Shortcut** | `⌘J` |
| **Reason** | Industry standard, ergonomic, available |
| **Fallback** | `⌘\` if `⌘J` rejected |
| **Implementation** | Single line change in App.tsx |
| **Testing** | Verify global shortcuts work in terminal |
| **Documentation** | Update all references from `⌘\`` to `⌘J` |

**Next Steps:**
1. Get user approval for `⌘J`
2. Update App.tsx
3. Test terminal focus behavior
4. Update documentation
