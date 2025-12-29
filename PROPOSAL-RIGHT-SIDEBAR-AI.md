# Proposal: Right Sidebar AI Panel

**Generated:** 2025-12-28
**Context:** Scribe right sidebar enhancement
**Status:** Draft for review

---

## Overview

Add an AI Panel tab to the right sidebar, providing quick access to Claude/Gemini CLI integration without leaving the editor.

---

## Current State

| Tab | Status |
|-----|--------|
| Properties | ✅ Exists |
| Backlinks | ✅ Exists |
| Tags | ✅ Exists |
| **AI** | ❌ Planned but never built |
| **TOC** | ❌ Planned but never built |

---

## Proposed AI Panel Features

### Quick Actions (Phase 1)

| Action | AI | Prompt |
|--------|-----|--------|
| Refactor | Claude | "Improve structure and clarity of this note" |
| Brainstorm | Gemini | "Generate ideas based on this note" |
| Summarize | Claude | "Create a concise summary" |
| Expand | Claude | "Flesh out these bullet points" |
| Proofread | Claude | "Check grammar and spelling" |

### UI Design (Minimal List)

```
┌─────────────────────────┐
│ ✨ AI Assistant         │
├─────────────────────────┤
│ ▸ Refactor with Claude  │
│ ▸ Brainstorm with Gemini│
│ ▸ Summarize             │
│ ▸ Expand bullet points  │
│ ▸ Proofread             │
│ ─────────────────────── │
│ [Ask anything...]       │
│ ⌘⇧A                     │
├─────────────────────────┤
│ Response:               │
│ ┌─────────────────────┐ │
│ │ AI response appears │ │
│ │ here inline, no     │ │
│ │ modal dialogs       │ │
│ └─────────────────────┘ │
│ [Apply to Note] [Copy]  │
└─────────────────────────┘
```

---

## Technical Implementation

### AIPanel.tsx Component

```tsx
interface AIPanelProps {
  noteContent: string
  noteTitle: string
  onApplyResponse: (content: string) => void
}

interface AIAction {
  id: string
  label: string
  icon: LucideIcon
  ai: 'claude' | 'gemini'
  prompt: string
}

const AI_ACTIONS: AIAction[] = [
  { id: 'refactor', label: 'Refactor', icon: Sparkles, ai: 'claude', prompt: 'Improve structure...' },
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb, ai: 'gemini', prompt: 'Generate ideas...' },
  // ...
]
```

### Integration with Existing CLI

```typescript
// Uses existing api.runClaude and api.runGemini
const handleAction = async (action: AIAction) => {
  setLoading(true)
  const prompt = `${action.prompt}\n\n${noteContent}`
  const response = action.ai === 'claude'
    ? await api.runClaude(prompt)
    : await api.runGemini(prompt)
  setResponse(response)
  setLoading(false)
}
```

---

## Keyboard Shortcut

| Shortcut | Action |
|----------|--------|
| `⌘⇧A` | Open/focus AI tab |

---

## ADHD-Friendly Design

1. **1-click actions** — No thinking required
2. **Inline responses** — No modal interruption
3. **Visual feedback** — Loading spinner, success state
4. **Escape hatch** — Easy to dismiss/clear response

---

## Implementation Plan

### Phase 1: Basic Panel (1-2 hours)
- [ ] Create `AIPanel.tsx` component
- [ ] Add "AI" tab to right sidebar in App.tsx
- [ ] Wire up 3 quick actions (refactor, brainstorm, summarize)
- [ ] Show response inline (replace modal approach)

### Phase 2: Polish (1 hour)
- [ ] Add loading states
- [ ] Add ⌘⇧A keyboard shortcut
- [ ] Add "Apply to Note" button
- [ ] Add "Copy" button
- [ ] Error handling

### Phase 3: TOC Tab (30 min)
- [ ] Create `TOCPanel.tsx`
- [ ] Extract headings from markdown
- [ ] Click-to-scroll navigation

### Phase 4: Advanced (Future)
- [ ] Custom prompt input
- [ ] Response history
- [ ] Context-aware suggestions
- [ ] Streaming output

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/renderer/src/components/AIPanel.tsx` | **Create** |
| `src/renderer/src/components/TOCPanel.tsx` | **Create** |
| `src/renderer/src/App.tsx` | **Modify** (add AI/TOC tabs) |
| `src/renderer/src/index.css` | **Modify** (AI panel styles) |

---

## Decision Points

1. **Inline vs Modal responses?** → Recommend inline (less interruption)
2. **Include custom prompt input?** → Yes, but secondary (below quick actions)
3. **Include TOC in same sprint?** → Yes, quick win (30 min)
4. **Keyboard shortcut?** → ⌘⇧A for AI panel

---

## Next Steps

1. [ ] Review and approve this proposal
2. [ ] Implement Phase 1
3. [ ] Test with real Claude/Gemini CLI
4. [ ] Write tests
