'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toast'
import { disconnectMailbox, testMailbox } from '../api/mailboxes.api'
import { MAILBOXES_QUERY_KEY } from './useMailboxes'

export function useMailboxActions() {
  const queryClient = useQueryClient()

  const testMutation = useMutation({
    mutationFn: testMailbox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAILBOXES_QUERY_KEY })
      toast.add({ title: 'Mailbox verified', description: 'This mailbox is ready to send.', type: 'success' })
    },
    onError: () => toast.add({ title: 'Verification failed', description: 'Try again or use a different connection method.', type: 'error' }),
  })

  const disconnectMutation = useMutation({
    mutationFn: disconnectMailbox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAILBOXES_QUERY_KEY })
      toast.add({ title: 'Mailbox disconnected', description: 'This mailbox will no longer be available for sending.', type: 'success' })
    },
    onError: () => toast.add({ title: 'Unable to disconnect mailbox', description: 'Please try again.', type: 'error' }),
  })

  return {
    testMailbox: testMutation.mutate,
    disconnectMailbox: disconnectMutation.mutate,
    testingMailboxId: testMutation.isPending ? testMutation.variables : null,
    disconnectingMailboxId: disconnectMutation.isPending ? disconnectMutation.variables : null,
  }
}
