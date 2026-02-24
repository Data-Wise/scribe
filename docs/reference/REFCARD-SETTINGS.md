# Settings Reference Card

> **Quick reference for Scribe Settings (v1.9.0+)**

---

## Opening Settings

| Method | Action |
|--------|--------|
| **Keyboard** | ⌘, (Command-Comma) |
| **Sidebar** | Click ⚙️ gear icon |
| **Command Palette** | ⌘K → "Settings" |

**Close Settings:** Press `Esc` or click ✕ button or "Done" button

---

## Settings Categories

| Category | Icon | Contents |
|----------|------|----------|
| **General** | ⚙️ | Open last page, readable line length, spellcheck |
| **Editor** | 📝 | Font, spacing, ligatures, focus mode |
| **Themes** | 🎨 | Visual theme gallery (8 themes) |
| **AI & Workflow** | ⚡ | Quick Actions, chat, @ references |
| **Projects** | 📁 | Templates, defaults, daily notes |
| **Advanced** | ⚙️ | Performance, data, export/import |

**Badge:** AI category shows "3" badge (3 new features in v1.9.0)

---

## Preference Toggles

The following boolean preferences are managed by the `usePreferences()` hook
and persist to `localStorage` via `SettingsToggle` components.

| Preference | Default | Tab | Description |
|------------|---------|-----|-------------|
| **Open Last Page** | ON | General | Restore the last open note on startup |
| **Readable Line Length** | ON | Editor | Limit editor line width for comfortable reading |
| **Spellcheck** | OFF | Editor | Enable browser-native spellcheck in the editor |

All toggles write-through to `localStorage` immediately (no Save button).
Changes propagate to other components via the `preferences-changed` event.

---

## Fuzzy Search

**Access:** Just start typing in the search box (auto-focused when Settings opens)

| Feature | Description |
|---------|-------------|
| **Debounced** | 300ms delay prevents lag |
| **Fuzzy matching** | Powered by fuse.js |
| **Breadcrumb nav** | Shows "Editor › Font & Spacing › Font Size" |
| **Click result** | Jumps to setting + clears search |

**Example searches:**
- `font` → Font Family, Font Size, Font Weight
- `quick` → Quick Actions section
- `theme` → Theme Gallery, Auto-theme Settings
- `AI` → All AI & Workflow settings

---

## Theme Gallery

### 8 Built-In Themes

**Favorites (⭐):**
- **Slate** - Professional dark blue-gray
- **Nord** - Arctic pastel dark
- **Dracula** - Vampire purple

**Dark:**
- **Monokai** - Classic Sublime
- **GitHub Dark** - GitHub's dark mode

**Light:**
- **Linen** - Warm cream
- **Paper** - Minimalist white
- **Cream** - Soft yellow-tinted

### Theme Selection

| Action | Result |
|--------|--------|
| **Click theme card** | Applies immediately |
| **Visual indicator** | Blue border + checkmark |
| **Hover effect** | Scale + shadow |
| **Grid layout** | 3-column responsive |

---

## Quick Actions

### Default Actions (5)

| Icon | Action | Description |
|------|--------|-------------|
| ✨ | **Improve** | Enhance clarity and flow |
| 📝 | **Expand** | Add more detail |
| 📋 | **Summarize** | Create concise summary |
| 💡 | **Explain** | Clarify complex concepts |
| 🔍 | **Research** | Find related information |

**Limits:**
- 5 default actions (cannot be removed, only hidden)
- 5 custom actions maximum
- **Total:** 10 Quick Actions

### Customization Options

| Feature | How To |
|---------|--------|
| **Drag-to-reorder** | Click ⋮⋮ drag handle, drag row |
| **Toggle visibility** | Click checkbox (hide/show) |
| **Edit prompt** | Click ✏️ pencil icon |
| **Assign shortcut** | Click ⌨️ keyboard icon (⌘⌥1-9) |
| **Choose model** | Click dropdown (Claude/Gemini) |
| **Add custom** | Click "+ Add Custom" button |
| **Remove custom** | Click 🗑️ trash icon |

### Custom Quick Action Form

| Field | Description | Example |
|-------|-------------|---------|
| **Emoji** | Icon for UI | 🚀 |
| **Label** | Display name | "Proofread" |
| **Prompt** | AI instruction | "Check for spelling and grammar errors" |

---

## Project Templates

### 5 Preconfigured Templates

| Template | Icon | Quick Actions | Use Case |
|----------|------|---------------|----------|
| **Research+** | 🔬 | Summarize, Explain, Research | Academic papers, lit reviews |
| **Teaching+** | 📚 | Explain, Expand, Summarize | Lesson plans, assignments |
| **Dev+** | 💻 | Explain, Improve, Research | Code docs, sprint planning |
| **Writing+** | ✍️ | Improve, Expand, Summarize | Creative writing, blogs |
| **Minimal** | ⚪ | None | Clean slate, custom workflows |

### Applying Templates

