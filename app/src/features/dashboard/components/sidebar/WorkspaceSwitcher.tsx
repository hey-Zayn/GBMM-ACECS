"use client"

import { memo } from "react"
import { Building2 } from "lucide-react"

import type { Workspace } from "./types"

function WorkspaceSwitcherInner({ workspace }: { workspace: Workspace | null }) {
  if (!workspace) {
    return null
  }

  return (
    <div className="flex px-1 pt-2 pb-1 group-data-[collapsible=icon]:hidden">
      <div className="flex w-full items-center gap-2.5 rounded-md border border-slate-200/70 bg-gray-100 px-3 py-2 shadow-2xs">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#3b79fd]/20 bg-[#3b79fd]/10">
          <Building2 aria-hidden="true" className="h-3.5 w-3.5 text-[#3b79fd]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold leading-none text-slate-800">
            {workspace.name}
          </p>
          <p className="mt-0.5 truncate text-[10.5px] leading-none text-slate-400">
            ID: {workspace.id}
          </p>
        </div>
      </div>
    </div>
  )
}

export const WorkspaceSwitcher = memo(WorkspaceSwitcherInner)
WorkspaceSwitcher.displayName = "WorkspaceSwitcher"
