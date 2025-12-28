# Mission Control Starting Page - Enhancement Ideas

**Generated:** 2025-12-27
**Branch:** wonderful-wilson
**Sprint:** 25 Planning

---

## Current State

Mission Control serves as the app's starting dashboard with:
- **Header**: Title, total stats (projects, pages, words), settings button
- **Quick Actions**: Today (⌘D), New Page (⌘N), Quick Capture (⌘⇧C), New Project (⌘⇧P)
- **Streak Display**: Opt-in, shows 3+ day streaks with milestones
- **Recent Pages**: Last 5 notes with project tags
- **Projects Grid**: Cards with type, stats, progress

---

## Enhancement Ideas

### Quick Wins (< 2 hours each)

#### 1. Greeting with Time Context
Replace static "Mission Control" with contextual greeting:
```
Good morning, ready to write?          (5am-12pm)
Good afternoon, keep the momentum      (12pm-5pm)
Good evening, wrapping up?             (5pm-9pm)
Late night session                     (9pm-5am)
```
**Effort:** 30 min | **Impact:** ADHD-friendly, personal touch

#### 2. "Continue Writing" Hero Button
Show last active note prominently at top:
```
┌─────────────────────────────────────────────┐
│  📝 Continue: "Chapter 3 - Methods"         │
│     Research Project • 2,450 words • 15m ago│
│                              [Open →]       │
└─────────────────────────────────────────────┘
```
**Effort:** 1 hour | **Impact:** Zero friction to resume (ADHD principle #1)

#### 3. Today's Writing Goal
Optional daily word/page goal with progress ring:
```
┌──────────────────┐
│   ◐ 350/500     │
│   words today    │
│   70% complete   │
└──────────────────┘
```
**Effort:** 1.5 hours | **Impact:** Visible progress, motivation

#### 4. Keyboard-First Navigation
Add visible keyboard hints:
- `1-9` to open recent notes (numbered list)
- `↑↓` to navigate, `Enter` to select
- `P` to focus projects section
**Effort:** 2 hours | **Impact:** Power user flow

---

### Medium Effort (2-4 hours each)

#### 5. Focus Project Spotlight
When a project is selected, show it prominently:
```
┌─────────────────────────────────────────────────────┐
│  🔬 ACTIVE PROJECT: Mediation Analysis              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 65%            │
│  12 pages • 8,234 words • Last: "Literature Review" │
│  [Continue] [New Page] [View All]                   │
└─────────────────────────────────────────────────────┘
```
**Effort:** 3 hours | **Impact:** Project focus, less context switching

#### 6. Writing Stats Card
Show today's session stats:
```
┌────────────────────────────────────────┐
│  📊 Today's Session                    │
│  ──────────────────────────────────    │
│  Words written:     847 (+12%)         │
│  Time focused:      45 min             │
│  Pages touched:     3                  │
│  Best streak:       23 min uninterrupted│
└────────────────────────────────────────┘
```
**Effort:** 3 hours | **Impact:** Gamification, visible progress

#### 7. Pinned/Favorite Notes
Allow pinning important notes to Mission Control:
```
📌 Pinned
├── Dissertation Outline
├── Weekly Meeting Notes
└── Research Questions
```
**Effort:** 2.5 hours | **Impact:** Quick access to key docs

#### 8. Project Status Filters
Filter buttons above projects grid:
```
[All] [Active] [Planning] [Archive]
```
**Effort:** 1.5 hours | **Impact:** Cleaner view when many projects

---

### Larger Features (4+ hours)

#### 9. "What's Next" AI Suggestions
Claude-powered suggestions based on context:
```
💡 Suggestions
• Continue "Methods" section (left off mid-paragraph)
• Review "Literature Review" - marked for revision
• Daily note not created yet today
```
**Effort:** 6 hours | **Impact:** Reduces decision fatigue (ADHD)

#### 10. Weekly/Monthly View Toggle
Calendar-style view of writing activity:
```
December 2025
Mo Tu We Th Fr Sa Su
                  ●  ●
●  ●  ●  ○  ●  ●  ●   (● = wrote, ○ = skipped)
●  ●  ●  ●  ●  ●  ●
●  ●  ◐
```
**Effort:** 4 hours | **Impact:** Big picture progress

#### 11. Quick Capture Inbox
Show captured items awaiting processing:
```
📥 Inbox (3 items)
├── "Research idea about mediation..."  [Process →]
├── "Check Smith 2024 paper"            [Process →]
└── "Add section on limitations"        [Process →]
```
**Effort:** 4 hours | **Impact:** GTD-style workflow

#### 12. Project Templates
One-click project creation from templates:
```
Create from Template:
[Research Paper] [Course Notes] [Book Chapter] [Thesis]
```
**Effort:** 5 hours | **Impact:** Faster project setup

---

## Recommended for Sprint 25

Based on .STATUS showing "Quick Capture & Daily Notes" as next focus:

### Priority Order

1. **Continue Writing Hero** (Quick Win #2)
   - Directly supports "Quick Capture" theme
   - Maximum ADHD benefit (zero friction)

2. **Greeting with Time Context** (Quick Win #1)
   - Low effort, high personality
   - Sets welcoming tone

3. **Quick Capture Inbox** (Larger #11)
   - Sprint 25 focus area
   - Completes the capture → process workflow

4. **Today's Writing Goal** (Quick Win #3)
   - Visible progress
   - Opt-in (respects preferences)

---

## ADHD Design Checklist

For any new feature, verify:
- [ ] Reduces friction (fewer clicks to start)
- [ ] Shows progress visibly
- [ ] Has escape hatch (can dismiss/hide)
- [ ] No cognitive overload (< 3 choices visible)
- [ ] Keyboard accessible
- [ ] Respects reduced-motion preference

---

## Implementation Notes

### State Additions Needed
```typescript
interface AppViewState {
  // Existing...

  // New for Mission Control enhancements
  pinnedNoteIds: string[]
  dailyWordGoal: number | null
  showWritingStats: boolean
  projectFilter: 'all' | 'active' | 'planning' | 'archive'
}
```

### New Components
- `ContinueWritingHero.tsx`
- `WritingGoalRing.tsx`
- `QuickCaptureInbox.tsx`
- `PinnedNotes.tsx`
- `WritingStatsCard.tsx`

### Existing Component Changes
- `MissionControl.tsx` - Add greeting, layout slots
- `QuickActions.tsx` - Possibly keyboard hints
- `RecentNotes.tsx` - Numbered for keyboard nav

---

## Questions to Resolve

1. **Greeting customization?** - Fixed phrases vs. user-editable?
2. **Goal persistence** - Per-day reset or rolling average?
3. **Stats source** - Session-only or include CLI usage?
4. **Pin limit** - Max 5? Unlimited?

---

## Next Steps

1. [ ] Choose 2-3 features for Sprint 25
2. [ ] Create detailed implementation plan
3. [ ] Design mockups (optional)
4. [ ] Implement in priority order
5. [ ] Add tests for new components
