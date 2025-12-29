# Brainstorm: Tauri → SwiftUI Migration

**Generated:** 2025-12-28
**Context:** Considering migrating desktop app from Tauri to native SwiftUI
**Current Stack:** Tauri + React + TypeScript

---

## Current Pain Points with Tauri

### What's Not Working Well?
- [ ] Webview rendering issues?
- [ ] Native API integration complexity?
- [ ] Build/packaging problems?
- [ ] Performance concerns?
- [ ] Bundle size?
- [ ] macOS integration (menu bar, notifications)?
- [ ] Code signing / notarization?
- [ ] Hot reload / dev experience?

*Please share specific issues to inform the decision*

---

## Migration Options

### Option A: Full SwiftUI Native App
**Effort:** High (2-4 weeks)
**Result:** 100% native macOS app

```
scribe-swiftui/
├── Scribe/
│   ├── App/
│   │   ├── ScribeApp.swift
│   │   └── ContentView.swift
│   ├── Views/
│   │   ├── Sidebar/
│   │   ├── Editor/
│   │   └── MissionControl/
│   ├── Models/
│   ├── Services/
│   │   ├── DatabaseService.swift
│   │   ├── AIService.swift
│   │   └── SyncService.swift
│   └── Resources/
└── Package.swift
```

**Pros:**
- Native performance
- Perfect macOS integration (menu bar, shortcuts, notifications)
- Smaller bundle size (~10MB vs ~100MB)
- Better accessibility
- Native look and feel
- SwiftData for persistence

**Cons:**
- Complete rewrite (no code sharing with browser)
- SwiftUI learning curve
- macOS only (no Windows/Linux)
- Two separate codebases to maintain

---

### Option B: SwiftUI Shell + WebView (Hybrid)
**Effort:** Medium (1-2 weeks)
**Result:** Native shell with existing React UI

```
scribe-hybrid/
├── Scribe/
│   ├── App/
│   │   ├── ScribeApp.swift
│   │   └── MainWindow.swift
│   ├── Views/
│   │   ├── WebViewContainer.swift  # Hosts React app
│   │   └── NativeToolbar.swift     # Native menu/toolbar
│   ├── Bridge/
│   │   ├── JSBridge.swift          # JS ↔ Swift communication
│   │   └── NativeAPI.swift         # Native capabilities
│   └── Resources/
│       └── webapp/                  # Bundled React app
└── Package.swift
```

**Pros:**
- Reuse existing React UI
- Native window chrome / menu bar
- Better than Tauri for macOS integration
- Incremental migration possible

**Cons:**
- Still WebView-based rendering
- Bridge complexity
- Two languages in one project

---

### ⭐ Option C: Parallel Development (Recommended)
**Effort:** Spread over time
**Result:** Browser PWA + Native SwiftUI (separate apps)

```
Git Worktree Strategy:
────────────────────────────────────────────────────────
main branch (current)
    │
    ├── feat/mission-control-hud (current worktree)
    │   └── Browser PWA + Tauri desktop
    │
    └── feat/swiftui-native (NEW worktree)
        └── Pure SwiftUI native app
────────────────────────────────────────────────────────

Directory Structure:
~/projects/scribe/
├── mission-control-hud/     # Current worktree (browser + tauri)
└── swiftui-native/          # NEW worktree (pure SwiftUI)
```

**Pros:**
- No disruption to current work
- Can develop in parallel
- Compare approaches side-by-side
- Browser PWA remains fully functional
- Native app can be opinionated/different

**Cons:**
- Two apps to maintain long-term
- Feature parity challenge

---

### Option D: Electron (Alternative)
**Effort:** Low (3-5 days)
**Result:** Cross-platform desktop with better tooling

**Pros:**
- Mature ecosystem
- Better DevTools
- Easier packaging

**Cons:**
- Larger bundle (~150MB+)
- Still not native
- Memory overhead

---

### Option E: Browser-Only + Menu Bar Helper
**Effort:** Low (1 week)
**Result:** PWA + tiny native menu bar app

```
Strategy:
1. Keep browser PWA as main app
2. Build tiny SwiftUI menu bar helper:
   - Quick capture (⌘⇧C global)
   - Daily note shortcut
   - Word count display
   - Sync status
```

**Pros:**
- Minimal native code
- Best of both worlds
- PWA handles heavy lifting
- Menu bar for quick actions

**Cons:**
- Not a "real" desktop app
- Requires browser to be running

---

## Comparison Matrix

| Aspect | Tauri | SwiftUI Native | Hybrid | Electron | PWA + Helper |
|--------|-------|----------------|--------|----------|--------------|
| Bundle size | ~100MB | ~10MB | ~50MB | ~150MB | ~1MB |
| Performance | Good | Excellent | Good | Fair | Excellent |
| macOS integration | Fair | Excellent | Good | Fair | Good |
| Code reuse | High | None | Medium | High | High |
| Dev experience | Fair | Good | Complex | Good | Good |
| Maintenance | Medium | Medium | High | Medium | Low |
| Cross-platform | Yes | No | No | Yes | Yes (web) |

---

## Parallel Worktree Strategy

### Step 1: Create New Worktree
```bash
# From the scribe repo root
cd ~/projects/scribe

# Create new branch for SwiftUI
git branch feat/swiftui-native main

# Create worktree
git worktree add ../scribe-swiftui feat/swiftui-native

# Result:
# ~/projects/scribe/mission-control-hud  → feat/mission-control-hud
# ~/projects/scribe/scribe-swiftui       → feat/swiftui-native
```

