# Project System Tutorial

> **Organize your work with 5 specialized project types**

---

## What You'll Learn

- Understand the 5 project types
- Create your first project
- Switch between projects
- Manage project-specific notes
- Use project-scoped features

**Time:** 10 minutes
**Prerequisites:** None

---

## Understanding Project Types

Scribe has 5 specialized project types, each optimized for different workflows:

| Type | Icon | Use Case | Working Directory |
|------|------|----------|-------------------|
| **Research** | 🔬 | Academic research, manuscripts, data analysis | `~/projects/research/[name]` |
| **Teaching** | 📚 | Course materials, lectures, assignments | `~/projects/teaching/[name]` |
| **R Package** | 📦 | R package development with devtools | `~/projects/r-packages/[name]` |
| **R Dev** | 🛠️ | R development tools, utilities | `~/projects/dev-tools/[name]` |
| **Generic** | 📁 | Everything else (writing, notes, planning) | `~/projects/[name]` |

---

## Step 1: Create Your First Project

### Method 1: Mission Control (Recommended)

1. Open **Mission Control** (⌘0)
2. Click **"+ New Project"** button
3. Fill out the form:
   - **Name:** "Mediation Analysis"
   - **Type:** Research 🔬
   - **Description:** "Study on causal mediation methods"
   - **Status:** Active
4. Click **"Create Project"**

### Method 2: Quick Create

1. Press **⌘⇧P** (Command + Shift + P)
2. Type "Create Project"
3. Fill out the same form as above

**Result:** Your new project appears in Mission Control with a Research icon.

---

## Step 2: Create Notes in Your Project

### Quick Note (⌘N)

1. Make sure your project is selected in the sidebar
2. Press **⌘N** to create a new note
3. Note automatically belongs to current project

**Example:**

```markdown
# Simulation Design

## Research Question
Can we improve power for mediation analysis?

## Methods
- Monte Carlo simulation
- 1000 replications
- Vary sample size: 50, 100, 200, 500

#simulation #methods
```

### From Mission Control

1. Open Mission Control (⌘0)
2. Click your project card
3. Click **"New Note"** button in project view

---

## Step 3: Switch Between Projects

### From Sidebar

1. Look at left sidebar
2. Click **Project dropdown** (top of note list)
3. Select different project
4. Note list filters to that project

### From Mission Control

1. Open Mission Control (⌘0)
2. Click any project card
3. Sidebar switches to that project
4. Editor shows project's notes

**Keyboard:** No direct shortcut (use ⌘0 → click card)

---

## Step 4: Project-Specific Features

### Research Projects

**Optimized for:**
- Academic manuscripts
- Data analysis
- Simulation studies
- Literature reviews

**Features:**
- Daily notes with research templates
- Citation support (@cite syntax)
- Math rendering (KaTeX)
- Quarto integration
- Terminal opens in `~/projects/research/[name]`

**Example Workflow:**

```markdown
# Analysis Results

## Sample Size Calculation

$$
n = \frac{(z_{\alpha/2} + z_\beta)^2 \sigma^2}{\delta^2}
$$

Where $\delta$ is the minimum detectable effect.

## References

@sobel1982asymptotic showed that...
```

### Teaching Projects

**Optimized for:**
- Course lectures
- Homework assignments
- Exam creation
- Student materials

**Features:**
- Weekly organization
- Template for lectures/homework
- Math/stats notation support
- Export to PDF for distribution
- Terminal opens in `~/projects/teaching/[name]`

**Example Workflow:**

```markdown
# Week 5: Regression Diagnostics

## Learning Objectives
1. Identify influential observations
2. Interpret residual plots
3. Assess model assumptions

## Lecture Outline
- Review: Least squares estimation
- New: Cook's distance
- Activity: Residual analysis in R

#week-05 #regression
```

### R Package Projects

**Optimized for:**
- Package development
- Function documentation
- Unit testing
- CRAN submission

**Features:**
- devtools integration
- roxygen2 templates
- pkgdown support
- Check/test workflows
- Terminal opens in `~/projects/r-packages/[name]`

**Example Workflow:**

```markdown
# Development TODO

## Before CRAN Submission

- [ ] Run R CMD check (0 errors, 0 warnings)
- [ ] Update NEWS.md with changes
- [ ] Spell check documentation
- [ ] Run revdepcheck()
- [ ] Update DESCRIPTION version

## Terminal Commands

```bash
R CMD check .
Rscript -e "devtools::test()"
Rscript -e "devtools::document()"
```

#development #cran
```

### R Dev Projects

**Optimized for:**
- Development tools
- Scripts and utilities
- Data pipelines
- Automation

**Features:**
- Script templates
- Debugging notes
- Workflow documentation
- Terminal opens in `~/projects/dev-tools/[name]`

**Example:**

```markdown
# Data Pipeline Script

## Purpose
Automated weekly data processing for lab.

## Steps
1. Download data from server
2. Clean and validate
3. Run statistical models
4. Generate report

## Cron Schedule
```bash
0 9 * * 1 ~/projects/dev-tools/data-pipeline/run.sh
```

#automation #data
```

### Generic Projects

