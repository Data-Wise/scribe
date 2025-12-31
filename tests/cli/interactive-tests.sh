#!/bin/bash
# ============================================================================
# Interactive CLI Test Suite for: Scribe
# Generated: 2025-12-30
#
# Usage: bash tests/cli/interactive-tests.sh
#
# This script runs interactive tests that require human judgment.
# For each test, you'll see the expected behavior and actual output,
# then judge if it passes (y), fails (n), or quit testing (q).
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

# Counters
PASS=0
FAIL=0
SKIP=0
CURRENT=0
TOTAL_TESTS=25

# Log file
LOG_DIR="$(dirname "$0")/logs"
LOG_FILE="${LOG_DIR}/interactive-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$LOG_DIR"

# ============================================================================
# Test Framework
# ============================================================================

log() {
    echo "$*" >> "$LOG_FILE"
}

clear_screen() {
    clear
}

header() {
    echo ""
    echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${BOLD}$1${NC}"
    echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

section() {
    echo ""
    echo "${MAGENTA}▸ $1${NC}"
    echo "${DIM}────────────────────────────────────────────────────────────────────────${NC}"
}

# Run interactive test with human judgment
run_test() {
    local name="$1"
    local expected="$2"
    local cmd="$3"
    local mode="${4:-output}"  # output, browser, manual

    ((CURRENT++))

    clear_screen
    header "TEST $CURRENT/$TOTAL_TESTS: $name"

    echo ""
    echo "${BLUE}Command:${NC}"
    echo "  ${DIM}$cmd${NC}"
    echo ""

    echo "${YELLOW}Expected:${NC}"
    echo "  $expected"
    echo ""

    if [[ "$mode" == "manual" ]]; then
        echo "${CYAN}Instructions:${NC}"
        echo "  $cmd"
        echo ""
        echo "${BOLD}Please perform the action above, then judge the result.${NC}"
    elif [[ "$mode" == "browser" ]]; then
        echo "${CYAN}Opening in browser...${NC}"
        eval "$cmd" 2>&1 &
        sleep 2
        echo ""
        echo "${BOLD}Check the browser window, then judge the result.${NC}"
    else
        echo "${GREEN}Actual Output:${NC}"
        echo "${DIM}────────────────────────────────────────────────────────────────────────${NC}"
        eval "$cmd" 2>&1 | head -30
        echo "${DIM}────────────────────────────────────────────────────────────────────────${NC}"
    fi

    echo ""
    echo "${BOLD}Did this test pass?${NC}"
    echo "  ${GREEN}[y]${NC} Yes, it passed"
    echo "  ${RED}[n]${NC} No, it failed"
    echo "  ${YELLOW}[s]${NC} Skip this test"
    echo "  ${CYAN}[q]${NC} Quit testing"
    echo ""
    read -n 1 -s -r -p "Your choice: " choice
    echo ""

    case "$choice" in
        y|Y)
            ((PASS++))
            log "PASS: $name"
            echo "${GREEN}✓ Marked as PASS${NC}"
            ;;
        n|N)
            ((FAIL++))
            log "FAIL: $name"
            read -p "Notes (optional): " notes
            log "  Notes: $notes"
            echo "${RED}✗ Marked as FAIL${NC}"
            ;;
        s|S)
            ((SKIP++))
            log "SKIP: $name"
            echo "${YELLOW}⊘ Marked as SKIP${NC}"
            ;;
        q|Q)
            echo ""
            echo "${YELLOW}Quitting tests early...${NC}"
            print_summary
            exit 0
            ;;
        *)
            echo "${DIM}Invalid choice, marking as SKIP${NC}"
            ((SKIP++))
            log "SKIP: $name (invalid input)"
            ;;
    esac
    sleep 0.5
}

print_summary() {
    clear_screen
    header "INTERACTIVE TEST SUMMARY"

    echo ""
    echo "  ${GREEN}Passed${NC}:  $PASS"
    echo "  ${RED}Failed${NC}:  $FAIL"
    echo "  ${YELLOW}Skipped${NC}: $SKIP"
    echo "  ─────────────"
    echo "  ${BOLD}Total${NC}:   $CURRENT / $TOTAL_TESTS"
    echo ""
    echo "  Log: $LOG_FILE"
    echo ""

    if [[ $FAIL -eq 0 && $CURRENT -eq $TOTAL_TESTS ]]; then
        echo "${GREEN}${BOLD}All tests passed!${NC}"
    elif [[ $FAIL -gt 0 ]]; then
        echo "${RED}${BOLD}Some tests failed. Check the log for details.${NC}"
    else
        echo "${YELLOW}${BOLD}Testing incomplete.${NC}"
    fi
}

# ============================================================================
# CLI Interactive Tests
# ============================================================================

test_cli_help() {
    section "CLI Help Commands"

    run_test \
        "scribe help shows usage" \
        "Shows usage information with available commands listed" \
        "zsh -c 'source cli/scribe.zsh && scribe help'"

    run_test \
        "scribe --version shows version" \
        "Shows version number (e.g., 1.2.0)" \
        "zsh -c 'source cli/scribe.zsh && scribe --version'"

    run_test \
        "scribe help new shows new command help" \
        "Shows usage for 'new' command with options" \
        "zsh -c 'source cli/scribe.zsh && scribe help new'"
}

