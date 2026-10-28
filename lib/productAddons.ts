// Product add-ons (backend #371 / #373, migration 075), for the product page, the cart and checkout.
// Same rules as the Outsyde app (components/products/productAddonLogic.ts) and the backend, so a
// problem shows on the product page instead of coming back from checkout:
//  - a group with minSelect > 0 is required; maxSelect null = no limit
//  - a choice that takes text (a name, a message) needs that text, up to textMaxLength characters
//  - price per unit = product (or length) price + every picked choice
// The backend always prices add-ons from its own data; the prices here are only for display.
//   npx tsx lib/productAddons.test.ts

/** GET /api/products/:id → addonGroups[] (only groups and choices that are on). */
export interface PublicAddon {
  id: string
  name: string
  description: string | null
  priceCents: number
  acceptsText: boolean
  textLabel: string | null
  textMaxLength: number
}
export interface PublicAddonGroup {
  id: string
  name: string
  minSelect: number
  maxSelect: number | null
  required: boolean
  addons: PublicAddon[]
}

/** What a cart line keeps for each picked choice. */
export interface CartAddon {
  addonId: string
  groupName: string
  name: string
  priceCents: number
  text?: string
}

export interface AddonPicks {
  ids: string[]
  text: Record<string, string>
}
export const emptyPicks = (): AddonPicks => ({ ids: [], text: {} })

