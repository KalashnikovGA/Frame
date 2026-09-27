import { useEffect, useState } from 'react'

export const MOBILE_MAX = 640
export const DESKTOP_MIN = 1024

export type Viewport = {
  /** < 640px */
  isMobile: boolean
  /** < 1024px — videos autoplay instead of following the cursor */
  isTouch: boolean
  cols: number
}

function read(): Viewport {
  const w = window.innerWidth
  return {
    isMobile: w < MOBILE_MAX,
    isTouch: w < DESKTOP_MIN,
    cols: w < MOBILE_MAX ? 2 : w < DESKTOP_MIN ? 3 : 4,
  }
}

/** Breakpoint flags; only re-renders when a flag actually flips. */
export function useViewport(): Viewport {
  const [vp, setVp] = useState(read)

  useEffect(() => {
    const onResize = () => {
      const next = read()
      setVp((prev) =>
        prev.isMobile === next.isMobile && prev.isTouch === next.isTouch && prev.cols === next.cols
          ? prev
          : next,
      )
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return vp
}
