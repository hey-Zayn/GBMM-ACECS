'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { AuthLoading } from '../components/AuthLoading'
import { AuthHeader } from '../components/AuthHeader'
import { AuthFooter } from '../components/AuthFooter'
import { LoginCard } from '../components/LoginCard'
import { LoginImageCard } from '../components/LoginImageCard'
// import { LoginHeroCard } from '../components/LoginHeroCard'

export function LoginContainer() {
  const router = useRouter()
  const currentUser = useCurrentUser()

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

  return (
    <div className="w-full overflow-hidden rounded-md bg-white p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] sm:p-4 lg:p-5">
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-6 min-h-[620px]">
        {/* Left Column: Top bar, form, footer */}
        <div className="flex flex-col  justify-between p-4">
          <AuthHeader />
          <LoginCard />
          <AuthFooter />
        </div>

        {/* Right Column: Hero showcase card */}
        {/* <LoginHeroCard /> */}
        <LoginImageCard />
      </div>
    </div>
  )
}
