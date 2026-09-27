# prmpt — archive landing

Full-screen, scroll-driven landing for the "prmpt" archive collection. Standalone
Vite app, independent of the Next.js site in the repository root.

Stack: React 19 · TypeScript · Vite 6 · Tailwind CSS v4 (`@tailwindcss/vite`) ·
GSAP 3.15 + `@gsap/react` (ScrollTrigger) · Motion 12 · Inter Tight 500 (Google Fonts).

```bash
cd prmpt
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
```

## How it works

| Piece | Where |
|---|---|
| Video / image URLs | `src/lib/assets.ts` |
| Scattered grid layout (`buildLayout`) | `src/lib/layout.ts` |
| Breakpoints (< 640 mobile, < 1024 touch, columns 2/3/4) | `src/hooks/useViewport.ts` |
| Scroll choreography: panel slide, card scaling, outro | `src/hooks/useScrollScene.ts` |
| Cursor scrubbing (desktop) / alternating autoplay (touch) | `src/components/VideoCanvas.tsx` |
| Overlaid UI (logo, nav, caption, product info, CTA, footer) | `src/components/` |

- **Phase 1** (scroll 0 → 100vh): GSAP ScrollTrigger (`scrub: true`) slides the black panel up.
- **Phase 2**: the panel stays put and its content moves up; each card scales in as it
  enters from the bottom and out as it leaves the top.
- **Outro**: the white overlay fades in, product info lifts, the "view" pill scales up,
  the footer fades in.

Cards, content offset and outro are written from one `requestAnimationFrame` loop that
reads `window.scrollY`; the spacer height is set to `vh + maxScroll + 2·vh` after measuring.

On desktop (≥ 1024px) the videos never autoplay: the cursor's distance from the center
scrubs `currentTime` (left of center → right video, right of center → left video) with a
`max(30px, 5vw)` dead zone, and a new seek is only issued once the previous one finished
(`!video.seeking`). Below 1024px the two clips play one after another in a loop, unless
`prefers-reduced-motion` is set.
