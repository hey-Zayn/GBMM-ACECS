"use client"

import { memo } from "react"
import Link from "next/link"
import { Zap } from "lucide-react"

function UpgradeCardInner() {
  return (
    <>
      <div className=" rounded-lg border border-slate-300/80 bg-transparent p-[2px] shadow-2xs ">
        <div className="group-data-[collapsible=icon]:hidden  overflow-hidden rounded-md border border-[#3b79fd]/20 bg-gradient-to-br from-[#3b79fd]/8 via-white to-[#98b5fd]/10 p-3.5 shadow-2xs">
          <div className="mb-1.5 flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3b79fd]">
              <Zap className="h-3.5 w-3.5 fill-white stroke-white" />
            </div>
            <p className="pt-0.5 text-[12.5px] font-semibold leading-none text-slate-800">
              Upgrade to Pro Plan
            </p>
          </div>
          <p className="mb-3 text-[11.5px] leading-snug text-slate-500">
            Pro offers quicker workflows and increased limits.
          </p>
          <Link
            href="/dashboard/settings"
            className="flex w-full items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white transition-all hover:bg-slate-700 active:scale-[0.98]"
          >
            Manage plan
          </Link>
        </div>
      </div>
    </>
  )
}

export const UpgradeCard = memo(UpgradeCardInner)
UpgradeCard.displayName = "UpgradeCard"
