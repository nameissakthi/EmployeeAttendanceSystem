import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res.user.role === 'manager') {
        navigate('/manager', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ffffff 0%, #fffef0 100%)',
      padding: '20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'center',
        maxWidth: '1000px',
        width: '100%'
      }}>
        {/* Left side - Branding */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '800',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #333 0%, #ffc107 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome Back
          </div>
          <p style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            Employee Attendance System
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #fff9e6 0%, #fffef0 100%)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #ffc107',
            marginBottom: '24px'
          }}>
            <p style={{ fontSize: '14px', color: '#666', margin: '8px 0' }}>
              <strong>Demo Credentials:</strong>
            </p>
            <p style={{ fontSize: '13px', color: '#888', margin: '6px 0' }}>Manager: manager@example.com / Password123</p>
            <p style={{ fontSize: '13px', color: '#888', margin: '6px 0' }}>Employee: employee1@example.com / Password123</p>
          </div>
          <div style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffc107' }}>150+</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Records Tracked</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffc107' }}>6</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Team Members</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffc107' }}>100%</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Uptime</div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(255, 193, 7, 0.15), 0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 193, 7, 0.2)'
        }}>
          <h2 style={{
            fontSize: '28px',
            marginBottom: '8px',
            color: '#333',
            textAlign: 'center'
          }}>Login</h2>
          <p style={{
            color: '#999',
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '14px'
          }}>Sign in to your account to continue</p>

          <form onSubmit={submit}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #f5e6d3',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fefdfb',
                  marginTop: '6px'
                }}
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #f5e6d3',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fefdfb',
                  marginTop: '6px'
                }}
              />
            </div>

            {error && (
              <div style={{
                marginTop: '16px',
                padding: '12px 14px',
                backgroundColor: '#ffebee',
                border: '1px solid #ef5350',
                borderRadius: '8px',
                color: '#d32f2f',
                fontSize: '14px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '28px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                background: loading
                  ? 'linear-gradient(135deg, #e6c200 0%, #d4a900 100%)'
                  : 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)',
                color: '#333',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '🔄 Signing In...' : '→ Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #f5e6d3',
            textAlign: 'center',
            fontSize: '13px',
            color: '#999'
          }}>
            <div>Secure Employee Management System</div>
            <div style={{ marginTop: '8px', fontSize: '13px' }}>
              Need an account? <Link to="/register" style={{ color: '#ff9800', fontWeight: 600 }}>Create one</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }
      `}</style>
    </div>
  )
}
