'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { toast } from '@/components/ui/toast'
import { MAILBOXES_QUERY_KEY } from '@/features/mailboxes/hooks/useMailboxes'
import { createWorkspace, switchWorkspace } from '../api/workspaces.api'
import { WORKSPACES_QUERY_KEY } from './useWorkspaces'
import type { WorkspaceSummary } from '../types'

const CURRENT_USER_QUERY_KEY = ['auth', 'current-user'] as const

export function useWorkspaceActions() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const updateActiveWorkspace = (workspace: WorkspaceSummary) => {
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, (currentUser: { workspaceId: string; workspaceName: string; workspaceRole: WorkspaceSummary['role'] } | undefined) => {
      if (!currentUser) return currentUser
      return {
        ...currentUser,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceRole: workspace.role,
      }
    })
    queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: MAILBOXES_QUERY_KEY })
    router.replace('/dashboard')
  }

  const switchMutation = useMutation({
    mutationFn: switchWorkspace,
    onSuccess: updateActiveWorkspace,
    onError: () => toast.add({ title: 'Unable to switch workspace', description: 'Please try again.', type: 'error' }),
  })

  const createMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: (workspace) => {
      updateActiveWorkspace(workspace)
      toast.add({ title: 'Workspace created', description: `${workspace.name} is now active.`, type: 'success' })
    },
    onError: () => toast.add({ title: 'Unable to create workspace', description: 'Please check the name and try again.', type: 'error' }),
  })

  return {
    switchWorkspace: (workspaceId: string) => switchMutation.mutateAsync(workspaceId),
    createWorkspace: (name: string) => createMutation.mutateAsync(name),
    isSwitching: switchMutation.isPending,
    isCreating: createMutation.isPending,
  }
}
