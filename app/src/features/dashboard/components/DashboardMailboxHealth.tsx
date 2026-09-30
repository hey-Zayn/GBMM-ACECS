import Link from 'next/link'
import { ArrowRight, Inbox } from 'lucide-react'

export function DashboardMailboxHealth() {
  return (
    <div className=" rounded-lg border border-slate-300/80 bg-transparent p-[2.2px]  shadow-2xs ">

      <section className="h-full rounded-md border border-slate-200/80 bg-white p-5 shadow-xs" aria-labelledby="mailbox-health-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="mailbox-health-title" className="text-lg font-semibold text-slate-900">Mailbox health</h2>
            <p className="mt-1 text-sm text-slate-500">Monitor the accounts that send your campaigns.</p>
          </div>
          <Inbox aria-hidden="true" className="size-5 text-primary" />
        </div>

        <div className="mt-6 rounded-xl bg-blue-50/70 p-4">
          <p className="text-sm font-semibold text-slate-800">No mailbox connected</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Connect Gmail or SMTP to unlock campaign sending and daily capacity tracking.</p>
          <Link href="/dashboard/mailboxes" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            Connect mailbox <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
