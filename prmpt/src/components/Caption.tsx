import { motion } from 'motion/react'
import { entry, fadeSlideIn } from '../lib/motion'

export function Caption() {
  return (
    <motion.p
      {...fadeSlideIn}
      transition={entry(0.3)}
      className="pointer-events-none fixed top-[118px] left-4 z-20 w-[calc(100vw-32px)] text-[12px] leading-[140%] font-medium tracking-[-0.04em] text-white mix-blend-exclusion sm:top-[180px] sm:left-8 sm:w-[calc(50vw-48px)] lg:top-[244px] lg:w-[692px]"
    >
      When switching between videos near the center, do not reset currentTime to 0 abruptly. Add a
      small dead zone: if cursor is within &plusmn;50px of center, keep both videos at currentTime = 0
      and show whichever was last active.
    </motion.p>
  )
}
