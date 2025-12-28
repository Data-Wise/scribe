# ============================================================================
# Help Command
# ============================================================================ 

# Show help
_scribe_help() {
  local topic="${1:-""}"

  # Handle --all for extended help
  local show_all=false
  [[ "$topic" == "--all" || "$topic" == "-a" ]] && show_all=true

  # Colors (with fallback)
  local _C_BOLD=$'\e[1m'
  local _C_NC=$'\e[0m'
  local _C_GREEN=$'\e[0;32m'
  local _C_CYAN=$'\e[0;36m'
  local _C_BLUE=$'\e[0;34m'
  local _C_YELLOW=$'\e[0;33m'
  local _C_DIM=$'\e[2m'
  local _C_MAGENTA=$'\e[0;35m'

  # Disable colors if NO_COLOR or not a terminal
  if [[ -n "$NO_COLOR" ]] || [[ ! -t 1 ]]; then
    _C_BOLD="" _C_NC="" _C_GREEN="" _C_CYAN="" _C_BLUE="" _C_YELLOW="" _C_DIM="" _C_MAGENTA=""
  fi

  echo -e "
${_C_BOLD}╭─────────────────────────────────────────────────────────────────────────────╮${_C_NC}
${_C_BOLD}│ 📝 SCRIBE CLI v${SCRIBE_CLI_VERSION} - Terminal-based note access                        │${_C_BOLD}
╰─────────────────────────────────────────────────────────────────────────────╯${_C_NC}

${_C_BOLD}Usage:${_C_NC} scribe <command> [arguments]

${_C_GREEN}🔥 QUICK START${_C_NC} ${_C_DIM}(80% of daily use)${_C_NC}:
  ${_C_CYAN}daily${_C_NC}, ${_C_CYAN}d${_C_NC}              Open/create today's daily note
  ${_C_CYAN}capture${_C_NC}, ${_C_CYAN}c${_C_NC} <text>     Quick capture to inbox
  ${_C_CYAN}search${_C_NC}, ${_C_CYAN}s${_C_NC} <query>     Full-text search (FTS5)
  ${_C_CYAN}list${_C_NC}, ${_C_CYAN}ls${_C_NC} [folder]     List recent notes

${_C_YELLOW}💡 QUICK EXAMPLES${_C_NC}:
  ${_C_DIM}\\$${_C_NC} scribe daily                  ${_C_DIM}# Open today's note${_C_NC}
  ${_C_DIM}\\$${_C_NC} scribe c \"Buy milk\"           ${_C_DIM}# Quick capture${_C_NC}
  ${_C_DIM}\\$${_C_NC} scribe s \"ADHD focus\"         ${_C_DIM}# Search notes${_C_NC}
  ${_C_DIM}\\$${_C_NC} echo \"idea\" | scribe c        ${_C_DIM}# Pipe to capture${_C_NC}
  ${_C_DIM}\\$${_C_NC} scribe list inbox             ${_C_DIM}# Show inbox notes${_C_NC}"

  if [[ "$show_all" == "true" ]]; then
    echo -e "
${_C_BLUE}📋 NOTE MANAGEMENT${_C_NC}:
  ${_C_CYAN}new${_C_NC} <title>           Create a new note in inbox
  ${_C_CYAN}daily${_C_NC}, ${_C_CYAN}d${_C_NC}              Open/create today's daily note
  ${_C_CYAN}capture${_C_NC}, ${_C_CYAN}c${_C_NC} [text]     Quick capture thought to inbox
  ${_C_CYAN}open${_C_NC}, ${_C_CYAN}o${_C_NC} [title]       Open note in Scribe app
  ${_C_CYAN}edit${_C_NC}, ${_C_CYAN}e${_C_NC} <title>       Edit note in \$EDITOR
  ${_C_CYAN}delete${_C_NC}, ${_C_CYAN}del${_C_NC} <title>   Delete a note (move to trash)
  ${_C_CYAN}export${_C_NC} <title>        Export note to Markdown (stdout)
  ${_C_CYAN}browser${_C_NC}               Run Scribe in browser (Chrome/Brave)

${_C_BLUE}🔍 SEARCH & BROWSE${_C_NC}:
  ${_C_CYAN}search${_C_NC}, ${_C_CYAN}s${_C_NC} <query>     Full-text search (FTS5)
  ${_C_CYAN}list${_C_NC}, ${_C_CYAN}ls${_C_NC} [folder]     List recent notes
  ${_C_CYAN}tags${_C_NC}, ${_C_CYAN}t${_C_NC}               List all tags with note counts
  ${_C_CYAN}folders${_C_NC}, ${_C_CYAN}f${_C_NC}            List all folders with note counts
  ${_C_CYAN}stats${_C_NC}                 Show database statistics

${_C_BLUE}💾 SYSTEM${_C_NC}:
  ${_C_CYAN}backup${_C_NC} [path]         Backup database
  ${_C_CYAN}restore${_C_NC} <path>        Restore database from backup

${_C_BLUE}⚙️  OPTIONS${_C_NC}:
  ${_C_CYAN}--project${_C_NC}, ${_C_CYAN}-f${_C_NC} <name>  Filter list by folder
  ${_C_CYAN}--limit${_C_NC}, ${_C_CYAN}-l${_C_NC} <n>       Limit results (default: 20)

${_C_MAGENTA}🚀 WORKFLOWS${_C_NC}:
  ${_C_DIM}\\$${_C_NC} pbpaste | scribe c           ${_C_DIM}# Capture from clipboard${_C_NC}
  ${_C_DIM}\\$${_C_NC} scribe s \"TODO\" | head       ${_C_DIM}# Quick grep through notes${_C_NC}
  ${_C_DIM}\\$${_C_NC} scribe list | fzf            ${_C_DIM}# Interactive note picker${_C_NC}
  ${_C_DIM}\\$${_C_NC} scribe export \"My Note\" > out.md ${_C_DIM}# Export to file${_C_NC}

${_C_MAGENTA}📁 SHELL ALIASES${_C_NC}:
  ${_C_DIM}sd${_C_NC} = scribe daily      ${_C_DIM}sc${_C_NC} = scribe capture
  ${_C_DIM}ss${_C_NC} = scribe search     ${_C_DIM}sl${_C_NC} = scribe list
  ${_C_DIM}sn${_C_NC} = scribe new

${_C_DIM}Database: $SCRIBE_DB${_C_NC}
${_C_DIM}Man page: man scribe${_C_NC}"
  else
    echo -e "
${_C_DIM}More commands: scribe help --all${_C_NC}"
  fi
  echo ""
}
