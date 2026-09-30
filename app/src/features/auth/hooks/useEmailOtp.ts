'use client'

import { useMutation } from '@tanstack/react-query'
import { requestEmailOtp, verifyEmailOtp } from '../api/auth.api'

export function useEmailOtp() {
  const requestMutation = useMutation({ mutationFn: requestEmailOtp })
  const verifyMutation = useMutation({ mutationFn: verifyEmailOtp })

  return {
    requestOtp: requestMutation.mutateAsync,
    verifyOtp: verifyMutation.mutateAsync,
    isRequesting: requestMutation.isPending,
    isVerifying: verifyMutation.isPending,
    requestError: requestMutation.error,
    verifyError: verifyMutation.error,
  }
}
