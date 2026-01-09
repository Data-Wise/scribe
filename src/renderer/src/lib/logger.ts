/**
 * Logger Utility - Environment-aware logging
 *
 * Provides structured logging with automatic stripping in production builds.
 * Use this instead of console.log/debug to prevent performance impact
 * and information leakage in production.
 *
 * Features:
 * - Automatic dev/prod detection
 * - Type-safe log levels
 * - Structured formatting
 * - Performance timing
 * - Stack traces for errors
 *
 * Usage:
 * ```typescript
 * import { logger } from './lib/logger'
 *
 * logger.debug('Component mounted', { props })
 * logger.info('User action', { action: 'click', target: 'button' })
 * logger.warn('Deprecated API used', { api: 'oldMethod' })
 * logger.error('Failed to fetch', error)
 * ```
 */

const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

// Color codes for console output (dev only)
const colors = {
  debug: '#6B7280', // gray
  info: '#3B82F6',  // blue
  warn: '#F59E0B',  // orange
  error: '#EF4444', // red
  success: '#10B981', // green
}

/**
 * Format timestamp for log entries
 */
function timestamp(): string {
  const now = new Date()
  return now.toISOString().split('T')[1].split('.')[0] // HH:MM:SS
}

/**
 * Format log message with context
 */
function formatMessage(level: keyof typeof colors, message: string, data?: unknown): string {
  const time = timestamp()
  const prefix = `[${time}] [${level.toUpperCase()}]`

  if (data !== undefined) {
    return `${prefix} ${message}`
  }

  return `${prefix} ${message}`
}

/**
 * Logger API
 */
export const logger = {
  /**
   * Debug-level logging (verbose, development only)
   * Stripped in production builds
   */
  debug: (message: string, data?: unknown): void => {
    if (!isDev) return

    const formatted = formatMessage('debug', message, data)
    if (data !== undefined) {
      console.debug(`%c${formatted}`, `color: ${colors.debug}`, data)
    } else {
      console.debug(`%c${formatted}`, `color: ${colors.debug}`)
    }
  },

  /**
   * Info-level logging (important events, development only)
   * Stripped in production builds
   */
  info: (message: string, data?: unknown): void => {
    if (!isDev) return

    const formatted = formatMessage('info', message, data)
    if (data !== undefined) {
      console.info(`%c${formatted}`, `color: ${colors.info}`, data)
    } else {
      console.info(`%c${formatted}`, `color: ${colors.info}`)
    }
  },

  /**
   * Success-level logging (positive outcomes, development only)
   * Stripped in production builds
   */
  success: (message: string, data?: unknown): void => {
    if (!isDev) return

    const formatted = formatMessage('success', message, data)
    if (data !== undefined) {
      console.log(`%c${formatted}`, `color: ${colors.success}`, data)
    } else {
      console.log(`%c${formatted}`, `color: ${colors.success}`)
    }
  },

  /**
   * Warning-level logging (potential issues)
   * Always shown (dev + prod)
   */
  warn: (message: string, data?: unknown): void => {
    const formatted = formatMessage('warn', message, data)
    if (data !== undefined) {
      console.warn(formatted, data)
    } else {
      console.warn(formatted)
    }
  },

  /**
   * Error-level logging (errors and exceptions)
   * Always shown (dev + prod)
   */
  error: (message: string, error?: Error | unknown): void => {
    const formatted = formatMessage('error', message, error)

    if (error instanceof Error) {
      console.error(formatted, {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    } else if (error !== undefined) {
      console.error(formatted, error)
    } else {
      console.error(formatted)
    }
  },

  /**
   * Performance timing utility
   * Returns a function to end the timer
   */
  time: (label: string): (() => void) => {
    if (!isDev) return () => {} // No-op in production

    const start = performance.now()
    logger.debug(`⏱️  ${label} started`)

    return () => {
      const duration = performance.now() - start
      logger.debug(`⏱️  ${label} completed in ${duration.toFixed(2)}ms`)
    }
  },

  /**
   * Group related log messages
   */
  group: (label: string, fn: () => void): void => {
    if (!isDev) {
      fn()
      return
    }

    console.group(`%c${label}`, `color: ${colors.info}; font-weight: bold`)
    fn()
    console.groupEnd()
  },

  /**
   * Table logging for structured data
   */
  table: (data: unknown[]): void => {
    if (!isDev) return
    console.table(data)
  },
}

/**
 * Conditional logger - only logs when condition is true
 */
export function logIf(condition: boolean, level: keyof typeof logger, message: string, data?: unknown): void {
  if (!condition) return

  if (level === 'time') return // time() has different signature
  if (level === 'group') return // group() has different signature
  if (level === 'table') return // table() has different signature

  // Type-safe call to logger methods
  const logFn = logger[level] as (message: string, data?: unknown) => void
  logFn(message, data)
}

/**
 * Export a default instance
 */
export default logger