| Step | Action |
|------|--------|
| 1. **Review** | Click ℹ️ info icon → See details |
| 2. **Apply** | Click "Apply" button |
| 3. **Confirm** | Click "OK" in confirmation dialog |
| 4. **Wait** | Success animation (green ✓, 2-second bounce) |
| 5. **Done** | Applied state resets after 2 seconds |

**What Templates Modify:**
- Quick Actions configuration (which actions enabled/ordered)
- Daily note template (prompts/structure)
- Default note properties (`#tags`, fields)

---

## Export/Import

### Export Settings

| Step | Action |
|------|--------|
| 1. Click | "Export Settings" button (any category) |
| 2. Result | Settings copied to clipboard (JSON) |
| 3. Save | Paste into file or share |

**Export includes:**
- All 5 category settings
- Quick Actions configuration
- Theme selection
- Font settings
- Project template preferences

### Import Settings

| Step | Action |
|------|--------|
| 1. Copy | Exported JSON to clipboard |
| 2. Click | "Import Settings" button |
| 3. Paste | JSON when prompted |
| 4. Apply | Settings overwrite current |

**Warning:** Import overwrites all settings. Export first to backup.

---

## Reset to Defaults

**Warning:** This action cannot be undone.

| Step | Action |
|------|--------|
| 1. Click | "Reset to Defaults" button (Advanced tab) |
| 2. Confirm | Click "OK" in dialog |
| 3. Result | All settings revert to `settingsSchema.ts` defaults |

---

## Keyboard Shortcuts

| Action | Shortcut | Scope |
|--------|----------|-------|
| **Open Settings** | ⌘, | Global |
| **Close Settings** | Esc | Settings modal |
| **Search** | Just type | Settings modal |
| **Tab navigation** | Tab | Settings modal |
| **Activate** | Enter or Space | Focused control |
| **Quick Action 1** | ⌘⌥1 | Note editor |
| **Quick Action 2** | ⌘⌥2 | Note editor |
| **...** | ... | ... |
| **Quick Action 9** | ⌘⌥9 | Note editor |

---

## Settings Persistence

| Mode | Storage | Location |
|------|---------|----------|
| **Tauri** | SQLite | `~/.scribe/scribe.db` |
| **Browser** | IndexedDB | Browser storage (localStorage fallback) |

**Auto-save:** Changes apply immediately (no "Save" button needed)

---

## Accessibility (WCAG 2.1 AA)

| Feature | Support |
|---------|---------|
| **Screen readers** | Full ARIA labels |
| **Keyboard nav** | Tab through all controls |
| **Focus indicators** | Visible focus states |
| **Reduced motion** | Respects `prefers-reduced-motion` |
| **Semantic HTML** | Proper landmark roles |
| **Modal dialog** | `role=dialog`, `aria-modal=true` |

---

## Animation Keyframes (7 new)

| Animation | Use Case | Duration |
|-----------|----------|----------|
| `fade-in` | Tab switching | 150ms |
| `fade-out` | Closing | 150ms |
| `slide-up` | Panels | 200ms |
| `slide-down` | Dropdowns | 200ms |
| `scale-in` | Popovers | 200ms |
| `pulse-soft` | Loading states | 1.5s loop |
| `success-bounce` | Apply button | 500ms |

**Performance:** 60fps, hardware-accelerated (`transform`, `opacity`)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Settings not persisting** | Check DB write permissions, localStorage enabled |
| **Theme not applying** | Hard refresh (⌘⇧R), check DevTools console |
| **Quick Actions missing** | Verify enabled (checkbox), note open, CLI installed |
| **Search not working** | Wait 300ms (debounce delay) |
| **Import failed** | Validate JSON format, check console errors |

---

## Technical Details

### Settings Schema

**File:** `src/renderer/src/lib/settings/settingsSchema.ts`

**Structure:**
```typescript
{
  editor: { /* font, spacing, etc */ },
  themes: { /* selected theme, favorites */ },
  aiWorkflow: { /* Quick Actions config */ },
  projects: { /* templates, defaults */ },
  advanced: { /* performance, debug */ }
}
```

### Settings Store

**File:** `src/renderer/src/store/useSettingsStore.ts`

**Zustand store with actions:**
- `loadSettings()` - Fetch from DB
- `updateSetting(category, key, value)` - Update single setting
- `resetSettings()` - Revert to defaults
- `exportSettings()` - Copy JSON to clipboard
- `importSettings(json)` - Apply JSON settings

---

## Related Documentation

- [Settings Tutorial](../tutorials/settings.md) - Full walkthrough
- [Quick Actions Refcard](REFCARD-QUICK-ACTIONS.md) - Quick Actions details
- [Features Guide](../guide/features.md) - Complete feature list
- [Keyboard Shortcuts](../guide/shortcuts.md) - All shortcuts

---

**Version:** v1.9.0+
**Last Updated:** 2025-12-31
**Changelog:** [v1.9.0 Release Notes](https://github.com/Data-Wise/scribe/releases/tag/v1.9.0)
