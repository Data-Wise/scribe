# GEMINI.md

> **AI Assistant Knowledge Base for Scribe (Tauri version)**

---

## 🎯 Project Identity

**Scribe** is a "Native Plus" distraction-free writing environment for macOS, built with **Tauri 2**, **Rust**, and **React**. It is the stable, production-ready foundation of the Scribe ecosystem.

- **Goal**: Zero-friction writing for researchers and ADHD users.
- **Philisophy**: Minimal cognitive load, maximal focus.

---

## 🧠 ADHD Design Principles

1. **Zero Friction**: < 3 seconds to start writing.
2. **One Thing at a Time**: Single note environment.
3. **Escape Hatches**: Auto-save on exit (⌘W).
4. **Visible Progress**: Word count and session tracking.
5. **Sensory-Friendly**: Dark mode default, minimal distraction.

---

## 🚀 Technical Architecture

| Layer | Technology |
|-------|------------|
| **Shell** | Tauri 2 (Rust) |
| **Logic** | TypeScript / React 18 |
| **Styling** | Tailwind CSS |
| **Database** | SQLite (App) / IndexedDB (Browser) |
| **Editor** | BlockNote |

---

## 📁 Key Documentation

- [PROJECT-DEFINITION.md](file:///Users/dt/projects/dev-tools/scribe/docs/reference/PROJECT-DEFINITION.md)
- [CLAUDE.md](file:///Users/dt/projects/dev-tools/scribe/CLAUDE.md)
- [README.md](file:///Users/dt/projects/dev-tools/scribe/README.md)

---

## 🛠️ Build & Run

```bash
npm install
npm run dev
```

---

## 💎 Evolution: Scribe Swift (Scribe-SW)

The project is evolving into a pure-native **Scribe Swift** implementation located at `/Users/dt/projects/dev-tools/scribe-sw`. Refer to that directory for the high-performance Lexical-engine based evolution.

*Updated: 2025-12-31*
