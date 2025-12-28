#!/bin/zsh
# Unit and Validation tests for Scribe CLI functions

# Source the CLI script to load functions
# We use the built script to ensure we test what is deployed
if [[ ! -f cli/scribe.zsh ]]; then
    echo "Error: cli/scribe.zsh not found. Run ./cli/build.sh first."
    exit 1
fi

source cli/scribe.zsh

# Setup
failed=0
total_tests=0

assert_eq() {
    ((total_tests++))
    local actual="$1"
    local expected="$2"
    local msg="$3"
    if [[ "$actual" != "$expected" ]]; then
        echo "FAIL: $msg"
        echo "  Expected: '$expected'"
        echo "  Actual:   '$actual'"
        failed=1
    else
        echo "PASS: $msg"
    fi
}

assert_match() {
    ((total_tests++))
    local actual="$1"
    local pattern="$2"
    local msg="$3"
    if [[ ! "$actual" =~ $pattern ]]; then
        echo "FAIL: $msg"
        echo "  Actual '$actual' does not match pattern '$pattern'"
        failed=1
    else
        echo "PASS: $msg"
    fi
}

assert_fail() {
    ((total_tests++))
    local cmd="$*"
    # Capture stderr to avoid noise
    if eval "$cmd" > /dev/null 2>&1; then
        echo "FAIL: Command succeeded but should have failed: $cmd"
        failed=1
    else
        echo "PASS: Command failed as expected: $cmd"
    fi
}

echo "=== Unit Tests: Utilities ==="

# Test _scribe_escape
echo "--- _scribe_escape ---"
input="O'Reilly"
expected="O''Reilly"
actual=$(_scribe_escape "$input")
assert_eq "$actual" "$expected" "Escapes single quotes"

input="Normal Text"
expected="Normal Text"
actual=$(_scribe_escape "$input")
assert_eq "$actual" "$expected" "Leaves normal text alone"

# Test _scribe_generate_id
echo "--- _scribe_generate_id ---"
id=$(_scribe_generate_id)
# Check length (32 hex chars = 16 bytes encoded)
assert_eq "${#id}" "32" "ID length is 32"
# Check pattern (hex)
assert_match "$id" "^[a-f0-9]+$" "ID is hexadecimal"

# Test _scribe_format_time
echo "--- _scribe_format_time ---"
# We need a fixed timestamp. 1703617200 = Tue Dec 26 19:00:00 2023 UTC
# date -r on macOS expects seconds.
ts=1703617200
formatted=$(_scribe_format_time "$ts")
assert_match "$formatted" "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$" "Time format is YYYY-MM-DD HH:MM"


echo "=== Validation Tests: Inputs ==="

# Mock DB check to pass for argument validation tests
# We want to test that the functions check arguments *before* doing DB operations if possible,
# or simply that they return error codes on bad input.
# Most functions call _scribe_check_db first.
# Let's create a dummy db file for the check to pass.
export SCRIBE_DB="/tmp/scribe_unit_test_$$.db"
touch "$SCRIBE_DB"

# Test search validation
echo "--- _scribe_search ---"
assert_fail "_scribe_search"

# Test edit validation
echo "--- _scribe_edit ---"
assert_fail "_scribe_edit"

# Test delete validation
echo "--- _scribe_delete ---"
assert_fail "_scribe_delete"

# Test export validation
echo "--- _scribe_export ---"
assert_fail "_scribe_export"

# Test database missing validation
echo "--- _scribe_check_db (Missing DB) ---"
rm "$SCRIBE_DB"
assert_fail "_scribe_check_db"

# Cleanup
rm -f "$SCRIBE_DB"

echo "=== Summary ==="
if [[ $failed -eq 0 ]]; then
    echo "All $total_tests tests passed."
    exit 0
else
    echo "Tests failed."
    exit 1
fi
