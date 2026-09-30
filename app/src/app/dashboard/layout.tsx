import { DashboardAuthGuard } from '@/features/dashboard/components/DashboardAuthGuard'
import { DashboardMobileNavigation } from '@/features/dashboard/components/DashboardMobileNavigation'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { DashboardTopBar } from '@/features/dashboard/components/DashboardTopBar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <DashboardAuthGuard>
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
      </DashboardAuthGuard>
    </>
  )
}
