# Property Type Fix - List Values Must Be Arrays

**Date:** 2026-01-06
**Issue:** `Failed to create note: Tauri command 'create_note' failed: Property 'status' should be an array, got: String("draft")`
**Status:** ✅ FIXED

---

## Root Cause

**Rust validation** (`database.rs:809`) enforces that properties with type `List` or `Tags` must have **array values**:

```rust
(PropertyType::List | PropertyType::Tags, v) if !v.is_array() => {
    return Err(format!("Property '{}' should be an array, got: {:?}", key, v));
}
```

**TypeScript code** was incorrectly creating list properties with **string values** instead of arrays:

```typescript
// WRONG (before fix)
status: { key: 'status', value: 'draft', type: 'list' }

// CORRECT (after fix)
status: { key: 'status', value: ['draft'], type: 'list' }
```

---

## Files Changed

### 1. `/src/renderer/src/types/index.ts`

**Changed:**
```typescript
export const DEFAULT_NOTE_PROPERTIES: Record<string, Property> = {
  status: { key: 'status', value: ['draft'], type: 'list' },  // ✅ Array
  tags: { key: 'tags', value: [], type: 'tags' },
  // ... other properties
}
```

### 2. `/src/renderer/src/App.tsx`

**Changed two locations:**

**a) `handleCreateNote` (line 434-435)**
```typescript
const defaultProperties: Record<string, Property> = {
  status: { key: 'status', value: ['draft'], type: 'list' },  // ✅ Array
  type: { key: 'type', value: ['note'], type: 'list' },      // ✅ Array
}
```

**b) `handleQuickCapture` (line 1048-1049)**
```typescript
const defaultProperties: Record<string, Property> = {
  status: { key: 'status', value: ['draft'], type: 'list' },  // ✅ Array
  type: { key: 'type', value: ['note'], type: 'list' },      // ✅ Array
}
```

### 3. `/src/renderer/src/components/PropertiesPanel.tsx`

**Changed list property handling:**

```typescript
case 'list':
  const options = LIST_OPTIONS[prop.key]
  // ✅ Extract first element from array for display
  const listValue = Array.isArray(prop.value) ? (prop.value[0] || '') : String(prop.value)

  if (options) {
    return (
      <select
        value={listValue}
        onChange={(e) => handleValueChange(prop.key, [e.target.value])}  // ✅ Wrap in array
        // ...
      />
    )
  }
  // Fallback text input also wraps in array
  return (
    <input
      type="text"
      value={listValue}
      onChange={(e) => handleValueChange(prop.key, [e.target.value])}  // ✅ Wrap in array
      // ...
    />
  )
```

### 4. Test Files Updated

**`__tests__/Components.test.tsx`:**
```typescript
const properties = {
  status: { key: 'status', value: ['draft'], type: 'list' as const },      // ✅ Array
  priority: { key: 'priority', value: ['high'], type: 'list' as const },   // ✅ Array
}
```

**`__tests__/ExportDialog.test.tsx`:**
```typescript
noteProperties: {
  status: { key: 'status', value: ['draft'], type: 'list' as const },      // ✅ Array
  priority: { key: 'priority', value: ['high'], type: 'list' as const },   // ✅ Array
}

// Test expectation updated for YAML array format
expect(content).toContain('status:')
expect(content).toContain('- "draft"')  // YAML array notation
```

---

## Test Results

✅ **All 1942 tests passing**

```
Test Files  56 passed (56)
Tests       1942 passed | 3 skipped | 13 todo (1958)
Duration    7.05s
```

---

## Verification

✅ **Tauri app tested** - New note created successfully without errors
✅ **Properties display correctly** in PropertiesPanel
✅ **YAML export** correctly formats list properties as arrays

---

## Technical Details

### Type Consistency Rules

| Property Type | TypeScript Value | Rust Validation | YAML Export |
|--------------|------------------|-----------------|-------------|
| **List** | `['value']` array | Must be array | `key:\n  - "value"` |
| **Tags** | `['tag1', 'tag2']` array | Must be array | `key:\n  - "tag1"\n  - "tag2"` |
| **Text** | `"value"` string | Must be string | `key: "value"` |
| **Number** | `123` number | Must be number | `key: 123` |
| **Checkbox** | `true` boolean | Must be boolean | `key: true` |
| **Date** | `"2026-01-06"` string | Must be string | `key: "2026-01-06"` |

### Why Arrays for List Types?

1. **Consistency with YAML spec** - List properties should map to YAML arrays
2. **Future extensibility** - Allows multi-select lists in the future
3. **Rust type safety** - Enforces proper serialization/deserialization
4. **UI flexibility** - Select dropdowns can extract `value[0]` for display

---

## Commit

```bash
git commit -m "fix: List type properties must be arrays, not strings

- Fix TypeScript DEFAULT_NOTE_PROPERTIES to use arrays for list values
- Fix App.tsx note creation to use arrays for status and type
- Fix PropertiesPanel to handle list values as arrays
- Update tests to expect array values in YAML frontmatter
- Resolves: Property 'status' should be an array error

Rust validation expects List/Tags types to have array values, not strings.
TypeScript was incorrectly using string values like 'draft' instead of ['draft'].

Tests: All 1942 passing"
```

Commit: `141eff0`

---

## Lessons Learned

1. **Always validate type consistency** between frontend and backend
2. **Rust's type safety** caught this bug early through validation
3. **Test coverage** helped identify all affected code paths
4. **YAML serialization** requires proper data structures (arrays for sequences)

---

**Issue:** ✅ Resolved
**Tests:** ✅ 1942 passing
**Verified:** ✅ Tauri app working
