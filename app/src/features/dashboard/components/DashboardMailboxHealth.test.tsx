import { describe, expect, it } from 'vitest'
import type { Mailbox } from '@/features/mailboxes/types'
import { summarizeMailboxes } from './DashboardMailboxHealth'

const mailbox = (overrides: Partial<Mailbox>): Mailbox => ({
  id: 'mailbox-id',
  workspaceId: 'workspace-id',
  type: 'GMAIL_OAUTH',
  email: 'sender@example.com',
  displayName: 'Sender',
  status: 'ACTIVE',
  dailyCap: 500,
  sentTodayCount: 42,
  remainingToday: 458,
  ...overrides,
})

describe('summarizeMailboxes', () => {
  it('summarizes active mailbox capacity for the dashboard', () => {
    const summary = summarizeMailboxes([mailbox({}), mailbox({ id: 'second', sentTodayCount: 10, remainingToday: 490 })])

    expect(summary).toMatchObject({ total: 2, active: 2, sentToday: 52, remainingToday: 948, hasAttention: false })
    expect(summary.primaryMailbox?.email).toBe('sender@example.com')
  })

  it('flags disconnected mailboxes while preferring an active primary mailbox', () => {
    const summary = summarizeMailboxes([mailbox({ status: 'DISCONNECTED' }), mailbox({ id: 'active', email: 'active@example.com' })])

    expect(summary.primaryMailbox?.email).toBe('active@example.com')
    expect(summary.hasAttention).toBe(true)
    expect(summary.active).toBe(1)
  })
})
