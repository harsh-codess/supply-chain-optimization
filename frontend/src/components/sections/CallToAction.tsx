import { type RefObject } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { Button } from '../ui/Button'

interface CallToActionProps {
	onLaunchDashboard: () => void
	onReadDocs: () => void
}

export function CallToAction({
	onLaunchDashboard,
	onReadDocs,
}: CallToActionProps) {
	const ref1 = useReveal()
	const ref2 = useReveal()
	const ref3 = useReveal()

	return (
		<section
			id="entry"
			style={{
				position: 'relative',
				zIndex: 10,
				background: 'var(--cb-surface)',
				borderTop: '1px solid var(--cb-border)',
				padding: '128px 0',
				textAlign: 'center',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: '600px',
					height: '600px',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(5,245,167,0.04) 0%, transparent 70%)',
					pointerEvents: 'none',
				}}
			/>

			<div className="page-container" style={{ position: 'relative' }}>
				<p
					ref={ref1 as RefObject<HTMLParagraphElement>}
					className="font-mono reveal"
					style={{
						fontSize: '11px',
						letterSpacing: '0.25em',
						color: 'var(--cb-mint)',
						marginBottom: '32px',
					}}
				>
					LIVE OPERATOR ACCESS
				</p>

				<h2
					ref={ref2 as RefObject<HTMLHeadingElement>}
					className="font-display reveal"
					style={{
						fontSize: 'clamp(56px, 8vw, 112px)',
						letterSpacing: '-0.04em',
						lineHeight: 0.95,
						marginBottom: '56px',
						transitionDelay: '0.1s',
					}}
				>
					<span style={{ color: 'var(--cb-text)' }}>READY TO</span>
					<br />
					<span style={{ WebkitTextStroke: '1.5px var(--cb-text)', color: 'transparent' }}>
						TAKE CONTROL
					</span>
					<span style={{ color: 'var(--cb-mint)' }}>?</span>
				</h2>

				<div
					ref={ref3 as RefObject<HTMLDivElement>}
					className="reveal"
					style={{
						display: 'flex',
						justifyContent: 'center',
						gap: '12px',
						flexWrap: 'wrap',
						marginBottom: '48px',
						transitionDelay: '0.2s',
					}}
				>
						<Button size="lg" className="animate-glow-pulse" onClick={onLaunchDashboard}>
						LAUNCH DASHBOARD
					</Button>
						<Button size="lg" variant="ghost" onClick={onReadDocs}>
						READ DOCS
					</Button>
				</div>

				<p
					className="font-mono"
					style={{
						fontSize: '11px',
						letterSpacing: '0.1em',
						color: 'var(--cb-text-3)',
					}}
				>
					FastAPI :8000
					<span className="dot-sep" />
					React + Vite :5173
					<span className="dot-sep" />
					Gemini 2.5 Flash
					<span className="dot-sep" />
					NetworkX
				</p>
			</div>
		</section>
	)
}
