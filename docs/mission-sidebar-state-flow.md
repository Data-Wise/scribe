# Mission Sidebar: State Flow Diagrams

**Companion to:** `ARCHITECTURE-mission-sidebar.md`

---

## 1. State Management Architecture

```mermaid
graph TB
    subgraph "Persistence Layer"
        LS[localStorage<br/>scribe:missionSidebar]
    end

    subgraph "Zustand Store"
        Store[useMissionSidebarStore]
        Store -->|Contains| Mode[mode: icon/compact/card]
        Store -->|Contains| Width[width: number]
        Store -->|Contains| Vaults[pinnedVaults: Array]
        Store -->|Contains| UI[uiState: Object]
    end

    subgraph "UI State"
        UI -->|Contains| Expanded[expandedProjects: Set<string>]
        UI -->|Contains| Scroll[scrollPosition: number]
        UI -->|Contains| Active[lastActiveSection: string]
    end

    subgraph "React Components"
        Sidebar[MissionSidebar]
        Sidebar -->|Reads| Store
        Sidebar -->|Renders| IconMode[IconBarMode]
        Sidebar -->|Renders| CompactMode[CompactListMode]
        Sidebar -->|Renders| CardMode[CardViewMode]
    end

    subgraph "User Actions"
        Click1[User clicks expand]
        Click2[User drags resize handle]
        Click3[User pins vault]
        Click4[User expands project]
    end

    Click1 -->|setMode| Store
    Click2 -->|setWidth| Store
    Click3 -->|addPinnedVault| Store
    Click4 -->|toggleProjectExpansion| Store

    Store -->|Persists| LS
    LS -->|Restores on load| Store

    style Store fill:#4CAF50,stroke:#2E7D32,color:#fff
    style LS fill:#FF9800,stroke:#F57C00,color:#fff
    style Sidebar fill:#2196F3,stroke:#1976D2,color:#fff
```

---

## 2. Component Hierarchy

```mermaid
graph TB
    subgraph "MissionSidebar Container"
        MS[MissionSidebar.tsx]
    end

    MS -->|mode=icon| Icon[IconBarMode]
    MS -->|mode=compact| Compact[CompactListMode]
    MS -->|mode=card| Card[CardViewMode]
    MS -->|Always| Resize[ResizeHandle]

    subgraph "IconBarMode (48px)"
        Icon --> IB1[Expand Button]
        Icon --> IB2[VaultIconList]
        Icon --> IB3[ActivityBar]
        IB2 --> II1[VaultIcon × 5]
        IB3 --> IA1[SearchButton]
        IB3 --> IA2[DailyButton]
        IB3 --> IA3[SettingsButton]
    end

    subgraph "CompactListMode (240px)"
        Compact --> CB1[SidebarHeader]
        Compact --> CB2[SearchInput]
        Compact --> CB3[PinnedVaultsList]
        Compact --> CB4[ActivityBar]
        CB3 --> CI1[CompactVaultItem × 5]
        CI1 --> CN1[VaultHeader]
        CI1 --> CN2[ProjectContextCard]
        CI1 --> CN3[NotesList max 5]
    end

    subgraph "CardViewMode (380px)"
        Card --> KA1[SidebarHeader]
        Card --> KA2[SearchInput]
        Card --> KA3[PinnedVaultsList]
        Card --> KA4[ActivityBar]
        KA3 --> KI1[CardVaultItem × 5]
        KI1 --> KC1[VaultCard]
        KI1 --> KC2[StatsRow]
        KI1 --> KC3[RecentNotesList]
    end

    style MS fill:#E91E63,stroke:#C2185B,color:#fff
    style Icon fill:#9C27B0,stroke:#7B1FA2,color:#fff
    style Compact fill:#3F51B5,stroke:#303F9F,color:#fff
    style Card fill:#00BCD4,stroke:#0097A7,color:#fff
```

---

## 3. Mode Transition Flow

```mermaid
sequenceDiagram
    participant User
    participant MissionSidebar
    participant Store as useMissionSidebarStore
    participant IconMode as IconBarMode
    participant CompactMode as CompactListMode
    participant LocalStorage

    Note over User,LocalStorage: User clicks Expand button (Icon → Compact)

    User->>MissionSidebar: Click expand button
    MissionSidebar->>Store: setMode('compact')
    Store->>Store: Update mode state
    Store->>LocalStorage: Persist { mode: 'compact', width: 240 }
    Store->>MissionSidebar: Re-render with mode='compact'

    Note over MissionSidebar: Unmount IconMode, Mount CompactMode

    MissionSidebar->>IconMode: Unmount (0ms)
    MissionSidebar->>CompactMode: Mount (0ms)

    Note over CompactMode: CSS transition starts

    CompactMode->>CompactMode: Width: 48px → 240px (0-100ms)
    CompactMode->>CompactMode: Opacity: 0 → 1 (0-100ms)

    Note over User,LocalStorage: Total duration: 100ms ✅

    CompactMode->>User: Show expanded sidebar
```

---

## 4. Data Flow Pattern

```mermaid
graph LR
    subgraph "Props Down (Parent → Child)"
        Parent[MissionSidebar]
        Parent -->|projects| Child1[CompactListMode]
        Parent -->|notes| Child1
        Parent -->|onSelectProject| Child1
        Parent -->|onSelectNote| Child1
    end

    subgraph "Callbacks Up (Child → Parent)"
        Child1 -->|User clicks project| CB1[onSelectProject projectId]
        CB1 --> Parent
        Parent -->|Invokes| Handler[Parent's handler]
        Handler -->|Updates| AppState[App State]
    end

    subgraph "Store Access (Direct)"
        Store[useMissionSidebarStore]
        Child1 -.Reads.-> Store
        Child1 -.Writes.-> Store
    end

    style Parent fill:#FF5722,stroke:#E64A19,color:#fff
    style Child1 fill:#8BC34A,stroke:#689F38,color:#fff
    style Store fill:#FFC107,stroke:#FFA000,color:#000
```

