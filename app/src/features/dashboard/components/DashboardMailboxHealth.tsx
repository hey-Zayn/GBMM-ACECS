import Link from 'next/link'
import { ArrowRight, Inbox } from 'lucide-react'

import type { Mailbox } from '@/features/mailboxes/types'

type DashboardMailboxHealthProps = {
  mailboxes: Mailbox[]
  isLoading: boolean
  isError: boolean
}

export function DashboardMailboxHealth({ mailboxes, isLoading, isError }: DashboardMailboxHealthProps) {
  return (
    <div className="rounded-lg border border-slate-300/80 bg-transparent p-[2.2px] shadow-2xs">
      <section className="h-full rounded-md border border-slate-200/80 bg-white p-5 shadow-xs" aria-labelledby="mailbox-health-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="mailbox-health-title" className="text-lg font-semibold text-slate-900">Mailbox health</h2>
            <p className="mt-1 text-sm text-slate-500">Monitor the accounts that send your campaigns.</p>
          </div>
          <Inbox aria-hidden="true" className="size-5 text-primary" />
        </div>

        {isLoading ? <MailboxHealthLoading /> : null}
        {isError ? <MailboxHealthError /> : null}
        {!isLoading && !isError ? <MailboxHealthSummary mailboxes={mailboxes} /> : null}
      </section>
    </div>
  )
}

export function summarizeMailboxes(mailboxes: Mailbox[]) {
  const activeMailboxes = mailboxes.filter((mailbox) => mailbox.status === 'ACTIVE')
  const primaryMailbox = activeMailboxes[0] ?? mailboxes[0]
  const hasAttention = mailboxes.some((mailbox) => mailbox.status !== 'ACTIVE')

  return {
    total: mailboxes.length,
    active: activeMailboxes.length,
    sentToday: activeMailboxes.reduce((total, mailbox) => total + mailbox.sentTodayCount, 0),
    remainingToday: activeMailboxes.reduce((total, mailbox) => total + mailbox.remainingToday, 0),
    primaryMailbox,
    hasAttention,
  }
}

function MailboxHealthSummary({ mailboxes }: { mailboxes: Mailbox[] }) {
  const summary = summarizeMailboxes(mailboxes)

  if (!summary.primaryMailbox) {
    return <div className="mt-6 rounded-xl bg-blue-50/70 p-4"><p className="text-sm font-semibold text-slate-800">No mailbox connected</p><p className="mt-1 text-xs leading-5 text-slate-500">Connect Gmail or SMTP to unlock campaign sending and daily capacity tracking.</p><MailboxLink label="Connect mailbox" /></div>
  }

  const isPrimaryReady = summary.primaryMailbox.status === 'ACTIVE'
  const statusLabel = isPrimaryReady ? 'Ready to send' : 'Needs attention'
  const statusClass = isPrimaryReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'

  return <div className="mt-6 space-y-4"><div className={`rounded-xl p-4 ${statusClass}`}><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{statusLabel}</p><span className="text-xs font-medium">{summary.active}/{summary.total} active</span></div><p className="mt-1 truncate text-xs opacity-80">{summary.primaryMailbox.email}</p></div><div className="grid grid-cols-2 gap-3"><HealthMetric label="Sent today" value={summary.sentToday} /><HealthMetric label="Remaining" value={summary.remainingToday} /></div>{summary.hasAttention ? <p className="text-xs leading-5 text-amber-700">One or more mailboxes need attention. Review their status before launching a campaign.</p> : null}<MailboxLink label="Manage mailboxes" /></div>
}

function MailboxHealthLoading() {
  return <div className="mt-6 space-y-3" aria-label="Loading mailbox health"><div className="h-20 animate-pulse rounded-xl bg-slate-100" /><div className="grid grid-cols-2 gap-3"><div className="h-16 animate-pulse rounded-xl bg-slate-100" /><div className="h-16 animate-pulse rounded-xl bg-slate-100" /></div></div>
}

function MailboxHealthError() {
  return <div className="mt-6 rounded-xl bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-800">Mailbox health unavailable</p><p className="mt-1 text-xs leading-5 text-rose-700">Open Mailboxes to review your connected sending accounts.</p><MailboxLink label="Open mailboxes" /></div>
}

function HealthMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-slate-900">{value.toLocaleString()}</p></div>
}

function MailboxLink({ label }: { label: string }) {
  return <Link href="/dashboard/mailboxes" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">{label}<ArrowRight aria-hidden="true" className="size-3.5" /></Link>
}
