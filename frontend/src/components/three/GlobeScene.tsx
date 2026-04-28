import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
	const phi = (90 - lat) * (Math.PI / 180)
	const theta = (lon + 180) * (Math.PI / 180)
	return new THREE.Vector3(
		-(radius * Math.sin(phi) * Math.cos(theta)),
		radius * Math.cos(phi),
		radius * Math.sin(phi) * Math.sin(theta),
	)
}

function greatCirclePoints(
	a: THREE.Vector3,
	b: THREE.Vector3,
	segments = 48,
	lift = 0.18,
): THREE.Vector3[] {
	const points: THREE.Vector3[] = []
	for (let i = 0; i <= segments; i += 1) {
		const t = i / segments
		const point = new THREE.Vector3().lerpVectors(a, b, t).normalize()
		const liftAmount = lift * Math.sin(t * Math.PI)
		point.multiplyScalar(1.6 + liftAmount)
		points.push(point)
	}
	return points
}

const PORTS = {
	shanghai: { lat: 31.2, lon: 121.5 },
	singapore: { lat: 1.3, lon: 103.8 },
	dubai: { lat: 25.2, lon: 55.3 },
	rotterdam: { lat: 51.9, lon: 4.5 },
	losAngeles: { lat: 33.7, lon: -118.2 },
}

const RADIUS = 1.6

interface Colors {
	mint: string
	red: string
	blue: string
}

const DEFAULT_COLORS: Colors = {
	mint: 'rgb(5, 245, 167)',
	red: 'rgb(245, 69, 45)',
	blue: 'rgb(61, 126, 255)',
}

function readColorsFromTokens(): Colors {
	if (typeof window === 'undefined') {
		return DEFAULT_COLORS
	}

	const css = getComputedStyle(document.documentElement)
	return {
		mint: css.getPropertyValue('--cb-mint').trim() || DEFAULT_COLORS.mint,
		red: css.getPropertyValue('--cb-red').trim() || DEFAULT_COLORS.red,
		blue: css.getPropertyValue('--cb-blue').trim() || DEFAULT_COLORS.blue,
	}
}

function WireframeSphere({ color }: { color: string }) {
	return (
		<mesh>
			<sphereGeometry args={[RADIUS, 32, 20]} />
			<meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
		</mesh>
	)
}

function DisruptionMarker({
	position,
	color,
}: {
	position: THREE.Vector3
	color: string
}) {
	const ref = useRef<THREE.Mesh>(null)

	useFrame(({ clock }) => {
		if (!ref.current) {
			return
		}
		const scale = Math.sin(clock.elapsedTime * 2.5) * 0.25 + 1
		ref.current.scale.setScalar(scale)
	})

	return (
		<mesh ref={ref} position={position}>
			<sphereGeometry args={[0.035, 12, 8]} />
			<meshBasicMaterial color={color} />
		</mesh>
	)
}

function ConnectionArc({
	from,
	to,
	color,
}: {
	from: THREE.Vector3
	to: THREE.Vector3
	color: string
}) {
	const points = greatCirclePoints(from, to)
	return <Line points={points} color={color} lineWidth={1} transparent opacity={0.55} />
}

function Scene() {
	const groupRef = useRef<THREE.Group>(null)
	const [colors, setColors] = useState<Colors>(DEFAULT_COLORS)

	useEffect(() => {
		setColors(readColorsFromTokens())
	}, [])

	useFrame((_, delta) => {
		if (groupRef.current) {
			groupRef.current.rotation.y += delta * 0.06
		}
	})

	const shangPos = latLonToVec3(PORTS.shanghai.lat, PORTS.shanghai.lon, RADIUS)
	const singPos = latLonToVec3(PORTS.singapore.lat, PORTS.singapore.lon, RADIUS)
	const dubaiPos = latLonToVec3(PORTS.dubai.lat, PORTS.dubai.lon, RADIUS)
	const rottPos = latLonToVec3(PORTS.rotterdam.lat, PORTS.rotterdam.lon, RADIUS)
	const laPos = latLonToVec3(PORTS.losAngeles.lat, PORTS.losAngeles.lon, RADIUS)

	return (
		<group ref={groupRef}>
			<WireframeSphere color={colors.blue} />
			<DisruptionMarker position={shangPos} color={colors.red} />
			<DisruptionMarker position={singPos} color={colors.red} />
			<DisruptionMarker position={dubaiPos} color={colors.red} />
			<ConnectionArc from={rottPos} to={laPos} color={colors.mint} />
			<ConnectionArc from={shangPos} to={singPos} color={colors.red} />
			<ConnectionArc from={singPos} to={dubaiPos} color={colors.red} />
		</group>
	)
}

export function GlobeScene() {
	return (
		<Canvas
			camera={{ position: [0, 0.5, 4.5], fov: 42 }}
			gl={{ antialias: true, alpha: true }}
			style={{ background: 'transparent' }}
			frameloop="always"
		>
			<ambientLight intensity={0.4} />
			<Scene />
		</Canvas>
	)
}
