# Scribe CLI Cheat Sheet

## 🚀 Essentials

| Action | Command | Alias | Description |
| :--- | :--- | :--- | :--- |
| **Start Day** | `scribe daily` | `sd` | Open/create today's journal entry. |
| **Capture** | `scribe capture "Text"` | `sc` | Quick dump to Inbox. |
| **Search** | `scribe search "Query"` | `ss` | Find notes (titles & content). |
| **List** | `scribe list` | `sl` | Show recent notes. |

## 🛠️ Management

| Action | Command | Details |
| :--- | :--- | :--- |
| **New Note** | `scribe new "Title"` | Creates a blank note in Inbox. |
| **Open** | `scribe open "Title"` | Opens the note in the Scribe App. |
| **Edit** | `scribe edit "Title"` | Edit note text in your terminal `$EDITOR`. |
| **Delete** | `scribe delete "Title"` | Moves note to Trash (soft delete). |
| **Export** | `scribe export "Title"` | Prints Markdown content to stdout. |

## 📦 System & Data

| Action | Command | Description |
| :--- | :--- | :--- |
| **Backup** | `scribe backup [path]` | Saves a copy of `scribe.db`. |
| **Restore** | `scribe restore <file>` | Overwrites DB with backup. |
| **Stats** | `scribe stats` | Word count, note count, etc. |
| **Tags** | `scribe tags` | List all tags `t`. |
| **Folders** | `scribe folders` | List folder counts `f`. |

## ⌨️ Shell Aliases

Add these to your `.zshrc` or `.bashrc` for speed:

```bash
alias sd='scribe daily'
alias sc='scribe capture'
alias ss='scribe search'
alias sl='scribe list'
alias sn='scribe new'
```
