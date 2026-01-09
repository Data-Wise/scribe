# Quarto Examples for Testing

This directory contains real-world Quarto document examples for testing Scribe's autocomplete features.

## Files

### `quarto-apa-example.qmd`

**Source:** Research project (pmed)
**Size:** 18KB (434 lines)
**Description:** Complete APA-formatted academic paper using the `apaquarto` extension

**Features demonstrated:**
- Extensive YAML frontmatter (150+ lines)
  - Author metadata with ORCID, affiliations, roles
  - Author note with disclosures
  - Bibliography configuration
  - Multi-format output (HTML, DOCX, Typst, PDF)
- R code chunks with labels and options
  - `#| label: setup`
  - `#| label: fig-myplot`
  - `#| label: tbl-mytable`
  - Figure captions, notes, and dimensions
- Cross-references
  - Figures: `@fig-myplot`, `@fig-twocolumn`
  - Tables: `@tbl-mytable`, `@tbl-mymarkdowntable2`, `@tbl-chisq`
  - Equations: `@eq-euler`, `@eq-zscore`
  - Appendices: `@apx-a`, `@apx-b`
  - Section references: `#apx-a`, `#apx-b`
- Math equations with labels
  - Display mode: `$$ equation $$ {#eq-label}`
  - Inline mode: `$LaTeX$`
- Citations
  - Parenthetical: `[@CameronTrivedi2013]`
  - In-text: `@CameronTrivedi2013`
  - Possessive: `@author ['s]`
  - Masked: For peer review
- Complex chunk options
  - `apa-note`, `apa-twocolumn`
  - `fig-cap`, `fig-height`, `fig-width`
  - `tbl-cap`, `echo`, `include`

## Usage in Scribe

### Browser Mode (Already Available)

The **🧪 Quarto Autocomplete Test Page** is included in the seed data for new users:

```bash
npm run dev:vite
# Create new account or reset database
# Look for note titled "🧪 Quarto Autocomplete Test Page"
```

### Tauri Mode (Updated with This Commit)

The Quarto test page is now included in Tauri's seed data (migration 007):

```bash
npm run dev
# New users will see 5 demo notes including Quarto test page
# Or delete database and restart to re-seed
```

### Testing with Real-World Examples

1. **Copy content to Scribe:**
   - Create a new note in Scribe
   - Copy sections from `quarto-apa-example.qmd`
   - Test autocomplete in Source mode (⌘1)

2. **Test specific features:**
   - **YAML:** Copy frontmatter lines 1-153
   - **Chunk options:** Copy R chunks with `#|` options
   - **Cross-refs:** Copy sections with `@fig-`, `@tbl-`, `@eq-` references
   - **Math:** Copy equations from lines 217-231

## Testing Checklist

- [ ] YAML frontmatter autocomplete (40+ keys)
- [ ] Chunk option autocomplete (30+ options)
- [ ] Cross-reference autocomplete (fig, tbl, eq, sec, apx)
- [ ] Math equation rendering
- [ ] Citation autocomplete (if Zotero configured)
- [ ] Multi-line YAML values
- [ ] Nested YAML options (execute: echo: false)
- [ ] Boolean value completion (true/false)
- [ ] Numeric value suggestions (fig-width: 8)

## Additional Examples

More Quarto examples available in:
- `~/projects/research/product of three/drafts/quarto/*.qmd`
- `~/projects/research/collider/**/*.qmd`
- `~/projects/quarto/**/*.qmd`

## Seed Data Sync

**Note:** As of 2026-01-08, the Tauri (SQLite) and Browser (IndexedDB) seed data are now in sync:

**Both modes include:**
1. Welcome to Scribe
2. Features Overview
3. Daily Note Example
4. Callout Types ✅ (newly added to Tauri)
5. 🧪 Quarto Autocomplete Test Page ✅ (newly added to Tauri)

**See:** `src/renderer/src/lib/seed-data.ts` (source of truth)
**See:** `src-tauri/src/database.rs` migration 007 (now matches browser)
