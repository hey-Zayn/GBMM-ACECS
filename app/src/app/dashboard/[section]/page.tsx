import { notFound } from 'next/navigation'

const dashboardSections = {
  analytics: 'Analytics',
  campaigns: 'Campaigns',
  contacts: 'Contacts',
  mailboxes: 'Mailboxes',
  settings: 'Settings',
} as const

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const title = dashboardSections[section as keyof typeof dashboardSections]

  if (!title) {
    notFound()
  }

  return (
    <section aria-labelledby="dashboard-section-title">
      <h1 id="dashboard-section-title" className="text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        This section is ready for the next dashboard feature implementation.
      </p>
    </section>
  )
}
