const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_this_super_secret')
    // attach user from prisma
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

module.exports = { authMiddleware, requireRole }
