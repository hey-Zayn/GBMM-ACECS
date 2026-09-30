"use client"

import { memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserProfile } from "./types"

type Props = {
  user: UserProfile
  isLoading: boolean
  isLoggingOut: boolean
  onLogout: () => void
}

function UserProfileViewInner({ user, isLoading, isLoggingOut, onLogout }: Props) {
  return (
    <div className="px-1 pb-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left",
            "transition-colors hover:bg-slate-200/60",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b79fd]/30",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1"
          )}
          aria-label="User menu"
        >
          {/* Avatar */}
          <div className="relative h-8 w-8 shrink-0">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b79fd] text-[11px] font-bold text-white ring-2 ring-white">
                {isLoading ? "…" : user.initials}
              </div>
            )}
          </div>

          {/* Name + email */}
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[12.5px] font-semibold leading-none text-slate-800">
              {user.displayName}
            </p>
            <p className="mt-0.5 truncate text-[10.5px] leading-none text-slate-400">
              {user.email}
            </p>
          </div>

          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 group-data-[collapsible=icon]:hidden" />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" sideOffset={6} className="w-[220px]">
          <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Account
          </div>
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<Link href="/dashboard/settings" />}
              className="gap-2.5 text-[12.5px]"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/dashboard/settings" />}
              className="gap-2.5 text-[12.5px]"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isLoggingOut}
            onClick={onLogout}
            className="gap-2.5 text-[12.5px] text-red-600 focus:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const UserProfileView = memo(UserProfileViewInner)
UserProfileView.displayName = "UserProfileView"
