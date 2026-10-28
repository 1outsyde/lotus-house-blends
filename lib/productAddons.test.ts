// Product add-ons: run with `npx tsx lib/productAddons.test.ts`
import {
  addonGroupsOf, addonsKey, addonsLabel, addonsPerUnitCents, checkoutAddons, emptyPicks, groupHint, lineDetail,
  missingPick, pickedAddons, sanitizeLineAddons, setPickText, togglePick, type PublicAddonGroup,
} from './productAddons'

let p = 0, f = 0
const ok = (c: boolean, n: string, d?: unknown) => { if (c) { p++; console.log(`  ✅ ${n}`) } else { f++; console.error(`  ❌ ${n}`, d === undefined ? '' : JSON.stringify(d)) } }
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const groups: PublicAddonGroup[] = addonGroupsOf([
  { id: 'g1', name: 'Closure', minSelect: 1, maxSelect: 1, required: true, addons: [
    { id: 'a1', name: '4x4 lace', description: null, priceCents: 4000, acceptsText: false, textLabel: null, textMaxLength: 40 },
    { id: 'a2', name: '5x5 lace', description: null, priceCents: 6000, acceptsText: false, textLabel: null, textMaxLength: 40 },
  ] },
  { id: 'g2', name: 'Extras', minSelect: 0, maxSelect: 2, required: false, addons: [
    { id: 'b1', name: 'Silk bag', description: 'Gift bag', priceCents: 500, acceptsText: false, textLabel: null, textMaxLength: 40 },
    { id: 'b2', name: 'Name card', description: null, priceCents: 300, acceptsText: true, textLabel: 'Name on the card', textMaxLength: 10 },
    { id: 'b3', name: 'Rush', description: null, priceCents: 1500, acceptsText: false, textLabel: null, textMaxLength: 40 },
  ] },
  { id: 'g3', name: 'Empty', minSelect: 0, maxSelect: null, addons: [] },
  { name: 'broken' },
])
ok(groups.length === 2, 'bad and empty groups dropped', groups.length)
ok(eq(addonGroupsOf(undefined), []) && eq(addonGroupsOf('x'), []), 'no groups from bad data')
ok(addonGroupsOf([{ id: 'g', name: 'G', minSelect: 5, maxSelect: null, addons: [{ id: 'x', name: 'X', priceCents: 1 }] }])[0].minSelect === 1, 'required count capped at the choices that are on (like checkout)')

let picks = emptyPicks()
ok(missingPick(groups, picks) === 'Choose closure', 'required group blocks first', missingPick(groups, picks))
picks = togglePick(groups, picks, 'a1').picks
picks = togglePick(groups, picks, 'a2').picks
ok(eq(picks.ids, ['a2']), 'pick one swaps', picks.ids)
picks = togglePick(groups, picks, 'b1').picks
picks = togglePick(groups, picks, 'b2').picks
const lim = togglePick(groups, picks, 'b3')
ok(lim.limitReached && !lim.picks.ids.includes('b3'), 'limit of 2 holds')
ok(missingPick(groups, picks) === 'Fill in Name on the card', 'text choice needs its text')
picks = setPickText(picks, 'b2', '  Nia\nRose  ')
ok(missingPick(groups, picks) === null, 'ready', missingPick(groups, picks))
picks = setPickText(picks, 'b2', 'Twelve chars')
ok(/up to 10 characters/.test(missingPick(groups, picks) ?? ''), 'text too long')
picks = setPickText(picks, 'b2', 'Nia Rose')
const picked = pickedAddons(groups, picks)
ok(eq(picked.map(a => a.addonId), ['a2', 'b1', 'b2']) && picked[2].text === 'Nia Rose', 'picked in group order with text', picked)
ok(addonsPerUnitCents(picked) === 6800, 'per unit add-ons', addonsPerUnitCents(picked))
ok(addonsLabel(picked) === '5x5 lace, Silk bag, Name card: "Nia Rose"', 'label like the backend', addonsLabel(picked))
ok(eq(checkoutAddons(picked), [{ addonId: 'a2' }, { addonId: 'b1' }, { addonId: 'b2', text: 'Nia Rose' }]), 'checkout sends ids and text only')
ok(addonsKey(undefined) === '' && addonsKey([]) === '', 'no add-ons: key unchanged (saved carts still match)')
ok(addonsKey(picked) === addonsKey([...picked].reverse()) && addonsKey(picked) !== addonsKey(picked.slice(0, 2)), 'same picks same key, different picks different key')
ok(groupHint({ minSelect: 1, maxSelect: 1 }) === 'Pick 1' && groupHint({ minSelect: 0, maxSelect: 2 }) === 'Optional, up to 2' && groupHint({ minSelect: 0, maxSelect: null }) === 'Optional', 'hints')
ok(lineDetail('18"', 'Silk bag') === '18" · Silk bag' && lineDetail(null, null) === null, 'line detail')
ok(sanitizeLineAddons(undefined) === undefined, 'no addons key passes as none')
ok(eq(sanitizeLineAddons([{ addonId: 'a1' }, { addonId: 'b2', text: 'Nia', extra: 1 }]), [{ addonId: 'a1' }, { addonId: 'b2', text: 'Nia' }]), 'only id and text passed on')
ok(sanitizeLineAddons([{ addonId: 'bad id!' }]) === null && sanitizeLineAddons('x') === null && sanitizeLineAddons([{ addonId: 'a', text: 5 }]) === null, 'bad add-ons refused')

console.log(`\n${p} passed, ${f} failed`)
process.exit(f ? 1 : 0)
