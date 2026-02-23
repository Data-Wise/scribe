import { describe, it, expect } from 'vitest'
import { SHORTCUTS } from '../lib/shortcuts'

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
