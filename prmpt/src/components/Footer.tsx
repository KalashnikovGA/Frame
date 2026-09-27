import type { Ref } from 'react'

const text = 'text-[11px] font-medium tracking-[-0.02em] text-white uppercase sm:text-[13px]'

export function Footer({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      id="outro-footer"
      className="pointer-events-none fixed right-4 bottom-6 left-4 z-15 flex flex-row items-center justify-between mix-blend-exclusion sm:right-auto sm:bottom-8 sm:justify-start sm:gap-20"
      style={{ opacity: 0 }}
    >
      <span className={text}>PRMPT&reg; 2026</span>
      <span className={text}>PRIVACY POLICY</span>
    </div>
  )
}
