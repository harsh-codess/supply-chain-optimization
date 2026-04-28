import {
	forwardRef,
	type ButtonHTMLAttributes,
	type ReactNode,
} from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'ghost' | 'danger'
	size?: 'sm' | 'md' | 'lg'
	children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ variant = 'primary', size = 'md', children, className, ...props },
		ref,
	) => {
		const sizes = {
			sm: 'px-5 py-2.5 text-[11px]',
			md: 'px-7 py-3.5 text-[12px]',
			lg: 'px-10 py-5 text-[13px]',
		}

		const variants = {
			primary: 'btn-primary',
			ghost: 'btn-ghost',
			danger: 'bg-cb-red text-cb-text hover:brightness-110',
		}

		return (
			<button
				ref={ref}
				className={cn('btn', variants[variant], sizes[size], className)}
				{...props}
			>
				{children}
			</button>
		)
	},
)

Button.displayName = 'Button'
