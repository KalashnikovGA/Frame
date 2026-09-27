import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export type SceneRefs = {
  spacer: RefObject<HTMLDivElement | null>
  canvas: RefObject<HTMLDivElement | null>
  panel: RefObject<HTMLDivElement | null>
  wrap: RefObject<HTMLDivElement | null>
  overlay: RefObject<HTMLDivElement | null>
  info: RefObject<HTMLDivElement | null>
  buy: RefObject<HTMLDivElement | null>
  footer: RefObject<HTMLDivElement | null>
}

/**
 * Scroll choreography.
 *
 * - Phase 1 (0 → vh): the black panel slides up over the hero (ScrollTrigger scrub).
 * - Phase 2 (vh → vh + maxScroll): the panel is pinned and its content scrolls.
 * - Outro (past vh + maxScroll): white overlay, lifted product info, "view" pill, footer.
 *
 * Card scales, the content offset and the outro are written from a single RAF
 * loop reading window.scrollY, not from scroll events.
 *
 * @param layoutKey changes whenever the gallery grid is re-rendered
 */
export function useScrollScene(refs: SceneRefs, layoutKey: unknown) {
  useGSAP(
    () => {
      const spacer = refs.spacer.current!
      const canvas = refs.canvas.current!
      const panel = refs.panel.current!
      const wrap = refs.wrap.current!
      const overlay = refs.overlay.current!
      const info = refs.info.current!
      const buy = refs.buy.current!
      const footer = refs.footer.current!

      let vh = window.innerHeight
      let maxScroll = 0
      let cards: HTMLElement[] = []
      let tops: number[] = []
      let heights: number[] = []
      let lastY = -1
      let inPhase2 = false

      // Card positions relative to the top of the content wrapper. Measured on
      // the (untransformed) grid cells so the cards' own scale doesn't skew it.
      const measure = () => {
        vh = window.innerHeight
        cards = Array.from(wrap.querySelectorAll<HTMLElement>('.bp-card'))
        const wrapTop = wrap.getBoundingClientRect().top
        const cells = cards.map((card) => card.parentElement!)
        tops = cells.map((cell) => cell.getBoundingClientRect().top - wrapTop)
        heights = cells.map((cell) => cell.offsetHeight)
        maxScroll = Math.max(0, wrap.scrollHeight - vh)
        gsap.set(spacer, { height: vh + maxScroll + 2 * vh })
        lastY = -1
      }

      const scaleCards = (panelOffset: number, contentOffset: number) => {
        for (let i = 0; i < cards.length; i++) {
          const top = tops[i] - contentOffset + panelOffset
          const bottom = top + heights[i]
          let scale = 0
          if (bottom > 0 && top < vh) {
            const enter = Math.min(1, (vh - top) / (vh * 0.6))
            const exit = Math.min(1, bottom / (vh * 0.4))
            scale = Math.max(0, Math.min(enter, exit))
          }
          cards[i].style.transform = `scale(${scale})`
        }
      }

      const resetOutro = () => {
        wrap.style.transform = 'translate3d(0, 0, 0)'
        overlay.style.opacity = '0'
        info.style.transform = 'translate3d(0, 0, 0)'
        buy.style.transform = 'scale(0)'
        footer.style.opacity = '0'
      }

      measure()
      ScrollTrigger.addEventListener('refreshInit', measure)

      gsap.fromTo(
        panel,
        { y: () => window.innerHeight },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: spacer,
            start: 'top top',
            end: () => `+=${window.innerHeight}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )

      let raf = 0
      const tick = () => {
        raf = requestAnimationFrame(tick)
        const y = window.scrollY
        if (y === lastY) return
        lastY = y

        canvas.style.visibility = y >= vh ? 'hidden' : 'visible'

        if (y < vh) {
          if (inPhase2) {
            inPhase2 = false
            resetOutro()
          }
          scaleCards(vh - y, 0)
          return
        }

        inPhase2 = true
        const contentOffset = Math.min(y - vh, maxScroll)
        wrap.style.transform = `translate3d(0, ${-contentOffset}px, 0)`

        const outro = Math.min(1, Math.max(0, (y - vh - maxScroll) / (vh - 100)))
        const lift = Number(info.dataset.outroOffset) || 166
        overlay.style.opacity = String(outro)
        info.style.transform = `translate3d(0, ${-outro * lift}px, 0)`
        buy.style.transform = `scale(${outro})`
        footer.style.opacity = String(outro)

        scaleCards(0, contentOffset)
      }
      raf = requestAnimationFrame(tick)

      return () => {
        cancelAnimationFrame(raf)
        ScrollTrigger.removeEventListener('refreshInit', measure)
      }
    },
    { dependencies: [layoutKey], revertOnUpdate: true },
  )
}
