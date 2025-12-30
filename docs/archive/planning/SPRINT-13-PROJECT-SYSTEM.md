# Sprint 13: Project System

**Status:** ○ Not Started
**Depends On:** Sprint 12 completion
**Focus:** Multi-project support with per-project settings

---

## Overview

Enable users to organize notes into projects with:
- Project-specific settings
- Project templates
- Quick project switching
- Per-project daily notes

---

## User Stories

1. **As a writer**, I want to organize my notes into projects so I can separate work/personal/academic writing
2. **As an academic**, I want per-project citation settings so each paper uses the right bibliography
3. **As an ADHD user**, I want quick project switching so I don't lose focus navigating

---

## Tasks

### Core Features

| Task | Description | Effort |
|------|-------------|--------|
| Project model | Database schema for projects | 0.5 day |
| Project CRUD | Create/read/update/delete projects | 1 day |
| Project switcher UI | Sidebar project dropdown/list | 1 day |
| Per-project settings | Theme, font, bibliography per project | 1 day |

### Enhanced Features

| Task | Description | Effort |
|------|-------------|--------|
| Project templates | Starter notes for new projects | 0.5 day |
| Per-project daily notes | Daily notes scoped to project | 0.5 day |
| Project search | Search within current project | 0.5 day |
| Project export | Export all notes in a project | 0.5 day |

---

## Technical Design

### Database Schema

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  settings JSON,
  created_at INTEGER,
  updated_at INTEGER
);

-- Add project_id to notes
ALTER TABLE notes ADD COLUMN project_id TEXT REFERENCES projects(id);
```

### Project Settings JSON

```json
{
  "theme": "deep-focus",
  "font": "iA Writer Duo",
  "fontSize": 18,
  "bibliographyPath": "/path/to/refs.bib",
  "citationStyle": "apa",
  "dailyNoteTemplate": "## {{date}}\n\n### Tasks\n- [ ] \n\n### Notes\n"
}
```

### UI Components

- `ProjectSwitcher.tsx` - Dropdown in sidebar header
- `ProjectSettings.tsx` - Project-specific settings panel
- `CreateProjectModal.tsx` - New project dialog
- `ProjectList.tsx` - All projects view

---

## File Structure

```
src/
├── renderer/src/
│   ├── components/
│   │   ├── ProjectSwitcher.tsx
│   │   ├── ProjectSettings.tsx
│   │   └── CreateProjectModal.tsx
│   └── store/
│       └── projectStore.ts
└── src-tauri/src/
    └── projects.rs
```

---

## Definition of Done

- [ ] Can create/edit/delete projects
- [ ] Notes belong to projects
- [ ] Project switcher in sidebar
- [ ] Per-project settings working
- [ ] All tests passing
- [ ] Documentation updated
