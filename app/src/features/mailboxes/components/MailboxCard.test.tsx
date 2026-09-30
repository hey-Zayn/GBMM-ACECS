import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MailboxCard } from './MailboxCard'
import type { Mailbox } from '../types'

const mailbox: Mailbox = {
  id: 'mailbox-id',
  workspaceId: 'workspace-id',
  type: 'GMAIL_OAUTH',
  email: 'sender@example.com',
  displayName: 'Sales',
  status: 'ACTIVE',
  dailyCap: 500,
  sentTodayCount: 42,
  remainingToday: 458,
}

describe('MailboxCard', () => {
  it('renders safe mailbox health and actions', () => {
    render(<MailboxCard mailbox={mailbox} isTesting={false} isDisconnecting={false} onTest={vi.fn()} onDisconnect={vi.fn()} />)

    expect(screen.getByText('Sales')).toBeVisible()
    expect(screen.getByText('Ready to send')).toBeVisible()
    expect(screen.getByText('458')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Test connection' })).toBeEnabled()
  })
})
