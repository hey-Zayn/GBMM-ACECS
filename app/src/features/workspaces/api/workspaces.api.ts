import { api } from '@/lib/axios'
import type { WorkspaceSummary, WorkspacesResponse } from '../types'

type WorkspacesApiResponse = {
  success: true
  data: WorkspacesResponse
}

type WorkspaceApiResponse = {
  success: true
  data: { workspace: WorkspaceSummary }
}

export async function getWorkspaces() {
  const response = await api.get<WorkspacesApiResponse>('/workspaces')
  return response.data.data
}

export async function createWorkspace(name: string) {
  const response = await api.post<WorkspaceApiResponse>('/workspaces', { name })
  return response.data.data.workspace
}

export async function switchWorkspace(workspaceId: string) {
  const response = await api.post<WorkspaceApiResponse>(`/workspaces/${workspaceId}/switch`)
  return response.data.data.workspace
}