test_cli_list_commands() {
    section "CLI List and Search"

    run_test \
        "scribe list shows notes" \
        "Lists notes or shows 'database not found' message" \
        "zsh -c 'source cli/scribe.zsh && scribe list 2>&1'"

    run_test \
        "scribe tags shows tags" \
        "Lists available tags or shows database message" \
        "zsh -c 'source cli/scribe.zsh && scribe tags 2>&1'"

    run_test \
        "scribe stats shows statistics" \
        "Shows note statistics or database message" \
        "zsh -c 'source cli/scribe.zsh && scribe stats 2>&1'"
}

test_cli_browser_mode() {
    section "Browser Mode"

    run_test \
        "scribe browser command exists" \
        "Shows help or launches browser" \
        "zsh -c 'source cli/scribe.zsh && scribe help browser 2>&1'"
}

# ============================================================================
# NPM Script Tests
# ============================================================================

test_npm_dev() {
    section "Development Server"

    run_test \
        "npm run dev:vite starts server" \
        "Vite dev server starts and shows 'ready' message" \
        "timeout 5s npm run dev:vite 2>&1 || true"

    run_test \
        "TypeScript compiles cleanly" \
        "No TypeScript errors (exit code 0)" \
        "npm run typecheck 2>&1"
}

test_npm_tests() {
    section "Test Suites"

    run_test \
        "Unit tests run" \
        "vitest runs and shows test results (PASS/FAIL count)" \
        "npm run test:run 2>&1 | tail -20"
}

# ============================================================================
# Live Editor Features (Visual)
# ============================================================================

test_checkbox_rendering() {
    section "Checkbox Rendering"

    run_test \
        "Checkbox CSS exists" \
        "Should show .task-checkbox or checkbox-related CSS rules" \
        "grep -A 5 'task-checkbox\|checkbox' src/renderer/src/index.css 2>&1 | head -20"

    run_test \
        "Checkbox handler in HybridEditor" \
        "Should show handleCheckboxToggle function" \
        "grep -A 10 'handleCheckboxToggle' src/renderer/src/components/HybridEditor.tsx 2>&1 | head -15"
}

test_callout_rendering() {
    section "Callout Rendering"

    run_test \
        "Callout CSS exists" \
        "Should show .callout or callout-related CSS rules" \
        "grep -A 5 '\.callout' src/renderer/src/index.css 2>&1 | head -30"

    run_test \
        "rehype-callouts configured" \
        "Should show rehypeCallouts import and usage" \
        "grep -n 'rehype-callouts\|rehypeCallouts' src/renderer/src/components/HybridEditor.tsx 2>&1"
}

# ============================================================================
# Unit Test Files
# ============================================================================

test_unit_test_files() {
    section "Unit Test Coverage"

    run_test \
        "HybridEditor tests exist" \
        "Should list HybridEditor.test.tsx with checkbox/callout tests" \
        "grep -l 'checkbox\|callout\|Checkbox\|Callout' src/renderer/src/__tests__/*.tsx 2>&1"

    run_test \
        "Test count summary" \
        "Should show 60+ tests passing" \
        "npm run test:run 2>&1 | tail -10"
}

# ============================================================================
# E2E Test Files
# ============================================================================

test_e2e_files() {
    section "E2E Test Coverage"

    run_test \
        "Editor E2E tests exist" \
        "Should show editor.spec.ts with test cases" \
        "head -50 e2e/specs/editor.spec.ts 2>&1"

    run_test \
        "E2E spec file count" \
        "Should have 20+ spec files" \
        "ls -la e2e/specs/*.spec.ts 2>&1 | wc -l && ls e2e/specs/"
}

# ============================================================================
# Browser Visual Testing (Manual)
# ============================================================================

test_browser_visual() {
    section "Browser Visual Tests"

    echo ""
    echo "${YELLOW}These tests require the dev server to be running.${NC}"
    echo "${CYAN}Start with: npm run dev:vite${NC}"
    echo ""
    read -n 1 -s -r -p "Press any key when dev server is ready (or 's' to skip)..."
    echo ""

    if [[ "$REPLY" == "s" || "$REPLY" == "S" ]]; then
        echo "${YELLOW}Skipping visual tests${NC}"
        ((SKIP+=3))
        return
    fi

    run_test \
        "Checkboxes render in browser" \
        "Create a note with '- [ ] Task' and verify checkbox appears" \
        "Open http://localhost:5173 in browser" \
        "manual"

    run_test \
        "Checkbox toggle works" \
        "Click checkbox and verify markdown updates to '- [x] Task'" \
        "Click the checkbox in the note" \
        "manual"

    run_test \
        "Callouts render correctly" \
        "Create a note with '> [!note] Title' and verify callout styling" \
        "Add callout syntax and check for icon/border" \
        "manual"
}

# ============================================================================
# Main
# ============================================================================

main() {
    clear_screen
    header "Scribe Interactive Test Suite"

    echo ""
    echo "${BOLD}Welcome to the interactive test suite!${NC}"
    echo ""
    echo "This will run $TOTAL_TESTS tests that require human judgment."
    echo "For each test, you'll see expected vs actual output."
    echo ""
    echo "Controls:"
    echo "  ${GREEN}y${NC} = Pass    ${RED}n${NC} = Fail    ${YELLOW}s${NC} = Skip    ${CYAN}q${NC} = Quit"
    echo ""
    read -n 1 -s -r -p "Press any key to begin..."
    echo ""

    log "Interactive Test Session: $(date)"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Run test suites
    test_cli_help
    test_cli_list_commands
    test_cli_browser_mode
    test_npm_dev
    test_npm_tests
    test_checkbox_rendering
    test_callout_rendering
    test_unit_test_files
    test_e2e_files
    test_browser_visual

    print_summary
}

main "$@"
