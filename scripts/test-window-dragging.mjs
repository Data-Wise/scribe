/**
 * Comprehensive window dragging test with visual inspection
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testWindowDragging() {
  console.log('🔍 Starting comprehensive window dragging review...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--auto-open-devtools-for-tabs']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Collect console messages
  const messages = [];
  page.on('console', msg => {
    messages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  console.log('📱 Loading app at http://localhost:5173...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  console.log('\n=== PHASE 1: Visual Inspection ===\n');

  // Take screenshot of initial state
  await page.screenshot({ path: '/tmp/scribe-initial-state.png', fullPage: true });
  console.log('📸 Screenshot saved: /tmp/scribe-initial-state.png');

  // Check if we're in browser mode
  const isBrowser = await page.evaluate(() => {
    return typeof window.__TAURI__ === 'undefined';
  });

  console.log(`\n🌍 Runtime: ${isBrowser ? 'Browser (IndexedDB)' : 'Tauri (SQLite)'}`);

  if (isBrowser) {
    console.log('\n⚠️  WARNING: Running in browser mode');
    console.log('   -webkit-app-region has NO EFFECT in regular browsers');
    console.log('   Window dragging ONLY works in Tauri desktop app');
    console.log('   To test properly, use: npm run tauri dev');
    console.log('   Or test the built app bundle\n');
  }

  console.log('\n=== PHASE 2: DOM Structure Analysis ===\n');

  // Check editor header existence and properties
  const editorHeaderExists = await page.locator('.editor-header').count() > 0;
  console.log(`✓ .editor-header exists: ${editorHeaderExists}`);

  if (editorHeaderExists) {
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('.editor-header');
      const style = window.getComputedStyle(header);
      const rect = header.getBoundingClientRect();

      return {
        appRegion: style['-webkit-app-region'] || style.webkitAppRegion,
        zIndex: style.zIndex,
        position: style.position,
        pointerEvents: style.pointerEvents,
        display: style.display,
        visibility: style.visibility,
        cursor: style.cursor,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        }
      };
    });

    console.log('\n📊 .editor-header CSS Properties:');
    console.log(`   -webkit-app-region: ${headerInfo.appRegion || 'NOT SET'}`);
    console.log(`   z-index: ${headerInfo.zIndex}`);
    console.log(`   position: ${headerInfo.position}`);
    console.log(`   pointer-events: ${headerInfo.pointerEvents}`);
    console.log(`   cursor: ${headerInfo.cursor}`);
    console.log(`   display: ${headerInfo.display}`);
    console.log(`   visibility: ${headerInfo.visibility}`);

    console.log('\n📏 .editor-header Dimensions:');
    console.log(`   Position: (${headerInfo.rect.left}, ${headerInfo.rect.top})`);
    console.log(`   Size: ${headerInfo.rect.width} × ${headerInfo.rect.height}`);
    console.log(`   Bounds: left=${headerInfo.rect.left}, right=${headerInfo.rect.right}`);
  }

  console.log('\n=== PHASE 3: Overlay Detection ===\n');

  const testPoints = [
    { x: 50, y: 20, label: 'Far left (sidebar zone)' },
    { x: 250, y: 20, label: 'Left edge (overlap zone)' },
    { x: 400, y: 20, label: 'Left-center' },
    { x: 640, y: 20, label: 'Center' },
    { x: 900, y: 20, label: 'Right-center' },
    { x: 1200, y: 20, label: 'Far right' }
  ];

  console.log('🎯 Testing click points across header area:\n');

  for (const point of testPoints) {
    const elementInfo = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return null;

      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        className: el.className,
        id: el.id,
        appRegion: style['-webkit-app-region'] || style.webkitAppRegion,
        zIndex: style.zIndex,
        cursor: style.cursor
      };
    }, point);

    if (elementInfo) {
      const isDragRegion = elementInfo.appRegion === 'drag';
      const icon = isDragRegion ? '✅' : '❌';
      console.log(`${icon} (${point.x}, ${point.y}) - ${point.label}`);
      console.log(`   Element: <${elementInfo.tag}> class="${elementInfo.className}"`);
      console.log(`   -webkit-app-region: ${elementInfo.appRegion || 'none'}`);
      console.log(`   z-index: ${elementInfo.zIndex}`);
      console.log(`   cursor: ${elementInfo.cursor}`);
      console.log('');
    }
  }

  console.log('\n=== PHASE 4: Interactive Elements Check ===\n');

  // Check breadcrumb items
  const breadcrumbs = await page.locator('.breadcrumb-item').all();
  console.log(`🔗 Found ${breadcrumbs.length} breadcrumb items`);

  for (let i = 0; i < breadcrumbs.length; i++) {
    const appRegion = await breadcrumbs[i].evaluate(el => {
      const style = window.getComputedStyle(el);
      return style['-webkit-app-region'] || style.webkitAppRegion;
    });
    const expected = 'no-drag';
    const match = appRegion === expected;
    console.log(`   [${i}] ${match ? '✅' : '❌'} -webkit-app-region: ${appRegion} (expected: ${expected})`);
  }

  // Check timer buttons
  const timerButtons = await page.locator('.timer-btn').all();
  console.log(`\n⏱️  Found ${timerButtons.length} timer buttons`);

  for (let i = 0; i < timerButtons.length; i++) {
    const appRegion = await timerButtons[i].evaluate(el => {
      const style = window.getComputedStyle(el);
      return style['-webkit-app-region'] || style.webkitAppRegion;
    });
    const expected = 'no-drag';
    const match = appRegion === expected;
    console.log(`   [${i}] ${match ? '✅' : '❌'} -webkit-app-region: ${appRegion} (expected: ${expected})`);
  }

  console.log('\n=== PHASE 5: CSS Load Verification ===\n');

  // Check if the CSS file contains the z-index fix
  const cssHasZIndex = await page.evaluate(() => {
    const styleSheets = Array.from(document.styleSheets);
    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule.selectorText === '.editor-header') {
            return rule.cssText.includes('z-index');
          }
        }
      } catch (e) {
        // CORS error, skip
      }
    }
    return false;
  });

  console.log(`📄 CSS contains .editor-header z-index: ${cssHasZIndex ? '✅ YES' : '❌ NO'}`);

  // Get the actual computed z-index
  const computedZIndex = await page.evaluate(() => {
    const header = document.querySelector('.editor-header');
    if (!header) return null;
    return window.getComputedStyle(header).zIndex;
  });

  console.log(`📄 Computed z-index value: ${computedZIndex}`);

  if (computedZIndex === 'auto' || computedZIndex === '0') {
    console.log('   ⚠️  z-index is not being applied!');
  } else if (computedZIndex === '10') {
    console.log('   ✅ z-index: 10 is correctly applied');
  }

  console.log('\n=== PHASE 6: Run Built-in Diagnostic ===\n');

  // Run the diagnostic script
  const diagnosticScript = readFileSync(
    join(__dirname, 'diagnose-window-dragging.js'),
    'utf-8'
  );

  await page.evaluate(diagnosticScript);
  await page.waitForTimeout(1000);

  console.log('\n=== SUMMARY ===\n');

  if (isBrowser) {
    console.log('❌ CRITICAL: Window dragging CANNOT work in browser mode');
    console.log('');
    console.log('📋 Action Required:');
    console.log('   1. Stop the dev server (Ctrl+C)');
    console.log('   2. Run: npm run tauri dev');
    console.log('   3. Or test the built app:');
    console.log('      open src-tauri/target/release/bundle/macos/Scribe.app');
    console.log('');
  } else {
    if (computedZIndex === '10' && headerInfo?.appRegion === 'drag') {
      console.log('✅ All CSS properties are correctly applied');
      console.log('   Window dragging should work in Tauri desktop app');
    } else {
      console.log('❌ CSS properties are NOT correctly applied');
      console.log('   Check HMR cache or rebuild the app');
    }
  }

  console.log('\n📊 Browser will stay open for manual inspection.');
  console.log('   Press Ctrl+C in terminal to close when done.\n');

  // Don't close - let user inspect
  // await browser.close();
}

testWindowDragging().catch(console.error);
