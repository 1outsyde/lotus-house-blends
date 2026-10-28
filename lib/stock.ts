// Stock is optional (Legend 2026-10-28, backend #377): No limit, Count it, or Sold out. Same rules as the
// Outsyde app. No limit is saved as inventory null + trackInventory false, never 0 (0 = sold out at checkout).
// Customers never see the number, only Sold out.
//   npx tsx lib/stock.test.ts

// ── Stock ───────────────────────────────────────────────────────────────────
export type StockMode = 'unlimited' | 'count' | 'soldout'

export interface StockFields {
  inventory?: number | null
  trackInventory?: boolean | null
}

export function stockModeOf(p: StockFields | null | undefined): StockMode {
  if (!p || p.trackInventory === false || p.inventory === null || p.inventory === undefined) return 'unlimited'
  return p.inventory <= 0 ? 'soldout' : 'count'
}

export function stockPayload(
  mode: StockMode,
  countInput: string,
): { inventory: number | null; trackInventory: boolean } | { error: string } {
  if (mode === 'unlimited') return { inventory: null, trackInventory: false }
  if (mode === 'soldout') return { inventory: 0, trackInventory: true }
  const raw = countInput.trim()
  const n = Number(raw)
  if (!raw || !Number.isInteger(n) || n < 1) return { error: 'Enter how many you have, or pick No limit or Sold out.' }
  if (n > 1_000_000) return { error: 'That stock number is too large.' }
  return { inventory: n, trackInventory: true }
}

export function stockLabel(p: StockFields | null | undefined): string {
  const mode = stockModeOf(p)
  if (mode === 'unlimited') return 'No limit'
  if (mode === 'soldout') return 'Sold out'
  return `${p!.inventory} in stock`
}

export const STOCK_CHOICES: { value: StockMode; label: string; hint: string }[] = [
  { value: 'unlimited', label: 'No limit', hint: 'Made to order or always on hand. Never sells out.' },
  { value: 'count', label: 'Count it', hint: 'Sells out when this many are bought.' },
  { value: 'soldout', label: 'Sold out', hint: 'Customers see it as sold out.' },
]
