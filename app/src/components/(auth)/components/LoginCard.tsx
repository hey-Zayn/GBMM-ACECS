'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'
import { AppleLoginButton } from './AppleLoginButton'
import { LoginDivider } from './LoginDivider'

export function LoginCard() {
  const [email, setEmail] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    // Email passwordless or credentials login handler
  }

  return (
    <div className="mx-auto my-auto flex w-full max-w-[340px] flex-col items-center text-center">
      {/* User avatar icon badge */}
      <div className="mb-3.5 rounded-lg border border-slate-200/80 bg-white p-[3px] shadow-2xs">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200/90 bg-[#F0F2F5] text-slate-600 shadow-2xs">
          <User className="h-5 w-5 stroke-[1.8]" />
        </div>
      </div>

      {/* Header title & subtitle */}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back!</h1>
      <p className="mt-1 text-xs text-slate-400 font-normal">
        Sign in to continue where your left off.
      </p>

      {/* Social login buttons */}
      <div className="mt-6 w-full space-y-2.5">
        
        <GoogleLoginButton />
        {/* <AppleLoginButton disabled={true}/> */}
      </div>

      {/* Or divider */}
      <LoginDivider />

      {/* Email login form */}
      <form className="w-full space-y-2.5" onSubmit={handleSubmit}>
        <input
          id="email-input"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          autoComplete="email"
          required
          className="h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
       
          <button
            type="submit"
            className="flex h-10 w-full items-center justify-center rounded-lg bg-[#090A0E] px-4 text-xs font-medium text-white shadow-2xs hover:bg-black transition-all cursor-pointer"
          >
            Login with Email
          </button>
        
      </form>

      {/* Privacy Policy disclaimer */}
      <p className="mt-3.5 text-center text-[10px] text-slate-400 font-normal leading-normal">
        By continuing, you acknowledge{' '}
        <Link href="/privacy" className="text-slate-500 hover:text-slate-700 underline underline-offset-2">
          AgentOS Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
