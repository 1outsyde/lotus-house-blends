'use client';

import { useState } from 'react';
import { countInGroup, groupHint, setPickText, togglePick, type AddonPicks, type PublicAddonGroup } from '@/lib/productAddons';

// Product add-ons on the product page (backend #371). One block per group, choices as toggles, a
// text box under a picked choice that takes text (for example a name). Same rules as the Outsyde app.
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function AddonPicker({ groups, picks, onChange }: { groups: PublicAddonGroup[]; picks: AddonPicks; onChange: (next: AddonPicks) => void }) {
  const [limitGroup, setLimitGroup] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', margin: '0 0 1.6rem' }}>
      {groups.map((g) => {
        const single = g.maxSelect === 1;
        const count = countInGroup(g, picks);
        return (
          <fieldset key={g.id} style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem', marginBottom: '.7rem', padding: 0 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '.72rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--lhb-black)', fontWeight: 500 }}>{g.name}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '.75rem', color: '#777' }}>{groupHint(g)}</span>
            </legend>
            <div role={single ? 'radiogroup' : 'group'} aria-label={g.name} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {g.addons.map((a) => {
                const on = picks.ids.includes(a.id);
                return (
                  <div key={a.id}>
                    <button
                      type="button"
                      role={single ? 'radio' : 'checkbox'}
                      aria-checked={on}
                      onClick={() => { const r = togglePick(groups, picks, a.id); setLimitGroup(r.limitReached ? g.id : null); onChange(r.picks); }}
                      style={{
                        width: '100%', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.8rem',
                        padding: '.7rem 1rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
                        border: `1px solid ${on ? 'var(--lhb-moss)' : 'rgba(90,62,30,.3)'}`,
                        background: on ? 'var(--lhb-moss)' : '#fff', color: on ? 'var(--lhb-parchment)' : 'var(--lhb-black)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '.7rem', minWidth: 0 }}>
                        <span aria-hidden style={{ width: 16, height: 16, flexShrink: 0, border: `1px solid ${on ? 'var(--lhb-parchment)' : '#999'}`, borderRadius: single ? '50%' : 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem' }}>{on ? '✓' : ''}</span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: '.9rem' }}>{a.name}</span>
                          {a.description && <span style={{ display: 'block', fontSize: '.75rem', opacity: 0.75 }}>{a.description}</span>}
                        </span>
                      </span>
                      <span style={{ fontSize: '.82rem', flexShrink: 0 }}>{a.priceCents > 0 ? `+${money(a.priceCents)}` : 'Free'}</span>
                    </button>
                    {on && a.acceptsText && (
                      <label style={{ display: 'block', marginTop: '.5rem' }}>
                        <span style={{ display: 'block', fontSize: '.75rem', color: '#555', marginBottom: '.3rem', fontFamily: 'var(--font-body)' }}>{a.textLabel || a.name}</span>
                        <input
                          value={picks.text[a.id] ?? ''}
                          maxLength={a.textMaxLength}
                          aria-label={a.textLabel || a.name}
                          onChange={(e) => onChange(setPickText(picks, a.id, e.target.value))}
                          style={{ width: '100%', padding: '.7rem .85rem', border: '1px solid rgba(90,62,30,.3)', background: '#fff', fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--lhb-black)' }}
                        />
                        <span style={{ display: 'block', fontSize: '.7rem', color: '#777', marginTop: '.25rem', fontFamily: 'var(--font-body)' }}>{[...(picks.text[a.id] ?? '')].length} / {a.textMaxLength}</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
            {limitGroup === g.id && g.maxSelect !== null && count >= g.maxSelect && (
              <p role="status" style={{ fontSize: '.78rem', color: '#777', marginTop: '.5rem', fontFamily: 'var(--font-body)' }}>You can pick up to {g.maxSelect}. Remove one to pick another.</p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
