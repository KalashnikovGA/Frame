import { useEffect, useRef, useState, type Ref } from 'react'
import { VIDEO_LEFT, VIDEO_RIGHT } from '../lib/assets'

type Side = 'left' | 'right'

type Props = {
  ref?: Ref<HTMLDivElement>
  isTouch: boolean
}

function show(video: HTMLVideoElement, visible: boolean) {
  const display = visible ? 'block' : 'none'
  if (video.style.display !== display) video.style.display = display
}

function play(video: HTMLVideoElement) {
  video.play().catch(() => {
    // Autoplay can be refused (e.g. low-power mode); the first frame stays up.
  })
}

export function VideoCanvas({ ref, isTouch }: Props) {
  const leftRef = useRef<HTMLVideoElement>(null)
  const rightRef = useRef<HTMLVideoElement>(null)
  // Side of the viewport the cursor was last on outside the dead zone.
  // Starts at 'left' so the right video — visible on first paint — stays up.
  const activeSideRef = useRef<Side>('left')
  const [ready, setReady] = useState(false)

  // Reveal once both videos have a frame. On touch only the playing video is
  // required: mobile browsers skip preloading the one that isn't playing yet.
  useEffect(() => {
    const left = leftRef.current!
    const right = rightRef.current!
    const check = () => {
      const leftReady = left.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      const rightReady = right.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      if (leftReady && (rightReady || isTouch)) setReady(true)
    }
    check()
    left.addEventListener('loadeddata', check)
    right.addEventListener('loadeddata', check)
    return () => {
      left.removeEventListener('loadeddata', check)
      right.removeEventListener('loadeddata', check)
    }
  }, [isTouch])

  // Touch: play left, then right, then left again, forever.
  useEffect(() => {
    if (!isTouch) return
    const left = leftRef.current!
    const right = rightRef.current!

    show(left, true)
    show(right, false)
    left.currentTime = 0

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const swap = (from: HTMLVideoElement, to: HTMLVideoElement) => () => {
      show(from, false)
      show(to, true)
      to.currentTime = 0
      play(to)
    }
    const onLeftEnded = swap(left, right)
    const onRightEnded = swap(right, left)
    left.addEventListener('ended', onLeftEnded)
    right.addEventListener('ended', onRightEnded)
    play(left)

    return () => {
      left.removeEventListener('ended', onLeftEnded)
      right.removeEventListener('ended', onRightEnded)
      left.pause()
      right.pause()
    }
  }, [isTouch])

  // Desktop: scrub the visible video from the cursor's distance to center.
  useEffect(() => {
    if (isTouch) return
    const left = leftRef.current!
    const right = rightRef.current!

    let targetX = window.innerWidth / 2
    const onMove = (e: MouseEvent) => {
      targetX = e.clientX
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const seek = (video: HTMLVideoElement, time: number) => {
      // Wait for the previous seek to render before asking for another one,
      // and skip no-op seeks (e.g. holding at 0 inside the dead zone).
      if (video.seeking || Math.abs(video.currentTime - time) < 0.001) return
      video.currentTime = time
    }

    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      // Canvas is hidden once the black panel covers it.
      if (window.scrollY >= window.innerHeight) return
      if (!left.duration || !right.duration) return

      const width = window.innerWidth || 1000
      const centerX = width / 2
      const x = Math.max(0, Math.min(width, targetX))
      const deadZone = Math.max(30, width * 0.05)
      const dist = x - centerX
      const outside = Math.abs(dist) > deadZone

      if (outside) activeSideRef.current = dist < 0 ? 'left' : 'right'

      // Cursor on the left scrubs the right video, and vice versa.
      const showRight = activeSideRef.current === 'left'
      const video = showRight ? right : left
      show(right, showRight)
      show(left, !showRight)

      let progress = 0
      if (outside) {
        progress = showRight
          ? (centerX - deadZone - x) / Math.max(1, centerX - deadZone)
          : (x - (centerX + deadZone)) / Math.max(1, width - centerX - deadZone)
      }
      seek(video, Math.max(0, Math.min(1, progress)) * video.duration)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [isTouch])

  return (
    <div
      ref={ref}
      id="main-canvas"
      className="pointer-events-none fixed top-[220px] left-0 z-0 h-[calc(100vh-220px)] w-screen overflow-hidden transition-opacity duration-300 ease-[ease] sm:inset-0 sm:h-full sm:w-full"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <video
        ref={leftRef}
        src={VIDEO_LEFT}
        crossOrigin="anonymous"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover"
        style={{ display: 'none' }}
      />
      <video
        ref={rightRef}
        src={VIDEO_RIGHT}
        crossOrigin="anonymous"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover"
        style={{ display: 'block' }}
      />
    </div>
  )
}
