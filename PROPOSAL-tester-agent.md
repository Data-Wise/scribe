# Tester Agent for Tauri Apps - Brainstorm

**Date:** 2024-12-28
**Context:** Need automated UI testing for Scribe (Tauri + React)

---

## The Problem

- Can't use Chrome MCP tools (Tauri runs in its own webview)
- Manual testing is slow and error-prone
- Need to verify full flow: UI → Tauri IPC → Rust → SQLite → back

---

## Options

### Option A: Tauri WebDriver (Official)
**Effort:** 🔧 Medium | **Reliability:** High

Tauri has built-in WebDriver support via `tauri-driver`.

```bash
# Install
cargo install tauri-driver

# Run tests with WebdriverIO
npx wdio run wdio.conf.js
```

**Pros:**
- Official Tauri solution
- Works with WebdriverIO, Selenium, Playwright
- Can interact with actual webview

**Cons:**
- Setup complexity
- Requires running the full app

**Files needed:**
- `wdio.conf.js` - WebdriverIO config
- `tests/e2e/*.spec.ts` - Test specs

---

### Option B: Playwright + Tauri
**Effort:** 🔧 Medium | **Reliability:** High

Connect Playwright to Tauri's Chromium webview.

```typescript
// playwright.config.ts
export default {
  use: {
    // Connect to Tauri's webview
    launchOptions: {
      executablePath: '/path/to/scribe.app/Contents/MacOS/scribe'
    }
  }
}
```

**Pros:**
- Powerful assertion library
- Screenshots, video recording
- Network interception

**Cons:**
- May need custom launcher for Tauri
- Configuration can be tricky

---

### Option C: AppleScript UI Automation (macOS)
**Effort:** ⚡ Quick | **Reliability:** Medium

Use macOS accessibility APIs to control the app.

```applescript
tell application "System Events"
  tell process "Scribe"
    -- Click delete button
    click button "Delete" of group 1 of window 1
  end tell
end tell
```

**Pros:**
- No dependencies
- Works with any macOS app
- Can be called from Claude Code

**Cons:**
- macOS only
- Brittle (UI changes break tests)
- Requires accessibility permissions

---

### Option D: Custom IPC Test Harness (Recommended)
**Effort:** 🔧 Medium | **Reliability:** Very High

Build a test mode into the app that exposes commands.

```rust
// src-tauri/src/testing.rs
#[cfg(debug_assertions)]
#[tauri::command]
pub fn run_test_scenario(scenario: String) -> Result<TestResult, String> {
    match scenario.as_str() {
        "delete_cycle" => test_delete_cycle(),
        "create_project" => test_create_project(),
        _ => Err("Unknown scenario".into())
    }
}
```

```typescript
// Frontend test runner
window.runTest = async (scenario: string) => {
  const result = await invoke('run_test_scenario', { scenario });
  console.log('Test result:', result);
  return result;
};
```

**Pros:**
- Full control
- Tests actual IPC bridge
- Can run from DevTools console
- No external dependencies

**Cons:**
- Need to build test infrastructure
- Tests are in production code (behind flag)

---

### Option E: Vitest + Mock Tauri
**Effort:** ⚡ Quick | **Reliability:** Medium

Unit test frontend with mocked Tauri invoke.

```typescript
// tests/setup.ts
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd, args) => {
    // Mock responses
    if (cmd === 'delete_note') return Promise.resolve(true);
  })
}));
```

**Pros:**
- Fast
- Already have Vitest setup
- Good for frontend logic

**Cons:**
- Doesn't test actual Tauri backend
- Mocks can drift from reality

---

### Option F: Claude Code Agent with Screen Control
**Effort:** 🏗️ Large | **Reliability:** Medium

Build a custom agent that:
1. Takes screenshots of the app
2. Uses vision to understand UI state
3. Uses AppleScript to interact
4. Verifies outcomes

```typescript
// Agent workflow
async function testDeleteNote() {
  // 1. Screenshot
  const before = await captureApp('Scribe');

  // 2. Find delete button using vision
  const deleteBtn = await findElement(before, 'trash icon button');

  // 3. Click it
  await clickAt(deleteBtn.x, deleteBtn.y);

  // 4. Verify
  const after = await captureApp('Scribe');
  const note = await findElement(after, 'test note');
  assert(!note, 'Note should be deleted');
}
```

**Pros:**
- True end-to-end testing
- Can catch visual bugs
- Reusable for any app

**Cons:**
- Complex to build
- Slower than other options
- Vision model can be flaky

---

## Quick Wins

1. **⚡ Add debug commands to window** (5 min) - Already done!
   ```javascript
   await window.scribeDebug.testDelete()
   ```

2. **⚡ Expand Rust unit tests** (15 min)
   - Already have 5 passing tests
   - Add more edge cases

3. **⚡ Add IPC logging** (10 min)
   - Log all Tauri commands in dev mode
   - See exact request/response

---

## Recommended Path

### Phase 1: Now (Quick wins)
1. ✅ Rust unit tests (done)
2. ✅ Debug utilities in window (done)
3. Add IPC request/response logging

### Phase 2: This Week
4. Build Custom IPC Test Harness (Option D)
5. Create test scenarios for critical flows

### Phase 3: Later
6. Add Playwright + tauri-driver for full E2E
7. Consider vision-based testing for complex UI

---

## Next Steps

→ **Start with:** Add IPC logging to see all Tauri commands
→ **Then:** Build test scenarios in Rust that can be triggered from console
→ **Goal:** `await window.scribeTest.runAll()` that tests everything

---

*Brainstorm by Claude Code*
