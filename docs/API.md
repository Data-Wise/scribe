# Scribe API Reference

> Complete reference for Scribe's Tauri IPC commands (v1.20.0)

---

## Overview

Scribe uses Tauri's IPC (Inter-Process Communication) to bridge the React frontend with the Rust backend. All commands are invoked via `@tauri-apps/api/core.invoke()`.

```typescript
import { invoke } from '@tauri-apps/api/core'

// Example: Create a note
const note = await invoke('create_note', {
  note: { title: 'My Note', content: '', folder: 'inbox' }
})
```

---

## Data Types

### Note

```typescript
interface Note {
  id: string           // UUID
  title: string        // Note title
  content: string      // Markdown content
  folder: string       // Folder path (inbox, archive, daily, etc.)
  created_at: number   // Unix timestamp (ms)
  updated_at: number   // Unix timestamp (ms)
  deleted_at: number | null  // Soft delete timestamp
}
```

### Tag

```typescript
interface Tag {
  id: string           // UUID
  name: string         // Tag name (without #)
  color: string | null // Hex color code
  created_at: number   // Unix timestamp (ms)
}
```

### Folder

```typescript
interface Folder {
  path: string         // Folder path
  color: string | null // Hex color code
  icon: string | null  // Icon identifier
  sort_order: number   // Display order
}
```

### Citation (Academic)

```typescript
interface Citation {
  key: string          // BibTeX key (@article{key, ...})
  title: string        // Publication title
  author: string       // Author(s)
  year: string         // Publication year
  journal?: string     // Journal name
  doi?: string         // DOI identifier
}
```

---

## Note Commands

### create_note

Create a new note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `note.title` | string | Yes | Note title |
| `note.content` | string | Yes | Markdown content |
| `note.folder` | string | Yes | Folder path |

**Returns:** `Note`

**Example:**
```typescript
const note = await invoke('create_note', {
  note: {
    title: 'Meeting Notes',
    content: '## Agenda\n\n- Item 1\n- Item 2',
    folder: 'inbox'
  }
})
```

---

### get_note

Retrieve a note by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Note UUID |

**Returns:** `Note | null`

---

### list_notes

List all notes, optionally filtered by folder.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `folder` | string | No | Filter by folder path |

**Returns:** `Note[]`

---

### update_note

Update an existing note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Note UUID |
| `updates.title` | string | No | New title |
| `updates.content` | string | No | New content |

**Returns:** `Note | null`

---

### delete_note

Soft-delete a note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Note UUID |

**Returns:** `boolean`

---

### search_notes

Full-text search across notes.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query |

**Returns:** `Note[]`

---

### get_or_create_daily_note

Get today's daily note or create it if it doesn't exist.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |

**Returns:** `Note`

**Example:**
```typescript
const daily = await invoke('get_or_create_daily_note', {
  date: '2024-12-26'
})
```

---

## Tag Commands

### get_all_tags

Get all tags with note counts.

**Returns:** `TagWithCount[]`

---

### create_tag

