import { LoginContainer } from '@/components/(auth)/containers/LoginContainer'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-200 p-4">
      <LoginContainer />
    </main>
  )
}
