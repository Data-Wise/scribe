# BRAINSTORM: Settings Enhancement - ADHD-Optimized UI

**Mode:** Feature | **Depth:** Deep | **Focus:** ADHD-Friendly Design
**Date:** 2025-12-31
**Duration:** 8 minutes

---

## Context

Scribe v1.7.0 added powerful new features (Chat History Persistence, Quick Actions, @ References) but users need better ways to discover and customize these settings. Research into Obsidian, Typora, and ADHD accessibility patterns revealed key opportunities for improvement.

**User Priorities:**
1. AI & Workflow settings (Quick Actions customization)
2. Projects & Organization (templates, presets)
3. Editor Experience (focus, fonts, spacing)
4. Visual Customization (themes, UI density)

**Pain Points:**
- New feature settings are hard to discover
- Need more granular control over Quick Actions
- Project setup is repetitive without templates
- Settings feel scattered and overwhelming

---

## ⚡ Quick Wins (< 30 min each)

### 1. Settings Search with Fuzzy Matching

**What:** ⌘, then start typing to find any setting instantly

**Why:** Reduces cognitive load of browsing nested menus (ADHD-friendly)

**How:**
- Add search box at top of settings modal
- Use `fuse.js` for fuzzy matching across:
  - Setting labels
  - Setting descriptions
  - Category names
- Show results with breadcrumb (e.g., "AI & Workflow > Quick Actions")
- Click result → jump to that settings tab & section

**Impact:** High - Makes 911 tests worth of features discoverable

---

### 2. "What's New" Badge System

**What:** Auto-highlight settings for features added in v1.7.0

**Why:** Users don't know new features exist

**How:**
- Add `addedInVersion` field to Setting model
- Show blue dot badge on Settings icon (count of new settings)
- Highlight relevant category tabs (e.g., "AI & Workflow (3)")
- Automatically remove badge after user views settings once

**Impact:** High - Drives adoption of new Quick Actions, @ References

---

### 3. Quick Actions Drag-to-Reorder

**What:** Visual drag-and-drop to reorder the 5 Quick Actions

**Why:** Users want different actions in different orders

**How:**
- Use `@dnd-kit/sortable` for drag functionality
- Show drag handle (⋮⋮) on left of each action
- Live preview of new order while dragging
- Persist order to settings store

**Impact:** Medium - Nice-to-have customization

---

### 4. Quick Actions Visibility Toggles

**What:** Checkboxes to show/hide individual Quick Actions

**Why:** Not all users need all 5 actions

**How:**
- Checkbox on left of each Quick Action in settings
- Hidden actions don't appear in sidebar or context menu
- Default: all 5 enabled

**Impact:** High - Reduces clutter for focused users

---

### 5. Project Template Picker

**What:** 5 preconfigured templates when creating new project

**Why:** Setup is repetitive, users want quick start

**How:**
- Add template selection to Create Project modal
- Templates:
  - **Research+:** Literature review daily notes, cite/summarize actions
  - **Teaching+:** Weekly templates, quiz/rubric actions
  - **Dev+:** Git integration, commit msg/docs actions
  - **Writing+:** Distraction-free, expand/improve actions
  - **Minimal:** Blank slate
- Apply template settings on project creation

**Impact:** High - Addresses biggest pain point (per user answer)

---

## 🔧 Medium Effort (1-2 hours each)

### 6. Hybrid Settings Architecture (Tabs + Search)

**What:** Obsidian-style tabbed settings with unified search

**Why:** Best of both worlds (browsing + quick access)

**Structure:**
```
[Settings Modal]
├── Header (Search box, Close)
├── Body
│   ├── Sidebar (Category tabs)
│   │   ├── Editor
│   │   ├── Themes
│   │   ├── AI & Workflow (badge: 3)
│   │   ├── Projects
│   │   └── Advanced
│   └── Content (Current category settings)
└── Footer (Reset, Export, Save)
```

**Impact:** High - Foundation for all other enhancements

---

### 7. Theme Gallery View

**What:** Visual grid of theme previews (3 columns)

**Why:** Browsing themes as list is slow and unengaging

**How:**
- Generate 200x150px preview images for each theme
- Group by: Favorites, Dark (5), Light (5)
- Hover → show preview overlay on actual editor
- Click → apply theme
- Star icon → add to favorites

**Inspiration:** Obsidian Community Themes browser

**Impact:** Medium - Improves theme discovery

---

### 8. Contextual Settings Hints

**What:** Inline gear icons that open relevant settings

**Why:** Discovery without disrupting flow

**Examples:**
- Gear icon next to Quick Actions → opens AI & Workflow settings
- Gear icon in Terminal panel → opens Terminal settings
- Gear icon in Properties panel → opens Editor settings

