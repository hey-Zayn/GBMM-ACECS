'use client'

import { useMutation } from '@tanstack/react-query'
import { requestSignupOtp, verifySignupOtp } from '../api/auth.api'

export function useSignupOtp() {
  const requestMutation = useMutation({ mutationFn: requestSignupOtp })
  const verifyMutation = useMutation({ mutationFn: verifySignupOtp })

  return {
    requestOtp: requestMutation.mutateAsync,
    verifyOtp: verifyMutation.mutateAsync,
    isRequesting: requestMutation.isPending,
    isVerifying: verifyMutation.isPending,
  }
}
