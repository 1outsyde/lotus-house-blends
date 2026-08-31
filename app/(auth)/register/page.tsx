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
  const [agreed, setAgreed] = useState(false)
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
    if (!agreed) {
      setError('Please agree to the terms to continue')
      return
    }

    setLoading(true)
    try {
      await register({ email, password, firstName, lastName })
      router.push('/account')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(message)
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
          Create Account
        </h1>
        <p style={{ textAlign: 'center', color: 'rgba(30,48,32,0.5)', fontSize: '0.85rem', marginBottom: 36, fontFamily: 'Jost, sans-serif' }}>
          Join Lotus House Blends
        </p>

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', border: '1px solid rgba(180,60,60,0.3)', background: 'rgba(180,60,60,0.06)', color: '#8b3030', fontSize: '0.85rem', borderRadius: '4px', fontFamily: 'Jost, sans-serif' }}>
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

          {/* Outsyde disclosure — required */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              required
              style={{ marginTop: 3, accentColor: '#1E3020', flexShrink: 0 }}
            />
            <span style={{ fontSize: '0.78rem', color: 'rgba(30,48,32,0.6)', lineHeight: 1.5 }}>
              I understand that this site is powered by{' '}
              <a href="https://goutsyde.com" target="_blank" rel="noopener noreferrer" style={{ color: '#B8831A', textDecoration: 'underline' }}>
                Outsyde
              </a>
              , a commerce platform for independent wellness brands, and that my account and order data are managed by Outsyde on behalf of Lotus House Blends.
            </span>
          </label>

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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(30,48,32,0.5)', marginTop: 24, fontFamily: 'Jost, sans-serif' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#1E3020', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
