import { useEffect, useRef } from 'react'
import { CursorGlyph } from './icons'

/** Desktop-only cursor that follows the pointer via direct style writes. */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed z-50 hidden size-12 -translate-x-1/2 -translate-y-1/2 mix-blend-exclusion lg:block"
      style={{ left: -100, top: -100 }}
    >
      <CursorGlyph />
    </div>
  )
}
