import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'

const initialForm = {
  name: '',
  department: '',
  employeeId: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'employee',
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/api/auth/register', {
        name: form.name,
        department: form.department,
        employeeId: form.role === 'employee' ? form.employeeId : undefined,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      setSuccess('Account created! You can now log in.')
      setForm(initialForm)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const disableEmployeeFields = form.role === 'manager'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ffffff 0%, #f7f5ff 100%)',
      padding: '20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'stretch',
        maxWidth: '1100px',
        width: '100%'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px', color: '#1f2937', textAlign: 'center' }}>Create Account</h2>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>Join the Employee Attendance System</p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, role: 'employee' }))}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '8px',
                border: form.role === 'employee' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: form.role === 'employee' ? 'rgba(59, 130, 246, 0.08)' : 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >👤 Employee</button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, role: 'manager', employeeId: '' }))}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '8px',
                border: form.role === 'manager' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: form.role === 'manager' ? 'rgba(59, 130, 246, 0.08)' : 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >⭐ Manager</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input name="department" value={form.department} onChange={handleChange} required placeholder="Engineering" />
            </div>

            <div className="form-group">
              <label>Employee ID {form.role === 'employee' && <span style={{ color: '#ef4444' }}>*</span>}</label>
              <input name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="EMP001" required={!disableEmployeeFields} disabled={disableEmployeeFields} />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="name@company.com" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} minLength={8} required />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} minLength={8} required />
            </div>

            {error && (
              <div className="alert alert-error">⚠️ {error}</div>
            )}
            {success && (
              <div className="alert alert-success">✅ {success}</div>
            )}

            <button type="submit" disabled={submitting} style={{
              width: '100%',
              marginTop: '20px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              cursor: submitting ? 'not-allowed' : 'pointer',
              background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
              transition: 'opacity 0.2s ease'
            }}>
              {submitting ? 'Creating Account…' : 'Create Account'}
            </button>

            <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
              Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '600' }}>Log in</Link>
            </p>
          </form>
        </div>

        <aside style={{
          borderRadius: '16px',
          padding: '40px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
          color: 'white',
          boxShadow: '0 10px 40px rgba(30, 58, 138, 0.35)'
        }}>
          <h3 style={{ fontSize: '30px', marginBottom: '20px' }}>Why join?</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <li>✅ Real-time attendance tracking</li>
            <li>✅ Built-in manager approvals</li>
            <li>✅ Automated monthly reports</li>
            <li>✅ Secure role-based access</li>
          </ul>
          <div style={{ marginTop: '40px', fontSize: '14px', opacity: 0.9 }}>
            Use the demo credentials on the login page to explore immediately, or create your own team account here.
          </div>
        </aside>
      </div>

      <style>{`
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          outline: none;
          transition: border 0.2s ease;
        }
        .form-group input:focus {
          border-color: #2563eb;
          background: white;
        }
        .alert {
          margin-top: 12px;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
        }
        .alert-error {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        .alert-success {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        @media (max-width: 960px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
