# Scribe Chrome UI Tests

> **Comprehensive UI Test Suite for Chrome MCP Browser Automation**
>
> Generated: 2025-12-29

---

## Overview

This document defines UI tests for Scribe that can be executed using Claude Code's Chrome MCP integration. These tests verify visual appearance, user interactions, and end-to-end workflows in the browser.

**Test Environment:** `npm run dev:vite` → `http://localhost:5173`

---

## Test Categories

| Category | Count | Focus |
|----------|-------|-------|
| Navigation & Layout | 12 | Core app structure |
| Editor Tabs | 10 | Tab management |
| Left Sidebar | 14 | Project sidebar modes |
| Right Sidebar | 10 | Properties/Backlinks/Tags |
| Editor | 12 | HybridEditor functionality |
| Keyboard Shortcuts | 15 | All ⌘ shortcuts |
| Modals & Dialogs | 10 | Command palette, settings, etc. |
| Mission Control | 8 | Dashboard features |
| Project Management | 8 | CRUD operations |
| Note Management | 10 | CRUD + search |
| Focus Mode | 5 | Distraction-free writing |
| Theme & Appearance | 6 | Visual styling |
| **Total** | **120** | |

---

## 1. Navigation & Layout Tests

### 1.1 App Initial Load
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| NAV-01 | Page title shows "Scribe" | Navigate to localhost:5173 | Browser tab shows "Scribe" |
| NAV-02 | Three-column layout renders | Load app | Left sidebar + Editor + Right sidebar visible |
| NAV-03 | Mission Control tab is pinned | Load app | First tab shows "Mission Control" with pin icon |
| NAV-04 | Default project exists | Load app (fresh) | "Research" project appears in sidebar |

### 1.2 Responsive Layout
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| NAV-05 | Right sidebar collapse | Click collapse button | Sidebar shrinks to 48px icon-only mode |
| NAV-06 | Right sidebar expand | Click expand button | Sidebar expands to full width |
| NAV-07 | Left sidebar icon mode | Cycle to icon mode (⌘0) | Sidebar shows only project icons |
| NAV-08 | Left sidebar compact mode | Cycle to compact mode | Sidebar shows project list |
| NAV-09 | Left sidebar card mode | Cycle to card mode | Sidebar shows full project cards |

### 1.3 Titlebar
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| NAV-10 | Drag region exists | Inspect top of window | Titlebar drag region present |
| NAV-11 | Window controls (Tauri) | Check window buttons | Close/minimize/maximize buttons (Tauri only) |
| NAV-12 | Browser mode indicator | Load in browser | Shows IndexedDB mode indicator |

---

## 2. Editor Tabs Tests

### 2.1 Tab Management
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| TAB-01 | Mission Control pinned | Try to close MC tab | Tab cannot be closed (no X button) |
| TAB-02 | Open note creates tab | Click note in sidebar | New tab opens with note title |
| TAB-03 | Close tab (X button) | Click X on note tab | Tab closes, previous tab activates |
| TAB-04 | Close tab (middle-click) | Middle-click on tab | Tab closes |
| TAB-05 | Tab switch via click | Click different tab | Tab content changes |

### 2.2 Tab Keyboard Shortcuts
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| TAB-06 | ⌘1 switches to tab 1 | Press ⌘1 | First tab (Mission Control) activates |
| TAB-07 | ⌘2 switches to tab 2 | Open note, press ⌘2 | Second tab activates |
| TAB-08 | ⌘W closes current tab | Focus on note tab, press ⌘W | Tab closes |
| TAB-09 | ⌘W doesn't close pinned | Focus on MC tab, press ⌘W | Nothing happens |
| TAB-10 | Tab gradient accent | Open note in project | Tab shows project color gradient |

---

## 3. Left Sidebar Tests

### 3.1 Icon Mode (48px)
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| SBL-01 | Project icons display | Switch to icon mode | Project circles with initials visible |
| SBL-02 | Status dots visible | Check project icons | Colored dots showing project status |
| SBL-03 | Expand button | Click expand icon | Sidebar expands to compact mode |
| SBL-04 | Add project button | Click + icon | Opens create project modal |
| SBL-05 | Project tooltip | Hover over project icon | Shows name, status, note count |

