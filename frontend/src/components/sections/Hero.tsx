import { Suspense, lazy, type RefObject } from 'react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { DataCard } from '../ui/DataCard'
import { useReveal } from '../../hooks/useReveal'

const GlobeScene = lazy(() =>
	import('../three/GlobeScene').then((m) => ({ default: m.GlobeScene })),
)

interface HeroProps {
	onLaunchDashboard: () => void
}

export function Hero({ onLaunchDashboard }: HeroProps) {
	const ref1 = useReveal()
	const ref2 = useReveal()
	const ref3 = useReveal()
	const ref4 = useReveal()

	const scrollToNetwork = () => {
		const target = document.getElementById('network')
		if (!target) {
			return
		}
		target.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	return (
		<section
			id="overview"
			style={{
				position: 'relative',
				minHeight: '100svh',
				display: 'flex',
				alignItems: 'center',
				overflow: 'hidden',
			}}
		>
			<div
				className="bg-grid"
				style={{
					position: 'absolute',
					inset: 0,
					zIndex: 1,
					maskImage:
						'radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)',
					WebkitMaskImage:
						'radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)',
				}}
			/>

			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '30%',
					background: 'linear-gradient(to bottom, transparent, var(--cb-bg))',
					zIndex: 2,
				}}
			/>

			<div
				className="page-container"
				style={{
					position: 'relative',
					zIndex: 10,
					paddingTop: '96px',
					paddingBottom: '64px',
					width: '100%',
				}}
			>
				<div className="hero-grid">
					<div>
						<div
							ref={ref1 as RefObject<HTMLDivElement>}
							className="reveal"
							style={{ marginBottom: '32px' }}
						>
							<Badge variant="mint" pulse>
								LIVE DISRUPTION INTELLIGENCE
							</Badge>
						</div>

						<div
							ref={ref2 as RefObject<HTMLDivElement>}
							className="reveal"
							style={{ marginBottom: '28px', transitionDelay: '0.1s' }}
						>
							<h1
								className="font-display"
								style={{
									fontSize: 'clamp(72px, 9vw, 128px)',
									lineHeight: 0.92,
									letterSpacing: '-0.04em',
									color: 'var(--cb-text)',
								}}
							>
								RE
								<span
									style={{
										WebkitTextStroke: '1.5px var(--cb-text)',
										color: 'transparent',
										display: 'inline',
									}}
								>
									ROUTE
								</span>
								<br />
								THE
								<span style={{ color: 'var(--cb-mint)' }}> RISK</span>
								<span style={{ color: 'var(--cb-text)' }}>.</span>
							</h1>
						</div>

						<p
							ref={ref3 as RefObject<HTMLParagraphElement>}
							className="reveal font-body"
							style={{
								fontSize: '16px',
								lineHeight: 1.7,
								color: 'var(--cb-text-2)',
								maxWidth: '420px',
								marginBottom: '40px',
								transitionDelay: '0.2s',
							}}
						>
							Real-time supply chain disruption simulation with AI-powered rerouting
							across 7 global logistics nodes. Powered by Gemini 2.5.
						</p>

						<div
							ref={ref4 as RefObject<HTMLDivElement>}
							className="reveal"
							style={{
								display: 'flex',
								gap: '12px',
								flexWrap: 'wrap',
								transitionDelay: '0.3s',
							}}
						>
							<Button size="lg" onClick={onLaunchDashboard}>
								LAUNCH DASHBOARD
							</Button>
							<Button size="lg" variant="ghost" onClick={scrollToNetwork}>
								VIEW NETWORK
							</Button>
						</div>

						<div
							style={{
								display: 'flex',
								gap: '8px',
								marginTop: '48px',
								flexWrap: 'wrap',
							}}
						>
							{['7 NODES', '8 EDGES', 'GEMINI 2.5', '<200ms'].map((stat) => (
								<span
									key={stat}
									className="font-mono"
									style={{
										fontSize: '10px',
										letterSpacing: '0.12em',
										color: 'var(--cb-text-3)',
										border: '1px solid var(--cb-border)',
										padding: '4px 12px',
										background: 'var(--cb-surface)',
									}}
								>
									{stat}
								</span>
							))}
						</div>
					</div>

					<div className="hide-mobile" style={{ position: 'relative', height: '560px' }}>
						<Suspense fallback={<div style={{ height: '100%' }} />}>
							<GlobeScene />
						</Suspense>

						<DataCard
							node="SHANGHAI_PORT"
							status="critical"
							risk={0.92}
							style={{ top: '48px', right: '16px' }}
						/>
						<DataCard
							node="SINGAPORE_HUB"
							status="elevated"
							risk={0.67}
							style={{ top: '50%', right: '64px', transform: 'translateY(-50%)' }}
						/>
						<DataCard
							node="ROTTERDAM_PORT"
							status="reroute"
							label="ALTERNATE ACTIVE"
							style={{ bottom: '64px', right: '24px' }}
						/>
					</div>
				</div>
			</div>

			<div
				style={{
					position: 'absolute',
					bottom: '32px',
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 10,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '8px',
				}}
			>
				<span
					className="font-mono"
					style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--cb-text-3)' }}
				>
					SCROLL
				</span>
				<div
					style={{
						width: '1px',
						height: '40px',
						background: 'linear-gradient(to bottom, var(--cb-border-2), transparent)',
						animation: 'fadeUp 1.5s ease-in-out infinite alternate',
					}}
				/>
			</div>
		</section>
	)
}