/** Same as the backend's cleanText: no line breaks or control characters, single spaces, trimmed. */
export function cleanText(v: string): string {
  return v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Bad or missing data from the product route → no add-ons, never a crash. */
export function addonGroupsOf(raw: unknown): PublicAddonGroup[] {
  if (!Array.isArray(raw)) return []
  const out: PublicAddonGroup[] = []
  for (const g of raw) {
    if (!g || typeof g.id !== 'string' || typeof g.name !== 'string' || !Array.isArray(g.addons)) continue
    const addons: PublicAddon[] = []
    for (const a of g.addons) {
      if (!a || typeof a.id !== 'string' || typeof a.name !== 'string' || typeof a.priceCents !== 'number') continue
      addons.push({
        id: a.id,
        name: a.name,
        description: typeof a.description === 'string' ? a.description : null,
        priceCents: a.priceCents,
        acceptsText: a.acceptsText === true,
        textLabel: typeof a.textLabel === 'string' ? a.textLabel : null,
        textMaxLength: typeof a.textMaxLength === 'number' && a.textMaxLength > 0 ? a.textMaxLength : 40,
      })
    }
    if (addons.length === 0) continue
    const min = typeof g.minSelect === 'number' ? Math.max(0, Math.min(g.minSelect, addons.length)) : 0
    const max = typeof g.maxSelect === 'number' ? g.maxSelect : null
    out.push({ id: g.id, name: g.name, minSelect: min, maxSelect: max, required: min > 0, addons })
  }
  return out
}

const groupOf = (groups: PublicAddonGroup[], addonId: string) => groups.find(g => g.addons.some(a => a.id === addonId))

export const countInGroup = (group: PublicAddonGroup, picks: AddonPicks): number =>
  group.addons.filter(a => picks.ids.includes(a.id)).length

/** Tap a choice. A pick-one group swaps its choice; a group at its limit stays as it is. */
export function togglePick(groups: PublicAddonGroup[], picks: AddonPicks, addonId: string): { picks: AddonPicks; limitReached: boolean } {
  const group = groupOf(groups, addonId)
  if (!group) return { picks, limitReached: false }
  if (picks.ids.includes(addonId)) return { picks: { ...picks, ids: picks.ids.filter(id => id !== addonId) }, limitReached: false }
  if (group.maxSelect === 1) {
    const others = new Set(group.addons.map(a => a.id))
    return { picks: { ...picks, ids: [...picks.ids.filter(id => !others.has(id)), addonId] }, limitReached: false }
  }
  if (group.maxSelect !== null && countInGroup(group, picks) >= group.maxSelect) return { picks, limitReached: true }
  return { picks: { ...picks, ids: [...picks.ids, addonId] }, limitReached: false }
}

export const setPickText = (picks: AddonPicks, addonId: string, text: string): AddonPicks => ({ ...picks, text: { ...picks.text, [addonId]: text } })

/** "Pick 1", "Optional, up to 3", "Pick at least 2", "Pick 2 to 4", "Optional". */
export function groupHint(group: Pick<PublicAddonGroup, 'minSelect' | 'maxSelect'>): string {
  const { minSelect: min, maxSelect: max } = group
  if (min === 0) {
    if (max === 1) return 'Optional, pick 1'
    if (max !== null) return `Optional, up to ${max}`
    return 'Optional'
  }
  if (max === min) return `Pick ${min}`
  if (max === null) return min === 1 ? 'Pick at least 1' : `Pick at least ${min}`
  return `Pick ${min} to ${max}`
}

/** First thing the customer still has to do, or null. Same checks and order as the backend. */
export function missingPick(groups: PublicAddonGroup[], picks: AddonPicks): string | null {
  for (const g of groups) {
    for (const a of g.addons) {
      if (!picks.ids.includes(a.id) || !a.acceptsText) continue
      const text = cleanText(picks.text[a.id] ?? '')
      const what = a.textLabel || a.name
      if (!text) return `Fill in ${what}`
      if ([...text].length > a.textMaxLength) return `${what} can be up to ${a.textMaxLength} characters`
    }
  }
  for (const g of groups) {
    const count = countInGroup(g, picks)
    if (g.maxSelect !== null && count > g.maxSelect) return `${g.name}: pick up to ${g.maxSelect}`
    if (count < g.minSelect) return g.minSelect === 1 ? `Choose ${g.name.toLowerCase()}` : `${g.name}: pick at least ${g.minSelect}`
  }
  return null
}

/** Picked choices in group order, then choice order (the order the backend stores them in). */
export function pickedAddons(groups: PublicAddonGroup[], picks: AddonPicks): CartAddon[] {
  const out: CartAddon[] = []
  for (const g of groups) {
    for (const a of g.addons) {
      if (!picks.ids.includes(a.id)) continue
      out.push({
        addonId: a.id,
        groupName: g.name,
        name: a.name,
        priceCents: a.priceCents,
        ...(a.acceptsText ? { text: cleanText(picks.text[a.id] ?? '') } : {}),
      })
    }
  }
  return out
}

export const addonsPerUnitCents = (addons: CartAddon[] | undefined): number => (addons ?? []).reduce((s, a) => s + a.priceCents, 0)

/** Same as the backend's addonsLabel, e.g. `Sprinkles, Name frosting: "Happy 5th Mia"`. */
export const addonsLabel = (addons: CartAddon[] | undefined): string =>
  (addons ?? []).map(a => (a.text !== undefined ? `${a.name}: "${a.text}"` : a.name)).join(', ')

/** What a checkout line sends as `addons`. */
export const checkoutAddons = (addons: CartAddon[]): { addonId: string; text?: string }[] =>
  addons.map(a => (a.text !== undefined ? { addonId: a.addonId, text: a.text } : { addonId: a.addonId }))

/** Add-on part of a cart line key. Empty for a line without add-ons, so saved carts keep their keys. */
export function addonsKey(addons: CartAddon[] | undefined): string {
  if (!addons || addons.length === 0) return ''
  return '+' + [...addons].map(a => `${a.addonId}=${a.text ?? ''}`).sort().join('|')
}

/** Variation and add-ons for one line of a cart, checkout or order, e.g. `18" · Closure`. */
export function lineDetail(variantLabel?: string | null, addonsText?: string | null): string | null {
  const parts = [variantLabel, addonsText].filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
  return parts.length ? parts.join(' · ') : null
}

/** What the checkout BFF passes on: undefined = the line has no add-ons, null = not well formed. */
export function sanitizeLineAddons(raw: unknown): { addonId: string; text?: string }[] | null | undefined {
  if (raw === undefined || raw === null) return undefined
  if (!Array.isArray(raw) || raw.length > 30) return null
  const out: { addonId: string; text?: string }[] = []
  for (const a of raw) {
    if (!a || typeof a.addonId !== 'string' || !/^[0-9a-zA-Z-]{1,64}$/.test(a.addonId)) return null
    if (a.text !== undefined && (typeof a.text !== 'string' || a.text.length > 400)) return null
    out.push(a.text !== undefined ? { addonId: a.addonId, text: a.text } : { addonId: a.addonId })
  }
  return out
}
