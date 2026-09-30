'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { ApiError } from '@/lib/axios'
import { AppLogo } from '@/components/custom/AppLogo'

function DashboardLoading() {
  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className=" flex flex-col items-center justify-center gap-2 animate-pulse rounded-3xl bg-[#F2F3F7]" >
          <AppLogo />
        </div>
      </main>
    </>
  )
}

function DashboardError({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </main>
  )
}

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const isUnauthorized =
    currentUser.error instanceof ApiError && currentUser.error.statusCode === 401
  const isApiUnavailable =
    currentUser.error instanceof ApiError &&
    (currentUser.error.code === 'NETWORK_ERROR' || currentUser.error.statusCode >= 500)

  useEffect(() => {
    if (isUnauthorized) {
      router.replace('/login')
    }
  }, [isUnauthorized, router])

  if (currentUser.isLoading || isUnauthorized) {
    return <DashboardLoading />
  }

  if (currentUser.isError || !currentUser.data) {
    return (
      <DashboardError
        title={isApiUnavailable ? 'API server unavailable' : 'Dashboard unavailable'}
        message={
          isApiUnavailable
            ? 'Start the API server, then try again.'
            : 'We could not verify your session. Please try again.'
        }
        onRetry={() => void currentUser.refetch()}
      />
    )
  }

  return <>{children}</>
}
