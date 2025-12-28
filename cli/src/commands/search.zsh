# ============================================================================
# Search & Browse Commands
# ============================================================================ 

# Search notes using FTS5
_scribe_search() {
  _scribe_check_db || return 1

  if [[ -z "$*" ]]; then
    echo "${_scribe_colors[yellow]}Usage: scribe search \"query\"${_scribe_colors[reset]}"
    return 1
  fi

  local query="$*"
  local escaped_query=$(_scribe_escape "$query")

  echo "${_scribe_colors[cyan]}Searching for:${_scribe_colors[reset]} $query"
  echo ""

  # Search using FTS5
  local results=$(_scribe_query "
    SELECT n.id, n.title, n.folder, n.updated_at,
           snippet(notes_fts, 2, '>>>', '<<<', '...', 32) as snippet
    FROM notes_fts f
    JOIN notes n ON f.note_id = n.id
    WHERE notes_fts MATCH '$escaped_query'
      AND n.deleted_at IS NULL
    ORDER BY rank
    LIMIT 20
  ")

  if [[ -z "$results" ]]; then
    echo "${_scribe_colors[dim]}No results found${_scribe_colors[reset]}"
    return 0
  fi

  local count=0
  echo "$results" | while IFS='|' read -r id title folder updated snippet;
 do
    ((count++))
    local time_str=$(_scribe_format_time "$updated")

    echo "${_scribe_colors[bold]}$count. $title${_scribe_colors[reset]}"
    echo "   ${_scribe_colors[dim]}[$folder] • $time_str${_scribe_colors[reset]}"
    if [[ -n "$snippet" ]]; then
      # Highlight matches
      local highlighted="${snippet//>>>/\e[33m}"
      highlighted="${highlighted//<<</\e[0m}"
      echo "   $highlighted"
    fi
    echo ""
  done
}

# List recent notes
_scribe_list() {
  _scribe_check_db || return 1

  local folder=""
  local limit=20

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --project|--folder|-f)
        folder="$2"
        shift 2
        ;; 
      --limit|-l)
        limit="$2"
        shift 2
        ;; 
      *)
        folder="$1"
        shift
        ;; 
    esac
  done

  local where_clause="WHERE deleted_at IS NULL"
  if [[ -n "$folder" ]]; then
    local escaped_folder=$(_scribe_escape "$folder")
    where_clause="$where_clause AND folder = '$escaped_folder'"
    echo "${_scribe_colors[cyan]}Notes in '$folder':${_scribe_colors[reset]}"
  else
    echo "${_scribe_colors[cyan]}Recent notes:${_scribe_colors[reset]}"
  fi
  echo ""

  local results=$(_scribe_query "
    SELECT id, title, folder, updated_at, length(content) as size
    FROM notes
    $where_clause
    ORDER BY updated_at DESC
    LIMIT $limit
  ")

  if [[ -z "$results" ]]; then
    echo "${_scribe_colors[dim]}No notes found${_scribe_colors[reset]}"
    return 0
  fi

  # Print as formatted table
  printf "${_scribe_colors[bold]}%-40s %-12s %-16s %s${_scribe_colors[reset]}\n" "Title" "Folder" "Updated" "Size"
  printf "%s\n" "$(printf '─%.0s' {1..80})"

  echo "$results" | while IFS='|' read -r id title folder updated size;
 do
    local time_str=$(_scribe_format_time "$updated")
    local truncated_title="${title:0:38}"
    [[ ${#title} -gt 38 ]] && truncated_title="${truncated_title}.."

    # Color code by folder
    local folder_color="${_scribe_colors[dim]}"
    case "$folder" in
      inbox)   folder_color="${_scribe_colors[yellow]}" ;; 
      daily)   folder_color="${_scribe_colors[green]}" ;; 
      archive) folder_color="${_scribe_colors[dim]}" ;; 
      *)
        folder_color="${_scribe_colors[blue]}" ;; 
    esac

    printf "%-40s ${folder_color}%-12s${_scribe_colors[reset]} %-16s %s\n" \
           "$truncated_title" "$folder" "$time_str" "${size}b"
  done
}

# List all tags
_scribe_tags() {
  _scribe_check_db || return 1

  echo "${_scribe_colors[cyan]}Tags:${_scribe_colors[reset]}"
  echo ""

  local results=$(_scribe_query "
    SELECT t.name, t.color, COUNT(nt.note_id) as count
    FROM tags t
    LEFT JOIN note_tags nt ON t.id = nt.tag_id
    GROUP BY t.id
    ORDER BY count DESC, t.name
  ")

  if [[ -z "$results" ]]; then
    echo "${_scribe_colors[dim]}No tags found${_scribe_colors[reset]}"
    return 0
  fi

  echo "$results" | while IFS='|' read -r name color count;
 do
    printf "  ${_scribe_colors[magenta]}#%-20s${_scribe_colors[reset]} (%d notes)\n" "$name" "$count"
  done
}

# List folders
_scribe_folders() {
  _scribe_check_db || return 1

  echo "${_scribe_colors[cyan]}Folders:${_scribe_colors[reset]}"
  echo ""

  local results=$(_scribe_query "
    SELECT folder, COUNT(*) as count
    FROM notes
    WHERE deleted_at IS NULL
    GROUP BY folder
    ORDER BY count DESC
  ")

  if [[ -z "$results" ]]; then
    echo "${_scribe_colors[dim]}No folders found${_scribe_colors[reset]}"
    return 0
  fi

  echo "$results" | while IFS='|' read -r folder count;
 do
    local icon="📁"
    case "$folder" in
      inbox)   icon="📥" ;; 
      daily)   icon="📅" ;; 
      archive) icon="📦" ;; 
    esac
    printf "  $icon ${_scribe_colors[blue]}%-20s${_scribe_colors[reset]} (%d notes)\n" "$folder" "$count"
  done
}

# Show statistics
_scribe_stats() {
  _scribe_check_db || return 1

  echo "${_scribe_colors[cyan]}Scribe Statistics${_scribe_colors[reset]}"
  echo ""

  local total=$(_scribe_query "SELECT COUNT(*) FROM notes WHERE deleted_at IS NULL")
  local today=$(date +%s)
  local week_ago=$((today - 604800))
  local this_week=$(_scribe_query "SELECT COUNT(*) FROM notes WHERE deleted_at IS NULL AND created_at > $week_ago")
  local total_words=$(_scribe_query "SELECT SUM(length(content) - length(replace(content, ' ', '')) + 1) FROM notes WHERE deleted_at IS NULL AND content != ''")
  local folders=$(_scribe_query "SELECT COUNT(DISTINCT folder) FROM notes WHERE deleted_at IS NULL")
  local tags=$(_scribe_query "SELECT COUNT(*) FROM tags")

  printf "  ${_scribe_colors[bold]}Total Notes:${_scribe_colors[reset]}    %s\n" "$total"
  printf "  ${_scribe_colors[bold]}Created This Week:${_scribe_colors[reset]} %s\n" "$this_week"
  printf "  ${_scribe_colors[bold]}~Total Words:${_scribe_colors[reset]}   %s\n" "${total_words:-0}"
  printf "  ${_scribe_colors[bold]}Folders:${_scribe_colors[reset]}        %s\n" "$folders"
  printf "  ${_scribe_colors[bold]}Tags:${_scribe_colors[reset]}           %s\n" "$tags"
}
