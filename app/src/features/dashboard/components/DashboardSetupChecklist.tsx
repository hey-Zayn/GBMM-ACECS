import Link from 'next/link'
import { ArrowRight, Check, Circle } from 'lucide-react'

type SetupStep = {
  label: string
  description: string
  href: string
  isComplete: boolean
}

const setupSteps: SetupStep[] = [
  {
    label: 'Create your workspace',
    description: 'Your workspace is ready to use.',
    href: '/dashboard',
    isComplete: true,
  },
  {
    label: 'Connect a sending mailbox',
    description: 'Connect Gmail or SMTP before sending campaigns.',
    href: '/dashboard/mailboxes',
    isComplete: false,
  },
  {
    label: 'Import your contacts',
    description: 'Add recipients and prepare merge fields.',
    href: '/dashboard/contacts',
    isComplete: false,
  },
  {
    label: 'Create your first campaign',
    description: 'Build a personalized email campaign.',
    href: '/dashboard/campaigns',
    isComplete: false,
  },
]

export function DashboardSetupChecklist() {
  return (
    <div className=" rounded-lg border border-slate-300/80 bg-transparent p-[2.2px] shadow-2xs ">

      <section className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs" aria-labelledby="setup-title">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Getting started</p>
          <h2 id="setup-title" className="mt-2 text-lg font-semibold text-slate-900">Complete your setup</h2>
          <p className="mt-1 text-sm text-slate-500">Follow these steps to launch your first campaign.</p>
        </div>

        <div className="mt-5 space-y-2">
          {setupSteps.map((step) => (
            <Link
              key={step.label}
              href={step.href}
              className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition hover:border-slate-200 hover:bg-slate-50"
            >
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${step.isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {step.isComplete ? <Check aria-hidden="true" className="size-4" /> : <Circle aria-hidden="true" className="size-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-800">{step.label}</span>
                <span className="mt-0.5 block text-xs text-slate-400">{step.description}</span>
              </span>
              <ArrowRight aria-hidden="true" className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
