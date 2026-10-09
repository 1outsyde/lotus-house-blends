'use client'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { isAdminEmail } from '@/lib/auth-utils'

const VENDOR_CONFIG = {
  hasBookings: false,
  vendorName: 'Lotus House Blends',
} as const

function timeGreeting(firstName: string | null | undefined): string {
  const h = new Date().getHours()
  const tod = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  const name = firstName?.trim()
  return name ? `Good ${tod}, ${name}.` : `Good ${tod}.`
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/admin/dashboard')
    }
    if (!isLoading && user && user.role !== 'vendor' && user.role !== 'admin' && !isAdminEmail(user.email)) {
      router.replace('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F2EBD9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(30,48,32,0.4)', fontSize: '0.85rem', letterSpacing: '.1em', fontFamily: 'Jost, sans-serif' }}>Loading…</p>
      </div>
    )
  }

  if (!user || (user.role !== 'vendor' && user.role !== 'admin' && !isAdminEmail(user.email))) return null

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/orders', label: 'Orders' },
    ...(VENDOR_CONFIG.hasBookings ? [{ href: '/admin/bookings', label: 'Bookings', disabled: false }] : []),
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/subscription', label: 'Subscription' },
  ]

  return (
    <div className="lhb-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .lhb-nav-link {
          color: rgba(242,235,217,0.65);
          text-decoration: none;
          display: block;
          padding: 9px 14px;
          font-size: 0.7rem;
          letter-spacing: .16em;
          text-transform: uppercase;
          border-radius: 4px;
          transition: background 0.15s, color 0.15s;
          font-family: 'Jost', sans-serif;
        }
        .lhb-nav-link:hover:not(.lhb-nav-disabled) { background: rgba(255,255,255,0.09); color: #F2EBD9; }
        .lhb-nav-link.lhb-nav-active { background: rgba(184,131,26,0.2); color: #B8831A; }
        .lhb-nav-disabled { opacity: 0.3; cursor: default; pointer-events: none; }
        @media (max-width: 1023px) {
          .lhb-main { padding: 20px 16px !important; min-height: calc(100vh - 52px) !important; }
        }
      `}</style>

      {/* Backdrop — mobile only, closes drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — off-canvas drawer below lg (1024px), sticky column at lg+ */}
      <aside
        className={`lhb-sidebar fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: 220,
          background: '#1E3020',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 14px 24px',
          flexShrink: 0,
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div className="lhb-sidebar-top" style={{ marginBottom: 44, paddingLeft: 6 }}>
          <p style={{ fontSize: '0.55rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(242,235,217,0.38)', marginBottom: 3, fontFamily: 'Jost, sans-serif' }}>
            {VENDOR_CONFIG.vendorName}
          </p>
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 500, color: '#F2EBD9', letterSpacing: '.04em', margin: 0 }}>
            Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="lhb-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {navItems.map(({ href, label, disabled }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            const cls = [
              'lhb-nav-link',
              isActive ? 'lhb-nav-active' : '',
              disabled ? 'lhb-nav-disabled' : '',
            ].filter(Boolean).join(' ')
            return (
              <a key={href} href={disabled ? undefined : href} className={cls} onClick={() => setSidebarOpen(false)}>
                {label}
              </a>
            )
          })}
        </nav>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '1px solid rgba(242,235,217,0.14)',
            color: 'rgba(242,235,217,0.45)',
            cursor: 'pointer',
            fontSize: '0.62rem',
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            padding: '9px 14px',
            fontFamily: 'Jost, sans-serif',
            textAlign: 'left',
            borderRadius: 4,
            marginTop: 12,
          }}
        >
          Sign Out
        </button>
      </aside>

      {/* Content column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar — 52px, sticky, hamburger top-left (hidden at lg+) */}
        <header
          className="lg:hidden flex items-center gap-3 sticky top-0 z-10"
          style={{ height: 52, padding: '0 16px', background: '#1E3020', borderBottom: '1px solid rgba(242,235,217,0.1)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            style={{ color: 'rgba(242,235,217,0.75)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <p style={{ fontSize: '0.55rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(242,235,217,0.38)', margin: 0, fontFamily: 'Jost, sans-serif' }}>
              {VENDOR_CONFIG.vendorName}
            </p>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', fontWeight: 500, color: '#F2EBD9', letterSpacing: '.04em', margin: 0, lineHeight: 1.1 }}>
              Admin
            </p>
          </div>
        </header>

        <main className="lhb-main" style={{
          flex: 1,
          background: '#F2EBD9',
          padding: '40px 44px',
          overflowY: 'auto',
          minHeight: '100vh',
        }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'rgba(30,48,32,0.48)', letterSpacing: '.03em', margin: '0 0 28px' }}>
            {timeGreeting(user.firstName)}
          </p>
          {children}
        </main>
      </div>
    </div>
  )
}
