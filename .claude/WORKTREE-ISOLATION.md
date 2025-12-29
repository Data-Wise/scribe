# Worktree Isolation for Scribe Development

## Problem
When Claude Code creates worktrees (e.g., `~/.claude-worktrees/scribe/wonderful-wilson`),
running `npm run dev` in multiple worktrees causes:
- Port conflicts (both try to use 5173)
- App name conflicts (both named "scribe")
- SQLite database conflicts (same DB path)
- Confusing which app instance is active

## Solutions

### 1. Use Different Ports per Worktree
Add to `vite.config.ts`:
```typescript
server: {
  port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173,
}
```
Then run: `VITE_PORT=5174 npm run dev`

### 2. Use Different App Names in Dev
In `src-tauri/tauri.conf.json`, the `productName` could be dynamic:
- Main branch: "Scribe"
- Worktrees: "Scribe-Dev" or "Scribe-{branch}"

### 3. Kill Script Before Dev
Add to `package.json`:
```json
"scripts": {
  "predev": "pkill -f 'target/debug/scribe' || true"
}
```

### 4. Database Isolation
Use different SQLite paths per worktree:
```rust
// In database.rs
let db_name = if cfg!(debug_assertions) {
    format!("scribe-{}.db", env!("CARGO_PKG_VERSION"))
} else {
    "scribe.db".to_string()
};
```

### 5. Best Practice: One Dev Instance
**Recommended workflow:**
1. Before starting dev: `pkill -9 -f scribe`
2. Verify: `ps aux | grep scribe`
3. Then: `npm run dev`

### Quick Kill Command
```bash
# Add to ~/.zshrc
alias kill-scribe='pkill -9 -f "scribe|tauri|vite" && echo "✓ Killed all scribe processes"'
```
