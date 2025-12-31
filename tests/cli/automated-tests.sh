#!/bin/bash
# ============================================================================
# Automated CLI Test Suite for: Scribe
# Generated: 2025-12-30
#
# Usage: bash tests/cli/automated-tests.sh
#
# This script runs non-interactive tests suitable for CI/CD pipelines.
# All tests run without user input and return exit code 0 on success.
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Counters
PASS=0
FAIL=0
SKIP=0
TOTAL=0

# Log file
LOG_DIR="$(dirname "$0")/logs"
LOG_FILE="${LOG_DIR}/automated-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$LOG_DIR"

# ============================================================================
# Test Framework
# ============================================================================

log() {
    echo "$@" | tee -a "$LOG_FILE"
}

header() {
    log ""
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${BOLD}$1${NC}"
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_pass() {
    ((PASS++))
    ((TOTAL++))
    log "${GREEN}✓ PASS${NC}: $1"
}

test_fail() {
    ((FAIL++))
    ((TOTAL++))
    log "${RED}✗ FAIL${NC}: $1"
    log "  Expected: $2"
    log "  Got: $3"
}

test_skip() {
    ((SKIP++))
    ((TOTAL++))
    log "${YELLOW}⊘ SKIP${NC}: $1 - $2"
}

# Run command and check exit code
run_test() {
    local name="$1"
    local expected_exit="$2"
    shift 2
    local cmd="$*"

    log ""
    log "${BLUE}▸ Running${NC}: $name"
    log "  Command: $cmd"

    set +e
    output=$($cmd 2>&1)
    actual_exit=$?
    set -e

    if [[ "$actual_exit" -eq "$expected_exit" ]]; then
        test_pass "$name"
        return 0
    else
        test_fail "$name" "exit code $expected_exit" "exit code $actual_exit"
        log "  Output: ${output:0:200}"
        return 1
    fi
}

# Run command and check output contains pattern
run_test_contains() {
    local name="$1"
    local pattern="$2"
    shift 2
    local cmd="$*"

    log ""
    log "${BLUE}▸ Running${NC}: $name"
    log "  Command: $cmd"
    log "  Pattern: $pattern"

    set +e
    output=$($cmd 2>&1)
    set -e

    if echo "$output" | grep -qE "$pattern"; then
        test_pass "$name"
        return 0
    else
        test_fail "$name" "output matching '$pattern'" "${output:0:200}"
        return 1
    fi
}

# Check if command exists
check_prereq() {
    local cmd="$1"
    if command -v "$cmd" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# ============================================================================
# ZSH CLI Tests
# ============================================================================

test_cli_smoke() {
    header "CLI Smoke Tests"

    # Check if CLI is installed
    if [[ ! -f "cli/scribe.zsh" ]]; then
        test_skip "CLI file exists" "cli/scribe.zsh not found"
        return 1
    fi
    test_pass "CLI file exists"

    # Source the CLI and test version
    run_test_contains "CLI version output" "1\.[0-9]+\.[0-9]+" \
        "zsh -c 'source cli/scribe.zsh && scribe --version'"

    # Test help command
    run_test_contains "CLI help output" "Usage:" \
        "zsh -c 'source cli/scribe.zsh && scribe help'"

    # Test --help flag
    run_test_contains "CLI --help flag" "Commands:" \
        "zsh -c 'source cli/scribe.zsh && scribe --help'"
}

test_cli_commands() {
    header "CLI Command Tests"

    # Test list command (may fail without database)
    run_test_contains "CLI list command" "list|notes|database" \
        "zsh -c 'source cli/scribe.zsh && scribe list 2>&1'" || true

    # Test tags command
    run_test_contains "CLI tags command" "tags|database|Tags" \
        "zsh -c 'source cli/scribe.zsh && scribe tags 2>&1'" || true

    # Test stats command
    run_test_contains "CLI stats command" "stats|database|Statistics" \
        "zsh -c 'source cli/scribe.zsh && scribe stats 2>&1'" || true

    # Test help for each subcommand
    local cmds=("new" "daily" "open" "edit" "search" "list" "tags" "folders" "stats" "capture" "delete" "backup" "restore" "export" "browser")
    for cmd in "${cmds[@]}"; do
        run_test_contains "CLI help $cmd" "Usage:|scribe $cmd" \
            "zsh -c 'source cli/scribe.zsh && scribe help $cmd 2>&1'" || true
    done
}

test_cli_errors() {
    header "CLI Error Handling"

    # Test invalid command
    run_test "CLI invalid command exit" 1 \
        "zsh -c 'source cli/scribe.zsh && scribe invalid_command_xyz 2>&1'" || true

    # Test missing required arguments
    run_test_contains "CLI new without title" "Usage:|title|required" \
        "zsh -c 'source cli/scribe.zsh && scribe new 2>&1'" || true
}

# ============================================================================
# NPM Script Tests
# ============================================================================

test_npm_scripts() {
    header "NPM Script Tests"

    # Check package.json exists
    if [[ ! -f "package.json" ]]; then
        test_skip "package.json exists" "Not in project root"
        return 1
    fi
    test_pass "package.json exists"

    # Test typecheck
    run_test "TypeScript typecheck" 0 "npm run typecheck"

    # Test unit tests
    run_test "Unit tests pass" 0 "npm run test:run"
}

test_vite_build() {
    header "Vite Build Tests"

    # Check vite config
    if [[ ! -f "vite.config.ts" ]]; then
        test_skip "vite.config.ts exists" "File not found"
        return 1
    fi
    test_pass "vite.config.ts exists"

    # Test vite build (browser mode)
    run_test "Vite build" 0 "npm run build:vite"
}

# ============================================================================
# E2E Infrastructure Tests
# ============================================================================

test_e2e_infrastructure() {
    header "E2E Test Infrastructure"

    # Check playwright config
    if [[ ! -f "e2e/playwright.config.ts" ]]; then
        test_skip "playwright.config.ts exists" "File not found"
        return 1
    fi
    test_pass "playwright.config.ts exists"

    # Check spec files exist
    local spec_count
    spec_count=$(find e2e/specs -name "*.spec.ts" 2>/dev/null | wc -l)
    if [[ "$spec_count" -gt 0 ]]; then
        test_pass "E2E spec files exist ($spec_count files)"
    else
        test_fail "E2E spec files exist" "> 0 spec files" "$spec_count files"
    fi

    # Check fixtures
    if [[ -d "e2e/fixtures" ]]; then
        test_pass "E2E fixtures directory exists"
    else
        test_skip "E2E fixtures" "Directory not found"
    fi

    # Check pages (Page Object Model)
    if [[ -d "e2e/pages" ]]; then
        local page_count
        page_count=$(find e2e/pages -name "*.ts" 2>/dev/null | wc -l)
        test_pass "E2E page objects exist ($page_count files)"
    else
        test_skip "E2E page objects" "Directory not found"
    fi
}

# ============================================================================
# Unit Test Coverage
# ============================================================================

test_unit_test_coverage() {
    header "Unit Test Files"

    local test_dir="src/renderer/src/__tests__"
    if [[ ! -d "$test_dir" ]]; then
        test_skip "Test directory exists" "$test_dir not found"
        return 1
    fi
    test_pass "Test directory exists"

    # Count test files
    local test_count
    test_count=$(find "$test_dir" -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l)
    if [[ "$test_count" -gt 20 ]]; then
        test_pass "Adequate test coverage ($test_count test files)"
    else
        test_fail "Adequate test coverage" ">20 test files" "$test_count test files"
    fi

    # Check for key test files
    local required_tests=("HybridEditor.test.tsx" "BrowserApi.test.ts" "Integration.test.tsx")
    for test_file in "${required_tests[@]}"; do
        if [[ -f "$test_dir/$test_file" ]]; then
            test_pass "Required test: $test_file"
        else
            test_fail "Required test: $test_file" "File exists" "Not found"
        fi
    done
}

# ============================================================================
# Project Structure Tests
# ============================================================================

test_project_structure() {
    header "Project Structure"

    # Check key directories
    local dirs=("src" "src-tauri" "cli" "e2e" "docs")
    for dir in "${dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            test_pass "Directory exists: $dir"
        else
            test_fail "Directory exists: $dir" "Directory present" "Not found"
        fi
    done

    # Check key files
    local files=("package.json" "tsconfig.json" "vite.config.ts" "vitest.config.ts" "CLAUDE.md")
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            test_pass "File exists: $file"
        else
            test_fail "File exists: $file" "File present" "Not found"
        fi
    done
}

# ============================================================================
# Live Editor Enhancement Tests
# ============================================================================

test_live_editor_features() {
    header "Live Editor Enhancement Tests"

    # Check HybridEditor implementation
    local editor_file="src/renderer/src/components/HybridEditor.tsx"
    if [[ -f "$editor_file" ]]; then
        test_pass "HybridEditor.tsx exists"

        # Check for checkbox implementation
        if grep -q "handleCheckboxToggle" "$editor_file"; then
            test_pass "Checkbox toggle handler implemented"
        else
            test_fail "Checkbox toggle handler" "handleCheckboxToggle function" "Not found"
        fi

        # Check for callout support
        if grep -q "rehype-callouts" "$editor_file"; then
            test_pass "Callout support (rehype-callouts) implemented"
        else
            test_fail "Callout support" "rehype-callouts import" "Not found"
        fi
    else
        test_skip "HybridEditor.tsx" "File not found"
    fi

    # Check CSS styling
    local css_file="src/renderer/src/index.css"
    if [[ -f "$css_file" ]]; then
        if grep -q "task-checkbox\|\.callout" "$css_file"; then
            test_pass "Checkbox/Callout CSS styling present"
        else
            test_fail "Checkbox/Callout CSS" "Styling rules" "Not found"
        fi
    fi

    # Check for rehype-callouts dependency
    if grep -q '"rehype-callouts"' package.json; then
        test_pass "rehype-callouts dependency installed"
    else
        test_fail "rehype-callouts dependency" "In package.json" "Not found"
    fi
}

# ============================================================================
# Summary
# ============================================================================

print_summary() {
    log ""
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${BOLD}TEST SUMMARY${NC}"
    log "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log ""
    log "  ${GREEN}Passed${NC}:  $PASS"
    log "  ${RED}Failed${NC}:  $FAIL"
    log "  ${YELLOW}Skipped${NC}: $SKIP"
    log "  ─────────────"
    log "  ${BOLD}Total${NC}:   $TOTAL"
    log ""
    log "  Log: $LOG_FILE"
    log ""

    if [[ $FAIL -eq 0 ]]; then
        log "${GREEN}${BOLD}All tests passed!${NC}"
        exit 0
    else
        log "${RED}${BOLD}Some tests failed.${NC}"
        exit 1
    fi
}

# ============================================================================
# Main
# ============================================================================

main() {
    log "${BOLD}Scribe Automated Test Suite${NC}"
    log "Started: $(date)"
    log ""

    # Run test suites
    test_project_structure
    test_cli_smoke
    test_cli_commands
    test_cli_errors
    test_npm_scripts
    test_unit_test_coverage
    test_e2e_infrastructure
    test_live_editor_features

    # Optionally run vite build (slower)
    if [[ "${RUN_BUILD:-false}" == "true" ]]; then
        test_vite_build
    fi

    print_summary
}

main "$@"
