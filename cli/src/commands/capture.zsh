# ============================================================================
# Capture Command
# ============================================================================

# Quick capture to inbox
_scribe_capture() {
  _scribe_check_db || return 1

  local content="$*"

  # If no content provided, read from stdin or prompt
  if [[ -z "$content" ]]; then
    if [[ -t 0 ]]; then
      echo "${_scribe_colors[cyan]}Enter your thought (Ctrl+D to finish):${_scribe_colors[reset]}"
      content=$(cat)
    else
      content=$(cat)
    fi
  fi

  if [[ -z "$content" ]]; then
    echo "${_scribe_colors[yellow]}No content to capture${_scribe_colors[reset]}"
    return 1
  fi

  # Generate title from first line or timestamp
  local title
  local first_line=$(echo "$content" | head -1 | cut -c1-50)
  if [[ -n "$first_line" ]]; then
    title="Capture: $first_line"
    [[ ${#first_line} -eq 50 ]] && title="${title}..."
  else
    title="Capture: $(date '+%Y-%m-%d %H:%M')"
  fi

  local escaped_title=$(_scribe_escape "$title")
  local escaped_content=$(_scribe_escape "$content")
  local id=$(_scribe_generate_id)
  local now=$(date +%s)

  _scribe_exec "INSERT INTO notes (id, title, content, folder, created_at, updated_at)
                VALUES ('$id', '$escaped_title', '$escaped_content', 'inbox', $now, $now)"

  if [[ $? -eq 0 ]]; then
    echo "${_scribe_colors[green]}Captured!${_scribe_colors[reset]} $title"
    echo "${_scribe_colors[dim]}ID: $id${_scribe_colors[reset]}"
  else
    echo "${_scribe_colors[red]}Error: Failed to capture${_scribe_colors[reset]}"
    return 1
  fi
}
