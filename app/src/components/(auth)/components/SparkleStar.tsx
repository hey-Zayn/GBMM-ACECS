import type { SVGProps } from 'react'

export function SparkleStar({ className = 'w-4 h-4 fill-white', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} {...props}>
      <path d="M 50 12 C 52 33, 67 48, 88 50 C 67 52, 52 67, 50 88 C 48 67, 33 52, 12 50 C 33 48, 48 33, 50 12 Z" />
    </svg>
  )
}
