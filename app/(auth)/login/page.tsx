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
  const redirect = searchParams.get('redirect') ?? '/account'

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(30,48,32,0.06)',
    border: '1px solid rgba(30,48,32,0.2)',
    padding: '12px 14px',
    color: '#1E3020',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    borderRadius: '4px',
    fontFamily: 'Jost, sans-serif',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.65rem',
    letterSpacing: '.16em',
    textTransform: 'uppercase',
    color: 'rgba(30,48,32,0.55)',
    marginBottom: 8,
    fontFamily: 'Jost, sans-serif',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2EBD9', color: '#1E3020', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <p style={{ fontSize: '0.7rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.45)', textAlign: 'center', marginBottom: 12, fontFamily: 'Jost, sans-serif' }}>
          Lotus House Blends
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.4rem', fontWeight: 500, textAlign: 'center', marginBottom: 6, color: '#1E3020' }}>
          Sign In
        </h1>
        <p style={{ textAlign: 'center', color: 'rgba(30,48,32,0.5)', fontSize: '0.85rem', marginBottom: 36, fontFamily: 'Jost, sans-serif' }}>
          Welcome back
        </p>

        {justRegistered && (
          <div style={{ marginBottom: 20, padding: '12px 16px', border: '1px solid rgba(184,131,26,0.4)', background: 'rgba(184,131,26,0.08)', color: '#7a5a10', fontSize: '0.85rem', borderRadius: '4px', fontFamily: 'Jost, sans-serif' }}>
            Account created — please sign in.
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', border: '1px solid rgba(180,60,60,0.3)', background: 'rgba(180,60,60,0.06)', color: '#8b3030', fontSize: '0.85rem', borderRadius: '4px', fontFamily: 'Jost, sans-serif' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: '#1E3020',
              color: '#F2EBD9',
              border: 'none',
              padding: '14px',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              borderRadius: '4px',
              fontFamily: 'Jost, sans-serif',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(30,48,32,0.5)', marginTop: 24, fontFamily: 'Jost, sans-serif' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#1E3020', textDecoration: 'underline' }}>
            Create one
          </Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(30,48,32,0.5)', marginTop: 12, fontFamily: 'Jost, sans-serif' }}>
          <Link href="/forgot-password" style={{ color: 'rgba(30,48,32,0.55)', textDecoration: 'underline' }}>
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  )
}