### 3.2 Compact Mode (240px)
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| SBL-06 | Project list renders | Switch to compact mode | Project names visible in list |
| SBL-07 | Note count badges | Check project rows | Shows note count per project |
| SBL-08 | Active project highlight | Click project | Row highlights as selected |
| SBL-09 | Project toggle | Click active project | Deselects project (shows all notes) |

### 3.3 Card Mode (320px+)
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| SBL-10 | Project cards expand | Expand to card mode | Full project cards visible |
| SBL-11 | Recent notes in card | Expand project card | Shows up to 6 recent notes |
| SBL-12 | Note click opens tab | Click note in card | Opens note in editor tab |
| SBL-13 | Empty state CTA | Expand project with 0 notes | "Create first note" button visible |
| SBL-14 | Resize handle | Drag resize handle | Sidebar width adjusts |

---

## 4. Right Sidebar Tests

### 4.1 Tab Navigation
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| SBR-01 | Properties tab default | Open note | Properties tab is active |
| SBR-02 | Backlinks tab switch | Click Backlinks tab | Shows incoming/outgoing links |
| SBR-03 | Tags tab switch | Click Tags tab | Shows note tags |
| SBR-04 | ⌘] next tab | Press ⌘] | Cycles to next right sidebar tab |
| SBR-05 | ⌘[ previous tab | Press ⌘[ | Cycles to previous right sidebar tab |

### 4.2 Panel Content
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| SBR-06 | Properties show metadata | Select note | Created/updated dates, word count visible |
| SBR-07 | Backlinks show links | Select note with [[links]] | Incoming links listed |
| SBR-08 | Tags show note tags | Select note with #tags | Tags displayed |
| SBR-09 | Collapse to icons | Click collapse button | Shows Settings/Link/Tags icons only |
| SBR-10 | Click icon expands | Click icon in collapsed mode | Expands and switches to that tab |

---

## 5. Editor Tests

### 5.1 Content Editing
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| EDT-01 | Editor loads content | Select note | Note content displays |
| EDT-02 | Content saves on type | Type text, wait 1s | Content persists on refresh |
| EDT-03 | Title editing | Click title | Title becomes editable input |
| EDT-04 | Title saves | Edit title, press Enter | Title updates in sidebar |

### 5.2 Editor Modes
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| EDT-05 | Source mode | Press ⌘1 | Raw markdown visible |
| EDT-06 | Live preview mode | Press ⌘2 | Formatted preview with editing |
| EDT-07 | Reading mode | Press ⌘3 | Read-only formatted view |
| EDT-08 | Mode toggle (⌘E) | Press ⌘E | Cycles through modes |

### 5.3 Wiki Links & Tags
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| EDT-09 | Wiki link highlight | Type [[link]] | Link becomes clickable |
| EDT-10 | Wiki link autocomplete | Type [[ | Shows note suggestions |
| EDT-11 | Tag highlight | Type #tag | Tag becomes highlighted |
| EDT-12 | Tag autocomplete | Type # | Shows tag suggestions |

---

## 6. Keyboard Shortcuts Tests

### 6.1 Navigation Shortcuts
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| KEY-01 | ⌘N new note | Press ⌘N | Creates new note |
| KEY-02 | ⌘D daily note | Press ⌘D | Opens/creates today's daily note |
| KEY-03 | ⌘F search | Press ⌘F | Opens search panel |
| KEY-04 | ⌘K command palette | Press ⌘K | Opens command palette |
| KEY-05 | ⌘, settings | Press ⌘, | Opens settings modal |

### 6.2 View Shortcuts
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| KEY-06 | ⌘0 sidebar cycle | Press ⌘0 | Cycles sidebar mode |
| KEY-07 | ⌘B toggle left sidebar | Press ⌘B | Toggles left sidebar visibility |
| KEY-08 | ⌘⇧B toggle right sidebar | Press ⌘⇧B | Toggles right sidebar visibility |
| KEY-09 | ⌘⇧F focus mode | Press ⌘⇧F | Enters focus mode |
| KEY-10 | Escape exits focus | Press Escape in focus mode | Returns to normal mode |

### 6.3 Project Shortcuts
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| KEY-11 | ⌘⇧P new project | Press ⌘⇧P | Opens create project modal |
| KEY-12 | ⌘⇧C quick capture | Press ⌘⇧C | Opens quick capture overlay |
| KEY-13 | ⌘⇧E export | Press ⌘⇧E with note selected | Opens export dialog |
| KEY-14 | ⌘⇧G graph view | Press ⌘⇧G | Opens knowledge graph |
| KEY-15 | ⌘? shortcuts help | Press ⌘? | Opens keyboard shortcuts panel |

---

## 7. Modals & Dialogs Tests

### 7.1 Command Palette (⌘K)
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| MOD-01 | Palette opens | Press ⌘K | Command palette appears |
| MOD-02 | Note search | Type note name | Matching notes listed |
| MOD-03 | Quick actions | See default options | Create, Daily, Focus, etc. listed |
| MOD-04 | Escape closes | Press Escape | Palette closes |

### 7.2 Settings Modal
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| MOD-05 | Settings opens | Press ⌘, | Settings modal appears |
| MOD-06 | Theme selection | Click theme | Theme applies to app |
| MOD-07 | Font settings | Change font | Font updates in editor |
| MOD-08 | Close button | Click X | Modal closes |

### 7.3 Other Modals
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| MOD-09 | Create project modal | Press ⌘⇧P | Project creation form appears |
| MOD-10 | Search panel | Press ⌘F | Search panel with scope selector |

---

## 8. Mission Control Tests

### 8.1 Dashboard Content
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| MC-01 | Dashboard loads | Click Mission Control tab | Dashboard content displays |
| MC-02 | Project cards | View dashboard | Project cards with stats visible |
| MC-03 | Total stats | View header | Shows total notes, words, projects |
| MC-04 | Quick actions | View dashboard | New Note, Daily, Capture buttons |

### 8.2 Dashboard Interactions
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| MC-05 | Click project card | Click on project | Project becomes selected |
| MC-06 | Click note in recent | Click recent note | Opens note in tab |
| MC-07 | New Note button | Click New Note | Creates new note |
| MC-08 | Daily Note button | Click Daily | Opens today's daily note |

---

## 9. Project Management Tests

### 9.1 Project CRUD
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| PRJ-01 | Create project | Fill form, submit | New project appears in sidebar |
| PRJ-02 | Project types | Check dropdown | 5 types available (research, teaching, etc.) |
| PRJ-03 | Project color | Select color | Color shows in sidebar and tabs |
| PRJ-04 | Delete project | Context menu → Delete | Project removed (with confirm) |

### 9.2 Project Interaction
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| PRJ-05 | Select project | Click project | Notes filter to project |
| PRJ-06 | Deselect project | Click active project | Shows all notes |
| PRJ-07 | Archive project | Context menu → Archive | Project moves to archive |
| PRJ-08 | Restore project | Unarchive from context menu | Project becomes active |

---

## 10. Note Management Tests

### 10.1 Note CRUD
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| NTE-01 | Create note (⌘N) | Press ⌘N | New note created, opens in editor |
| NTE-02 | Note auto-save | Type content, wait | Content persists |
| NTE-03 | Delete note | Context menu → Delete | Note removed (with confirm) |
| NTE-04 | Duplicate note | Context menu → Duplicate | Copy created with "(copy)" suffix |

### 10.2 Note Search
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| NTE-05 | Search opens | Press ⌘F | Search panel appears |
| NTE-06 | Search by title | Type title text | Matching notes listed |
| NTE-07 | Search by content | Type content text | Notes with matching content shown |
| NTE-08 | Search scope selector | Change scope | All Notes vs Current Project |
| NTE-09 | Click search result | Click on result | Note opens in tab |
| NTE-10 | Clear search | Clear input | All notes visible again |

---

## 11. Focus Mode Tests

### 11.1 Focus Mode Behavior
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| FOC-01 | Enter focus mode | Press ⌘⇧F | Sidebars hide, minimal UI |
| FOC-02 | Exit with Escape | Press Escape | Returns to normal mode |
| FOC-03 | Exit button visible | Look at header | "Exit (⌘⇧F)" text visible |
| FOC-04 | Editor centered | Check layout | Editor content max-width centered |
| FOC-05 | Modals work | Press ⌘K in focus mode | Command palette still opens |

---

## 12. Theme & Appearance Tests

### 12.1 Visual Styling
| ID | Test | Steps | Expected |
|----|------|-------|----------|
| THM-01 | Default theme applied | Load app | Forest Night theme colors |
| THM-02 | Theme changes | Select different theme | Colors update throughout app |
| THM-03 | Project colors | Check project cards | Status color visible |
| THM-04 | Tab gradient | Open note in project | Tab shows gradient with project color |
| THM-05 | Dark mode | Check contrast | Text readable on dark background |
| THM-06 | Font settings | Change font in settings | Editor font updates |

---

## Execution Guide

### Running Tests with Chrome MCP

```bash
# 1. Start dev server
npm run dev:vite

# 2. Connect Claude Code to Chrome
claude --chrome

# 3. Navigate to app
# Use: mcp__claude-in-chrome__navigate with url=http://localhost:5173

# 4. Run tests interactively
# Use read_page, find, computer tools to verify each test
```

### Test Recording

Use `mcp__claude-in-chrome__gif_creator` to record test sessions:

1. `start_recording` before test sequence
2. Take screenshot after each action
3. `stop_recording` when done
4. `export` with descriptive filename

### Screenshot Verification

For visual tests, take screenshots and compare:

```
mcp__claude-in-chrome__computer action=screenshot
```

---

## Test Status Tracking

✅ **All tests implemented and passing as of 2025-12-29**

| Category | Tests | Passed | Coverage |
|----------|-------|--------|----------|
| Navigation & Layout (Smoke) | 4 | 4 | ✅ 100% |
| Navigation & Layout | 8 | 8 | ✅ 100% |
| Editor Tabs | 13 | 13 | ✅ 100% |
| Left Sidebar | 14 | 14 | ✅ 100% |
| Right Sidebar | 10 | 10 | ✅ 100% |
| Editor | 12 | 12 | ✅ 100% |
| Keyboard Shortcuts | 15 | 15 | ✅ 100% |
| Modals & Dialogs | 10 | 10 | ✅ 100% |
| Mission Control | 8 | 8 | ✅ 100% |
| Project Management | 8 | 8 | ✅ 100% |
| Note Management | 10 | 10 | ✅ 100% |
| Focus Mode | 5 | 5 | ✅ 100% |
| Theme & Appearance | 6 | 6 | ✅ 100% |
| Mission Sidebar | 6 | 6 | ✅ 100% |
| **Total** | **129** | **129** | **✅ 100%** |

**Note:** 3 additional Tab Drag Reorder tests (TAB-11, TAB-12, TAB-13) added beyond original spec.

---

## Priority Order

### P0 - Critical Path (Run First)
1. NAV-01 to NAV-04 (App loads correctly)
2. TAB-01 to TAB-05 (Basic tab management)
3. EDT-01 to EDT-04 (Can create and edit notes)
4. NTE-01 to NTE-02 (Note CRUD basics)

### P1 - Core Features
5. SBL-01 to SBL-14 (Left sidebar modes)
6. SBR-01 to SBR-10 (Right sidebar panels)
7. KEY-01 to KEY-15 (Keyboard shortcuts)
8. MC-01 to MC-08 (Mission Control)

### P2 - Extended Features
9. PRJ-01 to PRJ-08 (Project management)
10. NTE-05 to NTE-10 (Search)
11. MOD-01 to MOD-10 (Modals)
12. EDT-05 to EDT-12 (Editor modes)

### P3 - Polish
13. FOC-01 to FOC-05 (Focus mode)
14. THM-01 to THM-06 (Themes)

---

*Last Updated: 2025-12-29*
*E2E Implementation Complete: 129 tests passing*
