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

export async function logout() {
  await api.post('/auth/logout')
}

export function getGoogleLoginUrl() {
  return `${api.defaults.baseURL}/auth/google`
}

export type EmailOtpRequest = { email: string }
export type EmailOtpVerification = EmailOtpRequest & { otp: string }
export type SignupOtpRequest = EmailOtpRequest & { displayName: string }

export async function requestEmailOtp(payload: EmailOtpRequest) {
  await api.post('/auth/email/request-otp', payload)
}

export async function verifyEmailOtp(payload: EmailOtpVerification) {
  const response = await api.post<{ success: true }>('/auth/email/verify-otp', payload)
  return response.data
}

export async function requestSignupOtp(payload: SignupOtpRequest) {
  await api.post('/auth/signup/request-otp', payload)
}

export async function verifySignupOtp(payload: EmailOtpVerification) {
  const response = await api.post<{ success: true }>('/auth/signup/verify-otp', payload)
  return response.data
}
