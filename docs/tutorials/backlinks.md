# Backlinks Tutorial

> **Navigate your knowledge graph with automatic link tracking**

---

## What You'll Learn

- Create wiki links between notes
- Use backlinks for navigation
- Understand incoming vs outgoing links
- Build a connected knowledge base
- Find orphaned notes

**Time:** 10 minutes
**Prerequisites:** At least 2-3 notes created

---

## What Are Backlinks?

**Wiki Links:** `[[Note Title]]` creates clickable links between notes

**Backlinks:** Automatically track which notes link TO the current note

**Example:**

```
Note A: "Methods"
Contains: See [[Results]] for findings

Note B: "Results"
Backlinks panel shows: Linked from [[Methods]]
```

**ADHD benefits:**
- Visual network of related ideas
- Click to jump between thoughts
- No manual tracking needed
- See connections at a glance

---

## Step 1: Create Wiki Links

### Basic Syntax

Type `[[` followed by note title:

```markdown
This study builds on [[Previous Research]].

See [[Methods]] for details.

Results discussed in [[Discussion]].
```

### Autocomplete

As you type `[[`, autocomplete appears:

```
Type: [[Prev

┌────────────────────────────┐
│ Previous Research          │  ← Match
│ Prevention Study           │
│ Preregistration            │
└────────────────────────────┘
```

**Navigate:**
- ↓ ↑ to select
- Enter to insert
- Esc to cancel

**Result:** `[[Previous Research]]` inserted with autocomplete.

---

## Step 2: Navigate with Links

### Click to Follow

Click any `[[wiki link]]` to open that note:

```markdown
The methodology was adapted from [[Smith et al 2020]].
                                   ^^^^^^^^^^^^^^^^^^^^^^
                                   Click here → opens that note
```

**Keyboard:** ⌘ + Click (Command + Click) to open in new tab

### Back Navigation

Press **⌘[** (Command + Left Bracket) to go back to previous note

**Like a browser:** Forward/back through your navigation history

---

## Step 3: View Backlinks Panel

### Open Panel

1. Right sidebar should be visible
   - If not: Press ⌘⇧B (Command + Shift + B)
2. Click **Backlinks** tab (link icon)

**Keyboard:** ⌘] to cycle through right sidebar tabs

### Panel Layout

```
┌──────────────────────────────┐
│ BACKLINKS                     │
├──────────────────────────────┤
│ 📊 Statistics                 │
│ - Incoming: 3 notes          │
│ - Outgoing: 5 notes          │
│                              │
│ INCOMING LINKS (3)           │
│ > [[Methods]]                │
│   "See Results for findings" │
│                              │
│ > [[Discussion]]             │
│   "As shown in Results"      │
│                              │
│ > [[Introduction]]           │
│   "Results presented in..."  │
│                              │
│ OUTGOING LINKS (5)           │
│ > [[Data Collection]]        │
│ > [[Analysis Plan]]          │
│ > [[Limitations]]            │
│ > [[Future Work]]            │
│ > [[References]]             │
└──────────────────────────────┘
```

---

## Step 4: Understanding Link Types

### Incoming Links

**What:** Notes that link TO current note

**Why useful:** See who references this note

**Example:**

```
Current note: "Results"

Incoming links:
- [[Methods]] → discusses results
- [[Discussion]] → interprets results
- [[Conclusion]] → summarizes results
```

**Use case:** "What notes depend on this one?"

### Outgoing Links

**What:** Notes that current note links TO

**Why useful:** See what this note references

**Example:**

```
Current note: "Results"

Outgoing links:
- [[Data Collection]]
- [[Statistical Methods]]
- [[Tables and Figures]]
```

**Use case:** "What does this note build on?"

---

## Step 5: Building Knowledge Graphs

### Start with Hub Notes

Create central topic notes:

```markdown
# Machine Learning

## Core Concepts
- [[Supervised Learning]]
- [[Unsupervised Learning]]
- [[Deep Learning]]

## Applications
- [[Image Recognition]]
- [[Natural Language Processing]]
- [[Recommender Systems]]
```

**Result:** Hub note links to 6 specialized notes.

### Create Specialist Notes

Each linked note can link back:

```markdown
# Supervised Learning

A type of [[Machine Learning]] where...

## Algorithms
- [[Linear Regression]]
- [[Decision Trees]]
- [[Neural Networks]]

## Applications
See [[Image Recognition]] for examples.
```

**Result:** Bidirectional web of knowledge.

### View the Network

Backlinks panel shows connections:

```
"Machine Learning" note:
- Incoming: 12 notes (people citing ML)
- Outgoing: 15 notes (ML subtopics)

Network density: Highly connected
```

---

## Step 6: Finding Connections

### Discover Related Notes

**Scenario:** Working on "Statistical Power"

Backlinks panel shows:
```
Incoming links (7):
- [[Sample Size Calculation]]
- [[Effect Size]]
- [[Type II Error]]
- [[Study Design]]
- [[Meta-Analysis]]
- [[Grant Proposal]]
- [[IRB Protocol]]
```

**Insight:** Power connects design, stats, and admin topics.

### Orphaned Notes

**Definition:** Notes with NO incoming or outgoing links

Backlinks panel:
```
Incoming: 0
Outgoing: 0

⚠️ This note is not connected
```

