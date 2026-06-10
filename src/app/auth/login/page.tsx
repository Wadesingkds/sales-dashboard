'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const ORANGE  = '#F15A22'
const SLATE   = '#494E5C'
const TEAL    = '#006885'
const BG      = '#F8F9FB'
const BORDER  = '#E5E7EB'
const TEXT    = '#1A1C23'
const MUTED   = '#6B7280'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.message || 'Username atau password salah.')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: BG,
      padding: '0 16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        padding: '48px 40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}>
            <div style={{ width: 4, height: 28, borderRadius: 2, background: ORANGE }} />
            <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT, margin: 0 }}>Monitoring Pembiayaan</h1>
          </div>
          <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Data pipeline debitur · Google Sheets</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: SLATE,
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                color: TEXT,
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                outline: 'none',
                transition: 'all 0.15s',
              }}
              placeholder="admin"
              onFocus={(e) => (e.target.style.borderColor = TEAL)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: SLATE,
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                color: TEXT,
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                outline: 'none',
                transition: 'all 0.15s',
              }}
              placeholder="••••••••"
              onFocus={(e) => (e.target.style.borderColor = TEAL)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px',
              fontSize: 12,
              color: '#991B1B',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 8
            }}>
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: loading ? '#9CA3AF' : ORANGE,
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: loading ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#D94E1A')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = ORANGE)}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>© {new Date().getFullYear()} Sales Dashboard</p>
        </div>

      </div>
    </div>
  )
}
