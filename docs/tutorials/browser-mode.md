# Browser Mode Tutorial

> **Use Scribe in your browser for development, testing, and demos**

---

## What You'll Learn

- Launch Scribe in browser mode
- Understand browser vs desktop differences
- Use IndexedDB for persistence
- Test features without Tauri
- Share demos with others

**Time:** 7 minutes
**Prerequisites:** None (browser only!)

---

## What Is Browser Mode?

**Browser Mode** is a web-based version of Scribe that runs entirely in your browser:

- ✅ **No installation:** Just open a URL
- ✅ **Same UI:** Identical interface to desktop
- ✅ **IndexedDB:** Persistent storage (survives refresh)
- ✅ **Fast iteration:** Reload to see changes
- ⚠️ **Limited features:** No AI, Terminal, File System

**Use cases:**
- Frontend development and testing
- Quick demos
- UI/UX experimentation
- E2E test debugging

**Not for:**
- Production writing (use Tauri desktop app)
- AI-powered features (CLI not available)
- File system operations (Tauri-only)

---

## Step 1: Launch Browser Mode

### Method 1: npm Command

```bash
cd /path/to/scribe
npm run dev:vite
```

**Output:**
```
  VITE v5.0.0  ready in 347 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Method 2: CLI Alias

```bash
scribe browser
```

Opens browser automatically at `http://localhost:5173`

### Method 3: Manual

```bash
npm run dev:vite &
open http://localhost:5173
```

**Result:** Scribe loads in your default browser.

---

## Step 2: First Launch

### Demo Data Seeding

On first launch, browser mode automatically seeds demo data:

```
[Scribe] Demo data seeding...
  ✓ Created "Getting Started" project
  ✓ Created 3 demo notes
  ✓ Created 2 demo tags
  ✓ Seeded successfully
```

