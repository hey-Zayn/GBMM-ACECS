'use client'

import { createContext, createElement, useCallback, useContext } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import {
  getCurrentUser,
  getGoogleLoginUrl,
  logout,
  requestEmailOtp,
  requestSignupOtp,
  verifyEmailOtp,
  verifySignupOtp,
  type CurrentUser,
  type EmailOtpRequest,
  type EmailOtpVerification,
  type SignupOtpRequest,
} from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { toast } from '@/components/ui/toast'

const CURRENT_USER_QUERY_KEY = ['auth', 'current-user'] as const

function useAuthInternal() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const isGoogleRedirecting = useAuthStore((state) => state.isGoogleRedirecting)
  const setGoogleRedirecting = useAuthStore((state) => state.setGoogleRedirecting)

  const currentUser = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
  })
  const emailRequest = useMutation({ mutationFn: requestEmailOtp })
  const emailVerification = useMutation({
    mutationFn: verifyEmailOtp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY }),
  })
  const signupRequest = useMutation({ mutationFn: requestSignupOtp })
  const signupVerification = useMutation({
    mutationFn: verifySignupOtp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY }),
  })
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: CURRENT_USER_QUERY_KEY })
      queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
      router.replace('/login')
    },
    onError: () => {
      toast.add({
        title: 'Unable to sign out',
        description: 'Please try again.',
        type: 'error',
      })
    },
  })

  const loginWithGoogle = useCallback(() => {
    setGoogleRedirecting(true)
    window.location.assign(getGoogleLoginUrl())
  }, [setGoogleRedirecting])

  return {
    user: currentUser.data ?? null,
    isLoading: currentUser.isLoading,
    isError: currentUser.isError,
    error: currentUser.error,
    refetchUser: currentUser.refetch,
    requestEmailOtp: (payload: EmailOtpRequest) => emailRequest.mutateAsync(payload),
    verifyEmailOtp: (payload: EmailOtpVerification) => emailVerification.mutateAsync(payload),
    requestSignupOtp: (payload: SignupOtpRequest) => signupRequest.mutateAsync(payload),
    verifySignupOtp: (payload: EmailOtpVerification) => signupVerification.mutateAsync(payload),
    logout: () => logoutMutation.mutate(),
    loginWithGoogle,
    isGoogleRedirecting,
    isRequestingEmailOtp: emailRequest.isPending,
    isVerifyingEmailOtp: emailVerification.isPending,
    isRequestingSignupOtp: signupRequest.isPending,
    isVerifyingSignupOtp: signupVerification.isPending,
    isLoggingOut: logoutMutation.isPending,
  } satisfies AuthFacade
}

export type AuthFacade = {
  user: CurrentUser | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetchUser: () => unknown
  requestEmailOtp: (payload: EmailOtpRequest) => Promise<unknown>
  verifyEmailOtp: (payload: EmailOtpVerification) => Promise<unknown>
  requestSignupOtp: (payload: SignupOtpRequest) => Promise<unknown>
  verifySignupOtp: (payload: EmailOtpVerification) => Promise<unknown>
  logout: () => void
  loginWithGoogle: () => void
  isGoogleRedirecting: boolean
  isRequestingEmailOtp: boolean
  isVerifyingEmailOtp: boolean
  isRequestingSignupOtp: boolean
  isVerifyingSignupOtp: boolean
  isLoggingOut: boolean
}

const AuthContext = createContext<AuthFacade | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthInternal()
  return createElement(AuthContext.Provider, { value: auth }, children)
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return auth
}
