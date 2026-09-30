import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { LoginCard } from './LoginCard'

vi.mock('@/features/auth/components/GoogleLoginButton', () => ({
  GoogleLoginButton: () => <button type="button">Login with Google</button>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

describe('LoginCard', () => {
  it('renders the login actions and form fields', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <LoginCard />
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login with Google/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send sign-in code/i })).toBeInTheDocument()
  })
})
