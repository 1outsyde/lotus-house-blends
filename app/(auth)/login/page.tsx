'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { isAdminEmail } from '@/lib/auth-utils'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'
  const redirect = searchParams.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const loggedInUser = await login(email, password)
      if (isAdminEmail(loggedInUser.email) || loggedInUser.role === 'vendor' || loggedInUser.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push(redirect)
      }
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <p style={{ fontSize: '0.7rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', textAlign: 'center', marginBottom: 12 }}>
          Lotus House Blends
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: 500, textAlign: 'center', marginBottom: 6 }}>
          Sign In
        </h1>
        <p style={{ textAlign: 'center', color: 'rgba(245,240,230,0.4)', fontSize: '0.85rem', marginBottom: 36 }}>
          Welcome back
        </p>

        {justRegistered && (
          <div style={{ marginBottom: 20, padding: '12px 16px', border: '1px solid rgba(100,200,100,0.3)', background: 'rgba(100,200,100,0.05)', color: '#86efac', fontSize: '0.85rem' }}>
            Account created — please sign in.
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#fca5a5', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', color: '#f5f0e6', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', color: '#f5f0e6', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, background: '#f5f0e6', color: '#0a0a0a', border: 'none', padding: '14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(245,240,230,0.4)', marginTop: 24 }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#f5f0e6', textDecoration: 'underline' }}>
            Create one
          </Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(245,240,230,0.4)', marginTop: 12 }}>
          <Link href="/forgot-password" style={{ color: 'rgba(245,240,230,0.5)', textDecoration: 'underline' }}>
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  )
}
