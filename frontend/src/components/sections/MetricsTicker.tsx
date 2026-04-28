const ITEMS = [
	'7 GLOBAL NODES',
	'8 DIRECTED EDGES',
	'COMPOSITE RISK MODEL',
	'GEMINI 2.5 FLASH',
	'3 DISRUPTION TYPES',
	'NETWORKX GRAPH ENGINE',
	'REROUTE PLANNING',
	'REALTIME CASCADE',
	'<200ms LATENCY',
	'99.97% UPTIME',
]

export function MetricsTicker() {
	const repeated = [...ITEMS, ...ITEMS, ...ITEMS]

	return (
		<div
			style={{
				borderTop: '1px solid var(--cb-border)',
				borderBottom: '1px solid var(--cb-border)',
				background: 'var(--cb-bg)',
				padding: '14px 0',
				overflow: 'hidden',
				position: 'relative',
				zIndex: 10,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					zIndex: 2,
					pointerEvents: 'none',
					background:
						'linear-gradient(to right, var(--cb-bg) 0%, transparent 8%, transparent 92%, var(--cb-bg) 100%)',
				}}
			/>

			<div
				className="ticker-track"
				style={{
					display: 'flex',
					width: 'max-content',
					animation: 'ticker 28s linear infinite',
				}}
			>
				{repeated.map((item, i) => (
					<div
						key={`${item}-${i}`}
						style={{
							display: 'flex',
							alignItems: 'center',
							whiteSpace: 'nowrap',
						}}
					>
						<span
							className="font-mono"
							style={{
								fontSize: '11px',
								letterSpacing: '0.15em',
								color: 'var(--cb-text-2)',
								padding: '0 24px',
							}}
						>
							{item}
						</span>
						<span
							style={{
								display: 'inline-block',
								width: '4px',
								height: '4px',
								borderRadius: '50%',
								background: 'var(--cb-mint)',
								opacity: 0.5,
								flexShrink: 0,
							}}
						/>
					</div>
				))}
			</div>
		</div>
	)
}
