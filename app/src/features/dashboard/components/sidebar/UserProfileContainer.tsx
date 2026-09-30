"use client"

import { useMemo } from "react"

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { UserProfileView } from "./UserProfileView"
import { getInitials } from "./types"
import type { UserProfile } from "./types"

const LOADING_PROFILE: UserProfile = {
  displayName: "Loading…",
  email: "",
  avatarUrl: null,
  initials: "…",
}

export function UserProfileContainer() {
  const { data: user, isLoading } = useCurrentUser()
  const logoutMutation = useLogout()

  const profile = useMemo<UserProfile>(() => {
    if (!user) return LOADING_PROFILE
    return {
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      initials: getInitials(user.displayName),
    }
  }, [user])

  return (
    <UserProfileView
      user={profile}
      isLoading={isLoading}
      isLoggingOut={logoutMutation.isPending}
      onLogout={() => logoutMutation.mutate()}
    />
  )
}
