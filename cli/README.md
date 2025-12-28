# Scribe CLI

Terminal-based note access for the Scribe app.

## Installation

### Quick Install

```bash
./cli/install.sh
```

### Manual Install

Copy the built script `cli/scribe.zsh` to your ZSH functions directory:

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

## Usage

```bash
scribe <command> [args]
```

### Core Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `daily` | `sd` | Open/create today's daily note |
| `capture "text"` | `sc` | Quick capture to inbox |
| `search "query"` | `ss` | Full-text search (FTS5) |
| `list [folder]` | `sl` | List recent notes |
| `new "Title"` | `sn` | Create a new note |

### Management Commands

| Command | Description |
|---------|-------------|
| `open "Title"` | Open note in Scribe app |
| `edit "Title"` | Edit note in `$EDITOR` |
| `delete "Title"` | Delete a note (move to trash) |
| `export "Title"` | Export note content to stdout |
| `backup [file]` | Backup the database |
| `restore <file>` | Restore database from backup |

### Browsing

| Command | Description |
|---------|-------------|
| `tags` | List all tags with counts |
| `folders` | List all folders with counts |
| `stats` | Show database statistics |

## Development

The CLI source is located in `cli/src/`. To build the single distribution script:

```bash
./cli/build.sh
```

### Running Tests

```bash
zsh cli/tests/test_runner.zsh
```

## Requirements

- Scribe app (creates the SQLite database)
- `sqlite3` command (macOS built-in)
- Zsh shell

## Version

Current: 1.2.0