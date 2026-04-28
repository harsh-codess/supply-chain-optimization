import { type RefObject } from 'react'
import { useStaggerReveal } from '../../hooks/useReveal'
import { Badge } from '../ui/Badge'

const FEATURES = [
	{
		num: '01',
		label: 'TRIGGER',
		title: 'Simulate Disruptions',
		body: 'Fire severe weather events at Shanghai, port congestion in Singapore, or carrier suspensions in Dubai - each with configurable severity from 0.0 to 1.0. Watch risk cascade downstream in real time.',
		accent: 'var(--cb-red)',
		tag: 'SEVERITY CONFIGURABLE',
		tagVariant: 'red' as const,
	},
	{
		num: '02',
		label: 'PROPAGATE',
		title: 'Cascade Risk Mapping',
		body: 'A dependency-weighted graph propagates risk through all downstream nodes. Composite model: 40% weather : 35% congestion : 25% carrier. Each node gets NOMINAL, ELEVATED, or CRITICAL status.',
		accent: 'var(--cb-blue)',
		tag: 'NETWORKX ENGINE',
		tagVariant: 'blue' as const,
	},
	{
		num: '03',
		label: 'REROUTE',
		title: 'AI-Powered Decisions',
		body: 'Gemini 2.5 Flash analyzes every disruption and returns structured guidance across 6 sections: risk assessment, cascading nodes, recommended reroute, cost tradeoff, 48hr prediction, and action.',
		accent: 'var(--cb-mint)',
		tag: 'GEMINI 2.5 FLASH',
		tagVariant: 'mint' as const,
	},
]

export function WhatItDoes() {
	const containerRef = useStaggerReveal(100)

	return (
		<section
			id="network"
			style={{
				background: 'var(--cb-surface)',
				borderTop: '1px solid var(--cb-border)',
				position: 'relative',
				zIndex: 10,
			}}
		>
			<div className="page-container" style={{ paddingTop: '96px', paddingBottom: '96px' }}>
				<div
					style={{
						marginBottom: '64px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-end',
						gap: '24px',
						flexWrap: 'wrap',
					}}
				>
					<h2
						className="font-display reveal in-view"
						style={{ fontSize: '48px', letterSpacing: '-0.02em', lineHeight: 1 }}
					>
						HOW IT WORKS
					</h2>
					<span
						className="font-mono hide-mobile"
						style={{ fontSize: '11px', color: 'var(--cb-text-3)', letterSpacing: '0.1em' }}
					>
						03 CORE MODULES
					</span>
				</div>

				<div ref={containerRef as RefObject<HTMLDivElement>}>
					{FEATURES.map((feature) => (
						<div
							key={feature.num}
							data-reveal
							className="reveal feature-row"
							style={{
								padding: '48px 0',
								borderTop: '1px solid var(--cb-border)',
								alignItems: 'start',
							}}
						>
							<span
								className="font-display"
								style={{ fontSize: '72px', color: feature.accent, opacity: 0.25, lineHeight: 1 }}
							>
								{feature.num}
							</span>

							<div>
								<p
									className="font-mono"
									style={{
										fontSize: '10px',
										letterSpacing: '0.2em',
										color: 'var(--cb-text-3)',
										marginBottom: '12px',
									}}
								>
									{feature.label}
								</p>
								<h3
									className="font-display"
									style={{
										fontSize: '28px',
										letterSpacing: '-0.02em',
										marginBottom: '16px',
										color: 'var(--cb-text)',
									}}
								>
									{feature.title}
								</h3>
								<p
									className="font-body"
									style={{
										fontSize: '16px',
										color: 'var(--cb-text-2)',
										lineHeight: 1.7,
										maxWidth: '560px',
									}}
								>
									{feature.body}
								</p>
							</div>

							<div
								className="hide-mobile"
								style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}
							>
								<Badge variant={feature.tagVariant}>{feature.tag}</Badge>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
