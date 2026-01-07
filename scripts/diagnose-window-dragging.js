/**
 * Window Dragging Diagnostic Script
 *
 * Paste this into the browser console (DevTools) to diagnose window dragging issues.
 *
 * Usage:
 * 1. Open DevTools (Right-click → Inspect)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Review the output
 */

(function diagnoseWindowDragging() {
  console.clear();
  console.log('%c=== Window Dragging Diagnostic ===', 'font-size: 16px; font-weight: bold; color: #3b82f6');
  console.log('');

  // Test 1: Check if editor header exists
  console.log('%c[1/6] Checking for .editor-header element...', 'font-weight: bold');
  const header = document.querySelector('.editor-header');
  if (!header) {
    console.error('❌ FAIL: .editor-header not found in DOM');
    console.log('   This means the element doesn\'t exist. Check App.tsx.');
    return;
  }
  console.log('✅ PASS: .editor-header exists');
  console.log('   Element:', header);
  console.log('');

  // Test 2: Check CSS app-region property
  console.log('%c[2/6] Checking -webkit-app-region CSS...', 'font-weight: bold');
  const style = window.getComputedStyle(header);
  const appRegion = style['-webkit-app-region'];
  const appRegionWebkit = style.webkitAppRegion;

  if (appRegion === 'drag' || appRegionWebkit === 'drag') {
    console.log('✅ PASS: -webkit-app-region is set to "drag"');
  } else {
    console.error('❌ FAIL: -webkit-app-region is NOT set to drag');
    console.log('   Current value:', appRegion || appRegionWebkit || 'none');
    console.log('   Expected: "drag"');
    console.log('   Fix: Check src/renderer/src/index.css line 332');
  }
  console.log('');

  // Test 3: Check z-index and positioning
  console.log('%c[3/6] Checking z-index and visibility...', 'font-weight: bold');
  const rect = header.getBoundingClientRect();
  const zIndex = style.zIndex;
  const position = style.position;
  const pointerEvents = style.pointerEvents;

  console.log('   z-index:', zIndex);
  console.log('   position:', position);
  console.log('   pointer-events:', pointerEvents);
  console.log('   boundingRect:', {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  });
  console.log('');

  // Test 4: Check for overlaying elements
  console.log('%c[4/6] Checking for overlaying elements...', 'font-weight: bold');
  const testPoints = [
    { x: 200, y: 20, label: 'Left side' },
    { x: window.innerWidth / 2, y: 20, label: 'Center' },
    { x: window.innerWidth - 200, y: 20, label: 'Right side' }
  ];

  let overlayDetected = false;
  testPoints.forEach(point => {
    const elementAtPoint = document.elementFromPoint(point.x, point.y);
    if (elementAtPoint && !header.contains(elementAtPoint)) {
      console.warn(`⚠️  OVERLAY: Element at ${point.label} (${point.x}, ${point.y})`);
      console.log(`   Found: ${elementAtPoint.className || elementAtPoint.tagName}`);
      overlayDetected = true;
    } else {
      console.log(`✅ ${point.label}: .editor-header or child element`);
    }
  });

  if (!overlayDetected) {
    console.log('✅ PASS: No overlaying elements detected');
  } else {
    console.error('❌ FAIL: Some elements are overlaying the drag region');
    console.log('   This prevents clicking/dragging. Fix z-index issues.');
  }
  console.log('');

  // Test 5: Check interactive elements have no-drag
  console.log('%c[5/6] Checking interactive elements...', 'font-weight: bold');
  const breadcrumbs = header.querySelectorAll('.breadcrumb-item');
  const timerButtons = header.querySelectorAll('.timer-btn');

  let noDragMissing = false;

  breadcrumbs.forEach((el, i) => {
    const elStyle = window.getComputedStyle(el);
    const elAppRegion = elStyle['-webkit-app-region'] || elStyle.webkitAppRegion;
    if (elAppRegion !== 'no-drag') {
      console.error(`❌ .breadcrumb-item[${i}] missing no-drag`);
      noDragMissing = true;
    }
  });

  timerButtons.forEach((el, i) => {
    const elStyle = window.getComputedStyle(el);
    const elAppRegion = elStyle['-webkit-app-region'] || elStyle.webkitAppRegion;
    if (elAppRegion !== 'no-drag') {
      console.error(`❌ .timer-btn[${i}] missing no-drag`);
      noDragMissing = true;
    }
  });

  if (!noDragMissing) {
    console.log('✅ PASS: Interactive elements have no-drag');
  } else {
    console.log('   Fix: Add -webkit-app-region: no-drag to interactive elements');
  }
  console.log('');

  // Test 6: Environment check
  console.log('%c[6/6] Environment info...', 'font-weight: bold');
  console.log('   User Agent:', navigator.userAgent);
  console.log('   Platform:', navigator.platform);
  console.log('   Window size:', `${window.innerWidth}x${window.innerHeight}`);
  console.log('   isTauri:', typeof window.__TAURI__ !== 'undefined');
  console.log('');

  // Summary
  console.log('%c=== Summary ===', 'font-size: 16px; font-weight: bold; color: #3b82f6');

  if (appRegion === 'drag' || appRegionWebkit === 'drag') {
    if (!overlayDetected && !noDragMissing) {
      console.log('%c✅ ALL CHECKS PASSED', 'color: green; font-weight: bold; font-size: 14px');
      console.log('');
      console.log('Window dragging should work. If it doesn\'t:');
      console.log('1. Try refreshing the page (⌘R)');
      console.log('2. Restart the dev server');
      console.log('3. Clear browser cache');
      console.log('4. Check if this is an HMR issue (see docs/HMR-TROUBLESHOOTING.md)');
    } else {
      console.log('%c⚠️  SOME ISSUES DETECTED', 'color: orange; font-weight: bold; font-size: 14px');
      console.log('');
      console.log('Review the warnings above and fix the issues.');
    }
  } else {
    console.log('%c❌ CRITICAL FAILURE', 'color: red; font-weight: bold; font-size: 14px');
    console.log('');
    console.log('The -webkit-app-region: drag CSS is missing or incorrect.');
    console.log('Fix: Check src/renderer/src/index.css line 332');
    console.log('Expected CSS:');
    console.log('.editor-header {');
    console.log('  -webkit-app-region: drag;');
    console.log('  cursor: grab;');
    console.log('}');
  }

  console.log('');
  console.log('%cFor more help, see:', 'font-weight: bold');
  console.log('  - WINDOW-DRAGGING-DEBUG-GUIDE.md (comprehensive guide)');
  console.log('  - docs/HMR-TROUBLESHOOTING.md (HMR-related issues)');
  console.log('  - e2e/specs/window-dragging.spec.ts (E2E tests)');
})();
