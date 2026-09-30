import { SignupContainer } from '@/components/(auth)/containers/SignupContainer'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-200 p-4">
      <SignupContainer />
    </main>
  )
}
