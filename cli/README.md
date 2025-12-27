# Scribe CLI

Terminal-based note access for the Scribe app.

## Installation

Copy `scribe.zsh` to your ZSH functions directory:

```bash
cp cli/scribe.zsh ~/.config/zsh/functions/scribe.zsh
```

Then source it in your `.zshrc`:

```bash
# Scribe CLI - Terminal-based note access
if [[ -f ~/.config/zsh/functions/scribe.zsh ]]; then
    source ~/.config/zsh/functions/scribe.zsh
fi
```

## Quick Start

```bash
scribe daily              # Open today's daily note
scribe capture "idea"     # Quick capture to inbox
scribe search "query"     # Full-text search
scribe list               # List recent notes
scribe help --all         # Full command reference
```

## Aliases

After sourcing, these aliases are available:

| Alias | Command |
|-------|---------|
| `sd`  | `scribe daily` |
| `sc`  | `scribe capture` |
| `ss`  | `scribe search` |
| `sl`  | `scribe list` |
| `sn`  | `scribe new` |

## Requirements

- Scribe app (creates the SQLite database)
- `sqlite3` command (macOS built-in)

## Database Location

```
~/Library/Application Support/com.scribe.app/scribe.db
```

## Version

Current: 1.1.0
