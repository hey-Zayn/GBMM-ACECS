'use client'

import { FormEvent, memo, useState } from 'react'
import { Building2, Check, ChevronDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { WorkspaceSummary } from '@/features/workspaces/types'
import type { Workspace } from './types'

type WorkspaceSwitcherProps = {
  workspace: Workspace | null
  workspaces: WorkspaceSummary[]
  isLoading: boolean
  isSwitching: boolean
  isCreating: boolean
  onSwitchWorkspace: (workspaceId: string) => Promise<unknown>
  onCreateWorkspace: (name: string) => Promise<unknown>
}

function WorkspaceSwitcherInner({
  workspace,
  workspaces,
  isLoading,
  isSwitching,
  isCreating,
  onSwitchWorkspace,
  onCreateWorkspace,
}: WorkspaceSwitcherProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [validationError, setValidationError] = useState('')

  if (!workspace && !isLoading) {
    return null
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = workspaceName.trim()
    if (normalizedName.length < 2 || normalizedName.length > 80) {
      setValidationError('Use a workspace name between 2 and 80 characters.')
      return
    }

    setValidationError('')
    await onCreateWorkspace(normalizedName)
    setWorkspaceName('')
    setIsCreateOpen(false)
  }

  return (
    <div className="px-1 pt-2 pb-1 group-data-[collapsible=icon]:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isLoading || isSwitching}
          className="flex w-full items-center gap-2.5 rounded-md border border-slate-200/70 bg-gray-100 px-3 py-2 text-left shadow-2xs transition hover:bg-slate-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
          aria-label="Select workspace"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#3b79fd]/20 bg-[#3b79fd]/10">
            <Building2 aria-hidden="true" className="h-3.5 w-3.5 text-[#3b79fd]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold leading-none text-slate-800">
              {workspace?.name ?? 'Loading workspace'}
            </p>
            <p className="mt-0.5 truncate text-[10.5px] leading-none text-slate-400">
              {workspace ? formatRole(workspace.role) : 'Loading'}
            </p>
          </div>
          <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-slate-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Your workspaces</p>
          {workspaces.map((item) => (
            <DropdownMenuItem
              key={item.id}
              disabled={isSwitching || item.id === workspace?.id}
              onClick={() => void onSwitchWorkspace(item.id)}
              className="gap-2"
            >
              <Building2 aria-hidden="true" className="size-4 text-slate-400" />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              {item.id === workspace?.id && <Check aria-label="Current workspace" className="size-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)} className="gap-2 text-primary">
            <Plus aria-hidden="true" className="size-4" />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>Create a separate workspace for another team, client, or project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="workspace-name" className="text-sm font-medium text-foreground">Workspace name</label>
              <Input
                id="workspace-name"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="e.g. Acme Outreach"
                maxLength={80}
                autoFocus
                aria-invalid={Boolean(validationError)}
                className="mt-2 h-9"
              />
              {validationError && <p className="mt-1 text-xs text-destructive">{validationError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create workspace'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatRole(role: Workspace['role']) {
  return role === 'OWNER' ? 'Owner' : 'Member'
}

export const WorkspaceSwitcher = memo(WorkspaceSwitcherInner)
WorkspaceSwitcher.displayName = 'WorkspaceSwitcher'
