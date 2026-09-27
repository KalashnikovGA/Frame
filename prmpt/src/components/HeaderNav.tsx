import { motion } from 'motion/react'
import { entry, fadeSlideIn } from '../lib/motion'
import { HamburgerIcon } from './icons'

const navText = 'text-[13px] leading-[18px] font-medium text-white uppercase sm:text-[15px]'

export function HeaderNav() {
  return (
    <motion.nav
      {...fadeSlideIn}
      transition={entry(0.15)}
      className="pointer-events-none fixed top-4 right-4 z-20 flex h-[30px] w-auto flex-row items-center justify-between mix-blend-exclusion sm:top-8 sm:right-8 sm:w-[330px]"
    >
      <span className={`${navText} hidden sm:inline`}>ABOUT</span>
      <div className="flex flex-row items-center gap-5 sm:gap-[50px]">
        <HamburgerIcon className="size-6 sm:size-[30px]" />
        <span className={navText}>[ CART ]</span>
      </div>
    </motion.nav>
  )
}
