export type WorkspaceRole = 'OWNER' | 'MEMBER'

export type WorkspaceSummary = {
  id: string
  name: string
  role: WorkspaceRole
}

export type WorkspacesResponse = {
  currentWorkspaceId: string
  workspaces: WorkspaceSummary[]
}
