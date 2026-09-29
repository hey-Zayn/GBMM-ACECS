import { api } from '@/lib/axios'

export type CurrentUser = {
  userId: string
  workspaceId: string
  email: string
  sessionId: string
  displayName: string
  avatarUrl: string | null
}

type CurrentUserResponse = {
  success: true
  data: { user: CurrentUser }
}

export async function getCurrentUser() {
  const response = await api.get<CurrentUserResponse>('/auth/me')
  return response.data.data.user
}

export function getGoogleLoginUrl() {
  return `${api.defaults.baseURL}/auth/google`
}
