'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface Order {
  id: string
  createdAt: string
  status: string
  totalCents: number
  items?: { name: string; quantity: number; priceCents: number }[]
}

type Tab = 'orders' | 'points' | 'settings'

const MOSS = '#1E3020'
const PARCHMENT = '#F2EBD9'
const GOLD = '#B8831A'
const MUTED = 'rgba(30,48,32,0.5)'

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function AccountPage() {
  const { user, isLoading, logout, updateUser } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // Settings form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
    }
  }, [user])

  useEffect(() => {
    if (tab !== 'orders' || !user) return
    setOrdersLoading(true)
    setOrdersError(null)
    const token = typeof window !== 'undefined' ? localStorage.getItem('outsyde_access_token') : null
    fetch('/api/consumer/orders', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : data.orders ?? [])
      })
      .catch(() => setOrdersError('Failed to load orders. Please try again.'))
      .finally(() => setOrdersLoading(false))
  }, [tab, user])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaving(true)
    setSettingsMsg(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('outsyde_access_token') : null
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ firstName, lastName }),
      })
      if (!res.ok) throw new Error('Save failed')
      updateUser({ firstName, lastName })
      setSettingsMsg('Profile updated.')
    } catch {
      setSettingsMsg('Failed to save. Please try again.')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: PARCHMENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: MUTED, fontFamily: 'Jost, sans-serif', fontSize: '0.9rem' }}>Loading…</p>
      </div>
    )
  }

  if (!user) return null

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: '0.7rem',
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    fontFamily: 'Jost, sans-serif',
    fontWeight: tab === t ? 600 : 400,
    color: tab === t ? MOSS : MUTED,
    background: 'none',
    border: 'none',
    borderBottom: tab === t ? `2px solid ${MOSS}` : '2px solid transparent',
    cursor: 'pointer',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(30,48,32,0.06)',
    border: '1px solid rgba(30,48,32,0.2)',
    padding: '12px 14px',
    color: MOSS,
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    borderRadius: '4px',
    fontFamily: 'Jost, sans-serif',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.65rem',
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: MUTED,
    marginBottom: 6,
    fontFamily: 'Jost, sans-serif',
  }

  return (
    <div style={{ minHeight: '100vh', background: PARCHMENT }}>
      {/* Header */}
      <div style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(30,48,32,0.12)', padding: '48px 24px 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 8, fontFamily: 'Jost, sans-serif' }}>
            My Account
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2rem', fontWeight: 500, color: MOSS, marginBottom: 4 }}>
            {user.firstName} {user.lastName}
          </h1>
          <p style={{ fontSize: '0.85rem', color: MUTED, marginBottom: 24, fontFamily: 'Jost, sans-serif' }}>{user.email}</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(30,48,32,0.12)' }}>
            <button style={tabStyle('orders')} onClick={() => setTab('orders')}>Orders</button>
            <button style={tabStyle('points')} onClick={() => setTab('points')}>Points</button>
            <button style={tabStyle('settings')} onClick={() => setTab('settings')}>Settings</button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 500, color: MOSS, marginBottom: 24 }}>
              Order History
            </h2>
            {ordersLoading && (
              <p style={{ color: MUTED, fontFamily: 'Jost, sans-serif', fontSize: '0.9rem' }}>Loading orders…</p>
            )}
            {ordersError && (
              <p style={{ color: '#8b3030', fontFamily: 'Jost, sans-serif', fontSize: '0.9rem' }}>{ordersError}</p>
            )}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <p style={{ color: MUTED, fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', marginBottom: 16 }}>
                  No orders yet.
                </p>
                <a href="/shop/lotus" style={{ display: 'inline-block', background: MOSS, color: PARCHMENT, padding: '12px 28px', fontSize: '0.72rem', letterSpacing: '.14em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '4px', fontFamily: 'Jost, sans-serif' }}>
                  Shop Blends
                </a>
              </div>
            )}
            {orders.map(order => (
              <div key={order.id} style={{ background: '#FAF7F2', border: '1px solid rgba(30,48,32,0.12)', borderRadius: '6px', padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: order.items?.length ? 16 : 0 }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 4, fontFamily: 'Jost, sans-serif' }}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: MUTED, fontFamily: 'Jost, sans-serif' }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      fontFamily: 'Jost, sans-serif',
                      fontWeight: 500,
                      background: order.status === 'completed' ? 'rgba(30,48,32,0.1)' : 'rgba(184,131,26,0.12)',
                      color: order.status === 'completed' ? MOSS : GOLD,
                    }}>
                      {order.status}
                    </span>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: MOSS, marginTop: 6, fontFamily: 'Jost, sans-serif' }}>
                      {formatCents(order.totalCents)}
                    </p>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(30,48,32,0.08)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: MUTED, fontFamily: 'Jost, sans-serif' }}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>{formatCents(item.priceCents * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Points tab */}
        {tab === 'points' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 500, color: MOSS, marginBottom: 24 }}>
              Loyalty Points
            </h2>
            <div style={{ background: '#FAF7F2', border: '1px solid rgba(30,48,32,0.12)', borderRadius: '6px', padding: '40px 32px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 12, fontFamily: 'Jost, sans-serif' }}>
                Your Balance
              </p>
              <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4rem', fontWeight: 600, color: GOLD, lineHeight: 1 }}>
                {user.loyaltyPoints ?? 0}
              </div>
              <p style={{ fontSize: '0.8rem', color: MUTED, marginTop: 8, fontFamily: 'Jost, sans-serif' }}>points</p>
              <p style={{ fontSize: '0.85rem', color: MUTED, marginTop: 24, lineHeight: 1.6, fontFamily: 'Jost, sans-serif' }}>
                Earn points with every purchase. Points can be redeemed for discounts on future orders.
              </p>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 500, color: MOSS, marginBottom: 24 }}>
              Profile Settings
            </h2>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    autoComplete="family-name"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                />
              </div>

              {settingsMsg && (
                <p style={{ fontSize: '0.85rem', color: settingsMsg.includes('Failed') ? '#8b3030' : MOSS, fontFamily: 'Jost, sans-serif' }}>
                  {settingsMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={settingsSaving}
                style={{
                  alignSelf: 'flex-start',
                  background: MOSS,
                  color: PARCHMENT,
                  border: 'none',
                  padding: '12px 28px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  cursor: settingsSaving ? 'not-allowed' : 'pointer',
                  opacity: settingsSaving ? 0.6 : 1,
                  borderRadius: '4px',
                  fontFamily: 'Jost, sans-serif',
                }}
              >
                {settingsSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>

            <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(30,48,32,0.12)' }}>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: '1px solid rgba(30,48,32,0.25)',
                  color: MOSS,
                  padding: '10px 24px',
                  fontSize: '0.72rem',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontFamily: 'Jost, sans-serif',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
