# Tauri WebDriver E2E Testing Research

**Date:** 2025-12-30
**Status:** Research Complete
**Recommendation:** Defer implementation (macOS not natively supported)

---

## Overview

Tauri supports WebDriver E2E testing via `tauri-driver`, a cross-platform wrapper for native WebDriver servers. This enables testing the actual Tauri app (not just the web view).

## Platform Support

| Platform | Support | Driver |
|----------|---------|--------|
| Windows | ✅ Native | msedgedriver |
| Linux | ✅ Native | WebKitWebDriver |
| **macOS** | ⚠️ Paid only | CrabNebula subscription |
| iOS/Android | ⚠️ Complex | Appium 2 |

### macOS Limitation

macOS lacks a native WKWebView driver. The only solution is [CrabNebula's paid offering](https://docs.crabnebula.dev/plugins/tauri-e2e-tests/), which requires:
- Subscription access
- `@crabnebula/tauri-driver` npm package
- `tauri-plugin-automation` Rust plugin
- Conditional compilation for dev builds only

---

## Standard Setup (Windows/Linux)

### 1. Install tauri-driver

```bash
cargo install tauri-driver --locked
```

### 2. Platform-specific drivers

**Linux:**
```bash
# Verify WebKitWebDriver is available
which WebKitWebDriver
# Or install: sudo apt install webkit2gtk-driver
```

**Windows:**
```bash
cargo install --git https://github.com/chippers/msedgedriver-tool
# Ensure msedgedriver.exe version matches Edge version
```

### 3. WebdriverIO Configuration

Create `wdio.conf.js`:

```javascript
const { spawn } = require('child_process');
let tauriDriver;

exports.config = {
  specs: ['./e2e/specs/**/*.spec.ts'],
  maxInstances: 1,
  capabilities: [{
    'tauri:options': {
      application: './src-tauri/target/release/scribe'
    }
  }],

  beforeSession() {
    tauriDriver = spawn('tauri-driver', [], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
  },

  afterSession() {
    tauriDriver.kill();
  }
};
```

### 4. Build before testing

```bash
# Build release binary first
cd src-tauri && cargo build --release
```

---

## CI Integration

GitHub Actions example for Linux:

```yaml
- name: Install webkit driver
  run: sudo apt-get install webkit2gtk-driver

- name: Install tauri-driver
  run: cargo install tauri-driver --locked

- name: Build Tauri app
  run: cd src-tauri && cargo build --release

- name: Run WebDriver tests
  run: xvfb-run npx wdio run wdio.conf.js
```

---

## Recommendation for Scribe

### Current Approach (Keep)

Continue using Playwright tests against browser mode (`npm run dev:vite`). This provides:
- ✅ Fast execution
- ✅ Cross-platform (macOS, Windows, Linux)
- ✅ Full UI testing
- ✅ No additional dependencies

### Future Enhancement (v2.0+)

Consider Tauri WebDriver testing when:
1. Windows/Linux CI is a priority
2. Testing Tauri-specific IPC calls is needed
3. CrabNebula subscription for macOS becomes viable

### What We'd Gain

- Test actual Tauri window (not just web view)
- Verify IPC command behavior
- Test file system operations via Tauri APIs
- Test native menus, tray, etc.

### What We'd Lose

- macOS local development testing (without paid subscription)
- Simplicity (current Playwright setup is minimal)

---

## Sources

- [Tauri WebDriver Docs](https://v2.tauri.app/develop/tests/webdriver/)
- [WebdriverIO Example](https://v2.tauri.app/develop/tests/webdriver/example/webdriverio/)
- [CrabNebula macOS Driver](https://docs.crabnebula.dev/plugins/tauri-e2e-tests/)
- [GitHub Actions CI](https://v2.tauri.app/develop/tests/webdriver/ci/)
- [Tauri 2 Windows Example](https://github.com/Haprog/tauri-wdio-win-test)

---

## Decision

**Defer Tauri WebDriver E2E** for now. Current Playwright tests against browser mode provide excellent coverage for UI behavior. Revisit when:
- Cross-platform CI is established
- Tauri-specific IPC testing becomes a priority
- macOS native support improves
