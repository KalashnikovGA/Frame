import { useMemo, type Ref } from 'react'
import { CARDS } from '../lib/assets'
import { buildLayout } from '../lib/layout'

type Props = {
  panelRef?: Ref<HTMLDivElement>
  wrapRef?: Ref<HTMLDivElement>
  cols: number
}

/** Black sheet that slides over the hero and carries the scattered gallery. */
export function BlackPanel({ panelRef, wrapRef, cols }: Props) {
  const layout = useMemo(() => buildLayout(CARDS.length, cols), [cols])

  return (
    <div
      ref={panelRef}
      id="black-panel"
      className="fixed inset-0 z-10 bg-black"
      style={{ transform: 'translateY(100vh)' }}
    >
      <div ref={wrapRef} className="w-full pt-[min(400px,40vh)]">
        {layout.map((row, r) => (
          <div key={r} className="flex w-full">
            {row.map((idx, c) => (
              <div key={c} className="aspect-[2/3] flex-1">
                {idx !== -1 && (
                  <div
                    className="bp-card relative size-full"
                    style={{
                      transform: 'scale(0)',
                      transformOrigin: c < cols / 2 ? 'right bottom' : 'left bottom',
                    }}
                  >
                    <img
                      src={CARDS[idx]}
                      alt={`Archive look ${idx + 1}`}
                      draggable={false}
                      decoding="async"
                      className="size-full object-cover [-webkit-user-drag:none]"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
