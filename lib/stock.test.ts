// Run with `npx tsx lib/stock.test.ts`
import { stockLabel, stockModeOf, stockPayload } from './stock'
let p = 0, f = 0
const ok = (c: boolean, n: string, d?: unknown) => { if (c) { p++; console.log(`  ✅ ${n}`) } else { f++; console.error(`  ❌ ${n}`, d ?? '') } }
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
ok(stockModeOf({ inventory: 5, trackInventory: true }) === 'count' && stockModeOf({ inventory: 0, trackInventory: true }) === 'soldout', 'count, sold out')
ok(stockModeOf({ inventory: 3, trackInventory: false }) === 'unlimited' && stockModeOf({ inventory: null, trackInventory: true }) === 'unlimited', 'no limit')
ok(eq(stockPayload('unlimited', '9'), { inventory: null, trackInventory: false }) && eq(stockPayload('soldout', ''), { inventory: 0, trackInventory: true }) && eq(stockPayload('count', '4'), { inventory: 4, trackInventory: true }), 'payloads')
ok('error' in stockPayload('count', '0') && 'error' in stockPayload('count', ''), 'count needs a number')
ok(stockLabel({ inventory: null, trackInventory: true }) === 'No limit' && stockLabel({ inventory: 2, trackInventory: true }) === '2 in stock', 'labels (no number was shown as 0 in stock)')
console.log(`\n${p} passed, ${f} failed`)
process.exit(f ? 1 : 0)
