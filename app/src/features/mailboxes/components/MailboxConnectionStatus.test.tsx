import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MailboxConnectionStatus } from './MailboxConnectionStatus'

describe('MailboxConnectionStatus', () => {
  it('shows progress while discovering a provider', () => {
    render(<MailboxConnectionStatus state="discovering" />)

    expect(screen.getByRole('status')).toHaveTextContent('Checking your email provider')
  })

  it('offers recovery after a connection error', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()

    render(<MailboxConnectionStatus state="error" onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows a success continuation action', () => {
    render(<MailboxConnectionStatus state="success" onContinue={() => undefined} />)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible()
  })
})
