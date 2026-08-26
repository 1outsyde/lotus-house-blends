'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { isAdminEmail } from '@/lib/auth-utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [sidebarReady, setSidebarReady] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/admin/dashboard')
    }
    if (!isLoading && user && user.role !== 'vendor' && user.role !== 'admin' && !isAdminEmail(user.email)) {
      router.replace('/')
    }
    if (!isLoading && user) setSidebarReady(true)
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(245,240,230,0.4)', fontSize: '0.85rem', letterSpacing: '.1em' }}>Loading...</p>
      </div>
    )
  }

  if (!user || (user.role !== 'vendor' && user.role !== 'admin' && !isAdminEmail(user.email))) return null

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f0e6', opacity: sidebarReady ? 1 : 0, transition: 'opacity 0.15s' }}>
      <style>{`
        @media (max-width: 640px) {
          .lhb-admin-nav { padding: 12px 16px !important; flex-wrap: wrap; height: auto !important; gap: 8px; }
          .lhb-admin-nav-links { gap: 12px !important; flex-wrap: wrap; }
          .lhb-admin-main { padding: 24px 16px !important; }
        }
      `}</style>
      <nav className="lhb-admin-nav" style={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', letterSpacing: '.1em' }}>
          LOTUS HOUSE — ADMIN
        </span>
        <div className="lhb-admin-nav-links" style={{ display: 'flex', gap: 24, fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase' }}>
          <a href="/admin/dashboard" style={{ color: '#f5f0e6', textDecoration: 'none' }}>Dashboard</a>
          <a href="/admin/orders" style={{ color: '#f5f0e6', textDecoration: 'none' }}>Orders</a>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'rgba(245,240,230,0.5)', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', padding: 0 }}
          >
            Sign Out
          </button>
        </div>
      </nav>
      <main className="lhb-admin-main" style={{ padding: '40px 32px' }}>
        {children}
      </main>
    </div>
  )
}
