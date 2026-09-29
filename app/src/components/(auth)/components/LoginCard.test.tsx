import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginCard } from './LoginCard'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

describe('LoginCard', () => {
  it('renders the login actions and form fields', () => {
    render(<LoginCard />)

    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login with Google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login with Apple/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login with Email/i })).toBeInTheDocument()
  })
})
