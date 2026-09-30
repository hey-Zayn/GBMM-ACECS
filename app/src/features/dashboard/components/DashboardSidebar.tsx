"use client"

import { usePathname } from "next/navigation"

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { dashboardNavigationGroups } from "@/features/dashboard/config/navigation"
import { SidebarBrandHeader } from "./sidebar/SidebarBrandHeader"
import { SidebarNavSection } from "./sidebar/SidebarNavSection"
import { WorkspaceSwitcher } from "./sidebar/WorkspaceSwitcher"
import { UpgradeCard } from "./sidebar/UpgradeCard"
import { UserProfileContainer } from "./sidebar/UserProfileContainer"
import type { Workspace } from "./sidebar/types"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: user } = useCurrentUser()
  const workspace: Workspace | null = user
    ? { id: user.workspaceId, name: "Current workspace", plan: "Active workspace" }
    : null

  return (
    <Sidebar
      collapsible="icon"
      className="w-[265px] border-none p-3 [&_[data-slot=sidebar-inner]]:bg-[#EBEDF2] [&_[data-slot=sidebar-inner]]:p-2.5 [&_[data-slot=sidebar-inner]]:ring-0"
    >
      <SidebarBrandHeader />
      <WorkspaceSwitcher workspace={workspace} />

      <SidebarContent className="gap-0 overflow-y-auto px-0 py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {dashboardNavigationGroups.map((group) => (
          <SidebarNavSection key={group.title} group={group} pathname={pathname} />
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-0 p-0">
        <UpgradeCard />
        <SidebarSeparator className="mx-1 mb-2 group-data-[collapsible=icon]:hidden" />
        <UserProfileContainer />
      </SidebarFooter>
    </Sidebar>
  )
}
