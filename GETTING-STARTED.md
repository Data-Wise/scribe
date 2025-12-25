# Getting Started with Nexus Desktop

> **Quick Start**: A guide to running, testing, and developing the Nexus desktop application

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Features Guide](#features-guide)
  - [Wiki Links](#wiki-links)
  - [Tags](#tags)
- [Testing](#testing)
- [Database Location](#database-location)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)
- **macOS**: Currently built and tested on macOS (Electron supports other platforms)

Check your versions:

```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

---

## Installation

1. **Navigate to the desktop app directory:**

```bash
cd ~/projects/dev-tools/nexus/nexus-desktop
```

2. **Install dependencies:**

```bash
npm install
```

This will install all required packages including:
- Electron 28+
- React 18
- TypeScript
- TipTap editor
- better-sqlite3 (with native module compilation)
- Tailwind CSS

3. **Rebuild native modules:**

The installer should automatically rebuild native modules for Electron. If you encounter issues:

```bash
npx electron-rebuild
```

---

## Running the App

### Development Mode

**Start the app with hot reload:**

```bash
npm run dev
```

This command:
- Starts the Vite dev server for React
- Launches Electron with hot reload enabled
- Opens DevTools automatically
- Watches for file changes

**What you should see:**
- Electron window opens with the Nexus interface
- Sidebar with PARA folders (Inbox, Projects, Areas, Resources, Archive)
- "New Note" button at the top
- Empty state message if no notes exist

### Production Build

**Build the app for distribution:**

```bash
npm run build
```

This creates optimized production builds in `dist/`.

**Package as a native app:**

```bash
npm run build:mac    # macOS .app bundle
npm run build:linux  # Linux AppImage
npm run build:win    # Windows installer
```

The packaged app will be in `dist/`.

---

## Features Guide

### Wiki Links

**Sprint 6 Feature** - Connect your notes with `[[wiki-style]]` links.

#### Creating Links

1. **Type `[[` in the editor**
   - Autocomplete dropdown appears instantly
   - Shows all existing notes with titles

2. **Select a note**
   - Use arrow keys (↑↓) to navigate
   - Press Enter to select
   - Or click with mouse

3. **Create new notes from links**
   - Type `[[New Note Name]]`
   - Click the link to create the note
   - New note opens automatically

#### Link Rendering

- Links appear in blue: `[[Note Title]]`
- Hover for visual feedback
- Click to navigate to linked note
- Broken links (non-existent notes) still clickable

#### Backlinks Panel

Located in the right sidebar:

**Incoming Links (Backlinks):**
- Shows which notes link TO the current note
- "What references this?"

**Outgoing Links:**
- Shows which notes this note links TO
- "What does this reference?"

**Usage:**
- Click any link in the panel to navigate
- Links update in real-time as you edit

#### Example Workflow

```markdown
Writing about [[Causal Inference]] in my [[Research Notes]].
See also [[Sensitivity Analysis]] and [[Mediation Analysis]].

Related projects:
- [[rmediation Package]]
- [[Simulation Study 2024]]
```

All `[[links]]` become clickable, navigable connections.

---

### Tags

**Sprint 7 Feature** - Organize notes with `#tags` and powerful filtering.

#### Creating Tags

1. **Type `#` in the editor**
   - Tag autocomplete appears instantly
   - Shows existing tags with colors and note counts
   - Example: `#research (12 notes)`

2. **Select or create a tag**
   - Arrow keys to navigate
   - Enter to select existing tag
   - Select "Create new tag" for new tags
   - Autocomplete closes on space/newline

3. **Tag naming rules**
   - Format: `#tag`, `#my-tag`, `#tag123`
   - Supports: letters, numbers, hyphens (`-`), underscores (`_`)
   - Case-insensitive: `#Research` = `#research`
   - Cannot start with number

#### Tag Rendering

- **Colored badges**: Each tag gets a unique color
- **Consistent colors**: Same tag = same color across all notes
- **Interactive**: Click any tag badge to filter notes
- **Visual hierarchy**: Tags stand out in editor

Example:
```
Research ideas for #causal-inference and #mediation-analysis.
TODO: Review #sensitivity-analysis literature.
```

Tags appear as colorful, clickable badges.

#### Tags Panel

Located in the right sidebar (below Backlinks):

**All Tags Section:**
- Lists all tags in your vault
- Shows note count for each tag
- Click any tag to filter notes

**Current Note Tags:**
- Shows tags in the active note
- Quick visual reference

**Visual Indicators:**
- Active filters highlighted
- Tag colors match editor badges
- Note counts update in real-time

#### Tag Filtering

**Single Tag Filtering:**
1. Click any tag (in editor, panel, or TagsPanel)
2. Note list filters to show only notes with that tag
3. TagFilter bar appears at top showing active filter

**Multi-Tag Filtering (AND logic):**
1. Click multiple tags to add them to filter
2. Only notes with ALL selected tags appear
3. Example: `#research` + `#mediation` shows notes with BOTH tags

**Clear Filters:**
- Click tag again to remove from filter
- Click "Clear all filters" button
- Click "All Notes" in sidebar

#### Tag Management

**Auto-parsing:**
- Tags automatically extracted from content
- No manual "apply tag" needed
- Delete `#tag` text → removes tag

**Case-insensitive:**
- `#Research`, `#research`, `#RESEARCH` all treated as same tag
- First occurrence wins for display

**Hash-based colors:**
- Colors generated from tag name
- Deterministic (same tag = same color always)
- No manual color assignment needed

#### Example Workflows

**Organize research:**
```markdown
# Literature Review

Reading about #causal-inference in #epidemiology.
Key papers on #mediation-analysis and #sensitivity-analysis.

Status: #to-read #high-priority
```

**Filter by context:**
- Click `#to-read` → See all reading queue
- Add `#high-priority` → Narrow to urgent items
- Add `#mediation-analysis` → Find specific topic to-reads

**Combine with wiki links:**
```markdown
See [[Sensitivity Analysis Paper]] for #sensitivity-analysis methods.
Related to [[VanderWeele 2010]] - #foundational #must-read.
```

#### Tags vs Links

| Feature | Tags | Wiki Links |
|---------|------|------------|
| **Syntax** | `#tag` | `[[link]]` |
| **Purpose** | Categorize, filter | Connect, navigate |
| **Colors** | Unique per tag | All blue |
| **Filtering** | Multi-tag AND/OR | Backlinks panel |
| **Best for** | Topics, status, priority | Related notes, references |

**Use both together:**
```markdown
Working on [[Mediation Package]] #development #R
Need to review [[Literature/VanderWeele]] #foundational
```

---

## Testing

### Manual Testing Checklist

**Basic Functionality:**

1. **Create a Note:**
   - Click "New Note" button
   - Note appears in sidebar
   - Editor loads with placeholder text

2. **Edit Note Title:**
   - Click on note title in main area
   - Title becomes editable input
   - Press Enter or click away to save
   - Title updates in sidebar

3. **Edit Note Content:**
   - Type in editor area
   - Use formatting toolbar (bold, italic, headings, lists)
   - Content auto-saves (no save button needed)

4. **Test Folders:**
   - Click different PARA folders in sidebar
   - Notes filter by folder
   - Click "All Notes" to see everything
   - Create note while folder is selected (note goes to that folder)

5. **Test Code Blocks:**
   - Click code block button in toolbar
   - Type code with syntax highlighting
   - Verify VS Code dark theme colors

6. **Test Wiki Links:** (Sprint 6)
   - Type `[[` in editor to trigger autocomplete
   - Select a note from the list or type to create new
   - Click wiki link to navigate to that note
   - Check BacklinksPanel shows incoming/outgoing links

7. **Test Tags:** (Sprint 7)
   - Type `#` in editor to trigger tag autocomplete
   - Select existing tag or create new one
   - Tags appear as colored badges in editor
   - Click tag in TagsPanel to filter notes
   - Click multiple tags for multi-tag filtering (AND logic)

8. **Close and Reopen:**
   - Quit the app (Cmd+Q)
   - Restart with `npm run dev`
   - Verify notes persist
   - Check all content is intact

### Database Verification

**Check database exists:**

```bash
# Database location
ls -la ~/Library/Application\ Support/nexus-desktop/data/

# You should see:
# - nexus.db (main database)
# - nexus.db-wal (write-ahead log)
# - nexus.db-shm (shared memory)
```

**Inspect database (optional):**

```bash
# Install sqlite3 if needed: brew install sqlite

sqlite3 ~/Library/Application\ Support/nexus-desktop/data/nexus.db

# Run queries:
sqlite> .tables                    # List tables
sqlite> SELECT * FROM notes;       # View all notes
sqlite> SELECT * FROM schema_version;  # Check migration
sqlite> .quit
```

### Performance Testing

**Test with many notes:**

```bash
# Create 100 test notes (run in developer console)
Array.from({length: 100}, (_, i) =>
  window.api.createNote({
    title: `Test Note ${i + 1}`,
    content: `<p>Content for test note ${i + 1}</p>`,
    folder: ['inbox', 'projects', 'areas', 'resources', 'archive'][i % 5]
  })
)
```

**Verify:**
- Sidebar scrolls smoothly
- Folder counts are accurate
- Switching notes is instant
- Editor loads without lag

---

## Database Location

**Development database:**

```
~/Library/Application Support/nexus-desktop/data/nexus.db
```

**Production database:**

Same location when running the packaged app.

**Reset database:**

```bash
# Delete database to start fresh
rm -rf ~/Library/Application\ Support/nexus-desktop/

# Next app launch will create new database
```

---

## Development Workflow

### File Structure

```
nexus-desktop/
├── src/
│   ├── main/                      # Electron main process
│   │   ├── index.ts              # App lifecycle, window creation
│   │   └── database/
│   │       └── DatabaseService.ts # SQLite operations
│   │
│   ├── renderer/                  # React app
│   │   ├── src/
│   │   │   ├── App.tsx           # Main component
│   │   │   ├── components/
│   │   │   │   └── Editor.tsx    # TipTap editor
│   │   │   ├── store/
│   │   │   │   └── useNotesStore.ts  # Zustand state
│   │   │   └── types/
│   │   │       └── index.ts      # TypeScript types
│   │   └── index.html
│   │
│   └── preload/
│       └── index.ts               # IPC bridge (main ↔ renderer)
```

### Common Tasks

**Add a new IPC handler:**

1. Add handler in `src/main/index.ts`:
   ```typescript
   ipcMain.handle('notes:myNewMethod', async (_, arg) => {
     return db.myNewMethod(arg)
   })
   ```

2. Add to preload API in `src/preload/index.ts`:
   ```typescript
   myNewMethod: (arg: string) => ipcRenderer.invoke('notes:myNewMethod', arg)
   ```

3. Use in renderer via `window.api.myNewMethod(arg)`

**Add a new database method:**

1. Add to `DatabaseService.ts`
2. Add IPC handler in main process
3. Expose via preload
4. Call from React components

**Add a new React component:**

1. Create in `src/renderer/src/components/`
2. Import and use in `App.tsx` or other components
3. Use Zustand store for state: `const { notes } = useNotesStore()`

### Hot Reload

**What triggers reload:**

- **Renderer code changes** (React, CSS): Hot reload (state preserved)
- **Main process changes** (database, IPC): Full restart required
- **Preload changes**: Full restart required

**Restart dev server:**

1. Stop: Ctrl+C in terminal
2. Start: `npm run dev`

---

## Troubleshooting

### App Won't Launch

**Error: "better-sqlite3 module version mismatch"**

```bash
# Rebuild native modules for Electron
npx electron-rebuild

# If that fails, clean and reinstall
rm -rf node_modules package-lock.json
npm install
npx electron-rebuild
```

### Database Issues

**Error: "database locked"**

- Quit all instances of the app
- Delete WAL files:
  ```bash
  rm ~/Library/Application\ Support/nexus-desktop/data/*.db-wal
  rm ~/Library/Application\ Support/nexus-desktop/data/*.db-shm
  ```

**Notes not persisting:**

- Check console for errors (View → Toggle Developer Tools)
- Verify database exists: `ls ~/Library/Application\ Support/nexus-desktop/data/`
- Check IPC handlers are registered (look for `setupDatabaseHandlers()` in main process logs)

### Editor Issues

**Formatting toolbar not working:**

- Check TipTap editor initialized: `editor` should not be null
- Look for console errors
- Verify buttons call `editor.chain().focus()...` methods

**Syntax highlighting missing:**

- Check `lowlight` is imported in `Editor.tsx`
- Verify code block extension is configured: `CodeBlockLowlight`
- CSS should have `.hljs-*` classes

### Build Issues

**Build fails:**

```bash
# Clean build artifacts
npm run build:clean  # if available
rm -rf dist/ out/

# Rebuild
npm run build
```

**TypeScript errors:**

```bash
# Check types
npx tsc --noEmit

# Fix auto-fixable issues
npx tsc --noEmit --watch
```

---

## Next Steps

After running and testing:

1. **Read [DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md)** - See the full roadmap
2. **Review Sprint Planning** - [SPRINT-1.md](../SPRINT-1.md), [SPRINT-2.md](../SPRINT-2.md), [SPRINT-3.md](../SPRINT-3.md)
3. **Start Contributing** - Pick a sprint from the plan
4. **Report Issues** - Open issues on GitHub

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development mode |
| `npm run build` | Build for production |
| `npm run build:mac` | Package macOS app |
| `npx electron-rebuild` | Rebuild native modules |

**Database:**
- Location: `~/Library/Application Support/nexus-desktop/data/nexus.db`
- Reset: `rm -rf ~/Library/Application\ Support/nexus-desktop/`

**Logs:**
- Main process: Terminal running `npm run dev`
- Renderer process: DevTools console (Cmd+Option+I)

---

**Last Updated**: 2024-12-24
**App Version**: 0.3.0 (Sprint 7 - Tags System)
**Features**: PARA Folders, Wiki Links, Tags with Filtering
**Next Sprint**: Sprint 8 - Search & Filter Enhancements
