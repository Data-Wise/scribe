# Quick Actions Reference Card

> **One-click AI prompts for faster writing workflows**

---

## The 5 Quick Actions

| Button | Label | Prompt | Use Case |
|--------|-------|--------|----------|
| ✨ | **Improve** | "Improve clarity and flow" | Polish rough drafts, improve readability |
| 📝 | **Expand** | "Expand on this idea" | Add depth, examples, explanations |
| 📋 | **Summarize** | "Summarize in 2-3 sentences" | Create executive summaries, TL;DR |
| 💡 | **Explain** | "Explain this simply" | Simplify complex topics, ELI5 |
| 🔍 | **Research** | "What does research say about this?" | Find citations, evidence, supporting data |

---

## Quick Start

```
1. Open a note
2. Click Claude tab (right sidebar)
3. Click any emoji button
4. AI responds with context from your note
```

**Keyboard shortcuts:** None (mouse/touch only)

---

## How They Work

### Context Building

Each Quick Action automatically includes:

```
Prompt: [Quick Action prompt]

Context:
Title: [Your note title]
Content: [Your full note content]
```

### Example

**Your note:**
```
# Statistical Power

Power analysis determines sample size needed to detect effects.
Common power levels: 0.80, 0.90, 0.95
```

**Click ✨ Improve:**

AI receives:
```
Improve clarity and flow

Context:
Title: Statistical Power
Content: Power analysis determines sample size needed...
```

AI response:
```
Here's an improved version:

Statistical power analysis helps researchers determine the minimum
sample size required to reliably detect an effect of a given size.
Researchers typically aim for power levels of 0.80 (80% chance of
detecting a true effect), though more stringent studies may use
0.90 or 0.95.
```

---

## When to Use Each Action

### ✨ Improve

**Best for:**
- First drafts that need polish
- Academic writing that feels stilted
- Bullet points → prose conversion
- Grammar/clarity issues

**Not for:**
- Content generation (use Expand)
- Length reduction (use Summarize)

### 📝 Expand

**Best for:**
- Outline → full section
- Adding examples/evidence
- Deepening shallow explanations
- Meeting minimum word counts

**Not for:**
- Polishing existing text (use Improve)
- Making text shorter (use Summarize)

### 📋 Summarize

**Best for:**
- Executive summaries
- Abstract writing
- Email TL;DR
- Meeting notes compression

**Output:** Always 2-3 sentences (as specified in prompt)

### 💡 Explain

**Best for:**
- Technical jargon → plain English
- Teaching/onboarding docs
- Simplifying for non-experts
- "Explain like I'm 5" requests

**Not for:**
- Adding complexity (use Expand)
- Finding citations (use Research)

### 🔍 Research

**Best for:**
- Finding supporting evidence
- Academic citation discovery
- Fact-checking claims
- Literature review assistance

**Note:** Browser mode shows stub (AI unavailable). Use Tauri mode for actual research.

---

## Advanced Tips

### Combine with @ References

```
1. Click @ in chat input
2. Add related notes
3. Click Quick Action
4. AI considers all referenced notes
```

**Example:**
```
@Methods @Results [click Summarize]
→ AI summarizes across both notes
```

### Sequential Actions

```
1. Click Expand (adds detail)
2. Review AI response
3. Click Improve (polishes expanded text)
4. Copy final version
```

### Custom Follow-ups

```
1. Click Quick Action
2. Read AI response
3. Type follow-up question
4. AI continues same conversation
```

---

## Keyboard Workflow

**Full keyboard flow:**

```
⌘D          Open daily note
⌘]          Open right sidebar (if closed)
Click       Claude tab
Click       Quick Action button
⌘A          Select AI response
⌘C          Copy to clipboard
⌘[          Back to editor
⌘V          Paste improved text
```

**Almost keyboard-only** (Quick Actions themselves require mouse/touch)

---

## Browser Mode Behavior

**Tauri mode:** Full AI responses via `claude` CLI

**Browser mode:** Shows stub message:
```
"AI features are only available in the desktop app.
Run 'npm run dev' to test AI features in Tauri mode."
```

