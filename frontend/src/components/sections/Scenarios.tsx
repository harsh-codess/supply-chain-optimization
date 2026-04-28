import { type MouseEvent, type RefObject } from 'react'
import { CloudLightning, Anchor, Ship } from 'lucide-react'
import { useStaggerReveal } from '../../hooks/useReveal'

const SCENARIOS = [
	{
		Icon: CloudLightning,
		type: 'TYPE_01',
		title: 'Severe Weather',
		subtitle: 'EVENT',
		target: 'SHANGHAI_PORT',
		severity: 0.9,
		description:
			"Category 3 typhoon disrupts container throughput at the world's busiest port. Risk cascades to Singapore Hub and Mumbai Port within 6 hours.",
		accent: 'var(--cb-red)',
		accentDim: 'rgba(245, 69, 45, 0.06)',
		borderColor: 'rgba(245, 69, 45, 0.3)',
	},
	{
		Icon: Anchor,
		type: 'TYPE_02',
		title: 'Port Congestion',
		subtitle: 'BOTTLENECK',
		target: 'SINGAPORE_HUB',
		severity: 0.85,
		description:
			'Vessel queue exceeds 48 hours at Singapore Hub. Major Pacific-to-Europe route blocked. Carrier diversions spike freight rates across all edges.',
		accent: 'var(--cb-mint)',
		accentDim: 'rgba(5, 245, 167, 0.06)',
		borderColor: 'rgba(5, 245, 167, 0.3)',
	},
	{
		Icon: Ship,
		type: 'TYPE_03',
		title: 'Carrier Suspension',
		subtitle: 'ROUTE HALT',
		target: 'DUBAI_PORT',
		severity: 0.8,
		description:
			'Major carrier suspends Gulf operations. Colombo-Dubai-Rotterdam primary route inactive. Gemini recommends Cape of Good Hope bypass with cost delta analysis.',
		accent: 'var(--cb-blue)',
		accentDim: 'rgba(61, 126, 255, 0.06)',
		borderColor: 'rgba(61, 126, 255, 0.3)',
	},
]

function handleScenarioEnter(
	event: MouseEvent<HTMLDivElement>,
	accentDim: string,
) {
	event.currentTarget.style.background = accentDim
	event.currentTarget.style.transform = 'translateY(-4px)'
}

function handleScenarioLeave(event: MouseEvent<HTMLDivElement>) {
	event.currentTarget.style.background = 'var(--cb-surface)'
	event.currentTarget.style.transform = 'translateY(0)'
}

export function Scenarios() {
	const containerRef = useStaggerReveal(100)

	return (
		<section
			id="risk"
			style={{ paddingTop: '96px', paddingBottom: '96px', position: 'relative', zIndex: 10 }}
		>
			<div className="page-container">
				<div style={{ marginBottom: '64px' }}>
					<p
						className="font-mono"
						style={{
							fontSize: '11px',
							letterSpacing: '0.2em',
							color: 'var(--cb-text-3)',
							marginBottom: '16px',
						}}
					>
						DISRUPTION LIBRARY
					</p>
					<h2
						className="font-display"
						style={{
							fontSize: '48px',
							letterSpacing: '-0.02em',
							lineHeight: 1,
							color: 'var(--cb-text)',
						}}
					>
						SCENARIO TYPES
					</h2>
				</div>

				<div
					ref={containerRef as RefObject<HTMLDivElement>}
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
						gap: '1px',
						background: 'var(--cb-border)',
					}}
				>
					{SCENARIOS.map((scenario) => (
						<div
							key={scenario.type}
							data-reveal
							className="reveal"
							style={{
								background: 'var(--cb-surface)',
								padding: '40px 32px',
								transition: 'background 0.2s ease-out, transform 0.2s ease-out',
								cursor: 'default',
								borderTop: `1px solid ${scenario.borderColor}`,
							}}
							onMouseEnter={(event) => handleScenarioEnter(event, scenario.accentDim)}
							onMouseLeave={handleScenarioLeave}
						>
							<div style={{ marginBottom: '24px' }}>
								<scenario.Icon size={28} color={scenario.accent} strokeWidth={1.5} />
							</div>

							<p
								className="font-mono"
								style={{
									fontSize: '10px',
									letterSpacing: '0.2em',
									color: scenario.accent,
									marginBottom: '8px',
								}}
							>
								{scenario.type}
							</p>

							<h3
								className="font-display"
								style={{
									fontSize: '28px',
									letterSpacing: '-0.01em',
									color: 'var(--cb-text)',
									marginBottom: '4px',
								}}
							>
								{scenario.title}
							</h3>
							<p
								className="font-mono"
								style={{
									fontSize: '10px',
									letterSpacing: '0.15em',
									color: 'var(--cb-text-3)',
									marginBottom: '20px',
								}}
							>
								{scenario.subtitle}
							</p>

							<p
								className="font-mono"
								style={{
									fontSize: '11px',
									color: 'var(--cb-text-2)',
									marginBottom: '12px',
									letterSpacing: '0.08em',
								}}
							>
								TARGET - {scenario.target}
							</p>

							<div
								style={{
									width: '100%',
									height: '2px',
									background: 'var(--cb-border)',
									marginBottom: '20px',
								}}
							>
								<div
									style={{
										height: '100%',
										width: `${scenario.severity * 100}%`,
										background: scenario.accent,
										transition: 'width 1s var(--ease-out-expo)',
									}}
								/>
							</div>

							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: '24px',
								}}
							>
								<span className="font-mono" style={{ fontSize: '10px', color: 'var(--cb-text-3)' }}>
									SEVERITY
								</span>
								<span className="font-mono" style={{ fontSize: '10px', color: scenario.accent }}>
									{scenario.severity.toFixed(2)}
								</span>
							</div>

							<p
								className="font-body"
								style={{ fontSize: '14px', color: 'var(--cb-text-2)', lineHeight: 1.65 }}
							>
								{scenario.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