### Step 2: Initialize SwiftUI Project
```bash
cd ~/projects/scribe/scribe-swiftui

# Create Xcode project or use Swift Package
mkdir -p Scribe/Sources
# ... set up SwiftUI app structure
```

### Step 3: Parallel Development Workflow
```
Week 1-2: Core SwiftUI setup
├── App structure
├── Data models (mirror browser types)
├── SQLite integration (shared schema)
└── Basic editor view

Week 3-4: Feature parity
├── Vault sidebar
├── Editor with markdown
├── Mission Control
└── Sync mechanism

Week 5+: Native enhancements
├── Menu bar integration
├── Spotlight integration
├── Share extensions
└── Widgets
```

---

## Shared Data Strategy

### SQLite Schema (Same for Both)
```sql
-- Both apps use identical schema
-- Can sync via iCloud or file system

CREATE TABLE vaults (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  vault_id TEXT REFERENCES vaults(id),
  title TEXT,
  content TEXT,
  -- ... rest of schema
);
```

### Sync Options
1. **iCloud Drive** - Both apps read/write markdown files
2. **CloudKit** - Native sync (SwiftUI only)
3. **Custom sync server** - Full control
4. **File-based** - Export/import JSON

---

## SwiftUI Tech Stack

### Recommended Libraries
```swift
// Core
- SwiftUI (UI framework)
- SwiftData (persistence) or GRDB (SQLite)
- Combine (reactive)

// Editor
- HighlightedTextEditor (syntax highlighting)
- Or: NSTextView wrapped for advanced editing

// Markdown
- swift-markdown (Apple's parser)
- Ink (rendering)

// AI Integration
- Swift OpenAI (Claude/GPT APIs)
- Or: Command-line claude/gemini via Process
```

### Native Advantages
```swift
// Global keyboard shortcuts
KeyboardShortcuts.onKeyDown(for: .quickCapture) {
    showQuickCaptureWindow()
}

// Menu bar
MenuBarExtra("Scribe", systemImage: "doc.text") {
    QuickActionsMenu()
}

// Spotlight integration
CSSearchableIndex.default().indexSearchableItems(items)

// Widgets
struct ScribeWidget: Widget {
    var body: some WidgetConfiguration {
        // Word count, streak, recent notes
    }
}
```

---

## Recommendation

### ⭐ Recommended Path: Option C + E

**Phase 1: Now**
1. Continue browser PWA development (Plan B UI redesign)
2. Create SwiftUI worktree for experimentation
3. Build small menu bar helper first (prove the concept)

**Phase 2: Next Month**
1. Expand menu bar helper if successful
2. Or: Begin full SwiftUI app development
3. Keep browser PWA as primary

**Phase 3: Future**
1. Evaluate which approach users prefer
2. Consider deprecating Tauri entirely
3. Maintain browser + native as two products

---

## Immediate Next Steps

### Option 1: Create Worktree Now
```bash
# Commands to run:
cd ~/projects/scribe
git branch feat/swiftui-native main
git worktree add ../scribe-swiftui feat/swiftui-native
cd ../scribe-swiftui
mkdir -p Scribe
```

### Option 2: Menu Bar Helper First
```bash
# Smaller scope, prove concept
# Create simple SwiftUI menu bar app
# Test: global shortcuts, quick capture, sync status
```

### Option 3: Continue Current Work
```
# Finish Plan B UI redesign first
# Evaluate Tauri pain points more specifically
# Make informed decision later
```

---

## Questions to Resolve

1. **What specific Tauri issues** are causing problems?
2. **Is cross-platform important** (Windows/Linux)?
3. **Timeline pressure** - when is desktop app needed?
4. **Feature parity** - must SwiftUI match browser 100%?
5. **AI integration** - CLI-based or API-based in native?

---

## ✅ Implementation Status

**Option C Selected and Implemented!**

### Worktrees Created

| Worktree | Branch | Path | Stack |
|----------|--------|------|-------|
| mission-control-hud | feat/mission-control-hud | `~/.git-worktrees/scribe/mission-control-hud/` | React + Tauri |
| swiftui-native | feat/swiftui-native | `~/.git-worktrees/scribe/swiftui-native/` | SwiftUI + Swift |

### SwiftUI Scaffold Complete ✓

```
Scribe/
├── Package.swift              # Dependencies (GRDB, swift-markdown, KeyboardShortcuts)
├── Sources/Scribe/
│   ├── ScribeApp.swift        # App entry + menu bar
│   ├── Models/                # Vault, Page (matches browser schema)
│   ├── Views/                 # ContentView, Sidebar, Editor, Mission Control
│   ├── Store/                 # AppState (like Zustand)
│   └── Services/              # DatabaseService (SQLite)
└── Tests/                     # Unit tests
```

### Quick Start Commands

```bash
# Switch to SwiftUI worktree
cd ~/.git-worktrees/scribe/swiftui-native

# Build
cd Scribe && swift build

# Run
swift run

# Open in Xcode
open Scribe/Package.swift

# Switch back to browser version
cd ~/.git-worktrees/scribe/mission-control-hud
```

### Parallel Development Workflow

```
Browser Version (mission-control-hud)    SwiftUI Version (swiftui-native)
────────────────────────────────────    ─────────────────────────────────
React + Tauri                            Pure SwiftUI (macOS 14+)
npm run dev                              swift run
Port 5173/5180                           Native app

Same SQLite schema → potential sync
Same terminology (Vaults, Pages, Inbox)
Same ADHD principles
```

---

*Created: 2025-12-28*
*Status: ✅ Option C Implemented*
