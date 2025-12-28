# Scribe CLI Workflows & Examples

## 📥 Rapid Capture

**Scenario:** You have a brilliant idea or a quick to-do, but you don't want to switch context.

```bash
# Capture a simple thought
scribe capture "Remember to email Sarah about the project"

# Capture with a specific title (CLI auto-generates titles from the first line)
scribe capture "Project X: Initial brainstorming ideas"

# Pipe content from another command
echo "Server error logs: $(tail /var/log/syslog)" | scribe capture
```

## 🔍 Deep Research

**Scenario:** You need to find information across your notes and extract it.

```bash
# Search for a topic
scribe search "React hooks"

# List notes in a specific project folder
scribe list --folder "dev-docs"

# Find a note and open it immediately in the app
scribe open "React Component Lifecycle"
```

## ✍️ Terminal-Based Editing

**Scenario:** You prefer Vim/Nano or want to edit a note over SSH.

```bash
# Edit a note in your default $EDITOR
scribe edit "Meeting Notes"

# Create a new note and immediately edit it
scribe new "Architecture Draft" && scribe edit "Architecture Draft"
```

## 🛠️ Data Integration (Piping)

**Scenario:** You want to use your notes with other Unix tools.

```bash
# Export a note to a file
scribe export "Meeting Notes" > meeting_notes.md

# Copy a note's content to the clipboard (macOS)
scribe export "Draft Email" | pbcopy

# Grep through a specific note's content
scribe export "Project Roadmap" | grep "Q4"

# Combine multiple notes into one document
(scribe export "Chapter 1"; echo "\n"; scribe export "Chapter 2") > Full_Book.md
```

## 🛡️ Backup & Restore

**Scenario:** You want to snapshot your database before a big cleanup.

```bash
# Quick backup to default location
scribe backup

# Backup to a specific cloud-synced folder
scribe backup ~/Dropbox/Scribe/scribe_$(date +%F).db

# Restore from a backup (Interactive confirmation)
scribe restore ~/Dropbox/Scribe/scribe_2025-12-27.db
```
