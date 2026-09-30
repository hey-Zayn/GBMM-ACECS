'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Inbox, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MailboxCard } from '../components/MailboxCard'
import { MailboxConnectDialog } from '../components/MailboxConnectDialog'
import { useMailboxActions } from '../hooks/useMailboxActions'
import { useMailboxes } from '../hooks/useMailboxes'

export function MailboxPageContainer() {
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const searchParams = useSearchParams()
  const mailboxesQuery = useMailboxes()
  const actions = useMailboxActions()

  if (mailboxesQuery.isLoading) {
    return <MailboxLoadingState />
  }

  if (mailboxesQuery.isError) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
        <h1 className="text-lg font-semibold text-red-900">We could not load your mailboxes</h1>
        <p className="mt-2 text-sm text-red-800">Please refresh the page and try again.</p>
        <Button className="mt-4" variant="outline" onClick={() => mailboxesQuery.refetch()}>Try again</Button>
      </section>
    )
  }

  const mailboxes = mailboxesQuery.data ?? []
  return (
    <section aria-labelledby="mailboxes-title" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Sending accounts</p>
          <h1 id="mailboxes-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Mailboxes</h1>
          <p className="mt-2 text-sm text-slate-500">Connect and monitor the accounts that send your campaigns.</p>
        </div>
        <Button type="button" onClick={() => setIsConnectOpen(true)}><Plus aria-hidden="true" />Connect an email account</Button>
      </div>

      <MailboxOAuthNotice result={searchParams.get('google')} />

      {mailboxes.length === 0 ? <MailboxEmptyState onConnect={() => setIsConnectOpen(true)} /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {mailboxes.map((mailbox) => (
            <MailboxCard
              key={mailbox.id}
              mailbox={mailbox}
              isTesting={actions.testingMailboxId === mailbox.id}
              isDisconnecting={actions.disconnectingMailboxId === mailbox.id}
              onTest={() => actions.testMailbox(mailbox.id)}
              onDisconnect={() => {
                if (window.confirm(`Disconnect ${mailbox.email}?`)) actions.disconnectMailbox(mailbox.id)
              }}
            />
          ))}
        </div>
      )}
      <MailboxConnectDialog open={isConnectOpen} onOpenChange={setIsConnectOpen} />
    </section>
  )
}

function MailboxOAuthNotice({ result }: { result: string | null }) {
  if (!result) return null
  const isConnected = result === 'connected'
  const isCancelled = result === 'cancelled'
  const message = isConnected
    ? 'Gmail connected successfully. Your mailbox is ready to send.'
    : isCancelled
      ? 'Google sign-in was cancelled. You can try again whenever you are ready.'
      : 'Google could not connect this mailbox. Please try again or use another method.'
  return <div className={`rounded-lg border p-4 text-sm ${isConnected ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`} role={isConnected ? 'status' : 'alert'}>{message}</div>
}

function MailboxLoadingState() {
  return <div className="grid gap-4 lg:grid-cols-2" aria-label="Loading mailboxes"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
}

function MailboxEmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <div id="connect-mailbox" className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Inbox className="mx-auto size-8 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">No mailbox connected</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Connect Gmail or use advanced setup for another provider. Your credentials stay protected and are never shown here.</p>
      <Button className="mt-5" type="button" onClick={onConnect}>Connect an email account</Button>
    </div>
  )
}
