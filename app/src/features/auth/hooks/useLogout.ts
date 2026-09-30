'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { logout } from '../api/auth.api'
import { toast } from '@/components/ui/toast'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ['auth', 'current-user'] })
      queryClient.removeQueries({ queryKey: ['auth', 'current-user'] })
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
}
