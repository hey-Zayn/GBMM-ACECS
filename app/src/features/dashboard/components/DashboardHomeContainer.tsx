'use client'

import Link from 'next/link'
import { BarChart3, Contact, Inbox, Mail, Plus, Send, Users, MousePointerClick } from 'lucide-react'

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useMailboxes } from '@/features/mailboxes/hooks/useMailboxes'
import { useDashboardStore } from '../store/dashboard.store'
import { DashboardMailboxHealth } from './DashboardMailboxHealth'
import { DashboardMetricCard } from './DashboardMetricCard'
import { DashboardRecentCampaigns } from './DashboardRecentCampaigns'
import { DashboardSetupChecklist } from './DashboardSetupChecklist'

const dashboardActions = [
  { label: 'Campaigns', description: 'Create and manage mail campaigns.', href: '/dashboard/campaigns', icon: Mail },
  { label: 'Contacts', description: 'Import and organize recipients.', href: '/dashboard/contacts', icon: Contact },
  { label: 'Mailboxes', description: 'Connect and monitor sending accounts.', href: '/dashboard/mailboxes', icon: Inbox },
  { label: 'Analytics', description: 'Review campaign performance.', href: '/dashboard/analytics', icon: BarChart3 },
]

export function DashboardHomeContainer() {
  const { data: user } = useCurrentUser()
  const mailboxesQuery = useMailboxes()
  const searchQuery = useDashboardStore((state) => state.searchQuery.trim().toLowerCase())
  const actions = dashboardActions.filter((action) =>
    `${action.label} ${action.description}`.toLowerCase().includes(searchQuery)
  )
  const firstName = user?.displayName.split(' ')[0] ?? 'there'

  return (
    <section aria-labelledby="dashboard-home-title" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {/* <p className="text-sm font-medium text-primary">Workspace overview</p> */}
          <h1 id="dashboard-home-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
          <p className="mt-2 text-sm text-slate-500">Build your next campaign and keep your outreach moving.</p>
        </div>
        <div className=" rounded-lg border border-slate-300/80 bg-transparent p-[2px] shadow-2xs ">
          <Link href="/dashboard/campaigns" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0F172B] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90">
            <Plus aria-hidden="true" className="size-4" />
            Create campaign
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard label="Emails sent" value="—" description="Campaign data will appear here" icon={Send} />
        <DashboardMetricCard label="Active campaigns" value="—" description="No active campaigns yet" icon={Mail} />
        <DashboardMetricCard label="Open rate" value="—" description="No engagement data yet" icon={MousePointerClick} />
        <DashboardMetricCard label="Contacts" value="—" description="Import contacts to get started" icon={Users} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <DashboardRecentCampaigns />
        <DashboardMailboxHealth mailboxes={mailboxesQuery.data ?? []} isLoading={mailboxesQuery.isLoading} isError={mailboxesQuery.isError} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">

        <DashboardSetupChecklist />


        <div className=" rounded-lg border border-slate-300/80 bg-transparent p-[2.2px] shadow-2xs ">
          <section className="h-full rounded-md border border-slate-200/80 bg-white p-5 shadow-xs" aria-labelledby="quick-actions-title">
            <h2 id="quick-actions-title" className="text-lg font-semibold text-slate-900">Quick actions</h2>
            <p className="mt-1 text-sm text-slate-500">Jump into the workspace areas you use most.</p>
            <div className="mt-5 grid gap-2">
              {actions.map(({ label, description, href, icon: Icon }) => (
                <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-primary"><Icon aria-hidden="true" className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800">{label}</span><span className="block truncate text-xs text-slate-400">{description}</span></span>
                  <span className="text-slate-300 transition group-hover:text-primary">→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
