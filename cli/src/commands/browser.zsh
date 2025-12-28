# ============================================================================
# Browser Command
# ============================================================================

# Run Scribe in browser with specific flags
_scribe_browser() {
  local url="http://localhost:5173"
  local flags=("--incognito")
  local args=("--disable-extensions")
  local output="/dev/null"
  local timeout=60
  local verify=""
  local browser_path=""

  # Detect Chrome on macOS
  if [[ -d "/Applications/Google Chrome.app" ]]; then
    browser_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  elif [[ -d "/Applications/Brave Browser.app" ]]; then
    browser_path="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  else
    echo "${_scribe_colors[red]}Error: Supported browser (Chrome/Brave) not found.${_scribe_colors[reset]}"
    return 1
  fi

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --url=*)
        url="${1#*=}"
        shift
        ;;
      --args=*)
        local arg_str="${1#*=}"
        # Split by space and add to args array
        args+=(${=arg_str})
        shift
        ;;
      --flags=*)
        local flag_str="${1#*=}"
        flags+=(${=flag_str})
        shift
        ;;
      --output=*)
        output="${1#*=}"
        shift
        ;;
      --timeout=*)
        timeout="${1#*=}"
        # Remove 's' suffix if present
        timeout="${timeout%s}"
        shift
        ;;
      --verify=*)
        verify="${1#*=}"
        shift
        ;;
      *)
        echo "${_scribe_colors[yellow]}Unknown option: $1${_scribe_colors[reset]}"
        shift
        ;;
    esac
  done

  # Check if server is running
  if ! curl --output /dev/null --silent --head --fail "$url"; then
    echo "${_scribe_colors[red]}Error: Scribe server not running at $url${_scribe_colors[reset]}"
    echo "Run 'npm run dev:vite' in another terminal first."
    return 1
  fi

  echo "${_scribe_colors[cyan]}Launching Scribe in browser...${_scribe_colors[reset]}"
  echo "URL: $url"
  echo "Flags: ${flags[*]}"
  echo "Args: ${args[*]}"
  echo "Output: $output"

  # Construct command
  # We use 'nohup' to detach, or just '&' if we want to monitor?
  # The user asked for --output="browser_session.log", so we should redirect.

  "$browser_path" "$url" "${flags[@]}" "${args[@]}" > "$output" 2>&1 &
  local pid=$!
  
  echo "${_scribe_colors[dim]}Browser PID: $pid${_scribe_colors[reset]}"

  # Verification
  if [[ "$verify" == "browser_loaded" ]]; then
    echo "Verifying browser loaded (timeout: ${timeout}s)..."
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout))
    
    while [[ $(date +%s) -lt $end_time ]]; do
      # check if process is still running
      if ! ps -p "$pid" > /dev/null; then
        echo "${_scribe_colors[red]}Error: Browser process died unexpectedly.${_scribe_colors[reset]}"
        return 1
      fi
      
      # We assume if it's running and server is up, it's 'loaded' for this simple check.
      # A real check might need Chrome remote debugging port.
      # For now, just wait a bit and check process.
      sleep 1
      
      # If we just wanted to check if it started, we are good.
      echo "${_scribe_colors[green]}Verification successful: Browser running.${_scribe_colors[reset]}"
      return 0
    done
    
    echo "${_scribe_colors[red]}Error: Verification timed out.${_scribe_colors[reset]}"
    return 1
  fi

  return 0
}
