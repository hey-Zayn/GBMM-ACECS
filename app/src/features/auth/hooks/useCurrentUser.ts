'use client'

import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../api/auth.api'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: getCurrentUser,
    retry: false,
  })
}
