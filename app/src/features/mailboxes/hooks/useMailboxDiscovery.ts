'use client'

import { useMutation } from '@tanstack/react-query'
import { discoverMailbox } from '../api/mailboxes.api'

export function useMailboxDiscovery() {
  return useMutation({
    mutationFn: discoverMailbox,
    retry: false,
  })
}
