import { motion } from 'motion/react'
import { useEffect, useRef, type Ref } from 'react'
import { entry, fadeIn } from '../lib/motion'

const SYMBOLS = ['8', '$', '^^', '%', '/']
const SYMBOL_THROTTLE_MS = 80

type Props = {
  ref?: Ref<HTMLDivElement>
  /** px the block lifts during the outro (166 desktop, 132 mobile) */
  outroOffset: number
}

export function ProductInfo({ ref, outroOffset }: Props) {
  const symbolRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const now = performance.now()
      if (now - last < SYMBOL_THROTTLE_MS) return
      last = now
      if (symbolRef.current) {
        symbolRef.current.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      ref={ref}
      id="outro-info"
      data-outro-offset={outroOffset}
      {...fadeIn}
      transition={entry(0.45)}
      className="pointer-events-none fixed right-0 bottom-12 left-0 z-20 flex flex-col items-center mix-blend-exclusion sm:right-8 sm:bottom-20 sm:left-auto sm:w-[330px]"
    >
      <div className="mb-3 flex w-[252px] flex-col items-start sm:mb-8 sm:w-full">
        <div className="relative size-5 sm:size-[30px]">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
            className="absolute inset-0 size-full [stroke-width:2] sm:[stroke-width:2.5]"
          >
            <circle cx="20" cy="20" r="18.75" stroke="white" />
          </svg>
          <span
            ref={symbolRef}
            id="circle-symbol"
            className="absolute inset-0 flex items-center justify-center text-[10px] leading-none font-medium tracking-[-0.04em] text-white uppercase sm:text-[15px]"
          >
            8
          </span>
        </div>
        <span className="w-full text-center text-[20px] leading-none font-medium tracking-[-0.04em] text-white uppercase sm:text-[30px]">
          ARCHIVE COLLECTION
          <br />
          &quot;PROMPT&quot;
        </span>
      </div>
      <span className="w-full text-center text-[60px] leading-none font-medium tracking-[-0.04em] text-white sm:text-[80px]">
        $97,33
      </span>
    </motion.div>
  )
}
