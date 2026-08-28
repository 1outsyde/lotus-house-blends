'use client'
import { useState, useEffect } from 'react'

const MOSS = '#1E3020'
const GOLD = '#B8831A'
const PARCHMENT = '#F2EBD9'

interface Subscription {
  id: string
  status: string
  tierId: string
  tierName: string | null
  tierDisplayName: string | null
  priceInCents: number | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd?: boolean
  stripeSubscriptionId: string | null
}

interface Tier {
  id: string
  name: string
  displayName: string
  description: string | null
  priceInCents: number
  features: string[]
  sortOrder: number | null
  isActive: boolean
}

interface Props {
  subscription: Subscription | null
  tiers: Tier[]
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}/mo`
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    active:   { bg: 'rgba(30,48,32,0.1)',  color: MOSS,   label: 'Active' },
    trialing: { bg: 'rgba(184,131,26,0.1)', color: GOLD,  label: 'Trial' },
    past_due: { bg: 'rgba(180,50,30,0.08)', color: '#b43220', label: 'Past Due' },
    canceled: { bg: 'rgba(100,100,100,0.08)', color: '#555', label: 'Canceled' },
  }
  const c = cfg[status] ?? { bg: 'rgba(100,100,100,0.08)', color: '#555', label: status }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: '0.65rem',
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      fontFamily: 'Jost, sans-serif',
      fontWeight: 500,
      background: c.bg,
      color: c.color,
    }}>{c.label}</span>
  )
}

export default function SubscriptionClient({ subscription: subProp, tiers }: Props) {
  const [sub, setSub] = useState(subProp)

  useEffect(() => {
    if (sub !== null) return
    const retry = async () => {
      try {
        const res = await fetch('/api/admin/subscription')
        if (!res.ok) return
        const data = await res.json()
        if (data?.subscription) setSub(data.subscription)
      } catch { /* silent */ }
    }
    retry()
  }, [sub])

  const activeTiers = [...tiers]
    .filter(t => t.isActive && t.name !== 'grandfathered')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const heading: { fontFamily: string; color: string; fontWeight: number; margin: number } = {
    fontFamily: 'Cormorant Garamond, Georgia, serif',
    color: MOSS,
    fontWeight: 500,
    margin: 0,
  }

  return (
    <div style={{ maxWidth: 780, fontFamily: 'Jost, sans-serif' }}>
      {/* Page title */}
      <h1 style={{ ...heading, fontSize: '1.7rem', letterSpacing: '.02em', marginBottom: 6 }}>
        Subscription
      </h1>
      <p style={{ margin: '0 0 36px', fontSize: '0.8rem', color: 'rgba(30,48,32,0.5)', letterSpacing: '.03em' }}>
        Plan details and available tiers
      </p>

      {/* Current plan card */}
      <section style={{
        background: '#fff',
        border: '1px solid rgba(30,48,32,0.1)',
        borderRadius: 10,
        padding: '28px 32px',
        marginBottom: 40,
      }}>
        <p style={{ fontSize: '0.62rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.4)', margin: '0 0 14px', fontWeight: 500 }}>
          Current Plan
        </p>

        {sub ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              <h2 style={{ ...heading, fontSize: '1.3rem' }}>
                {sub.tierDisplayName ?? sub.tierName ?? 'Unknown Plan'}
              </h2>
              <StatusBadge status={sub.status} />
              {sub.cancelAtPeriodEnd && (
                <span style={{ fontSize: '0.68rem', color: '#b43220', fontFamily: 'Jost, sans-serif', letterSpacing: '.04em' }}>
                  Cancels at period end
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px 32px' }}>
              {[
                { label: 'Monthly Price', value: sub.priceInCents != null ? `$${(sub.priceInCents / 100).toFixed(0)}/mo` : '—' },
                { label: sub.cancelAtPeriodEnd ? 'Cancels On' : 'Renews On', value: fmtDate(sub.currentPeriodEnd) },
                { label: 'Billing Status', value: sub.status.replace(/_/g, ' ') },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ margin: '0 0 3px', fontSize: '0.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.4)' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: MOSS, fontWeight: 400, textTransform: label === 'Billing Status' ? 'capitalize' : 'none' }}>{value}</p>
                </div>
              ))}
            </div>

            {(sub.status === 'past_due' || sub.status === 'canceled') && (
              <div style={{
                marginTop: 20,
                padding: '12px 16px',
                background: 'rgba(180,50,30,0.05)',
                border: '1px solid rgba(180,50,30,0.15)',
                borderRadius: 6,
                fontSize: '0.78rem',
                color: '#b43220',
                letterSpacing: '.02em',
              }}>
                {sub.status === 'past_due'
                  ? 'Your payment is past due. Please update your payment method to keep your plan active.'
                  : 'Your subscription has been canceled. Contact support to reactivate.'}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '12px 0' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(30,48,32,0.5)' }}>
              No active subscription found. Contact support to get started.
            </p>
          </div>
        )}
      </section>

      {/* Manage Plan CTA */}
      <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <button
          onClick={() => window.open('https://www.goutsyde.com/subscription/manage', '_blank')}
          style={{
            background: MOSS,
            color: GOLD,
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: '0.75rem',
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            fontFamily: 'Jost, sans-serif',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Manage Plan
        </button>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(30,48,32,0.45)', letterSpacing: '.02em' }}>
          Upgrade, downgrade, or cancel your plan
        </p>
      </div>

      {/* Tier comparison */}
      {activeTiers.length > 0 && (
        <section>
          <p style={{ fontSize: '0.62rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.4)', margin: '0 0 18px', fontWeight: 500 }}>
            Available Plans
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {activeTiers.map(tier => {
              const isCurrent = sub?.tierId === tier.id
              return (
                <div key={tier.id} style={{
                  background: isCurrent ? `rgba(30,48,32,0.04)` : '#fff',
                  border: isCurrent ? `1.5px solid ${MOSS}` : '1px solid rgba(30,48,32,0.1)',
                  borderRadius: 10,
                  padding: '22px 22px 20px',
                  position: 'relative',
                }}>
                  {isCurrent && (
                    <span style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      fontSize: '0.55rem',
                      letterSpacing: '.14em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: MOSS,
                      background: 'rgba(30,48,32,0.08)',
                      padding: '2px 7px',
                      borderRadius: 10,
                      fontFamily: 'Jost, sans-serif',
                    }}>Current</span>
                  )}
                  <h3 style={{ ...heading, fontSize: '1.05rem', marginBottom: 4 }}>
                    {tier.displayName}
                  </h3>
                  <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: GOLD, fontWeight: 500 }}>
                    {fmt(tier.priceInCents)}
                  </p>
                  {tier.description && (
                    <p style={{ margin: '0 0 12px', fontSize: '0.75rem', color: 'rgba(30,48,32,0.55)', lineHeight: 1.5 }}>
                      {tier.description}
                    </p>
                  )}
                  {tier.features.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {tier.features.map((f, i) => (
                        <li key={i} style={{ fontSize: '0.72rem', color: 'rgba(30,48,32,0.65)', display: 'flex', gap: 6, alignItems: 'flex-start', lineHeight: 1.4 }}>
                          <span style={{ color: GOLD, flexShrink: 0, marginTop: 1 }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
          <p style={{ marginTop: 20, fontSize: '0.72rem', color: 'rgba(30,48,32,0.4)', letterSpacing: '.02em' }}>
            To change your plan, contact{' '}
            <a href="mailto:info@goutsyde.com" style={{ color: GOLD, textDecoration: 'none' }}>info@goutsyde.com</a>.
          </p>
        </section>
      )}
    </div>
  )
}
