'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'
import { LoginDivider } from './LoginDivider'

type SignupCardProps = {
  displayName: string
  email: string
  otp: string
  hasRequestedOtp: boolean
  isRequesting: boolean
  isVerifying: boolean
  onDisplayNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onOtpChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onChangeEmail: () => void
}

export function SignupCard({
  displayName,
  email,
  otp,
  hasRequestedOtp,
  isRequesting,
  isVerifying,
  onDisplayNameChange,
  onEmailChange,
  onOtpChange,
  onSubmit,
  onChangeEmail,
}: SignupCardProps) {
  return (
    <div className="mx-auto my-auto flex w-full max-w-[340px] flex-col items-center text-center">
      <div className="mb-3.5 rounded-lg border border-slate-200/80 bg-white p-[2px] shadow-2xs">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-200/90 bg-[#F0F2F5] text-slate-600 shadow-2xs">
          <User className="h-5 w-5 stroke-[1.8]" />
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-1 text-xs font-normal text-slate-400">Start managing your campaigns with ACECS.</p>

      <div className="mt-6 w-full space-y-2.5">
        <GoogleLoginButton />
      </div>

      <LoginDivider />

      <form className="w-full space-y-2.5" onSubmit={onSubmit}>
        <input
          id="display-name-input"
          type="text"
          name="displayName"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder="Your name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          disabled={hasRequestedOtp}
          className="h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3.5 text-xs text-slate-900 shadow-2xs transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        />

        <input
          id="signup-email-input"
          type="email"
          name="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          required
          disabled={hasRequestedOtp}
          className="h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3.5 text-xs text-slate-900 shadow-2xs transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
        />

        {hasRequestedOtp && (
          <input
            id="signup-otp-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, ''))}
            placeholder="Six-digit code"
            autoComplete="one-time-code"
            required
            className="h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3.5 text-center text-sm tracking-[0.35em] text-slate-900 shadow-2xs transition-all placeholder:text-xs placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        )}

        <button
          type="submit"
          disabled={isRequesting || isVerifying}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-[#090A0E] px-4 text-xs font-medium text-white shadow-2xs transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRequesting ? 'Sending code...' : isVerifying ? 'Creating account...' : hasRequestedOtp ? 'Verify code' : 'Create account'}
        </button>

        {hasRequestedOtp && (
          <button
            type="button"
            onClick={onChangeEmail}
            className="text-xs text-slate-500 underline underline-offset-2"
          >
            Use different details
          </button>
        )}
      </form>

      <p className="mt-4 text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-slate-800 underline underline-offset-2">
          Log in
        </Link>
      </p>

      <p className="mt-3.5 text-center text-[10px] font-normal leading-normal text-slate-400">
        By continuing, you acknowledge{' '}
        <Link href="/privacy" className="text-slate-500 underline underline-offset-2 hover:text-slate-700">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
