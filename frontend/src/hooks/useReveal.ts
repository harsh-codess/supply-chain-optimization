import { useEffect, useRef } from 'react'

export function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view')
          observer.unobserve(el)
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}

export function useStaggerReveal(staggerMs = 80, threshold = 0.1) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) {
      return
    }

    const children = Array.from(
      container.querySelectorAll<HTMLElement>('[data-reveal]'),
    )
    const timeoutIds: number[] = []

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            const id = window.setTimeout(
              () => child.classList.add('in-view'),
              i * staggerMs,
            )
            timeoutIds.push(id)
          })
          observer.unobserve(container)
        }
      },
      { threshold },
    )

    observer.observe(container)

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id))
      observer.disconnect()
    }
  }, [staggerMs, threshold])

  return ref
}