import { CheckCircle2, CircleAlert, Mail, MoreHorizontal, RefreshCw, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Mailbox } from '../types'

type MailboxCardProps = {
  mailbox: Mailbox
  isTesting: boolean
  isDisconnecting: boolean
  onTest: () => void
  onDisconnect: () => void
}

const statusCopy: Record<Mailbox['status'], { label: string; className: string }> = {
  ACTIVE: { label: 'Ready to send', className: 'bg-emerald-50 text-emerald-700' },
  DISCONNECTED: { label: 'Disconnected', className: 'bg-slate-100 text-slate-600' },
  RATE_LIMITED: { label: 'Rate limited', className: 'bg-amber-50 text-amber-700' },
  ERROR: { label: 'Needs attention', className: 'bg-red-50 text-red-700' },
}

export function MailboxCard({ mailbox, isTesting, isDisconnecting, onTest, onDisconnect }: MailboxCardProps) {
  const status = statusCopy[mailbox.status]
  const StatusIcon = mailbox.status === 'ACTIVE' ? CheckCircle2 : CircleAlert

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Mail className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>{mailbox.displayName || mailbox.email}</CardTitle>
            {mailbox.displayName ? <p className="mt-1 text-xs text-slate-500">{mailbox.email}</p> : null}
          </div>
        </div>
        <MoreHorizontal className="size-5 text-slate-400" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
          <StatusIcon className="size-3.5" aria-hidden="true" />
          {status.label}
        </span>
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div><p className="text-xs text-slate-500">Sent today</p><p className="mt-1 font-semibold text-slate-900">{mailbox.sentTodayCount}</p></div>
          <div><p className="text-xs text-slate-500">Remaining</p><p className="mt-1 font-semibold text-slate-900">{mailbox.remainingToday}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onTest} disabled={isTesting || isDisconnecting}>
            <RefreshCw className={isTesting ? 'animate-spin' : ''} aria-hidden="true" />
            {isTesting ? 'Checking…' : 'Test connection'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onDisconnect} disabled={isTesting || isDisconnecting}>
            <Unplug aria-hidden="true" />
            {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
