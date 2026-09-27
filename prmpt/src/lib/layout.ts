/** Grid row: each entry is a CARDS index, or -1 for an empty cell. */
export type LayoutRow = number[]

/**
 * Scattered grid: one image per row at a column that walks across the grid,
 * plus a second image on every third row.
 */
export function buildLayout(count: number, cols: number): LayoutRow[] {
  const rows: LayoutRow[] = []
  let i = 0
  for (let r = 0; i < count; r++) {
    const row: LayoutRow = new Array(cols).fill(-1)
    const a = (r * 2 + (r % 2)) % cols
    row[a] = i++
    if (r % 3 === 0 && i < count) {
      let b = (a + 2) % cols
      if (b === a) b = (a + 1) % cols
      row[b] = i++
    }
    rows.push(row)
  }
  return rows
}