**Action:** Add links to integrate into knowledge base.

---

## Common Workflows

### Workflow 1: Research Paper Structure

```markdown
# Paper: "Mediation Analysis Study"

## Structure
1. [[Introduction]]
   - [[Background]]
   - [[Research Question]]
2. [[Methods]]
   - [[Participants]]
   - [[Measures]]
   - [[Analysis Plan]]
3. [[Results]]
   - [[Descriptive Statistics]]
   - [[Mediation Models]]
4. [[Discussion]]
   - [[Interpretation]]
   - [[Limitations]]
   - [[Future Directions]]
```

**Navigate:**
- Click any section → work on it
- Check backlinks → see dependencies
- ⌘[ to return to paper outline

### Workflow 2: Course Planning

```markdown
# STAT 440: Regression Analysis

## Weekly Topics
- Week 01: [[Simple Linear Regression]]
- Week 02: [[Multiple Regression]]
- Week 03: [[Model Diagnostics]]
- Week 04: [[Categorical Predictors]]
...

Each week note links to:
- [[Lecture Slides]]
- [[Homework Assignments]]
- [[Lab Exercises]]
- [[Additional Resources]]
```

**Backlinks show:** All materials for each week.

### Workflow 3: Literature Review

```markdown
# Literature: Causal Mediation

## Key Papers
- [[Baron and Kenny (1986)]]
- [[Sobel (1982)]]
- [[Pearl (2001)]]

Each paper note contains:
- Summary
- Key findings
- Links to [[Methods Used]]
- Links to [[Related Papers]]
```

**Backlinks reveal:** Citation networks.

---

## Advanced Usage

### Link to Headings

```markdown
See [[Results#Table 1]] for details.
```

Links directly to "Table 1" section in Results.

### Link with Display Text

```markdown
The [power analysis](Power Analysis) revealed...
```

Shows "power analysis" but links to "Power Analysis" note.

### Broken Links

Red underline indicates note doesn't exist:

```markdown
See [[Nonexistent Note]]
    ^^^^^^^^^^^^^^^^^^^^
    Red underline - create this note
```

**Click broken link:** Creates new note with that title.

---

## Backlinks Panel Features

### Statistics

```
Total Notes: 47
Total Links: 123
Avg Links per Note: 2.6
Most Linked: "Methods" (12 incoming)
Hub Notes: 5 (> 10 links)
Orphans: 3 (0 links)
```

### Filter Links

```
Search incoming links: "simulation"

Shows only:
- [[Monte Carlo Simulation]]
- [[Simulation Design]]
```

### Sort Options

- **Alphabetical:** A-Z by title
- **Recent:** Last modified first
- **Most linked:** Highest connections first

---

## Troubleshooting

### Link Not Clickable

**Problem:** `[[Note]]` appears as plain text

**Solutions:**

1. Check syntax: Must be `[[exactly like this]]`
2. No spaces inside brackets: `[[ Nospace ]]` ❌
3. Preview mode: Links work in Preview, plain text in Write mode

### Backlinks Panel Empty

**Problem:** Panel shows no links

**Solutions:**

1. Verify note has links (check in Write mode)
2. Refresh panel (close/reopen right sidebar)
3. Check database indexing (restart Scribe)

### Autocomplete Doesn't Appear

**Problem:** Type `[[` but no suggestions

**Solutions:**

1. Ensure other notes exist
2. Wait 500ms for autocomplete to load
3. Check you're in Write mode (not Preview)

---

## Visual Graph (Future)

**Coming in v2:**

```
    [Methods]
        │
        ├──→ [Data Collection]
        │         │
        │         └──→ [IRB Protocol]
        │
        ├──→ [Analysis]
        │         │
        │         ├──→ [Power Analysis]
        │         └──→ [Statistical Tests]
        │
        └──→ [Results]
                  │
                  └──→ [Tables and Figures]
```

Interactive force-directed graph visualization.

---

## Tips for ADHD Users

### Visual Exploration

```markdown
Instead of planning structure:

1. Create notes as ideas come
2. Add [[wiki links]] naturally
3. Check backlinks panel periodically
4. Structure emerges organically

No upfront organization needed!
```

### Connection Discovery

```markdown
"Wait, what was that related to?"

1. Open backlinks panel
2. See all connections
3. Click to explore
4. Return with ⌘[
```

### Reduce Refinding

```markdown
❌ "Where did I write about X?"
✅ Search → Click → Check backlinks → See related notes
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| [[ | Start wiki link (autocomplete) |
| ⌘ + Click | Open link in new tab |
| ⌘[ | Go back |
| ⌘] | Next right sidebar tab |
| ⌘⇧B | Toggle right sidebar |

---

## Next Steps

- **Link:** Add `[[links]]` to 3 existing notes
- **Explore:** Check backlinks panel on each note
- **Build:** Create a hub note for your main topic
- **Learn more:** [Features Overview](../guide/features.md)

---

## See Also

- [Mission Control Tutorial](./mission-control.md) - Navigate projects
- [Daily Notes Tutorial](./daily-notes.md) - Use daily notes
- [Features Overview](../guide/features.md) - All Scribe features
- [Keyboard Shortcuts](../guide/shortcuts.md) - All shortcuts
