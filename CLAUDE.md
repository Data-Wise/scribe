# CLAUDE.md — Scribe

**ADHD-friendly, distraction-free writing app** for academics/researchers — a custom Markdown editor with
academic writing tools, themes, and CLI-based AI integration.

## Stack
- **Tauri 2** (Rust shell) + **React 18** + TypeScript front-end; Node/npm (`package.json`).
- `cli/` companion CLI; docs via mkdocs (`mkdocs.yml`, `docs/`); e2e tests in `e2e/`.
- Status: **active**, v1.22.0, large green suite (~2326 tests).

## Working here
- Dev/build: `npm install`, then the Tauri scripts in `package.json`.
- Keep the test suite green — run before commits.
- Keep `CHANGELOG.md` current; semantic version + sprint tracked in `.STATUS` (frontmatter style).
- `build/`, `dist/`, `coverage/` are generated — don't hand-edit.
