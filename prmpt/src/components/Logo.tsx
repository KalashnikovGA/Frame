import { motion } from 'motion/react'
import { entry, fadeSlideIn } from '../lib/motion'
import { Wordmark } from './icons'

export function Logo() {
  return (
    <motion.div
      {...fadeSlideIn}
      transition={entry(0)}
      className="pointer-events-none fixed top-4 left-4 z-20 w-[124px] mix-blend-exclusion sm:top-8 sm:left-8 sm:w-[266px] lg:w-[355px]"
    >
      <Wordmark className="block h-auto w-full" />
    </motion.div>
  )
}
