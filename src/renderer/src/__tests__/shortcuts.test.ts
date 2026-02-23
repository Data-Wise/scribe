import { describe, it, expect } from 'vitest'
import { SHORTCUTS, matchesShortcut } from '../lib/shortcuts'

/** Helper to create a minimal KeyboardEvent-like object for testing */
function makeKeyEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: '',
    code: '',
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  } as KeyboardEvent
}

describe('SHORTCUTS registry', () => {
  const entries = Object.entries(SHORTCUTS)

  it('all entries have non-empty key, mod, and label', () => {
    for (const [id, shortcut] of entries) {
      expect(shortcut.key, `${id}.key should be non-empty`).toBeTruthy()
      expect(shortcut.mod, `${id}.mod should be non-empty`).toBeTruthy()
      expect(shortcut.label, `${id}.label should be non-empty`).toBeTruthy()
    }
  })

  it('all labels start with the command symbol', () => {
    for (const [id, shortcut] of entries) {
      expect(
        shortcut.label.startsWith('\u2318'),
        `${id}.label ("${shortcut.label}") should start with \u2318`
      ).toBe(true)
    }
  })

  it('has no duplicate labels', () => {
    const labels = entries.map(([, s]) => s.label)
    const duplicates = labels.filter((l, i) => labels.indexOf(l) !== i)
    expect(
      duplicates,
      `Duplicate labels found: ${duplicates.join(', ')}`
    ).toHaveLength(0)
  })
})

describe('matchesShortcut', () => {
  it('matches cmd-only shortcuts (e.g. newNote = ⌘N)', () => {
    const event = makeKeyEvent({ key: 'n', metaKey: true })
    expect(matchesShortcut(event, 'newNote')).toBe(true)
  })

  it('matches cmd-only shortcuts with ctrlKey (cross-platform)', () => {
    const event = makeKeyEvent({ key: 'n', ctrlKey: true })
    expect(matchesShortcut(event, 'newNote')).toBe(true)
  })

  it('matches cmd+shift shortcuts (e.g. focusMode = ⌘⇧F)', () => {
    const event = makeKeyEvent({ key: 'F', metaKey: true, shiftKey: true })
    expect(matchesShortcut(event, 'focusMode')).toBe(true)
  })

  it('matches cmd+alt shortcuts (e.g. terminal = ⌘⌥T)', () => {
    const event = makeKeyEvent({ key: 't', metaKey: true, altKey: true })
    expect(matchesShortcut(event, 'terminal')).toBe(true)
  })

  it('returns false when key does not match', () => {
    const event = makeKeyEvent({ key: 'x', metaKey: true })
    expect(matchesShortcut(event, 'newNote')).toBe(false)
  })

  it('returns false when required cmd modifier is missing', () => {
    const event = makeKeyEvent({ key: 'n' })
    expect(matchesShortcut(event, 'newNote')).toBe(false)
  })

  it('returns false when extra shift modifier is present but not expected', () => {
    // newNote is cmd-only, so shift should cause a mismatch
    const event = makeKeyEvent({ key: 'n', metaKey: true, shiftKey: true })
    expect(matchesShortcut(event, 'newNote')).toBe(false)
  })

  it('returns false when extra alt modifier is present but not expected', () => {
    const event = makeKeyEvent({ key: 'F', metaKey: true, shiftKey: true, altKey: true })
    expect(matchesShortcut(event, 'focusMode')).toBe(false)
  })

  it('returns false when required shift is missing for cmd+shift shortcut', () => {
    const event = makeKeyEvent({ key: 'F', metaKey: true })
    expect(matchesShortcut(event, 'focusMode')).toBe(false)
  })

  it('returns false when required alt is missing for cmd+alt shortcut', () => {
    const event = makeKeyEvent({ key: 't', metaKey: true })
    expect(matchesShortcut(event, 'terminal')).toBe(false)
  })
})
