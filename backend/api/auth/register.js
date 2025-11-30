const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../../src/prisma')

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

    const { name, email, password, employeeId, department } = req.body || {}
    if (!name || !email || !password || !employeeId || !department) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { employeeId }] } })
    if (existing) return res.status(400).json({ error: 'Email or employeeId already exists' })

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = await prisma.user.create({ data: { name, email, passwordHash, role: 'employee', employeeId, department } })

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

    res.status(201).json({ user: safe, token, message: 'User registered' })
  } catch (err) {
    console.error('Register function error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
}
