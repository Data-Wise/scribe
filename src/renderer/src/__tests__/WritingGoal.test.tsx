import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WritingGoal } from '../components/WritingGoal'
import * as preferences from '../lib/preferences'

// Mock preferences module
vi.mock('../lib/preferences', () => ({
  getDailyGoalInfo: vi.fn(),
  setDailyGoalTarget: vi.fn(),
  toggleDailyGoalOptIn: vi.fn()
}))

describe('WritingGoal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('when not opted in', () => {
    beforeEach(() => {
      vi.mocked(preferences.getDailyGoalInfo).mockReturnValue({
        isEnabled: false,
        target: 500,
        written: 0,
        progress: 0,
        isComplete: false,
        remaining: 500
      })
    })

    it('shows enable prompt', () => {
      render(<WritingGoal />)
      expect(screen.getByText('Set a daily goal?')).toBeInTheDocument()
      expect(screen.getByText('Track your writing progress')).toBeInTheDocument()
    })

    it('shows enable button', () => {
      render(<WritingGoal />)
      expect(screen.getByRole('button', { name: 'Enable' })).toBeInTheDocument()
    })

    it('enables goal when clicking enable button', () => {
      render(<WritingGoal />)
      fireEvent.click(screen.getByRole('button', { name: 'Enable' }))
      expect(preferences.toggleDailyGoalOptIn).toHaveBeenCalledWith(true)
    })
  })

  describe('when goal is active', () => {
    beforeEach(() => {
      vi.mocked(preferences.getDailyGoalInfo).mockReturnValue({
        isEnabled: true,
        target: 500,
        written: 200,
        progress: 40,
        isComplete: false,
        remaining: 300
      })
    })

    it('shows goal progress', () => {
      render(<WritingGoal />)
      expect(screen.getByText("Today's Goal")).toBeInTheDocument()
      expect(screen.getByText('300 words to go')).toBeInTheDocument()
    })

    it('shows progress bar', () => {
      render(<WritingGoal />)
      const progressBar = document.querySelector('[style*="width: 40%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('shows words written and percentage', () => {
      render(<WritingGoal />)
      expect(screen.getByText('200 written')).toBeInTheDocument()
      expect(screen.getByText('40%')).toBeInTheDocument()
    })

    it('shows Write button when onStartWriting provided', () => {
      const mockHandler = vi.fn()
      render(<WritingGoal onStartWriting={mockHandler} />)
      expect(screen.getByRole('button', { name: 'Write' })).toBeInTheDocument()
    })

    it('calls onStartWriting when Write button clicked', () => {
      const mockHandler = vi.fn()
      render(<WritingGoal onStartWriting={mockHandler} />)
      fireEvent.click(screen.getByRole('button', { name: 'Write' }))
      expect(mockHandler).toHaveBeenCalled()
    })

    it('disables goal when X clicked', () => {
      render(<WritingGoal />)
      const disableButton = screen.getByTitle('Disable daily goal')
      fireEvent.click(disableButton)
      expect(preferences.toggleDailyGoalOptIn).toHaveBeenCalledWith(false)
    })
  })

  describe('goal editing', () => {
    beforeEach(() => {
      vi.mocked(preferences.getDailyGoalInfo).mockReturnValue({
        isEnabled: true,
        target: 500,
        written: 100,
        progress: 20,
        isComplete: false,
        remaining: 400
      })
    })

    it('shows edit button', () => {
      render(<WritingGoal />)
      expect(screen.getByTitle('Edit goal')).toBeInTheDocument()
    })

    it('shows input when edit clicked', () => {
      render(<WritingGoal />)
      fireEvent.click(screen.getByTitle('Edit goal'))
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })

    it('saves new goal on Enter', () => {
      render(<WritingGoal />)
      fireEvent.click(screen.getByTitle('Edit goal'))
      const input = screen.getByRole('spinbutton')
      fireEvent.change(input, { target: { value: '750' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(preferences.setDailyGoalTarget).toHaveBeenCalledWith(750)
    })

    it('cancels edit on Escape', () => {
      render(<WritingGoal />)
      fireEvent.click(screen.getByTitle('Edit goal'))
      const input = screen.getByRole('spinbutton')
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(preferences.setDailyGoalTarget).not.toHaveBeenCalled()
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    })

    it('saves via save button', () => {
      render(<WritingGoal />)
      fireEvent.click(screen.getByTitle('Edit goal'))
      const input = screen.getByRole('spinbutton')
      fireEvent.change(input, { target: { value: '1000' } })
      fireEvent.click(screen.getByTitle('Save'))
      expect(preferences.setDailyGoalTarget).toHaveBeenCalledWith(1000)
    })

    it('ignores invalid input', () => {
      render(<WritingGoal />)
      fireEvent.click(screen.getByTitle('Edit goal'))
      const input = screen.getByRole('spinbutton')
      fireEvent.change(input, { target: { value: 'abc' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(preferences.setDailyGoalTarget).not.toHaveBeenCalled()
    })
  })

  describe('when goal is complete', () => {
    beforeEach(() => {
      vi.mocked(preferences.getDailyGoalInfo).mockReturnValue({
        isEnabled: true,
        target: 500,
        written: 523,
        progress: 100,
        isComplete: true,
        remaining: 0
      })
    })

    it('shows celebration message', () => {
      render(<WritingGoal />)
      expect(screen.getByText('Goal reached!')).toBeInTheDocument()
    })

    it('shows completed word count', () => {
      render(<WritingGoal />)
      expect(screen.getByText('523 / 500 words')).toBeInTheDocument()
    })

    it('uses emerald/green styling', () => {
      render(<WritingGoal />)
      const container = document.querySelector('.writing-goal-complete')
      expect(container).toBeInTheDocument()
    })
  })

  describe('progress calculations', () => {
    it('handles 0% progress', () => {
      vi.mocked(preferences.getDailyGoalInfo).mockReturnValue({
        isEnabled: true,
        target: 500,
        written: 0,
        progress: 0,
        isComplete: false,
        remaining: 500
      })
      render(<WritingGoal />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('handles 50% progress', () => {
      vi.mocked(preferences.getDailyGoalInfo).mockReturnValue({
        isEnabled: true,
        target: 500,
        written: 250,
        progress: 50,
        isComplete: false,
        remaining: 250
      })
      render(<WritingGoal />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('handles over 100% (exceeded goal)', () => {
      vi.mocked(preferences.getDailyGoalInfo).mockReturnValue({
        isEnabled: true,
        target: 500,
        written: 600,
        progress: 100, // Capped at 100
        isComplete: true,
        remaining: 0
      })
      render(<WritingGoal />)
      expect(screen.getByText('600 / 500 words')).toBeInTheDocument()
    })
  })

  describe('formatting', () => {
    it('formats large numbers with commas', () => {
      vi.mocked(preferences.getDailyGoalInfo).mockReturnValue({
        isEnabled: true,
        target: 5000,
        written: 2500,
        progress: 50,
        isComplete: false,
        remaining: 2500
      })
      render(<WritingGoal />)
      expect(screen.getByText('2,500 words to go')).toBeInTheDocument()
      expect(screen.getByText('2,500 written')).toBeInTheDocument()
    })
  })
})
