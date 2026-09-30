"use client"

import { memo } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import {
  isDashboardNavigationItemActive,
  type DashboardNavigationGroup,
  type DashboardNavigationItem,
} from "@/features/dashboard/config/navigation"

// ─── Double-border icon tile ──────────────────────────────────────────────────
function IconTile({
  icon: Icon,
  isActive,
}: {
  icon: DashboardNavigationItem["icon"]
  isActive: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-sm border p-[2px] transition-colors",
        isActive
          ? "border-[#3b79fd]/25 bg-[#3b79fd]/10"
          : "border-slate-300 bg-slate-100/70 group-hover/nav:border-slate-300"
      )}
    >
      <span
        className={cn(
          "flex size-full items-center justify-center rounded-sm border  bg-white/50 shadow-2xs transition-colors",
          isActive
            ? "border-[#3b79fd]/40 text-[#3b79fd]"
            : "border-slate-300 text-slate-500 group-hover/nav:text-slate-900"
        )}
      >
        <Icon
          className={cn("size-3.5 shrink-0", isActive ? "stroke-[2.2]" : "stroke-[1.8]")}
        />
      </span>
    </span>
  )
}

// ─── Single nav item link ─────────────────────────────────────────────────────
const NavItem = memo(function NavItem({
  item,
  isActive,
}: {
  item: DashboardNavigationItem
  isActive: boolean
}) {
  return (
    <SidebarMenuItem>
      <Link
        href={item.href}
        title={item.label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group/nav flex w-full bg-slate-100/50  items-center gap-2.5 rounded-sm border  px-1.5 py-1.5 text-left text-[13px] transition-colors",
          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
          isActive
            ? "border-slate-300/90 bg-white font-semibold text-slate-900 shadow-2xs group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
            : "border-slate-200/90 font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
        )}
      >
        <IconTile icon={item.icon} isActive={isActive} />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {item.label}
        </span>
      </Link>
    </SidebarMenuItem>
  )
})
NavItem.displayName = "NavItem"

// ─── Nav group (label + list of items) ───────────────────────────────────────
function SidebarNavSectionInner({
  group,
  pathname,
}: {
  group: DashboardNavigationGroup
  pathname: string
}) {
  return (
    <div className="mb-2">
      <div className="px-2 pb-1 pt-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase group-data-[collapsible=icon]:hidden">
        {group.title}
      </div>
      <SidebarMenu className="gap-1">
        {group.items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={isDashboardNavigationItemActive(pathname, item.href)}
          />
        ))}
      </SidebarMenu>
    </div>
  )
}

export const SidebarNavSection = memo(SidebarNavSectionInner)
SidebarNavSection.displayName = "SidebarNavSection"