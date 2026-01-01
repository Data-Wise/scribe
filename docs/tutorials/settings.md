# Settings Enhancement Tutorial

> **Learn how to customize Scribe with the new Settings system (v1.9.0)**

---

## Opening Settings

The fastest way to access settings is via the keyboard shortcut:

**⌘, (Command-Comma)** - Opens the Settings modal

Alternatively:
- Click the ⚙️ gear icon in the Mission Control sidebar
- Use Command Palette (⌘K) → "Settings"

---

## Settings Overview

Settings are organized into **5 categories**:

| Category | What's Inside |
|----------|---------------|
| **Editor** | Font, spacing, line height, ligatures, focus mode |
| **Themes** | Visual theme selection with preview gallery |
| **AI & Workflow** | Quick Actions, chat history, @ references |
| **Projects** | Project templates, defaults, daily notes |
| **Advanced** | Performance, data management, debug |

---

## 🔍 Fuzzy Search

The Settings modal includes **fuzzy search** to quickly find any setting:

1. Open Settings (⌘,)
2. Start typing in the search box (e.g., "font", "theme", "quick")
3. Results show matching settings with breadcrumb navigation
4. Click a result to jump to that setting's location

**Search is debounced** (300ms delay) for smooth typing without lag.

---

## 🎨 Theme Gallery

### Viewing Themes

1. Open Settings → **Themes** tab
2. Browse the visual gallery with **3-column grid layout**
3. Each theme card shows:
   - Theme name
   - Color preview swatches
   - Star icon (for favorites)
   - Selected indicator (blue border + checkmark)

### Available Themes

**Favorites (3):**
- **Slate** - Professional dark blue-gray
- **Nord** - Arctic-inspired pastel dark theme
- **Dracula** - Popular vampire-themed purple

**Dark Themes (2):**
- **Monokai** - Classic Sublime Text dark
- **GitHub Dark** - GitHub's dark mode

**Light Themes (3):**
- **Linen** - Warm cream with soft brown
- **Paper** - Minimalist white with subtle gray
- **Cream** - Soft yellow-tinted background

### Selecting a Theme

1. Click any theme card
2. Theme applies immediately (no need to click "Save")
3. Selected theme shows **blue border + checkmark**
4. Hover effects: cards scale slightly with shadow

---

## ⚡ Quick Actions Customization

Quick Actions are **one-click AI prompts** that auto-include your note context.

### Default Quick Actions

1. ✨ **Improve** - Enhance clarity and flow
2. 📝 **Expand** - Add more detail
3. 📋 **Summarize** - Create concise summary
4. 💡 **Explain** - Clarify complex concepts
5. 🔍 **Research** - Find related information

### Customizing Quick Actions

**Access:** Settings → **AI & Workflow** tab

#### Drag-to-Reorder

1. Hover over a Quick Action row
2. Click and hold the **drag handle** (⋮⋮ icon)
3. Drag to reorder (affects sidebar + context menu display order)
4. Release to save new order

#### Toggle Visibility

- Click the **checkbox** next to any Quick Action
- Unchecked actions are hidden from sidebar/context menu
- Disabled actions remain in settings (can re-enable later)

#### Edit Prompts

1. Click the **pencil icon** next to a Quick Action
2. Edit the prompt text in the modal
3. Prompt is auto-included with your note context
4. Click "Save" to apply changes

#### Assign Keyboard Shortcuts

1. Click the **keyboard icon** next to a Quick Action
2. Choose a shortcut: **⌘⌥1** through **⌘⌥9**
3. Shortcuts work globally when a note is open

#### Choose AI Model

1. Click the **model dropdown** next to a Quick Action
2. Select **Claude** or **Gemini**
3. Each action can use a different model

### Adding Custom Quick Actions

**Maximum:** 5 custom actions (total limit: 10 actions)

1. Click **"+ Add Custom"** button
2. Fill out the form:
   - **Emoji:** Icon displayed in UI (e.g., 🚀)
   - **Label:** Display name (e.g., "Proofread")
   - **Prompt:** AI instruction (e.g., "Check for spelling and grammar errors")
3. Click **"Add Action"**
4. New action appears in the list (can be reordered/customized)

### Removing Custom Quick Actions

1. Click the **trash icon** next to a custom Quick Action
2. Confirm deletion (cannot be undone)
3. Default actions **cannot be removed** (only hidden via checkbox)

---

## 📁 Project Templates

Project templates apply **preconfigured settings** for different workflows.

### Available Templates

**Research+ (🔬)**
- Quick Actions: Summarize, Explain, Research
- Daily note template: Literature review prompts
- Properties: `#status`, `#methodology`, `#findings`

**Teaching+ (📚)**
- Quick Actions: Explain, Expand, Summarize
- Daily note template: Lesson planning prompts
- Properties: `#topic`, `#week`, `#assignment`

