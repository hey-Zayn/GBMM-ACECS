import { Button } from '@/components/ui/button'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AppButtonProps = Omit<ComponentProps<typeof Button>, 'variant'> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost'
  isLoading?: boolean
  fullWidth?: boolean
}

const variantClasses = {
  primary: 'bg-[#3B79FD] text-white hover:bg-[#4D7DFD]',
  secondary: 'bg-[#F2F3F7] text-[#030507] hover:bg-[#E0E2E6]',
  dark: 'bg-[#030507] text-white hover:bg-[#1B1D21]',
  ghost: 'text-slate-700 hover:bg-[#F2F3F7]',
}

function AppButton({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      className={cn(
        'h-12 rounded-xl px-5 font-semibold focus-visible:ring-[#4D7DFD]',
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </Button>
  )
}

export default AppButton
