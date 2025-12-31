# Daily Notes Tutorial

> **Capture ideas and track progress with automatic daily notes**

---

## What You'll Learn

- Create daily notes with ⌘D
- Use built-in templates
- Create custom templates
- Navigate between dates
- Build a daily habit

**Time:** 7 minutes
**Prerequisites:** At least one project created

---

## What Are Daily Notes?

**Daily notes** are automatic note files created for each day. They help you:

- ✅ Capture thoughts without creating new notes
- ✅ Track what you worked on each day
- ✅ Build a writing habit (one file per day)
- ✅ Review your week/month quickly

**ADHD benefits:**
- No "what should I call this note?" friction
- One consistent place for today's work
- Easy to resume where you left off

---

## Step 1: Create Your First Daily Note

### Quick Create (⌘D)

1. Press **⌘D** (Command + D)
2. Daily note opens automatically
3. Note is named: `YYYY-MM-DD Daily Note`

**Example:** `2025-12-31 Daily Note`

**Result:** Editor opens with today's daily note.

### From Mission Control

1. Open Mission Control (⌘0)
2. Click **"Daily Note"** in Quick Actions bar
3. Same as ⌘D

### From CLI

```bash
# Terminal
scribe daily
# or alias
sd
```

---

## Step 2: Use a Template

### Default Template

Daily notes start with this structure:

```markdown
# Daily Note - Tuesday, December 31, 2025

## Today's Focus
- [ ] TODO item 1
- [ ] TODO item 2

## Notes


## Reflections


---
Created: 2025-12-31
Tags: #daily-note
```

### Choose a Different Template

**Available templates:**

| Template | Best For | Structure |
|----------|----------|-----------|
| **Simple** | Quick capture | Just a title |
| **Research** | Academic work | Focus, Notes, Ideas, References |
| **Planning** | Project management | Goals, Tasks, Blockers, Wins |
| **Reflection** | Daily review | Gratitude, Learnings, Tomorrow |
| **Teaching** | Educators | Class Prep, Student Questions, Follow-up |

**How to change:**

1. Open Settings (⌘,)
2. Navigate to **Daily Notes**
3. Select template from dropdown
4. Next daily note uses new template

---

## Step 3: Fill Out Your Daily Note

### Research Template Example

```markdown
# Daily Note - December 31, 2025

## Today's Focus
Working on mediation simulation power analysis.

## Notes

### Simulation Results
- Tested sample sizes: 50, 100, 200, 500
- Power increases as expected
- Need to add more conditions

## Ideas
What if we vary the indirect effect size instead?

## References
- [[Simulation Design]] - main project note
- @sobel1982asymptotic - statistical power

---
Tags: #daily-note #simulation #mediation
```

### Planning Template Example

```markdown
# Daily Note - December 31, 2025

## Goals
1. Finish Sprint 27 documentation
2. Review PR #15
3. Update CHANGELOG

## Tasks
- [x] Create tutorials for undocumented features
- [x] Update mkdocs navigation
- [ ] Preview docs with mkdocs serve

## Blockers
None today! 🎉

## Wins
- Completed 7 new tutorials
- All tests passing
- Documentation is comprehensive

---
Tags: #daily-note #development
```

---

## Step 4: Navigate Between Dates

### Today's Note

Press **⌘D** → Always opens today's note

### Previous Days

**Method 1: Search**
1. Press ⌘F
2. Type "2025-12-30 Daily Note"
3. Open from search results

**Method 2: Mission Control**
1. Open Mission Control (⌘0)
2. Scroll to recent notes section
3. Daily notes show up chronologically

**Method 3: CLI**

```bash
# List recent daily notes
scribe list | grep "Daily Note"

# Open specific date
scribe open "2025-12-30 Daily Note"
```

---

## Step 5: Build a Habit

### Morning Routine

```markdown
1. Open Scribe (⌘⇧N global hotkey)
2. Create today's daily note (⌘D)
3. Fill out "Today's Focus" section
4. Start working on first item
```

### End-of-Day Review

```markdown
1. Open today's daily note (⌘D)
2. Fill out "Reflections" section:
   - What went well?
   - What was challenging?
   - What to do tomorrow?
3. Close Scribe
```

### Weekly Review

```markdown
1. Open Mission Control (⌘0)
2. Find last 7 daily notes
3. Review each one:
   - What patterns do you see?
   - What tasks keep getting postponed?
   - What wins did you have?
4. Plan next week based on insights
```

