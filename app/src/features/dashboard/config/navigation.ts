import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Contact,
  Inbox,
  LayoutGrid,
  Mail,
  Settings,
} from "lucide-react"

export type DashboardNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type DashboardNavigationGroup = {
  title: string
  items: DashboardNavigationItem[]
}

export const dashboardNavigationGroups: DashboardNavigationGroup[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { label: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
      { label: "Contacts", href: "/dashboard/contacts", icon: Contact },
      { label: "Mailboxes", href: "/dashboard/mailboxes", icon: Inbox },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

export const dashboardMobileNavigation: DashboardNavigationItem[] = [
  dashboardNavigationGroups[0].items[0],
  dashboardNavigationGroups[0].items[1],
  dashboardNavigationGroups[0].items[2],
  dashboardNavigationGroups[1].items[0],
  dashboardNavigationGroups[2].items[0],
]

export function isDashboardNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
