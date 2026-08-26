'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await register({ email, password, firstName, lastName })
      router.push('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '12px 14px',
    color: '#f5f0e6',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.65rem',
    letterSpacing: '.16em',
    textTransform: 'uppercase',
    color: 'rgba(245,240,230,0.4)',
    marginBottom: 8,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <p style={{ fontSize: '0.7rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', textAlign: 'center', marginBottom: 12 }}>
          Lotus House Blends
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: 500, textAlign: 'center', marginBottom: 6 }}>
          Create Account
        </h1>
        <p style={{ textAlign: 'center', color: 'rgba(245,240,230,0.4)', fontSize: '0.85rem', marginBottom: 36 }}>
          Join Lotus House Blends
        </p>

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#fca5a5', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, background: '#f5f0e6', color: '#0a0a0a', border: 'none', padding: '14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(245,240,230,0.4)', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#f5f0e6', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