---

## 5. Pinned Vaults Management

```mermaid
stateDiagram-v2
    [*] --> DefaultState: App loads
    DefaultState: Inbox (permanent)

    DefaultState --> PinnedState: User pins 4 projects
    PinnedState: Inbox + 4 custom vaults

    PinnedState --> ReorderState: User drags vault
    ReorderState: Update vault.order

    PinnedState --> UnpinState: User unpins vault
    UnpinState: Remove vault (if not Inbox)

    UnpinState --> PinnedState: < 5 vaults
    ReorderState --> PinnedState: Order updated

    PinnedState --> MaxState: User tries to pin 6th
    MaxState: Error: Max 5 vaults
    MaxState --> PinnedState: User dismisses error

    state PinnedState {
        [*] --> Vault1: order: 0 (Inbox)
        Vault1 --> Vault2: order: 1
        Vault2 --> Vault3: order: 2
        Vault3 --> Vault4: order: 3
        Vault4 --> Vault5: order: 4
    }
```

---

## 6. Performance Optimization Strategy

```mermaid
graph TB
    subgraph "Expensive Operations"
        OP1[Filter/sort projects]
        OP2[Compute note counts]
        OP3[Calculate word counts]
        OP4[Render 100+ notes]
        OP5[Save scroll position]
    end

    subgraph "Optimizations"
        OP1 -->|useMemo| OPT1[Cache sorted list]
        OP2 -->|useMemo| OPT2[Cache counts map]
        OP3 -->|Lazy load| OPT3[Only for expanded]
        OP4 -->|Virtualization| OPT4[react-window]
        OP5 -->|Debounce 300ms| OPT5[Batch writes]
    end

    subgraph "Results"
        OPT1 --> R1[Avoid re-sort on every render]
        OPT2 --> R2[Avoid re-count on every render]
        OPT3 --> R3[Skip collapsed projects]
        OPT4 --> R4[Render only visible rows]
        OPT5 --> R5[Reduce localStorage writes]
    end

    R1 --> Goal[< 100ms mode switch ✅]
    R2 --> Goal
    R3 --> Goal
    R4 --> Goal
    R5 --> Goal

    style Goal fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 7. Migration Timeline

```mermaid
gantt
    title Mission Sidebar Migration (6 Phases)
    dateFormat  YYYY-MM-DD
    section Phase 1
    Create useMissionSidebarStore.ts        :p1, 2026-01-09, 1d
    section Phase 2
    Add Pinned Vaults UI                    :p2, after p1, 1d
    section Phase 3
    Persist Expanded State                  :p3, after p2, 1d
    section Phase 4
    Integrate Activity Bar                  :p4, after p3, 1d
    section Phase 5
    Add Settings Panel                      :p5, after p4, 1d
    section Phase 6
    Deprecate Old Store                     :p6, after p5, 1d
```

**Estimated Total:** 6 working days (can be split across sessions)

---

## 8. Testing Coverage Map

```mermaid
mindmap
  root((Testing))
    Unit Tests
      Zustand Store
        Mode cycling
        Width constraints
        Pinned vaults CRUD
        Expanded state
      Component Logic
        Filter projects
        Compute stats
        Handle clicks
    Component Tests
      MissionSidebar
        Renders correct mode
        Toggle expand/collapse
        Resize handle visibility
      IconBarMode
        Shows max 8 projects
        Activity Bar present
      CompactListMode
        Expand/collapse projects
        Note list rendering
      CardViewMode
        Rich cards display
        Stats accuracy
    E2E Tests
      User Workflows
        Mode cycling
        Pin/unpin vaults
        Drag to reorder
        Persist across reload
      Performance
        Mode switch < 100ms
        Handle 100 projects
        Scroll smoothness
```

---

## 9. Open Questions Decision Tree

```mermaid
flowchart TD
    Start[Architecture Complete]

    Start --> Q1{Inbox behavior?}
    Q1 -->|Show all notes| A1[Inbox always expanded]
    Q1 -->|Recent 5 only| A2[Inbox collapses like other vaults]

    A1 --> Q2{Activity Bar position?}
    A2 --> Q2

    Q2 -->|Bottom| B1[Integrated in modes]
    Q2 -->|Top| B2[Separate header component]

    B1 --> Q3{Max pinned vaults?}
    B2 --> Q3

    Q3 -->|Fixed 5| C1[Hard-coded limit]
    Q3 -->|Configurable 3-10| C2[Add to settings]

    C1 --> Q4{Default mode?}
    C2 --> Q4

    Q4 -->|Compact| D1[Balanced default]
    Q4 -->|Icon| D2[Minimalist default]

    D1 --> Q5{Search scope?}
    D2 --> Q5

    Q5 -->|Pinned only| E1[Fast, focused search]
    Q5 -->|All projects| E2[Comprehensive search]

    E1 --> End[Ready for Phase 1]
    E2 --> End

    style Start fill:#9C27B0,stroke:#7B1FA2,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

**Recommended Answers (for ADHD users):**
1. **Inbox:** Show recent 5 only (consistent behavior, less overwhelm)
2. **Activity Bar:** Bottom (VSCode-style, always accessible)
3. **Max vaults:** Fixed 5 (simplicity, prevent clutter)
4. **Default mode:** Compact (balanced, not too minimal)
5. **Search scope:** Pinned only (faster, focused)

**Rationale:** Maximize focus, minimize cognitive load, consistent patterns.
