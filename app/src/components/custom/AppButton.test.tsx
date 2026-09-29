import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AppButton from './AppButton'

describe('AppButton', () => {
  it('renders a disabled loading state', () => {
    render(<AppButton isLoading>Continue with Google</AppButton>)

    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled()
  })

  it('renders a full-width dark button', () => {
    render(<AppButton variant="dark" fullWidth>Continue with Google</AppButton>)

    expect(screen.getByRole('button', { name: 'Continue with Google' })).toHaveClass('w-full')
  })
})