**Optimized for:**
- General writing
- Personal notes
- Project planning
- Everything else

**Features:**
- Flexible structure
- No assumptions about workflow
- Terminal opens in `~/projects/[name]`

**Example:**

```markdown
# Book Outline

## Chapter 1: Introduction
- Hook: Why ADHD affects 5% of adults
- Thesis: Distraction-free tools are essential
- Structure: 10 chapters

## Chapter 2: The Attention Crisis
- Statistics on multitasking
- Research on notification fatigue

#writing #book-project
```

---

## Step 5: Manage Projects

### View All Projects

**Mission Control** (⌘0) shows all projects in a grid:

```
┌─────────────────┬─────────────────┬─────────────────┐
│ 🔬 Mediation    │ 📚 STAT 440     │ 📦 rmediation   │
│    Analysis     │    Regression   │    v2.1.0       │
│                 │                 │                 │
│ Active          │ Active          │ Stable          │
│ 12 notes        │ 45 notes        │ 8 notes         │
└─────────────────┴─────────────────┴─────────────────┘
```

### Edit Project

1. Mission Control (⌘0)
2. Hover over project card
3. Click **⚙️ Settings** icon
4. Edit fields:
   - Name
   - Description
   - Status (Active/Paused/Complete)
   - Color (hex code)
   - Working directory

### Archive Project

1. Edit project settings
2. Change **Status** to "Complete"
3. Project moves to bottom of list
4. Still accessible but less prominent

### Delete Project

**Warning:** This is permanent!

1. Edit project settings
2. Scroll to bottom
3. Click **"Delete Project"**
4. Confirm deletion
5. Notes are **NOT** deleted (they become orphaned)

---

## Step 6: Project-Scoped Search

### Filter by Current Project

1. Open Search (⌘F)
2. Select **"Current Project"** scope
3. Search only searches notes in active project

**Example:**

```
Search: "simulation"
Scope: Current Project (Mediation Analysis)
Results: 5 notes (only from this project)
```

### Search All Projects

1. Open Search (⌘F)
2. Select **"All Notes"** scope
3. Search across everything

---

## Common Workflows

### Workflow 1: Start a Research Project

```markdown
1. Create project (⌘⇧P → Create Project)
   - Type: Research
   - Name: "Your Study Name"

2. Create structure notes:
   - Methods (⌘N)
   - Results (⌘N)
   - Discussion (⌘N)

3. Create daily note for today's work (⌘D)

4. Link notes with [[wiki links]]

5. Use terminal for analysis (⌘⌥T)
```

### Workflow 2: Teaching Course Setup

```markdown
1. Create project
   - Type: Teaching
   - Name: "STAT 440 - Regression"

2. Create weekly notes:
   - Week 01: Introduction
   - Week 02: Simple Linear Regression
   - ...

3. Create assignment templates:
   - Homework Template
   - Exam Template

4. Use Quarto for slides:
   Terminal: quarto render week-01-slides.qmd
```

### Workflow 3: R Package Development

```markdown
1. Create project
   - Type: R Package
   - Name: "mypackage"

2. Create development notes:
   - TODO List
   - Function Ideas
   - Bug Tracker
   - CRAN Submission Checklist

3. Use terminal for dev workflow:
   - R CMD check .
   - devtools::test()
   - devtools::document()

4. Track progress with #development tags
```

---

## Troubleshooting

### Project Not Showing in Sidebar

**Problem:** Created project but it's not in the dropdown

**Solutions:**

1. Refresh Mission Control (⌘0)
2. Check project status isn't "Archive"
3. Restart Scribe

### Notes Not Filtered by Project

**Problem:** See all notes even when project is selected

**Solutions:**

1. Check note's `project_id` in Properties panel
2. Some notes may be orphaned (no project)
3. Use Search (⌘F) with "Current Project" scope

### Terminal Opens in Wrong Directory

**Problem:** Terminal doesn't open in project folder

**Solutions:**

1. Check project type is set correctly
2. Verify directory exists on disk
3. Set custom `workingDirectory` in project settings

---

## Advanced Tips

### Custom Project Colors

```json
{
  "color": "#3B82F6"
}
```

Color shows as status dot on project cards.

### Project Templates

Create a "Template" project with starter notes:

1. Create Generic project: "Templates"
2. Add starter notes (e.g., "Meeting Notes Template")
3. Copy notes to new projects as needed

### Project Statistics

Mission Control shows:
- Note count
- Last updated timestamp
- Status indicator (green/yellow/red)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘0 | Open Mission Control |
| ⌘N | New note in current project |
| ⌘D | Daily note in current project |
| ⌘F | Search (can scope to project) |
| ⌘⇧P | Command palette (includes Create Project) |

---

## Next Steps

- **Create:** Make your first project now
- **Organize:** Move existing notes into projects
- **Explore:** Try each project type
- **Learn more:** [Daily Notes Tutorial](./daily-notes.md)

---

## See Also

- [Terminal Tutorial](./terminal.md) - Use embedded terminal
- [Mission Control Tutorial](./mission-control.md) - Navigate with dashboard
- [Features Overview](../guide/features.md) - All Scribe features
