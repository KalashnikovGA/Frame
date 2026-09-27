import { MotionConfig } from 'motion/react'
import { useRef } from 'react'
import { BlackPanel } from './components/BlackPanel'
import { Caption } from './components/Caption'
import { CustomCursor } from './components/CustomCursor'
import { Footer } from './components/Footer'
import { HeaderNav } from './components/HeaderNav'
import { Logo } from './components/Logo'
import { OutroOverlay } from './components/OutroOverlay'
import { ProductInfo } from './components/ProductInfo'
import { VideoCanvas } from './components/VideoCanvas'
import { ViewButton } from './components/ViewButton'
import { useScrollScene } from './hooks/useScrollScene'
import { useViewport } from './hooks/useViewport'

export function App() {
  const { isMobile, isTouch, cols } = useViewport()

  const refs = {
    spacer: useRef<HTMLDivElement>(null),
    canvas: useRef<HTMLDivElement>(null),
    panel: useRef<HTMLDivElement>(null),
    wrap: useRef<HTMLDivElement>(null),
    overlay: useRef<HTMLDivElement>(null),
    info: useRef<HTMLDivElement>(null),
    buy: useRef<HTMLDivElement>(null),
    footer: useRef<HTMLDivElement>(null),
  }
  useScrollScene(refs, cols)

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={refs.spacer}
        id="scroll-spacer"
        className="relative h-[500vh] bg-white font-sans select-none lg:cursor-none"
      >
        <CustomCursor />
        <Logo />
        <Caption />
        <HeaderNav />
        <ProductInfo ref={refs.info} outroOffset={isMobile ? 132 : 166} />
        <ViewButton ref={refs.buy} />
        <VideoCanvas ref={refs.canvas} isTouch={isTouch} />
        <OutroOverlay ref={refs.overlay} />
        <Footer ref={refs.footer} />
        <BlackPanel panelRef={refs.panel} wrapRef={refs.wrap} cols={cols} />
      </div>
    </MotionConfig>
  )
}
