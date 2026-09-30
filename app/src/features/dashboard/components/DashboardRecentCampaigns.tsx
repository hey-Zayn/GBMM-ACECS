import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'

export function DashboardRecentCampaigns() {
  return (
    <div className=" rounded-lg border border-slate-300/80 bg-transparent p-[2px] shadow-2xs ">

      <section className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs" aria-labelledby="recent-campaigns-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="recent-campaigns-title" className="text-lg font-semibold text-slate-900">Recent campaigns</h2>
            <p className="mt-1 text-sm text-slate-500">Your latest outreach activity will appear here.</p>
          </div>
          <Link href="/dashboard/campaigns" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
            View all <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-xs">
            <Mail aria-hidden="true" className="size-5" />
          </span>
          <h3 className="mt-4 text-sm font-semibold text-slate-800">No campaigns yet</h3>
          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">Create a campaign to start reaching your contacts with personalized emails.</p>
          <Link href="/dashboard/campaigns" className="mt-5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90">
            Create campaign
          </Link>
        </div>
      </section>
    </div>
  )
}
