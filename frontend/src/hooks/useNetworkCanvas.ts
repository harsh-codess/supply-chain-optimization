import { useEffect, useRef, type RefObject } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Flash {
  nodeA: number
  nodeB: number
  progress: number
  active: boolean
}

export function useNetworkCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const nodesRef = useRef<Node[]>([])
  const flashRef = useRef<Flash>({
    nodeA: 0,
    nodeB: 1,
    progress: 0,
    active: false,
  })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const COUNT = 24
    const MAX_DIST = 200

    nodesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 2.5 + 1.5,
    }))

    let flashDir = 1
    const flashInterval = window.setInterval(() => {
      let a = Math.floor(Math.random() * COUNT)
      let b = Math.floor(Math.random() * COUNT)

      while (b === a) {
        b = Math.floor(Math.random() * COUNT)
      }

      flashRef.current = { nodeA: a, nodeB: b, progress: 0, active: true }
      flashDir = 1
    }, 4000)

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const nodes = nodesRef.current
      const flash = flashRef.current

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < COUNT; i += 1) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy

        if (n.x < 0 || n.x > width) {
          n.vx *= -1
        }
        if (n.y < 0 || n.y > height) {
          n.vy *= -1
        }
      }

      if (flash.active) {
        flash.progress += flashDir * 0.018

        if (flash.progress >= 1) {
          flashDir = -1
        }
        if (flash.progress <= 0 && flashDir === -1) {
          flash.active = false
        }
      }

      for (let i = 0; i < COUNT; i += 1) {
        for (let j = i + 1; j < COUNT; j += 1) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist > MAX_DIST) {
            continue
          }

          const isFlash =
            flash.active &&
            ((flash.nodeA === i && flash.nodeB === j) ||
              (flash.nodeA === j && flash.nodeB === i))

          const alpha = (1 - dist / MAX_DIST) * 0.18

          if (isFlash) {
            ctx.strokeStyle = `rgba(245, 69, 45, ${flash.progress * 0.7})`
            ctx.lineWidth = 1.5
          } else {
            ctx.strokeStyle = `rgba(61, 126, 255, ${alpha})`
            ctx.lineWidth = 0.8
          }

          ctx.beginPath()
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(nodes[j].x, nodes[j].y)
          ctx.stroke()
        }
      }

      for (let i = 0; i < COUNT; i += 1) {
        const n = nodes[i]
        const isFlashNode = flash.active && (flash.nodeA === i || flash.nodeB === i)

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = isFlashNode
          ? `rgba(245, 69, 45, ${flash.progress * 0.8})`
          : 'rgba(5, 245, 167, 0.45)'
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.clearInterval(flashInterval)
      cancelAnimationFrame(rafRef.current)
    }
  }, [canvasRef])
}