import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTimeBasedGreeting } from '../components/MissionControl'

describe('getTimeBasedGreeting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Morning (5am-12pm)', () => {
    it('returns morning greeting at 5am', () => {
      vi.setSystemTime(new Date('2024-01-15T05:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good morning')
      expect(result.subtitle).toBe('Ready to write?')
    })

    it('returns morning greeting at 9am', () => {
      vi.setSystemTime(new Date('2024-01-15T09:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good morning')
    })

    it('returns morning greeting at 11:59am', () => {
      vi.setSystemTime(new Date('2024-01-15T11:59:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good morning')
    })
  })

  describe('Afternoon (12pm-5pm)', () => {
    it('returns afternoon greeting at 12pm', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good afternoon')
      expect(result.subtitle).toBe('Keep the momentum')
    })

    it('returns afternoon greeting at 2pm', () => {
      vi.setSystemTime(new Date('2024-01-15T14:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good afternoon')
    })

    it('returns afternoon greeting at 4:59pm', () => {
      vi.setSystemTime(new Date('2024-01-15T16:59:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good afternoon')
    })
  })

  describe('Evening (5pm-9pm)', () => {
    it('returns evening greeting at 5pm', () => {
      vi.setSystemTime(new Date('2024-01-15T17:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good evening')
      expect(result.subtitle).toBe('Wrapping up?')
    })

    it('returns evening greeting at 7pm', () => {
      vi.setSystemTime(new Date('2024-01-15T19:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good evening')
    })

    it('returns evening greeting at 8:59pm', () => {
      vi.setSystemTime(new Date('2024-01-15T20:59:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Good evening')
    })
  })

  describe('Late Night (9pm-5am)', () => {
    it('returns late night greeting at 9pm', () => {
      vi.setSystemTime(new Date('2024-01-15T21:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Late night session')
      expect(result.subtitle).toBe('Night owl mode')
    })

    it('returns late night greeting at midnight', () => {
      vi.setSystemTime(new Date('2024-01-15T00:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Late night session')
    })

    it('returns late night greeting at 3am', () => {
      vi.setSystemTime(new Date('2024-01-15T03:00:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Late night session')
    })

    it('returns late night greeting at 4:59am', () => {
      vi.setSystemTime(new Date('2024-01-15T04:59:00'))
      const result = getTimeBasedGreeting()
      expect(result.greeting).toBe('Late night session')
    })
  })

  describe('Edge cases', () => {
    it('handles boundary between late night and morning (4:59 -> 5:00)', () => {
      vi.setSystemTime(new Date('2024-01-15T04:59:59'))
      expect(getTimeBasedGreeting().greeting).toBe('Late night session')

      vi.setSystemTime(new Date('2024-01-15T05:00:00'))
      expect(getTimeBasedGreeting().greeting).toBe('Good morning')
    })

    it('handles boundary between morning and afternoon (11:59 -> 12:00)', () => {
      vi.setSystemTime(new Date('2024-01-15T11:59:59'))
      expect(getTimeBasedGreeting().greeting).toBe('Good morning')

      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      expect(getTimeBasedGreeting().greeting).toBe('Good afternoon')
    })

    it('handles boundary between afternoon and evening (16:59 -> 17:00)', () => {
      vi.setSystemTime(new Date('2024-01-15T16:59:59'))
      expect(getTimeBasedGreeting().greeting).toBe('Good afternoon')

      vi.setSystemTime(new Date('2024-01-15T17:00:00'))
      expect(getTimeBasedGreeting().greeting).toBe('Good evening')
    })

    it('handles boundary between evening and late night (20:59 -> 21:00)', () => {
      vi.setSystemTime(new Date('2024-01-15T20:59:59'))
      expect(getTimeBasedGreeting().greeting).toBe('Good evening')

      vi.setSystemTime(new Date('2024-01-15T21:00:00'))
      expect(getTimeBasedGreeting().greeting).toBe('Late night session')
    })
  })
})
