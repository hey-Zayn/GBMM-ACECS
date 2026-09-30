'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function AuthHeader() {
  const pathname = usePathname()
  const isSignup = pathname?.startsWith('/signup')

  return (
    <header className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Image src="./images/logo.svg" alt="logo" width={50} height={50} />

        <div className="flex flex-col">
          <span className="text-[15px] font-semibold tracking-tight text-slate-900 leading-none">ACECS</span>
          <span className="text-[8.5px] font-semibold tracking-[0.22em] text-slate-500 uppercase leading-none mt-1">Campaign System</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className="text-xs font-normal text-slate-500">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
        </span>

        <div className="group inline-flex rounded-md border border-slate-200/80 bg-white p-[2px] shadow-2xs hover:border-slate-300">
          <Link
            href={isSignup ? '/login' : '/signup'}
            className="inline-flex items-center justify-center rounded-sm border border-slate-200/90 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs group-hover:bg-slate-50 group-hover:border-slate-200 transition-all"
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </div>
      </div>
    </header>
  )
}
