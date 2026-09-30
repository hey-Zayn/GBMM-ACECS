'use client'

import Link from 'next/link'
import { BarChart3, Contact, Inbox, Mail } from 'lucide-react'

import { useDashboardStore } from '../store/dashboard.store'

const dashboardActions = [
  { label: 'Campaigns', description: 'Create and manage mail campaigns.', href: '/dashboard/campaigns', icon: Mail },
  { label: 'Contacts', description: 'Import and organize recipients.', href: '/dashboard/contacts', icon: Contact },
  { label: 'Mailboxes', description: 'Connect and monitor sending accounts.', href: '/dashboard/mailboxes', icon: Inbox },
  { label: 'Analytics', description: 'Review campaign performance.', href: '/dashboard/analytics', icon: BarChart3 },
]

export function DashboardHomeContainer() {
  const searchQuery = useDashboardStore((state) => state.searchQuery.trim().toLowerCase())
  const actions = dashboardActions.filter((action) =>
    `${action.label} ${action.description}`.toLowerCase().includes(searchQuery)
  )

  return (
    <section aria-labelledby="dashboard-home-title">
      <h1 id="dashboard-home-title" className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500">Manage your campaigns, contacts, and mailboxes from one workspace.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {actions.map(({ label, description, href, icon: Icon }) => (
          <Link key={href} href={href} className="rounded-2xl border border-slate-200 p-5 transition hover:border-primary/40 hover:bg-primary/5">
            <Icon aria-hidden="true" className="size-5 text-primary" />
            <h2 className="mt-4 font-semibold text-slate-900">{label}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </div>
      {actions.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          No dashboard features match your search.
        </p>
      )}
    </section>
  )
}
