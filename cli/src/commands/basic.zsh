# ============================================================================
# Basic Commands
# ============================================================================ 

# Create a new note
_scribe_new() {
  _scribe_check_db || return 1

  local title="${*:-Untitled}"
  local escaped_title=$(_scribe_escape "$title")
  local id=$(_scribe_generate_id)
  local now=$(date +%s)

  _scribe_exec "INSERT INTO notes (id, title, content, folder, created_at, updated_at)
                VALUES ('$id', '$escaped_title', '', 'inbox', $now, $now)"

  if [[ $? -eq 0 ]]; then
    echo "${_scribe_colors[green]}Created:${_scribe_colors[reset]} $title"
    echo "${_scribe_colors[dim]}ID: $id${_scribe_colors[reset]}"
    echo "${_scribe_colors[dim]}Folder: inbox${_scribe_colors[reset]}"
  else
    echo "${_scribe_colors[red]}Error: Failed to create note${_scribe_colors[reset]}"
    return 1
  fi
}

# Create/open today's daily note
_scribe_daily() {
  _scribe_check_db || return 1

  local today=$(date "+%Y-%m-%d")
  local title="Daily: $today"
  local escaped_title=$(_scribe_escape "$title")

  # Check if daily note exists
  local existing=$(_scribe_query "SELECT id FROM notes WHERE title = '$escaped_title' AND deleted_at IS NULL LIMIT 1")

  if [[ -n "$existing" ]]; then
    echo "${_scribe_colors[cyan]}Opening today's daily note...${_scribe_colors[reset]}"
    _scribe_open_by_id "$existing"
  else
    # Create new daily note with template
    local id=$(_scribe_generate_id)
    local now=$(date +%s)
    local weekday=$(date "+%A")

    # Simple daily template (BlockNote JSON format - just paragraphs)
    local template="# Daily: $today ($weekday)

## Focus for Today


## Notes


## End of Day Review

"
    local escaped_template=$(_scribe_escape "$template")

    _scribe_exec "INSERT INTO notes (id, title, content, folder, created_at, updated_at)
                  VALUES ('$id', '$escaped_title', '$escaped_template', 'daily', $now, $now)"

    if [[ $? -eq 0 ]]; then
      echo "${_scribe_colors[green]}Created daily note:${_scribe_colors[reset]} $title"
      _scribe_open_by_id "$id"
    else
      echo "${_scribe_colors[red]}Error: Failed to create daily note${_scribe_colors[reset]}"
      return 1
    fi
  fi
}

# Open note in Scribe app
_scribe_open() {
  _scribe_check_db || return 1

  if [[ -z "$*" ]]; then
    # No argument - just open Scribe
    echo "${_scribe_colors[cyan]}Opening Scribe...${_scribe_colors[reset]}"
    osascript -e 'tell application "Scribe" to activate' 2>/dev/null
    return 0
  fi

  local title="$*"
  local escaped_title=$(_scribe_escape "$title")

  # Search for note by title (exact or partial match)
  local result=$(_scribe_query "
    SELECT id, title FROM notes
    WHERE deleted_at IS NULL
      AND (title = '$escaped_title' OR title LIKE '%$escaped_title%')
    ORDER BY
      CASE WHEN title = '$escaped_title' THEN 0 ELSE 1 END,
      updated_at DESC
    LIMIT 1
  ")

  if [[ -z "$result" ]]; then
    echo "${_scribe_colors[yellow]}Note not found:${_scribe_colors[reset]} $title"
    echo ""
    echo "Create it? [y/N] "
    if [[ -t 0 ]]; then
      read -k 1 REPLY
    else
      read REPLY
    fi
    echo ""
    if [[ "$REPLY" =~ ^[Yy]$ ]]; then
      _scribe_new "$title"
    fi
    return 1
  fi

  local id=$(echo "$result" | cut -d'|' -f1)
  local found_title=$(echo "$result" | cut -d'|' -f2)

  echo "${_scribe_colors[cyan]}Opening:${_scribe_colors[reset]} $found_title"
  _scribe_open_by_id "$id"
}

# Internal: Open note by ID
_scribe_open_by_id() {
  local id="$1"

  # Use custom URL scheme if Scribe supports it, otherwise just activate
  # For now, activate Scribe app (it should restore last state)
  osascript -e '
    tell application "Scribe"
      activate
    end tell
  ' 2>/dev/null

  echo "${_scribe_colors[dim]}Note ID: $id${_scribe_colors[reset]}"
}

# Edit note content in terminal editor
_scribe_edit() {
  _scribe_check_db || return 1

  if [[ -z "$*" ]]; then
    echo "${_scribe_colors[yellow]}Usage: scribe edit \"Title\"${_scribe_colors[reset]}"
    return 1
  fi

  local title="$*"
  local escaped_title=$(_scribe_escape "$title")

  # Find the note
  local result=$(_scribe_query "
    SELECT id, title, content FROM notes
    WHERE deleted_at IS NULL
      AND (title = '$escaped_title' OR title LIKE '%$escaped_title%')
    ORDER BY
      CASE WHEN title = '$escaped_title' THEN 0 ELSE 1 END,
      updated_at DESC
    LIMIT 1
  ")

  if [[ -z "$result" ]]; then
    echo "${_scribe_colors[yellow]}Note not found:${_scribe_colors[reset]} $title"
    return 1
  fi

  local id=$(echo "$result" | cut -d'|' -f1)
  local found_title=$(echo "$result" | cut -d'|' -f2)

  # Create temp file with content
  local tmpfile=$(mktemp /tmp/scribe-edit-XXXXXX.md)
  _scribe_query "SELECT content FROM notes WHERE id = '$id'" > "$tmpfile"

  # Get modification time before edit
  local before_mtime=$(stat -f %m "$tmpfile")

  # Open in editor
  ${EDITOR:-vim} "$tmpfile"

  # Check if file was modified
  local after_mtime=$(stat -f %m "$tmpfile")

  if [[ "$before_mtime" != "$after_mtime" ]]; then
    local new_content=$(cat "$tmpfile")
    local escaped_content=$(_scribe_escape "$new_content")
    local now=$(date +%s)

    _scribe_exec "UPDATE notes SET content = '$escaped_content', updated_at = $now WHERE id = '$id'"

    if [[ $? -eq 0 ]]; then
      echo "${_scribe_colors[green]}Updated:${_scribe_colors[reset]} $found_title"
    else
      echo "${_scribe_colors[red]}Error: Failed to save changes${_scribe_colors[reset]}"
    fi
  else
    echo "${_scribe_colors[dim]}No changes made${_scribe_colors[reset]}"
  fi

  rm -f "$tmpfile"
}
