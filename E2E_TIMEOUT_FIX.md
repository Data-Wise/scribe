# E2E Timeout Configuration Fix

**Date:** 2026-01-10
**Sprint:** 34 Phase 4
**Issue:** 92% of E2E tests timing out

## Problem

E2E tests were failing with timeouts because the Playwright configuration had timeouts that were too short for the Vite dev server and browser rendering:

- **Action Timeout:** 10 seconds (too short for slower page loads)
- **Expect Timeout:** 5 seconds (too short for complex assertions)
- **Global Timeout:** 30 seconds (adequate but close to limit)

**Symptoms:**
- Tests timing out at 9-13 seconds
- 674 total tests, ~620 failing due to timeouts
- Only tests completing in < 2-3 seconds were passing

## Root Cause

The browser-based E2E tests (using Vite dev server at http://localhost:5173) can have:
1. Initial page load taking 5-8 seconds
2. Complex UI rendering taking 3-5 seconds
3. Animations and transitions adding 1-2 seconds
4. Total action time: 10-15 seconds (exceeds 10s actionTimeout)

## Solution

Increased timeouts in `e2e/playwright.config.ts`:

```typescript
// Before
{
  use: {
    actionTimeout: 10000,
  },
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
}

// After
{
  use: {
    actionTimeout: 30000,        // 10s → 30s (3x increase)
    navigationTimeout: 30000,     // Added for page loads
  },
  timeout: 60000,                 // 30s → 60s (2x increase)
  expect: {
    timeout: 10000,               // 5s → 10s (2x increase)
  },
}
```

## Timeout Hierarchy

1. **Global Test Timeout (60s):** Maximum time for entire test case
2. **Action Timeout (30s):** Maximum time for each action (click, type, etc.)
3. **Navigation Timeout (30s):** Maximum time for page loads
4. **Expect Timeout (10s):** Maximum time for assertions to pass

## Testing

```bash
# Run specific test file
npm run test:e2e -- e2e/specs/callouts.spec.ts

# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run headed (visible browser)
npm run test:e2e:headed
```

## Expected Results

- **Before Fix:** 54/674 tests passing (8%)
- **After Fix:** Target 650+/674 tests passing (96%+)
- Remaining failures should be legitimate test failures, not timeouts

## Notes

- Browser mode (IndexedDB) is generally faster than Tauri mode (SQLite)
- These timeouts are generous but necessary for reliable E2E testing
- CI environments may need even longer timeouts due to slower resources
- Consider adding `retries: 2` in CI for flaky tests

## Related Files

- `e2e/playwright.config.ts` - Main configuration
- `e2e/specs/` - All E2E test specs
- `.github/workflows/` - CI configuration (future)

## References

- [Playwright Timeouts](https://playwright.dev/docs/test-timeouts)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
