import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from '../EmptyState'
import { FolderPlus } from 'lucide-react'

describe('EmptyState', () => {
  it('renders all props correctly', () => {
    render(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" data-testid="icon" />}
        title="No projects yet"
        description="Create your first project to get started"
        actionLabel="Create Project"
        onAction={() => {}}
      />
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'No projects yet' })).toBeInTheDocument()
    expect(screen.getByText('Create your first project to get started')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Project' })).toBeInTheDocument()
  })

  it('renders without action button when actionLabel or onAction not provided', () => {
    render(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" />}
        title="No projects yet"
        description="Create your first project to get started"
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders without action button when only actionLabel provided', () => {
    render(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" />}
        title="No projects yet"
        description="Create your first project to get started"
        actionLabel="Create Project"
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders without action button when only onAction provided', () => {
    render(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" />}
        title="No projects yet"
        description="Create your first project to get started"
        onAction={() => {}}
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('fires onAction when button clicked', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()

    render(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" />}
        title="No projects yet"
        description="Create your first project to get started"
        actionLabel="Create Project"
        onAction={onAction}
      />
    )

    const button = screen.getByRole('button', { name: 'Create Project' })
    await user.click(button)

    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('has correct accessibility attributes', () => {
    render(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" data-testid="icon" />}
        title="No projects yet"
        description="Create your first project to get started"
        actionLabel="Create Project"
        onAction={() => {}}
      />
    )

    // Icon should be hidden from screen readers
    const iconContainer = screen.getByTestId('icon').parentElement
    expect(iconContainer).toHaveAttribute('aria-hidden', 'true')

    // Title should be a proper heading
    expect(screen.getByRole('heading', { name: 'No projects yet' })).toBeInTheDocument()

    // Button should have clear label
    const button = screen.getByRole('button', { name: 'Create Project' })
    expect(button).toHaveAccessibleName('Create Project')
  })

  it('applies correct styling classes', () => {
    const { container } = render(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" />}
        title="No projects yet"
        description="Create your first project to get started"
        actionLabel="Create Project"
        onAction={() => {}}
      />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'text-center')
    expect(wrapper).toHaveClass('py-12', 'px-6', 'max-w-[280px]', 'mx-auto')
  })

  it('renders different content with different props', () => {
    const { rerender } = render(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" />}
        title="No projects yet"
        description="Create your first project to get started"
      />
    )

    expect(screen.getByText('No projects yet')).toBeInTheDocument()

    rerender(
      <EmptyState
        icon={<FolderPlus className="w-12 h-12" />}
        title="No notes yet"
        description="Start writing your first note"
      />
    )

    expect(screen.getByText('No notes yet')).toBeInTheDocument()
    expect(screen.getByText('Start writing your first note')).toBeInTheDocument()
    expect(screen.queryByText('No projects yet')).not.toBeInTheDocument()
  })
})