**Why:** Browser can't access local `claude`/`gemini` CLI tools.

**Testing Quick Actions in browser:**
- UI works (buttons clickable)
- Prompts sent to API
- Stub response returned
- No actual AI processing

---

## Implementation Details

### Prompt Definitions

```typescript
const quickActions = {
  improve: 'Improve clarity and flow',
  expand: 'Expand on this idea',
  summarize: 'Summarize in 2-3 sentences',
  explain: 'Explain this simply',
  research: 'What does research say about this?'
}
```

### Context Builder

```typescript
const buildContext = (noteContext: NoteContext) => {
  return `
Title: ${noteContext.title}
Content: ${noteContext.content}
  `.trim()
}
```

### Click Handler

```typescript
const handleQuickAction = async (actionId: string) => {
  const prompt = quickActions[actionId]
  const context = buildContext(noteContext)

  setIsLoading(true)
  const response = await api.runClaude(prompt, context)
  setMessages([...messages, userMsg, assistantMsg])
  setIsLoading(false)
}
```

### Persistence

**Messages saved to database:**
- User message: `quickActions[actionId]`
- AI response: From `api.runClaude()`
- Session: Same as regular chat

**History:** Quick Action messages appear in chat history like typed messages.

---

## Accessibility

### Screen Readers

```html
<button
  aria-label="Improve - Improve clarity and flow"
  title="Improve clarity and flow"
>
  <span aria-hidden="true">✨</span>
  Improve
</button>
```

**Announced as:** "Improve - Improve clarity and flow, button"

### Focus Management

- Tab through Quick Actions left-to-right
- Enter/Space activates
- Focus returns to chat input after response

### High Contrast

Emoji buttons maintain visibility in high contrast modes (OS-level rendering).

---

## Testing

### E2E Tests

```bash
npm run test:e2e specs/claude-features

# CF-01 to CF-09: Quick Actions tests
# - All 5 buttons visible
# - Clicking sends correct prompt
# - AI response appears
# - Input clears after action
```

### Unit Tests

```bash
npm test ClaudeChatPanel.quickactions

# 22 tests covering:
# - Rendering with/without note context
# - All 5 button interactions
# - Context building
# - Loading states
# - Accessibility
```

---

## Customization

### Adding New Quick Actions

```typescript
// 1. Add to prompt map
const quickActions = {
  improve: 'Improve clarity and flow',
  expand: 'Expand on this idea',
  summarize: 'Summarize in 2-3 sentences',
  explain: 'Explain this simply',
  research: 'What does research say about this?',
  critique: 'Provide constructive criticism'  // NEW
}

// 2. Add button to UI
const actions = [
  { id: 'improve', label: 'Improve', icon: '✨' },
  { id: 'expand', label: 'Expand', icon: '📝' },
  { id: 'summarize', label: 'Summarize', icon: '📋' },
  { id: 'explain', label: 'Explain', icon: '💡' },
  { id: 'research', label: 'Research', icon: '🔍' },
  { id: 'critique', label: 'Critique', icon: '🎯' }  // NEW
]
```

**Note:** Stick to 5-6 actions max (ADHD-friendly = less choice paralysis).

---

## Common Workflows

### Academic Writing

```
1. Write rough outline
2. Click Expand (flesh out each section)
3. Click Improve (polish prose)
4. Click Research (add citations)
5. Click Summarize (create abstract)
```

### Blog Posts

```
1. Brain dump ideas
2. Click Improve (fix structure)
3. Click Explain (simplify jargon)
4. Click Summarize (create intro hook)
```

### Meeting Notes

```
1. Take bullet point notes during meeting
2. Click Expand (add context)
3. Click Summarize (create email summary)
```

---

## See Also

- [Chat Persistence Guide](../guide/chat-persistence.md) - How sessions work
- [Keyboard Shortcuts](../guide/shortcuts.md) - Full keyboard reference
- [Features Overview](../guide/features.md) - All Scribe features
- [Architecture](../ARCHITECTURE.md) - Technical architecture
