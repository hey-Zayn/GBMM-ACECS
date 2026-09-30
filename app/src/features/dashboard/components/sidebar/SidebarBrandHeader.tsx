"use client"

import { memo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { PanelLeft } from "lucide-react"

import { SidebarHeader, useSidebar } from "@/components/ui/sidebar"

function SidebarBrandHeaderInner() {
  const { toggleSidebar } = useSidebar()

  const handleToggle = useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  return (
    <SidebarHeader className="p-1 pb-0">
      <div className="flex items-center justify-between">

        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          aria-label="ACECS dashboard"
        >

          <Image
            src="/images/logo.svg"
            alt="ACECS"
            width={36}
            height={36}
            priority
            className="h-9 w-9 shrink-0 rounded-[10px]"
          />

          <span className="flex flex-col group-data-[collapsible=icon]:hidden ">
            <span className="text-[15px] font-bold leading-none tracking-tight text-slate-900">
              ACECS
            </span>
            <span className="mt-1 text-[9.5px] font-semibold leading-none tracking-[0.16em] text-slate-400 uppercase">
              EMAIL CAMPAIGN
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={handleToggle}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 group-data-[collapsible=icon]:hidden"
          aria-label="Collapse sidebar"
        >
          <PanelLeft aria-hidden="true" className="h-4 w-4 stroke-[1.8]" />
        </button>
      </div>
    </SidebarHeader>
  )
}

export const SidebarBrandHeader = memo(SidebarBrandHeaderInner)
SidebarBrandHeader.displayName = "SidebarBrandHeader"
