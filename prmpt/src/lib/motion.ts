import type { Transition } from 'motion/react'

const EASE = [0.25, 0.1, 0.25, 1] as const

export const fadeSlideIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
}

export function entry(delay: number): Transition {
  return { duration: 0.6, ease: EASE, delay }
}
