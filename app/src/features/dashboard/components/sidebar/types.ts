export type Workspace = {
  id: string
  name: string
  plan: string
}

export type UserProfile = {
  displayName: string
  email: string
  avatarUrl: string | null
  initials: string
}

export function getInitials(displayName: string): string {
  return displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
