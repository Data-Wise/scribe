# Editor Alternatives Research

> **Generated:** 2024-12-25
> **Context:** Scribe - ADHD-friendly distraction-free writer
> **Current:** BlockNote (built on TipTap/ProseMirror)

## The Problem with BlockNote

BlockNote is an abstraction on top of TipTap, which is itself an abstraction on top of ProseMirror. This means:

- 3 layers of abstraction = harder to customize deeply
- Opinionated Notion-style UI that may not fit minimalist needs
- Some features (DOCX/PDF export) require paid subscription
- Block-based paradigm adds friction for pure writing flow

---

## Options Compared

| Editor | Foundation | Setup | Customization | ADHD-Friendly |
|--------|------------|-------|---------------|---------------|
| **Lexical** | Standalone (Meta) | Medium | Maximum | Best |
| **TipTap (headless)** | ProseMirror | Medium | High | Good |
| **Novel** | TipTap | Easy | Medium | Good |
| **Minimal TipTap** | TipTap | Easy | Medium | Very Good |
| **Yoopta** | Custom | Medium | High | Good |
| **Plain Textarea** | Native | Trivial | Limited | Perfect |

---

## Option A: Lexical (Recommended)

**Effort:** Medium | **Risk:** Low | **ADHD Score:** 9/10

### Why Lexical?

- **Minimal core** — Only add what you need
- **Meta-backed** — Powers Facebook, Instagram (battle-tested)
- **Performance** — Optimized for speed
- **Accessibility** — Built-in WCAG compliance
- **TypeScript** — First-class support
- **No abstraction layers** — Direct control

### Pros

- Start with plain text, add features incrementally
- Immutable state model (undo/redo built-in)
- Plugin architecture = add only what matters
- No opinionated UI to fight against
- React bindings official (`@lexical/react`)

### Cons

- More initial setup than BlockNote
- Documentation could be better
- Collaborative editing needs more work

### Sample Setup

```typescript
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';

function Editor() {
  return (
    <LexicalComposer initialConfig={config}>
      <PlainTextPlugin
        contentEditable={<ContentEditable className="editor-input" />}
        placeholder={<div className="placeholder">Start writing...</div>}
      />
      <HistoryPlugin />
    </LexicalComposer>
  );
}
```

### Migration Path

1. Install: `npm install lexical @lexical/react`
2. Create minimal editor component
3. Add plugins incrementally: markdown, wiki-links, tags
4. Port existing features one at a time

---

## Option B: TipTap (Headless)

**Effort:** Medium | **Risk:** Low | **ADHD Score:** 8/10

### Why TipTap Headless?

You already have TipTap experience from Sprint 3. Going headless means:

- Keep the familiar API
- Remove Notion-style UI
- Build exactly the UI you want
- Use their [Minimal Template](https://minimal-tiptap.aslamh.dev/)

### Pros

- Familiar from previous work
- Extensive extension library (100+)
- Strong collaboration support
- Good mobile/Android support (ProseMirror battle-tested)

### Cons

- Still ProseMirror under the hood (complex)
- Extension ecosystem can be overwhelming
- Some advanced extensions are paid

### Migration Path

1. Remove BlockNote, keep TipTap core
2. Use `@tiptap/starter-kit` minimal setup
3. Build custom minimal toolbar (or none)
4. Port wiki-links/tags as TipTap extensions

---

## Option C: Novel

**Effort:** Low | **Risk:** Low | **ADHD Score:** 7/10

### Why Novel?

- **AI-powered** — Autocomplete suggestions (optional)
- **Beautiful defaults** — Polished out of the box
- **Minimal setup** — Works immediately
- **Tailwind-styled** — Matches your stack

### Pros

- Fastest to implement
- Looks great immediately
- AI features could help ADHD writing flow
- Built on TipTap (familiar)

### Cons

- Less customizable than raw TipTap
- AI features may be distracting (can disable)
- Notion-style (similar to BlockNote)

### Migration Path

1. `npm install novel`
2. Replace BlockNote with Novel component
3. Customize theme to be more minimal

---

## Option D: Plain Textarea + Markdown

**Effort:** Low | **Risk:** None | **ADHD Score:** 10/10

### Why Plain?

Ultimate distraction-free. Just text. Period.

### Pros

- Zero dependencies
- Instant startup
- No learning curve
- Maximum focus

### Cons

- No rich formatting
- No wiki-links inline preview
- Must handle markdown yourself

### Implementation

```typescript
function Editor({ value, onChange }) {
  return (
    <textarea
      className="w-full h-full bg-transparent resize-none focus:outline-none font-mono"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start writing..."
    />
  );
}
```

---

## Option E: Hybrid Approach

**Effort:** Medium | **Risk:** Low | **ADHD Score:** 9/10

### Concept

- **Writing mode:** Plain textarea (zero distractions)
- **Review mode:** Rendered markdown with rich preview
- **Toggle:** Single keypress to switch (e.g., `Cmd+E`)

### Why Hybrid?

- Write in plain text (maximum focus)
- Preview when needed (see formatting)
- Best of both worlds

---

## Recommendation

### For Maximum ADHD-Friendliness

**Option A: Lexical** or **Option E: Hybrid**

Both prioritize:
- Minimal interface
- Fast startup
- Add features only when needed
- User controls the experience

### Decision Matrix

| Priority | Best Choice |
|----------|-------------|
| Fastest to implement | Novel or Minimal TipTap |
| Maximum customization | Lexical |
| Zero distractions | Plain Textarea + Hybrid |
| Keep current work | TipTap Headless |
| AI assistance | Novel |

---

## Next Steps

1. **Try Lexical** — Spike a minimal editor (2-3 hours)
2. **Compare UX** — Side-by-side with current BlockNote
3. **Decide** — Based on actual typing feel
4. **Migrate** — Sprint 9 or new sprint

---

## Sources

- [Liveblocks: Which RTE Framework in 2025?](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)
- [TipTap: BlockNote vs TipTap](https://tiptap.dev/alternatives/blocknote-vs-tiptap)
- [Lexical Official Docs](https://lexical.dev/docs/getting-started/react)
- [Novel Editor (GitHub)](https://github.com/steven-tey/novel)
- [Minimal TipTap](https://minimal-tiptap.aslamh.dev/)
- [Yoopta Editor](https://github.com/yoopta-editor/Yoopta-Editor)
- [LogRocket: Build with Lexical](https://blog.logrocket.com/build-rich-text-editor-lexical-react/)
