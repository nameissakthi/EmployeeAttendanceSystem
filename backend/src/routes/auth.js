const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')
const { authMiddleware } = require('../middleware/auth')

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)

// Helper function to create safe user object
function getSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
    createdAt: user.createdAt
  }
}

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'employee', employeeId, department } = req.body

    // Validation
    if (!name || !email || !password || !employeeId || !department) {
      return res.status(400).json({ error: 'Missing required fields: name, email, password, employeeId, department' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { employeeId }]
      }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email or Employee ID already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        employeeId,
        department
      }
    })

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'change_this_super_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )

    res.status(201).json({
      user: getSafeUser(user),
      token,
      message: 'User registered successfully'
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'change_this_super_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )

    res.json({
      user: getSafeUser(user),
      token,
      message: 'Login successful'
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: getSafeUser(user) })
  } catch (err) {
    console.error('Get me error:', err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

module.exports = router
