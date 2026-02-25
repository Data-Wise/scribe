# Planning Documentation Workflow

**Created:** 2025-12-30
**Purpose:** Guide for managing Scribe planning documents

---

## Document Hierarchy

```mermaid
graph TD
    subgraph "Root Level (Active Work)"
        TODO[TODO.md<br/>Sprint Execution]
        IDEAS[IDEAS.md<br/>Options Index]
        NEXT[NEXT_STEPS.md<br/>Immediate Tasks]
        MASTER[BRAINSTORM-sidebar-*<br/>Master Analysis]
        SCHEMA[SCHEMATIC-*<br/>Visual Reference]
    end

    subgraph "docs/planning/ (Details)"
        INDEX[INDEX.md<br/>Hub/Navigation]
        BRAIN[BRAINSTORM-*.md<br/>Feature Analysis]
        PROP[PROPOSAL-*.md<br/>Specifications]
    end

    subgraph "docs/archive/planning/ (History)"
        SPRINT[SPRINT-N.md<br/>Completed Sprints]
        OLD[Old BRAINSTORMs]
    end

    INDEX --> TODO
    INDEX --> IDEAS
    INDEX --> NEXT
    INDEX --> BRAIN
    INDEX --> PROP

    TODO --> MASTER
    IDEAS --> MASTER

    BRAIN -.->|archive when done| OLD
    TODO -.->|archive sprint| SPRINT
```

---

## Document Types

| Type | Prefix | Purpose | Location |
|------|--------|---------|----------|
| Sprint Tracking | `TODO` | Current tasks, phases | Root |
| Options Index | `IDEAS` | Quick reference table | Root |
| Immediate Work | `NEXT_STEPS` | Today's focus | Root |
| Feature Analysis | `BRAINSTORM-` | Deep dive, options | Root (active) or docs/planning/ |
| Specifications | `PROPOSAL-` | Implementation specs | docs/planning/ |
| Visual Reference | `SCHEMATIC-` | Diagrams, layouts | Root |
| Navigation Hub | `INDEX` | Links to all docs | docs/planning/ |

---

## Workflow: New Feature

```mermaid
flowchart LR
    subgraph "1. Explore"
        A[Idea] --> B[BRAINSTORM-feature.md]
        B --> C{Options A-Z}
    end

    subgraph "2. Decide"
        C --> D[Pick option]
        D --> E[Update IDEAS.md]
        E --> F[Add to TODO.md]
    end

    subgraph "3. Implement"
        F --> G[Update NEXT_STEPS.md]
        G --> H[Code + Tests]
        H --> I[PR + Merge]
    end

    subgraph "4. Archive"
        I --> J[Mark complete in TODO]
        J --> K[Move BRAINSTORM to archive]
    end
```

---

## Workflow: Sprint Cycle

```mermaid
flowchart TD
    START[Sprint Start] --> READ[Read TODO.md]
    READ --> PICK[Pick phase/option]
    PICK --> UPDATE[Update NEXT_STEPS.md]
    UPDATE --> WORK[Implement]

    WORK --> |PR merged| COMPLETE[Mark complete]
    COMPLETE --> CHECK{More tasks?}

    CHECK --> |Yes| PICK
    CHECK --> |No| ARCHIVE[Archive sprint]
    ARCHIVE --> NEWSP[New Sprint TODO]
    NEWSP --> START
```

---

## File Flow Example: Sidebar Consolidation

```mermaid
sequenceDiagram
    participant User
    participant BRAIN as BRAINSTORM-sidebar
    participant IDEAS as IDEAS.md
    participant TODO as TODO.md
    participant NEXT as NEXT_STEPS.md
    participant Code

    User->>BRAIN: Research options A-K
    BRAIN->>IDEAS: Summarize with ratings
    User->>TODO: Plan phases 1-3

    loop Each Phase
        TODO->>NEXT: Current phase tasks
        NEXT->>Code: Implement
        Code->>TODO: Mark complete
    end

    TODO->>BRAIN: Archive when done
```

---

## Quick Commands

```bash
# View planning hub
cat docs/planning/INDEX.md

# Check current sprint
cat TODO.md

# See immediate tasks
cat NEXT_STEPS.md

# List all planning docs
ls -la docs/planning/

# Archive a completed brainstorm
git mv BRAINSTORM-feature.md docs/archive/planning/
```

---

## Document Templates

### BRAINSTORM Template
```markdown
# [Feature] Brainstorm

**Generated:** YYYY-MM-DD
**Context:** [Project area]

## Current State
[What exists now]

## Options

### Option A: [Name]
**Effort:** Quick/Medium/Large
**ADHD:** X/5
**Pros:** ...
**Cons:** ...

## Recommendation
[Which option and why]

## Next Steps
1. [ ] First action
2. [ ] Second action
```

### PROPOSAL Template
```markdown
# PROPOSAL: [Feature Name]

**Created:** YYYY-MM-DD
**Status:** Draft/Approved/Implemented

## Summary
[One paragraph]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Implementation
[Technical details]

## Testing
[Test plan]
```

---

## Maintenance

### Weekly
- Review TODO.md progress
- Update NEXT_STEPS.md with current focus
- Archive completed BRAINSTORMs

### Per Sprint
- Update IDEAS.md status column
- Move completed sprints to archive
- Update INDEX.md if structure changed

### Per Release
- Create release notes from TODO
- Archive all sprint docs
- Reset TODO for next version

---

## Current State (2025-12-30)

```mermaid
pie title Planning Docs by Location
    "Root (Active)" : 5
    "docs/planning/" : 12
    "docs/archive/" : 19
```

| Phase | Status |
|-------|--------|
| Phase 1 (Stats/Chat) | ✅ Complete |
| Phase 2 (Claude Tab) | ✅ Complete |
| Phase 3 (Terminal/Ambient) | 🚧 Ready |
