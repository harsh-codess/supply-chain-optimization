import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'mint' | 'red' | 'blue' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  pulse?: boolean
  children: ReactNode
  className?: string
}

export function Badge({
  variant = 'muted',
  pulse = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span className={cn(`badge badge-${variant}`, className)}>
      {pulse && (
        <span
          className={cn(
            'h-1.5 w-1.5 animate-dot-blink rounded-full',
            variant === 'mint' && 'bg-cb-mint',
            variant === 'red' && 'bg-cb-red',
            variant === 'blue' && 'bg-cb-blue',
            variant === 'muted' && 'bg-cb-text-2',
          )}
        />
      )}
      {children}
    </span>
  )
}