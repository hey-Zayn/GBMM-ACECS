"use client"

import Link from "next/link"
import { LogOut, Settings, User } from "lucide-react"

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type ProfileMenuItemsProps = {
  isLoggingOut: boolean
  onLogout: () => void
}

export function ProfileMenuItems({ isLoggingOut, onLogout }: ProfileMenuItemsProps) {
  return (
    <>
      <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
        <User className="size-4" /> Profile
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
        <Settings className="size-4" /> Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={isLoggingOut}
        onClick={onLogout}
        className="text-red-600 focus:text-red-600"
      >
        <LogOut className="size-4" />
        {isLoggingOut ? "Signing out..." : "Sign out"}
      </DropdownMenuItem>
    </>
  )
}