**Demo content:**
- 1 project ("Getting Started")
- 3 notes (Welcome, Features, Daily Note Example)
- 2 tags (#getting-started, #demo)

**Why?** Helps you explore features immediately.

---

## Step 3: Understanding IndexedDB

### What Is IndexedDB?

**IndexedDB** is browser-native database storage:

```
Browser Storage:
┌─────────────────────────────┐
│ localStorage (5 MB limit)   │  ← Settings only
├─────────────────────────────┤
│ IndexedDB (50+ MB)          │  ← All your data
│  - notes                    │
│  - projects                 │
│  - tags                     │
│  - chat_sessions            │
│  - chat_messages            │
└─────────────────────────────┘
```

**Persistence:** Data survives browser refresh!

### Viewing Your Data

**Chrome DevTools:**

1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB**
4. Click **scribe-browser**
5. Inspect tables: notes, projects, tags, etc.

**Example:**

```
IndexedDB → scribe-browser → notes
┌─────────────────────────────────┐
│ id: "uuid-123"                   │
│ title: "Welcome to Scribe"       │
│ content: "# Welcome\n\nScribe..." │
│ folder: "notes"                  │
│ created_at: 1704067200           │
└─────────────────────────────────┘
```

---

## Step 4: Feature Differences

### Working Features ✅

| Feature | Status | Notes |
|---------|--------|-------|
| **Editor** | ✅ Full | All editing modes work |
| **Projects** | ✅ Full | CRUD operations |
| **Notes** | ✅ Full | Create, edit, delete |
| **Search** | ✅ Full | Full-text search via Dexie |
| **Tags** | ✅ Full | Tag autocomplete |
| **Wiki Links** | ✅ Full | Backlinks panel |
| **Properties** | ✅ Full | Custom properties |
| **Mission Control** | ✅ Full | Dashboard navigation |
| **Command Palette** | ✅ Full | ⌘K quick actions |
| **Themes** | ✅ Full | All 10 themes |
| **Keyboard Shortcuts** | ✅ Full | All shortcuts work |
| **Chat Persistence** | ✅ Full | IndexedDB storage |
| **Quick Actions** | ✅ UI only | Buttons work, AI stubbed |
| **@ References** | ✅ Full | Note autocomplete |

### Stubbed Features ⚠️

| Feature | Status | Behavior |
|---------|--------|----------|
| **AI (Claude/Gemini)** | ⚠️ Stub | Shows "AI unavailable in browser" |
| **Terminal** | ⚠️ Stub | Shows "Terminal unavailable" |
| **File System** | ⚠️ N/A | No file picker |
| **Obsidian Sync** | ⚠️ N/A | Tauri-only |
| **Pandoc Export** | ⚠️ N/A | No backend process |
| **Font Installation** | ⚠️ N/A | No Homebrew access |

### Stub Messages

When you try AI features:

```
┌────────────────────────────────┐
│ AI Features Unavailable        │
├────────────────────────────────┤
│ AI features are only available │
│ in the desktop app.            │
│                                │
│ Run 'npm run dev' to test AI   │
│ features in Tauri mode.        │
└────────────────────────────────┘
```

---

## Step 5: Development Workflow

### Frontend Development

```bash
# 1. Start browser mode
npm run dev:vite

# 2. Make UI changes in src/renderer/

# 3. Browser auto-reloads (Vite HMR)

# 4. Test in browser immediately
```

**Hot reload:** Changes appear without manual refresh.

### Testing Changes

```bash
# Run E2E tests in browser
npm run test:e2e

# Tests use browser mode by default
# Playwright starts dev:vite automatically
```

### Debugging

**Browser DevTools:**

1. F12 → Console (see logs)
2. Network tab (API calls)
3. Application → IndexedDB (data inspection)
4. React DevTools (component tree)

**Example debugging:**

```javascript
// In browser console
window.scribeDb.notes.toArray().then(console.log)
// → Shows all notes from IndexedDB
```

---

## Step 6: Sharing Demos

### Local Network Access

```bash
# Expose to local network
npm run dev:vite -- --host

# Output:
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

Share `http://192.168.1.100:5173/` with team on same WiFi.

### Demo Scenarios

**Scenario 1: UI Review**

```
1. npm run dev:vite -- --host
2. Share network URL with designer
3. Designer opens in their browser
4. They test UI without installing anything
```

**Scenario 2: Feature Preview**

```
1. Implement new feature (frontend only)
2. Deploy to demo site (Vercel, Netlify)
3. Share URL: https://scribe-demo.vercel.app
4. Stakeholders test immediately
```

---

## Step 7: Data Management

### Clear Data

**Method 1: DevTools**

1. F12 → Application
2. Storage → Clear site data
3. Reload page

**Method 2: JavaScript**

```javascript
// In browser console
indexedDB.deleteDatabase('scribe-browser')
location.reload()
```

**Result:** Fresh start with demo data seeded again.

### Export Data

**Coming in v2:**

```javascript
// Export all notes to JSON
const notes = await window.scribeDb.notes.toArray()
const json = JSON.stringify(notes, null, 2)
console.log(json)
// Copy/paste to save
```

### Import Data

**Manual for now:**

```javascript
// Import notes from JSON
const notesToImport = [ /* JSON array */ ]
await window.scribeDb.notes.bulkAdd(notesToImport)
```

---

## Common Workflows

### Workflow 1: Frontend Feature Development

```bash
# Terminal 1: Dev server
npm run dev:vite

# Terminal 2: Watch for changes
npm run typecheck -- --watch

# Browser: http://localhost:5173
# Edit src/renderer/src/components/
# See changes instantly
```

### Workflow 2: UI Testing

```bash
# Run tests
npm run test:e2e

# Debug test in browser
npx playwright test --ui

# Playwright Inspector shows browser mode
```

### Workflow 3: Demo Preparation

```bash
# 1. Clear data
indexedDB.deleteDatabase('scribe-browser')

# 2. Reload (demo data seeds)

# 3. Create custom demo content

# 4. Share URL with stakeholders
```

---

## Architecture Details

### API Factory Pattern

```typescript
// src/renderer/src/lib/api.ts

import { isTauri } from './platform'

export const api = isTauri()
  ? tauriApi      // Desktop: Tauri commands
  : browserApi    // Browser: IndexedDB
```

**Same interface, different backends:**

```typescript
api.createNote(...)  // Works in both modes
api.searchNotes(...) // Works in both modes
api.runClaude(...)   // Tauri: CLI, Browser: Stub
```

### Browser API Implementation

```typescript
// src/renderer/src/lib/browser-api.ts

export const browserApi = {
  async createNote(title, content, folder) {
    const id = crypto.randomUUID()
    await db.notes.add({ id, title, content, folder, ... })
    return id
  },

  async searchNotes(query) {
    return db.notes
      .where('search_text')
      .startsWithIgnoreCase(query)
      .toArray()
  },

  async runClaude(prompt, context) {
    // Stub: Return error message
    return "AI features are only available in the desktop app."
  }
}
```

---

## Troubleshooting

### Page Won't Load

**Problem:** `http://localhost:5173` shows error

**Solutions:**

1. Check dev server is running:
   ```bash
   npm run dev:vite
   ```

2. Check port 5173 isn't in use:
   ```bash
   lsof -i :5173
   ```

3. Try different port:
   ```bash
   npm run dev:vite -- --port 3000
   ```

### Data Not Persisting

**Problem:** Refresh loses all data

**Solutions:**

1. Check browser isn't in incognito mode
2. Verify IndexedDB in DevTools → Application
3. Check browser storage quota

### AI Features Not Working

**Expected:** Browser mode can't access Claude CLI

**Solution:** Use Tauri mode for AI:

```bash
npm run dev  # Not dev:vite
```

---

## Advanced Tips

### Seed Custom Data

```javascript
// Edit src/renderer/src/lib/browser-db.ts

export const seedDemoData = async () => {
  // Customize demo projects, notes, tags
  await db.projects.add({
    id: generateId(),
    name: "My Custom Project",
    type: "research",
    ...
  })
}
```

### Debug Performance

```javascript
// Measure query speed
console.time('search')
const results = await db.notes.where('search_text').startsWithIgnoreCase('test').toArray()
console.timeEnd('search')
// → search: 12.3ms
```

### Network Inspection

```
DevTools → Network tab
Filter: Fetch/XHR
See: No backend requests (all local!)
```

---

## Keyboard Shortcuts

Same as desktop mode:

| Shortcut | Action |
|----------|--------|
| ⌘N | New Note |
| ⌘D | Daily Note |
| ⌘F | Search |
| ⌘K | Command Palette |
| ⌘0 | Mission Control |
| ⌘, | Settings |

**All shortcuts work in browser mode!**

---

## Next Steps

- **Try it:** `npm run dev:vite`
- **Explore:** Test all UI features
- **Develop:** Make frontend changes
- **Compare:** Switch to Tauri mode (`npm run dev`)

---

## See Also

- [Architecture Documentation](../DUAL-MODE-ARCHITECTURE.md) - Technical details
- [Features Overview](../guide/features.md) - What works where
- [Development Guide](../development/contributing.md) - Contributing code
- [Tauri vs Browser Feature Matrix](../TAURI-BROWSER-FEATURE-REVIEW.md)
