'use client'

import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DashboardMobileNavigation } from './DashboardMobileNavigation'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopBar } from './DashboardTopBar'

type DashboardShellProps = {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '265px' } as React.CSSProperties}
      className="min-h-screen bg-[#EBEDF2]"
    >
      <DashboardSidebar />
      <SidebarInset className="bg-transparent p-3 pl-0">
        <main className="min-h-[calc(100vh-24px)] rounded-2xl border border-slate-200/80 bg-white p-6 pb-24 shadow-xs md:pb-6">
          <DashboardTopBar />
          {children}
        </main>
      </SidebarInset>
      <DashboardMobileNavigation />
    </SidebarProvider>
  )
}
