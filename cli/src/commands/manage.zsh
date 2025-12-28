# ============================================================================
# Management Commands
# ============================================================================ 

# Delete a note (move to trash)
_scribe_delete() {
  _scribe_check_db || return 1

  if [[ -z "$*" ]]; then
    echo "${_scribe_colors[yellow]}Usage: scribe delete \"Title\"${_scribe_colors[reset]}"
    return 1
  fi

  local title="$*"
  local escaped_title=$(_scribe_escape "$title")

  # Find the note
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
    return 1
  fi

  local id=$(echo "$result" | cut -d'|' -f1)
  local found_title=$(echo "$result" | cut -d'|' -f2)

  echo "Delete '${_scribe_colors[bold]}$found_title${_scribe_colors[reset]}'? [y/N] "
  if [[ -t 0 ]]; then
    read -k 1 REPLY
  else
    read REPLY
  fi
  echo ""
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    local now=$(date +%s)
    _scribe_exec "UPDATE notes SET deleted_at = $now WHERE id = '$id'"
    echo "${_scribe_colors[red]}Deleted:${_scribe_colors[reset]} $found_title"
  else
    echo "Cancelled."
  fi
}

# Backup the database
_scribe_backup() {
  _scribe_check_db || return 1

  local dest="${1:-$HOME/scribe-backup-$(date +%Y%m%d-%H%M%S).db}"
  
  echo "${_scribe_colors[cyan]}Backing up database...${_scribe_colors[reset]}"
  cp "$SCRIBE_DB" "$dest"

  if [[ $? -eq 0 ]]; then
    echo "${_scribe_colors[green]}Backup created at:${_scribe_colors[reset]} $dest"
  else
    echo "${_scribe_colors[red]}Backup failed!${_scribe_colors[reset]}"
    return 1
  fi
}

# Restore the database
_scribe_restore() {
  if [[ -z "$1" ]]; then
    echo "${_scribe_colors[yellow]}Usage: scribe restore <backup_file>${_scribe_colors[reset]}"
    return 1
  fi

  local src="$1"
  if [[ ! -f "$src" ]]; then
    echo "${_scribe_colors[red]}Backup file not found:${_scribe_colors[reset]} $src"
    return 1
  fi

  echo "${_scribe_colors[red]}WARNING: This will overwrite your current database!${_scribe_colors[reset]}"
  echo "Current DB: $SCRIBE_DB"
  echo "Restore from: $src"
  echo -n "Are you sure? [y/N] "
  if [[ -t 0 ]]; then
    read -k 1 REPLY
  else
    read REPLY
  fi
  echo ""
  
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    # Make a safety backup first
    cp "$SCRIBE_DB" "$SCRIBE_DB.pre-restore"
    
    cp "$src" "$SCRIBE_DB"
    if [[ $? -eq 0 ]]; then
      echo "${_scribe_colors[green]}Database restored successfully.${_scribe_colors[reset]}"
    else
      echo "${_scribe_colors[red]}Restore failed! Reverting...${_scribe_colors[reset]}"
      mv "$SCRIBE_DB.pre-restore" "$SCRIBE_DB"
      return 1
    fi
  else
    echo "Cancelled."
  fi
}

# Export a note to Markdown
_scribe_export() {
  _scribe_check_db || return 1
  
  if [[ -z "$*" ]]; then
    echo "${_scribe_colors[yellow]}Usage: scribe export \"Title\" [output_file]${_scribe_colors[reset]}"
    return 1
  fi

  # Split args into title and output file if provided
  # Simple heuristic: last arg is file if it ends in .md, otherwise everything is title
  # Actually, simpler: first arg is title, second is optional output
  # But title might have spaces.
  # Let's stick to: export "Title" > output.md (shell redirection)
  # Or provide interactive export.
  
  local title="$*"
  local escaped_title=$(_scribe_escape "$title")

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
    echo "${_scribe_colors[yellow]}Note not found:${_scribe_colors[reset]} $title" >&2
    return 1
  fi

  local found_title=$(echo "$result" | cut -d'|' -f2)
  local content=$(echo "$result" | cut -d'|' -f3)

  # Output content to stdout
  echo "# $found_title"
  echo ""
  echo "$content"
}
