'use client'

import { useQuery } from '@tanstack/react-query'
import { getMailboxes } from '../api/mailboxes.api'

export const MAILBOXES_QUERY_KEY = ['mailboxes'] as const

export function useMailboxes() {
  return useQuery({
    queryKey: MAILBOXES_QUERY_KEY,
    queryFn: getMailboxes,
    retry: false,
  })
}
