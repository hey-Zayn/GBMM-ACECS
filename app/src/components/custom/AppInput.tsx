import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type AppInputProps = ComponentProps<typeof Input> & {
  label: string
  error?: string
}

export function AppInput({ id, label, error, className, ...props }: AppInputProps) {
  const errorId = error && id ? `${id}-error` : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(error && 'border-red-500 focus-visible:border-red-500', className)}
        {...props}
      />
      {error && <p id={errorId} className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
