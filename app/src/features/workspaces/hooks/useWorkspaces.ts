'use client'

import { useQuery } from '@tanstack/react-query'
import { getWorkspaces } from '../api/workspaces.api'

export const WORKSPACES_QUERY_KEY = ['workspaces'] as const

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_QUERY_KEY,
    queryFn: getWorkspaces,
    retry: false,
  })
}