**Dev+ (💻)**
- Quick Actions: Explain, Improve, Research
- Daily note template: Code snippet templates
- Properties: `#lang`, `#status`, `#pr`

**Writing+ (✍️)**
- Quick Actions: Improve, Expand, Summarize
- Daily note template: Creative writing prompts
- Properties: `#genre`, `#wordcount`, `#draft`

**Minimal (⚪)**
- No Quick Actions
- Basic daily note template
- No preset properties

### Applying a Template

1. Open Settings → **Projects** tab
2. Click **info icon** (ℹ️) to see template details
3. Review what will change
4. Click **"Apply"**
5. Confirm the action (shows what settings will be modified)
6. Wait for success animation (green checkmark, 2-second bounce)
7. Applied state resets after 2 seconds

**Templates modify:**
- Quick Actions configuration
- Daily note template
- Default note properties

---

## 💾 Export/Import Settings

### Export Settings

1. Open Settings → **Advanced** tab (or any tab)
2. Click **"Export Settings"** button
3. Settings copied to clipboard as JSON
4. Paste into a file or share with others

### Import Settings

1. Copy exported settings JSON to clipboard
2. Open Settings
3. Click **"Import Settings"** button
4. Paste JSON when prompted
5. Settings apply immediately

**Note:** Import overwrites current settings. Export first if you want to revert.

---

## 🔄 Reset to Defaults

**Warning:** This action cannot be undone.

1. Open Settings → **Advanced** tab
2. Click **"Reset to Defaults"** button
3. Confirm the action in the dialog
4. All settings revert to defaults (defined in `settingsSchema.ts`)

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **Open Settings** | ⌘, |
| **Close Settings** | Esc |
| **Search Settings** | Just start typing |
| **Quick Action 1** | ⌘⌥1 |
| **Quick Action 2** | ⌘⌥2 |
| **...** | ... |
| **Quick Action 9** | ⌘⌥9 |

---

## ♿ Accessibility

The Settings system is **WCAG 2.1 AA compliant**:

- **Screen readers:** Full ARIA labels on all controls
- **Keyboard navigation:** Tab through all settings
- **Focus indicators:** Visible focus states
- **Reduced motion:** Respects `prefers-reduced-motion` system setting
- **Semantic HTML:** Proper landmark roles

**Keyboard Navigation:**
- `Tab` - Move to next control
- `Shift+Tab` - Move to previous control
- `Enter`/`Space` - Activate button or toggle
- `Esc` - Close Settings modal

---

## 🎯 Tips & Tricks

### Fast Search

Instead of scrolling through categories, use **fuzzy search**:
- Type partial words (e.g., "liga" finds "Enable Ligatures")
- Search by category (e.g., "AI" shows all AI settings)
- Search by description text

### Theme Switching Speed

Themes apply **instantly** - no lag or reload required. Great for:
- Switching light/dark based on time of day
- Testing different color schemes while writing
- Finding the most comfortable contrast for long sessions

### Quick Actions Workflow

**Recommended setup:**
1. Keep 3-5 actions enabled (prevents decision fatigue)
2. Assign shortcuts to your top 3 most-used actions
3. Use drag-to-reorder to prioritize frequent actions at the top
4. Review and remove unused custom actions monthly

### Project Template Strategy

**When starting a new project:**
1. Apply the closest template (e.g., Research+ for a paper)
2. Customize Quick Actions for your specific needs
3. Export settings if you'll create similar projects later
4. Reuse exported settings for future similar projects

---

## 📊 Settings Persistence

All settings are **automatically saved** when you make changes:

- **Tauri mode:** SQLite database (`~/.scribe/scribe.db`)
- **Browser mode:** IndexedDB (localStorage fallback)
- **No "Save" button needed** - changes apply immediately
- **Settings sync** across app restarts

---

## 🐛 Troubleshooting

### Settings not persisting

**Check:**
- Database write permissions (`~/.scribe/scribe.db` should be writable)
- Browser localStorage not disabled (for browser mode)
- No errors in Developer Console (⌘⌥I)

### Theme not applying

1. Check that theme is actually selected (blue border + checkmark)
2. Hard refresh (⌘⇧R in browser mode)
3. Check Developer Console for CSS errors

### Quick Actions not appearing

1. Verify actions are **enabled** (checkbox checked)
2. Check that you have a note open
3. Verify Claude/Gemini CLI is installed (`which claude`)

---

## 🔗 Related Documentation

- [Quick Actions Reference](../reference/REFCARD-QUICK-ACTIONS.md)
- [Settings Reference Card](../reference/REFCARD-SETTINGS.md)
- [Features Overview](../guide/features.md)
- [Keyboard Shortcuts](../guide/shortcuts.md)

---

**Questions or feedback?** [Open an issue](https://github.com/Data-Wise/scribe/issues)