**How:**
- Add `<ContextualHint targetSetting="ai.quickActions" />` component
- Clicking opens settings modal to specific section
- Subtle, doesn't clutter UI

**Impact:** High - Contextual learning, ADHD-friendly

---

### 9. Quick Actions Pro Settings

**What:** Advanced customization panel for power users

**Features:**
- **Edit prompts:** Modify any of the 5 default prompts, add up to 5 custom (10 max)
- **Keyboard shortcuts:** Assign ⌘⌥1-9 to specific actions
- **Model selection:** Choose Claude vs Gemini per action
- **Reorder/disable:** Drag to reorder, checkbox to show/hide

**Why:** Addresses all 4 user-selected priorities for Quick Actions

**Impact:** Very High - Unlocks full customization potential

---

## 🏗️ Long-term (Future sprints)

### 10. Settings Profiles (Sprint 28)

**What:** Save/load entire settings configurations

**Presets:**
- "Deep Work" - Minimal UI, focus mode, no notifications
- "Teaching Mode" - Bright theme, large fonts, quiz actions
- "Research Sprint" - Citations enabled, academic theme, literature actions

**Why:** Quick context switching for different workflows

**Impact:** Medium - Power user feature

---

### 11. Per-Project AI Settings (Sprint 28)

**What:** Override Quick Actions per project type

**Examples:**
- Research projects → "Cite Sources" action
- Teaching projects → "Generate Quiz" action
- Dev projects → "Write Tests" action

**Why:** Different projects need different AI tools

**Impact:** Medium - Contextual AI assistance

---

### 12. Visual Settings Builder (Sprint 29)

**What:** Wizard-style onboarding for new users

**Flow:**
1. "Tell us about your workflow"
2. Role selection (Student/Researcher/Teacher/Developer/Writer)
3. Priority selection (Focus/Organization/AI/Collaboration)
4. Auto-apply tailored preset

**Why:** Reduces initial overwhelm for new users

**Impact:** High - Improved onboarding experience

---

### 13. User-Created Project Templates (Sprint 29)

**What:** Save current project as reusable template

**Features:**
- Custom folder structure
- Daily note templates
- Custom Quick Actions
- Theme overrides

**Storage:** JSON files in `~/.scribe/templates/` for easy sharing

**Impact:** Medium - Community templates ecosystem

---

## 🎯 Recommended Path

### Sprint 27 P2: Foundation + Quick Wins (4-6 hours)

**Phase 1: Foundation**
1. Create `SettingsStore` (Zustand)
2. Build `<SettingsModal>` shell with tab navigation
3. Migrate existing settings to new structure
4. Add settings search with fuzzy matching

**Phase 2: Quick Wins**
5. Implement "What's New" badge system
6. Build Quick Actions customization panel (drag-to-reorder)
7. Add Quick Actions visibility toggles
8. Create project template picker (5 presets)

**Why first:** Establishes infrastructure + delivers immediate value

---

### Sprint 28: Visual Polish (6-8 hours)

**Phase 3: Visual Enhancement**
9. Design & implement theme gallery view
10. Add contextual settings hints (gear icons)
11. Build Quick Actions Pro settings (prompts, shortcuts, models)

**Why second:** Builds on foundation, addresses ADHD visual organization

---

### Sprint 29+: Advanced Features (10-12 hours)

**Phase 4: Power User Features**
12. Settings profiles (export/import/presets)
13. Per-project AI settings
14. Visual settings builder wizard
15. User-created templates

**Why last:** Nice-to-haves that build on earlier work

---

## 📋 Open Questions

1. **Settings Precedence:** Global defaults → Project overrides → User overrides?
   - **Proposed:** Yes (cascade model, matches Obsidian)

2. **Theme Gallery Source:** Ship 10 built-in themes or support community themes from day 1?
   - **Proposed:** Start with 10 built-in, add import in v1.8.0

3. **Quick Actions Limit:** Cap at 10 custom actions or allow unlimited?
   - **Proposed:** 10 max for UI sanity (5 default + 5 custom)

4. **Keyboard Shortcuts Conflicts:** How to handle when user assigns shortcut already in use?
   - **Proposed:** Show warning + offer to reassign conflicting shortcut

5. **Project Templates Storage:** Store in JSON files or database?
   - **Proposed:** JSON files in `~/.scribe/templates/` for easy sharing

---

## 🔍 Research Sources

### Obsidian Patterns

- **Tabbed Settings:** Clear category separation (Editor, Appearance, Plugins, etc.)
- **Progressive Disclosure:** Advanced settings collapsed by default
- **Community Themes:** Gallery view with visual previews
- **Plugin Marketplace:** Searchable, filterable, installable with one click

