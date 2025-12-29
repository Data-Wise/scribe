# Build/Process Identification - Brainstorm Proposal

**Generated:** 2025-12-28
**Context:** Scribe development with multiple worktrees/branches
**Problem:** Hard to distinguish which branch/build is running, leading to testing wrong app

---

## Quick Wins (< 30 min each)

### 1. Window Title with Branch Name
**Effort:** Quick | **Impact:** High

Add git branch to window title during dev builds:
```
Scribe [feat/mission-control-hud]  // dev
Scribe                             // production
```

**Implementation:**
- Read git branch at build time via Tauri build script
- Inject into `tauri.conf.json` title or pass as env var
- Display in window title

### 2. Console Log on Startup
**Effort:** Quick | **Impact:** Medium

Log branch/commit info to terminal when dev server starts:
```
=== SCRIBE DEV BUILD ===
Branch: feat/mission-control-hud
Commit: e8c94d6
Path: /Users/dt/projects/dev-tools/scribe
========================
```

**Implementation:**
- Add to `predev` npm script
- Use `git rev-parse --abbrev-ref HEAD` and `git rev-parse --short HEAD`

---

## Medium Effort (1-2 hours)

### 3. Dev Mode Banner
**Effort:** Medium | **Impact:** High

Show colored banner at top of app in dev mode:
```
┌─────────────────────────────────────────────┐
│ DEV: feat/mission-control-hud @ e8c94d6     │
└─────────────────────────────────────────────┘
```

**Implementation:**
- Conditional React component shown only in dev
- Read from injected env vars
- Dismissible but re-appears on reload

### 4. Unique App Name per Worktree
**Effort:** Medium | **Impact:** High

Dynamic `productName` in Tauri config:
- Main branch: "Scribe"
- Feature branches: "Scribe-Dev"
- Worktrees: "Scribe-{worktree-name}"

Shows in:
- Dock icon
- App switcher (Cmd+Tab)
- Menu bar

---

## Implementation Priority

| Solution | Effort | Visibility | Recommended |
|----------|--------|------------|-------------|
| Window Title | Quick | High | Yes |
| Console Log | Quick | Medium | Yes |
| Dev Banner | Medium | Very High | Optional |
| Unique App Name | Medium | High | Future |

---

## Recommended Approach

**Phase 1 (Now):**
1. Add branch to window title in dev mode
2. Add startup log showing branch/path

**Phase 2 (Later):**
3. Dev banner component for visual confirmation

---

## Implementation Details

### Window Title (Phase 1)

**File:** `src-tauri/tauri.conf.json`

The title is static in config. Options:
1. **Build-time injection:** Use Tauri's `beforeBuildCommand` to modify config
2. **Runtime update:** Use Tauri's window API to set title on app start

**Recommended: Runtime update**

```rust
// src-tauri/src/main.rs or lib.rs
fn setup_window_title(app: &tauri::App) {
    if cfg!(debug_assertions) {
        let branch = std::process::Command::new("git")
            .args(["rev-parse", "--abbrev-ref", "HEAD"])
            .output()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
            .unwrap_or_default();

        if let Some(window) = app.get_window("main") {
            let title = format!("Scribe [{}]", branch);
            window.set_title(&title).ok();
        }
    }
}
```

### Console Log (Phase 1)

**File:** `package.json`

```json
"scripts": {
  "predev": "echo '\\n=== SCRIBE DEV ===' && git rev-parse --abbrev-ref HEAD && git rev-parse --short HEAD && pwd && echo '================\\n' && pkill -f 'target/debug/scribe' 2>/dev/null || true"
}
```

---

## Next Steps

1. [ ] Implement window title with branch name
2. [ ] Add startup console log
3. [ ] Test with multiple worktrees
4. [ ] Consider dev banner for extra visibility
