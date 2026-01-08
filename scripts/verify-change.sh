#!/bin/bash

# Verification script to run after making changes
# Catches regressions before committing

set -e  # Exit on first error

echo "🧪 Running post-change verification suite..."
echo ""

# 1. TypeScript check
echo "1/4 TypeScript check..."
npm run typecheck
echo "✅ TypeScript OK"
echo ""

# 2. Critical E2E tests (window dragging must work)
echo "2/4 Critical E2E: Window Dragging..."
npm run test:e2e -- e2e/specs/window-dragging.spec.ts --reporter=list
echo "✅ Window dragging OK"
echo ""

# 3. Unit tests (fast)
echo "3/4 Unit tests..."
npm test -- --run --reporter=verbose
echo "✅ Unit tests OK"
echo ""

# 4. Production build test
echo "4/4 Production build..."
npm run build > /dev/null 2>&1
echo "✅ Build OK"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All verification checks passed!"
echo "Safe to commit changes."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
