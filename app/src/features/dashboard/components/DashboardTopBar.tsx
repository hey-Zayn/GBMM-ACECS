'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, Search, Settings, User } from 'lucide-react'

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useDashboardStore } from '@/features/dashboard/store/dashboard.store'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getInitials } from './sidebar/types'

function DashboardTopBarInner() {
  const { data: user } = useCurrentUser()
  const logoutMutation = useLogout()
  const searchQuery = useDashboardStore((state) => state.searchQuery)
  const setSearchQuery = useDashboardStore((state) => state.setSearchQuery)

  return (
    <header className="mb-5 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative flex w-full max-w-md items-center">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 size-4 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search your workspace"
          aria-label="Search your workspace"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 self-end rounded-xl px-2 py-1.5 text-left hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.displayName} width={32} height={32} className="size-8 rounded-full object-cover" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {getInitials(user?.displayName ?? '')}
            </span>
          )}
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-36 truncate text-xs font-semibold text-slate-800">{user?.displayName ?? 'Account'}</span>
            <span className="block max-w-36 truncate text-[11px] text-slate-400">{user?.email ?? ''}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <User className="size-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <Settings className="size-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={logoutMutation.isPending} onClick={() => logoutMutation.mutate()} className="text-red-600 focus:text-red-600">
            <LogOut className="size-4" /> {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export const DashboardTopBar = memo(DashboardTopBarInner)
DashboardTopBar.displayName = 'DashboardTopBar'
