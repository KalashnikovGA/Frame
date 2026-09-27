import type { Ref } from 'react'

/** Pill CTA; scaled from 0 to 1 by the scroll scene during the outro. */
export function ViewButton({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      id="outro-buy"
      className="pointer-events-none fixed right-4 bottom-[60px] left-4 z-20 flex h-[100px] origin-bottom-right items-center justify-center rounded-[1335px] bg-white mix-blend-exclusion sm:right-8 sm:bottom-8 sm:left-auto sm:h-[174px] sm:w-[330px]"
      style={{ transform: 'scale(0)' }}
    >
      <span className="text-center text-[72px] leading-none font-medium tracking-[-0.04em] text-white mix-blend-exclusion sm:text-[110px]">
        view
      </span>
    </div>
  )
}
