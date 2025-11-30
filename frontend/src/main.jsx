import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Manager from './pages/Manager'
import { AuthProvider, useAuth } from './context/AuthContext'
import './styles.css'

function LoadingScreen() {
  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
      Initializing...
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { token, user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!token) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) {
    const fallback = user.role === 'manager' ? '/manager' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return children
}

function DefaultRedirect() {
  const { token, user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute roles={['manager']}><Manager /></ProtectedRoute>} />
          <Route path="/" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
