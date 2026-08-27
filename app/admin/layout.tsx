'use client'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { isAdminEmail } from '@/lib/auth-utils'

function timeGreeting(firstName: string): string {
  const h = new Date().getHours()
  const tod = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${tod}, ${firstName}.`
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

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
        <p style={{ color: 'rgba(30,48,32,0.4)', fontSize: '0.85rem', letterSpacing: '.1em', fontFamily: 'sans-serif' }}>Loading…</p>
      </div>
    )
  }

  if (!user || (user.role !== 'vendor' && user.role !== 'admin' && !isAdminEmail(user.email))) return null

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

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
        .lhb-nav-link:hover { background: rgba(255,255,255,0.09); color: #F2EBD9; }
        @media (max-width: 640px) {
          .lhb-layout { flex-direction: column !important; }
          .lhb-sidebar { width: 100% !important; height: auto !important; position: static !important; flex-direction: row !important; align-items: center !important; padding: 12px 16px !important; }
          .lhb-sidebar-top { margin-bottom: 0 !important; }
          .lhb-sidebar-nav { flex-direction: row !important; gap: 4px !important; flex: 1; margin: 0 12px; }
          .lhb-main { padding: 20px 16px !important; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="lhb-sidebar" style={{
        width: 220,
        background: '#1E3020',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 14px 24px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Brand */}
        <div className="lhb-sidebar-top" style={{ marginBottom: 44, paddingLeft: 6 }}>
          <p style={{ fontSize: '0.55rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(242,235,217,0.38)', marginBottom: 3, fontFamily: 'Jost, sans-serif' }}>
            Lotus House
          </p>
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 500, color: '#F2EBD9', letterSpacing: '.04em', margin: 0 }}>
            Admin
          </p>
        </div>

        {/* Nav links */}
        <nav className="lhb-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <a href="/admin/dashboard" className="lhb-nav-link">Dashboard</a>
          <a href="/admin/orders" className="lhb-nav-link">Orders</a>
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

      {/* Content */}
      <main className="lhb-main" style={{
        flex: 1,
        background: '#F2EBD9',
        padding: '40px 44px',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'rgba(30,48,32,0.48)', marginBottom: 28, letterSpacing: '.03em', margin: '0 0 28px' }}>
          {timeGreeting(user.firstName)}
        </p>
        {children}
      </main>
    </div>
  )
}
