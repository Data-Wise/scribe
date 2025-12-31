# Terminal Working Directory - Design Proposal

**Generated:** 2024-12-30
**Context:** Terminal PTY shell working directory behavior

## Current State

Projects in Scribe are **note containers**, not filesystem directories:
- `Project` has: `id`, `name`, `type`, `description`, `color`, `settings`
- **No `path` field exists**
- Notes are stored in SQLite, not as files

## The Question

When opening a terminal:
1. **Project selected** → Where should it open?
2. **No project / Mission Control** → Default location?

---

## Options

### Option A: Add `path` Field to Project ⭐ Recommended

**Effort:** 🔧 Medium (DB migration + UI)

Add optional `path?: string` to ProjectSettings:
```typescript
export interface ProjectSettings {
  // existing fields...
  workingDirectory?: string  // e.g., "~/projects/my-research"
}
```

**Pros:**
- Explicit, user-controlled
- Works with any project structure
- Path can differ from project name

**Cons:**
- Requires user to set path manually (or on first terminal open)
- Path may become stale if folder moves

**Fallback Chain:**
1. Project `workingDirectory` if set → use it
2. No path set → prompt user OR use default
3. Path doesn't exist → warn + use default

---

### Option B: Convention-Based Path Inference

**Effort:** ⚡ Quick (no DB changes)

Infer path from project type + name:

| Project Type | Inferred Path |
|-------------|---------------|
| `research` | `~/projects/research/{name}` |
| `teaching` | `~/projects/teaching/{name}` |
| `r-package` | `~/projects/r-packages/{name}` |
| `r-dev` | `~/projects/dev-tools/{name}` |
| `generic` | `~/projects/{name}` |

**Pros:**
- Zero config for users with standard layout
- Matches your actual project structure

**Cons:**
- Assumes specific folder structure
- Breaks for non-standard layouts
- Name may not match folder (e.g., "My Research" vs "my-research")

---

### Option C: Simple Default Only

**Effort:** ⚡ Quick

Always open in a fixed default location:
- **With project**: `~/projects/`
- **No project / Mission Control**: `~/` or `~/projects/`

**Pros:**
- Simplest to implement
- User can `cd` to desired location

**Cons:**
- Extra friction every time
- Defeats purpose of context-aware terminal

---

### Option D: Hybrid - Inference + Override

**Effort:** 🔧 Medium

Combine B + A:
1. **First terminal open**: Infer path using convention (Option B)
2. **Show prompt**: "Open terminal in ~/projects/research/foo? [Y/n/change]"
3. **Save choice**: Store in `ProjectSettings.workingDirectory`
4. **Future opens**: Use saved path, no prompt

**Pros:**
- Best of both worlds
- Zero config for matching conventions
- Explicit override when needed

**Cons:**
- More complex UX flow
- Prompt might be annoying

---

## Default Location Options (when no project)

| Option | Path | Rationale |
|--------|------|-----------|
| **Home** | `~/` | Safe, universal |
| **Projects root** | `~/projects/` | Quick access to all projects |
| **Last used** | (stored) | Remembers context |
| **Scribe app dir** | `~/.scribe/` | App-centric |

**Recommendation:** `~/projects/` for you specifically, but make it configurable globally.

---

## Implementation Sketch (Option A + D hybrid)

### 1. Add to ProjectSettings

```typescript
export interface ProjectSettings {
  workingDirectory?: string  // Optional path override
}
```

### 2. Terminal Spawn Logic

```rust
fn get_terminal_cwd(project: Option<&Project>) -> PathBuf {
    match project {
        Some(p) => {
            // Check explicit setting first
            if let Some(path) = p.settings.working_directory {
                if Path::new(&path).exists() {
                    return PathBuf::from(path);
                }
            }
            // Infer from convention
            infer_project_path(p)
        }
        None => {
            // Global default
            dirs::home_dir()
                .map(|h| h.join("projects"))
                .unwrap_or_else(|| PathBuf::from("/"))
        }
    }
}

fn infer_project_path(project: &Project) -> PathBuf {
    let base = dirs::home_dir().unwrap().join("projects");
    let folder_name = project.name.to_lowercase().replace(' ', "-");

    match project.project_type.as_str() {
        "research" => base.join("research").join(&folder_name),
        "teaching" => base.join("teaching").join(&folder_name),
        "r-package" => base.join("r-packages").join(&folder_name),
        "r-dev" => base.join("dev-tools").join(&folder_name),
        _ => base.join(&folder_name),
    }
}
```

### 3. Frontend - First Open Prompt

```tsx
// On first terminal open for project without saved path
if (!project.settings?.workingDirectory) {
    const inferred = inferProjectPath(project);
    const confirmed = await confirm(
        `Open terminal in ${inferred}?`,
        { change: "Choose different folder..." }
    );
    if (confirmed) {
        await api.updateProjectSettings(project.id, { workingDirectory: inferred });
    }
}
```

---

## Quick Wins

1. ⚡ **Default to `~/projects/`** for Mission Control (5 min)
2. ⚡ **Add `workingDirectory` to types** (already in ProjectSettings structure, just not wired)

## Medium Effort

3. 🔧 **Pass CWD to spawn_shell** in Rust backend
4. 🔧 **Add project path inference** based on type
5. 🔧 **Settings UI** for "Project Folder" in project settings

---

## Recommended Path

→ **Start with Option A + B hybrid:**
1. Add `workingDirectory` to ProjectSettings
2. Implement path inference based on project type
3. Use inferred path if exists, else default to `~/projects/`
4. Later: Add prompt on first open, settings UI

This gives immediate value with convention matching, while allowing explicit override.

---

## Questions for You

1. Should the path be validated on every terminal open (folder exists)?
2. Should we support `$PROJECT_NAME` or `$PROJECT_TYPE` variables in paths?
3. What should happen if inferred path doesn't exist - create it?
