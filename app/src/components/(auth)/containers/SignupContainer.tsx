'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useSignupOtp } from '@/features/auth/hooks/useSignupOtp'
import { AuthFooter } from '../components/AuthFooter'
import { AuthHeader } from '../components/AuthHeader'
import { AuthLoading } from '../components/AuthLoading'
import { LoginImageCard } from '../components/LoginImageCard'
import { SignupCard } from '../components/SignupCard'

export function SignupContainer() {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const { requestOtp, verifyOtp, isRequesting, isVerifying } = useSignupOtp()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false)

  useEffect(() => {
    if (currentUser.data) {
      router.replace('/dashboard')
    }
  }, [currentUser.data, router])

  if (currentUser.isLoading) {
    return (
      <div className="flex min-h-[620px] w-full items-center justify-center">
        <AuthLoading />
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      if (!hasRequestedOtp) {
        await requestOtp({ displayName, email })
        setHasRequestedOtp(true)
        toast.add({
          title: 'Verification code sent',
          description: 'Check your email to finish creating your account.',
          type: 'success',
        })
        return
      }

      await verifyOtp({ email, otp })
      router.replace('/dashboard')
    } catch (error) {
      const isExistingAccount = error instanceof ApiError && error.statusCode === 409
      toast.add({
        title: isExistingAccount ? 'Account already exists' : 'Signup failed',
        description: isExistingAccount ? 'Please log in instead.' : 'Please try again in a moment.',
        type: 'error',
      })
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-md bg-white p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] sm:p-4 lg:p-5">
      <div className="grid min-h-[620px] grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col justify-between p-4">
          <AuthHeader />
          <SignupCard
            displayName={displayName}
            email={email}
            otp={otp}
            hasRequestedOtp={hasRequestedOtp}
            isRequesting={isRequesting}
            isVerifying={isVerifying}
            onDisplayNameChange={setDisplayName}
            onEmailChange={setEmail}
            onOtpChange={setOtp}
            onSubmit={handleSubmit}
            onChangeEmail={() => { setHasRequestedOtp(false); setOtp('') }}
          />
          <AuthFooter />
        </div>
        <LoginImageCard />
      </div>
    </div>
  )
}