---

## Custom Templates

### Create a Custom Template

1. Create a new note: **"My Daily Template"**
2. Write your ideal structure:

```markdown
# Daily Note - {DATE}

## ⚡ Morning Energy
What am I excited about today?

## 🎯 Top 3 Priorities
1.
2.
3.

## 📝 Notes


## 🌟 Wins


## 💭 Random Thoughts


---
Tags: #daily-note
```

3. Save template in a Templates project
4. Copy/paste into new daily notes

**Future:** Custom templates will be configurable in Settings.

---

## Common Workflows

### Workflow 1: Research Daily Log

```markdown
**Morning:**
1. ⌘D (open today's note)
2. Write "Today's Focus" (what analysis to run)
3. Start working

**During the day:**
4. Add findings to "Notes" section
5. Link to related notes with [[wiki links]]
6. Add citations with @citekeys

**Evening:**
7. Fill "Reflections" (what worked, what didn't)
8. Create TODOs for tomorrow
```

### Workflow 2: Teaching Journal

```markdown
**Before class:**
1. ⌘D
2. "Class Prep" section:
   - Key concepts to cover
   - Examples to use
   - Questions to ask

**After class:**
3. "Student Questions" section:
   - What confused them?
   - What went well?

4. "Follow-up" section:
   - Emails to send
   - Material to revise
```

### Workflow 3: Development Log

```markdown
**Start of work session:**
1. ⌘D
2. "Goals" - what to build today
3. "Tasks" - checkbox list

**During work:**
4. Check off tasks as completed
5. Add "Blockers" if stuck
6. Link to [[related notes]]

**End of session:**
7. "Wins" - what got done
8. Update "Tasks" for tomorrow
```

---

## Linking Daily Notes

### Link to Other Notes

```markdown
# Daily Note - December 31, 2025

## Today's Focus
Continuing work on [[Simulation Design]].

## Notes
See [[Power Analysis Results]] for details.
```

### Link Between Daily Notes

```markdown
## Follow-up from Yesterday
Continuing [[2025-12-30 Daily Note#Power Analysis]].
```

---

## Troubleshooting

### Daily Note Opens Blank

**Problem:** ⌘D opens empty note instead of template

**Solutions:**

1. Check Settings → Daily Notes → Template is selected
2. Delete blank note and try again
3. Copy template manually from Templates project

### Can't Find Yesterday's Note

**Problem:** Search doesn't find previous daily notes

**Solutions:**

1. Verify note was saved (check Mission Control)
2. Search exact format: "YYYY-MM-DD Daily Note"
3. Check spelling and dashes

### Daily Notes Cluttering Note List

**Expected behavior:** Daily notes show in chronological order

**Solutions:**

1. Use Search (⌘F) to filter to non-daily notes
2. Create a "Journal" project for daily notes
3. Archive old daily notes monthly

---

## Advanced Tips

### Monthly Reviews

Create a monthly note that links to daily notes:

```markdown
# December 2025 Review

## Daily Notes
- [[2025-12-01 Daily Note]]
- [[2025-12-02 Daily Note]]
- ...
- [[2025-12-31 Daily Note]]

## Summary
What themes emerged this month?

## Next Month Goals
1.
2.
3.
```

### Project-Specific Daily Notes

Include project tag in daily note:

```markdown
# Daily Note - December 31, 2025

**Project:** Mediation Analysis

## Today's Focus
...

Tags: #daily-note #mediation-analysis
```

### Quick Capture to Daily Note

Use CLI for fast capture:

```bash
# Add to today's daily note
scribe capture "Idea: What if we vary effect size?"

# Appends to today's note under "Quick Captures"
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘D | Create/open today's daily note |
| ⌘0 | Mission Control (see recent daily notes) |
| ⌘F | Search for specific date's note |

---

## Next Steps

- **Start today:** Press ⌘D and write your first entry
- **Choose a template:** Pick one that fits your workflow
- **Build habit:** Use daily notes every morning for a week
- **Learn more:** [Project System Tutorial](./projects.md)

---

## See Also

- [Mission Control Tutorial](./mission-control.md) - Navigate projects and notes
- [Command Palette Tutorial](./command-palette.md) - Quick actions
- [Features Overview](../guide/features.md) - All Scribe features
