import type { LucideIcon } from 'lucide-react'

type DashboardMetricCardProps = {
  label: string
  value: string
  description: string
  icon: LucideIcon
}

export function DashboardMetricCard({
  label,
  value,
  description,
  icon: Icon,
}: DashboardMetricCardProps) {
  return (
    <div className=" rounded-lg border border-slate-300/80 bg-transparent p-[2px] shadow-2xs ">

      <article className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        </div>
        <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </article>
    </div>
  )
}