**Key Insight:** Users need both browsing (tabs) and searching (fuzzy match)

Sources:
- [ADHD-friendly system - Obsidian Forum](https://forum.obsidian.md/t/adhd-friendly-system/12800)
- [ObsidianMD for ADHD Guide](https://www.mhmd.blog/2025/01/obsidianmd-for-adhd-and-real-world-use.html)
- [Obsidian Guide for Autistics & ADHDers](https://www.autisticasfxxk.com/blog/obsidian-guide/)

---

### ADHD Accessibility (2025 Research)

**Core Principles:**
1. **Reduce Cognitive Load:** Whitespace is clarity, not waste
2. **Visual Organization:** Color-coded, iconography, clear hierarchy
3. **Progressive Disclosure:** Show essentials first, advanced on demand
4. **Predictable Structure:** Clear navigation, users feel oriented
5. **Control Over Motion:** Respect `prefers-reduced-motion`

**Emerging Trends:**
- AI-adapted interfaces (simplified modes for ADHD)
- Machine learning for personalized dashboards
- Minimalist iconography + clean grids
- High-contrast modes for better accessibility

Sources:
- [UI/UX for ADHD - Din Studio](https://din-studio.com/ui-ux-for-adhd-designing-interfaces-that-actually-help-students/)
- [ADHD Accessibility — Building UIs](https://medium.com/@sterling.benjamin/adhd-friendly-ui-checklistadhd-accessibility-building-uis-that-work-for-everyone-including-me-61dbde186a42)

---

### Markdown Editor Patterns

**Typora:**
- **WYSIWYG + Markdown:** Live preview in single window
- **Minimal Settings:** Simple interface, no feature bloat
- **Keyboard Shortcuts:** Well-documented, discoverable

**Bear:**
- **Tag-Based Organization:** Flexible categorization
- **Theme Gallery:** Visual theme browser
- **Sync Settings:** Cloud-based preferences

**Notion:**
- **Block-Based:** Everything is a block (text, image, list, etc.)
- **Inline Settings:** Edit properties without leaving content
- **Template Gallery:** Pre-built pages for common use cases

**Common Pattern:** Live preview + minimal settings + visual organization

Sources:
- [Typora Markdown Reference](https://www.markdownguide.org/tools/typora/)
- [Typora vs Notion Comparison](https://www.slant.co/versus/2813/15790/~typora_vs_notion)

---

## 💡 Key Insights

### 1. Search-First is Critical for ADHD Users

Browsing nested menus creates decision fatigue. Fuzzy search eliminates this by letting users type what they want and go directly there.

**Implement:** ⌘F within settings, fuzzy match across all settings

---

### 2. Visual Previews Reduce Uncertainty

Text-based theme lists force users to imagine results. Gallery view with hover previews shows exactly what themes look like before applying.

**Implement:** 3-column grid, hover preview overlay on editor

---

### 3. Progressive Disclosure Manages Overwhelm

Showing all settings at once is paralyzing. Collapsible sections let users explore at their own pace.

**Implement:** Sections collapsed by default, expand on click

---

### 4. Contextual Hints Enable Discovery

Settings buried in menus are never found. Inline gear icons next to features bridge the gap between usage and configuration.

**Implement:** Gear icons in Quick Actions panel, Terminal, Properties panel

---

### 5. Templates Eliminate Decision Paralysis

Blank project creation requires dozens of micro-decisions. Templates provide sane defaults that users can tweak later.

**Implement:** 5 preconfigured templates (Research+, Teaching+, Dev+, Writing+, Minimal)

---

## 📊 Success Metrics

**Quantitative:**
- Settings search usage: Target 40% of settings interactions
- Quick Actions customization: Target 30% of users customize within first week
- Project template usage: Target 70% of new projects use templates
- "What's New" badge clicks: Target 60% of users discover new features

**Qualitative:**
- User feedback on settings discoverability (survey)
- Time to complete "Find X setting" task (user testing)
- Cognitive load rating (1-10 scale, target < 5)

---

## 🔗 Next Steps

1. **Review Spec:** `docs/specs/SPEC-settings-enhancement-2025-12-31.md`
2. **Create Issues:** Break down into GitHub issues for Sprint 27 P2
3. **Design Mockups:** High-fidelity designs for theme gallery, Quick Actions settings
4. **User Testing:** Test wireframes with 3+ ADHD users before implementation

---

**Brainstorm complete! Spec captured at:**
- `docs/specs/SPEC-settings-enhancement-2025-12-31.md`

**Related Commands:**
- `/spec:review settings-enhancement` - Review & approve spec
- `/craft:do "implement settings search"` - Start implementation
