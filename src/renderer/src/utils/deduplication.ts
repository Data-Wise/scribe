/**
 * Request Deduplication Utility
 * Phase 4 Task 15: Prevent duplicate concurrent requests
 *
 * Ensures that only one instance of a specific request runs at a time.
 * Subsequent calls with the same key wait for the in-flight request to complete.
 */

import { logger } from '../lib/logger'

type PendingRequest<T> = Promise<T>

/**
 * Request deduplication manager
 * Tracks in-flight requests and deduplicates concurrent calls
 */
class RequestDeduplicator {
  private pending: Map<string, PendingRequest<unknown>> = new Map()

  /**
   * Execute a request with deduplication
   *
   * If a request with the same key is already in-flight, returns that promise
   * instead of starting a new request.
   *
   * @param key - Unique identifier for this request
   * @param fn - Async function to execute
   * @returns Promise resolving to the request result
   *
   * @example
   * ```typescript
   * const deduplicator = new RequestDeduplicator()
   *
   * // First call starts the request
   * const result1 = await deduplicator.dedupe('note-123', () => api.getNote('123'))
   *
   * // Second call (concurrent) waits for the first request
   * const result2 = await deduplicator.dedupe('note-123', () => api.getNote('123'))
   *
   * // Both get the same result, but only one API call was made
   * ```
   */
  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Check if request is already in-flight
    const existing = this.pending.get(key)
    if (existing) {
      logger.debug('[Deduplicator] Request already in-flight, reusing', { key })
      return existing as Promise<T>
    }

    // Start new request
    logger.debug('[Deduplicator] Starting new request', { key })
    const promise = fn()
      .finally(() => {
        // Clean up after completion (success or error)
        this.pending.delete(key)
        logger.debug('[Deduplicator] Request completed, cleared', { key })
      })

    // Track in-flight request
    this.pending.set(key, promise)

    return promise
  }

  /**
   * Clear a specific pending request
   * Useful for invalidation or cancellation scenarios
   *
   * @param key - Request key to clear
   */
  clear(key: string): void {
    if (this.pending.has(key)) {
      this.pending.delete(key)
      logger.debug('[Deduplicator] Request manually cleared', { key })
    }
  }

  /**
   * Clear all pending requests
   * Useful for cleanup on navigation or component unmount
   */
  clearAll(): void {
    const count = this.pending.size
    this.pending.clear()
    logger.debug('[Deduplicator] All requests cleared', { count })
  }

  /**
   * Get count of pending requests
   */
  getPendingCount(): number {
    return this.pending.size
  }

  /**
   * Check if a specific request is pending
   */
  isPending(key: string): boolean {
    return this.pending.has(key)
  }
}

// Singleton instance for global deduplication
export const requestDeduplicator = new RequestDeduplicator()

/**
 * Decorator/wrapper function for automatic deduplication
 *
 * @param keyFn - Function to generate unique key from arguments
 * @param fn - Async function to deduplicate
 * @returns Wrapped function with automatic deduplication
 *
 * @example
 * ```typescript
 * const getNote = deduplicate(
 *   (id: string) => `note-${id}`,
 *   async (id: string) => await api.getNote(id)
 * )
 *
 * // Concurrent calls automatically deduplicated
 * const [result1, result2] = await Promise.all([
 *   getNote('123'),
 *   getNote('123')
 * ])
 * // Only one API call was made
 * ```
 */
export function deduplicate<Args extends unknown[], Result>(
  keyFn: (...args: Args) => string,
  fn: (...args: Args) => Promise<Result>
): (...args: Args) => Promise<Result> {
  const deduplicator = new RequestDeduplicator()

  return async (...args: Args): Promise<Result> => {
    const key = keyFn(...args)
    return deduplicator.dedupe(key, () => fn(...args))
  }
}

/**
 * Create a deduplicated version of an API function
 *
 * @param fn - Async function to deduplicate
 * @param getKey - Function to extract unique key from arguments
 * @returns Deduplicated version of the function
 *
 * @example
 * ```typescript
 * const api = {
 *   getNote: createDeduplicated(
 *     (id: string) => tauri.invoke('get_note', { id }),
 *     (id) => `note-${id}`
 *   ),
 *   updateNote: createDeduplicated(
 *     (id: string, updates: Partial<Note>) => tauri.invoke('update_note', { id, updates }),
 *     (id) => `update-note-${id}`
 *   )
 * }
 * ```
 */
export function createDeduplicated<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  getKey: (...args: Args) => string
): (...args: Args) => Promise<Result> {
  return deduplicate(getKey, fn)
}

/**
 * Time-based deduplication
 * Prevents the same request from running within a time window
 */
export class TimeBasedDeduplicator<T> {
  private lastResults: Map<string, { result: T; timestamp: number }> = new Map()
  private windowMs: number

  constructor(windowMs: number = 1000) {
    this.windowMs = windowMs
  }

  async dedupe(key: string, fn: () => Promise<T>): Promise<T> {
    const cached = this.lastResults.get(key)
    const now = Date.now()

    // Return cached result if within time window
    if (cached && (now - cached.timestamp) < this.windowMs) {
      logger.debug('[TimeDeduplicator] Using cached result', {
        key,
        age: now - cached.timestamp
      })
      return cached.result
    }

    // Execute new request
    const result = await fn()
    this.lastResults.set(key, { result, timestamp: now })

    // Cleanup old entries
    this.cleanup()

    return result
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, { timestamp }] of this.lastResults.entries()) {
      if (now - timestamp > this.windowMs * 2) {
        this.lastResults.delete(key)
      }
    }
  }

  clear(): void {
    this.lastResults.clear()
  }
}

/**
 * Create a time-deduplicated version of a function
 * Caches results for a specified time window
 *
 * @param fn - Function to deduplicate
 * @param getKey - Key extraction function
 * @param windowMs - Cache window in milliseconds (default: 1000ms)
 *
 * @example
 * ```typescript
 * const getNote = createTimeDeduplicated(
 *   (id: string) => api.getNote(id),
 *   (id) => id,
 *   5000 // 5 second cache
 * )
 *
 * // Calls within 5 seconds return cached result
 * const note1 = await getNote('123') // API call
 * const note2 = await getNote('123') // Cached (< 5s)
 * ```
 */
export function createTimeDeduplicated<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  getKey: (...args: Args) => string,
  windowMs: number = 1000
): (...args: Args) => Promise<Result> {
  const deduplicator = new TimeBasedDeduplicator<Result>(windowMs)

  return async (...args: Args): Promise<Result> => {
    const key = getKey(...args)
    return deduplicator.dedupe(key, () => fn(...args))
  }
}
