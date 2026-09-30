"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  dashboardMobileNavigation,
  isDashboardNavigationItemActive,
  type DashboardNavigationItem,
} from "@/features/dashboard/config/navigation"

function MobileNavigationItem({
  item,
  isActive,
}: {
  item: DashboardNavigationItem
  isActive: boolean
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon aria-hidden="true" className="size-5" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export function DashboardMobileNavigation() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_24px_rgba(3,5,7,0.06)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-1">
        {dashboardMobileNavigation.map((item) => (
          <MobileNavigationItem
            key={item.href}
            item={item}
            isActive={isDashboardNavigationItemActive(pathname, item.href)}
          />
        ))}
      </div>
    </nav>
  )
}
