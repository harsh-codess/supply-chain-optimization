export function Footer() {
	return (
		<footer
			style={{
				background: 'var(--cb-bg)',
				borderTop: '1px solid var(--cb-border)',
				padding: '28px 0',
				position: 'relative',
				zIndex: 10,
			}}
		>
			<div
				className="page-container"
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: '16px',
				}}
			>
				<span
					className="font-mono"
					style={{ fontSize: '11px', color: 'var(--cb-text-3)', letterSpacing: '0.1em' }}
				>
					CHAIN:BREAK COPYRIGHT 2026
				</span>
				<span
					className="font-mono hide-mobile"
					style={{ fontSize: '11px', color: 'var(--cb-text-3)', letterSpacing: '0.08em' }}
				>
					FastAPI : NetworkX : Gemini 2.5 : React Flow : Vite
				</span>
				<span
					className="font-mono"
					style={{ fontSize: '11px', color: 'var(--cb-text-3)', letterSpacing: '0.1em' }}
				>
					v1.0.0
				</span>
			</div>
		</footer>
	)
}
