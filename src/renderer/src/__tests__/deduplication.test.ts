/**
 * Request Deduplication Tests
 * Phase 4 Task 15: Request deduplication utility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  requestDeduplicator,
  deduplicate,
  createDeduplicated,
  TimeBasedDeduplicator,
  createTimeDeduplicated
} from '../utils/deduplication'

describe('RequestDeduplicator', () => {
  beforeEach(() => {
    requestDeduplicator.clearAll()
  })

  describe('Basic Deduplication', () => {
    it('executes function once for concurrent requests', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')

      const [result1, result2, result3] = await Promise.all([
        requestDeduplicator.dedupe('test', mockFn),
        requestDeduplicator.dedupe('test', mockFn),
        requestDeduplicator.dedupe('test', mockFn)
      ])

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(result1).toBe('result')
      expect(result2).toBe('result')
      expect(result3).toBe('result')
    })

    it('executes function separately for different keys', async () => {
      const mockFn1 = vi.fn().mockResolvedValue('result1')
      const mockFn2 = vi.fn().mockResolvedValue('result2')

      const [result1, result2] = await Promise.all([
        requestDeduplicator.dedupe('key1', mockFn1),
        requestDeduplicator.dedupe('key2', mockFn2)
      ])

      expect(mockFn1).toHaveBeenCalledTimes(1)
      expect(mockFn2).toHaveBeenCalledTimes(1)
      expect(result1).toBe('result1')
      expect(result2).toBe('result2')
    })

    it('allows sequential requests with same key', async () => {
      const mockFn = vi.fn()
        .mockResolvedValueOnce('result1')
        .mockResolvedValueOnce('result2')

      const result1 = await requestDeduplicator.dedupe('test', mockFn)
      const result2 = await requestDeduplicator.dedupe('test', mockFn)

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(result1).toBe('result1')
      expect(result2).toBe('result2')
    })
  })

  describe('Error Handling', () => {
    it('propagates errors to all waiting requests', async () => {
      const error = new Error('Request failed')
      const mockFn = vi.fn().mockRejectedValue(error)

      const promises = [
        requestDeduplicator.dedupe('test', mockFn),
        requestDeduplicator.dedupe('test', mockFn),
        requestDeduplicator.dedupe('test', mockFn)
      ]

      for (const promise of promises) {
        await expect(promise).rejects.toThrow('Request failed')
      }

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('clears pending request after error', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('First call fails'))
        .mockResolvedValueOnce('Second call succeeds')

      await expect(requestDeduplicator.dedupe('test', mockFn)).rejects.toThrow()
      const result = await requestDeduplicator.dedupe('test', mockFn)

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(result).toBe('Second call succeeds')
    })
  })

  describe('Manual Management', () => {
    it('clears specific pending request', async () => {
      const mockFn = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('result'), 100)))

      const promise = requestDeduplicator.dedupe('test', mockFn)
      expect(requestDeduplicator.isPending('test')).toBe(true)

      requestDeduplicator.clear('test')
      expect(requestDeduplicator.isPending('test')).toBe(false)

      // Original promise still resolves
      await expect(promise).resolves.toBe('result')
    })

    it('clears all pending requests', async () => {
      const mockFn1 = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('result1'), 100)))
      const mockFn2 = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('result2'), 100)))

      requestDeduplicator.dedupe('test1', mockFn1)
      requestDeduplicator.dedupe('test2', mockFn2)

      expect(requestDeduplicator.getPendingCount()).toBe(2)

      requestDeduplicator.clearAll()

      expect(requestDeduplicator.getPendingCount()).toBe(0)
      expect(requestDeduplicator.isPending('test1')).toBe(false)
      expect(requestDeduplicator.isPending('test2')).toBe(false)
    })

    it('tracks pending count correctly', async () => {
      expect(requestDeduplicator.getPendingCount()).toBe(0)

      const mockFn = vi.fn(() => new Promise(resolve => setTimeout(() => resolve('result'), 50)))

      const promise1 = requestDeduplicator.dedupe('test1', mockFn)
      expect(requestDeduplicator.getPendingCount()).toBe(1)

      const promise2 = requestDeduplicator.dedupe('test2', mockFn)
      expect(requestDeduplicator.getPendingCount()).toBe(2)

      // Concurrent calls to same key don't increase count
      requestDeduplicator.dedupe('test1', mockFn)
      expect(requestDeduplicator.getPendingCount()).toBe(2)

      await Promise.all([promise1, promise2])
      expect(requestDeduplicator.getPendingCount()).toBe(0)
    })
  })
})

describe('deduplicate wrapper', () => {
  it('automatically deduplicates function calls', async () => {
    const mockFn = vi.fn(async (id: string) => `result-${id}`)
    const deduped = deduplicate(
      (id: string) => `key-${id}`,
      mockFn
    )

    const [result1, result2, result3] = await Promise.all([
      deduped('123'),
      deduped('123'),
      deduped('123')
    ])

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(result1).toBe('result-123')
    expect(result2).toBe('result-123')
    expect(result3).toBe('result-123')
  })

  it('handles multiple arguments', async () => {
    const mockFn = vi.fn(async (id: string, data: { value: number }) => ({
      id,
      doubled: data.value * 2
    }))

    const deduped = deduplicate(
      (id: string, data: { value: number }) => `${id}-${data.value}`,
      mockFn
    )

    const [result1, result2] = await Promise.all([
      deduped('test', { value: 5 }),
      deduped('test', { value: 5 })
    ])

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(result1).toEqual({ id: 'test', doubled: 10 })
    expect(result2).toEqual({ id: 'test', doubled: 10 })
  })

  it('deduplicates per unique key', async () => {
    const mockFn = vi.fn(async (id: string) => `result-${id}`)
    const deduped = deduplicate(
      (id: string) => `key-${id}`,
      mockFn
    )

    const [result1, result2] = await Promise.all([
      deduped('123'),
      deduped('456')
    ])

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(result1).toBe('result-123')
    expect(result2).toBe('result-456')
  })
})

describe('createDeduplicated', () => {
  it('creates deduplicated API functions', async () => {
    const mockApi = {
      getNote: vi.fn(async (id: string) => ({ id, title: `Note ${id}` }))
    }

    const getNote = createDeduplicated(
      mockApi.getNote,
      (id) => `note-${id}`
    )

    const [note1, note2] = await Promise.all([
      getNote('123'),
      getNote('123')
    ])

    expect(mockApi.getNote).toHaveBeenCalledTimes(1)
    expect(note1).toEqual({ id: '123', title: 'Note 123' })
    expect(note2).toEqual({ id: '123', title: 'Note 123' })
  })

  it('works with complex arguments', async () => {
    interface UpdateData {
      title: string
      content: string
    }

    const mockApi = {
      updateNote: vi.fn(async (id: string, data: UpdateData) => ({
        id,
        ...data,
        updated: true
      }))
    }

    const updateNote = createDeduplicated(
      mockApi.updateNote,
      (id) => `update-${id}`
    )

    const data: UpdateData = { title: 'New Title', content: 'New Content' }

    const [result1, result2] = await Promise.all([
      updateNote('123', data),
      updateNote('123', data)
    ])

    expect(mockApi.updateNote).toHaveBeenCalledTimes(1)
    expect(result1).toEqual({ id: '123', title: 'New Title', content: 'New Content', updated: true })
    expect(result2).toEqual(result1)
  })
})

describe('TimeBasedDeduplicator', () => {
  it('caches results within time window', async () => {
    const deduplicator = new TimeBasedDeduplicator<string>(1000)
    const mockFn = vi.fn().mockResolvedValue('result')

    const result1 = await deduplicator.dedupe('test', mockFn)
    const result2 = await deduplicator.dedupe('test', mockFn)

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(result1).toBe('result')
    expect(result2).toBe('result')
  })

  it('executes new request after time window expires', async () => {
    vi.useFakeTimers()

    const deduplicator = new TimeBasedDeduplicator<string>(1000)
    const mockFn = vi.fn()
      .mockResolvedValueOnce('result1')
      .mockResolvedValueOnce('result2')

    const result1 = await deduplicator.dedupe('test', mockFn)
    expect(result1).toBe('result1')

    // Advance time beyond window
    vi.advanceTimersByTime(1100)

    const result2 = await deduplicator.dedupe('test', mockFn)
    expect(result2).toBe('result2')

    expect(mockFn).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })

  it('maintains separate caches for different keys', async () => {
    const deduplicator = new TimeBasedDeduplicator<string>(1000)
    const mockFn1 = vi.fn().mockResolvedValue('result1')
    const mockFn2 = vi.fn().mockResolvedValue('result2')

    const result1 = await deduplicator.dedupe('key1', mockFn1)
    const result2 = await deduplicator.dedupe('key2', mockFn2)

    expect(mockFn1).toHaveBeenCalledTimes(1)
    expect(mockFn2).toHaveBeenCalledTimes(1)
    expect(result1).toBe('result1')
    expect(result2).toBe('result2')
  })

  it('clears all cached results', async () => {
    const deduplicator = new TimeBasedDeduplicator<string>(1000)
    const mockFn = vi.fn()
      .mockResolvedValueOnce('result1')
      .mockResolvedValueOnce('result2')

    await deduplicator.dedupe('test', mockFn)
    deduplicator.clear()

    // Should execute new request after clear
    const result = await deduplicator.dedupe('test', mockFn)

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(result).toBe('result2')
  })
})

describe('createTimeDeduplicated', () => {
  it('creates time-deduplicated functions', async () => {
    const mockFn = vi.fn(async (id: string) => `result-${id}`)
    const deduped = createTimeDeduplicated(
      mockFn,
      (id) => id,
      1000
    )

    const result1 = await deduped('123')
    const result2 = await deduped('123')

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(result1).toBe('result-123')
    expect(result2).toBe('result-123')
  })

  it('refreshes cache after window expires', async () => {
    vi.useFakeTimers()

    const mockFn = vi.fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')

    const deduped = createTimeDeduplicated(
      (id: string) => mockFn(),
      (id) => id,
      500
    )

    const result1 = await deduped('test')
    expect(result1).toBe('first')

    vi.advanceTimersByTime(600)

    const result2 = await deduped('test')
    expect(result2).toBe('second')

    expect(mockFn).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })
})

describe('Real-world scenarios', () => {
  it('deduplicates rapid button clicks', async () => {
    const mockSaveNote = vi.fn(async (id: string, content: string) => ({
      id,
      content,
      saved: true
    }))

    const saveNote = deduplicate(
      (id: string) => `save-${id}`,
      mockSaveNote
    )

    // Simulate rapid button clicks
    const clicks = Array.from({ length: 10 }, () => saveNote('note-123', 'content'))
    const results = await Promise.all(clicks)

    // Only one actual save
    expect(mockSaveNote).toHaveBeenCalledTimes(1)
    // All clicks get the same result
    results.forEach(result => {
      expect(result).toEqual({ id: 'note-123', content: 'content', saved: true })
    })
  })

  it('deduplicates search queries', async () => {
    const mockSearch = vi.fn(async (query: string) => [
      { id: '1', match: query },
      { id: '2', match: query }
    ])

    const search = createTimeDeduplicated(
      mockSearch,
      (query) => query,
      300 // 300ms cache
    )

    // User types quickly
    await search('test')
    await search('test')
    await search('test')

    expect(mockSearch).toHaveBeenCalledTimes(1)
  })

  it('deduplicates autocomplete requests', async () => {
    const mockAutocomplete = vi.fn(async (input: string) => [
      `${input}1`,
      `${input}2`,
      `${input}3`
    ])

    const autocomplete = createTimeDeduplicated(
      mockAutocomplete,
      (input) => input,
      200
    )

    // Sequential calls within time window get cached result
    const result1 = await autocomplete('test')
    const result2 = await autocomplete('test')
    const result3 = await autocomplete('test')

    expect(mockAutocomplete).toHaveBeenCalledTimes(1)
    expect(result1).toEqual(['test1', 'test2', 'test3'])
    expect(result2).toEqual(result1)
    expect(result3).toEqual(result1)
  })
})
