# Scribe CLI Test Suite

Generated test suites for dogfooding and QA validation.

## Quick Start

```bash
# Run automated tests (CI-ready)
bash tests/cli/automated-tests.sh

# Run interactive tests (human-guided)
bash tests/cli/interactive-tests.sh
```

## Test Suites

### 1. Automated Tests (`automated-tests.sh`)

Non-interactive tests suitable for CI/CD pipelines.

**What it tests:**
- Project structure (required files/directories)
- CLI smoke tests (version, help)
- CLI commands (list, tags, stats, etc.)
- CLI error handling
- NPM scripts (typecheck, test:run)
- Unit test coverage (file counts)
- E2E infrastructure (playwright config, specs)
- Live Editor features (checkbox, callout implementations)

**Usage:**
```bash
# Standard run
bash tests/cli/automated-tests.sh

# With vite build (slower, more thorough)
RUN_BUILD=true bash tests/cli/automated-tests.sh
```

**Exit Codes:**
- `0` = All tests passed
- `1` = Some tests failed

**Output:**
- Colored console output with pass/fail counts
- Log file in `tests/cli/logs/automated-*.log`

### 2. Interactive Tests (`interactive-tests.sh`)

Human-guided tests for visual verification and edge cases.

**What it tests:**
- CLI help output formatting
- CLI list/search behavior
- Development server startup
- Checkbox CSS and handler implementation
- Callout CSS and rendering
- Browser visual verification (manual)

**Controls:**
- `y` = Pass
- `n` = Fail (with optional notes)
- `s` = Skip
- `q` = Quit early

**Output:**
- Step-by-step prompts with expected/actual comparison
- Summary at end
- Log file in `tests/cli/logs/interactive-*.log`

## CI Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
- name: Run CLI Tests
  run: bash tests/cli/automated-tests.sh
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
bash tests/cli/automated-tests.sh || exit 1
```

## Test Categories

| Category | Automated | Interactive |
|----------|-----------|-------------|
| CLI smoke (version, help) | ✓ | ✓ |
| CLI commands | ✓ | ✓ |
| CLI error handling | ✓ | - |
| NPM scripts | ✓ | ✓ |
| TypeScript typecheck | ✓ | ✓ |
| Unit tests | ✓ | ✓ |
| E2E infrastructure | ✓ | ✓ |
| Live Editor implementation | ✓ | ✓ |
| Visual verification | - | ✓ |

## Logs

Test logs are saved to `tests/cli/logs/`:

```
logs/
├── automated-20251230-143021.log
├── automated-20251230-150512.log
├── interactive-20251230-143521.log
└── ...
```

## Customization

### Adding Tests

**Automated:**
```bash
run_test "Test name" expected_exit_code "command to run"
run_test_contains "Test name" "pattern" "command to run"
```

**Interactive:**
```bash
run_test \
    "Test name" \
    "Expected behavior description" \
    "command to run"
```

### Test Modes (Interactive)

- `output` (default) - Shows command output
- `browser` - Opens browser, waits for judgment
- `manual` - Shows instructions for manual action

## Live Editor Enhancement Tests

The automated suite includes specific tests for the Phase 1-3 implementations:

- **Checkbox implementation**
  - `handleCheckboxToggle` function exists
  - CSS styling in index.css

- **Callout implementation**
  - `rehype-callouts` dependency installed
  - Plugin configured in ReactMarkdown pipeline

- **Test coverage**
  - HybridEditor.test.tsx contains checkbox/callout tests
  - E2E specs include checkbox verification
