import { useRef } from 'react'
import { useNetworkCanvas } from '../../hooks/useNetworkCanvas'

export function NetworkCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	useNetworkCanvas(canvasRef)

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: 'fixed',
				inset: 0,
				width: '100%',
				height: '100%',
				zIndex: 0,
				pointerEvents: 'none',
				willChange: 'transform',
			}}
			aria-hidden="true"
		/>
	)
}
