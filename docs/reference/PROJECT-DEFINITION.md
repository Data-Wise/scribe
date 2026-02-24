# Scribe Project Definition

> **Version:** 1.20.0 | **Updated:** 2026-02-24 | **Status:** Stable Release

---

## One Sentence

**Scribe = ADHD-friendly distraction-free writer + projects + academic features + CLI-based AI.**

---

## TL;DR

| What | How |
|------|-----|
| **Editor** | CodeMirror 6 (Source / Live Preview / Reading) |
| **Focus** | Distraction-free mode, global hotkey, Pomodoro timer |
| **Projects** | Research, Teaching, R-Package, R-Dev, Generic |
| **Citations** | Zotero via Better BibTeX |
| **Export** | Markdown, LaTeX, PDF, Word via Pandoc |
| **AI** | Claude + Gemini CLI (no API keys) |
| **Notes** | Wiki links, tags, daily notes, knowledge graph |
| **Storage** | SQLite (Tauri) / IndexedDB (Browser) |
| **Design** | ADHD-first, minimal friction |

---

## ADHD Design Principles

> **These override ALL feature decisions.**

### 1. Zero Friction (< 3 seconds)

```
⌘⇧N → Window appears → Start typing
No dialogs. No choices. Just write.
```

### 2. One Thing at a Time

- Single note in editor
- Sidebar collapses in focus mode
- Tabs for multi-note workflows

### 3. Escape Hatches

- ⌘W = Close (auto-saves)
- ⌘Z = Undo (always works)
- No "Are you sure?" dialogs

### 4. Visible Progress

- Word count (always visible)
- Pomodoro timer (work/break cycles)
- Streak indicator (optional)

### 5. Sensory-Friendly

- Dark mode default
- No distracting animations
- Muted colors, high contrast text

### 6. Quick Wins

- Milestone celebrations (100, 500, 1000 words)
- Daily goal progress bar

---

## What Scribe IS

| Principle | Implementation |
|-----------|----------------|
| **Distraction-Free Writer** | Focus mode, minimal UI |
| **CodeMirror Editor** | Source/Live/Reading modes |
| **Project Manager** | 5 typed archetypes with scoped notes |
| **Academic Writing Tool** | Zotero + LaTeX + Quarto |
| **Knowledge Notes** | Wiki links, tags, daily notes, graph |
| **ADHD-Friendly** | Quick capture, low friction, Pomodoro |
| **CLI-Based AI** | `claude` and `gemini` CLI |
| **Desktop App** | Tauri 2 with embedded terminal |

---

## What Scribe IS NOT

| Avoid | Why |
|-------|-----|
| Full IDE | Use VS Code / Positron |
| Code editor | Use VS Code / RStudio |
| Full PKM system | Obsidian does this |
| API-based AI | Requires keys, costs money |
| Plugin system | Scope creep |

---

## Technical Stack (Locked)

| Layer | Technology |
|-------|------------|
| Shell | Tauri 2 |
| UI | React 18 |
| Editor | CodeMirror 6 |
| Styling | Tailwind CSS |
| State | Zustand (5 stores) |
| Database | SQLite (Tauri) / IndexedDB (Browser) |
| AI | CLI only (no API) |
| Citations | Pandoc citeproc |
| Math | KaTeX |
| Terminal | xterm.js |
| Graph | D3.js |
| Testing | Vitest + Testing Library |

---

## Project Types

| Type | Use Case | Default Template |
|------|----------|------------------|
| **Research** | Papers, analysis | Academic paper |
| **Teaching** | Courses, lectures | Lecture notes |
| **R-Package** | R package docs | Vignette |
| **R-Dev** | Dev tools projects | README-first |
| **Generic** | Everything else | Blank |

---

## AI Integration

### Why CLI, Not API?

| CLI | API |
|-----|-----|
| Free (your subscription) | Pay per token |
| Already installed | Need API keys |
| Auto-updates | SDK management |
| Zero config | Setup friction |

### Quick Actions (10 max)

5 default + 5 custom AI actions, configurable in Settings.

---

## Scope Creep Prevention

### Before Adding Anything

1. **Does it help ADHD focus?** → If no, reject
2. **Is it in shipped tiers?** → If no, defer
3. **Does it need API keys?** → If yes, reject
4. **Does it add UI clutter?** → If yes, reconsider
5. **Can existing tools do it?** → If yes, integrate

### Red Flags (Stop)

- "We could also add..."
- "While we're at it..."
- "Other apps have..."
- "It would be cool if..."

### Green Flags (Proceed)

- "This reduces friction"
- "This helps focus"
- "This removes a step"
- "This uses existing CLI"

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Time to capture | < 3 seconds | Achieved |
| All core features | Complete | Shipped (v1.20.0) |
| Tests | 2,000+ passing | 2,280+ (76 files) |
| App launch | < 2 seconds | Achieved |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-24 | 1.20.0 | Documentation overhaul, release cleanup |
| 2026-02-23 | 1.19.0 | Pomodoro timer, settings infrastructure |
| 2026-01-10 | 1.16.0 | Icon-centric sidebar, tech debt remediation |
| 2026-01-07 | 1.15.0 | Quarto autocomplete, LaTeX completions |
| 2025-12-25 | 1.3.0 | Sprint 10 complete, theme system |
| 2024-12-24 | 1.0.0 | Initial definition |
