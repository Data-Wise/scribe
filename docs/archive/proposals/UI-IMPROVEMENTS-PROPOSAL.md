# Scribe UI Improvements Proposal

**Date:** 2025-12-27
**Status:** Draft
**Based on:** Analysis of iA Writer, Ulysses, Typora, Bear, Obsidian + ADHD UX research

---

## Executive Summary

After analyzing Scribe's current UI and researching leading distraction-free writing apps, I've identified **15 high-impact improvements** organized by effort level. The recommendations prioritize ADHD-friendly design principles while maintaining Scribe's academic writing focus.

---

## Current State Analysis

### ✅ What Scribe Does Well

| Feature | Implementation | Quality |
|---------|---------------|---------|
| **ADHD Theme System** | 10 built-in themes (5 dark, 5 light) | ⭐⭐⭐⭐⭐ |
| **Focus Mode** | Typewriter scrolling, centered cursor | ⭐⭐⭐⭐ |
| **Command Palette** | ⌘K quick access | ⭐⭐⭐⭐ |
| **Sidebar Toggle** | Collapsible with smooth animation | ⭐⭐⭐⭐ |
| **Empty State** | Motivational quotes, clear CTAs | ⭐⭐⭐⭐ |
| **Keyboard Shortcuts** | Comprehensive coverage | ⭐⭐⭐⭐ |
| **Academic Features** | Wiki-links, tags, citations, math | ⭐⭐⭐⭐ |

### 🔶 Areas for Improvement

| Area | Current Issue | Impact |
|------|---------------|--------|
| **Focus Mode Enhancement** | Basic implementation vs iA Writer's sentence/paragraph options | High |
| **Status Bar** | Functional but not inspiring | Medium |
| **Writing Progress** | Present but not gamified | High (ADHD) |
| **Empty State** | Good but could have starter templates | Medium |
| **Mode Toggle** | Small button, not prominent | Low |
| **Sidebar File List** | Basic list, no preview snippets | Medium |
| **Right Panel Tabs** | Plain tabs, no visual hierarchy | Low |

---

## 📋 Improvement Recommendations

### Quick Wins (⚡ < 1 hour each)