Create a new tag.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Tag name (without #) |
| `color` | string | No | Hex color code |

**Returns:** `Tag`

---

### rename_tag

Rename an existing tag.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Tag UUID |
| `new_name` | string | Yes | New tag name |

**Returns:** `boolean`

---

### delete_tag

Delete a tag.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Tag UUID |

**Returns:** `boolean`

---

### add_tag_to_note

Associate a tag with a note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `note_id` | string | Yes | Note UUID |
| `tag_name` | string | Yes | Tag name |

**Returns:** `void`

---

### remove_tag_from_note

Remove a tag from a note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `note_id` | string | Yes | Note UUID |
| `tag_id` | string | Yes | Tag UUID |

**Returns:** `void`

---

### get_note_tags

Get all tags for a note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `note_id` | string | Yes | Note UUID |

**Returns:** `Tag[]`

---

### filter_notes_by_tags

Filter notes by tags.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `tag_ids` | string[] | Yes | Tag UUIDs |
| `match_all` | boolean | Yes | AND vs OR matching |

**Returns:** `Note[]`

---

## Link Commands

### update_note_links

Parse and update wiki-links in a note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `noteId` | string | Yes | Note UUID |
| `content` | string | Yes | Note content |

**Returns:** `void`

---

### get_backlinks

Get notes that link to this note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `noteId` | string | Yes | Note UUID |

**Returns:** `Note[]`

---

### get_outgoing_links

Get notes that this note links to.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `noteId` | string | Yes | Note UUID |

**Returns:** `Note[]`

---

## AI Commands

### run_claude

Execute Claude CLI with a prompt.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prompt` | string | Yes | Prompt text |

**Returns:** `string` (AI response)

**Requires:** `claude` CLI installed

---

### run_gemini

Execute Gemini CLI with a prompt.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prompt` | string | Yes | Prompt text |

**Returns:** `string` (AI response)

**Requires:** `gemini` CLI installed

---

## Academic Commands

### set_bibliography_path

Set the BibTeX file path for citations.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | string | Yes | Path to .bib file |

**Returns:** `void`

---

### get_citations

Get all citations from the bibliography.

**Returns:** `Citation[]`

---

### search_citations

Search citations by query.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query |

**Returns:** `Citation[]`

---

### export_document

Export a document using Pandoc.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options.content` | string | Yes | Document content |
| `options.format` | string | Yes | Output format (pdf, docx, latex, html) |
| `options.title` | string | No | Document title |
| `options.citation_style` | string | No | Citation style (apa, chicago, mla, ieee, harvard) |

**Returns:** `ExportResult`

**Requires:** `pandoc` installed

---

### is_pandoc_available

Check if Pandoc is installed.

**Returns:** `boolean`

---

## Font Commands

### get_installed_fonts

Get list of installed system fonts.

**Returns:** `string[]`

---

### is_font_installed

Check if a specific font is installed.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `font_family` | string | Yes | Font family name |

**Returns:** `boolean`

---

### install_font_via_homebrew

Install a font using Homebrew.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `cask_name` | string | Yes | Homebrew cask name (must start with "font-") |

**Returns:** `string` (success message)

**Requires:** Homebrew installed

---

### is_homebrew_available

Check if Homebrew is installed.

**Returns:** `boolean`

---

## Export Commands

### export_to_obsidian

Export all notes to Obsidian-compatible markdown files.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `target_path` | string | Yes | Directory path |

**Returns:** `string` (success message)

---

## Project Commands

### list_projects

List all projects.

**Returns:** `Project[]`

---

### create_project

Create a new project.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `project.name` | string | Yes | Project name |
| `project.type` | string | Yes | Project type (research, teaching, r-package, r-dev, generic) |
| `project.color` | string | No | Hex color code |

**Returns:** `Project`

---

### update_project

Update an existing project.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Project UUID |
| `updates` | object | Yes | Fields to update |

**Returns:** `Project`

---

### delete_project

Delete a project.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

**Returns:** `boolean`

---

## Terminal Commands

### spawn_shell

Spawn a PTY shell process.

**Returns:** `string` (PTY ID)

---

### write_to_shell

Write input to a shell process.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pty_id` | string | Yes | PTY identifier |
| `data` | string | Yes | Input data |

**Returns:** `void`

---

### resize_shell

Resize a terminal.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pty_id` | string | Yes | PTY identifier |
| `cols` | number | Yes | Column count |
| `rows` | number | Yes | Row count |

**Returns:** `void`

---

### kill_shell

Kill a shell process.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pty_id` | string | Yes | PTY identifier |

**Returns:** `void`

---

## Error Handling

All commands return `Result<T, String>` in Rust. On error, a descriptive string is thrown:

```typescript
try {
  const note = await invoke('get_note', { id: 'invalid-id' })
} catch (error) {
  console.error('Failed to get note:', error)
}
```

---

## Frontend API Wrapper

The frontend uses a typed wrapper in `src/renderer/src/lib/api.ts`:

```typescript
import * as api from './lib/api'

// Create note
const note = await api.createNote({ title: 'New', content: '', folder: 'inbox' })

// Search notes
const results = await api.searchNotes('query')

// Get backlinks
const backlinks = await api.getBacklinks(noteId)
```

See `src/renderer/src/lib/api.ts` for the complete wrapper implementation.
