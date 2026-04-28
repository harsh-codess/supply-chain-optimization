import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

const NAV_LINKS = [
	{ label: 'OVERVIEW', href: '#overview' },
	{ label: 'NETWORK', href: '#network' },
	{ label: 'RISK', href: '#risk' },
	{ label: 'ENTRY', href: '#entry' },
]

export function Navbar() {
	const [scrolled, setScrolled] = useState(false)
	const [active, setActive] = useState(NAV_LINKS[0].href)

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 40)
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	useEffect(() => {
		const sections = NAV_LINKS.map((link) =>
			document.querySelector<HTMLElement>(link.href),
		).filter((section): section is HTMLElement => Boolean(section))

		if (!sections.length) {
			return
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActive(`#${entry.target.id}`)
					}
				})
			},
			{
				rootMargin: '-45% 0px -45% 0px',
				threshold: 0,
			},
		)

		sections.forEach((section) => observer.observe(section))
		return () => observer.disconnect()
	}, [])

	const scrollTo = (href: string) => {
		const id = href.replace('#', '')
		const element = document.getElementById(id)
		if (!element) {
			return
		}

		setActive(href)
		element.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	return (
		<header
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				zIndex: 100,
				transition: 'background 0.4s ease, border-color 0.4s ease',
				background: scrolled ? 'rgba(6,8,13,0.88)' : 'transparent',
				borderBottom: `1px solid ${scrolled ? 'var(--cb-border)' : 'transparent'}`,
				backdropFilter: scrolled ? 'blur(12px)' : 'none',
				WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
			}}
		>
			<div
				className="page-container"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					height: '64px',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<rect
							x="2"
							y="8"
							width="8"
							height="5"
							rx="2"
							stroke="var(--cb-mint)"
							strokeWidth="1.5"
						/>
						<rect
							x="14"
							y="11"
							width="8"
							height="5"
							rx="2"
							stroke="var(--cb-mint)"
							strokeWidth="1.5"
						/>
						<line
							x1="10"
							y1="10.5"
							x2="14"
							y2="13.5"
							stroke="var(--cb-red)"
							strokeWidth="1.5"
							strokeDasharray="2 2"
						/>
					</svg>
					<span
						className="font-mono text-cb-text"
						style={{ fontSize: '12px', letterSpacing: '0.2em', fontWeight: 500 }}
					>
						CHAIN:BREAK
					</span>
				</div>

				<nav className="hide-mobile" style={{ display: 'flex', gap: '32px' }}>
					{NAV_LINKS.map((link) => (
						<button
							key={link.href}
							onClick={() => scrollTo(link.href)}
							className="font-mono"
							style={{
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								fontSize: '12px',
								letterSpacing: '0.15em',
								color: active === link.href ? 'var(--cb-mint)' : 'var(--cb-text-2)',
								padding: '4px 0',
								borderBottom:
									active === link.href
										? '1px solid var(--cb-mint)'
										: '1px solid transparent',
								transition: 'color 0.2s ease, border-color 0.2s ease',
							}}
						>
							{link.label}
						</button>
					))}
				</nav>

				<Button size="sm" onClick={() => scrollTo('#entry')}>
					REQUEST ACCESS
				</Button>
			</div>
		</header>
	)
}
