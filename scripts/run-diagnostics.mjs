/**
 * Run window dragging diagnostics using Playwright
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runDiagnostics() {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console messages
  const messages = [];
  page.on('console', msg => {
    messages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  console.log('Loading app...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000); // Wait for app to load

  console.log('Running diagnostic script...');

  // Read and execute the diagnostic script
  const diagnosticScript = readFileSync(
    join(__dirname, 'diagnose-window-dragging.js'),
    'utf-8'
  );

  await page.evaluate(diagnosticScript);
  await page.waitForTimeout(1000); // Let diagnostic complete

  console.log('\n=== DIAGNOSTIC OUTPUT ===\n');

  // Print all console messages
  messages.forEach(msg => {
    const prefix = {
      'error': '❌',
      'warning': '⚠️ ',
      'log': '  ',
      'info': 'ℹ️ '
    }[msg.type] || '  ';

    console.log(`${prefix} ${msg.text}`);
  });

  console.log('\n=== END DIAGNOSTIC OUTPUT ===\n');

  // Keep browser open for manual inspection
  console.log('Browser will stay open. Press Ctrl+C to close when done.');

  // Don't close automatically - let user inspect
  // await browser.close();
}

runDiagnostics().catch(console.error);
