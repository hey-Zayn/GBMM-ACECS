import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MailboxConnectionState } from '../types'

type MailboxConnectionStatusProps = {
  state: MailboxConnectionState
  provider?: string
  errorMessage?: string
  onRetry?: () => void
  onContinue?: () => void
}

export function MailboxConnectionStatus({
  state,
  provider,
  errorMessage,
  onRetry,
  onContinue,
}: MailboxConnectionStatusProps) {
  if (state === 'idle') {
    return null
  }

  if (state === 'discovering' || state === 'connecting') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900" role="status">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        <span>{state === 'discovering' ? 'Checking your email provider…' : `Connecting ${provider ?? 'email'}…`}</span>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
        <span className="flex items-center gap-3">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Email account connected successfully.
        </span>
        {onContinue ? <Button onClick={onContinue} size="sm">Continue</Button> : null}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
      <span className="flex items-center gap-3">
        <AlertCircle className="size-4" aria-hidden="true" />
        {errorMessage ?? 'We could not connect this email account. Try again or choose another method.'}
      </span>
      {onRetry ? <Button onClick={onRetry} size="sm" variant="outline">Try again</Button> : null}
    </div>
  )
}
