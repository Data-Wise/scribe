# Mission Control v1.2 - Walkthrough Test

**Date:** 2025-12-27
**Feature:** Dashboard-first experience with ADHD-friendly project overview

---

## Pre-Test Setup

1. Scribe app is running (`npm run dev`)
2. You have at least one project created (if not, we'll create one)

---

## Test 1: Dashboard View (Smart Startup)

**Expected:** After 4+ hours away, app opens to Dashboard. Otherwise, resumes editor.

### Steps:
1. Look at the current view
2. If you see a grid of project cards with "Mission Control" header → Dashboard is showing
3. If you see the editor → Press `⌘H` to toggle to Dashboard

**Verify:**
- [ ] Header shows "Mission Control" with settings gear icon
- [ ] Quick Actions bar visible (3 buttons: Daily Note, New Note, Quick Capture)
- [ ] Project cards grid visible (or "No projects yet" message)

---

## Test 2: View Toggle (⌘0)

**Expected:** Pressing ⌘0 (zero) toggles between Dashboard and Editor views.
> Note: ⌘H is macOS "Hide Window", so we use ⌘0 instead.

### Steps:
1. Note your current view (Dashboard or Editor)
2. Press `⌘0` (zero key)
3. View should switch
4. Press `⌘0` again
5. View should switch back

**Verify:**
- [ ] ⌘0 toggles Dashboard → Editor
- [ ] ⌘0 toggles Editor → Dashboard
- [ ] Transition is smooth

---

## Test 3: Quick Actions Bar

**Expected:** Three action buttons that trigger their respective actions.

### Steps:
1. From Dashboard, look at the Quick Actions bar
2. Click "Daily Note" button (or press `⌘D`)
3. Should create/open today's daily note and switch to Editor
4. Press `⌘H` to return to Dashboard
5. Click "New Note" button (or press `⌘N`)
6. Should create new note and switch to Editor

**Verify:**
- [ ] Daily Note button works (creates/opens daily note)
- [ ] New Note button works (creates new note)
- [ ] Keyboard shortcuts shown on buttons (⌘D, ⌘N, ⌘⇧C)

---

## Test 4: Quick Capture Overlay (⌘⇧C)

**Expected:** Modal overlay for quick thought capture.

### Steps:
1. From anywhere (Dashboard or Editor), press `⌘⇧C`
2. Quick Capture overlay should appear
3. Type some text: "Test capture from walkthrough"
4. Press `Escape` to cancel (text discarded)
5. Press `⌘⇧C` again
6. Type: "This is a real capture"
7. Press `⌘Enter` to save (or click Capture button)
8. Overlay closes, note should be created

**Verify:**
- [ ] ⌘⇧C opens Quick Capture overlay
- [ ] Overlay has purple lightning bolt icon
- [ ] Escape closes without saving
- [ ] ⌘Enter saves and closes
- [ ] "Capture" button works
- [ ] Footer shows "Saves to inbox" hint

---

## Test 5: Project Cards

**Expected:** Cards display project info with visual hierarchy.

### Steps:
1. From Dashboard, examine a project card
2. Note the elements:
   - Status dot (colored circle)
   - Type badge (icon + label like "Research", "Teaching")
   - Project name
   - Description (if set)
   - "Updated X ago" timestamp
3. Click a project card
4. Should switch to Editor with that project selected

**Verify:**
- [ ] Status dot shows project color
- [ ] Type badge shows correct icon and label
- [ ] Project name is prominent
- [ ] Hover effect on cards
- [ ] Click navigates to Editor

---

## Test 6: Streak Display (Opt-in)

**Expected:** Streak only shows at milestones (7/30/100/365 days) when enabled.

### Steps:
1. From Dashboard, click the Settings gear icon (top right)
2. In Settings modal, go to "General" tab
3. Look for "ADHD Features" section
4. Find "Show streak milestones" toggle
5. Toggle it ON
6. Close Settings
7. If you have a 3+ day streak, you'll see the flame icon

**Verify:**
- [ ] Settings has "Show streak milestones" toggle
- [ ] Default is OFF (ADHD-friendly)
- [ ] When ON, streak appears at 3+ days
- [ ] Milestones (7/30/100/365) get special celebration styling

---

## Test 7: Keyboard Shortcuts Summary

| Shortcut | Expected Action |
|----------|-----------------|
| `⌘0` | Toggle Dashboard ↔ Editor (zero key) |
| `⌘⇧C` | Open Quick Capture overlay |
| `⌘D` | Create/open Daily Note |
| `⌘N` | Create new note |
| `⌘,` | Open Settings |
| `Escape` | Close overlay/modal |

### Steps:
1. Test each shortcut from Dashboard
2. Test each shortcut from Editor
3. Verify they work in both contexts

**Verify:**
- [ ] All shortcuts work from Dashboard
- [ ] All shortcuts work from Editor

---

## Test 8: Session Persistence

**Expected:** View mode persists across app restarts.

### Steps:
1. Switch to Dashboard view (⌘H if needed)
2. Quit the app completely (⌘Q)
3. Wait a few seconds
4. Relaunch the app
5. Should remember last view (Dashboard)

**Verify:**
- [ ] App remembers last view mode
- [ ] Session timestamp updates on activity

---

## Test Results

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| 1. Dashboard View | | |
| 2. View Toggle | | |
| 3. Quick Actions | | |
| 4. Quick Capture | | |
| 5. Project Cards | | |
| 6. Streak Display | | |
| 7. Keyboard Shortcuts | | |
| 8. Session Persistence | | |

---

## Known Limitations (v1.2)

1. **Quick Capture (⌘⇧C)** only works when app is focused
   - Global shortcut (works from any app) deferred to v1.3

2. **Streak calculation** uses existing session data
   - May need a few days of use to show streak

3. **Project stats** (word count, note count) not yet implemented
   - Cards show project info only
