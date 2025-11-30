const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../../src/prisma')

// Simple CORS helper
function setCors(req, res) {
  const FRONTEND_URL = process.env.FRONTEND_URL || ''
  const allowed = FRONTEND_URL.split(',').map(s => s.trim()).filter(Boolean)
  const origin = req.headers.origin
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (allowed.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    if (process.env.FRONTEND_NEEDS_CREDENTIALS === 'true') {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

module.exports = async (req, res) => {
  try {
    setCors(req, res)
    if (req.method === 'OPTIONS') return res.status(200).end()

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'change_this_super_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '1h' })

    const safe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
      createdAt: user.createdAt
    }

    res.json({ user: safe, token, message: 'Login successful' })
  } catch (err) {
    console.error('Login function error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
}
