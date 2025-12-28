# ============================================================================
# Main Entry Point
# ============================================================================

scribe() {
  case "${1:-help}" in
    new|n)    shift; _scribe_new "$@" ;;
    daily|d)  _scribe_daily ;;
    search|s) shift; _scribe_search "$@" ;;
    capture|c) shift; _scribe_capture "$@" ;;
    list|ls|l) shift; _scribe_list "$@" ;;
    open|o)   shift; _scribe_open "$@" ;;
    edit|e)   shift; _scribe_edit "$@" ;;
    delete|del) shift; _scribe_delete "$@" ;;
    export|exp) shift; _scribe_export "$@" ;;
    backup)   shift; _scribe_backup "$@" ;;
    restore)  shift; _scribe_restore "$@" ;;
    tags|t)   _scribe_tags ;;
    folders|f) _scribe_folders ;;
    stats)    _scribe_stats ;;
    version|-v|--version)
      echo "scribe-cli v${SCRIBE_CLI_VERSION}"
      ;;
    help) shift; _scribe_help "$@" ;;
    -h|--help) _scribe_help ;;
    *)
      echo "scribe: unknown command '$1'" >&2
      echo "Run 'scribe help' for usage." >&2
      return 1
      ;;
  esac
}

# Aliases for quick access
alias sd='scribe daily'
alias sc='scribe capture'
alias ss='scribe search'
alias sl='scribe list'
alias sn='scribe new'

# Completion function
_scribe_completion() {
  local commands=(new daily search capture list open edit delete export backup restore tags folders stats help)
  local folders=(inbox daily archive)

  if [[ ${#words[@]} -eq 2 ]]; then
    _describe 'command' commands
  elif [[ ${#words[@]} -eq 3 && ${words[2]} == "list" ]]; then
    _describe 'folder' folders
  fi
}

compdef _scribe_completion scribe 2>/dev/null

# Add local man pages to MANPATH
export MANPATH="$HOME/.local/share/man:$MANPATH"
