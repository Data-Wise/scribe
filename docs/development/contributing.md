# Contributing

Thank you for your interest in contributing to Scribe!

## Getting Started

### Prerequisites

```bash
# Node.js 18+
node --version

# Rust (for Tauri)
rustc --version

# npm 9+
npm --version
```

### Setup

```bash
# Clone the repository
git clone https://github.com/Data-Wise/scribe
cd scribe

# Install dependencies
npm install

# Run development mode
npm run dev

# Run tests
npm test
```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### Commit Messages

Follow conventional commits:

```
feat: Add auto-theme switching
fix: Correct wiki-link regex
docs: Update keyboard shortcuts
test: Add theme validation tests
refactor: Simplify color parsing
```

### Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Run type check: `npm run typecheck`
6. Submit a pull request

## Code Style

### TypeScript

- Use strict TypeScript
- Prefer interfaces over types
- Document public functions

### React

- Functional components only
- Use hooks (useState, useEffect, etc.)
- Keep components small and focused

### CSS

- Use Tailwind CSS utilities
- Use CSS custom properties for theming
- Follow existing naming conventions

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/renderer/src/__tests__/Themes.test.ts

# Run with coverage
npm test -- --coverage
```

### Writing Tests

- Use Vitest + Testing Library
- Test user behavior, not implementation
- Cover edge cases

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## ADHD Design Principles

When contributing, keep these principles in mind:

1. **Zero Friction** - Every click should be necessary
2. **One Thing at a Time** - Avoid overwhelming the user
3. **Escape Hatches** - Always provide a way out
4. **Visible Progress** - Show what's happening
5. **Sensory-Friendly** - No distracting animations

## Questions?

- Open an issue on GitHub
- Check existing documentation
- Review the PROJECT-DEFINITION.md for scope guidance
