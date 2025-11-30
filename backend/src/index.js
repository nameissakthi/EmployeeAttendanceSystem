require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const prisma = require('./prisma')

const authRoutes = require('./routes/auth')
const attendanceRoutes = require('./routes/attendance')

const PORT = process.env.PORT || 4000

const app = express()
// Configure CORS
// Accept FRONTEND_URL as a comma-separated list of allowed origins (e.g. "https://app.vercel.app,https://staging.vercel.app")
const FRONTEND_URL = process.env.FRONTEND_URL || ''
const allowedOrigins = FRONTEND_URL.split(',').map(s => s.trim()).filter(Boolean)

if (allowedOrigins.length === 0) {
  // default to allow all origins (useful for local/dev)
  app.use(cors())
  console.log('CORS: allowing all origins (no FRONTEND_URL configured)')
} else {
  const corsOptions = {
    origin: function (origin, callback) {
      // allow requests with no origin (e.g., curl, server-to-server)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true)
      } else {
        return callback(new Error('CORS policy: Origin not allowed'))
      }
    },
    // allow cookies/auth if FRONTEND_NEEDS_CREDENTIALS is set to 'true'
    credentials: process.env.FRONTEND_NEEDS_CREDENTIALS === 'true'
  }

  app.use(cors(corsOptions))
  console.log('CORS: allowed origins =', allowedOrigins)
}
app.use(bodyParser.json())

app.use('/api/auth', authRoutes)
app.use('/api/attendance', attendanceRoutes)

app.get('/', (req, res) => res.json({ ok: true, name: 'Employee Attendance API', version: '2.0' }))

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

async function start() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected successfully')
    
    app.listen(PORT, () => console.log(`✅ Server listening on http://localhost:${PORT}`))
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message)
    process.exit(1)
  }
}

// If this file is run directly (node src/index.js), start the server.
// When used as a module (e.g. in serverless), the `app` is exported and
// the server is not started automatically.
if (require.main === module) {
  start()
}

module.exports = { app, start }