#### 1. **Enhance Focus Mode with iA Writer-style Options**
*Inspired by: [iA Writer Focus Mode](https://ia.net/writer/support/editor/focus-mode)*

**Current:** Single typewriter mode
**Proposed:** Three modes:
- **Sentence Focus** - Highlight current sentence, dim rest
- **Paragraph Focus** - Highlight current paragraph
- **Typewriter** - Current behavior (cursor stays centered)

```tsx
// Add to HybridEditor.tsx
type FocusStyle = 'sentence' | 'paragraph' | 'typewriter'
```

**Why (ADHD):** Sentence focus helps hyperfocus; paragraph focus helps maintain flow

---

#### 2. **Add Syntax Dimming (Adjective/Adverb Highlighting)**
*Inspired by: [iA Writer Syntax Control](https://ia.net/writer/support/editor/syntax-control)*

**Proposed:** Optional mode that dims adjectives, adverbs, or weak verbs to help tighten prose.

**Implementation:** Use POS tagging library (like `compromise`) to identify parts of speech.

**Why (ADHD):** Reduces visual noise, gamifies editing, provides concrete feedback

---

#### 3. **Improve Status Bar with Session Stats**
*Current:* Word count only
*Proposed:*
- Session duration timer
- Words written this session (+50 ⬆️)
- Current streak visualization (🔥 3 day streak)
- Focus mode indicator with pulse animation

```
┌─────────────────────────────────────────────────────────┐
│ Writing • ⌘E │  ⏱️ 23m │ +127 words │ 🔥 3 │ 1,247 words │
└─────────────────────────────────────────────────────────┘
```

**Why (ADHD):** Visible progress creates dopamine hits; streak encourages consistency

---

#### 4. **Add Celebration Micro-interactions**
*Inspired by: [Empty State Best Practices](https://www.nngroup.com/articles/empty-state-interface-design/)*

**Proposed:** Subtle celebrations for milestones:
- 100 words: Soft pulse on word count
- 500 words: Brief confetti burst (subtle)
- Goal reached: Achievement badge appears
- Streak continued: Fire emoji animates

**CSS Implementation:**
```css
@keyframes milestone-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); color: var(--nexus-accent); }
}
```

**Why (ADHD):** Positive reinforcement, dopamine, motivation to continue

---

#### 5. **Better Mode Toggle UX**
*Current:* Small "Preview" button in corner
*Proposed:* More prominent toggle with visual feedback

```tsx
// Pill-style toggle
<div className="mode-toggle flex rounded-full bg-nexus-bg-tertiary p-1">
  <button className={mode === 'write' ? 'active' : ''}>Write</button>
  <button className={mode === 'preview' ? 'active' : ''}>Preview</button>
</div>
```

---

### Medium Effort (🔧 2-4 hours each)

#### 6. **File List Preview Snippets**
*Inspired by: Bear, Ulysses*

**Current:** Title only
**Proposed:** Title + first line preview + timestamp

```
┌──────────────────────────────────┐
│ Research Notes                   │
│ Started analyzing the impact... │
│ 2 hours ago                      │
└──────────────────────────────────┘
```

**Implementation:** Add excerpt field to note display

---

#### 7. **Starter Templates for Empty State**
*Inspired by: [UXPin Empty States](https://www.uxpin.com/studio/blog/ux-best-practices-designing-the-overlooked-empty-states/)*

**Current:** Just "New Note" and "Daily Note" buttons
**Proposed:** Add template quick-starts:

- 📝 **Blank Note** - Start fresh
- 📅 **Daily Note** - Today's entry
- 📑 **Research Note** - With YAML frontmatter
- ✍️ **Freewrite** - Timed 10-minute session
- 📄 **Manuscript Draft** - Chapter template

---

#### 8. **Keyboard Shortcut Cheatsheet Panel**
*Accessibility best practice*

**Proposed:** Press `⌘?` to show floating cheatsheet:

```
┌─────────────────────────────────┐
│        Keyboard Shortcuts       │
├─────────────────────────────────┤
│ ⌘N     New Note                │
│ ⌘D     Daily Note              │
│ ⌘E     Toggle Preview          │
│ ⌘K     Command Palette         │
│ ⌘⇧F    Focus Mode              │
│ ⌘B     Toggle Left Sidebar     │
│ ⌘⇧B    Toggle Right Sidebar    │
│ ⌘⇧E    Export                  │
│ ⌘⇧G    Graph View              │
│ ESC    Exit Focus/Preview      │
└─────────────────────────────────┘
```

---

#### 9. **Enhanced Writing Progress Widget**
*Current:* Basic progress bar
*Proposed:* Rich progress visualization

```
┌────────────────────────────────────┐
│  Today's Progress                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ████████████░░░░░░░░░ 247 / 500   │
│                                    │
│  🔥 3-day streak                   │
│  📊 Best: 1,247 words (Tue)        │
└────────────────────────────────────┘
```

---

#### 10. **Distraction-Free Pomodoro Timer**
*ADHD best practice*

**Proposed:** Built-in focus timer (optional)

- 25-minute focus sessions
- Subtle progress indicator in status bar
- Gentle audio cue at session end
- Track sessions per day

**Why (ADHD):** Time-boxing combats hyperfocus burnout and task-switching

---

### Larger Efforts (🏗️ Half-day+)

#### 11. **Graph View Enhancement**
*Inspired by: Obsidian*

**Current:** Basic graph view exists
**Proposed Improvements:**
- Color-code by tag
- Size nodes by word count
- Cluster by folder
- Animated zoom/pan
- Click to open note

---

#### 12. **Citation Panel Redesign**
*Inspired by: [Zotero UI](https://www.zotero.org/)*

**Current:** Basic autocomplete
**Proposed:**
- Visual citation cards with authors, year, title
- Preview abstract on hover
- Recently used citations section
- Search by author, title, or keyword

---

#### 13. **Reading Time Estimate**
*Standard feature in modern writing apps*

**Proposed:** Show estimated reading time based on word count
- Average adult: 200-250 wpm
- Display in status bar: "~5 min read"

---

#### 14. **Voice Input Option** (Future)
*ADHD-friendly feature*

**Proposed:** Press `⌘⇧V` to start voice dictation
- Uses system speech recognition
- Visual indicator when listening
- Auto-punctuation

---

#### 15. **Custom CSS Theme Editor**
*Inspired by: Obsidian, Bear*

**Current:** 10 preset themes + custom theme creation
**Proposed Enhancement:**
- Live preview as you edit
- Export/import themes
- Community theme sharing

---

## Priority Matrix

```
                    IMPACT
             Low         High
         ┌─────────┬─────────┐
    Low  │ 5,13    │ 1,3,4   │  EFFORT
         ├─────────┼─────────┤
    High │ 11,14   │ 6,7,8,9 │
         └─────────┴─────────┘

Legend:
1. Focus Mode Options    7. Starter Templates
3. Status Bar Stats      8. Shortcut Cheatsheet
4. Celebrations          9. Progress Widget
5. Mode Toggle          11. Graph Enhancement
6. File Previews        13. Reading Time
                        14. Voice Input
```

---

## Recommended Implementation Order

### Sprint 18: Polish Pass
1. ⚡ **Celebration micro-interactions** (Quick dopamine win)
2. ⚡ **Enhanced status bar** with session stats
3. 🔧 **Keyboard shortcut cheatsheet** (⌘?)

### Sprint 19: Focus Enhancements
4. ⚡ **Focus mode options** (sentence/paragraph/typewriter)
5. 🔧 **Starter templates** for empty state
6. 🔧 **Enhanced writing progress widget**

### Sprint 20: Content Experience
7. 🔧 **File list preview snippets**
8. ⚡ **Reading time estimate**
9. ⚡ **Better mode toggle UX**

### Backlog (v1.1+)
- Graph view enhancement
- Citation panel redesign
- Syntax dimming
- Voice input
- Custom CSS editor

---

## Competitive Comparison

| Feature | Scribe | iA Writer | Ulysses | Bear | Obsidian |
|---------|--------|-----------|---------|------|----------|
| Focus Mode | ✅ Basic | ✅ Advanced | ✅ | ✅ | Plugin |
| Typewriter | ✅ | ✅ | ✅ | ✅ | Plugin |
| Syntax Dim | ❌ | ✅ | ❌ | ❌ | ❌ |
| Word Goals | ✅ | ✅ | ✅ | ❌ | Plugin |
| Sessions | ❌ | ❌ | ✅ | ❌ | ❌ |
| Citations | ✅ | ❌ | ❌ | ❌ | Plugin |
| Wiki-links | ✅ | ❌ | ❌ | ❌ | ✅ |
| Graph View | ✅ | ❌ | ❌ | ❌ | ✅ |
| Themes | 10+ | 4 | 12 | 20+ | 100s |
| ADHD Focus | ✅ Core | ✅ | ✅ | ❌ | ❌ |

**Scribe's Unique Position:** Academic features + ADHD design in one app

---

## Sources

Research from:
- [iA Writer Focus Mode](https://ia.net/writer/support/editor/focus-mode)
- [iA Writer ADHD Features](https://ia.net/topics/an-adhd-friendly-writing-app)
- [Shyeditor: Best Distraction-Free Writing Apps 2025](https://www.shyeditor.com/blog/post/distraction-free-writing-app)
- [NN/g: Empty State Design](https://www.nngroup.com/articles/empty-state-interface-design/)
- [UXPin: Empty States Best Practices](https://www.uxpin.com/studio/blog/ux-best-practices-designing-the-overlooked-empty-states/)
- [Obsidian](https://obsidian.md/)
- [Zotero Citation Manager](https://www.zotero.org/)
- [Venture Harbour: Distraction-Free Writing Apps](https://ventureharbour.com/best-distraction-free-writing-apps-for-bloggers-writers-authors/)

---

## Next Steps

1. [ ] Review this proposal with DT
2. [ ] Prioritize based on current sprint capacity
3. [ ] Create GitHub issues for approved items
4. [ ] Design mockups for larger changes (Focus Mode, Progress Widget)
5. [ ] Implement quick wins first for momentum

---

*Generated by Claude Code UI Analysis • 2025-12-27*
